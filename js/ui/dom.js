// Shared DOM helpers for views (Agent 3). No learning logic lives here.
//   h(tag, props, ...children)   tiny element builder
//   openModal / confirmDialog    accessible <dialog> (focus trap, Esc, focus return)
//   pageHead, notice, chip, progressBar, statBox, linkBtn, btn
//   content lookups: worldOf, lessonsInWorld, readyLessons, skillName, worldNum, paragraphs
import { LESSONS, lessonById } from '../content/lessons.js';
import { WORLDS } from '../content/worlds.js';
import { SKILLS } from '../content/skills.js';
import { pick } from '../content/band.js';

// ---------- element builder ----------
/**
 * h('button', { class: 'btn', type: 'button', on: { click } }, 'Label')
 * Special props: class, text, on, dataset, style. Booleans: true → attribute present, false/null → omitted.
 * value / checked / disabled / hidden / selected are set as properties.
 */
export function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  if (props == null || typeof props !== 'object' || props instanceof Node || Array.isArray(props)) {
    if (props != null) kids.unshift(props);
    props = {};
  }
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'on') for (const [ev, fn] of Object.entries(v)) el.addEventListener(ev, fn);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k === 'style') el.setAttribute('style', v);
    else if (['value', 'checked', 'disabled', 'hidden', 'selected'].includes(k)) el[k] = v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  append(el, kids);
  return el;
}

export function append(el, kids) {
  for (const kid of [kids].flat(Infinity)) {
    if (kid == null || kid === false || kid === '') continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

let uidN = 0;
export const uid = (prefix = 'mm') => `${prefix}-${++uidN}`;

export function btn(label, onClick, cls = 'btn', attrs = {}) {
  return h('button', { type: 'button', class: cls, ...attrs, on: { click: onClick } }, label);
}
export function linkBtn(href, label, cls = 'btn btn-primary', attrs = {}) {
  return h('a', { href, class: cls, ...attrs }, label);
}

export function pageHead({ eyebrow, title, lead }) {
  return h('header', { class: 'page-head' },
    eyebrow ? h('p', { class: 'eyebrow' }, eyebrow) : null,
    h('h1', { tabindex: '-1' }, title),
    lead ? h('p', { class: 'lead' }, lead) : null);
}

export function notice(content, kind = 'info') {
  return h('div', { class: `notice notice-${kind}` }, typeof content === 'string' ? h('p', {}, content) : content);
}

export function chip(text, kind = '') {
  return h('span', { class: `chip${kind ? ' chip-' + kind : ''}` }, text);
}

/** Accessible progress bar with a visible label row. */
export function progressBar({ value, max, label, valueText }) {
  const pct = max > 0 ? Math.round((Math.min(value, max) / max) * 100) : 0;
  const id = uid('pb');
  return h('div', { class: 'progress-wrap' },
    h('div', { class: 'progress-label', id }, h('span', {}, label), h('span', {}, valueText ?? `${value} of ${max}`)),
    h('div', {
      class: 'progress', role: 'progressbar', 'aria-labelledby': id,
      'aria-valuemin': '0', 'aria-valuemax': String(max), 'aria-valuenow': String(Math.min(value, max)),
      'aria-valuetext': valueText ?? `${value} of ${max}`
    }, h('div', { class: 'progress-bar', style: `width:${pct}%` })));
}

export function statBox(value, label) {
  return h('div', { class: 'stat' }, h('span', { class: 'stat-value' }, String(value)), h('span', { class: 'stat-label' }, label));
}

export function formatDate(ts) {
  if (!ts) return '';
  try { return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); } catch { return ''; }
}

export const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;

// ---------- modal dialogs ----------
const openModals = new Set();
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Open a modal dialog. `build({ close })` returns the body content.
 * Returns { dialog, close(result) }. Focus is trapped inside, Esc closes, focus returns to the opener.
 * The dialog also closes itself if the route changes (back/forward).
 */
export function openModal({ title, build, actions, className = '', returnFocus = document.activeElement, onClose }) {
  const titleId = uid('dlg');
  const dlg = h('dialog', { class: `modal ${className}`.trim(), 'aria-labelledby': titleId });
  let done = false;
  const close = (result, { restore = true } = {}) => {
    if (done) return;
    done = true;
    openModals.delete(api);
    window.removeEventListener('hashchange', onHash);
    try { if (dlg.open && dlg.close) dlg.close(); } catch { /* ignore */ }
    dlg.remove();
    if (restore && returnFocus && document.contains(returnFocus)) { try { returnFocus.focus(); } catch { /* ignore */ } }
    onClose?.(result);
  };
  const api = { dialog: dlg, close };
  const onHash = () => close(undefined, { restore: false });

  const closeBtn = h('button', { type: 'button', class: 'modal-close', 'aria-label': 'Close' }, '×');
  closeBtn.addEventListener('click', () => close(false));
  dlg.append(
    h('div', { class: 'modal-head' }, h('h2', { id: titleId }, title), closeBtn),
    h('div', { class: 'modal-body' }, build ? build({ close }) : null)
  );
  if (actions) dlg.append(h('div', { class: 'modal-actions' }, actions({ close })));

  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(false); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(false); }); // backdrop click
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(false); return; }
    if (e.key !== 'Tab') return;
    const items = [...dlg.querySelectorAll(FOCUSABLE)].filter((x) => x.offsetParent !== null || x === document.activeElement);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  document.body.append(dlg);
  try { dlg.showModal(); } catch { dlg.setAttribute('open', ''); }
  window.addEventListener('hashchange', onHash);
  openModals.add(api);
  const target = dlg.querySelector('[data-autofocus]') || dlg.querySelector('.modal-body ' + FOCUSABLE) || closeBtn;
  target.focus();
  return api;
}

export function closeAllModals() { for (const m of [...openModals]) m.close(undefined, { restore: false }); }

/** Promise<boolean> confirmation dialog. */
export function confirmDialog({ title = 'Are you sure?', message, confirmLabel = 'Yes', cancelLabel = 'Cancel', danger = false }) {
  return new Promise((resolve) => {
    openModal({
      title,
      build: () => (typeof message === 'string' ? h('p', {}, message) : message),
      actions: ({ close }) => [
        h('button', { type: 'button', class: 'btn', 'data-autofocus': true, on: { click: () => close(false) } }, cancelLabel),
        h('button', { type: 'button', class: `btn btn-primary${danger ? ' btn-danger' : ''}`, on: { click: () => close(true) } }, confirmLabel)
      ],
      onClose: (r) => resolve(r === true)
    });
  });
}

// ---------- content lookups (tolerant of number or 'world-N' ids) ----------
export function worldNum(x) {
  if (typeof x === 'number') return x;
  if (x && typeof x === 'object') return worldNum(x.number ?? x.id);
  const m = String(x ?? '').match(/(\d+)/);
  return m ? Number(m[1]) : NaN;
}
export const sameWorld = (a, b) => worldNum(a) === worldNum(b);

export function worldOf(lesson) {
  if (!lesson) return null;
  return WORLDS.find((w) => sameWorld(w, lesson.world)) ||
    WORLDS.find((w) => Array.isArray(w.lessons) && w.lessons.some((x) => x === lesson.id || x?.id === lesson.id)) || null;
}

/**
 * Lessons for a world, in order. Entries are lesson objects; a world may also list planned lesson
 * titles that have no lesson object yet — those come back as { id:null, title, status:'planned' }.
 */
export function lessonsInWorld(world) {
  const found = LESSONS.filter((l) => sameWorld(world, l.world));
  const seen = new Set(found.map((l) => l.id));
  for (const x of Array.isArray(world.lessons) ? world.lessons : []) {
    if (typeof x === 'string') {
      const l = lessonById(x);
      if (l && !seen.has(l.id)) { found.push(l); seen.add(l.id); }
      else if (!l && !seen.has(x)) { found.push({ id: null, title: x, status: 'planned' }); seen.add(x); }
    } else if (x && typeof x === 'object' && !seen.has(x.id)) {
      found.push({ status: 'planned', ...x, id: lessonById(x.id) ? x.id : (x.id ?? null) });
      if (x.id) seen.add(x.id);
    }
  }
  return found.sort((a, b) => (a.number ?? 99) - (b.number ?? 99));
}

export const readyLessons = () => LESSONS.filter((l) => l.status === 'ready');
export const isReady = (lesson) => lesson?.status === 'ready';
export const skillName = (id) => SKILLS[id]?.name || id;
export const worldTitle = (w) => (w ? `World ${w.number ?? worldNum(w)}: ${w.title}` : '');

/** Skills whose lesson is ready (so practice/test can actually generate questions). */
export function readySkillIds() {
  const ids = new Set();
  for (const l of readyLessons()) for (const s of l.skills || []) ids.add(s);
  return [...ids];
}

/** Band text that may be a string, a list of strings, or {explorer, analyst} of either. */
export function paragraphs(value, band) {
  const v = pick(value, band);
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (v == null || v === '') return [];
  return String(v).split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
}

// ---------- global: skip link must not change the hash route ----------
if (typeof document !== 'undefined' && !globalThis.__mmSkipBound) {
  globalThis.__mmSkipBound = true;
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a.skip');
    if (!a) return;
    e.preventDefault();
    const main = document.getElementById('view');
    const target = main?.querySelector('h1') || main;
    if (target) { if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1'); target.focus(); }
  });

  // ---------- "More" sheet (#menuToggle controls #siteNav; app.js toggles it and handles Esc) ----------
  // Here: move focus into the sheet when it opens, and close it on a click or focus outside it.
  const toggle = () => document.getElementById('menuToggle');
  const sheet = () => document.getElementById('siteNav');
  const isOpen = () => toggle()?.getAttribute('aria-expanded') === 'true';
  const closeSheet = () => { toggle()?.setAttribute('aria-expanded', 'false'); sheet()?.classList.remove('open'); };
  document.addEventListener('click', (e) => {
    const t = toggle(), s = sheet();
    if (!t || !s) return;
    if (t.contains(e.target)) {
      // app.js's listener on the button itself has already toggled it (it runs before this document listener).
      if (isOpen()) s.querySelector('a[href]')?.focus();
      return;
    }
    if (isOpen() && (!s.contains(e.target) || e.target.closest?.('a[href]'))) closeSheet();
  });
  document.addEventListener('focusin', (e) => {
    const t = toggle(), s = sheet();
    if (isOpen() && t && s && !t.contains(e.target) && !s.contains(e.target)) closeSheet();
  });
}
