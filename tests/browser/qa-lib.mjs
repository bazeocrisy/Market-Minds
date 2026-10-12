// Shared helpers for the QA browser suites (acceptance, a11y, robustness). Agent 5 owns this file.
// Nothing here edits app code: it only observes the page through CDP and in-page instrumentation.
import path from 'node:path';
import { ROOT } from '../lib/harness.mjs';

export const SHOT_DIR = process.env.SHOT_DIR || path.join(ROOT, 'tests', 'screenshots');

/** Pass/fail counter. check(name, ok, detail). */
export function counter(suite) {
  const c = { suite, pass: 0, fail: 0, failures: [] };
  c.check = (name, ok, detail = '') => {
    if (ok) c.pass++;
    else { c.fail++; c.failures.push(`${name}${detail !== '' ? ' :: ' + String(detail).slice(0, 400) : ''}`); console.log('FAIL', name, detail !== '' ? '::' : '', String(detail).slice(0, 400)); }
    return !!ok;
  };
  c.done = () => { console.log(`${suite}: ${c.pass} passed, ${c.fail} failed`); return c.fail ? 1 : 0; };
  return c;
}

// ---------------------------------------------------------------------------------------------
// In-page instrumentation, injected with Page.addScriptToEvaluateOnNewDocument so it exists before
// the app's modules run (and survives reloads).
//
// 1. Question capture. The UI never exposes the correct answer before a check (by design), so to
//    answer deliberately right or wrong we observe the engine's own Question objects:
//    - an `answer` setter on Object.prototype records every object that gets `q.answer = …`
//      assigned (generate.js assemble() does exactly that) and then re-defines `answer` as a normal
//      own property, so app behaviour is unchanged;
//    - Set.prototype.add is wrapped: session.js (`seen.add(question.key)`) and test.js
//      (`avoid.add(q.key)`) add a question's key the moment it is ACCEPTED, so __qa.accepted is the
//      exact ordered list of questions the learner is shown.
//    Every use cross-checks the captured prompt against the rendered .q-prompt text.
// 2. speechSynthesis stub (optional): records speak/cancel/pause/resume; utterances never end on
//    their own (so Pause/Stop can be tested), __speech.finish() ends the queue.
// ---------------------------------------------------------------------------------------------
export const CAPTURE_SRC = `(() => {
  if (window.__qa) return;
  const qa = window.__qa = { all: [], accepted: [] };
  Object.defineProperty(Object.prototype, 'answer', {
    configurable: true,
    get() { return undefined; },
    set(v) {
      Object.defineProperty(this, 'answer', { value: v, writable: true, enumerable: true, configurable: true });
      if (this && typeof this.key === 'string' && typeof this.skill === 'string') qa.all.push(this);
    }
  });
  const add = Set.prototype.add;
  Set.prototype.add = function (v) {
    if (typeof v === 'string' && v.indexOf('|') > 0) {
      for (let i = qa.all.length - 1; i >= 0; i--) if (qa.all[i].key === v) { qa.accepted.push(qa.all[i]); break; }
    }
    return add.call(this, v);
  };
})();`;

export const SPEECH_STUB_SRC = `(() => {
  const log = window.__speech = { speak: [], cancel: 0, pause: 0, resume: 0, queue: [] };
  const ss = window.speechSynthesis;
  if (!ss) return;
  ss.speak = (u) => { log.speak.push(String(u.text)); log.queue.push(u); };
  ss.cancel = () => { log.cancel++; log.queue = []; };
  ss.pause = () => { log.pause++; };
  ss.resume = () => { log.resume++; };
  ss.getVoices = () => [];
  log.finish = () => { let n = 0; while (log.queue.length && n++ < 200) { const u = log.queue.shift(); try { u.onend && u.onend({}); } catch (e) {} } };
})();`;

export const NO_SPEECH_SRC = `(() => {
  try { delete window.speechSynthesis; } catch (e) {}
  try { delete Window.prototype.speechSynthesis; } catch (e) {}
  try { delete window.SpeechSynthesisUtterance; } catch (e) {}
  try { if ('speechSynthesis' in window) Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true }); } catch (e) {}
})();`;

export async function addInit(b, source) {
  const r = await b.send('Page.addScriptToEvaluateOnNewDocument', { source });
  return r.result?.identifier;
}
export async function removeInit(b, id) { if (id) await b.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: id }); }

/** In-page helpers (installed after each load): answering questions through the real UI. */
export const PAGE_HELPERS = `(() => {
  if (window.__qh) return;
  const norm = (s) => String(s ?? '').replace(/\\s+/g, ' ').trim();
  const RX = /\\[\\[([^\\]|]+?)(?:\\|([^\\]]+))?\\]\\]/g;
  let glossary = null;
  const plain = (t) => String(t ?? '').replace(RX, (_, id, shown) => shown || (glossary && glossary(id.trim())?.term) || id.trim());
  const qh = window.__qh = {
    norm, plain,
    async init() { if (!glossary) { const m = await import(new URL('js/content/glossary.js', document.baseURI).href); glossary = m.termById; } },
    /** The accepted question whose prompt matches the rendered prompt in root (latest first). */
    find(root, fromEnd = 1) {
      const el = (root || document).querySelector('.q-prompt');
      const shown = norm(el?.textContent);
      const acc = window.__qa.accepted;
      for (let i = acc.length - fromEnd; i >= 0; i--) if (norm(plain(acc[i].prompt)) === shown) return acc[i];
      return null;
    },
    rightResponse(q) { return q.answer; },
    wrongResponse(q) {
      if (q.type === 'choice' || q.type === 'fill') {
        const w = q.choices.find((c) => c.id !== q.answer && c.misconception) || q.choices.find((c) => c.id !== q.answer);
        return w.id;
      }
      if (q.type === 'number') return (q.commonErrors && q.commonErrors[0]) ? q.commonErrors[0].value : q.answer + 7;
      if (q.type === 'match') {
        const keys = Object.keys(q.answer); const out = { ...q.answer };
        const t = out[keys[0]]; out[keys[0]] = out[keys[1]]; out[keys[1]] = t; return out;
      }
      return null;
    },
    /** Put a response into the rendered question UI inside root (does not press Check). */
    fill(root, q, resp) {
      if (q.type === 'choice') { root.querySelector('.choices [data-id="' + resp + '"]').click(); return true; }
      if (q.type === 'fill') { root.querySelector('.word-bank [data-id="' + resp + '"]').click(); return true; }
      if (q.type === 'number') {
        const i = root.querySelector('.q-answer input'); i.value = String(resp); i.dispatchEvent(new Event('input', { bubbles: true })); return true;
      }
      if (q.type === 'match') {
        for (const [l, r] of Object.entries(resp)) {
          const sel = [...root.querySelectorAll('.match-list select')].find((s) => s.id.endsWith('-m-' + l));
          sel.value = r; sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
        return true;
      }
      return false;
    },
    answerText(q) {
      if (q.type === 'choice' || q.type === 'fill') return plain(q.choices.find((c) => c.id === q.answer)?.text);
      if (q.type === 'number') return String(q.answer);
      return '';
    },
    btn(root, re) { return [...(root || document).querySelectorAll('button, a')].find((b) => re.test(norm(b.textContent)) && !b.hidden && b.offsetParent !== null); }
  };
})();`;

export async function helpers(b) { await b.js(PAGE_HELPERS + '; await window.__qh.init();'); }

/** Accessible name + role for the first element matching selector (Chrome's own computation). */
export async function axOf(b, selector) {
  const doc = await b.send('DOM.getDocument', { depth: 0 });
  const q = await b.send('DOM.querySelector', { nodeId: doc.result.root.nodeId, selector });
  const nodeId = q.result?.nodeId;
  if (!nodeId) return null;
  const ax = await b.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
  const n = ax.result?.nodes?.[0];
  return n ? { role: n.role?.value, name: n.name?.value ?? '', ignored: n.ignored } : null;
}

/** A real tap/click at the element's centre (CDP mouse input), after checking nothing covers it. */
export async function tap(b, selectorExpr) {
  const r = await b.js(`const el = (${selectorExpr}); if (!el) return null; el.scrollIntoView({ block: 'center' });
    const rc = el.getBoundingClientRect(); const x = rc.left + rc.width / 2, y = rc.top + rc.height / 2;
    const hit = document.elementFromPoint(x, y); return { x, y, ok: !!hit && (hit === el || el.contains(hit)), hit: hit ? hit.tagName + '.' + hit.className : null };`);
  if (!r) return { ok: false, missing: true };
  await b.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: r.x, y: r.y, button: 'left', clickCount: 1 });
  await b.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: r.x, y: r.y, button: 'left', clickCount: 1 });
  await b.wait(200);
  return r;
}

const VK = { Tab: 9, Enter: 13, Escape: 27, ' ': 32, ArrowDown: 40, ArrowUp: 38, ArrowLeft: 37, ArrowRight: 39, Home: 36, End: 35 };
/** Keyboard press with proper virtual key codes (Tab, Enter, Escape, Space, arrows). */
export async function press(b, key, shift = false) {
  const vk = VK[key] || 0;
  const text = key === 'Enter' ? '\r' : key === ' ' ? ' ' : undefined;
  const mods = shift ? 8 : 0;
  await b.send('Input.dispatchKeyEvent', { type: text ? 'keyDown' : 'rawKeyDown', key, code: key === ' ' ? 'Space' : key, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, modifiers: mods, text });
  await b.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key === ' ' ? 'Space' : key, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, modifiers: mods });
  await b.wait(60);
}

/** Navigate by hash inside the app and wait for the view to render. */
export async function route(b, hash, ms = 350) { await b.js(`location.hash = ${JSON.stringify(hash)};`); await b.wait(ms); }

export const text = (b, sel) => b.js(`const e = document.querySelector(${JSON.stringify(sel)}); return e ? e.textContent.replace(/\\s+/g, ' ').trim() : null;`);
