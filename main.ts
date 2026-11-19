// GTA 6 Cover Art hand-in entrypoint (Node 22, standard library only).
// Copies app/ + screenshots/ into the hand-in dir and writes dossier.json for scoring.

import { cpSync, existsSync, mkdirSync, writeFileSync, readdirSync, statSync, readFileSync } from 'node:fs';
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
    const imgPath = join(out, 'screenshots', img);
    const sz = statSync(imgPath).size;
    const ok = sz <= 262144 ? 'OK' : 'EXCEEDED';
    console.log(`  - ${img}: ${sz} bytes (${(sz / 1024).toFixed(1)} KiB) [${ok}]`);
    if (sz > 262144) {
      throw new Error(`Screenshot ${img} exceeds 256 KiB limit: ${sz} bytes`);
    }
    // Pixel dimension check (Node.js only, no external binaries)
    const buffer = readFileSync(imgPath);
    function getDimensions(buf) {
      // PNG detection
      if (buf.slice(0, 8).equals(Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]))) {
        // IHDR chunk starts at byte 8
        const ihdrOffset = 8 + 4 + 4; // length (4) + type (4) = after length and type
        const width = buf.readUInt32BE(ihdrOffset);
        const height = buf.readUInt32BE(ihdrOffset + 4);
        return {width, height};
      }
      // JPEG detection
      if (buf[0] === 0xFF && buf[1] === 0xD8) {
        let offset = 2;
        while (offset < buf.length) {
          if (buf[offset] !== 0xFF) break;
          const marker = buf[offset + 1];
          const length = buf.readUInt16BE(offset + 2);
          if (marker === 0xC0 || marker === 0xC2) { // SOF0 or SOF2
            const height = buf.readUInt16BE(offset + 5);
            const width = buf.readUInt16BE(offset + 7);
            return {width, height};
          }
          offset += 2 + length;
        }
      }
      throw new Error('Unsupported image format or missing dimensions');
    }
    const {width, height} = getDimensions(buffer);
    const longSide = Math.max(width, height);
    const shortSide = Math.min(width, height);
    if (longSide > 1280 || shortSide < 480) {
      throw new Error(`Screenshot ${img} dimensions invalid (long side ${longSide}px, short side ${shortSide}px)`);
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
