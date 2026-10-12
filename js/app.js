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
    if (location.hash && location.hash !== '#/') session.set(AFTER_WELCOME, location.hash);
    location.replace('#/welcome');
    return;
  }
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
    go(next === '#/welcome' ? '#/' : next);
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
const LIVE_VIEWS = new Set(['dashboard', 'progress', 'parent']);
window.addEventListener('storage', (e) => {
  if ((e.key === 'mm.progress.v1' || e.key === null) && LIVE_VIEWS.has(viewEl.dataset.view)) {
    const active = document.activeElement;
    route({ keepScroll: true, keepFocus: active && !viewEl.contains(active) ? active : null });
  }
});
syncBand();
window.addEventListener('hashchange', () => route());
route();

viewEl.addEventListener('animationend', () => viewEl.classList.remove('view-enter'));

// Installable + offline: network-first service worker (see sw.js). Only over http(s), never file://.
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch((e) => console.warn('Offline support unavailable:', e)); });
}

// Test hook (read-only use in browser tests).
window.__mm = { store, go, parseHash };
