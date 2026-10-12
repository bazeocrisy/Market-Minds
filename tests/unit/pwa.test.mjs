// PWA integrity (Lead): manifest fields, icons, and the service worker's precache list/version match the files on disk.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { appFiles, render } from '../../scripts/update-sw.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\r\n/g, '\n');

test('manifest is installable and relative to the GitHub Pages path', () => {
  const m = JSON.parse(read('manifest.webmanifest'));
  assert.equal(m.display, 'standalone');
  assert.equal(m.start_url, './');
  assert.equal(m.scope, './');
  assert.ok(m.name && m.short_name && m.theme_color && m.background_color);
  const sizes = m.icons.map((i) => `${i.sizes}:${i.purpose}`);
  assert.ok(sizes.includes('192x192:any') && sizes.includes('512x512:any') && sizes.includes('512x512:maskable'));
  for (const i of m.icons) {
    assert.ok(!i.src.startsWith('/'), 'icon paths must be relative');
    const buf = fs.readFileSync(path.join(ROOT, i.src));
    assert.equal(buf.toString('hex', 1, 4), '504e47', `${i.src} is a PNG`);
    const [w, h] = [buf.readUInt32BE(16), buf.readUInt32BE(20)];
    assert.equal(`${w}x${h}`, i.sizes, `${i.src} pixel size`);
  }
});

test('sw.js precache list and content-hash version are up to date (run: node scripts/update-sw.mjs)', () => {
  const src = read('sw.js');
  assert.equal(src, render(src), 'sw.js is stale — regenerate it');
  assert.ok(!/CACHE_VERSION = 'dev'/.test(src));
});

test('every precached file exists and every app file is precached', () => {
  const list = [...read('sw.js').matchAll(/^ {2}'\.\/([^']*)'/gm)].map((m) => m[1]).filter(Boolean);
  for (const f of list) assert.ok(fs.existsSync(path.join(ROOT, f)), `missing ${f}`);
  assert.deepEqual(list, appFiles());
});

test('service worker deletes old caches and is network-first', () => {
  const src = read('sw.js');
  assert.match(src, /caches\.delete/);
  assert.match(src, /skipWaiting/);
  assert.match(src, /clients\.claim/);
  assert.ok(src.indexOf('await fetch(req') < src.indexOf('cache.match(req'), 'network is tried before the cache');
});
