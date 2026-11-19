// Panel geometry, clipping, and multi-panel compositing for GTA 6-style cover art.

/**
 * Calculates polygon coordinates for each panel based on layout preset and canvas size.
 * @param {'diagonal3' | 'diagonal2' | 'triptych' | 'duohorizon'} layoutType
 * @param {number} w Canvas width
 * @param {number} h Canvas height
 * @returns {Array<{ id: number, points: Array<[number, number]>, center: [number, number] }>}
 */
export function createPanelGeometry(layoutType, w, h) {
  switch (layoutType) {
    case 'diagonal3': {
      // Iconic 3-panel GTA cover layout:
      // Panel 0: Dominant left-to-center diagonal hero slice
      // Panel 1: Top-right angled action panel
      // Panel 2: Bottom-right angled atmosphere panel
      const p0 = [
        [0, 0],
        [w * 0.58, 0],
        [w * 0.38, h],
        [0, h],
      ];
      const p1 = [
        [w * 0.58, 0],
        [w, 0],
        [w, h * 0.52],
        [w * 0.476, h * 0.52],
      ];
      const p2 = [
        [w * 0.476, h * 0.52],
        [w, h * 0.52],
        [w, h],
        [w * 0.38, h],
      ];
      return [
        { id: 0, points: p0, center: [w * 0.24, h * 0.5] },
        { id: 1, points: p1, center: [w * 0.76, h * 0.25] },
        { id: 2, points: p2, center: [w * 0.70, h * 0.76] },
      ];
    }

    case 'diagonal2': {
      // 2 dynamic diagonal panels cutting across at ~15°
      const p0 = [
        [0, 0],
        [w, 0],
        [w, h * 0.42],
        [0, h * 0.62],
      ];
      const p1 = [
        [0, h * 0.62],
        [w, h * 0.42],
        [w, h],
        [0, h],
      ];
      return [
        { id: 0, points: p0, center: [w * 0.5, h * 0.26] },
        { id: 1, points: p1, center: [w * 0.5, h * 0.74] },
      ];
    }

    case 'triptych': {
      // 3 vertical-diagonal stylized columns
      const p0 = [
        [0, 0],
        [w * 0.36, 0],
        [w * 0.30, h],
        [0, h],
      ];
      const p1 = [
        [w * 0.36, 0],
        [w * 0.68, 0],
        [w * 0.62, h],
        [w * 0.30, h],
      ];
      const p2 = [
        [w * 0.68, 0],
        [w, 0],
        [w, h],
        [w * 0.62, h],
      ];
      return [
        { id: 0, points: p0, center: [w * 0.16, h * 0.5] },
        { id: 1, points: p1, center: [w * 0.49, h * 0.5] },
        { id: 2, points: p2, center: [w * 0.82, h * 0.5] },
      ];
    }

    case 'duohorizon':
    default: {
      // Cinematic horizontal split with subtle dynamic slant
      const p0 = [
        [0, 0],
        [w, 0],
        [w, h * 0.52],
        [0, h * 0.48],
      ];
      const p1 = [
        [0, h * 0.48],
        [w, h * 0.52],
        [w, h],
        [0, h],
      ];
      return [
        { id: 0, points: p0, center: [w * 0.5, h * 0.25] },
        { id: 1, points: p1, center: [w * 0.5, h * 0.75] },
      ];
    }
  }
}

/**
 * Draws a panel image clipped to the specified polygon with interactive transform.
 */
export function drawPanelImage(ctx, polygon, image, transform, canvasWidth, canvasHeight) {
  if (!polygon || polygon.length < 3) return;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(polygon[0][0], polygon[0][1]);
  for (let i = 1; i < polygon.length; i++) {
    ctx.lineTo(polygon[i][0], polygon[i][1]);
  }
  ctx.closePath();
  ctx.clip();

  // Find bounding box of polygon
  let minX = polygon[0][0], maxX = polygon[0][0];
  let minY = polygon[0][1], maxY = polygon[0][1];
  for (let i = 1; i < polygon.length; i++) {
    minX = Math.min(minX, polygon[i][0]);
    maxX = Math.max(maxX, polygon[i][0]);
    minY = Math.min(minY, polygon[i][1]);
    maxY = Math.max(maxY, polygon[i][1]);
  }
  const boxW = Math.max(1, maxX - minX);
  const boxH = Math.max(1, maxY - minY);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // Fill background behind image with deep Vice City nocturnal violet
  ctx.fillStyle = '#180a26';
  ctx.fillRect(minX, minY, boxW, boxH);

  if (image && image.width > 0 && image.height > 0) {
    const scale = Math.max(boxW / image.width, boxH / image.height) * (transform.zoom || 1);
    const drawW = image.width * scale;
    const drawH = image.height * scale;

    const panX = (transform.panX || 0) * boxW * 0.5;
    const panY = (transform.panY || 0) * boxH * 0.5;

    ctx.save();
    ctx.translate(centerX + panX, centerY + panY);
    if (transform.flipH) ctx.scale(-1, 1);
    ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws heavy poster border dividers with dark graphic stroke and neon accent pinstripe.
 */
export function drawPanelDivider(ctx, p1, p2, width, color = '#0d0816', accentColor = '#ff2a7a') {
  ctx.save();
  // Outer graphic black divider
  ctx.beginPath();
  ctx.moveTo(p1[0], p1[1]);
  ctx.lineTo(p2[0], p2[1]);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Subtle neon accent glow line in center
  if (width >= 6) {
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.lineWidth = Math.max(1.5, width * 0.14);
    ctx.strokeStyle = accentColor;
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Renders the multi-panel layout including photo slices and stylized dividers.
 */
export function renderMultiPanelLayout(ctx, state, width, height) {
  const panels = createPanelGeometry(state.layout || 'diagonal3', width, height);
  const dividerWidth = Math.max(6, Math.round(width * 0.0075));

  // 1. Draw each panel's image
  panels.forEach((panel) => {
    const panelConfig = (state.panels && state.panels[panel.id]) || {};
    const img = panelConfig.image || state.defaultImage;
    const transform = {
      zoom: panelConfig.zoom ?? 1.0,
      panX: panelConfig.panX ?? 0,
      panY: panelConfig.panY ?? 0,
      flipH: !!panelConfig.flipH,
    };
    drawPanelImage(ctx, panel.points, img, transform, width, height);
  });

  // 2. Draw outer canvas frame
  ctx.save();
  ctx.lineWidth = dividerWidth * 1.5;
  ctx.strokeStyle = '#0d0816';
  ctx.strokeRect(0, 0, width, height);
  ctx.restore();

  // 3. Draw inter-panel dividing gutters
  if (state.layout === 'diagonal3') {
    // Divider between panel 0 and panels 1 & 2
    drawPanelDivider(ctx, [width * 0.58, 0], [width * 0.38, height], dividerWidth, '#0d0816', '#ff2a7a');
    // Divider between panel 1 and panel 2
    drawPanelDivider(ctx, [width * 0.476, height * 0.52], [width, height * 0.52], dividerWidth, '#0d0816', '#00f0ff');
  } else if (state.layout === 'diagonal2') {
    drawPanelDivider(ctx, [0, height * 0.62], [width, height * 0.42], dividerWidth, '#0d0816', '#ff5e62');
  } else if (state.layout === 'triptych') {
    drawPanelDivider(ctx, [width * 0.36, 0], [width * 0.30, height], dividerWidth, '#0d0816', '#ff2a7a');
    drawPanelDivider(ctx, [width * 0.68, 0], [width * 0.62, height], dividerWidth, '#0d0816', '#00f0ff');
  } else if (state.layout === 'duohorizon') {
    drawPanelDivider(ctx, [0, height * 0.48], [width, height * 0.52], dividerWidth, '#0d0816', '#ffd166');
  }
}

/**
 * Tests which panel polygon contains point (x, y) for interactive canvas manipulation.
 */
export function getPanelAtPoint(x, y, layoutType, w, h) {
  const panels = createPanelGeometry(layoutType, w, h);
  for (const panel of panels) {
    if (pointInPolygon([x, y], panel.points)) {
      return panel.id;
    }
  }
  return 0;
}

/**
 * Standard ray-casting algorithm for point-in-polygon test.
 */
function pointInPolygon(pt, vs) {
  const x = pt[0], y = pt[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
