// High-resolution canvas rendering and PNG export pipeline for cover art.

import { renderMultiPanelLayout } from './panels.js';
import { applyFullColorGrading } from './grade.js';
import { buildCaptionLayer } from './caption.js';

/**
 * Dimensions supported for GTA 6-style poster exports.
 */
export const EXPORT_PRESETS = {
  landscape: { name: '1920x1080 (Landscape Banner)', width: 1920, height: 1080 },
  portrait: { name: '1080x1350 (Portrait Poster 4:5)', width: 1080, height: 1350 },
  square: { name: '1080x1080 (Square Cover 1:1)', width: 1080, height: 1080 },
};

/**
 * Renders the complete artwork onto an offscreen canvas at the exact specified dimensions.
 */
export function renderHighResCover(state, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 1. Draw base dark backdrop
  ctx.fillStyle = '#10051e';
  ctx.fillRect(0, 0, width, height);

  // 2. Render multi-panel compositing
  renderMultiPanelLayout(ctx, state, width, height);

  // 3. Apply Vice City sunset color grading, neon accents, film grain, and vignette
  applyFullColorGrading(ctx, width, height, {
    gradeIntensity: state.gradeIntensity ?? 1.0,
    grainAmount: state.grainAmount ?? 0.16,
    vignetteStrength: state.vignetteStrength ?? 0.55,
  });

  // 4. Render bold display caption typography
  buildCaptionLayer(ctx, {
    title: state.caption || 'VICE CITY',
    subtitle: state.subtitle || '',
    font: state.font || 'Anton',
    fillStyle: state.fillStyle || 'sunset',
    position: state.captionPosition || 'bottom',
  }, width, height);

  return canvas;
}

/**
 * Triggers a browser download of the canvas contents as a PNG file.
 */
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
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve(filename);
    }, 'image/png');
  });
}
