// Asymmetric magazine-grid layout (GTA high-end poster style).

import { applyColorGradeToPanelRegion, GRADE_PRESETS, gradeImageData } from './grade.js';

export const LAYOUT_PRESETS = [
  { id: 'comic', label: 'Comic', hint: 'Magazine grid' },
  { id: 'hero', label: 'Hero', hint: 'Tall left + stack' },
  { id: 'triptych', label: 'Triptych', hint: '3 columns' },
  { id: 'quad', label: 'Quad', hint: '2 × 2' },
  { id: 'grid9', label: '9-Panel', hint: 'Comic grid' },
  { id: 'single', label: 'Single', hint: 'Full bleed' },
];

export const DEFAULT_LOCATIONS = [
  { name: 'OCEAN DRIVE', stamp: '6:42 PM – LOOKING FOR TROUBLE' },
  { name: 'MARINA DEL SOL', stamp: '7:15 PM – GOLDEN HOUR' },
  { name: 'TOWER 2', stamp: '9:03 PM – HIGH RISE' },
  { name: 'PALM BOULEVARD', stamp: '5:58 PM – CRUISE' },
  { name: 'INTERSTATE 6', stamp: '11:20 PM – NO LIMITS' },
  { name: 'PIER 26', stamp: '8:40 PM – BOARDWALK' },
  { name: 'SUNSET HEIGHTS', stamp: '6:11 PM – SKYLINE' },
];

/** Per-panel grade assignment by index. */
export const PANEL_GRADE_BY_INDEX = [
  'vice',    // 0 hero
  'neon',    // 1 top-left of right
  'golden',  // 2 top-right of right
  'vice',    // 3
  'neon',    // 4
  'golden',  // 5
  'duotone', // 6
];

export const PANEL_FOCUS_DEFAULTS = {
  0: { focusX: 0.38, focusY: 0.35 },
  1: { focusX: 0.50, focusY: 0.30 },
  2: { focusX: 0.38, focusY: 0.35 },
  3: { focusX: 0.50, focusY: 0.30 },
  4: { focusX: 0.38, focusY: 0.35 },
  5: { focusX: 0.50, focusY: 0.30 },
  6: { focusX: 0.38, focusY: 0.35 },
};

export function getPanelFocusDefaults(panelId) {
  return PANEL_FOCUS_DEFAULTS[panelId] || { focusX: 0.5, focusY: 0.35 };
}

export function getDefaultLocation(panelId) {
  return DEFAULT_LOCATIONS[panelId % DEFAULT_LOCATIONS.length];
}

/**
 * Build magazine-grid geometry adapted to aspect ratio.
 * @returns {{ photoPanels: Array, typePanel: Object|null, gap: number }}
 */
export function createMagazineGrid(w, h, ratio = 'landscape') {
  const leftW = Math.round(w * 0.38);

  // Vertical splits on the right column (adapt by format)
  let topH;
  let midH;
  if (ratio === 'square') {
    // Compress the 4-panel row on square
    topH = Math.round(h * 0.50);
    midH = Math.round(h * 0.22);
  } else if (ratio === 'portrait') {
    // Height split adapted to portrait 4:5
    topH = Math.round(h * 0.52);
    midH = Math.round(h * 0.26);
  } else {
    // Standard 16:9 magazine grid
    topH = Math.round(h * 0.50);
    midH = Math.round(h * 0.28);
  }
  const typeH = h - topH - midH;

  const rightX = leftW;
  const rightW = w - rightX;
  const midY = topH;
  const typeY = topH + midH;

  // Hero — full canvas height
  const hero = {
    id: 0,
    kind: 'photo',
    x: 0,
    y: 0,
    w: leftW,
    h,
    points: rectPoints(0, 0, leftW, h),
  };

  // Top-right: 2 equal panels side by side (~31% width each)
  const topPanelW = Math.floor(rightW / 2);
  const top1 = {
    id: 1,
    kind: 'photo',
    x: rightX,
    y: 0,
    w: topPanelW,
    h: topH,
    points: rectPoints(rightX, 0, topPanelW, topH),
  };
  const top2X = rightX + topPanelW;
  const top2W = w - top2X;
  const top2 = {
    id: 2,
    kind: 'photo',
    x: top2X,
    y: 0,
    w: top2W,
    h: topH,
    points: rectPoints(top2X, 0, top2W, topH),
  };

  // Mid-right: 4 equal small panels in a row (~15.5% each)
  const smallW = Math.floor(rightW / 4);
  const smalls = [];
  for (let i = 0; i < 4; i++) {
    const sx = rightX + i * smallW;
    const sw = i === 3 ? w - sx : smallW;
    smalls.push({
      id: 3 + i,
      kind: 'photo',
      x: sx,
      y: midY,
      w: sw,
      h: midH,
      points: rectPoints(sx, midY, sw, midH),
    });
  }

  const typePanel = {
    id: 'type',
    kind: 'type',
    x: rightX,
    y: typeY,
    w: rightW,
    h: typeH,
    points: rectPoints(rightX, typeY, rightW, typeH),
  };

  return {
    photoPanels: [hero, top1, top2, ...smalls],
    typePanel,
    gap: 0,
    meta: { leftW, topH, midH, typeH, rightX, rightW },
  };
}

function rectPoints(x, y, w, h) {
  return [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
}

/**
 * Legacy-compatible geometry for other layout presets.
 */
export function createPanelGeometry(layoutType, w, h, contentH = h, ratio = 'landscape') {
  const ch = contentH;
  if (layoutType === 'comic' || layoutType === 'magazine') {
    const grid = createMagazineGrid(w, h, ratio);
    return grid.photoPanels;
  }

  switch (layoutType) {
    case 'hero': {
      const p0 = [[0, 0], [w * 0.62, 0], [w * 0.48, ch], [0, ch]];
      const p1 = [[w * 0.62, 0], [w, 0], [w, ch * 0.48], [w * 0.555, ch * 0.48]];
      const p2 = [[w * 0.555, ch * 0.48], [w, ch * 0.48], [w, ch], [w * 0.48, ch]];
      return [
        { id: 0, points: p0, kind: 'photo' },
        { id: 1, points: p1, kind: 'photo' },
        { id: 2, points: p2, kind: 'photo' },
      ];
    }
    case 'triptych': {
      return [
        { id: 0, kind: 'photo', points: [[0, 0], [w * 0.34, 0], [w * 0.30, ch], [0, ch]] },
        { id: 1, kind: 'photo', points: [[w * 0.34, 0], [w * 0.68, 0], [w * 0.64, ch], [w * 0.30, ch]] },
        { id: 2, kind: 'photo', points: [[w * 0.68, 0], [w, 0], [w, ch], [w * 0.64, ch]] },
      ];
    }
    case 'quad': {
      const mx = w * 0.5;
      const my = ch * 0.5;
      return [
        { id: 0, kind: 'photo', points: [[0, 0], [mx, 0], [mx, my], [0, my]] },
        { id: 1, kind: 'photo', points: [[mx, 0], [w, 0], [w, my], [mx, my]] },
        { id: 2, kind: 'photo', points: [[0, my], [mx, my], [mx, ch], [0, ch]] },
        { id: 3, kind: 'photo', points: [[mx, my], [w, my], [w, ch], [mx, ch]] },
      ];
    }
    case 'grid9': {
      const panels = [];
      let id = 0;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const x0 = (c / 3) * w;
          const x1 = ((c + 1) / 3) * w;
          const y0 = (r / 3) * ch;
          const y1 = ((r + 1) / 3) * ch;
          panels.push({ id: id++, kind: 'photo', points: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]] });
        }
      }
      return panels;
    }
    case 'single':
    default:
      return [{ id: 0, kind: 'photo', points: [[0, 0], [w, 0], [w, ch], [0, ch]] }];
  }
}

/**
 * Draw a photo into a rectangular panel, grade it, then location badge.
 */
export function drawPanelImage(ctx, panel, image, transform, gradePreset, intensity) {
  const { x, y, w, h } = normalizePanel(panel);
  if (w <= 0 || h <= 0) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.fillStyle = '#14081f';
  ctx.fillRect(x, y, w, h);

  if (image && image.width > 0) {
    const scale = Math.max(w / image.width, h / image.height) * (transform.zoom || 1.15);
    const drawW = image.width * scale;
    const drawH = image.height * scale;
    const panX = (transform.panX || 0) * w * 0.5;
    const panY = (transform.panY || 0) * h * 0.5;
    const focusX = transform.focusX ?? 0.5;
    const focusY = transform.focusY ?? 0.35;

    const surplusW = drawW - w;
    const surplusH = drawH - h;
    const imgX = x - Math.max(0, surplusW * focusX) + panX;
    const imgY = y - Math.max(0, surplusH * focusY) + panY;

    ctx.save();
    if (transform.flipH) {
      ctx.translate(imgX + drawW / 2, imgY + drawH / 2);
      ctx.scale(-1, 1);
      ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      ctx.drawImage(image, imgX, imgY, drawW, drawH);
    }
    ctx.restore();
  }
  ctx.restore();

  // Per-panel color grade: getImageData → pixel loop → putImageData on this rect
  const preset = gradePreset || PANEL_GRADE_BY_INDEX[panel.id] || 'vice';
  gradeRectRegion(ctx, x, y, w, h, preset, intensity ?? 1.15);

  // Vice grade: warm palette + magenta vignette per panel
  if (preset === 'vice') {
    drawPanelMagentaVignette(ctx, x, y, w, h);
  }
}

function drawPanelMagentaVignette(ctx, x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const radius = Math.max(w, h) * 0.75;
  const cx = x + w * 0.5;
  const cy = y + h * 0.5;
  const g = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
  g.addColorStop(0, 'rgba(180, 40, 80, 0)');
  g.addColorStop(0.55, 'rgba(180, 40, 80, 0.08)');
  g.addColorStop(1, 'rgba(180, 40, 80, 0.25)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function gradeRectRegion(ctx, x, y, w, h, preset, intensity) {
  const ix = Math.max(0, Math.floor(x));
  const iy = Math.max(0, Math.floor(y));
  const iw = Math.min(ctx.canvas.width - ix, Math.max(1, Math.ceil(w)));
  const ih = Math.min(ctx.canvas.height - iy, Math.max(1, Math.ceil(h)));
  if (iw <= 0 || ih <= 0) return;
  try {
    const imageData = ctx.getImageData(ix, iy, iw, ih);
    if (typeof gradeImageData === 'function') {
      gradeImageData(imageData.data, preset, intensity, iw);
    } else {
      applyColorGradeToPanelRegion(ctx, rectPoints(ix, iy, iw, ih), preset, intensity);
      return;
    }
    ctx.putImageData(imageData, ix, iy);
  } catch (err) {
    console.warn('Panel grade failed', err);
  }
}

function normalizePanel(panel) {
  if (panel.x != null) {
    return {
      x: panel.x,
      y: panel.y,
      w: panel.w,
      h: panel.h,
      points: panel.points || rectPoints(panel.x, panel.y, panel.w, panel.h),
    };
  }
  const pts = panel.points;
  let minX = pts[0][0], maxX = pts[0][0], minY = pts[0][1], maxY = pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    minX = Math.min(minX, pts[i][0]);
    maxX = Math.max(maxX, pts[i][0]);
    minY = Math.min(minY, pts[i][1]);
    maxY = Math.max(maxY, pts[i][1]);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY, points: pts };
}

/**
 * Bottom-left location badge overlay on a photo panel.
 */
export function drawLocationBadge(ctx, panel, location) {
  const { x, y, w, h } = normalizePanel(panel);
  const name = (location?.name || 'OCEAN DRIVE').toUpperCase();
  const stamp = location?.stamp || '6:42 PM – LOOKING FOR TROUBLE';
  const pad = 6;
  const bx = x + 10;
  const by = y + h - 10;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  // Responsive font sizes for narrow panels
  let nameSize = 14;
  let stampSize = 10;
  if (w < 220) {
    nameSize = Math.max(11, Math.round(w * 0.065));
    stampSize = Math.max(8, Math.round(w * 0.048));
  }

  ctx.font = `700 ${nameSize}px "Bebas Neue", "Anton", Impact, sans-serif`;
  const nameW = ctx.measureText(name).width;
  ctx.font = `500 ${stampSize}px "Bebas Neue", Arial, sans-serif`;
  const stampW = ctx.measureText(stamp).width;

  const maxBadgeW = Math.max(40, w - 20);
  const boxW = Math.min(maxBadgeW, Math.max(nameW, stampW) + pad * 2);
  const boxH = nameSize + stampSize + pad * 2 + 2;
  const boxY = by - boxH;

  roundRect(ctx, bx, boxY, boxW, boxH, 4);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${nameSize}px "Bebas Neue", "Anton", Impact, sans-serif`;
  ctx.fillText(name, bx + pad, boxY + pad, boxW - pad * 2);

  ctx.font = `500 ${stampSize}px "Bebas Neue", Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
  ctx.fillText(stamp, bx + pad, boxY + pad + nameSize + 2, boxW - pad * 2);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/**
 * Stroke all panels with 3px solid white borders (bakes into PNG).
 */
export function strokeWhiteGrid(ctx, panels, typePanel) {
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'miter';
  ctx.lineCap = 'square';

  const all = typePanel ? [...panels, typePanel] : panels;
  for (const p of all) {
    const { x, y, w, h } = normalizePanel(p);
    ctx.strokeRect(x, y, w, h);
  }
  // Canvas outer frame
  ctx.strokeRect(1.5, 1.5, ctx.canvas.width - 3, ctx.canvas.height - 3);
  ctx.restore();
}

/** Alias — 3px white borders. */
export function strokePanelBorders(ctx, panels) {
  strokeWhiteGrid(ctx, panels, null);
}

/**
 * Render the full magazine (or fallback) photo layout with per-panel grades + badges.
 */
export function renderMagazineLayout(ctx, state, width, height) {
  const layout = state.layout || 'comic';
  const ratio = state.ratio || 'landscape';
  const intensity = state.gradeIntensity ?? 1.15;

  let photoPanels;
  let typePanel = null;

  if (layout === 'comic' || layout === 'magazine') {
    const grid = createMagazineGrid(width, height, ratio);
    photoPanels = grid.photoPanels;
    typePanel = grid.typePanel;
  } else {
    photoPanels = createPanelGeometry(layout, width, height, height, ratio).map((p) => {
      const n = normalizePanel(p);
      return { ...p, ...n, kind: 'photo' };
    });
  }

  for (const panel of photoPanels) {
    const cfg = (state.panels && state.panels[panel.id]) || {};
    const img = cfg.image || state.defaultImage;
    const focus = getPanelFocusDefaults(panel.id);
    const grade =
      cfg.grade ||
      PANEL_GRADE_BY_INDEX[panel.id] ||
      state.gradePreset ||
      'vice';

    drawPanelImage(
      ctx,
      panel,
      img,
      {
        zoom: cfg.zoom ?? 1.15,
        panX: cfg.panX ?? 0,
        panY: cfg.panY ?? 0,
        flipH: !!cfg.flipH,
        focusX: cfg.focusX ?? focus.focusX,
        focusY: cfg.focusY ?? focus.focusY,
      },
      grade,
      intensity
    );

    const loc = {
      name: cfg.location || getDefaultLocation(panel.id).name,
      stamp: cfg.stamp || getDefaultLocation(panel.id).stamp,
    };
    drawLocationBadge(ctx, panel, loc);
  }

  return { photoPanels, typePanel };
}

/** Back-compat alias. */
export function renderDiagonalPanelLayout(ctx, state, width, height) {
  return renderMagazineLayout(ctx, state, width, height).photoPanels;
}

export function renderMultiPanelLayout(ctx, state, width, height) {
  return renderDiagonalPanelLayout(ctx, state, width, height);
}

export function getPanelAtPoint(x, y, layoutType, w, h, _contentHeight, ratio = 'landscape') {
  let panels;
  if (layoutType === 'comic' || layoutType === 'magazine') {
    panels = createMagazineGrid(w, h, ratio).photoPanels;
  } else {
    panels = createPanelGeometry(layoutType, w, h, h, ratio);
  }
  for (const panel of panels) {
    const n = normalizePanel(panel);
    if (x >= n.x && x <= n.x + n.w && y >= n.y && y <= n.y + n.h) return panel.id;
  }
  return 0;
}

export { GRADE_PRESETS };
