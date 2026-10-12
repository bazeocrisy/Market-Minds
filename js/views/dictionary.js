// Market Dictionary (#/dictionary): searchable glossary with grade-band definitions and Hear it.
import { h, pageHead, notice, uid, sameWorld, worldTitle, plural, closeAllModals } from '../ui/dom.js';
import { termDetails, plainText } from '../ui/vocab.js';
import { stopAll } from '../ui/speech.js';
import { pick } from '../content/band.js';
import { GLOSSARY } from '../content/glossary.js';
import { WORLDS } from '../content/worlds.js';

export function render(el, params, ctx) {
  const band = ctx.band;
  const page = h('section', { class: 'page page-narrow' });
  el.append(page);
  page.append(pageHead({ eyebrow: 'Market Dictionary', title: 'Market words', lead: 'Look up any word from the lessons. Tap “Hear it” to listen.' }));
  if (!GLOSSARY.length) { page.append(notice('The dictionary is being written.', 'warn')); return () => {}; }

  const entries = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
  const worlds = WORLDS.filter((w) => entries.some((e) => sameWorld(w, e.world)));
  const searchId = uid('dict-search');
  const worldId = uid('dict-world');
  const search = h('input', { type: 'search', id: searchId, autocomplete: 'off', placeholder: 'Try “price” or “buyer”', value: ctx.query?.q || '' });
  const worldSel = h('select', { id: worldId }, h('option', { value: '' }, 'All worlds'), worlds.map((w) => h('option', { value: w.id }, worldTitle(w))));
  const count = h('p', { class: 'small muted', 'aria-live': 'polite', role: 'status' });
  const list = h('ul', { class: 'entry-list' });

  page.append(h('div', { class: 'dict-controls' },
    h('div', { class: 'field' }, h('label', { for: searchId }, 'Search words'), search),
    h('div', { class: 'field' }, h('label', { for: worldId }, 'World'), worldSel)), count, list);

  const items = entries.map((e) => {
    const text = `${e.term} ${plainText(pick(e.def, band))} ${plainText(pick(e.example, band) || '')}`.toLowerCase();
    const li = h('li', { id: `term-${e.id}` }, h('article', { class: 'card dict-entry' }, termDetails(e, band, { headingLevel: 2 })));
    return { e, li, text };
  });
  list.append(...items.map((x) => x.li));

  let timer = 0;
  const apply = () => {
    const q = search.value.trim().toLowerCase();
    const w = worldSel.value;
    let shown = 0;
    for (const x of items) {
      const ok = (!q || x.text.includes(q)) && (!w || sameWorld(w, x.e.world));
      x.li.hidden = !ok;
      if (ok) shown++;
    }
    count.textContent = shown ? `${plural(shown, 'word')} shown` : 'No words match. Try a shorter search.';
  };
  search.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(apply, 120); });
  worldSel.addEventListener('change', apply);
  apply();

  return () => { clearTimeout(timer); stopAll(); closeAllModals(); };
}
