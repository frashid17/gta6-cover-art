# GTA 6 Style Multi-Panel Cover Art Studio

[![Competition](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/c/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/frashid17/gta6-cover-art/rank.svg)](https://make.fun/c/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/frashid17/gta6-cover-art/reward.svg)](https://make.fun/c/gta6-cover-art-01)

An offline, browser-based cover art studio that transforms photos and captions into striking GTA 6-style multi-panel poster art. Built with high-performance Canvas 2D compositing, rich Vice City sunset color grading, cinematic film grain, and bold condensed display typography.

## Features

- **Multi-Panel Layouts**: Dynamic diagonal splits, triptych stacks, and dual cinematic horizons inspired by modern Leonida & Vice City poster art.
- **Per-Panel Photo Controls**: Load one photo across all panels or separate photos per panel. Interactive pan, zoom, and reposition directly on the canvas.
- **Vice City Sunset Grading**: Filmic color grading with deep magenta/coral sunsets, cyan neon edge accents, warm golden-hour skin tones, and rich shadow contrast.
- **Cinematic Atmosphere**: Procedural film grain, radial vignette, and graphic gutters with neon pinstripe dividers.
- **Poster-Scale Typography**: Bold condensed display lettering (Anton & Bebas Neue OFL fonts) with multi-layer outlines, 3D extruded drop shadows, and subtitle chapter badges.
- **Pixel-Exact Exports**: One-click instant PNG export in three standard formats:
  - `1920 × 1080` (Landscape Banner)
  - `1080 × 1350` (Portrait Poster 4:5)
  - `1080 × 1080` (Square Cover 1:1)
- **100% Offline & Private**: Zero network dependencies, zero tracking, all image processing runs locally in browser memory.

## Development & Hand-in

```bash
# Serve locally on http://localhost:8080
node serve.ts

# Hand-in validation & dossier build
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT License. See [LICENSE](file:///Users/divingsquid786/bounty3/gta6-cover-art/LICENSE) for details.
