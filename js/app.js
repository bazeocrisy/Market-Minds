// Market Minds app shell: hash router, first-launch onboarding gate, screen transitions, grade-band controls,
// More menu, focus management and service-worker registration (installable, offline-capable PWA).
// Views live in js/views/<name>.js and export render(el, params, ctx) → optional cleanup().
import { store } from './store.js';

const ROUTES = {
  welcome: 'welcome', '': 'dashboard', learn: 'learn', practice: 'practice', thinking: 'thinking', 'market-lab': 'market-lab',
  test: 'test', progress: 'progress', dictionary: 'dictionary', stories: 'stories', journal: 'journal', parent: 'parent', certificates: 'certificates'
};
const TITLES = {
  welcome: 'Welcome', dashboard: 'Dashboard', learn: 'Learn', practice: 'Practice', thinking: 'Thinking Lab', 'market-lab': 'Market Lab',
  test: 'Test', progress: 'My Progress', dictionary: 'Market Dictionary', stories: 'Market Stories', journal: 'Decision Journal', parent: 'Parent & Teacher View', certificates: 'Certificates'
};

const viewEl = document.getElementById('view');
let cleanup = null;
let renderId = 0;
// PWA state (declared before the first route() call, which reads it).
// Screens that can hold unfinished work report it via pendingWork() → null | { kind, label, resume }.
const WORK_VIEWS = ['practice', 'test', 'journal', 'thinking', 'learn'];
/** Everything unfinished right now (an active practice session, a test in progress, unsaved drafts). */
async function pendingWork() {
  const found = [];
  for (const n of WORK_VIEWS) {
    try {
      const m = await import(`./views/${n}.js`);
      const w = typeof m.pendingWork === 'function' ? m.pendingWork() : null;
      if (w) found.push(w);
    } catch { /* a screen that failed to load holds no work */ }
  }
  return found;
}
const pwa = { updateReady: false, online: navigator.onLine !== false, preloaded: false, installable: false, installed: false, persisted: null };
const AFTER_WELCOME = 'mm.afterWelcome';   // where a first-time learner was heading (sessionStorage)
const session = {
  get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch { /* ignore */ } }
};

export function parseHash(hash = location.hash) {
  const raw = hash.replace(/^#\/?/, '');
  const [path, qs = ''] = raw.split('?');
  const segs = path.split('/').filter(Boolean).map(decodeURIComponent);
  return { name: ROUTES[segs[0] || ''], first: segs[0] || '', params: segs.slice(1), query: Object.fromEntries(new URLSearchParams(qs)) };
}

export function go(hash) {
  if (location.hash === hash) route(); else location.hash = hash;
}

function stopSpeech() { try { globalThis.speechSynthesis?.cancel(); } catch { /* unsupported */ } }

async function route(opts = {}) {
  const id = ++renderId;
  if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
  stopSpeech();
  let { name, first, params, query } = parseHash();
  if (!name) { location.replace('#/'); return; }
  // App-first launch: until a grade is chosen, every route opens the onboarding screen.
  if (!store.get().band && name !== 'welcome') {
    // Remember only THIS launch's destination (a plain launch clears any older one).
    session.set(AFTER_WELCOME, location.hash && location.hash !== '#/' ? location.hash : null);
    location.replace('#/welcome');
    return;
  }
  if (pwa.updateReady && name === 'dashboard' && !opts.initial && (await pendingWork()).length === 0) { location.reload(); return; }
  if (id !== renderId) return;
  document.documentElement.dataset.route = name;
  let mod;
  try { mod = await import(`./views/${name}.js`); } catch (e) {
    console.error(e);
    if (id !== renderId) return;
    viewEl.innerHTML = '<section class="page"><h1 tabindex="-1">This page could not load</h1><p>Please refresh, or <a href="#/">go back to the dashboard</a>.</p></section>';
    return;
  }
  if (id !== renderId) return;   // a newer navigation started while this one loaded
  viewEl.innerHTML = '';
  viewEl.dataset.view = name;
  const ctx = { store, get band() { return store.get().band || 'explorer'; }, go, query };
  cleanup = mod.render(viewEl, params, ctx) || null;
  // Short screen transition (CSS disables it under prefers-reduced-motion).
  viewEl.classList.remove('view-enter');
  void viewEl.offsetWidth;
  viewEl.classList.add('view-enter');
  document.title = `${TITLES[name]} | Market Minds`;
  for (const a of document.querySelectorAll('[data-nav]')) {
    if (a.dataset.nav === first) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  }
  closeMenu();
  // Move focus to the new page heading so keyboard and screen-reader users land on the new content.
  const h = viewEl.querySelector('h1');
  if (opts.keepFocus?.isConnected) { opts.keepFocus.focus(); return; }
  if (h) { if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  if (!opts.keepScroll) window.scrollTo(0, 0);
}

// ---------- grade band controls: any [data-band] button ----------
function syncBand() {
  const band = store.get().band;
  for (const b of document.querySelectorAll('[data-band]')) b.setAttribute('aria-pressed', String(b.dataset.band === band));
  document.documentElement.dataset.band = band || 'none';
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-band]');
  if (!b) return;
  if (viewEl.dataset.view === 'welcome') {
    // Onboarding finished: continue to where the learner was heading, else the dashboard.
    store.setBand(b.dataset.band);
    const next = session.get(AFTER_WELCOME) || '#/';
    session.set(AFTER_WELCOME, null);
    location.replace(next === '#/welcome' ? '#/' : next);
    return;
  }
  if (store.get().band !== b.dataset.band) {
    store.setBand(b.dataset.band);
    // Re-render so the current page switches to the new grade's text and maths,
    // but keep keyboard focus on the grade button the learner just pressed.
    route({ keepFocus: b });
  }
});

// ---------- mobile menu ----------
const toggle = document.getElementById('menuToggle');
const nav = document.getElementById('siteNav');
function closeMenu() { if (toggle) { toggle.setAttribute('aria-expanded', 'false'); nav?.classList.remove('open'); } }
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  nav?.classList.toggle('open', open);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); } });

store.subscribe(syncBand);
// Progress saved in another tab: refresh read-only summary pages so they never show stale numbers.
// (Pages with work in progress — lessons, practice, tests — are left alone.)
const LIVE_VIEWS = new Set(['dashboard', 'progress', 'parent', 'certificates']);
window.addEventListener('storage', (e) => {
  if ((e.key === 'mm.progress.v1' || e.key === null) && LIVE_VIEWS.has(viewEl.dataset.view)) {
    const active = document.activeElement;
    route({ keepScroll: true, keepFocus: active && !viewEl.contains(active) ? active : null });
  }
});
syncBand();
window.addEventListener('hashchange', () => route());
route({ initial: true }).then(preloadViews);

viewEl.addEventListener('animationend', () => viewEl.classList.remove('view-enter'));

// ---------- PWA: one consistent version per session, update notice, offline notice, install, storage ----------
const VIEW_NAMES = [...new Set(Object.values(ROUTES))];

/**
 * Load every screen module once the first screen is up. ES modules are cached per page, so the whole session then
 * runs one consistent version even if a newer version is published (or fetched by the service worker) mid-session.
 */
function preloadViews() {
  const run = () => Promise.allSettled(VIEW_NAMES.map((n) => import(`./views/${n}.js`))).then(() => { pwa.preloaded = true; });
  if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 2000 }); else setTimeout(run, 300);
}

const statusEl = document.getElementById('appStatus');
const joinLabels = (ws) => ws.map((w) => w.label).filter((v, i, a) => a.indexOf(v) === i).join(' and ');
async function paintStatus() {
  if (!statusEl) return;
  const pending = pwa.updateReady ? await pendingWork() : [];
  statusEl.replaceChildren();
  let kind = null;
  if (pwa.updateReady) {
    kind = 'update';
    const msg = document.createElement('span');
    if (pending.length) {
      // Never interrupt: no refresh button until the unfinished work is done.
      msg.textContent = `A new version of Market Minds is ready. It will load after you finish ${joinLabels(pending)} — nothing you're doing will be lost.`;
      statusEl.append(msg);
    } else {
      msg.textContent = 'A new version of Market Minds is ready. It will load next time you go Home.';
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'btn btn-sm'; btn.dataset.action = 'apply-update'; btn.textContent = 'Refresh now';
      statusEl.append(msg, ' ', btn);
    }
  } else if (!pwa.online) {
    kind = 'offline';
    const msg = document.createElement('span');
    msg.textContent = 'You’re offline — lessons you’ve opened still work and your progress still saves.';
    statusEl.append(msg);
  }
  statusEl.hidden = !kind;
  if (kind) statusEl.dataset.kind = kind; else delete statusEl.dataset.kind;
}
document.addEventListener('click', async (e) => {
  if (!e.target.closest('[data-action="apply-update"]')) return;
  // Re-check at the moment of the tap: if work started since the notice appeared, don't reload.
  if ((await pendingWork()).length) { paintStatus(); return; }
  location.reload();
});
document.addEventListener('mm:work-changed', () => { if (pwa.updateReady) paintStatus(); });
window.addEventListener('online', () => { pwa.online = true; paintStatus(); });
window.addEventListener('offline', () => { pwa.online = false; paintStatus(); });

// Install: Chromium's install prompt behind our own button; iPhone/iPad get Add to Home Screen instructions.
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let deferredInstall = null;
function paintInstall() {
  const block = document.getElementById('installBlock');
  if (!block) return;
  const show = (id, on) => { const el = document.getElementById(id); if (el) el.hidden = !on; };
  pwa.installed = pwa.installed || isStandalone();
  show('installDone', pwa.installed);
  show('installApp', !pwa.installed && !!deferredInstall);
  show('installHelpIos', !pwa.installed && !deferredInstall && isIos);
  block.hidden = !(pwa.installed || deferredInstall || isIos);
}
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; pwa.installable = true; paintInstall(); });
window.addEventListener('appinstalled', () => { deferredInstall = null; pwa.installed = true; paintInstall(); });
document.getElementById('installApp')?.addEventListener('click', async () => {
  if (!deferredInstall) return;
  const prompt = deferredInstall; deferredInstall = null;
  try { await prompt.prompt(); await prompt.userChoice; } catch { /* dismissed or unsupported */ }
  paintInstall();
});

// Installed app: ask the browser to keep this device's progress (Chromium grants this quietly for installed apps).
async function keepProgress() {
  try {
    if (!navigator.storage?.persist) return;
    pwa.persisted = await navigator.storage.persisted();
    if (!pwa.persisted && isStandalone()) pwa.persisted = await navigator.storage.persist();
  } catch { /* unsupported */ }
}

// Network-first service worker (see sw.js). Only over http(s), never file://.
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // The first install also fires this; only a REPLACED worker means a new version.
    if (hadController) { pwa.updateReady = true; paintStatus(); }
  });
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js');
      const check = () => reg.update().catch(() => {});
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
      setInterval(check, 30 * 60 * 1000);
    } catch (e) { console.warn('Offline support unavailable:', e); }
  });
}
paintStatus();
paintInstall();
keepProgress();

// Test hook (read-only use in browser tests).
window.__mm = { store, go, parseHash, pwa, pendingWork, paintStatus };
