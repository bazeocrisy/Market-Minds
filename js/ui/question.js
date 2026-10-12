// Question renderer for engine/content Question objects (see docs/ARCHITECTURE.md).
//
// renderQuestion(question, { band, mode, onSubmit, onHint?, onReveal?, value?, label? })
//   mode 'practice' | 'check': shows a Check button (calls onSubmit(response)); a Hint button when
//        onHint is given (onHint() may return the next hint string, or null when none are left);
//        a "Show answer" button when onReveal is given.
//   mode 'test': no Check/Hint/Reveal buttons and no correctness feedback. onSubmit(response) is called
//        every time the answer changes (response is null while incomplete). `value` restores an answer.
// Returns { el, showFeedback({correct, feedback, explanation, teach, misconception}), showHint(text),
//           reveal({answer, explanation}), clearFeedback(), lock(), getResponse(), focus() }.
//
// Response shapes: choice/fill → choice id; number → Number; match → { leftId: rightId }.
import { h, uid } from './dom.js';
import { renderRichText, plainText } from './vocab.js';
import { visualEl } from './art.js';

const fmtNum = (n, money = false) => {
  if (typeof n !== 'number' || !Number.isFinite(n)) return String(n ?? '');
  if (Number.isInteger(n)) return String(n);
  return money ? n.toFixed(2) : String(Number(n.toFixed(4)));
};

/** Human-readable text for an answer value (used for reveals and test results). */
export function formatAnswer(q, value) {
  if (value == null || value === '') return 'No answer';
  switch (q.type) {
    case 'choice':
    case 'fill': {
      const c = (q.choices || []).find((x) => x.id === value);
      return c ? plainText(c.text) : String(value);
    }
    case 'number': {
      const n = typeof value === 'number' ? value : Number(value);
      const unit = q.unit ? ` ${q.unit}` : '';
      return `${q.prefix || ''}${Number.isFinite(n) ? fmtNum(n, q.prefix === '$') : value}${unit}`;
    }
    case 'match': {
      const right = Object.fromEntries((q.pairs?.right || []).map((r) => [r.id, plainText(r.text)]));
      return (q.pairs?.left || []).map((l) => `${plainText(l.text)} → ${right[value?.[l.id]] ?? '(none)'}`).join('; ');
    }
    default: return String(value);
  }
}

/** Parse a typed number: allows $, commas, spaces and a leading minus. */
export function parseNumber(text) {
  const t = String(text ?? '').replace(/[$,\s]/g, '').replace(/[−–]/g, '-');
  if (t === '') return { empty: true };
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(t)) return { error: true };
  return { value: Number(t) };
}

export function renderQuestion(q, opts = {}) {
  const { band = 'explorer', mode = 'practice', onSubmit, onHint, onReveal, value, label } = opts;
  const test = mode === 'test';
  const id = uid('q');
  const promptId = `${id}-prompt`;
  let locked = false;
  let hintsShown = 0;
  let totalHints = Array.isArray(q.hints) ? q.hints.length : 0;

  const el = h('div', { class: `question q-${q.type}`, dataset: { mode } });
  if (label) el.append(h('p', { class: 'eyebrow' }, label));
  el.append(h('div', { class: 'q-prompt', id: promptId }, renderRichText(q.prompt, band)));
  if (q.visual) { const v = visualEl(q.visual, band); if (v) el.append(v); }

  const answerArea = h('div', { class: 'q-answer' });
  el.append(answerArea);
  const controls = []; // inputs to disable on lock
  let readResponse = () => ({ value: null, message: 'Choose an answer first.' });

  const changed = () => {
    if (!test) clearMessage();
    if (test) onSubmit?.(getResponse());
  };

  // ---- choice: radio group of large buttons ----
  if (q.type === 'choice') {
    let selected = value ?? null;
    const group = h('div', { class: 'choices', role: 'radiogroup', 'aria-labelledby': promptId });
    const buttons = (q.choices || []).map((c) => {
      const b = h('button', { type: 'button', class: 'choice', role: 'radio', 'aria-checked': String(c.id === selected), dataset: { id: c.id } }, plainText(c.text));
      b.addEventListener('click', () => select(c.id, b));
      return b;
    });
    const select = (cid, b) => {
      if (locked) return;
      selected = cid;
      for (const x of buttons) { x.setAttribute('aria-checked', String(x === b)); x.classList.remove('is-tried'); }
      syncTabs();
      changed();
    };
    const syncTabs = () => {
      const cur = buttons.find((b) => b.getAttribute('aria-checked') === 'true') || buttons[0];
      for (const b of buttons) b.tabIndex = b === cur ? 0 : -1;
    };
    group.addEventListener('keydown', (e) => {
      const i = buttons.indexOf(document.activeElement);
      if (i < 0) return;
      let j = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') j = (i + 1) % buttons.length;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') j = (i - 1 + buttons.length) % buttons.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = buttons.length - 1;
      if (j == null) return;
      e.preventDefault();
      buttons[j].focus();
      if (!locked) buttons[j].click();
    });
    group.append(...buttons);
    if (buttons.length === 2 || buttons.every((b) => b.textContent.length < 28)) group.classList.add('two-col');
    syncTabs();
    answerArea.append(group);
    controls.push(...buttons);
    readResponse = () => (selected == null ? { value: null, message: 'Choose an answer first.' } : { value: selected });
    el._mark = (correct) => {
      const b = buttons.find((x) => x.dataset.id === selected);
      if (!b) return;
      b.classList.toggle('is-correct', correct);
      b.classList.toggle('is-tried', !correct);
    };
    el._focus = () => (buttons.find((b) => b.tabIndex === 0) || buttons[0])?.focus();
  }

  // ---- fill: sentence with a blank + word bank ----
  else if (q.type === 'fill') {
    let selected = value ?? null;
    const blank = h('span', { class: 'blank is-empty' }, '______');
    const parts = String(q.sentence ?? '___').split('___');
    const sentence = h('p', { class: 'fill-sentence' });
    parts.forEach((p, i) => {
      sentence.append(renderRichText(p, band));
      if (i === 0 && parts.length > 1) sentence.append(blank);
      else if (i < parts.length - 1) sentence.append('___');
    });
    if (parts.length < 2) sentence.append(' ', blank);
    const bankLabel = `${id}-bank`;
    const bank = h('div', { class: 'word-bank', role: 'group', 'aria-labelledby': bankLabel });
    const buttons = (q.choices || []).map((c) => {
      const b = h('button', { type: 'button', class: 'choice', 'aria-pressed': String(c.id === selected), dataset: { id: c.id } }, plainText(c.text));
      b.addEventListener('click', () => {
        if (locked) return;
        selected = c.id;
        for (const x of buttons) { x.setAttribute('aria-pressed', String(x === b)); x.classList.remove('is-tried'); }
        paint();
        changed();
      });
      return b;
    });
    const paint = () => {
      const c = (q.choices || []).find((x) => x.id === selected);
      blank.textContent = c ? plainText(c.text) : '______';
      blank.classList.toggle('is-empty', !c);
    };
    paint();
    bank.append(...buttons);
    answerArea.append(sentence, h('p', { class: 'field-label', id: bankLabel }, 'Word bank — pick the word that fills the blank'), bank);
    controls.push(...buttons);
    readResponse = () => (selected == null ? { value: null, message: 'Pick a word from the word bank first.' } : { value: selected });
    el._mark = (correct) => {
      const b = buttons.find((x) => x.dataset.id === selected);
      if (b) { b.classList.toggle('is-correct', correct); b.classList.toggle('is-tried', !correct); }
    };
    el._focus = () => buttons[0]?.focus();
  }

  // ---- number: labeled input with prefix / unit ----
  else if (q.type === 'number') {
    const inputId = `${id}-num`;
    const unitText = q.unit ? ` (in ${q.unit})` : q.prefix === '$' ? ' (in dollars)' : '';
    const input = h('input', {
      id: inputId, type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false',
      'aria-describedby': promptId, value: value != null ? String(value) : ''
    });
    input.addEventListener('input', changed);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !test) { e.preventDefault(); checkBtn?.click(); } });
    answerArea.append(
      h('label', { class: 'field-label', for: inputId }, `Your answer${unitText}`),
      h('div', { class: 'number-field' },
        q.prefix ? h('span', { class: 'affix', 'aria-hidden': 'true' }, q.prefix) : null,
        input,
        q.unit ? h('span', { class: 'affix', 'aria-hidden': 'true' }, q.unit) : null));
    controls.push(input);
    readResponse = () => {
      const r = parseNumber(input.value);
      if (r.empty) return { value: null, message: 'Type your answer in the box first.' };
      if (r.error) return { value: null, message: 'Use only numbers and a decimal point, like 2.50.' };
      return { value: r.value };
    };
    el._focus = () => input.focus();
  }

  // ---- match: one labeled <select> per left item ----
  else if (q.type === 'match') {
    const left = q.pairs?.left || [];
    const right = q.pairs?.right || [];
    const selects = {};
    const list = h('div', { class: 'match-list', role: 'group', 'aria-labelledby': promptId });
    for (const l of left) {
      const sid = `${id}-m-${l.id}`;
      const sel = h('select', { id: sid },
        h('option', { value: '' }, 'Choose a match…'),
        right.map((r) => h('option', { value: r.id, selected: value?.[l.id] === r.id }, plainText(r.text))));
      sel.addEventListener('change', changed);
      selects[l.id] = sel;
      list.append(h('div', { class: 'match-row' }, h('label', { for: sid }, plainText(l.text)), sel));
      controls.push(sel);
    }
    answerArea.append(list);
    readResponse = () => {
      const out = {};
      for (const l of left) { if (!selects[l.id].value) return { value: null, message: 'Choose a match for every item first.', partial: true }; out[l.id] = selects[l.id].value; }
      return { value: out };
    };
    el._focus = () => Object.values(selects)[0]?.focus();
  } else {
    answerArea.append(h('p', { class: 'notice notice-warn' }, 'This question type can’t be shown yet.'));
  }

  // ---- hints, actions, feedback ----
  const hintList = h('ol', { class: 'hint-list', 'aria-live': 'polite', hidden: true });
  const feedback = h('div', { class: 'feedback', 'aria-live': 'polite' });
  let checkBtn = null, hintBtn = null, revealBtn = null;

  if (!test) {
    const actions = h('div', { class: 'q-actions' });
    checkBtn = h('button', { type: 'button', class: 'btn btn-primary' }, 'Check');
    checkBtn.addEventListener('click', () => {
      if (locked) return;
      const r = readResponse();
      if (r.value == null) { showMessage(r.message); return; }
      onSubmit?.(r.value);
    });
    actions.append(checkBtn);
    if (onHint) {
      hintBtn = h('button', { type: 'button', class: 'btn' });
      const syncHint = () => {
        const left = totalHints - hintsShown;
        hintBtn.textContent = left > 0 ? `💡 Hint (${hintsShown} of ${totalHints} used)` : 'No more hints';
        hintBtn.disabled = left <= 0 || locked;
      };
      hintBtn.addEventListener('click', () => {
        if (locked) return;
        const t = onHint();
        if (typeof t === 'string') api.showHint(t);
        else if (t == null) { totalHints = hintsShown; syncHint(); }
      });
      el._syncHint = syncHint;
      syncHint();
      actions.append(hintBtn);
    }
    if (onReveal) {
      revealBtn = h('button', { type: 'button', class: 'btn btn-ghost' }, 'Show answer');
      revealBtn.addEventListener('click', () => { if (!locked) onReveal(); });
      actions.append(revealBtn);
    }
    el.append(actions);
    if (onReveal) el.append(h('p', { class: 'q-note' }, 'Showing the answer gives no credit for this question — it’s still a good way to learn.'));
  }
  el.append(hintList, feedback);

  function showMessage(text) {
    feedback.className = 'feedback is-neutral';
    feedback.replaceChildren(h('p', {}, text));
  }
  function clearMessage() {
    if (feedback.classList.contains('is-neutral')) { feedback.className = 'feedback'; feedback.replaceChildren(); }
  }

  function getResponse() { return readResponse().value ?? null; }

  const api = {
    el,
    getResponse,
    focus() { el._focus?.(); },
    showHint(text) {
      if (!text) return;
      hintsShown += 1;
      hintList.hidden = false;
      hintList.append(h('li', {}, h('span', { class: 'hint-label' }, `Hint ${hintsShown}:`), renderRichText(text, band)));
      el._syncHint?.();
    },
    clearFeedback() { feedback.className = 'feedback'; feedback.replaceChildren(); },
    showFeedback({ correct, feedback: fb, explanation, teach, misconception } = {}) {
      if (test) return;
      el._mark?.(!!correct);
      feedback.className = `feedback ${correct ? 'is-correct' : 'is-wrong'}`;
      const kids = [h('p', { class: 'fb-title' }, correct ? '✓ Correct!' : 'Not quite yet.')];
      const misText = !correct && misconception && q.misconceptions?.[misconception];
      if (fb) kids.push(h('p', {}, renderRichText(fb, band)));
      if (misText && misText !== fb) kids.push(h('p', {}, renderRichText(misText, band)));
      if (correct && explanation) kids.push(h('p', {}, h('strong', {}, 'Why: '), renderRichText(explanation, band)));
      if (!correct) kids.push(h('p', { class: 'small' }, 'Change your answer and press Check to try again.'));
      if (!correct && teach) {
        const teachId = uid('teach');
        const panel = h('div', { class: 'teach', id: teachId, hidden: true }, h('p', { class: 'fb-title' }, 'Here’s how to think about it'), h('p', {}, renderRichText(teach, band)));
        const t = h('button', { type: 'button', class: 'btn btn-sm', 'aria-expanded': 'false', 'aria-controls': teachId }, 'Show me how');
        t.addEventListener('click', () => {
          const open = panel.hidden;
          panel.hidden = !open;
          t.setAttribute('aria-expanded', String(open));
          t.textContent = open ? 'Hide explanation' : 'Show me how';
        });
        kids.push(h('div', { class: 'btn-row' }, t), panel);
      }
      feedback.replaceChildren(...kids);
    },
    reveal({ answer, explanation } = {}) {
      if (test) return;
      feedback.className = 'feedback is-neutral';
      feedback.replaceChildren(
        h('p', { class: 'fb-title' }, 'Here’s the answer'),
        h('p', {}, h('strong', {}, formatAnswer(q, answer ?? q.answer))),
        (explanation || q.explanation) ? h('p', {}, renderRichText(explanation || q.explanation, band)) : null,
        h('p', { class: 'small' }, 'No credit for this one — read the reason, then try the next question on your own.'));
      api.lock();
    },
    lock() {
      locked = true;
      for (const c of controls) c.disabled = true;
      for (const b of [checkBtn, hintBtn, revealBtn]) if (b) b.disabled = true;
    }
  };
  return api;
}
