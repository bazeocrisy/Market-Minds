// Decision Journal (#/journal): private, on-device reflections. No names or personal details.
import { h, pageHead, notice, btn, uid, formatDate, readyLessons, confirmDialog, closeAllModals } from '../ui/dom.js';
import { pick } from '../content/band.js';
import { lessonById } from '../content/lessons.js';

const FIELDS = [
  { key: 'prediction', label: 'What did you predict?', hint: 'Example: “I think the price of lemonade will go up on the hot day.”', required: true },
  { key: 'reasoning', label: 'Why did you think that?', hint: 'What clues or facts did you use?' },
  { key: 'outcome', label: 'What happened?', hint: 'Did it turn out the way you expected?' },
  { key: 'learned', label: 'What did you learn?', hint: 'What would you do the same or differently next time?' }
];

export function render(el, params, ctx) {
  const page = h('section', { class: 'page' });
  el.append(page);
  page.append(pageHead({
    eyebrow: 'Decision Journal',
    title: 'My decision journal',
    lead: 'Good decision-makers write down what they expect and why, then look back at what really happened.'
  }));
  page.append(notice('Your journal stays on this device only. Please don’t write names, addresses or other personal details.', 'info'));

  const listHost = h('div');
  const formMsg = h('div', { 'aria-live': 'polite' });
  const controls = {};
  const lessonSel = h('select', { id: 'jr-lesson' }, h('option', { value: '' }, 'Not about a lesson'),
    readyLessons().map((l) => h('option', { value: l.id }, pick(l.title, ctx.band))));
  if (ctx.query?.lesson && lessonById(ctx.query.lesson)) lessonSel.value = ctx.query.lesson;

  const form = h('form', { class: 'card', novalidate: true }, h('h2', {}, 'New entry'));
  for (const f of FIELDS) {
    const id = `jr-${f.key}`;
    const hintId = `${id}-hint`;
    controls[f.key] = h('textarea', { id, rows: '3', maxlength: '1000', 'aria-describedby': hintId });
    form.append(h('div', { class: 'field' },
      h('label', { for: id }, f.label, f.required ? '' : h('span', { class: 'muted', style: 'font-weight:400' }, ' (optional)')),
      h('span', { class: 'field-hint', id: hintId }, f.hint), controls[f.key]));
  }
  form.append(h('div', { class: 'field' }, h('label', { for: 'jr-lesson' }, 'Which lesson is this about? ', h('span', { class: 'muted', style: 'font-weight:400' }, '(optional)')), lessonSel),
    formMsg, h('div', { class: 'btn-row' }, h('button', { type: 'submit', class: 'btn btn-primary' }, 'Save entry')));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const entry = { id: uid('j') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), date: Date.now(), lesson: lessonSel.value || null };
    for (const f of FIELDS) entry[f.key] = controls[f.key].value.trim();
    if (!entry.prediction) {
      formMsg.replaceChildren(notice('Write what you predicted first — the other boxes are optional.', 'warn'));
      controls.prediction.focus();
      return;
    }
    ctx.store.update((s) => { s.journal.push(entry); });
    for (const f of FIELDS) controls[f.key].value = '';
    formMsg.replaceChildren(notice('Saved. Your entry is at the top of the list.', 'success'));
    paintList();
  });

  function paintList() {
    const entries = [...ctx.store.get().journal].sort((a, b) => (b.date || 0) - (a.date || 0));
    const sec = h('section', { class: 'section', 'aria-labelledby': 'jr-list' }, h('h2', { id: 'jr-list' }, `My entries (${entries.length})`));
    if (!entries.length) sec.append(h('p', { class: 'empty' }, 'No entries yet. Your first one will appear here.'));
    else sec.append(h('ul', { class: 'entry-list' }, entries.map((j) => {
      const l = j.lesson ? lessonById(j.lesson) : null;
      const del = btn('Delete', async () => {
        const ok = await confirmDialog({ title: 'Delete this entry?', message: 'This journal entry will be removed from this device.', confirmLabel: 'Delete', danger: true });
        if (!ok) return;
        ctx.store.update((s) => { s.journal = s.journal.filter((x) => x.id !== j.id); });
        paintList();
        listHost.querySelector('h2')?.setAttribute('tabindex', '-1');
        listHost.querySelector('h2')?.focus();
      }, 'btn btn-sm btn-danger', { 'aria-label': `Delete entry from ${formatDate(j.date)}` });
      return h('li', {}, h('article', { class: 'card journal-entry' },
        h('div', { class: 'q-head' }, h('h3', { style: 'margin:0' }, formatDate(j.date) || 'Entry'), del),
        l ? h('p', { class: 'small muted', style: 'margin:0' }, `Lesson: ${pick(l.title, ctx.band)}`) : null,
        h('dl', {}, FIELDS.filter((f) => j[f.key]).map((f) => [h('dt', {}, f.label), h('dd', {}, String(j[f.key]))]))));
    })));
    listHost.replaceChildren(sec);
  }

  const layout = h('div', { class: 'split' }, form, listHost);
  page.append(layout);
  paintList();
  return () => closeAllModals();
}
