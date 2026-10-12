// Market Minds shell: hash router, grade-band controls, mobile menu, focus management.
// Views live in js/views/<name>.js and export render(el, params, ctx) → optional cleanup().
import { store } from './store.js';

const ROUTES = {
  '': 'dashboard', learn: 'learn', practice: 'practice', thinking: 'thinking', 'market-lab': 'market-lab',
  test: 'test', progress: 'progress', dictionary: 'dictionary', stories: 'stories', journal: 'journal', parent: 'parent'
};
const TITLES = {
  dashboard: 'Dashboard', learn: 'Learn', practice: 'Practice', thinking: 'Thinking Lab', 'market-lab': 'Market Lab',
  test: 'Test', progress: 'My Progress', dictionary: 'Market Dictionary', stories: 'Market Stories', journal: 'Decision Journal', parent: 'Parent & Teacher View'
};

const viewEl = document.getElementById('view');
let cleanup = null;
let renderId = 0;

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

async function route() {
  const id = ++renderId;
  if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
  stopSpeech();
  let { name, first, params, query } = parseHash();
  if (!name) { location.replace('#/'); return; }
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
  document.title = `${TITLES[name]} | Market Minds`;
  for (const a of document.querySelectorAll('[data-nav]')) {
    if (a.dataset.nav === first) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  }
  closeMenu();
  // Move focus to the new page heading so keyboard and screen-reader users land on the new content.
  const h = viewEl.querySelector('h1');
  if (h) { if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  window.scrollTo(0, 0);
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
  if (store.get().band !== b.dataset.band) {
    store.setBand(b.dataset.band);
    // Re-render so the current page switches to the new grade's text and maths.
    route();
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
syncBand();
window.addEventListener('hashchange', route);
route();

// Test hook (read-only use in browser tests).
window.__mm = { store, go, parseHash };
