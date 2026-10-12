// Parent & Teacher view (#/parent): read-only summary of the curriculum and this device's progress.
import { h, pageHead, notice, btn, linkBtn, plural, skillName, worldTitle, worldOf, readyLessons, closeAllModals } from '../ui/dom.js';
import { pick, BANDS } from '../content/band.js';
import { termById } from '../content/glossary.js';
import { SKILLS } from '../content/skills.js';
import { missQueue } from '../engine/index.js';
import { skillTable } from './progress.js';

export function render(el, params, ctx) {
  const state = ctx.store.get();
  const page = h('section', { class: 'page' });
  el.append(page);
  page.append(pageHead({
    eyebrow: 'Parent & Teacher',
    title: 'Parent & teacher view',
    lead: 'What each ready lesson teaches, and how this learner is doing on this device.'
  }));
  page.append(h('div', { class: 'btn-row no-print', style: 'margin-top:0;margin-bottom:24px' },
    btn('Print this page', () => window.print(), 'btn btn-primary'), linkBtn('#/progress', 'Learner’s My Progress page', 'btn')));
  page.append(notice(h('div', {},
    h('p', {}, h('strong', {}, 'Privacy: '), 'Market Minds has no accounts and collects no names. Progress is saved only in this browser on this device — clearing browser data or using “Reset my progress” erases it.'),
    h('p', {}, h('strong', {}, 'Safety: '), 'All prices are pretend. Market Minds teaches ideas about markets and risk; it never connects to real trading. Futures involve substantial risk, including losses larger than the margin deposit, and are not suitable for children to trade.'))));

  // ----- this device's progress -----
  const band = state.band ? BANDS[state.band] : null;
  let queue = [];
  try { queue = (missQueue(state) || []).filter((id) => SKILLS[id]); } catch { queue = []; }
  const ready = readyLessons();
  page.append(h('section', { class: 'section' },
    h('h2', {}, 'This learner’s progress'),
    h('p', {}, `Grade level chosen: ${band ? `${band.label} (${band.name})` : 'not chosen yet'}. `,
      `Lessons completed: ${ready.filter((l) => state.lessons[l.id]?.completed).length} of ${ready.length}. `,
      `Tests taken: ${state.tests.length}.`),
    h('p', { class: 'small muted' }, '“On your own” = first-try correct with no hint (counts toward mastery). “With help” = correct after a hint or retry.'),
    skillTable(state),
    h('h3', { style: 'margin-top:24px' }, 'Needs review'),
    queue.length
      ? h('ul', {}, queue.map((id) => h('li', {}, `${skillName(id)} — missed ${plural(state.misses[id]?.count || 0, 'time')}`)))
      : h('p', { class: 'empty' }, 'No skills are waiting for review.')));

  // ----- curriculum -----
  const cur = h('section', { class: 'section' }, h('h2', {}, 'Lesson objectives and vocabulary'));
  if (!ready.length) cur.append(h('p', { class: 'empty' }, 'No lessons are ready yet.'));
  for (const l of ready) {
    const w = worldOf(l);
    // objectives: BandValue<string[]> (also tolerates an array of band strings)
    const objectivesFor = (b) => {
      const v = pick(l.objectives, b);
      return Array.isArray(v) ? v.map((o) => pick(o, b)).filter(Boolean) : v ? [String(v)] : [];
    };
    const list = (b) => {
      const items = objectivesFor(b);
      return items.length ? h('ul', {}, items.map((o) => h('li', {}, o))) : h('p', { class: 'empty' }, 'Not listed yet.');
    };
    const vocab = (l.vocab || []).map((id) => termById(id)?.term || id);
    const mins = (b) => pick(l.minutes, b);
    cur.append(h('article', { class: 'card', style: 'margin-top:16px' },
      h('p', { class: 'eyebrow' }, w ? worldTitle(w) : 'Lesson'),
      h('h3', {}, pick(l.title, 'explorer')),
      h('p', { class: 'small muted' },
        l.minutes ? `About ${mins('explorer')} minutes (grades 3–5) / ${mins('analyst')} minutes (grades 6–8) · ` : '',
        `Skills: ${(l.skills || []).map(skillName).join(', ')}`),
      h('div', { class: 'grid grid-2' },
        h('div', {}, h('h4', {}, 'Grades 3–5 objectives'), list('explorer')),
        h('div', {}, h('h4', {}, 'Grades 6–8 objectives'), list('analyst'))),
      h('p', { style: 'margin:12px 0 0' }, h('strong', {}, 'Vocabulary: '), vocab.length ? vocab.join(', ') : '—')));
  }
  page.append(cur);
  page.append(h('p', { class: 'print-only small' }, 'Printed from Market Minds — progress shown is from one device only.'));
  return () => closeAllModals();
}
