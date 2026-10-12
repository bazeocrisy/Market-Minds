// Tap-a-word. Markup in content: [[termId]] or [[termId|shown words]].
//   renderRichText(text, band) → DocumentFragment with <button class="term"> for known terms
//   plainText(text)            → the same text without markup (for Read to Me)
//   openTerm(id, band, opener) → opens the word dialog
//   termDetails(entry, band)   → definition / example / visual / Hear it block (dialog + dictionary)
import { termById } from '../content/glossary.js';
import { pick } from '../content/band.js';
import { h, openModal } from './dom.js';
import { isSupported, speak, stopAll } from './speech.js';
import { visualEl } from './art.js';

const RX = /\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g;

export function plainText(text) {
  return String(text ?? '').replace(RX, (_, id, shown) => shown || termById(id.trim())?.term || id.trim());
}

export function renderRichText(text, band = 'explorer') {
  const frag = document.createDocumentFragment();
  const s = String(text ?? '');
  let last = 0;
  for (const m of s.matchAll(RX)) {
    if (m.index > last) frag.append(s.slice(last, m.index));
    const id = m[1].trim();
    const entry = termById(id);
    const shown = m[2] || entry?.term || id;
    if (entry) {
      const b = h('button', { type: 'button', class: 'term', 'aria-haspopup': 'dialog', title: `What does “${entry.term}” mean?` }, shown);
      b.addEventListener('click', () => openTerm(id, band, b));
      frag.append(b);
    } else {
      frag.append(shown);
    }
    last = m.index + m[0].length;
  }
  if (last < s.length) frag.append(s.slice(last));
  return frag;
}

/** Paragraph helper: <p> with rich text. */
export const richP = (text, band, attrs = {}) => h('p', attrs, renderRichText(text, band));

export function hearButton(getText, label = 'Hear it', cls = 'btn btn-sm') {
  if (!isSupported()) return null;
  const b = h('button', { type: 'button', class: cls }, '🔊 ' + label);
  b.addEventListener('click', () => speak(typeof getText === 'function' ? getText() : getText));
  return b;
}

export function termDetails(entry, band = 'explorer', { headingLevel = null, hear = true } = {}) {
  const def = plainText(pick(entry.def, band));
  const example = pick(entry.example, band);
  const wrap = h('div', { class: 'term-details' });
  if (headingLevel) wrap.append(h(`h${headingLevel}`, {}, entry.term));
  if (entry.say) wrap.append(h('p', { class: 'term-say' }, 'Say it: ', h('strong', {}, entry.say)));
  wrap.append(h('p', { class: 'term-def' }, renderRichText(pick(entry.def, band), band)));
  if (example) wrap.append(h('p', { class: 'term-example' }, h('span', { class: 'label' }, 'Example: '), renderRichText(example, band)));
  if (entry.visual) { const v = visualEl(entry.visual, band); if (v) wrap.append(v); }
  if (hear) {
    const b = hearButton(() => `${entry.term}. ${def}${example ? ' For example: ' + plainText(example) : ''}`);
    if (b) wrap.append(h('div', { class: 'btn-row' }, b));
  }
  return wrap;
}

export function openTerm(id, band = 'explorer', opener = document.activeElement) {
  const entry = termById(id);
  if (!entry) return null;
  return openModal({
    title: entry.term,
    returnFocus: opener,
    build: () => termDetails(entry, band),
    actions: ({ close }) => [h('button', { type: 'button', class: 'btn btn-primary', on: { click: () => close(true) } }, 'Got it')],
    onClose: () => stopAll()
  });
}
