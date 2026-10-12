// Renders the PWA icons from assets/logo.svg with headless Chrome (no dependencies).
// Run: node scripts/make-icons.mjs   → assets/icons/*.png
import fs from 'node:fs';
import path from 'node:path';
import { startBrowser, ROOT } from '../tests/lib/harness.mjs';

const svg = fs.readFileSync(path.join(ROOT, 'assets/logo.svg'), 'utf8');
const logo = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
const OUT = path.join(ROOT, 'assets/icons');
fs.mkdirSync(OUT, { recursive: true });

// any: the rounded logo on transparency. maskable/apple: full-bleed navy with the logo inside the safe zone.
const ICONS = [
  { file: 'icon-192.png', size: 192, bleed: false },
  { file: 'icon-512.png', size: 512, bleed: false },
  { file: 'icon-maskable-512.png', size: 512, bleed: true, scale: 0.72 },
  { file: 'apple-touch-icon.png', size: 180, bleed: true, scale: 0.86 }
];

const b = await startBrowser();
try {
  await b.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  for (const icon of ICONS) {
    const s = icon.size;
    await b.viewport(s, s, false);
    const inner = icon.bleed ? Math.round(s * icon.scale) : s;
    const html = `<!doctype html><html><body style="margin:0;width:${s}px;height:${s}px;display:grid;place-items:center;background:${icon.bleed ? '#102541' : 'transparent'}">
      <img src="${logo}" width="${inner}" height="${inner}" style="display:block"></body></html>`;
    await b.load(`data:text/html;base64,${Buffer.from(html).toString('base64')}`);
    const r = await b.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: s, height: s, scale: 1 } });
    fs.writeFileSync(path.join(OUT, icon.file), Buffer.from(r.result.data, 'base64'));
    console.log('wrote', icon.file);
  }
} finally { b.close(); }
