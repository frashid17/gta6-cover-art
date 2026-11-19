// High-res magazine-grid composition + PNG export for all three poster sizes.

import {
  renderMagazineLayout,
  strokeWhiteGrid,
  createMagazineGrid,
} from './panels.js';
import { drawFilmGrain, drawVignette } from './grade.js';
import {
  drawTypographicPanel,
  drawWantedBadge,
  buildCaptionLayer,
} from './caption.js';

export const EXPORT_PRESETS = {
  landscape: { name: '1920×1080', width: 1920, height: 1080 },
  portrait: { name: '1080×1350', width: 1080, height: 1350 },
  square: { name: '1080×1080', width: 1080, height: 1080 },
};

/**
 * Builds the full multi-panel poster onto a canvas context.
 */
export function buildMultiPanelComposition(ctx, state, width, height) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const layout = state.layout || 'comic';
  const isMagazine = layout === 'comic' || layout === 'magazine';

  if (isMagazine) {
    const { photoPanels, typePanel } = renderMagazineLayout(ctx, state, width, height);

    // Typographic bottom panel (right column only)
    if (typePanel) {
      drawTypographicPanel(ctx, typePanel, {
        title: state.caption || 'NEON COAST',
        subtitle: state.subtitle || 'Six nights in paradise',
        year: state.year || '2026',
        vol: state.vol || '06',
        font: state.font || 'Anton',
        finePrint: state.finePrint || '· A VICE STUDIO PICTURE · SHOT ON YOUR OWN CAMERA ·',
      });
    }

    // Light atmosphere (panels already graded)
    drawFilmGrain(ctx, width, height, (state.grainAmount ?? 0.14) * 0.6);
    drawVignette(ctx, width, height, (state.vignetteStrength ?? 0.45) * 0.55);

    // 3px white grid lines (bake into PNG) — after overlays so borders stay white
    strokeWhiteGrid(ctx, photoPanels, typePanel);

    // WANTED badge on top of everything
    drawWantedBadge(ctx, width, height);
  } else {
    const { photoPanels } = renderMagazineLayout(ctx, state, width, height);
    drawFilmGrain(ctx, width, height, state.grainAmount ?? 0.14);
    drawVignette(ctx, width, height, state.vignetteStrength ?? 0.5);
    strokeWhiteGrid(ctx, photoPanels, null);
    buildCaptionLayer(
      ctx,
      {
        title: state.caption || 'NEON COAST',
        subtitle: state.subtitle || 'Six nights in paradise',
        font: state.font || 'Anton',
      },
      width,
      height,
      0
    );
    drawWantedBadge(ctx, width, height);
  }
}

export function renderHighResCover(state, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  buildMultiPanelComposition(ctx, state, width, height);
  return canvas;
}

export function exportCanvasToPNG(canvas, filename = 'gta6-cover-art.png') {
  return exportToPNG(canvas, filename);
}

export function exportToPNG(canvas, filename = 'gta6-cover-art.png') {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas blob generation failed'));
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 800);
      resolve(filename);
    }, 'image/png');
  });
}

export async function exportAllThreeSizes(state) {
  const results = [];
  for (const key of ['landscape', 'portrait', 'square']) {
    const preset = EXPORT_PRESETS[key];
    const prev = state.ratio;
    state.ratio = key;
    const canvas = renderHighResCover(state, preset.width, preset.height);
    state.ratio = prev;
    const name = `gta6-cover-${preset.width}x${preset.height}.png`;
    await exportToPNG(canvas, name);
    results.push(name);
  }
  return results;
}

export { createMagazineGrid };
