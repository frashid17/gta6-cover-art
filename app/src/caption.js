// Bold condensed display caption typography and movie-poster lettering engine.

/**
 * Builds and renders the complete caption layer including primary poster title and subtitle badge.
 */
export function buildCaptionLayer(ctx, config, w, h) {
  const title = (config.title || 'VICE CITY').trim().toUpperCase();
  const subtitle = (config.subtitle || '').trim().toUpperCase();
  const fontChoice = config.font || 'Anton';
  const fillStyle = config.fillStyle || 'sunset'; // 'sunset' | 'white' | 'neon'
  const position = config.position || 'bottom';   // 'bottom' | 'top'

  if (!title && !subtitle) return;

  ctx.save();

  // Determine vertical placement
  let baseY = h * 0.88;
  if (position === 'top') baseY = h * 0.22;

  // Render primary title
  if (title) {
    drawPosterLettering(ctx, title, w / 2, baseY, {
      w,
      h,
      font: fontChoice,
      fillStyle,
      letterSpacing: 0.04,
    });
  }

  // Render secondary subtitle badge underneath (or above if at bottom)
  if (subtitle) {
    const badgeY = position === 'top' ? baseY + (h * 0.08) : baseY - (h * 0.095);
    drawSubtitleBadge(ctx, subtitle, w / 2, badgeY, {
      w,
      h,
      font: fontChoice,
    });
  }

  ctx.restore();
}

/**
 * Draws high-impact movie-poster lettering with 3D extruded drop shadow and multi-stage outlines.
 */
export function drawPosterLettering(ctx, text, centerX, centerY, options = {}) {
  const { w, h, font = 'Anton', fillStyle = 'sunset', letterSpacing = 0.04 } = options;

  let fontSize = Math.min(w * 0.125, h * 0.155);
  ctx.font = `900 ${fontSize}px "${font}", "Bebas Neue", Impact, sans-serif`;

  // Dynamically scale down font if text exceeds 88% canvas width
  let totalWidth = measureTrackedText(ctx, text, fontSize * letterSpacing);
  while (totalWidth > w * 0.88 && fontSize > 18) {
    fontSize -= 4;
    ctx.font = `900 ${fontSize}px "${font}", "Bebas Neue", Impact, sans-serif`;
    totalWidth = measureTrackedText(ctx, text, fontSize * letterSpacing);
  }

  const tracking = fontSize * letterSpacing;
  const strokeWidth = Math.max(4, Math.round(fontSize * 0.11));
  const startX = centerX - (totalWidth / 2);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 2;

  // 1. Pass 1: 3D Extruded Drop Shadow (deep black/purple dimensional offset)
  const shadowDepth = Math.max(5, Math.round(fontSize * 0.085));
  ctx.fillStyle = '#06010a';
  for (let s = shadowDepth; s >= 1; s--) {
    drawTrackedGlyphs(ctx, text, startX + s * 1.2, centerY + s * 1.4, tracking, (char, gx, gy) => {
      ctx.fillText(char, gx, gy);
    });
  }

  // 2. Pass 2: Heavy graphic outer black stroke for comic/poster separation
  ctx.lineWidth = strokeWidth * 1.15;
  ctx.strokeStyle = '#08010e';
  drawTrackedGlyphs(ctx, text, startX, centerY, tracking, (char, gx, gy) => {
    ctx.strokeText(char, gx, gy);
  });

  // 3. Pass 3: Subtle inner neon accent stroke (electric pink / hot cyan)
  ctx.lineWidth = Math.max(2, strokeWidth * 0.28);
  ctx.strokeStyle = fillStyle === 'neon' ? '#00f0ff' : '#ff2a7a';
  drawTrackedGlyphs(ctx, text, startX, centerY, tracking, (char, gx, gy) => {
    ctx.strokeText(char, gx, gy);
  });

  // 4. Pass 4: Gradient or crisp white fill
  let textFill;
  if (fillStyle === 'sunset') {
    const textGrad = ctx.createLinearGradient(0, centerY - fontSize * 0.55, 0, centerY + fontSize * 0.55);
    textGrad.addColorStop(0, '#ffffff');
    textGrad.addColorStop(0.25, '#fff6bd');
    textGrad.addColorStop(0.55, '#ff8a5c');
    textGrad.addColorStop(0.85, '#ff2a7a');
    textGrad.addColorStop(1, '#b01060');
    textFill = textGrad;
  } else if (fillStyle === 'neon') {
    const neonGrad = ctx.createLinearGradient(0, centerY - fontSize * 0.55, 0, centerY + fontSize * 0.55);
    neonGrad.addColorStop(0, '#ffffff');
    neonGrad.addColorStop(0.4, '#a0f8ff');
    neonGrad.addColorStop(0.8, '#00d2f0');
    neonGrad.addColorStop(1, '#0084b4');
    textFill = neonGrad;
  } else {
    textFill = '#ffffff';
  }

  ctx.fillStyle = textFill;
  drawTrackedGlyphs(ctx, text, startX, centerY, tracking, (char, gx, gy) => {
    ctx.fillText(char, gx, gy);
  });
}

/**
 * Draws a stylized subtitle badge pill with dark glass backing and neon borders.
 */
export function drawSubtitleBadge(ctx, text, centerX, centerY, options = {}) {
  const { w, h, font = 'Anton' } = options;
  const badgeFontSize = Math.max(12, Math.min(w * 0.024, h * 0.032));
  ctx.font = `700 ${badgeFontSize}px "${font}", "Bebas Neue", sans-serif`;

  const letterSpacing = badgeFontSize * 0.16;
  const textWidth = measureTrackedText(ctx, text, letterSpacing);
  const padX = badgeFontSize * 1.4;
  const padY = badgeFontSize * 0.6;
  const boxW = textWidth + padX * 2;
  const boxH = badgeFontSize + padY * 2;
  const boxX = centerX - boxW / 2;
  const boxY = centerY - boxH / 2;
  const radius = boxH * 0.3;

  ctx.save();
  // Pill background
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, radius);
  ctx.fillStyle = 'rgba(13, 8, 22, 0.88)';
  ctx.fill();

  // Pill border with subtle dual-tone neon rim
  const borderGrad = ctx.createLinearGradient(boxX, boxY, boxX + boxW, boxY);
  borderGrad.addColorStop(0, 'rgba(255, 42, 109, 0.85)');
  borderGrad.addColorStop(1, 'rgba(0, 240, 255, 0.85)');
  ctx.lineWidth = Math.max(1.5, Math.round(badgeFontSize * 0.12));
  ctx.strokeStyle = borderGrad;
  ctx.stroke();

  // Pill text
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  const startX = centerX - textWidth / 2;
  drawTrackedGlyphs(ctx, text, startX, centerY, letterSpacing, (char, gx, gy) => {
    ctx.fillText(char, gx, gy);
  });

  ctx.restore();
}

/**
 * Measures text width including custom letter spacing / tracking.
 */
function measureTrackedText(ctx, text, tracking) {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    width += ctx.measureText(text[i]).width;
    if (i < text.length - 1) width += tracking;
  }
  return width;
}

/**
 * Iterates through characters and positions each according to tracking.
 */
function drawTrackedGlyphs(ctx, text, startX, y, tracking, drawFn) {
  let curX = startX;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    drawFn(char, curX, y);
    curX += ctx.measureText(char).width + tracking;
  }
}
