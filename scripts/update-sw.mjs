// Regenerates the precache list + cache version inside sw.js from the files on disk.
// The version is a content hash, so ANY change to an app file produces a new cache and old caches are deleted.
// Run after changing app files: node scripts/update-sw.mjs   (tests/unit/pwa.test.mjs fails if you forget)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function appFiles() {
  const walk = (dir) => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((d) => {
    const rel = `${dir}/${d.name}`;
    return d.isDirectory() ? walk(rel) : [rel];
  });
  const files = ['index.html', 'styles.css', 'manifest.webmanifest', 'assets/logo.svg',
    ...walk('assets/icons').filter((f) => f.endsWith('.png')),
    ...walk('js').filter((f) => f.endsWith('.js'))];
  return files.sort();
}

export function contentVersion(files = appFiles()) {
  const h = crypto.createHash('sha256');
  for (const f of files) { h.update(f); h.update(fs.readFileSync(path.join(ROOT, f)).toString('utf8').replace(/\r\n/g, '\n')); }
  return h.digest('hex').slice(0, 12);
}

export function render(src, files = appFiles()) {
  const list = ['./', ...files.map((f) => `./${f}`)].map((f) => `  '${f}'`).join(',\n');
  return src
    .replace(/const CACHE_VERSION = '[^']*';/, `const CACHE_VERSION = '${contentVersion(files)}';`)
    .replace(/const PRECACHE = \[[\s\S]*?\];/, `const PRECACHE = [\n${list}\n];`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const file = path.join(ROOT, 'sw.js');
  const out = render(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n'));
  fs.writeFileSync(file, out);
  console.log(`sw.js: ${appFiles().length + 1} files, version ${contentVersion()}`);
}
