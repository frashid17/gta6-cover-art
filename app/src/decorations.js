// Poster decorations: filmstrip bar, wax seal, palm silhouettes.

/**
 * Draws a subtle palm-tree silhouette band along the bottom of the canvas.
 */
export function drawPalmTreeSilhouette(ctx, w, h, options = {}) {
  const barH = options.barHeight ?? Math.round(h * 0.09);
  const yBase = h - barH * 0.15;
  const alpha = options.alpha ?? 0.28;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#020008';

  const count = Math.max(4, Math.round(w / 220));
  for (let i = 0; i < count; i++) {
    const x = (i + 0.55) * (w / count) + ((i % 2) * 18 - 9);
    const scale = 0.55 + (i % 3) * 0.18;
    drawSinglePalm(ctx, x, yBase, scale * (h * 0.11));
  }
  ctx.restore();
}

function drawSinglePalm(ctx, x, y, size) {
  ctx.beginPath();
  // Trunk
  ctx.moveTo(x - size * 0.04, y);
  ctx.quadraticCurveTo(x + size * 0.02, y - size * 0.45, x, y - size * 0.85);
  ctx.quadraticCurveTo(x - size * 0.02, y - size * 0.45, x + size * 0.04, y);
  ctx.closePath();
  ctx.fill();

  // Fronds
  const fronds = 7;
  for (let i = 0; i < fronds; i++) {
    const angle = -Math.PI * 0.85 + (i / (fronds - 1)) * Math.PI * 0.95;
    const len = size * (0.55 + (i % 2) * 0.18);
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.82);
    ctx.quadraticCurveTo(
      x + Math.cos(angle) * len * 0.55,
      y - size * 0.82 + Math.sin(angle) * len * 0.55 - size * 0.08,
      x + Math.cos(angle) * len,
      y - size * 0.82 + Math.sin(angle) * len
    );
    ctx.quadraticCurveTo(
      x + Math.cos(angle) * len * 0.45,
      y - size * 0.82 + Math.sin(angle) * len * 0.35,
      x,
      y - size * 0.82
    );
    ctx.fill();
  }
}

/**
 * Bottom filmstrip bar — the signature GTA poster element (fixed 90px).
 * Left: ★ stars + review quote | Center: spaced tagline | Right: barcode + catalog #
 */
export function drawFilmstripBottomBar(ctx, w, h, options = {}) {
  const barH = 90;
  const y = h - barH;
  const quote = options.quote || 'A fever dream in neon';
  const attribution = options.attribution || 'The Coast Herald';
  const tagline = options.tagline || 'ONE COAST · NO RULES · COMING SOON';
  const catalog = options.catalog || 'VC-VI-2026';

  ctx.save();

  // Very dark maroon base
  ctx.fillStyle = '#1a0a0f';
  ctx.fillRect(0, y, w, barH);

  // Palm silhouettes every 120px at 25% white, ≥60px tall
  drawBarPalmSilhouettes(ctx, w, y, barH);

  // 1px hot-pink top border
  ctx.strokeStyle = '#FF3FA4';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, y + 0.5);
  ctx.lineTo(w, y + 0.5);
  ctx.stroke();

  const pad = w * 0.028;
  const midY = y + barH * 0.52;

  // LEFT — ★ in #FFD700 at 22px + quote
  ctx.font = '22px "Times New Roman", Georgia, serif';
  ctx.fillStyle = '#FFD700';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('★★★★★', pad, y + barH * 0.28);

  ctx.font = `italic ${Math.max(11, Math.round(barH * 0.16))}px Georgia, "Times New Roman", serif`;
  ctx.fillStyle = 'rgba(255, 230, 200, 0.9)';
  ctx.fillText(`"${quote}" — ${attribution}`, pad, y + barH * 0.68);

  // CENTER — tagline #FFFFFF, 16px, letter-spacing 8px, weight 900
  ctx.font = '900 16px "Bebas Neue", "Anton", Impact, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  drawSpacedCaps(ctx, tagline, w * 0.5, midY, 8);

  // RIGHT — barcode + catalog
  const barcodeW = Math.min(120, w * 0.09);
  const barcodeH = barH * 0.42;
  const bx = w - pad - barcodeW;
  const by = y + barH * 0.18;
  drawFakeBarcode(ctx, bx, by, barcodeW, barcodeH);
  ctx.font = `700 ${Math.max(10, Math.round(barH * 0.14))}px "Bebas Neue", sans-serif`;
  ctx.fillStyle = 'rgba(255, 220, 180, 0.8)';
  ctx.textAlign = 'right';
  ctx.fillText(catalog, w - pad, y + barH * 0.82);

  ctx.restore();
  return barH;
}

/** Palm silhouettes (trunk + triangle fronds) every 120px at 25% white, ≥60px tall. */
function drawBarPalmSilhouettes(ctx, w, y, barH) {
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#ffffff';
  const palmH = Math.max(60, barH * 0.72);
  for (let x = 40; x < w; x += 120) {
    const baseY = y + barH - 4;
    const trunkH = palmH * 0.7;
    ctx.fillRect(x - 2, baseY - trunkH, 4, trunkH);
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(x, baseY - trunkH);
      ctx.lineTo(x + i * 16, baseY - trunkH - palmH * 0.18);
      ctx.lineTo(x + i * 7, baseY - trunkH + palmH * 0.08);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawSpacedCaps(ctx, text, centerX, y, letterSpacing) {
  let total = 0;
  const widths = [];
  for (let i = 0; i < text.length; i++) {
    const ww = ctx.measureText(text[i]).width;
    widths.push(ww);
    total += ww;
    if (i < text.length - 1) total += letterSpacing;
  }
  let x = centerX - total / 2;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], x, y);
    x += widths[i] + letterSpacing;
  }
}

function drawFakeBarcode(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = '#f5e6d0';
  let cx = x;
  const end = x + w;
  while (cx < end) {
    const bw = 1 + ((Math.sin(cx * 12.7) + 1) * 1.6);
    ctx.fillRect(cx, y, Math.min(bw, end - cx), h);
    cx += bw + 1.2 + ((Math.cos(cx * 3.1) + 1) * 0.8);
  }
  ctx.restore();
}

/**
 * Circular “ORIGINAL COVER ART” wax-seal stamp (canvas arcs + starburst + text on path).
 */
export function drawOriginalCoverArtSeal(ctx, w, h, options = {}) {
  const barH = options.barHeight ?? Math.round(h * 0.095);
  const radius = Math.min(w, h) * 0.075;
  const cx = options.cx ?? w - radius * 1.55;
  const cy = options.cy ?? h - barH - radius * 1.35;

  ctx.save();
  ctx.translate(cx, cy);

  // Outer wax disc
  const wax = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
  wax.addColorStop(0, '#c41e4a');
  wax.addColorStop(0.55, '#8b0f2e');
  wax.addColorStop(1, '#4a0618');
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = wax;
  ctx.fill();

  // Starburst notches
  ctx.strokeStyle = 'rgba(255, 200, 140, 0.55)';
  ctx.lineWidth = Math.max(1, radius * 0.04);
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * radius * 0.82, Math.sin(a) * radius * 0.82);
    ctx.lineTo(Math.cos(a) * radius * 0.98, Math.sin(a) * radius * 0.98);
    ctx.stroke();
  }

  // Inner ring
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 220, 160, 0.85)';
  ctx.lineWidth = Math.max(1.5, radius * 0.05);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.42, 0, Math.PI * 2);
  ctx.stroke();

  // Center mark
  ctx.fillStyle = 'rgba(255, 230, 180, 0.9)';
  ctx.font = `700 ${Math.round(radius * 0.28)}px "Bebas Neue", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VI', 0, 2);

  // Text on circular path
  drawCircularText(ctx, 'ORIGINAL COVER ART · ', radius * 0.58, Math.round(radius * 0.18));

  ctx.restore();
}

function drawCircularText(ctx, text, radius, fontSize) {
  ctx.save();
  ctx.font = `700 ${fontSize}px "Bebas Neue", "Anton", sans-serif`;
  ctx.fillStyle = 'rgba(255, 235, 200, 0.92)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const chars = text.split('');
  let total = 0;
  const widths = chars.map((c) => {
    const m = ctx.measureText(c).width;
    total += m;
    return m;
  });
  const circumference = Math.PI * 2 * radius;
  const scale = Math.min(1, (circumference * 0.92) / total);

  let angle = -Math.PI / 2 - (total * scale) / (2 * radius);
  for (let i = 0; i < chars.length; i++) {
    const cw = widths[i] * scale;
    const mid = angle + cw / (2 * radius);
    ctx.save();
    ctx.rotate(mid);
    ctx.translate(0, -radius);
    ctx.fillText(chars[i], 0, 0);
    ctx.restore();
    angle += cw / radius;
  }
  ctx.restore();
}
