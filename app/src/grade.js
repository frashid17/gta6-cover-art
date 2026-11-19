// Cinematic color grading, Vice City sunset tones, film grain, and vignette effects.

/**
 * Applies the signature Vice City sunset grade: deep magenta/coral sunset wash,
 * warm golden hour tones, and saturated tropical filmic contrast.
 */
export function applyViceCitySunsetGrade(ctx, w, h, intensity = 1.0) {
  if (intensity <= 0) return;
  ctx.save();

  // Pass 1: Saturated sunset atmospheric gradient (Golden Coral to Neon Magenta to Midnight Plum)
  ctx.globalCompositeOperation = 'overlay';
  const sunsetGrad = ctx.createLinearGradient(0, h * 0.05, 0, h);
  sunsetGrad.addColorStop(0, `rgba(255, 130, 45, ${0.55 * intensity})`);
  sunsetGrad.addColorStop(0.35, `rgba(255, 45, 120, ${0.65 * intensity})`);
  sunsetGrad.addColorStop(0.75, `rgba(180, 20, 140, ${0.70 * intensity})`);
  sunsetGrad.addColorStop(1, `rgba(45, 8, 65, ${0.85 * intensity})`);
  ctx.fillStyle = sunsetGrad;
  ctx.fillRect(0, 0, w, h);

  // Pass 2: Warm golden hour radiance in upper skies and highlights
  ctx.globalCompositeOperation = 'soft-light';
  const goldenRad = ctx.createRadialGradient(w * 0.45, h * 0.18, w * 0.08, w * 0.45, h * 0.18, w * 0.9);
  goldenRad.addColorStop(0, `rgba(255, 218, 90, ${0.75 * intensity})`);
  goldenRad.addColorStop(0.45, `rgba(255, 95, 109, ${0.50 * intensity})`);
  goldenRad.addColorStop(1, `rgba(30, 5, 45, ${0.60 * intensity})`);
  ctx.fillStyle = goldenRad;
  ctx.fillRect(0, 0, w, h);

  // Pass 3: S-curve filmic contrast & warm shadow tinting
  ctx.globalCompositeOperation = 'color-burn';
  const shadowGrad = ctx.createLinearGradient(0, 0, 0, h);
  shadowGrad.addColorStop(0, `rgba(40, 10, 35, ${0.18 * intensity})`);
  shadowGrad.addColorStop(0.6, `rgba(30, 5, 40, ${0.25 * intensity})`);
  shadowGrad.addColorStop(1, `rgba(25, 2, 38, ${0.45 * intensity})`);
  ctx.fillStyle = shadowGrad;
  ctx.fillRect(0, 0, w, h);

  // Pass 4: Warm skin tone shift (subtle peach highlight wash)
  ctx.globalCompositeOperation = 'screen';
  const warmSkin = ctx.createLinearGradient(0, h * 0.3, w, h * 0.8);
  warmSkin.addColorStop(0, `rgba(255, 160, 100, ${0.18 * intensity})`);
  warmSkin.addColorStop(0.5, `rgba(255, 100, 140, ${0.12 * intensity})`);
  warmSkin.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = warmSkin;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();
}

/**
 * Adds high-energy golden hour highlights to enhance skin tones and sunlit edges.
 */
export function applyGoldenHourHighlights(ctx, w, h, intensity = 1.0) {
  if (intensity <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const sunBloom = ctx.createRadialGradient(w * 0.35, h * 0.15, w * 0.05, w * 0.35, h * 0.15, w * 0.7);
  sunBloom.addColorStop(0, `rgba(255, 240, 180, ${0.40 * intensity})`);
  sunBloom.addColorStop(0.4, `rgba(255, 160, 80, ${0.25 * intensity})`);
  sunBloom.addColorStop(1, 'rgba(255, 80, 80, 0)');

  ctx.fillStyle = sunBloom;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/**
 * Adds electric cyan neon edge lighting, giving the poster quintessential Vice City dual-tone aesthetic.
 */
export function applyCyanNeonAccents(ctx, w, h, intensity = 1.0) {
  if (intensity <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Bottom-right / diagonal neon glow
  const neonGlow = ctx.createLinearGradient(w * 0.6, h * 0.4, w, h);
  neonGlow.addColorStop(0, 'rgba(0, 242, 254, 0)');
  neonGlow.addColorStop(0.8, `rgba(0, 242, 254, ${0.28 * intensity})`);
  neonGlow.addColorStop(1, `rgba(79, 172, 254, ${0.45 * intensity})`);

  ctx.fillStyle = neonGlow;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

// Cached grain canvas tile for high performance procedural 35mm grain
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

  // Generate fine 35mm organic noise
  for (let i = 0; i < data.length; i += 4) {
    const val = (Math.random() * 255) | 0;
    data[i] = val;     // R
    data[i + 1] = val; // G
    data[i + 2] = val; // B
    data[i + 3] = (Math.random() * 85) | 0; // Alpha
  }
  tctx.putImageData(imgData, 0, 0);
  cachedGrainTile = tile;
  return tile;
}

/**
 * Renders authentic 35mm photographic film grain across the cover.
 */
export function drawFilmGrain(ctx, w, h, amount = 0.18) {
  if (amount <= 0) return;
  const tile = getGrainTile();

  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = amount;

  const pattern = ctx.createPattern(tile, 'repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();
}

/**
 * Draws cinematic peripheral vignette falloff to frame the action.
 */
export function drawVignette(ctx, w, h, strength = 0.55) {
  if (strength <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';

  const radius = Math.max(w, h) * 0.75;
  const vignette = ctx.createRadialGradient(w / 2, h / 2, radius * 0.45, w / 2, h / 2, radius);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(0.7, `rgba(20, 5, 25, ${0.4 * strength})`);
  vignette.addColorStop(1, `rgba(5, 0, 10, ${0.9 * strength})`);

  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/**
 * Orchestrates full multi-stage color grading and atmospheric effects.
 */
export function applyFullColorGrading(ctx, w, h, options = {}) {
  const gradeIntensity = options.gradeIntensity ?? 1.0;
  const grainAmount = options.grainAmount ?? 0.16;
  const vignetteStrength = options.vignetteStrength ?? 0.55;

  applyViceCitySunsetGrade(ctx, w, h, gradeIntensity);
  applyGoldenHourHighlights(ctx, w, h, gradeIntensity);
  applyCyanNeonAccents(ctx, w, h, gradeIntensity);
  drawFilmGrain(ctx, w, h, grainAmount);
  drawVignette(ctx, w, h, vignetteStrength);
}
