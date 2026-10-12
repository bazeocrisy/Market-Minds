// PWA: manifest + icons, Chrome installability (CDP), service-worker registration/scope/precache, offline use,
// and version updates (old caches deleted, new content served, progress kept).
//
// Uses its own static server (same /Market-Minds/ layout as tests/lib/harness.mjs) with two test switches:
//   net.offline = true   → every request's socket is destroyed (a real network failure, not a 503), so the
//                          service worker's fetch() rejects exactly as it would with no connection;
//   net.override[path]   → serve this text instead of the file (used to publish a "new version" of sw.js
//                          and index.html without touching the repo).
// Chrome's own offline emulation (Network.emulateNetworkConditions) is ALSO exercised and reported, because it is
// attached to the page target only and may not cover the service worker's own network requests.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { startBrowser, BASE, ROOT } from '../lib/harness.mjs';
import * as L from './qa-lib.mjs';

const C = L.counter('pwa');
const check = C.check;
const info = [];
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.md': 'text/markdown' };

const net = { offline: false, override: {}, hits: [], missing: [] };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  net.hits.push(url);
  if (net.offline) { req.socket.destroy(); return; }
  if (!url.startsWith(BASE)) { if (!url.endsWith('favicon.ico')) net.missing.push(url); res.writeHead(404).end(); return; }
  let rel = url.slice(BASE.length) || 'index.html';
  if (rel.endsWith('/')) rel += 'index.html';
  const headers = (f) => ({ 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  if (net.override[rel] != null) { res.writeHead(200, headers(rel)); res.end(net.override[rel]); return; }
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { net.missing.push(url); res.writeHead(404).end(); return; }
  res.writeHead(200, headers(file));
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;
const URL = ORIGIN + BASE;

const b = await startBrowser();
const q = (e) => b.js(`return ${e};`);
const text = (sel) => L.text(b, sel);
const state = () => b.js('return JSON.parse(JSON.stringify(window.__mm.store.get()));');

const swSrc = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const CACHE_VERSION = /const CACHE_VERSION = '([^']+)'/.exec(swSrc)?.[1];
const PRECACHE = [...swSrc.matchAll(/^ {2}'(\.\/[^']*)'/gm)].map((m) => m[1]);
const pngSize = (f) => { const buf = fs.readFileSync(path.join(ROOT, f)); return `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`; };

async function swReady(ms = 15000) {
  return b.js(`const t0 = Date.now();
    const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((r) => setTimeout(() => r(null), ${ms}))]);
    if (!reg) return null;
    while (reg.active && reg.active.state !== 'activated' && Date.now() - t0 < ${ms}) await new Promise((r) => setTimeout(r, 100));
    return { scope: reg.scope, state: reg.active && reg.active.state, script: reg.active && reg.active.scriptURL, controlled: !!navigator.serviceWorker.controller };`);
}
const cacheKeys = () => b.js('return await caches.keys();');
// A real new document (b.load to the same URL + hash would only be a same-document hash change).
const hardLoad = async (url) => { await b.load('about:blank'); await b.load(url); };

try {
  await b.send('DOM.enable');
  await b.send('Network.enable');
  await b.viewport(375, 812);
  check('sw.js has a content-hash CACHE_VERSION and a PRECACHE list', !!CACHE_VERSION && PRECACHE.length > 40, `${CACHE_VERSION} ${PRECACHE.length}`);

  // ================================================================ 1. manifest + icons
  await L.seed(b, URL, { version: 1, band: 'explorer' });
  const link = await q(`(() => { const l = document.querySelector('link[rel="manifest"]'); return l ? { href: l.href, attr: l.getAttribute('href') } : null; })()`);
  check('manifest <link> present with a relative href', link && link.attr === './manifest.webmanifest' && link.href === URL + 'manifest.webmanifest', JSON.stringify(link));
  const mf = await b.js(`const r = await fetch(${JSON.stringify(URL + 'manifest.webmanifest')}); return { status: r.status, type: r.headers.get('content-type'), body: await r.text() };`);
  check('manifest fetchable (200)', mf.status === 200, String(mf.status));
  check('manifest served as application/manifest+json', /application\/manifest\+json/.test(mf.type || ''), mf.type);
  let M = {};
  try { M = JSON.parse(mf.body); check('manifest is valid JSON', true); } catch (e) { check('manifest is valid JSON', false, e.message); }
  check('manifest name / short_name', M.name === 'Market Minds' && !!M.short_name && M.short_name.length <= 12, `${M.name} / ${M.short_name}`);
  check('manifest display: standalone', M.display === 'standalone', M.display);
  check('manifest start_url ./', M.start_url === './', M.start_url);
  check('manifest scope ./', M.scope === './', M.scope);
  check('manifest theme_color matches <meta name=theme-color>', !!M.theme_color && M.theme_color.toLowerCase() === (await q(`document.querySelector('meta[name="theme-color"]')?.content`) || '').toLowerCase(), `${M.theme_color} vs ${await q(`document.querySelector('meta[name="theme-color"]')?.content`)}`);
  check('manifest background_color', /^#[0-9a-f]{6}$/i.test(M.background_color || ''), M.background_color);
  const want = [['192x192', 'any'], ['512x512', 'any'], ['512x512', 'maskable']];
  for (const [size, purpose] of want) {
    const ic = (M.icons || []).find((i) => i.sizes === size && (i.purpose || 'any').split(' ').includes(purpose));
    check(`manifest icon ${size} ${purpose} declared`, !!ic, JSON.stringify(M.icons));
    if (!ic) continue;
    const abs = new globalThis.URL(ic.src, URL + 'manifest.webmanifest').href;
    const img = await b.js(`return await new Promise((res) => { const i = new Image(); i.onload = () => res({ ok: true, w: i.naturalWidth, h: i.naturalHeight }); i.onerror = () => res({ ok: false }); i.src = ${JSON.stringify(abs)}; });`);
    check(`icon ${ic.src} loads in the browser`, img.ok, JSON.stringify(img));
    check(`icon ${ic.src} is really ${size} pixels (browser)`, `${img.w}x${img.h}` === size, `${img.w}x${img.h}`);
    check(`icon ${ic.src} is really ${size} pixels (PNG header)`, pngSize(ic.src) === size, pngSize(ic.src));
    check(`icon ${ic.src} type image/png`, ic.type === 'image/png', ic.type);
  }
  const apple = await q(`document.querySelector('link[rel="apple-touch-icon"]')?.href`);
  const appleImg = await b.js(`return await new Promise((res) => { const i = new Image(); i.onload = () => res({ ok: true, w: i.naturalWidth, h: i.naturalHeight }); i.onerror = () => res({ ok: false }); i.src = ${JSON.stringify(apple || '')}; });`);
  check('apple-touch-icon 180×180 loads', appleImg.ok && appleImg.w === 180 && appleImg.h === 180, JSON.stringify(appleImg));
  check('apple-mobile-web-app meta present', await q(`!!document.querySelector('meta[name="apple-mobile-web-app-capable"]') && !!document.querySelector('meta[name="apple-mobile-web-app-title"]')`));

  // ================================================================ 2. service worker
  const sw = await swReady();
  check('service worker registers and reaches "activated"', sw && sw.state === 'activated', JSON.stringify(sw));
  check('service worker scope ends with /Market-Minds/', sw && sw.scope.endsWith('/Market-Minds/') && sw.scope === URL, sw?.scope);
  check('service worker script is ./sw.js under the app path', sw && sw.script === URL + 'sw.js', sw?.script);
  check('page is controlled after activation (clients.claim)', (await q('!!navigator.serviceWorker.controller')), JSON.stringify(sw));
  const keys = await cacheKeys();
  check(`exactly one app cache mm-${CACHE_VERSION}`, JSON.stringify(keys.filter((k) => k.startsWith('mm-'))) === JSON.stringify([`mm-${CACHE_VERSION}`]), JSON.stringify(keys));
  const cached = await b.js(`const c = await caches.open(${JSON.stringify('mm-' + CACHE_VERSION)}); return (await c.keys()).map((r) => r.url);`);
  const missingPre = PRECACHE.filter((p) => !cached.includes(new globalThis.URL(p, URL).href));
  check(`cache holds every PRECACHE entry (${PRECACHE.length})`, missingPre.length === 0, missingPre.join(', '));
  check('cache holds only same-origin URLs', cached.every((u) => u.startsWith(ORIGIN)), cached.filter((u) => !u.startsWith(ORIGIN)).join(', '));

  // ================================================================ 3. installability (Chrome's own verdict)
  await b.reload();
  const inst = await b.send('Page.getInstallabilityErrors');
  const instErrs = inst.result?.installabilityErrors;
  info.push(`Page.getInstallabilityErrors → ${JSON.stringify(inst.result ?? inst.error)}`);
  check('Page.getInstallabilityErrors returns no errors', Array.isArray(instErrs) && instErrs.length === 0, JSON.stringify(inst.result ?? inst.error));
  const am = await b.send('Page.getAppManifest');
  info.push(`Page.getAppManifest → url ${am.result?.url}, errors ${JSON.stringify(am.result?.errors)}`);
  check('Page.getAppManifest: Chrome parsed the manifest with no errors', am.result && am.result.url === URL + 'manifest.webmanifest' && (am.result.errors || []).length === 0, JSON.stringify({ url: am.result?.url, errors: am.result?.errors, err: am.error }));

  // ================================================================ 4. offline — Chrome's emulation (page target)
  // Store a little progress first so we can prove it survives everything below.
  await L.route(b, '#/learn/w1l1/1');
  await b.js(`document.querySelector('#view nav.lesson-nav a.btn-primary').click();`); await b.wait(300);
  const progressBefore = await q(`localStorage.getItem('mm.progress.v1')`);
  net.hits = [];
  await b.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await b.send('Network.setCacheDisabled', { cacheDisabled: true });
  await b.load(URL + '#/');
  const emuH1 = await text('#view h1');
  const emuHits = net.hits.length;
  info.push(`Network.emulateNetworkConditions offline: page rendered h1 "${emuH1}"; the server still received ${emuHits} request(s) from the service worker during "offline" (${net.hits.slice(0, 4).join(', ')})`);
  check('emulated offline: app shell renders (served by the service worker)', /^Welcome, Market/.test(emuH1 || ''), emuH1);
  await b.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await b.send('Network.setCacheDisabled', { cacheDisabled: false });

  // ================================================================ 5. offline — real network failure (server drops every connection)
  await L.addInit(b, L.CAPTURE_SRC);
  await b.load(URL + '#/');            // online load with question capture installed
  net.offline = true; net.hits = [];
  const errs0 = b.errors.length;
  await b.reload();
  check('offline (network down): server really refused (requests were attempted)', net.hits.length > 0, String(net.hits.length));
  check('offline: app shell renders after reload', (await q(`!!document.querySelector('.app-bar') && getComputedStyle(document.querySelector('.app-bar')).display !== 'none'`)) && /^Welcome, Market/.test((await text('#view h1')) || ''), await text('#view h1'));
  check('offline: tab bar present', await q(`[...document.querySelectorAll('.app-tabs a')].filter((a) => a.getBoundingClientRect().width > 0).length === 5`));
  check('offline: progress still there', (await q(`localStorage.getItem('mm.progress.v1')`)) === progressBefore);
  await L.route(b, '#/learn/w1l1/1', 600);
  check('offline: World 1 lesson opens', (await text('#view h1')) === 'What Is a Market?', await text('#view h1'));
  await L.route(b, '#/learn/w4l2/3', 600);
  check('offline: World 4 candlestick lesson step opens with its chart', (await text('#view h1')) === 'Candlesticks: Open, High, Low, Close' && (await q(`!!document.querySelector('#view figure.mm-visual--candles svg')`)), await text('#view h1'));
  await L.route(b, '#/practice', 600);
  await L.helpers(b);
  await b.js(`[...document.querySelectorAll('#view button')].find((x) => x.textContent === 'Mixed Review').click();`); await b.wait(600);
  const qOff = await b.js(`const root = document.querySelector('#view .lesson-step'); const qq = root && __qh.find(root); return qq ? { skill: qq.skill, prompt: __qh.plain(qq.prompt) } : null;`);
  check('offline: Practice generates a question', !!qOff && (await q(`!!document.querySelector('#view .q-prompt')`)), await text('#view'));
  if (qOff) {
    const before = (await state()).skills[qOff.skill]?.independent?.attempts || 0;
    await b.js(`const root = document.querySelector('#view .lesson-step'); const qq = __qh.find(root); __qh.fill(root, qq, __qh.rightResponse(qq)); __qh.btn(root, /^Check$/).click();`);
    await b.wait(300);
    check('offline: answer is checked', /is-correct/.test(await q(`document.querySelector('#view .lesson-step .feedback').className`)));
    const saved = JSON.parse(await q(`localStorage.getItem('mm.progress.v1')`));
    check('offline: progress saves to the device', (saved.skills?.[qOff.skill]?.independent?.attempts || 0) === before + 1, JSON.stringify(saved.skills?.[qOff.skill]));
  }
  // a file that was never precached
  const nf = await b.js(`try { const r = await fetch('./README.md'); return { status: r.status, type: r.headers.get('content-type'), body: await r.text() }; } catch (e) { return { threw: String(e) }; }`);
  info.push(`offline fetch of never-precached ./README.md → ${JSON.stringify(nf)}`);
  check('offline: a never-precached file gets the plain offline message (503), not a crash', nf.status === 503 && /Offline and not saved yet/.test(nf.body) && /text\/plain/.test(nf.type), JSON.stringify(nf));
  check('offline: no JS errors so far', b.errors.length === errs0, b.errors.slice(errs0).join(' | '));
  // never-precached navigations
  await b.load(URL + 'README.md');
  const navTop = await b.js(`return { title: document.title, h1: document.querySelector('#view h1')?.textContent || null, text: document.body.innerText.slice(0, 120) };`);
  info.push(`offline navigation to never-precached /Market-Minds/README.md → title "${navTop.title}", h1 "${navTop.h1}"`);
  check('offline: navigating to a never-precached non-app page shows the honest offline message (not an empty app shell, not a browser error page)', /Offline and not saved yet/.test(navTop.text) && !navTop.h1, JSON.stringify(navTop));
  await b.load(URL + 'docs/never-cached.html');
  const navDeep = await b.js(`return { title: document.title, h1: document.querySelector('h1')?.textContent || null, text: document.body.innerText.replace(/\\s+/g, ' ').slice(0, 160) };`);
  info.push(`offline navigation to never-precached /Market-Minds/docs/never-cached.html → ${JSON.stringify(navDeep)}`);
  check('offline: a never-precached page in a sub-folder shows something readable (not a blank page)', !!navDeep.h1 || /offline/i.test(navDeep.text), JSON.stringify(navDeep));
  net.offline = false;

  // ================================================================ 6. online is network-first (no stale copies)
  await hardLoad(URL + '#/');
  net.override['index.html'] = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').replace('<title>Market Minds</title>', '<title>Market Minds</title>\n  <meta name="qa-build" content="network-first-check">');
  await hardLoad(URL + '#/');
  check('online: a changed index.html is served immediately (network-first, same SW version)', (await q(`document.querySelector('meta[name="qa-build"]')?.content`)) === 'network-first-check');
  delete net.override['index.html'];
  await hardLoad(URL + '#/');

  // ================================================================ 7. update to a new version
  await b.js(`await (await caches.open('mm-qa-stale-old')).put('./qa-stale', new Response('old')); await (await caches.open('qa-unrelated')).put('./x', new Response('x'));`);
  check('setup: an extra stale mm- cache exists', (await cacheKeys()).includes('mm-qa-stale-old'));
  const progressBeforeUpdate = await q(`localStorage.getItem('mm.progress.v1')`);
  const NEWV = 'qa0update0v2';
  net.override['sw.js'] = swSrc.replace(`const CACHE_VERSION = '${CACHE_VERSION}'`, `const CACHE_VERSION = '${NEWV}'`);
  net.override['index.html'] = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').replace('<title>Market Minds</title>', '<title>Market Minds</title>\n  <meta name="qa-build" content="v2">');
  check('setup: the new sw.js differs only in CACHE_VERSION', net.override['sw.js'] !== swSrc && net.override['sw.js'].includes(NEWV));
  const upd = await b.js(`const reg = await navigator.serviceWorker.getRegistration();
    let changed = false; navigator.serviceWorker.addEventListener('controllerchange', () => { changed = true; });
    await reg.update();
    const t0 = Date.now();
    while (Date.now() - t0 < 15000) {
      const k = await caches.keys();
      if (k.includes('mm-${NEWV}') && !k.includes('mm-${CACHE_VERSION}') && reg.active && reg.active.state === 'activated' && !reg.waiting && !reg.installing) break;
      await new Promise((r) => setTimeout(r, 150));
    }
    return { keys: await caches.keys(), changed, active: reg.active && reg.active.state, waiting: !!reg.waiting, ms: Date.now() - t0 };`);
  info.push(`update: ${JSON.stringify(upd)}`);
  check('update: new worker activates without waiting (skipWaiting)', upd.active === 'activated' && !upd.waiting, JSON.stringify(upd));
  check('update: page switches to the new worker (controllerchange)', upd.changed, JSON.stringify(upd));
  check(`update: new cache mm-${NEWV} created`, upd.keys.includes(`mm-${NEWV}`), JSON.stringify(upd.keys));
  check('update: previous version cache deleted', !upd.keys.includes(`mm-${CACHE_VERSION}`), JSON.stringify(upd.keys));
  check('update: every other old mm- cache deleted', upd.keys.filter((k) => k.startsWith('mm-')).length === 1, JSON.stringify(upd.keys));
  check('update: caches that are not Market Minds caches are left alone', upd.keys.includes('qa-unrelated'), JSON.stringify(upd.keys));
  const newCached = await b.js(`const c = await caches.open('mm-${NEWV}'); return (await c.keys()).map((r) => r.url);`);
  check('update: new cache holds every PRECACHE entry', PRECACHE.every((p) => newCached.includes(new globalThis.URL(p, URL).href)), PRECACHE.filter((p) => !newCached.includes(new globalThis.URL(p, URL).href)).join(', '));
  await hardLoad(URL + '#/');
  check('update: new content served online', (await q(`document.querySelector('meta[name="qa-build"]')?.content`)) === 'v2');
  check('update: progress (localStorage) survives the update', (await q(`localStorage.getItem('mm.progress.v1')`)) === progressBeforeUpdate);
  net.offline = true;
  await b.reload();
  check('update: offline after the update serves the NEW version (never the old one)', (await q(`document.querySelector('meta[name="qa-build"]')?.content`)) === 'v2' && /^Welcome, Market/.test((await text('#view h1')) || ''), `${await q(`document.querySelector('meta[name="qa-build"]')?.content`)} ${await text('#view h1')}`);
  check('update: progress still there offline', (await q(`localStorage.getItem('mm.progress.v1')`)) === progressBeforeUpdate);
  net.offline = false;

  // ================================================================ 8. registration rules
  check('service worker is registered from app.js only over http(s)', /serviceWorker\.register\('\.\/sw\.js'\)/.test(fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8')) && /https\?:/.test(fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8')));
  check('no 404s for app files', net.missing.filter((u) => !/README\.md|never-cached/.test(u)).length === 0, net.missing.join(', '));
} catch (e) {
  check('pwa script ran to completion', false, e.stack);
} finally { b.close(); server.close(); }
for (const i of info) console.log('info:', i);
process.exit(C.done());
