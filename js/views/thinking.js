// Thinking Lab — #/thinking (list) and #/thinking/<promptId> (one prompt).
// Flow: scenario (+ visual) → structured choice → written explanation (never graded)
// → compare with an example answer + honest self-check → save to store.thinking[id].
// Nothing personal is stored: only the choice id, the learner's own words, self-check ticks and a time.
import { THINKING_PROMPTS, THINKING_TYPES, promptById } from '../content/thinking.js';
import { SKILLS } from '../content/skills.js';
import { worldById } from '../content/worlds.js';
import { pick } from '../content/band.js';
import { renderVisual } from '../ui/visuals.js';
import { renderRichText } from '../ui/vocab.js';
import { readToMe, stopAll } from '../ui/speech.js';

// World headings come from js/content/worlds.js, so new worlds appear without editing this view.
const worldName = (num) => { const w = worldById(num); return w ? `World ${num}: ${w.title}` : `World ${num}`; };
const MAX_RESPONSE = 2000;
// Unsaved drafts survive a re-render (grade switch), a refresh, an app update and Home-and-back.
// Kept in sessionStorage (this tab only, cleared when the tab closes) under DRAFT_KEY as
// { [promptId]: { choice, response, selfCheck, compared, at } }. Storage may be blocked: then memory only.
const DRAFT_KEY = 'mm.draft.thinking';
const drafts = loadDrafts();

function loadDrafts() {
  const m = new Map();
  try {
    const raw = globalThis.sessionStorage?.getItem(DRAFT_KEY);
    const obj = raw ? JSON.parse(raw) : null;
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      for (const [id, d] of Object.entries(obj)) {
        if (!d || typeof d !== 'object' || !promptById(id)) continue;
        m.set(id, {
          choice: typeof d.choice === 'string' ? d.choice : null,
          response: typeof d.response === 'string' ? d.response.slice(0, MAX_RESPONSE) : '',
          selfCheck: Array.isArray(d.selfCheck) ? d.selfCheck.map(Boolean) : [],
          compared: !!d.compared,
          at: Number.isFinite(d.at) ? d.at : 0
        });
      }
    }
  } catch { /* blocked or corrupt storage: start empty */ }
  return m;
}
function persistDrafts() {
  try {
    const ss = globalThis.sessionStorage;
    if (!ss) return;
    if (drafts.size) ss.setItem(DRAFT_KEY, JSON.stringify(Object.fromEntries(drafts)));
    else ss.removeItem(DRAFT_KEY);
  } catch { /* blocked or full storage: the in-memory draft still works */ }
}
const hasWork = (d) => !!d && (!!d.choice || !!String(d.response || '').trim());
function workChanged() {
  try { document.dispatchEvent(new CustomEvent('mm:work-changed')); } catch { /* no DOM (tests) */ }
}
function setDraft(id, d) {
  const before = hasWork(drafts.get(id));
  drafts.set(id, { ...d, at: Date.now() });
  persistDrafts();
  if (before !== hasWork(d)) workChanged();
}
function clearDraft(id, { saved = false } = {}) {
  const had = drafts.has(id);
  drafts.delete(id);
  persistDrafts();
  if (had || saved) workChanged();
}

/**
 * Unsaved Thinking Lab work, for the app's "don't lose your work" checks (updates, Home).
 * @returns {null | { kind: 'thinking', label: string, resume: string }} the most recent unsaved draft with a choice or written words.
 */
export function pendingWork() {
  let best = null, bestId = null;
  for (const [id, d] of drafts) if (hasWork(d) && (!best || d.at >= best.at)) { best = d; bestId = id; }
  return best ? { kind: 'thinking', label: 'your Thinking Lab answer', resume: `#/thinking/${encodeURIComponent(bestId)}` } : null;
}

// ---------- tiny local DOM helpers ----------
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k === 'on') for (const [ev, fn] of Object.entries(v)) e.addEventListener(ev, fn);
    else if (k === 'value' || k === 'checked' || k === 'disabled') e[k] = v;
    else e.setAttribute(k, v === true ? '' : String(v));
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) e.append(k instanceof Node ? k : String(k));
  return e;
}
let n = 0;
const uid = (p) => `${p}-${++n}`;
const plain = (t) => String(t ?? '').replace(/\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g, (_, id, shown) => shown || id);
const fmtDate = (ts) => { try { return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); } catch { return ''; } };

function visualBlock(spec, band) {
  const v = pick(spec, band);
  if (!v) return null;
  return h('div', { class: 'visual' }, renderVisual(v, { band }));
}

export function render(el, params, ctx) {
  const id = params[0];
  if (!id) return renderList(el, ctx);
  const p = promptById(id);
  if (!p) return renderMissing(el, id);
  return renderPrompt(el, p, ctx);
}

// ---------------------------------------------------------------- list
function renderList(el, ctx) {
  const done = ctx.store.get().thinking || {};
  const count = THINKING_PROMPTS.filter((p) => done[p.id]).length;
  const page = h('section', { class: 'page thinking-lab' },
    h('header', { class: 'page-head' },
      h('p', { class: 'eyebrow' }, 'Explain your thinking'),
      h('h1', { tabindex: '-1' }, 'Thinking Lab'),
      h('p', { class: 'lead' }, 'Predict, explain, compare and spot mistakes. Good thinkers explain WHY — and say when they can’t be sure.')),
    h('div', { class: 'notice notice-info' },
      h('p', {}, 'Some prompts have one best answer and some have many good answers. Your written explanations are never graded by the app — you compare them with an example answer and check your own work honestly.')),
    h('p', { class: 'thinking-count' }, `${count} of ${THINKING_PROMPTS.length} prompts saved`));

  for (const world of [...new Set(THINKING_PROMPTS.map((p) => p.world))].sort((a, b) => a - b)) {
    const list = THINKING_PROMPTS.filter((p) => p.world === world);
    if (!list.length) continue;
    const headId = uid('tl-world');
    page.append(h('section', { class: 'section', 'aria-labelledby': headId },
      h('h2', { id: headId }, worldName(world)),
      h('ul', { class: 'entry-list thinking-list' }, list.map((p) => {
        const isDone = !!done[p.id];
        return h('li', {},
          h('a', { class: 'card card-link thinking-card', href: `#/thinking/${encodeURIComponent(p.id)}` },
            h('span', { class: 'card-title' }, p.title),
            h('span', { class: 'card-text' }, `${THINKING_TYPES[p.type]} · ${SKILLS[p.skill]?.name || p.skill}`),
            h('span', { class: `chip ${isDone ? 'chip-done' : 'chip-ready'}` }, isDone ? 'Saved' : 'Not done yet')));
      }))));
  }
  el.append(page);
  return () => {};
}

function renderMissing(el, id) {
  el.append(h('section', { class: 'page' },
    h('h1', { tabindex: '-1' }, 'Prompt not found'),
    h('p', {}, `We couldn’t find a Thinking Lab prompt called “${id}”.`),
    h('p', {}, h('a', { href: '#/thinking', class: 'btn btn-primary' }, 'See all Thinking Lab prompts'))));
  return () => {};
}

// ---------------------------------------------------------------- one prompt
function renderPrompt(el, p, ctx) {
  const band = ctx.band;
  const saved = ctx.store.get().thinking?.[p.id] || null;
  const draft = drafts.get(p.id) || {};
  const checklist = pick(p.checklist, band) || [];
  const state = {
    choice: draft.choice ?? saved?.choice ?? null,
    response: draft.response ?? saved?.response ?? '',
    selfCheck: draft.selfCheck ?? (Array.isArray(saved?.selfCheck) ? saved.selfCheck.slice(0, checklist.length) : []),
    compared: draft.compared ?? !!saved
  };
  while (state.selfCheck.length < checklist.length) state.selfCheck.push(false);
  const keepDraft = () => setDraft(p.id, { choice: state.choice, response: state.response, selfCheck: state.selfCheck.slice(), compared: state.compared });

  const idx = THINKING_PROMPTS.indexOf(p);
  const prev = THINKING_PROMPTS[idx - 1], next = THINKING_PROMPTS[idx + 1];

  // --- scenario
  const scenarioText = pick(p.scenario, band);
  const questionText = pick(p.question, band);
  const scenarioSec = h('section', { class: 'card thinking-scenario', 'aria-labelledby': 'tl-scn' },
    h('h2', { id: 'tl-scn' }, 'The situation'),
    h('p', { class: 'thinking-scenario-text' }, renderRichText(scenarioText, band)),
    visualBlock(p.visual, band));
  const rtm = readToMe(scenarioSec, () => `${plain(scenarioText)} ${plain(questionText)}`);

  // --- structured choice
  const qId = uid('tl-q');
  const fb = h('div', { class: 'feedback', 'aria-live': 'polite' });
  const choiceBtns = [];
  const choicesEl = h('div', { class: 'choices', role: 'group', 'aria-labelledby': qId });
  for (const c of p.choices || []) {
    const b = h('button', { type: 'button', class: 'choice', 'aria-pressed': 'false', 'data-choice': c.id, on: { click: () => choose(c) } }, pick(c.text, band));
    choiceBtns.push(b);
    choicesEl.append(b);
  }
  function paint() {
    for (const b of choiceBtns) {
      const c = p.choices.find((x) => x.id === b.getAttribute('data-choice'));
      const sel = state.choice === c.id;
      b.setAttribute('aria-pressed', String(sel));
      b.classList.toggle('is-correct', !p.openChoice && sel && !!c.correct);
      b.classList.toggle('is-tried', !p.openChoice && sel && !c.correct);
    }
  }
  function choose(c, { restoring = false } = {}) {
    state.choice = c.id;
    if (!restoring) keepDraft();
    paint();
    fb.className = 'feedback';
    fb.textContent = '';
    if (p.openChoice) {
      fb.classList.add('is-neutral');
      fb.append(h('p', { class: 'fb-title' }, 'A thoughtful choice'), h('p', {}, pick(c.feedback, band)), h('p', {}, 'Now explain your thinking below.'));
    } else if (c.correct) {
      fb.classList.add('is-correct');
      fb.append(h('p', { class: 'fb-title' }, 'Yes — that holds up'), h('p', {}, pick(c.feedback, band)), h('p', {}, 'Now explain it in your own words below.'));
    } else {
      fb.classList.add('is-wrong');
      fb.append(h('p', { class: 'fb-title' }, 'Not quite — think again'), h('p', {}, pick(c.feedback, band)), h('p', {}, 'Try another choice.'));
    }
  }
  const choiceSec = h('section', { class: 'section thinking-choice', 'aria-labelledby': qId },
    h('h2', { id: qId }, questionText),
    p.openChoice
      ? h('p', { class: 'notice notice-info' }, 'There’s no single right answer here. Choose what you think, then explain why.')
      : h('p', { class: 'field-hint' }, 'Choose one. You’ll get feedback, and you can try again.'),
    choicesEl, fb);

  // --- explanation (never graded)
  const taId = uid('tl-explain'), hintId = uid('tl-hint');
  const ta = h('textarea', { id: taId, rows: '5', maxlength: String(MAX_RESPONSE), 'aria-describedby': hintId, value: state.response,
    on: { input: (e) => { state.response = e.target.value.slice(0, MAX_RESPONSE); keepDraft(); } } });
  const explainSec = h('section', { class: 'section thinking-explain' },
    h('div', { class: 'field' },
      h('label', { for: taId }, pick(p.explainPrompt, band)),
      h('span', { class: 'field-hint', id: hintId }, 'Optional, but this is the most important part. The app does not grade your writing. Please don’t write your name.'),
      ta));

  // --- compare with example + self-check
  const compareBtn = h('button', { type: 'button', class: 'btn', 'aria-expanded': String(state.compared), 'aria-controls': 'tl-compare', on: { click: () => { state.compared = !state.compared; keepDraft(); syncCompare(); if (state.compared) compareHead.focus(); } } });
  const compareHead = h('h2', { tabindex: '-1' }, 'An example answer');
  const checks = checklist.map((item, i) => {
    const cid = uid('tl-chk');
    return h('div', { class: 'check-row' },
      h('input', { type: 'checkbox', id: cid, checked: !!state.selfCheck[i], on: { change: (e) => { state.selfCheck[i] = e.target.checked; keepDraft(); } } }),
      h('label', { for: cid }, item));
  });
  const compareSec = h('section', { class: 'section thinking-compare', id: 'tl-compare' },
    compareHead,
    h('blockquote', { class: 'thinking-reference' }, h('p', {}, renderRichText(pick(p.referenceAnswer, band), band))),
    h('p', { class: 'small muted' }, 'This is one good answer, not the only one. Your words can be different and still be great.'),
    h('fieldset', { class: 'fieldset thinking-selfcheck' },
      h('legend', {}, 'Check your own answer honestly. My answer mentioned…'),
      checks,
      h('p', { class: 'field-hint' }, 'Only you can check this. The app does not grade free writing — these ticks are for you.')));
  function syncCompare() {
    compareSec.hidden = !state.compared;
    compareBtn.setAttribute('aria-expanded', String(state.compared));
    compareBtn.textContent = state.compared ? 'Hide the example answer' : 'Compare with an example answer';
  }

  // --- save
  const saveStatus = h('p', { class: 'thinking-save-status', role: 'status' }, saved ? `You saved this on ${fmtDate(saved.completedAt)}. Saving again updates it.` : '');
  const saveBtn = h('button', { type: 'button', class: 'btn btn-primary', on: { click: save } }, 'Save my thinking');
  function save() {
    if (!state.choice) { saveStatus.textContent = 'Pick a choice above first, then save.'; choiceBtns[0]?.focus(); return; }
    const record = { choice: state.choice, response: state.response.trim().slice(0, MAX_RESPONSE), selfCheck: state.selfCheck.map(Boolean), completedAt: Date.now() };
    ctx.store.update((s) => { s.thinking[p.id] = record; });
    clearDraft(p.id, { saved: true });
    saveStatus.textContent = `Saved on this device. ${state.response.trim() ? 'Nice work explaining your thinking.' : 'Next time, try writing an explanation too.'}`;
  }

  const nav = h('nav', { class: 'btn-row spread thinking-nav', 'aria-label': 'Thinking Lab prompts' },
    prev ? h('a', { class: 'btn', href: `#/thinking/${encodeURIComponent(prev.id)}` }, '← Previous prompt') : h('span'),
    h('a', { class: 'btn btn-ghost', href: '#/thinking' }, 'All prompts'),
    next ? h('a', { class: 'btn', href: `#/thinking/${encodeURIComponent(next.id)}` }, 'Next prompt →') : h('span'));

  el.append(h('article', { class: 'page page-narrow thinking-prompt' },
    h('p', {}, h('a', { href: '#/thinking', class: 'text-link' }, '← Thinking Lab')),
    h('header', { class: 'page-head' },
      h('p', { class: 'eyebrow' }, `${THINKING_TYPES[p.type]} · ${worldName(p.world)}`),
      h('h1', { tabindex: '-1' }, p.title),
      p.type === 'mistake-detective' ? h('p', { class: 'lead' }, 'A pretend student made a mistake. Can you find it and explain it?') : null),
    scenarioSec, choiceSec, explainSec,
    h('div', { class: 'btn-row' }, compareBtn),
    compareSec,
    h('div', { class: 'btn-row' }, saveBtn), saveStatus,
    nav));

  syncCompare();
  if (state.choice) {
    const c = p.choices.find((x) => x.id === state.choice);
    if (c) choose(c, { restoring: true }); else state.choice = null;
  }

  return () => { try { rtm?.destroy?.(); } catch { /* ignore */ } try { stopAll(); } catch { /* ignore */ } };
}
