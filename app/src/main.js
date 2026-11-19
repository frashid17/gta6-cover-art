// Main application logic, user interactions, interactive canvas panning, and export controls.

import { renderMultiPanelLayout, getPanelAtPoint } from './panels.js';
import { applyFullColorGrading } from './grade.js';
import { buildCaptionLayer } from './caption.js';
import { renderHighResCover, exportToPNG, EXPORT_PRESETS } from './export.js';
import { runShot } from './shots.js';

// Application state
export const state = {
  ratio: 'landscape', // 'landscape' | 'portrait' | 'square'
  layout: 'diagonal3', // 'diagonal3' | 'diagonal2' | 'triptych' | 'duohorizon'
  caption: 'VICE CITY',
  subtitle: 'LEONIDA DREAMS • 2026',
  font: 'Anton',
  fillStyle: 'sunset',
  captionPosition: 'bottom',
  gradeIntensity: 1.0,
  grainAmount: 0.16,
  vignetteStrength: 0.55,
  activePanel: 0,
  defaultImage: null,
  panels: {
    0: { zoom: 1.0, panX: 0, panY: 0, flipH: false, image: null },
    1: { zoom: 1.0, panX: 0, panY: 0, flipH: false, image: null },
    2: { zoom: 1.0, panX: 0, panY: 0, flipH: false, image: null },
  },
};

// DOM references
const canvas = document.getElementById('cover');
const ctx = canvas.getContext('2d');
const titleInput = document.getElementById('caption');
const subtitleInput = document.getElementById('subtitle');
const fontSelect = document.getElementById('font-select');
const fillSelect = document.getElementById('fill-select');
const layoutSelect = document.getElementById('layout-select');
const ratioSelect = document.getElementById('ratio-select');
const activePanelSelect = document.getElementById('active-panel');
const gradeSlider = document.getElementById('grade-slider');
const grainSlider = document.getElementById('grain-slider');
const vignetteSlider = document.getElementById('vignette-slider');
const zoomSlider = document.getElementById('zoom-slider');
const flipBtn = document.getElementById('flip-btn');
const statusEl = document.getElementById('status');

/**
 * Loads an image from a URL or object URL.
 */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Resizes the preview canvas to match the active aspect ratio preset.
 */
export function resizeCanvasForRatio() {
  const preset = EXPORT_PRESETS[state.ratio] || EXPORT_PRESETS.landscape;
  canvas.width = preset.width;
  canvas.height = preset.height;
}

/**
 * Sets explicit dimensions on canvas (used in headless screenshot capture).
 */
export function resizeCanvas(w, h) {
  canvas.width = w;
  canvas.height = h;
}

/**
 * Redraws the complete canvas scene.
 */
export function redraw() {
  const w = canvas.width;
  const h = canvas.height;

  // Background
  ctx.fillStyle = '#0f051c';
  ctx.fillRect(0, 0, w, h);

  // Multi-panel layout
  renderMultiPanelLayout(ctx, state, w, h);

  // Vice City sunset grading, glow, grain, and vignette
  applyFullColorGrading(ctx, w, h, {
    gradeIntensity: state.gradeIntensity,
    grainAmount: state.grainAmount,
    vignetteStrength: state.vignetteStrength,
  });

  // Display caption layer
  buildCaptionLayer(ctx, {
    title: state.caption,
    subtitle: state.subtitle,
    font: state.font,
    fillStyle: state.fillStyle,
    position: state.captionPosition,
  }, w, h);
}

/**
 * Synchronizes DOM form controls with the internal state object.
 */
export function syncUI() {
  if (titleInput) titleInput.value = state.caption;
  if (subtitleInput) subtitleInput.value = state.subtitle;
  if (fontSelect) fontSelect.value = state.font;
  if (fillSelect) fillSelect.value = state.fillStyle;
  if (layoutSelect) layoutSelect.value = state.layout;
  if (ratioSelect) ratioSelect.value = state.ratio;
  if (activePanelSelect) activePanelSelect.value = String(state.activePanel);
  if (gradeSlider) gradeSlider.value = String(state.gradeIntensity);
  if (grainSlider) grainSlider.value = String(state.grainAmount);
  if (vignetteSlider) vignetteSlider.value = String(state.vignetteStrength);

  const panelData = state.panels[state.activePanel] || {};
  if (zoomSlider) zoomSlider.value = String(panelData.zoom || 1.0);
}

// Interactive Canvas Pan & Zoom Handling
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let initialPanX = 0;
let initialPanY = 0;

function getCanvasCoordinates(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

canvas.addEventListener('mousedown', (e) => {
  const pos = getCanvasCoordinates(e);
  const panelId = getPanelAtPoint(pos.x, pos.y, state.layout, canvas.width, canvas.height);
  state.activePanel = panelId;
  syncUI();

  isDragging = true;
  dragStartX = pos.x;
  dragStartY = pos.y;
  if (!state.panels[panelId]) {
    state.panels[panelId] = { zoom: 1.0, panX: 0, panY: 0, flipH: false };
  }
  initialPanX = state.panels[panelId].panX || 0;
  initialPanY = state.panels[panelId].panY || 0;
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const pos = getCanvasCoordinates(e);
  const dx = (pos.x - dragStartX) / canvas.width;
  const dy = (pos.y - dragStartY) / canvas.height;

  const panel = state.panels[state.activePanel];
  panel.panX = Math.max(-2, Math.min(2, initialPanX + dx * 2));
  panel.panY = Math.max(-2, Math.min(2, initialPanY + dy * 2));
  redraw();
});

window.addEventListener('mouseup', () => {
  isDragging = false;
});

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const pos = getCanvasCoordinates(e);
  const panelId = getPanelAtPoint(pos.x, pos.y, state.layout, canvas.width, canvas.height);
  state.activePanel = panelId;
  syncUI();

  if (!state.panels[panelId]) {
    state.panels[panelId] = { zoom: 1.0, panX: 0, panY: 0, flipH: false };
  }
  const panel = state.panels[panelId];
  const delta = e.deltaY < 0 ? 0.08 : -0.08;
  panel.zoom = Math.max(0.5, Math.min(3.5, (panel.zoom || 1.0) + delta));
  if (zoomSlider) zoomSlider.value = String(panel.zoom);
  redraw();
}, { passive: false });

// Form event listeners
if (titleInput) {
  titleInput.addEventListener('input', (e) => {
    state.caption = e.target.value;
    redraw();
  });
}
if (subtitleInput) {
  subtitleInput.addEventListener('input', (e) => {
    state.subtitle = e.target.value;
    redraw();
  });
}
if (fontSelect) {
  fontSelect.addEventListener('change', (e) => {
    state.font = e.target.value;
    redraw();
  });
}
if (fillSelect) {
  fillSelect.addEventListener('change', (e) => {
    state.fillStyle = e.target.value;
    redraw();
  });
}
if (layoutSelect) {
  layoutSelect.addEventListener('change', (e) => {
    state.layout = e.target.value;
    redraw();
  });
}
if (ratioSelect) {
  ratioSelect.addEventListener('change', (e) => {
    state.ratio = e.target.value;
    resizeCanvasForRatio();
    redraw();
  });
}
if (activePanelSelect) {
  activePanelSelect.addEventListener('change', (e) => {
    state.activePanel = Number(e.target.value);
    syncUI();
  });
}
if (zoomSlider) {
  zoomSlider.addEventListener('input', (e) => {
    if (!state.panels[state.activePanel]) {
      state.panels[state.activePanel] = { zoom: 1.0, panX: 0, panY: 0, flipH: false };
    }
    state.panels[state.activePanel].zoom = Number(e.target.value);
    redraw();
  });
}
if (flipBtn) {
  flipBtn.addEventListener('click', () => {
    if (!state.panels[state.activePanel]) {
      state.panels[state.activePanel] = { zoom: 1.0, panX: 0, panY: 0, flipH: false };
    }
    state.panels[state.activePanel].flipH = !state.panels[state.activePanel].flipH;
    redraw();
  });
}
if (gradeSlider) {
  gradeSlider.addEventListener('input', (e) => {
    state.gradeIntensity = Number(e.target.value);
    redraw();
  });
}
if (grainSlider) {
  grainSlider.addEventListener('input', (e) => {
    state.grainAmount = Number(e.target.value);
    redraw();
  });
}
if (vignetteSlider) {
  vignetteSlider.addEventListener('input', (e) => {
    state.vignetteStrength = Number(e.target.value);
    redraw();
  });
}

// File uploads
const mainPhotoInput = document.getElementById('photo');
if (mainPhotoInput) {
  mainPhotoInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = await loadImage(URL.createObjectURL(file));
    state.defaultImage = img;
    state.panels[state.activePanel] = {
      ...(state.panels[state.activePanel] || {}),
      image: img,
    };
    redraw();
    if (statusEl) statusEl.textContent = `Loaded photo: ${file.name}`;
  });
}

// Sample buttons
document.querySelectorAll('[data-sample]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const sample = btn.getAttribute('data-sample');
    if (sample === 'mix') {
      const [pier, blvd] = await Promise.all([
        loadImage('samples/pier.jpg'),
        loadImage('samples/boulevard.jpg'),
      ]);
      state.defaultImage = pier;
      state.panels[0] = { image: pier, zoom: 1.1, panX: 0, panY: 0, flipH: false };
      state.panels[1] = { image: blvd, zoom: 1.25, panX: 0.1, panY: 0.05, flipH: true };
      state.panels[2] = { image: pier, zoom: 1.35, panX: -0.1, panY: 0.1, flipH: false };
    } else {
      const img = await loadImage(`samples/${sample}.jpg`);
      state.defaultImage = img;
      state.panels[state.activePanel] = {
        ...(state.panels[state.activePanel] || {}),
        image: img,
      };
    }
    redraw();
    if (statusEl) statusEl.textContent = `Loaded sample: ${sample}`;
  });
});

// Export triggers for exact 1080x1080, 1080x1350, 1920x1080
document.querySelectorAll('[data-export]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const key = btn.getAttribute('data-export');
    const preset = EXPORT_PRESETS[key] || EXPORT_PRESETS.landscape;
    if (statusEl) statusEl.textContent = `Exporting ${preset.width}×${preset.height} PNG...`;

    const exportCanvas = renderHighResCover(state, preset.width, preset.height);
    const filename = `gta6-cover-${preset.width}x${preset.height}.png`;
    await exportToPNG(exportCanvas, filename);
    if (statusEl) statusEl.textContent = `Saved ${filename}`;
  });
});

// Initial boot
const app = {
  state,
  loadImage,
  resizeCanvasForRatio,
  resizeCanvas,
  redraw,
  syncUI,
};

async function init() {
  // Load default starter sample
  const pier = await loadImage('samples/pier.jpg');
  const blvd = await loadImage('samples/boulevard.jpg');
  state.defaultImage = pier;
  state.panels[0] = { image: pier, zoom: 1.1, panX: 0, panY: 0, flipH: false };
  state.panels[1] = { image: blvd, zoom: 1.2, panX: 0.08, panY: 0.05, flipH: true };
  state.panels[2] = { image: pier, zoom: 1.35, panX: -0.1, panY: 0.1, flipH: false };

  resizeCanvasForRatio();
  syncUI();

  // Handle screenshot queries if present
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot) {
    await runShot(shot, params, app);
  } else {
    redraw();
  }
}

// Start application
init().catch((err) => console.error('App init error:', err));
