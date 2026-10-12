// Market Minds service worker: makes the app installable and usable offline without ever pinning an old version.
// - CACHE_VERSION is a content hash written by scripts/update-sw.mjs; a new version deletes every older cache.
// - Network-first for all same-origin GETs: online learners always get the newest files; the cache is only a fallback.
// - Progress lives in localStorage and is never touched here.
const CACHE_VERSION = '5857ccb9841b';
const CACHE = `mm-${CACHE_VERSION}`;
const PRECACHE = [
  './',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-512.png',
  './assets/logo.svg',
  './index.html',
  './js/app.js',
  './js/content/band.js',
  './js/content/glossary.js',
  './js/content/lessons.js',
  './js/content/market-scenarios.js',
  './js/content/skills.js',
  './js/content/stories.js',
  './js/content/thinking.js',
  './js/content/worlds.js',
  './js/engine/check.js',
  './js/engine/format.js',
  './js/engine/generate.js',
  './js/engine/generators/charts.js',
  './js/engine/generators/futures.js',
  './js/engine/generators/futures2.js',
  './js/engine/generators/market.js',
  './js/engine/generators/pools.js',
  './js/engine/generators/prices.js',
  './js/engine/generators/supply.js',
  './js/engine/index.js',
  './js/engine/mastery.js',
  './js/engine/misconceptions.js',
  './js/engine/record.js',
  './js/engine/rng.js',
  './js/engine/session.js',
  './js/engine/test.js',
  './js/lab/chart.js',
  './js/lab/sim.js',
  './js/store.js',
  './js/ui/art.js',
  './js/ui/dom.js',
  './js/ui/question.js',
  './js/ui/speech.js',
  './js/ui/visuals.js',
  './js/ui/vocab.js',
  './js/views/certificates.js',
  './js/views/dashboard.js',
  './js/views/dictionary.js',
  './js/views/journal.js',
  './js/views/learn.js',
  './js/views/market-lab.js',
  './js/views/parent.js',
  './js/views/practice.js',
  './js/views/progress.js',
  './js/views/stories.js',
  './js/views/test.js',
  './js/views/thinking.js',
  './js/views/welcome.js',
  './manifest.webmanifest',
  './styles.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // cache: 'reload' bypasses the HTTP cache so a new version never precaches stale copies.
    await cache.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('mm-') && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;   // never cache cross-origin or writes
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch(req, { cache: 'no-cache' });
      if (res.ok && res.type === 'basic') cache.put(req, res.clone());
      return res;
    } catch {
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      const scopePath = new URL(self.registration.scope).pathname;
      const isAppPage = url.pathname === scopePath || url.pathname === `${scopePath}index.html`;
      if (req.mode === 'navigate' && isAppPage) {
        const shell = await cache.match('./index.html') || await cache.match('./');
        if (shell) return shell;
      }
      return new Response('Offline and not saved yet. Reconnect to load this part of Market Minds.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
