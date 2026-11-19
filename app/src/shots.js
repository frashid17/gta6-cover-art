// Deterministic screenshot scenes for ?shot=cover|editor|portrait|square.

/**
 * Cover: magazine grid + all sample photos + mixed grades + typographic panel + WANTED.
 */
export async function runShot(shot, query, app) {
  if (typeof app.ensureFontsLoaded === 'function') {
    await app.ensureFontsLoaded();
  } else if (document.fonts) {
    try {
      await Promise.all([
        document.fonts.load('900 48px Anton'),
        document.fonts.load('700 48px "Bebas Neue"'),
        document.fonts.load('400 48px Pacifico'),
      ]);
      await document.fonts.ready;
    } catch {}
  }

  const layout = query.get('layout') || 'comic';
  const caption = query.get('caption') || 'NEON COAST';
  const subtitle = query.get('sub') ?? 'Six nights in paradise';

  app.state.layout = layout;
  app.state.caption = caption;
  app.state.subtitle = subtitle;
  app.state.year = query.get('year') || '2026';
  app.state.vol = query.get('vol') || '06';
  app.state.font = 'Anton';
  app.state.gradeIntensity = 1.15;
  app.state.grainAmount = 0.08;
  app.state.vignetteStrength = 0.4;

  const [pier, blvd] = await Promise.all([
    app.loadImage('samples/pier.jpg'),
    app.loadImage('samples/boulevard.jpg'),
  ]);
  app.state.defaultImage = pier;

  if (typeof app.fillAllPanels === 'function') {
    app.fillAllPanels([pier, blvd]);
  } else {
    for (let i = 0; i < 7; i++) {
      app.assignPanelImage(i, i % 2 ? blvd : pier, {
        zoom: 1.12 + (i % 3) * 0.06,
        flipH: i % 3 === 1,
      });
    }
  }

  app.syncUI();

  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    app.state.ratio = 'landscape';
    app.state.layout = 'comic';
    app.resizeCanvas(1920, 1080);
  } else if (shot === 'portrait') {
    document.body.classList.add('shot-cover');
    app.state.ratio = 'portrait';
    app.state.layout = 'comic';
    app.resizeCanvas(1080, 1350);
  } else if (shot === 'square') {
    document.body.classList.add('shot-cover');
    app.state.ratio = 'square';
    app.state.layout = 'comic';
    app.resizeCanvas(1080, 1080);
  } else if (shot === 'editor') {
    document.body.classList.add('shot-editor');
    app.state.ratio = 'landscape';
    app.state.layout = 'comic';
    app.resizeCanvasForRatio();
  } else {
    app.resizeCanvasForRatio();
  }

  app.redraw();
  requestAnimationFrame(() => {
    app.redraw();
    requestAnimationFrame(() => {
      window.__shotReady = true;
    });
  });
}
