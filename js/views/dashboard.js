// Learning Dashboard (#/). Every number shown here is computed from saved progress — never invented.
import { h, progressBar, plural, worldOf, worldTitle, readyLessons, closeAllModals } from '../ui/dom.js';
import { pick, BANDS } from '../content/band.js';
import { lessonById } from '../content/lessons.js';
import { SKILL_IDS } from '../content/skills.js';
import { masteryFor, missQueue } from '../engine/index.js';

const ICONS = {
  learn: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>',
  practice: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
  thinking: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z"/>',
  lab: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-7"/>',
  test: '<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>',
  progress: '<path d="M6 20V10M12 20V4M18 20v-7"/>'
};
function icon(name) {
  const span = h('span', { class: 'card-icon', 'aria-hidden': 'true' });
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
  return span;
}

export function render(el, params, ctx) {
  const state = ctx.store.get();
  const chosenBand = state.band;
  const band = ctx.band;
  const ready = readyLessons();
  const completed = ready.filter((l) => state.lessons[l.id]?.completed).length;
  const levels = SKILL_IDS.map((id) => { try { return masteryFor(state, id)?.level; } catch { return null; } });
  const mastered = levels.filter((l) => l === 'mastered').length;
  let misses = [];
  try { misses = missQueue(state) || []; } catch { misses = []; }
  const hasProgress = Object.keys(state.lessons).length > 0;

  // Current lesson: saved position (moving on if that lesson is finished), else the first ready lesson.
  let cur = state.current && lessonById(state.current.lessonId);
  let curStep = state.current?.step || 1;
  if (cur && cur.status !== 'ready') cur = null;
  if (cur && state.lessons[cur.id]?.completed) {
    const next = ready.find((l) => !state.lessons[l.id]?.completed);
    if (next) { cur = next; curStep = state.lessons[next.id]?.step || 1; }
  }
  if (!cur) { cur = ready.find((l) => !state.lessons[l.id]?.completed) || ready[0] || null; curStep = cur ? state.lessons[cur.id]?.step || 1 : 1; }
  const world = cur ? worldOf(cur) : null;
  const allDone = ready.length > 0 && completed === ready.length;

  const page = h('section', { class: 'page' });
  el.append(page);

  // ---------- hero ----------
  const name = BANDS[band]?.name || 'Market Explorer';
  const hero = h('section', { class: 'hero', 'aria-labelledby': 'hero-title' });
  const copy = h('div', {},
    h('p', { class: 'eyebrow' }, 'Your money & markets learning'),
    h('h1', { id: 'hero-title', tabindex: '-1' }, chosenBand ? `Welcome, ${name}!` : 'Welcome to Market Minds!'));

  if (!chosenBand) {
    copy.append(
      h('p', {}, 'First, choose your grade level. You can change it any time at the top of the page. No names or sign-ups — ever.'),
      h('div', { class: 'grade-choice', role: 'group', 'aria-label': 'Choose your grade level' },
        h('button', { type: 'button', 'data-band': 'explorer', 'aria-pressed': 'false' }, h('strong', {}, 'Grades 3–5'), h('span', {}, 'Market Explorer')),
        h('button', { type: 'button', 'data-band': 'analyst', 'aria-pressed': 'false' }, h('strong', {}, 'Grades 6–8'), h('span', {}, 'Market Analyst'))));
  } else {
    copy.append(h('p', {}, 'Learn how prices, markets and smart decisions work — one short lesson at a time.'));
    if (cur) {
      const href = `#/learn/${cur.id}/${allDone ? 1 : curStep}`;
      const label = !hasProgress ? 'Start Learning' : allDone ? 'Review a lesson' : 'Continue Learning';
      copy.append(h('div', { class: 'btn-row' },
        h('a', { class: 'btn btn-primary btn-lg', href }, `${label} →`),
        h('a', { class: 'btn', href: '#/learn' }, 'All lessons')));
    } else {
      copy.append(h('p', {}, 'Lessons are being written right now — please check back soon.'));
    }
  }
  copy.append(h('p', { class: 'hero-note' }, 'Pretend prices · No real trading · Progress stays on this device'));

  const side = h('div', { class: 'hero-current' });
  if (cur) {
    side.append(
      h('p', { class: 'label' }, 'Current world'),
      h('p', { class: 'value' }, world ? worldTitle(world) : '—'),
      h('p', { class: 'label' }, hasProgress ? 'Current lesson' : 'First lesson'),
      h('p', { class: 'value' }, `${pick(cur.title, band)}${hasProgress && !state.lessons[cur.id]?.completed ? ` · step ${curStep} of 6` : ''}`),
      progressBar({ value: completed, max: ready.length, label: 'Lessons complete', valueText: `${completed} of ${ready.length}` }),
      h('p', { class: 'small', style: 'margin:12px 0 0' }, `${plural(mastered, 'skill')} mastered`));
  } else {
    side.append(h('p', { class: 'value' }, 'No lessons are ready yet.'));
  }
  hero.append(h('div', { class: 'hero-grid' }, copy, side));
  page.append(hero);

  // ---------- six activity cards ----------
  const thinkingDone = Object.keys(state.thinking || {}).length;
  const lastTest = state.tests[state.tests.length - 1];
  const cards = [
    { href: '#/learn', icon: 'learn', title: 'Learn', text: 'Stories, key words and pictures that explain big ideas.', status: ready.length ? `${completed} of ${ready.length} lessons complete` : 'Lessons in development' },
    { href: '#/practice', icon: 'practice', title: 'Practice', text: 'Fresh questions with hints, coaching and retries.', status: misses.length ? `${plural(misses.length, 'skill')} ready for review` : 'No misses to review yet' },
    { href: '#/thinking', icon: 'thinking', title: 'Thinking Lab', text: 'Explain your choices and investigate what could happen.', status: thinkingDone ? `${plural(thinkingDone, 'prompt')} answered` : 'Not started yet' },
    { href: '#/market-lab', icon: 'lab', title: 'Market Lab', text: 'Explore made-up prices — gains, losses and choosing to wait.', status: state.lab?.runs ? `${plural(state.lab.runs, 'practice run')} · pretend prices` : 'Pretend prices only' },
    { href: '#/test', icon: 'test', title: 'Test', text: 'Show what you know. No hints until you submit.', status: lastTest ? `Last score: ${lastTest.score} of ${lastTest.total}` : 'No tests taken yet' },
    { href: '#/progress', icon: 'progress', title: 'My Progress', text: 'Skills you’ve learned — not pretend profits.', status: `${plural(mastered, 'skill')} mastered of ${SKILL_IDS.length}` }
  ];
  page.append(h('section', { class: 'section', 'aria-labelledby': 'modes-title' },
    h('h2', { id: 'modes-title' }, 'Ways to learn'),
    h('ul', { class: 'grid grid-3', style: 'list-style:none;padding:0;margin:0' }, cards.map((c) => h('li', { style: 'margin:0' },
      h('a', { class: 'card card-link', href: c.href, style: 'height:100%' },
        icon(c.icon),
        h('h3', { class: 'card-title' }, c.title),
        h('p', { class: 'card-text' }, c.text),
        h('p', { class: 'card-status' }, c.status)))))));

  // ---------- secondary links ----------
  page.append(h('nav', { class: 'section', 'aria-label': 'More to explore' },
    h('h2', { class: 'h3', style: 'font-size:1.1875rem' }, 'More to explore'),
    h('ul', { class: 'quick-links' },
      h('li', {}, h('a', { href: '#/dictionary' }, 'Market Dictionary')),
      h('li', {}, h('a', { href: '#/stories' }, 'Market Stories')),
      h('li', {}, h('a', { href: '#/journal' }, 'Decision Journal')),
      h('li', {}, h('a', { href: '#/parent' }, 'Parent & Teacher View')))));

  // ---------- purpose ----------
  page.append(h('section', { class: 'section purpose', 'aria-labelledby': 'purpose-title' },
    h('div', {},
      h('p', { class: 'eyebrow' }, 'Our purpose'),
      h('h2', { id: 'purpose-title' }, 'Financial learning belongs to everyone.'),
      h('p', {}, 'Created with Black learners in mind and open to all, Market Minds connects everyday life to the language of markets. We teach curiosity, mathematics, uncertainty, responsibility, and confidence—not risky shortcuts to wealth.')),
    h('aside', {}, h('strong', {}, 'Built for grades 3–8'),
      h('p', { style: 'margin:8px 0 0' }, 'Age-appropriate paths for elementary and middle school students, with visual explanations and accessible practice.'))));

  return () => closeAllModals();
}
