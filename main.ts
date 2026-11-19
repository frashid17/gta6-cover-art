// GTA 6 Cover Art hand-in entrypoint (Node 22, standard library only).
// Copies app/ + screenshots/ into the hand-in dir and writes dossier.json for scoring.

import { cpSync, existsSync, mkdirSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

console.log(`[gta6-cover-art] Preparing hand-in outputs at: ${out}`);

// Create output structure
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });

mkdirSync(join(out, 'screenshots'), { recursive: true });
const screenshotsDir = join(here, 'screenshots');
if (existsSync(screenshotsDir)) {
  cpSync(screenshotsDir, join(out, 'screenshots'), { recursive: true });
}

// Verify screenshots exist and comply with size constraints (<= 256 KiB)
if (existsSync(join(out, 'screenshots'))) {
  const images = readdirSync(join(out, 'screenshots')).filter((f) => !f.startsWith('.'));
  console.log(`[gta6-cover-art] Bundling ${images.length} screenshots:`);
  for (const img of images) {
    const sz = statSync(join(out, 'screenshots', img)).size;
    const ok = sz <= 262144 ? 'OK' : 'EXCEEDED';
    console.log(`  - ${img}: ${sz} bytes (${(sz / 1024).toFixed(1)} KiB) [${ok}]`);
    if (sz > 262144) {
      throw new Error(`Screenshot ${img} exceeds 256 KiB limit: ${sz} bytes`);
    }
  }
}

// Generate dossier with makefun scorer constraints
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});

writeFileSync(join(out, 'dossier.json'), dossier);
console.log(`[gta6-cover-art] dossier.json generated (${Buffer.byteLength(dossier)} bytes).`);
