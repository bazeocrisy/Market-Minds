// My Progress (#/progress). Everything shown comes from this device's saved progress.
import { h, pageHead, notice, linkBtn, btn, plural, skillName, worldTitle, lessonsInWorld, readyLessons, readySkillIds, formatDate, statBox, progressBar, confirmDialog, closeAllModals } from '../ui/dom.js';
import { worldCertificates, skillCertificates } from './certificates.js';
import { pick } from '../content/band.js';
import { WORLDS } from '../content/worlds.js';
import { lessonById } from '../content/lessons.js';
import { SKILLS, SKILL_IDS } from '../content/skills.js';
import { masteryFor, missQueue } from '../engine/index.js';

export const LEVEL_LABEL = {
  'not-started': 'Not started', introduced: 'Introduced', practicing: 'Practicing', 'needs-review': 'Needs review', mastered: 'Mastered'
};
export const levelBadge = (level) => h('span', { class: `level level-${level || 'not-started'}` }, LEVEL_LABEL[level] || 'Not started');
export function safeLevel(state, id) { try { return masteryFor(state, id)?.level || 'not-started'; } catch { return 'not-started'; } }

/** Mastery table shared with the Parent & Teacher view. Defaults to skills whose lesson is ready (lesson order). */
export function skillTable(state, ids = readySkillIds()) {
  return h('div', { class: 'table-wrap table-stack' }, h('table', {},
    h('caption', { class: 'sr-only' }, 'Skill mastery'),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Skill'), h('th', { scope: 'col' }, 'Level'),
      h('th', { scope: 'col' }, 'On your own'), h('th', { scope: 'col' }, 'With help'), h('th', { scope: 'col' }, 'Recent'))),
    h('tbody', {}, ids.map((id) => {
      const k = state.skills[id];
      const ind = k?.independent || { correct: 0, attempts: 0 };
      const ast = k?.assisted || { correct: 0, attempts: 0 };
      const recent = k?.recent || [];
      return h('tr', {},
        h('th', { scope: 'row' }, skillName(id), h('div', { class: 'small muted', style: 'font-weight:400' }, SKILLS[id]?.description || '')),
        h('td', { 'data-label': 'Level' }, levelBadge(safeLevel(state, id))),
        h('td', { 'data-label': 'On your own' }, `${ind.correct} of ${ind.attempts} correct`),
        h('td', { 'data-label': 'With help' }, `${ast.correct} of ${ast.attempts} correct`, k?.revealed ? h('div', { class: 'small muted' }, `${k.revealed} shown`) : null),
        h('td', { 'data-label': 'Recent' }, recent.length
          ? h('span', { class: 'recent-dots', role: 'img', 'aria-label': `Last ${recent.length} on-your-own answers: ${recent.filter(Boolean).length} correct` },
            recent.map((x) => h('i', { class: x ? '' : 'miss' })))
          : h('span', { class: 'muted' }, '—')));
    }))));
}

export function render(el, params, ctx) {
  const state = ctx.store.get();
  const page = h('section', { class: 'page' });
  el.append(page);
  page.append(pageHead({ eyebrow: 'My Progress', title: 'My progress', lead: 'Skills you’ve learned — not pretend profits made.' }));

  const ready = readyLessons();
  const done = ready.filter((l) => state.lessons[l.id]?.completed);
  const introduced = SKILL_IDS.filter((id) => state.skills[id]?.introduced);
  const levels = Object.fromEntries(SKILL_IDS.map((id) => [id, safeLevel(state, id)]));
  const mastered = SKILL_IDS.filter((id) => levels[id] === 'mastered');
  let queue = [];
  try { queue = (missQueue(state) || []).filter((id) => SKILLS[id]); } catch { queue = []; }

  page.append(h('div', { class: 'stats' },
    statBox(`${done.length} of ${ready.length}`, 'lessons completed'),
    statBox(introduced.length, introduced.length === 1 ? 'skill introduced' : 'skills introduced'),
    statBox(mastered.length, mastered.length === 1 ? 'skill mastered' : 'skills mastered'),
    statBox(queue.length, queue.length === 1 ? 'skill to review' : 'skills to review')));

  page.append(notice(h('div', {},
    h('p', {}, h('strong', {}, 'How mastery is earned. '),
      'A skill becomes Mastered when you answer its questions correctly on your own — first try, no hints — again and again, in Practice or on a Test.'),
    h('p', {}, 'Answers you get right after a hint or a retry count as “with help”. They show you’re learning, but they don’t count toward mastery. ',
      'Reading lessons, time spent and shown answers never count. If you start missing a mastered skill, it moves to “Needs review”.'))));

  // ----- review needs -----
  const review = h('section', { class: 'section' }, h('h2', {}, 'Needs review'));
  if (queue.length) {
    review.append(h('ul', {}, queue.map((id) => {
      const m = state.misses[id];
      return h('li', {}, h('strong', {}, skillName(id)), m ? ` — missed ${plural(m.count, 'time')}${Object.keys(m.misconceptions || {}).length ? `, ${plural(Object.keys(m.misconceptions).length, 'mix-up')} to work on` : ''}` : '');
    })), h('div', { class: 'btn-row' }, linkBtn('#/practice', 'Practice My Misses')));
  } else {
    review.append(h('p', { class: 'empty' }, 'Nothing to review right now. Missed questions from Practice and Tests will appear here.'));
  }
  page.append(review);

  // ----- skills -----
  page.append(h('section', { class: 'section' }, h('h2', {}, 'Skills'), skillTable(state)));

  // ----- certificates -----
  const wc = worldCertificates(state), sc = skillCertificates(state);
  const earned = [...wc, ...sc].filter((c) => c.earned);
  page.append(h('section', { class: 'section' }, h('h2', {}, 'Achievement Certificates'),
    h('p', {}, earned.length
      ? `You have earned ${plural(earned.length, 'certificate')}: ${earned.map((c) => (c.kind === 'world' ? worldTitle(c.world) : `${c.skill.name} Skill Badge`)).join(', ')}.`
      : 'No certificates yet. Skill Badges and World certificates are earned by mastering skills on your own.'),
    h('div', { class: 'btn-row' }, linkBtn('#/certificates', earned.length ? 'View and print certificates' : 'See what each certificate needs', 'btn'))));

  // ----- worlds -----
  const worlds = h('section', { class: 'section' }, h('h2', {}, 'Progress by world'));
  const grid = h('div', { class: 'grid grid-2' });
  for (const w of WORLDS) {
    const ls = lessonsInWorld(w).filter((l) => l.status === 'ready' && l.id);
    if (!ls.length) continue;
    const c = ls.filter((l) => state.lessons[l.id]?.completed).length;
    grid.append(h('div', { class: 'card' },
      h('h3', { class: 'card-title' }, worldTitle(w)),
      progressBar({ value: c, max: ls.length, label: 'Lessons complete', valueText: `${c} of ${ls.length}` }),
      h('ul', { style: 'margin-top:12px' }, ls.map((l) => {
        const p = state.lessons[l.id];
        return h('li', {}, h('a', { href: `#/learn/${l.id}/${p && !p.completed ? p.step : 1}` }, pick(l.title, ctx.band)),
          ' — ', p?.completed ? `completed ${formatDate(p.completedAt)}` : p ? `in progress (step ${p.step} of 6)` : 'not started');
      }))));
  }
  const planned = WORLDS.filter((w) => !lessonsInWorld(w).some((l) => l.status === 'ready')).length;
  worlds.append(grid.childElementCount ? grid : h('p', { class: 'empty' }, 'No lessons are ready yet.'));
  if (planned) worlds.append(h('p', { class: 'small muted', style: 'margin-top:12px' }, `${plural(planned, 'more world')} ${planned === 1 ? 'is' : 'are'} in development.`));
  page.append(worlds);

  // ----- tests -----
  const tests = h('section', { class: 'section' }, h('h2', {}, 'Recent test scores'));
  const recent = [...state.tests].reverse().slice(0, 8);
  if (recent.length) {
    tests.append(h('div', { class: 'table-wrap' }, h('table', {},
      h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Test'), h('th', { scope: 'col' }, 'Date'), h('th', { scope: 'col' }, 'Score'))),
      h('tbody', {}, recent.map((t) => {
        const l = lessonById(t.scope);
        const w = WORLDS.find((x) => x.id === t.scope);
        return h('tr', {}, h('td', {}, l ? pick(l.title, ctx.band) : w ? worldTitle(w) : String(t.scope)), h('td', {}, formatDate(t.date)), h('td', {}, `${t.score} of ${t.total}`));
      })))));
  } else {
    tests.append(h('p', { class: 'empty' }, 'No tests taken yet.'), h('div', { class: 'btn-row' }, linkBtn('#/test', 'Choose a test', 'btn')));
  }
  page.append(tests);

  // ----- reset -----
  page.append(h('section', { class: 'section card' },
    h('h2', {}, 'Start over'),
    h('p', {}, 'This erases all lessons, practice, tests, journal entries and your grade choice on this device. It can’t be undone.'),
    h('div', { class: 'btn-row' }, btn('Reset my progress', async () => {
      const ok = await confirmDialog({ title: 'Reset all progress?', message: 'Everything saved on this device will be erased. This can’t be undone.', confirmLabel: 'Yes, erase it', cancelLabel: 'Keep my progress', danger: true });
      if (!ok) return;
      ctx.store.reset();
      ctx.go('#/');
    }, 'btn btn-danger'))));

  return () => closeAllModals();
}
