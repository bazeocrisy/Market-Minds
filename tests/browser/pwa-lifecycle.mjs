// PWA lifecycle in a real (headless) Chrome: onboarding + grade persistence, offline notice, publishing a new version
// mid-session (update notice, no mixed versions, safe-point reload on Home, old caches removed, progress kept),
// and the install affordances. Uses its own static server so the test can "publish" a new version.
// Run: node tests/browser/pwa-lifecycle.mjs   (Lead-authored; run on its own — low-memory PC)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { startBrowser, ROOT, BASE } from '../lib/harness.mjs';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const overrides = new Map();   // path under BASE → replacement text (simulates a newly published version)
let down = false;              // simulate a real network failure (connection dropped)
const server = http.createServer((req, res) => {
  if (down) { req.socket.destroy(); return; }
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (!url.startsWith(BASE)) { res.writeHead(404).end(); return; }
  const rel = url.slice(BASE.length) || 'index.html';
  const type = TYPES[path.extname(rel)] || 'application/octet-stream';
  if (overrides.has(rel)) { res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' }).end(overrides.get(rel)); return; }
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const URL = `http://127.0.0.1:${server.address().port}${BASE}`;

const b = await startBrowser();
let pass = 0, fail = 0;
const check = (n, ok, d = '') => { if (ok) pass++; else { fail++; console.log('FAIL', n, d); } };
const q = (e) => b.js(`return ${e};`);
const h1 = () => q(`document.querySelector('#view h1')?.textContent || ''`);
const until = async (expr, ms = 8000) => { for (let t = 0; t < ms; t += 100) { if (await q(expr)) return true; await b.wait(100); } return false; };
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

try {
  await b.viewport(390, 844);
  // ---------------- first launch, grade choice, persistence ----------------
  await b.load(URL);
  check('first launch → onboarding', (await q('location.hash')) === '#/welcome' && (await h1()) === 'Welcome to Market Minds', await h1());
  await b.js(`document.querySelector('#view [data-band="analyst"]').click();`);
  await until(`document.querySelector('#view h1')?.textContent === 'Welcome, Market Analyst!'`);
  check('grade chosen → dashboard for Grades 6–8', (await h1()) === 'Welcome, Market Analyst!', await h1());
  check('service worker controls the page', await until(`!!navigator.serviceWorker.controller`, 10000));
  await b.reload();
  check('reload: grade remembered, no onboarding', (await h1()) === 'Welcome, Market Analyst!' && (await q('location.hash')) !== '#/welcome');
  check('one consistent version: all screens preloaded', await until(`window.__mm.pwa.preloaded === true`));
  // progress made before the update
  await b.js(`location.hash = '#/learn/w1l1/3';`); await b.wait(500);
  const before = await q(`JSON.stringify(window.__mm.store.get().lessons)`);
  check('lesson step saved', JSON.parse(before).w1l1?.step === 3, before);

  // ---------------- offline notice ----------------
  await b.send('Network.enable');
  await b.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  check('offline: notice shown', await until(`!document.getElementById('appStatus').hidden && document.getElementById('appStatus').dataset.kind === 'offline'`, 3000),
    await q(`document.getElementById('appStatus').outerHTML`));
  check('offline: notice says progress still saves', /progress still saves/.test(await q(`document.getElementById('appStatus').textContent`)));
  await b.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  check('back online: notice hidden', await until(`document.getElementById('appStatus').hidden`, 3000));

  // ---------------- publish a new version mid-session ----------------
  const oldCaches = await b.js(`return caches.keys();`);
  const sw = read('sw.js').replace(/const CACHE_VERSION = '[^']*';/, "const CACHE_VERSION = 'testnewversion';");
  overrides.set('sw.js', sw);
  // the new version changes a screen the learner has NOT opened yet this session
  overrides.set('js/views/dictionary.js', read('js/views/dictionary.js').replace("title: 'Market words'", "title: 'Market words v2'"));
  await b.js(`(await navigator.serviceWorker.getRegistration()).update();`);
  check('update detected: notice offers Refresh now', await until(`window.__mm.pwa.updateReady && document.getElementById('appStatus').dataset.kind === 'update' && !!document.querySelector('#appStatus [data-action="apply-update"]')`, 15000),
    await q(`document.getElementById('appStatus').outerHTML`));
  check('new cache created, old caches deleted', await until(`(async () => { const k = await caches.keys(); return k.includes('mm-testnewversion') && !k.some((x) => x.startsWith('mm-') && x !== 'mm-testnewversion'); })()`, 8000),
    JSON.stringify({ oldCaches, now: await b.js('return caches.keys();') }));
  // no mixed versions: the running session keeps the screens it preloaded
  await b.js(`location.hash = '#/dictionary';`); await b.wait(500);
  check('no mixed versions: running session still shows the version it started with', (await h1()) === 'Market words', await h1());
  // a practice session is not interrupted by the update
  await b.js(`location.hash = '#/practice';`); await b.wait(400);
  check('practice still opens normally before going Home', (await h1()) !== '' && (await q('location.hash')) === '#/practice', await h1());
  // safe point: going Home loads the new version
  const loadsBefore = await q('performance.getEntriesByType("navigation").length');
  await b.navigate(`location.hash = '#/';`);
  check('going Home reloads into the new version (notice gone)', await until(`!window.__mm.pwa.updateReady && document.getElementById('appStatus').hidden`, 8000));
  await b.js(`location.hash = '#/dictionary';`); await b.wait(500);
  check('after reload: new version is in use', (await h1()) === 'Market words v2', await h1());
  const after = await q(`JSON.stringify(window.__mm.store.get().lessons)`);
  check('progress kept across the update', after === before, `${before} vs ${after}`);
  check('grade kept across the update', (await q('window.__mm.store.get().band')) === 'analyst');
  void loadsBefore;

  // ---------------- offline after the update: the NEW version is what's cached ----------------
  down = true;
  await b.reload();
  await b.js(`location.hash = '#/dictionary';`); await b.wait(600);
  check('offline after update: app opens from cache', (await h1()) === 'Market words v2', await h1());
  await b.js(`location.hash = '#/learn/w1l1/3';`); await b.wait(600);
  check('offline: saved lesson step opens', (await h1()) === 'What Is a Market?', await h1());
  down = false;
  overrides.clear();

  // ---------------- install affordances ----------------
  // Chrome itself decides the app is installable and fires a REAL beforeinstallprompt.
  await b.load(URL);
  check('Chrome fires a real install prompt (app is installable)', await until(`window.__mm.pwa.installable === true`, 8000));
  check('real install prompt → Install button shown in More', await q(`!document.getElementById('installBlock').hidden && !document.getElementById('installApp').hidden && document.getElementById('installHelpIos').hidden`));
  // Clicking must call prompt(); a stub event stands in so the test never opens a native dialog.
  await b.js(`const e = new Event('beforeinstallprompt', { cancelable: true }); e.prompt = () => { window.__prompted = true; return Promise.resolve(); }; e.userChoice = Promise.resolve({ outcome: 'accepted' }); window.dispatchEvent(e);`);
  await b.js(`document.getElementById('installApp').click();`); await b.wait(200);
  check('Install button opens the browser install prompt', await q('window.__prompted === true'));
  await b.js(`window.dispatchEvent(new Event('appinstalled'));`); await b.wait(100);
  check('after install: "installed" note shown, button hidden', await q(`!document.getElementById('installDone').hidden && document.getElementById('installApp').hidden`));
  // iPhone/iPad Safari never fires beforeinstallprompt: suppress Chrome's so the iOS path is what runs.
  await b.send('Page.addScriptToEvaluateOnNewDocument', { source: `window.addEventListener('beforeinstallprompt', (e) => e.stopImmediatePropagation(), true);` });
  await b.send('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1', platform: 'iPhone' });
  await b.load(URL); await b.wait(300);
  check('iPhone: Add to Home Screen instructions shown', await q(`!document.getElementById('installBlock').hidden && !document.getElementById('installHelpIos').hidden && document.getElementById('installApp').hidden`));
  check('no console errors', b.errors.length === 0, b.errors.join(' | '));
} catch (e) {
  check('pwa-lifecycle script ran to completion', false, String(e && e.stack || e));
} finally { b.close(); server.close(); }
console.log(`pwa-lifecycle: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
