// Canvas color-grade presets via getImageData pixel pipelines + atmosphere.

export const GRADE_PRESETS = [
  { id: 'vice', label: 'Vice Sunset', hint: 'Magenta / coral / cyan' },
  { id: 'neon', label: 'Neon Night', hint: 'Crushed blacks' },
  { id: 'golden', label: 'Golden Hour', hint: 'Amber warmth' },
  { id: 'duotone', label: 'Pink / Teal', hint: 'Split-tone' },
  { id: 'comic', label: 'Comic Ink', hint: 'Halftone punch' },
];

function clamp(v) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

/** Grade assigned by photo-panel index (hero → smalls). */
export const PANEL_INDEX_GRADES = [
  'vice', 'neon', 'golden', 'vice', 'neon', 'golden', 'duotone',
];

/**
 * Applies a named color grade with getImageData pixel manipulation (full canvas).
 * Also accepts a numeric panelIndex: applyColorGrade(ctx, panelIndex).
 */
export function applyColorGrade(ctx, presetOrIndex, intensity = 1.0) {
  if (intensity <= 0) return;
  const preset =
    typeof presetOrIndex === 'number'
      ? PANEL_INDEX_GRADES[presetOrIndex] || 'vice'
      : presetOrIndex || 'vice';
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  const t = Math.max(0, Math.min(1.5, intensity));
  gradePixels(d, preset, t, w);
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Grade a panel bounding-box region, touching only pixels inside the polygon
 * so adjacent panels are not overwritten.
 */
export function applyColorGradeToPanelRegion(ctx, polygon, preset, intensity = 1.0) {
  if (!polygon || polygon.length < 3 || intensity <= 0) return;

  let minX = polygon[0][0], maxX = polygon[0][0];
  let minY = polygon[0][1], maxY = polygon[0][1];
  for (let i = 1; i < polygon.length; i++) {
    minX = Math.min(minX, polygon[i][0]);
    maxX = Math.max(maxX, polygon[i][0]);
    minY = Math.min(minY, polygon[i][1]);
    maxY = Math.max(maxY, polygon[i][1]);
  }

  const x = Math.max(0, Math.floor(minX));
  const y = Math.max(0, Math.floor(minY));
  const w = Math.min(ctx.canvas.width - x, Math.ceil(maxX) - x);
  const h = Math.min(ctx.canvas.height - y, Math.ceil(maxY) - y);
  if (w <= 0 || h <= 0) return;

  const imageData = ctx.getImageData(x, y, w, h);
  const d = imageData.data;
  const t = Math.max(0, Math.min(1.5, intensity));
  const localPoly = polygon.map(([px, py]) => [px - x, py - y]);

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      if (!pointInPolygon(px + 0.5, py + 0.5, localPoly)) continue;
      const i = (py * w + px) * 4;
      gradeOnePixel(d, i, preset, t);
    }
  }

  ctx.putImageData(imageData, x, y);
}

/**
 * Hero Vice Sunset — unmistakable warm orange-magenta cast on the full canvas,
 * then a rgba(180,40,80,0.25) radial vignette.
 */
export function applyViceCityColorGrade(ctx, intensity = 1.0) {
  applyColorGrade(ctx, 'vice', intensity);
  drawViceRadialVignette(ctx, ctx.canvas.width, ctx.canvas.height);
}

/** Per-panel Vice Sunset: getImageData → pixel loop → putImageData on that region. */
export function applyViceCityColorGradeToPanel(ctx, polygon, intensity = 1.0) {
  applyColorGradeToPanelRegion(ctx, polygon, 'vice', intensity);
}

/** Legacy name kept for outline discovery. */
export function applyViceCitySunsetGrade(ctx, w, h, intensity = 1.0) {
  applyViceCityColorGrade(ctx, intensity);
}

function gradePixels(d, preset, t, w) {
  for (let i = 0; i < d.length; i += 4) {
    gradeOnePixel(d, i, preset, t, w);
  }
}

/** Public helper for per-panel rect grading. */
export function gradeImageData(d, preset, intensity = 1.0, w = 0) {
  const t = Math.max(0, Math.min(1.5, intensity));
  gradePixels(d, preset || 'vice', t, w);
}

function gradeOnePixel(d, i, preset, t, w) {
  let r = d[i], g = d[i + 1], b = d[i + 2];

  switch (preset) {
    case 'neon': {
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const crushed = Math.max(0, (luma - 18 * t) / (1 - 0.08 * t));
      const n = crushed / 255;
      r = crushed * (0.75 + 0.35 * n) + 40 * t * n;
      g = crushed * (0.7 + 0.2 * n) + 10 * t * n;
      b = crushed * (0.95 + 0.4 * n) + 55 * t * (1 - n);
      if (luma > 190) {
        r += 35 * t;
        g += 25 * t;
        b += 50 * t;
      }
      break;
    }
    case 'golden': {
      r = r + 38 * t;
      g = g + 18 * t;
      b = b - 28 * t;
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = r * (1 - 0.18 * t) + luma * 0.18 * t;
      g = g * (1 - 0.18 * t) + luma * 0.18 * t;
      b = b * (1 - 0.18 * t) + luma * 0.18 * t;
      break;
    }
    case 'duotone': {
      const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      const tr = 10, tg = 90, tb = 120;
      const hr = 255, hg = 70, hb = 140;
      r = r * (1 - t) + (tr + (hr - tr) * luma) * t;
      g = g * (1 - t) + (tg + (hg - tg) * luma) * t;
      b = b * (1 - t) + (tb + (hb - tb) * luma) * t;
      break;
    }
    case 'comic': {
      r = contrastCurve(r, 1.55 + 0.35 * t);
      g = contrastCurve(g, 1.55 + 0.35 * t);
      b = contrastCurve(b, 1.55 + 0.35 * t);
      break;
    }
    case 'vice':
    default: {
      // Unmistakably warm orange-magenta cast
      // r = clamp(r * 1.25 + 30), g = clamp(g * 0.95), b = clamp(b * 0.75)
      const warm = Math.max(0, Math.min(1.5, t));
      r = r * (1 + 0.25 * warm) + 30 * warm;
      g = g * (1 - 0.05 * warm);
      b = b * (1 - 0.25 * warm);
      break;
    }
  }

  d[i] = clamp(r);
  d[i + 1] = clamp(g);
  d[i + 2] = clamp(b);
}

function contrastCurve(v, amount) {
  const x = v / 255;
  return (0.5 + (x - 0.5) * amount) * 255;
}

function pointInPolygon(x, y, vs) {
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Radial vignette: transparent center → rgba(180, 40, 80, 0.25) at edges.
 */
export function drawViceRadialVignette(ctx, w, h) {
  ctx.save();
  const radius = Math.max(w, h) * 0.75;
  const g = ctx.createRadialGradient(w / 2, h / 2, radius * 0.2, w / 2, h / 2, radius);
  g.addColorStop(0, 'rgba(180, 40, 80, 0)');
  g.addColorStop(0.55, 'rgba(180, 40, 80, 0.08)');
  g.addColorStop(1, 'rgba(180, 40, 80, 0.25)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** Alias kept for older call sites. */
export function drawMagentaVignette(ctx, w, h, opacity = 0.25) {
  ctx.save();
  const radius = Math.max(w, h) * 0.75;
  const g = ctx.createRadialGradient(w / 2, h / 2, radius * 0.2, w / 2, h / 2, radius);
  g.addColorStop(0, 'rgba(180, 40, 80, 0)');
  g.addColorStop(1, `rgba(180, 40, 80, ${opacity})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

let cachedGrainTile = null;

function getGrainTile() {
  if (cachedGrainTile) return cachedGrainTile;
  const size = 256;
  const tile = document.createElement('canvas');
  tile.width = size;
  tile.height = size;
  const tctx = tile.getContext('2d');
  const imgData = tctx.createImageData(size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const val = (Math.random() * 255) | 0;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    data[i + 3] = (Math.random() * 90) | 0;
  }
  tctx.putImageData(imgData, 0, 0);
  cachedGrainTile = tile;
  return tile;
}

export function drawFilmGrain(ctx, w, h, amount = 0.16) {
  if (amount <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = amount;
  ctx.fillStyle = ctx.createPattern(getGrainTile(), 'repeat');
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

export function drawVignette(ctx, w, h, strength = 0.55) {
  if (strength <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  const radius = Math.max(w, h) * 0.75;
  const g = ctx.createRadialGradient(w / 2, h / 2, radius * 0.4, w / 2, h / 2, radius);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.7, `rgba(20,5,25,${0.35 * strength})`);
  g.addColorStop(1, `rgba(5,0,10,${0.92 * strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/**
 * Atmosphere pass after panels are already per-panel graded.
 * Vice: radial vignette only (pixels already graded). Other presets: full-canvas grade.
 */
export function applyFullColorGrading(ctx, w, h, options = {}) {
  const preset = options.preset || 'vice';
  const intensity = options.gradeIntensity ?? 1.0;
  const panelsGraded = options.panelsGraded === true;

  if (preset === 'vice') {
    if (!panelsGraded) {
      applyViceCityColorGrade(ctx, intensity);
    } else {
      drawViceRadialVignette(ctx, w, h);
    }
  } else if (!panelsGraded) {
    applyColorGrade(ctx, preset, intensity);
  }

  drawFilmGrain(ctx, w, h, options.grainAmount ?? 0.16);
  drawVignette(ctx, w, h, options.vignetteStrength ?? 0.55);
}
