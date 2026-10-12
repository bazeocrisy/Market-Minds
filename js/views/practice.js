// Practice — chooser (#/practice) and active session (#/practice/session).
// Practice is coached: hints, retries, "Show me how", "Show answer". It never auto-advances after an error.
// Credit rules belong to the engine; this view only shows a running tally that mirrors them.
import { h, pageHead, notice, chip, linkBtn, btn, plural, skillName, worldTitle, worldOf, lessonsInWorld, readyLessons, readySkillIds, statBox, closeAllModals } from '../ui/dom.js';
import { renderQuestion } from '../ui/question.js';
import { stopAll } from '../ui/speech.js';
import { WORLDS } from '../content/worlds.js';
import { lessonById } from '../content/lessons.js';
import { SKILLS } from '../content/skills.js';
import { createPracticeSession, missQueue } from '../engine/index.js';

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'challenge', label: 'Challenge' },
  { id: 'adaptive', label: 'Adaptive', hint: 'Starts easy, gets harder as you get answers right' }
];
const MODE_LABEL = { practice: 'Practice', misses: 'Practice My Misses', mixed: 'Mixed Review' };

// The live session survives navigation inside the app but not a page refresh (by design).
let active = null;      // { session, opts, title }
let lastSummary = null; // { title, tally, skills, opts }

export function render(el, params, ctx) {
  const cleanups = [];
  const page = h('section', { class: 'page' });
  el.append(page);
  if (params[0] === 'session') renderSession(page, ctx, cleanups);
  else if (params[0] === 'summary') renderSummary(page, ctx);
  else renderChooser(page, ctx);
  return () => { cleanups.forEach((f) => f()); stopAll(); closeAllModals(); };
}

/** Start a session and go to it. Shared with the lesson warm-up and the test results page. */
export function startPractice(ctx, { skills, difficulty = 'adaptive', mode = 'practice', title }) {
  const opts = { band: ctx.band, skills, difficulty, mode };
  const session = createPracticeSession(opts, ctx.store);
  active = { session, opts, title: title || MODE_LABEL[mode] || 'Practice' };
  ctx.go('#/practice/session');
}

// ---------------------------------------------------------------- chooser
function renderChooser(page, ctx) {
  const state = ctx.store.get();
  page.append(pageHead({
    eyebrow: 'Practice',
    title: 'Practice makes progress',
    lead: 'Try fresh questions with hints and coaching. Mistakes are part of learning — you can always try again.'
  }));

  const ready = readyLessons();
  if (!ready.length) {
    page.append(notice('Practice opens as soon as the first lesson is ready. Lessons are still being written.', 'warn'));
    return;
  }

  // ----- quick options: misses + mixed review -----
  const queue = safeMissQueue(state);
  const introduced = Object.entries(state.skills).filter(([id, k]) => k.introduced && SKILLS[id]).map(([id]) => id);
  const readySkills = readySkillIds();
  const mixedSkills = introduced.filter((id) => readySkills.includes(id));
  const mixedPool = mixedSkills.length ? mixedSkills : readySkills;

  const missesNoteId = 'misses-note';
  const missesBtn = h('button', {
    type: 'button', class: 'btn btn-primary btn-lg btn-block', disabled: queue.length === 0,
    'aria-describedby': missesNoteId
  }, 'Practice My Misses');
  missesBtn.addEventListener('click', () => startPractice(ctx, { skills: queue, mode: 'misses', difficulty: 'adaptive', title: 'Practice My Misses' }));
  const mixedBtn = btn('Mixed Review', () => startPractice(ctx, { skills: mixedPool, mode: 'mixed', difficulty: 'adaptive', title: 'Mixed Review' }), 'btn btn-gold btn-lg btn-block');

  page.append(h('div', { class: 'grid grid-2' },
    h('div', { class: 'card' },
      h('h2', { class: 'card-title' }, 'Practice My Misses'),
      h('p', { class: 'card-text', id: missesNoteId }, queue.length
        ? `${plural(queue.length, 'skill')} waiting for review: ${queue.map(skillName).join(', ')}.`
        : 'No misses yet. When you miss a question in Practice or on a Test, that skill shows up here so you can review it.'),
      missesBtn),
    h('div', { class: 'card' },
      h('h2', { class: 'card-title' }, 'Mixed Review'),
      h('p', { class: 'card-text' }, mixedSkills.length
        ? `Mixes questions from the ${plural(mixedSkills.length, 'skill')} you have started.`
        : 'Mixes questions from every ready lesson. Finish a lesson first to review just what you’ve learned.'),
      mixedBtn)));

  // ----- build-your-own form -----
  const worlds = WORLDS.filter((w) => lessonsInWorld(w).some((l) => l.status === 'ready'));
  const q = ctx.query || {};
  let preLesson = q.lesson ? lessonById(q.lesson) : null;
  if (preLesson && preLesson.status !== 'ready') preLesson = null;
  const preSkill = q.skill && SKILLS[q.skill] && readySkills.includes(q.skill) ? q.skill : '';
  if (!preLesson && preSkill) preLesson = lessonById(SKILLS[preSkill].lesson) || null;

  const worldSel = h('select', { id: 'pr-world' }, worlds.map((w) => h('option', { value: w.id }, worldTitle(w))));
  const lessonSel = h('select', { id: 'pr-lesson' });
  const skillSel = h('select', { id: 'pr-skill' });
  const startWorld = preLesson ? worldOf(preLesson) : worlds[0];
  if (startWorld) worldSel.value = startWorld.id;

  const fillLessons = (keep) => {
    const w = worlds.find((x) => x.id === worldSel.value) || worlds[0];
    const ls = lessonsInWorld(w).filter((l) => l.status === 'ready');
    lessonSel.replaceChildren(h('option', { value: '' }, 'All ready lessons in this world'),
      ls.map((l) => h('option', { value: l.id }, `Lesson ${l.number ?? ''}: ${l.title}`)));
    if (keep && ls.some((l) => l.id === keep)) lessonSel.value = keep;
  };
  const skillsForSelection = () => {
    if (lessonSel.value) return (lessonById(lessonSel.value)?.skills || []).filter((s) => SKILLS[s]);
    const w = worlds.find((x) => x.id === worldSel.value);
    return readySkills.filter((s) => lessonsInWorld(w).some((l) => l.status === 'ready' && (l.skills || []).includes(s)));
  };
  const fillSkills = (keep) => {
    const ss = skillsForSelection();
    skillSel.replaceChildren(h('option', { value: '' }, 'All skills listed above'), ss.map((s) => h('option', { value: s }, skillName(s))));
    if (keep && ss.includes(keep)) skillSel.value = keep;
  };
  fillLessons(preLesson?.id);
  fillSkills(preSkill);
  worldSel.addEventListener('change', () => { fillLessons(); fillSkills(); });
  lessonSel.addEventListener('change', () => fillSkills());

  const diffs = h('div', { class: 'radio-cards' }, DIFFICULTIES.map((d) => h('label', {},
    h('input', { type: 'radio', name: 'pr-diff', value: d.id, checked: d.id === 'adaptive' }),
    h('span', {}, d.label))));

  const msg = h('div', { 'aria-live': 'polite' });
  const form = h('form', { class: 'card section', novalidate: true },
    h('h2', {}, 'Choose what to practice'),
    h('div', { class: 'grid grid-3' },
      h('div', { class: 'field' }, h('label', { for: 'pr-world' }, 'World'), worldSel),
      h('div', { class: 'field' }, h('label', { for: 'pr-lesson' }, 'Lesson'), lessonSel),
      h('div', { class: 'field' }, h('label', { for: 'pr-skill' }, 'Skill'), skillSel)),
    h('fieldset', { class: 'fieldset' }, h('legend', {}, 'Difficulty'),
      h('p', { class: 'field-hint' }, 'Adaptive starts easy and steps up when you answer on your own.'), diffs),
    msg,
    h('div', { class: 'btn-row' }, h('button', { type: 'submit', class: 'btn btn-primary btn-lg' }, 'Start practice')));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const skills = skillSel.value ? [skillSel.value] : skillsForSelection();
    if (!skills.length) { msg.replaceChildren(notice('There are no ready skills to practice here yet. Choose another lesson.', 'warn')); return; }
    const difficulty = form.querySelector('input[name="pr-diff"]:checked')?.value || 'adaptive';
    const lesson = lessonSel.value ? lessonById(lessonSel.value) : null;
    const title = skillSel.value ? skillName(skillSel.value) : lesson ? lesson.title : 'Practice';
    startPractice(ctx, { skills, difficulty, mode: 'practice', title });
  });
  page.append(form);

  page.append(h('p', { class: 'small muted section' },
    'How credit works: a question answered correctly on the first try with no hint counts as ',
    h('strong', {}, 'on your own'), '. Correct after a hint or a retry counts as ', h('strong', {}, 'with help'),
    '. Only “on your own” answers build mastery. ', h('a', { href: '#/progress' }, 'See My Progress')));
}

function safeMissQueue(state) {
  try { return (missQueue(state) || []).filter((id) => SKILLS[id]); } catch (e) { console.error(e); return []; }
}

// ---------------------------------------------------------------- session
function renderSession(page, ctx, cleanups) {
  if (!active) {
    page.append(pageHead({ eyebrow: 'Practice', title: 'Your practice session ended' }),
      h('p', {}, 'Practice sessions are not kept after the page reloads. Your progress from it is already saved.'),
      h('div', { class: 'btn-row' }, linkBtn('#/practice', 'Start a new practice session')));
    return;
  }
  const { session, title, opts } = active;
  page.classList.add('page-narrow');
  page.append(pageHead({ eyebrow: MODE_LABEL[opts.mode] || 'Practice', title }));
  const host = h('div');
  page.append(host);
  const runner = mountSession(host, session, {
    band: ctx.band,
    onDone: (tally) => {
      lastSummary = { title, tally, opts };
      active = null;
      ctx.go('#/practice/summary');
    }
  });
  cleanups.push(runner.destroy);
}

/**
 * Run practice questions from an engine session inside `host`.
 * opts: { band, limit?, onDone(tally), doneLabel?, intro? }. Returns { destroy }.
 * tally = { answered, own, help, shown, skills:Set }
 */
export function mountSession(host, session, { band, limit = Infinity, onDone, doneLabel = 'End session' } = {}) {
  const tally = { answered: 0, own: 0, help: 0, shown: 0, skills: new Set() };
  let count = 0;
  let destroyed = false;

  const tallyEl = h('p', { class: 'tally' });
  const paintTally = () => tallyEl.replaceChildren(
    h('span', {}, 'On your own: ', h('strong', {}, String(tally.own))),
    h('span', {}, 'With help: ', h('strong', {}, String(tally.help))),
    h('span', {}, 'Answers shown: ', h('strong', {}, String(tally.shown))));
  const body = h('div', { class: 'lesson-step' });
  const endBtn = btn(doneLabel, () => onDone?.(tally), 'btn btn-ghost');
  host.append(tallyEl, body, h('div', { class: 'btn-row' }, endBtn));
  paintTally();

  const showQuestion = () => {
    if (destroyed) return;
    const cur = session.current;
    if (!cur || !cur.question) {
      body.replaceChildren(notice(count ? 'That’s every question in this set — nice work.' : 'There are no questions available for this choice yet.', count ? 'success' : 'warn'));
      endBtn.textContent = count ? 'See summary' : 'Back';
      endBtn.className = 'btn btn-primary';
      return;
    }
    const q = cur.question;
    let misses = 0, hints = 0, finished = false;
    tally.skills.add(q.skill);
    const next = h('div', { class: 'btn-row' });
    const qnum = Number.isFinite(limit) ? `Question ${count + 1} of ${limit}` : `Question ${count + 1}`;
    const head = h('div', { class: 'q-head' },
      h('span', { class: 'eyebrow', style: 'margin:0' }, qnum),
      h('span', { class: 'cluster' }, chip(skillName(q.skill), 'ready'), q.difficulty ? chip(cap(q.difficulty)) : null));

    const finish = (kind) => {
      finished = true;
      tally.answered++;
      tally[kind]++;
      paintTally();
      const last = count + 1 >= limit;
      const nb = btn(last ? 'Finish' : 'Next question →', () => {
        count++;
        if (count >= limit) { onDone?.(tally); return; }
        try { session.next(); } catch (e) { console.error(e); }
        showQuestion();
        body.querySelector('.q-prompt')?.setAttribute('tabindex', '-1');
        body.querySelector('.q-prompt')?.focus();
      }, 'btn btn-primary btn-lg');
      next.replaceChildren(nb);
      nb.focus();
    };

    const view = renderQuestion(q, {
      band, mode: 'practice',
      onHint: () => {
        let t = null;
        try { t = session.hint(); } catch (e) { console.error(e); }
        if (t) hints++;
        return t || null;
      },
      onSubmit: (response) => {
        if (finished) return;
        let res;
        try { res = session.submit(response); } catch (e) { console.error(e); return; }
        if (res.correct) {
          view.showFeedback({ correct: true, feedback: res.feedback, explanation: res.explanation || q.explanation });
          view.lock();
          finish(misses === 0 && hints === 0 ? 'own' : 'help');
        } else {
          misses++;
          view.showFeedback({
            correct: false, feedback: res.feedback, misconception: res.misconception,
            teach: misses >= 2 ? (res.teach || q.teach) : null
          });
          const tryAgain = btn('Try again', () => { view.clearFeedback(); view.focus(); next.replaceChildren(); }, 'btn');
          next.replaceChildren(tryAgain);
        }
      },
      onReveal: () => {
        if (finished) return;
        let r = {};
        try { r = session.reveal() || {}; } catch (e) { console.error(e); }
        view.reveal({ answer: r.answer ?? q.answer, explanation: r.explanation || q.explanation });
        finish('shown');
      }
    });
    body.replaceChildren(head, view.el, next);
  };
  showQuestion();
  return { destroy() { destroyed = true; } };
}

const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);

// ---------------------------------------------------------------- summary
function renderSummary(page, ctx) {
  if (!lastSummary) {
    page.append(pageHead({ eyebrow: 'Practice', title: 'No practice summary to show' }),
      h('p', {}, 'Summaries are shown right after a session and aren’t kept after the page reloads.'),
      h('div', { class: 'btn-row' }, linkBtn('#/practice', 'Go to Practice'), linkBtn('#/progress', 'See My Progress', 'btn')));
    return;
  }
  const { title, tally, opts } = lastSummary;
  page.classList.add('page-narrow');
  page.append(pageHead({ eyebrow: 'Practice summary', title: tally.answered ? 'Nice practice!' : 'Session ended', lead: title }));
  page.append(h('div', { class: 'stats' },
    statBox(tally.answered, 'questions finished'),
    statBox(tally.own, 'on your own'),
    statBox(tally.help, 'with help'),
    statBox(tally.shown, 'answers shown')));
  if (tally.skills.size) page.append(h('p', {}, 'Skills practiced: ', [...tally.skills].map(skillName).join(', '), '.'));
  page.append(notice(h('p', {},
    '“On your own” answers (first try, no hint) count toward mastery. “With help” answers show you’re learning. ',
    'Shown answers don’t count, and missed skills go to Practice My Misses.')));
  const again = btn('Practice again', () => startPractice(ctx, { ...opts, band: ctx.band, title }), 'btn btn-primary');
  page.append(h('div', { class: 'btn-row' }, again, linkBtn('#/practice', 'Choose something else', 'btn'), linkBtn('#/progress', 'See My Progress', 'btn btn-ghost')));
}


