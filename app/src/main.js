// App shell: magazine grid, location badges, typography, export.

import {
  LAYOUT_PRESETS,
  getPanelAtPoint,
  getPanelFocusDefaults,
  getDefaultLocation,
  PANEL_GRADE_BY_INDEX,
} from './panels.js';
import { GRADE_PRESETS } from './grade.js';
import {
  buildMultiPanelComposition,
  renderHighResCover,
  exportCanvasToPNG,
  exportAllThreeSizes,
  EXPORT_PRESETS,
} from './export.js';
import { runShot } from './shots.js';

export const state = {
  ratio: 'landscape',
  layout: 'comic',
  gradePreset: 'vice',
  caption: 'NEON COAST',
  subtitle: 'Six nights in paradise',
  year: '2026',
  vol: '06',
  finePrint: '· A VICE STUDIO PICTURE · SHOT ON YOUR OWN CAMERA ·',
  font: 'Anton',
  gradeIntensity: 1.15,
  grainAmount: 0.14,
  vignetteStrength: 0.45,
  activePanel: 0,
  defaultImage: null,
  panels: {},
};

const canvas = document.getElementById('cover');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const titleInput = document.getElementById('caption');
const subtitleInput = document.getElementById('subtitle');
const yearInput = document.getElementById('year-input');
const volInput = document.getElementById('vol-input');
const locNameInput = document.getElementById('loc-name');
const locStampInput = document.getElementById('loc-stamp');
const fontSelect = document.getElementById('font-select');
const ratioSelect = document.getElementById('ratio-select');
const activePanelSelect = document.getElementById('active-panel');
const gradeSlider = document.getElementById('grade-slider');
const grainSlider = document.getElementById('grain-slider');
const vignetteSlider = document.getElementById('vignette-slider');
const zoomSlider = document.getElementById('zoom-slider');
const flipBtn = document.getElementById('flip-btn');
const statusEl = document.getElementById('status');
const layoutThumbs = document.getElementById('layout-thumbs');
const gradeThumbs = document.getElementById('grade-thumbs');

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export function resizeCanvasForRatio() {
  const preset = EXPORT_PRESETS[state.ratio] || EXPORT_PRESETS.landscape;
  canvas.width = preset.width;
  canvas.height = preset.height;
}

export function resizeCanvas(w, h) {
  canvas.width = w;
  canvas.height = h;
}

export function redraw() {
  buildMultiPanelComposition(ctx, state, canvas.width, canvas.height);
}

export function ensurePanel(id) {
  const focus = getPanelFocusDefaults(id);
  const loc = getDefaultLocation(id);
  if (!state.panels[id]) {
    state.panels[id] = {
      zoom: 1.15,
      panX: 0,
      panY: 0,
      flipH: false,
      image: null,
      focusX: focus.focusX,
      focusY: focus.focusY,
      location: loc.name,
      stamp: loc.stamp,
      grade: PANEL_GRADE_BY_INDEX[id] || 'vice',
    };
  }
  const p = state.panels[id];
  if (p.focusX == null) p.focusX = focus.focusX;
  if (p.focusY == null) p.focusY = focus.focusY;
  if (!p.location) p.location = loc.name;
  if (!p.stamp) p.stamp = loc.stamp;
  if (!p.grade) p.grade = PANEL_GRADE_BY_INDEX[id] || 'vice';
  return p;
}

function assignPanelImage(id, image, extra = {}) {
  const focus = getPanelFocusDefaults(id);
  const loc = getDefaultLocation(id);
  state.panels[id] = {
    image,
    zoom: extra.zoom ?? 1.15,
    panX: extra.panX ?? 0,
    panY: extra.panY ?? 0,
    flipH: !!extra.flipH,
    focusX: focus.focusX,
    focusY: focus.focusY,
    location: extra.location || loc.name,
    stamp: extra.stamp || loc.stamp,
    grade: PANEL_GRADE_BY_INDEX[id] || 'vice',
  };
  return state.panels[id];
}

function fillAllPanels(images) {
  for (let i = 0; i < 7; i++) {
    assignPanelImage(i, images[i % images.length], {
      zoom: 1.1 + (i % 3) * 0.08,
      flipH: i % 3 === 1,
    });
  }
}

export function syncUI() {
  if (titleInput) titleInput.value = state.caption;
  if (subtitleInput) subtitleInput.value = state.subtitle;
  if (yearInput) yearInput.value = state.year;
  if (volInput) volInput.value = state.vol;
  if (fontSelect) fontSelect.value = state.font;
  if (ratioSelect) ratioSelect.value = state.ratio;
  if (activePanelSelect) activePanelSelect.value = String(state.activePanel);
  if (gradeSlider) gradeSlider.value = String(state.gradeIntensity);
  if (grainSlider) grainSlider.value = String(state.grainAmount);
  if (vignetteSlider) vignetteSlider.value = String(state.vignetteStrength);
  const panel = ensurePanel(state.activePanel);
  if (zoomSlider) zoomSlider.value = String(panel.zoom || 1);
  if (locNameInput) locNameInput.value = panel.location || '';
  if (locStampInput) locStampInput.value = panel.stamp || '';

  layoutThumbs?.querySelectorAll('.thumb').forEach((el) => {
    el.classList.toggle('active', el.dataset.layout === state.layout);
  });
  gradeThumbs?.querySelectorAll('.thumb').forEach((el) => {
    el.classList.toggle('active', el.dataset.grade === state.gradePreset);
  });
}

function buildLayoutThumbs() {
  if (!layoutThumbs) return;
  layoutThumbs.innerHTML = '';
  for (const preset of LAYOUT_PRESETS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'thumb' + (preset.id === state.layout ? ' active' : '');
    btn.dataset.layout = preset.id;
    btn.setAttribute('role', 'option');
    btn.innerHTML = `<span class="thumb-label">${preset.label}</span><span class="thumb-hint">${preset.hint}</span>`;
    btn.addEventListener('click', () => {
      state.layout = preset.id;
      syncUI();
      redraw();
    });
    layoutThumbs.appendChild(btn);
  }
}

function buildGradeThumbs() {
  if (!gradeThumbs) return;
  gradeThumbs.innerHTML = '';
  for (const preset of GRADE_PRESETS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'thumb grade-' + preset.id + (preset.id === state.gradePreset ? ' active' : '');
    btn.dataset.grade = preset.id;
    btn.setAttribute('role', 'option');
    btn.innerHTML = `<span class="thumb-label">${preset.label}</span><span class="thumb-hint">${preset.hint}</span>`;
    btn.addEventListener('click', () => {
      state.gradePreset = preset.id;
      // Override active panel grade when user picks a preset
      ensurePanel(state.activePanel).grade = preset.id;
      syncUI();
      redraw();
    });
    gradeThumbs.appendChild(btn);
  }
}

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let initialPanX = 0;
let initialPanY = 0;
let lastClickTime = 0;

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

function selectPanelAt(pos) {
  const panelId = getPanelAtPoint(
    pos.x,
    pos.y,
    state.layout,
    canvas.width,
    canvas.height,
    canvas.height,
    state.ratio
  );
  state.activePanel = panelId;
  syncUI();
  return ensurePanel(panelId);
}

canvas.addEventListener('mousedown', (e) => {
  const pos = getCanvasCoordinates(e);
  const panel = selectPanelAt(pos);
  const now = Date.now();
  // Double-click → inline edit location via prompt
  if (now - lastClickTime < 350) {
    const name = window.prompt('Location name', panel.location || 'OCEAN DRIVE');
    if (name != null && name.trim()) {
      panel.location = name.trim().toUpperCase();
      const stamp = window.prompt('Timestamp / subtitle', panel.stamp || '');
      if (stamp != null) panel.stamp = stamp.trim();
      syncUI();
      redraw();
    }
    lastClickTime = 0;
    return;
  }
  lastClickTime = now;

  isDragging = true;
  dragStartX = pos.x;
  dragStartY = pos.y;
  initialPanX = panel.panX || 0;
  initialPanY = panel.panY || 0;
  if (statusEl) statusEl.textContent = `Panel ${panel === state.panels[0] ? 'Hero' : state.activePanel + 1} — edit location in sidebar or double-click`;
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const pos = getCanvasCoordinates(e);
  const panel = ensurePanel(state.activePanel);
  panel.panX = Math.max(-2, Math.min(2, initialPanX + ((pos.x - dragStartX) / canvas.width) * 2));
  panel.panY = Math.max(-2, Math.min(2, initialPanY + ((pos.y - dragStartY) / canvas.height) * 2));
  redraw();
});

window.addEventListener('mouseup', () => { isDragging = false; });

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const pos = getCanvasCoordinates(e);
  const panel = selectPanelAt(pos);
  panel.zoom = Math.max(0.5, Math.min(3.5, (panel.zoom || 1) + (e.deltaY < 0 ? 0.08 : -0.08)));
  syncUI();
  redraw();
}, { passive: false });

titleInput?.addEventListener('input', (e) => { state.caption = e.target.value; redraw(); });
subtitleInput?.addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
yearInput?.addEventListener('input', (e) => { state.year = e.target.value; redraw(); });
volInput?.addEventListener('input', (e) => { state.vol = e.target.value; redraw(); });
locNameInput?.addEventListener('input', (e) => {
  ensurePanel(state.activePanel).location = e.target.value.toUpperCase();
  redraw();
});
locStampInput?.addEventListener('input', (e) => {
  ensurePanel(state.activePanel).stamp = e.target.value;
  redraw();
});
fontSelect?.addEventListener('change', (e) => { state.font = e.target.value; redraw(); });
ratioSelect?.addEventListener('change', (e) => {
  state.ratio = e.target.value;
  resizeCanvasForRatio();
  redraw();
});
activePanelSelect?.addEventListener('change', (e) => {
  state.activePanel = Number(e.target.value);
  syncUI();
});
zoomSlider?.addEventListener('input', (e) => {
  ensurePanel(state.activePanel).zoom = Number(e.target.value);
  redraw();
});
flipBtn?.addEventListener('click', () => {
  const p = ensurePanel(state.activePanel);
  p.flipH = !p.flipH;
  redraw();
});
gradeSlider?.addEventListener('input', (e) => { state.gradeIntensity = Number(e.target.value); redraw(); });
grainSlider?.addEventListener('input', (e) => { state.grainAmount = Number(e.target.value); redraw(); });
vignetteSlider?.addEventListener('input', (e) => { state.vignetteStrength = Number(e.target.value); redraw(); });

document.getElementById('photo')?.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const img = await loadImage(URL.createObjectURL(file));
  state.defaultImage = img;
  assignPanelImage(state.activePanel, img, { zoom: 1.2 });
  redraw();
  if (statusEl) statusEl.textContent = `Loaded ${file.name} → panel ${state.activePanel + 1}`;
});

document.querySelectorAll('[data-sample]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const sample = btn.getAttribute('data-sample');
    if (sample === 'mix') {
      const [pier, blvd] = await Promise.all([
        loadImage('samples/pier.jpg'),
        loadImage('samples/boulevard.jpg'),
      ]);
      state.defaultImage = pier;
      fillAllPanels([pier, blvd]);
    } else {
      const img = await loadImage(`samples/${sample}.jpg`);
      state.defaultImage = img;
      fillAllPanels([img]);
    }
    redraw();
    if (statusEl) statusEl.textContent = `Sample: ${sample}`;
  });
});

document.querySelectorAll('[data-export]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const key = btn.getAttribute('data-export');
    const preset = EXPORT_PRESETS[key];
    if (statusEl) statusEl.textContent = `Exporting ${preset.width}×${preset.height}…`;
    const prev = state.ratio;
    state.ratio = key;
    const out = renderHighResCover(state, preset.width, preset.height);
    state.ratio = prev;
    await exportCanvasToPNG(out, `gta6-cover-${preset.width}x${preset.height}.png`);
    if (statusEl) statusEl.textContent = `Saved ${preset.width}×${preset.height} PNG`;
  });
});

document.getElementById('export-all')?.addEventListener('click', async () => {
  if (statusEl) statusEl.textContent = 'Exporting all 3 sizes…';
  await exportAllThreeSizes(state);
  if (statusEl) statusEl.textContent = 'Downloaded 1920×1080, 1080×1350, 1080×1080';
});

export async function ensureFontsLoaded() {
  if (document.fonts) {
    try {
      await Promise.all([
        document.fonts.load('900 48px Anton'),
        document.fonts.load('700 48px "Bebas Neue"'),
        document.fonts.load('400 48px Pacifico'),
      ]);
      await document.fonts.ready;
    } catch (err) {
      console.warn('Font load error:', err);
    }
  }
}

const app = { state, loadImage, resizeCanvasForRatio, resizeCanvas, redraw, syncUI, fillAllPanels, assignPanelImage, ensurePanel, ensureFontsLoaded };

async function init() {
  buildLayoutThumbs();
  buildGradeThumbs();

  await ensureFontsLoaded();

  const [pier, blvd] = await Promise.all([
    loadImage('samples/pier.jpg'),
    loadImage('samples/boulevard.jpg'),
  ]);
  state.defaultImage = pier;
  fillAllPanels([pier, blvd]);

  resizeCanvasForRatio();
  syncUI();

  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot) await runShot(shot, params, app);
  else redraw();
}

init().catch((err) => console.error('App init error:', err));
