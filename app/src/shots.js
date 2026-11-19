// Deterministic screenshot scenes for ?shot=cover and ?shot=editor.

/**
 * Executes a deterministic scene setup when ?shot= query parameter is present.
 */
export async function runShot(shot, query, app) {
  // Ensure custom OFL fonts Anton and Bebas Neue are fully loaded
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Proceed if font loading API unavailable
    }
  }

  const ratio = query.get('ratio') || (shot === 'cover' ? 'landscape' : 'landscape');
  const layout = query.get('layout') || 'diagonal3';
  const caption = query.get('caption') || 'VICE CITY';
  const subtitle = query.get('sub') ?? 'LEONIDA DREAMS • 2026';

  // Apply state
  app.state.ratio = ratio;
  app.state.layout = layout;
  app.state.caption = caption;
  app.state.subtitle = subtitle;

  // Load photos into panels
  const photoChoice = query.get('photo');
  if (photoChoice === 'pier') {
    const pier = await app.loadImage('samples/pier.jpg');
    app.state.defaultImage = pier;
  } else if (photoChoice === 'boulevard') {
    const blvd = await app.loadImage('samples/boulevard.jpg');
    app.state.defaultImage = blvd;
  } else {
    // Multi-panel composition using both pier and boulevard samples
    const [pier, blvd] = await Promise.all([
      app.loadImage('samples/pier.jpg'),
      app.loadImage('samples/boulevard.jpg'),
    ]);
    app.state.defaultImage = pier;
    app.state.panels = {
      0: { image: pier, zoom: 1.15, panX: 0.05, panY: -0.05, flipH: false },
      1: { image: blvd, zoom: 1.25, panX: 0.1, panY: 0.05, flipH: true },
      2: { image: pier, zoom: 1.4, panX: -0.15, panY: 0.15, flipH: false },
    };
  }

  // Update UI form controls to reflect the active scene
  app.syncUI();

  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    // Ensure viewport-matching canvas dimensions for crisp full-frame capture
    const w = window.innerWidth || 1280;
    const h = window.innerHeight || 720;
    app.resizeCanvas(w, h);
  } else if (shot === 'editor') {
    document.body.classList.add('shot-editor');
    app.resizeCanvasForRatio();
  }

  // Render twice across animation frames to guarantee canvas buffer swap
  app.redraw();
  requestAnimationFrame(() => {
    app.redraw();
    requestAnimationFrame(() => {
      window.__shotReady = true;
    });
  });
}
