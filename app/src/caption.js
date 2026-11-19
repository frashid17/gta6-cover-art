// Typographic bottom panel + title treatments (vinyl / movie-poster sleeve).

/**
 * Pure typographic panel — purple-magenta gradient, medallion, title, badges.
 * Fills the given rect (right-column bottom strip).
 */
export function drawTypographicPanel(ctx, rect, config = {}) {
  const { x, y, w, h } = rect;
  if (w <= 0 || h <= 0) return;

  const title = (config.title || 'NEON COAST').toUpperCase();
  const subtitle = config.subtitle || 'Six nights in paradise';
  const year = String(config.year || '2026');
  const vol = String(config.vol || '06').padStart(2, '0');
  const font = config.font || 'Anton';
  const finePrint = config.finePrint || '· A VICE STUDIO PICTURE · SHOT ON YOUR OWN CAMERA ·';

  ctx.save();

  // Deep purple-magenta gradient left → right
  const bg = ctx.createLinearGradient(x, y, x + w, y);
  bg.addColorStop(0, '#2D0050');
  bg.addColorStop(1, '#8B1A6B');
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);

  // Soft vertical shade for depth
  const shade = ctx.createLinearGradient(x, y, x, y + h);
  shade.addColorStop(0, 'rgba(0,0,0,0.18)');
  shade.addColorStop(0.5, 'rgba(0,0,0,0)');
  shade.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = shade;
  ctx.fillRect(x, y, w, h);

  // Left medallion
  const medR = Math.min(h * 0.40, w * 0.085);
  const medX = x + medR + w * 0.03;
  const medY = y + h * 0.50;
  drawEstMedallion(ctx, medX, medY, medR, year);

  // VOL badge top-right of panel
  drawVolBadge(ctx, x + w - 16, y + 14, vol);

  // Collector pill bottom-right
  drawCollectorPill(ctx, x + w - 16, y + h - 14);

  // Main title — ~55% of panel height
  const titleSize = Math.round(h * 0.55);
  const titleY = y + h * 0.50;
  const titleX = medX + medR + w * 0.035;
  const titleMaxW = w - (titleX - x) - 130;

  ctx.font = `900 ${titleSize}px "${font}", "Bebas Neue", Impact, sans-serif`;
  let drawSize = titleSize;
  while (ctx.measureText(title).width > titleMaxW && drawSize > 18) {
    drawSize -= 2;
    ctx.font = `900 ${drawSize}px "${font}", "Bebas Neue", Impact, sans-serif`;
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';

  ctx.shadowBlur = Math.round(drawSize * 0.22);
  ctx.shadowColor = 'rgba(255, 94, 0, 0.95)';
  ctx.lineWidth = Math.max(5, Math.round(drawSize * 0.09));
  ctx.strokeStyle = '#000000';
  ctx.strokeText(title, titleX, titleY);

  const grad = ctx.createLinearGradient(titleX, titleY - drawSize * 0.45, titleX, titleY + drawSize * 0.45);
  grad.addColorStop(0, '#FF4500');
  grad.addColorStop(0.25, '#FF6B35');
  grad.addColorStop(0.65, '#FFD700');
  grad.addColorStop(1, '#FFFFFF');
  ctx.shadowBlur = 0;
  ctx.fillStyle = grad;
  ctx.fillText(title, titleX, titleY);

  // Script subtitle overlapping title
  const subSize = Math.max(16, Math.round(drawSize * 0.36));
  ctx.font = `400 ${subSize}px "Pacifico", cursive`;
  const subX = titleX + drawSize * 0.12;
  const subY = titleY - drawSize * 0.38;

  ctx.save();
  ctx.translate(subX, subY);
  ctx.rotate(-0.06);

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.lineWidth = 3.5;
  ctx.strokeText(subtitle, 0, 0);

  ctx.shadowColor = 'rgba(0, 240, 255, 0.75)';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#00f0ff';
  ctx.fillText(subtitle, 0, 0);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#7df9ff';
  ctx.fillText(subtitle, 0, 0);
  ctx.restore();

  // Fine print
  const fineSize = Math.max(8, Math.min(11, Math.round(h * 0.06)));
  ctx.font = `600 ${fineSize}px "Bebas Neue", "Anton", sans-serif`;
  ctx.fillStyle = 'rgba(255, 220, 240, 0.65)';
  ctx.textAlign = 'center';
  ctx.fillText(finePrint, titleX + (w - (titleX - x)) * 0.42, y + h - fineSize - 6);

  ctx.restore();
}

function drawEstMedallion(ctx, cx, cy, r, year) {
  ctx.save();

  // Outer gold ring
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#140618';
  ctx.fill();

  const ringGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  ringGrad.addColorStop(0, '#FFE875');
  ringGrad.addColorStop(0.5, '#FFD700');
  ringGrad.addColorStop(1, '#B8860B');

  ctx.lineWidth = Math.max(3, r * 0.11);
  ctx.strokeStyle = ringGrad;
  ctx.stroke();

  // Inner ring
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.65)';
  ctx.lineWidth = Math.max(1, r * 0.035);
  ctx.stroke();

  // EST.
  ctx.fillStyle = '#FFD700';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.max(9, Math.round(r * 0.22))}px "Bebas Neue", "Anton", sans-serif`;
  ctx.fillText('EST.', cx, cy - r * 0.42);

  // Year
  ctx.font = `900 ${Math.max(16, Math.round(r * 0.52))}px "Anton", "Bebas Neue", Impact, sans-serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(year, cx, cy + r * 0.04);

  // Stars
  ctx.font = `${Math.max(9, Math.round(r * 0.26))}px serif`;
  ctx.fillStyle = '#FFD700';
  ctx.fillText('★★★', cx, cy + r * 0.48);

  ctx.restore();
}

function drawVolBadge(ctx, right, top, vol) {
  const label = `VOL. ${vol}`;
  ctx.save();
  ctx.font = '700 12px "Bebas Neue", "Anton", sans-serif';
  const tw = ctx.measureText(label).width;
  const bw = tw + 16;
  const bh = 22;
  const bx = right - bw;

  ctx.fillStyle = 'rgba(10, 2, 24, 0.9)';
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 1.5;
  roundRectPath(ctx, bx, top, bw, bh, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#00F0FF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, bx + bw / 2, top + bh / 2 + 0.5);
  ctx.restore();
}

function drawCollectorPill(ctx, right, bottom) {
  const label = "COLLECTOR'S EDITION";
  ctx.save();
  ctx.font = '800 10px "Bebas Neue", "Anton", sans-serif';
  const tw = ctx.measureText(label).width;
  const bw = tw + 18;
  const bh = 20;
  const bx = right - bw;
  const by = bottom - bh;

  roundRectPath(ctx, bx, by, bw, bh, bh / 2);
  ctx.fillStyle = '#FF2A85';
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, bx + bw / 2, by + bh / 2 + 0.5);
  ctx.restore();
}

function roundRectPath(ctx, x, y, w, h, r) {
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
 * WANTED badge — top-right of the whole canvas (~180×50).
 */
export function drawWantedBadge(ctx, canvasW, canvasH) {
  const bw = 180;
  const bh = 50;
  const bx = canvasW - bw - 16;
  const by = 14;

  ctx.save();
  roundRectPath(ctx, bx, by, bw, bh, 8);
  ctx.fillStyle = 'rgba(12, 4, 18, 0.92)';
  ctx.fill();
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Inner gold hairline
  roundRectPath(ctx, bx + 4, by + 4, bw - 8, bh - 8, 5);
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 18px "Bebas Neue", "Anton", Impact, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('WANTED', bx + 14, by + bh / 2);

  ctx.fillStyle = '#FFD700';
  ctx.font = '16px serif';
  ctx.textAlign = 'right';
  ctx.fillText('★★★★★', bx + bw - 12, by + bh / 2);
  ctx.restore();
}

/** Legacy lower-third caption (used by non-magazine layouts). */
export function drawTitleGradientBacking(ctx, w, h) {
  const top = h * 0.6;
  ctx.save();
  const g = ctx.createLinearGradient(0, top, 0, h);
  g.addColorStop(0, 'rgba(0, 0, 0, 0)');
  g.addColorStop(1, 'rgba(10, 0, 20, 0.75)');
  ctx.fillStyle = g;
  ctx.fillRect(0, top, w, h - top);
  ctx.restore();
}

export function renderTitleWithGradient(ctx, text, w, h, options = {}) {
  const title = (text || 'NEON COAST').trim().toUpperCase();
  if (!title) return { fontSize: 0, y: 0 };
  const font = options.font || 'Anton';
  const barH = options.barHeight ?? 0;
  const centerY = options.y ?? h - barH - h * 0.12;

  let fontSize = Math.min(w * 0.14, h * 0.16);
  ctx.font = `900 ${fontSize}px "${font}", "Bebas Neue", Impact, sans-serif`;
  while (ctx.measureText(title).width < w * 0.7 && fontSize < h * 0.2) {
    fontSize += 4;
    ctx.font = `900 ${fontSize}px "${font}", "Bebas Neue", Impact, sans-serif`;
  }
  while (ctx.measureText(title).width > w * 0.92 && fontSize > 24) {
    fontSize -= 2;
    ctx.font = `900 ${fontSize}px "${font}", "Bebas Neue", Impact, sans-serif`;
  }

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowBlur = 20;
  ctx.shadowColor = 'rgba(255, 100, 0, 0.8)';
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#000';
  ctx.strokeText(title, w / 2, centerY);
  const grad = ctx.createLinearGradient(0, centerY - fontSize * 0.5, 0, centerY + fontSize * 0.5);
  grad.addColorStop(0, '#FF6B35');
  grad.addColorStop(0.5, '#FFD700');
  grad.addColorStop(1, '#FFFFFF');
  ctx.fillStyle = grad;
  ctx.fillText(title, w / 2, centerY);
  ctx.restore();
  return { fontSize, y: centerY, width: ctx.measureText(title).width };
}

export function renderCursiveSubtitle(ctx, text, w, h, titleMeta) {
  if (!text || !titleMeta) return;
  const fontSize = Math.max(14, titleMeta.fontSize * 0.4);
  ctx.save();
  ctx.font = `400 ${fontSize}px "Pacifico", "Dancing Script", Georgia, cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#5ef0ff';
  ctx.fillText(text, w / 2, titleMeta.y - titleMeta.fontSize * 0.42);
  ctx.restore();
}

export function buildCaptionLayer(ctx, config, w, h, barHeight) {
  drawTitleGradientBacking(ctx, w, h);
  const titleMeta = renderTitleWithGradient(ctx, config.title, w, h, {
    font: config.font || 'Anton',
    barHeight: barHeight ?? 0,
  });
  renderCursiveSubtitle(ctx, config.subtitle, w, h, titleMeta);
}
