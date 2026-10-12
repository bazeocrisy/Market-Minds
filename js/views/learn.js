// Learn — worlds + lessons (#/learn) and the lesson player (#/learn/<lessonId>/<step>, step 1-based).
// Steps (fixed order): discover → definition → visual → together → check → next.
import { h, pageHead, notice, chip, linkBtn, btn, progressBar, paragraphs, worldOf, worldTitle, lessonsInWorld, skillName, plural, closeAllModals } from '../ui/dom.js';
import { renderRichText, plainText } from '../ui/vocab.js';
import { readToMe, stopAll } from '../ui/speech.js';
import { renderArt, visualEl } from '../ui/art.js';
import { renderQuestion } from '../ui/question.js';
import { pick } from '../content/band.js';
import { WORLDS } from '../content/worlds.js';
import { LESSONS, lessonById } from '../content/lessons.js';
import { termById } from '../content/glossary.js';
import { SKILLS } from '../content/skills.js';
import { checkResponse, createPracticeSession, masteryFor } from '../engine/index.js';
import { mountSession } from './practice.js';

const KINDS = ['discover', 'definition', 'visual', 'together', 'check', 'next'];
const KIND_LABEL = { discover: 'Discover', definition: 'Key word', visual: 'See it', together: 'Try together', check: 'Check understanding', next: 'Next step' };
const warmupHandled = new Set(); // lessons whose warm-up offer was taken or skipped this visit

export function render(el, params, ctx) {
  const cleanups = [];
  const page = h('section', { class: 'page' });
  el.append(page);
  if (!params[0]) renderWorlds(page, ctx);
  else renderLesson(page, params, ctx, cleanups);
  return () => { cleanups.forEach((f) => { try { f(); } catch (e) { console.error(e); } }); stopAll(); closeAllModals(); };
}

// ---------------------------------------------------------------- worlds list
function renderWorlds(page, ctx) {
  const state = ctx.store.get();
  page.append(pageHead({
    eyebrow: 'Learn',
    title: 'Choose a lesson',
    lead: 'Each lesson has six short steps: a story, a key word, a picture, practice together, a quick check, and what to do next.'
  }));
  if (!WORLDS.length) { page.append(notice('Lessons are still being written. Please check back soon.', 'warn')); return; }

  for (const w of WORLDS) {
    const lessons = lessonsInWorld(w);
    // Derived from the lessons themselves (not a hand-set world flag).
    const nReady = lessons.filter((l) => l.status === 'ready' && l.id).length;
    const statusChip = nReady && nReady === lessons.length ? chip('Ready', 'ready') : nReady ? chip(`${nReady} of ${lessons.length} lessons ready`, 'progress') : chip('In development', 'planned');
    const sec = h('section', { class: 'world', 'aria-labelledby': `world-${w.id}` },
      h('div', { class: 'world-head' }, h('h2', { id: `world-${w.id}` }, worldTitle(w)), statusChip),
      w.tagline ? h('p', { class: 'muted', style: 'margin-bottom:4px' }, pick(w.tagline, ctx.band)) : null,
      w.summary ? h('p', {}, pick(w.summary, ctx.band)) : null);
    if (!lessons.length) {
      sec.append(h('p', { class: 'empty' }, 'Lessons for this world are in development.'));
    } else {
      sec.append(h('ul', { class: 'lesson-list' }, lessons.map((l, i) => h('li', {}, lessonCard(l, i, state, ctx)))));
    }
    page.append(sec);
  }
}

function lessonCard(l, i, state, ctx) {
  const n = l.number ?? i + 1;
  const ready = l.status === 'ready' && l.id && lessonById(l.id);
  if (!ready) {
    return h('div', { class: 'card lesson-item is-planned' },
      h('span', { class: 'lesson-num', 'aria-hidden': 'true' }, String(n)),
      h('div', {}, h('h3', {}, h('span', { class: 'sr-only' }, `Lesson ${n}: `), pick(l.title, ctx.band)), chip('In development', 'planned')));
  }
  const p = state.lessons[l.id];
  const status = p?.completed ? chip('Completed', 'done') : p ? chip(`In progress · step ${p.step} of 6`, 'progress') : chip('Ready', 'ready');
  const step = p && !p.completed ? p.step : 1;
  return h('a', { class: 'card card-link lesson-item', href: `#/learn/${l.id}/${step}` },
    h('span', { class: 'lesson-num', 'aria-hidden': 'true' }, String(n)),
    h('div', {},
      h('h3', { class: 'card-title' }, h('span', { class: 'sr-only' }, `Lesson ${n}: `), pick(l.title, ctx.band)),
      l.minutes ? h('p', {}, `About ${pick(l.minutes, ctx.band)} minutes`) : null,
      status));
}

// ---------------------------------------------------------------- lesson player
function renderLesson(page, params, ctx, cleanups) {
  const lesson = lessonById(params[0]);
  if (!lesson) {
    page.append(pageHead({ eyebrow: 'Learn', title: 'We couldn’t find that lesson' }),
      h('p', {}, 'The link may be old or mistyped.'), h('div', { class: 'btn-row' }, linkBtn('#/learn', 'See all lessons')));
    return;
  }
  if (lesson.status !== 'ready') {
    page.append(pageHead({ eyebrow: 'Learn', title: pick(lesson.title, ctx.band) }),
      notice('This lesson is in development and isn’t ready yet.', 'warn'), h('div', { class: 'btn-row' }, linkBtn('#/learn', 'See ready lessons')));
    return;
  }
  const steps = Array.isArray(lesson.steps) ? lesson.steps : [];
  const total = steps.length || 6;
  const saved = ctx.store.get().lessons[lesson.id];
  let step = params[1] == null ? (saved && !saved.completed ? saved.step : 1) : Number(params[1]);
  if (!Number.isInteger(step) || step < 1 || step > total) {
    page.append(pageHead({ eyebrow: pick(lesson.title, ctx.band), title: 'That step doesn’t exist' }),
      h('p', {}, `This lesson has ${total} steps.`), h('div', { class: 'btn-row' }, linkBtn(`#/learn/${lesson.id}/1`, 'Start at step 1'), linkBtn('#/learn', 'All lessons', 'btn')));
    return;
  }
  // Keep the address bar in sync (so refresh resumes here) without adding a history entry.
  const want = `#/learn/${lesson.id}/${step}`;
  if (location.hash !== want) history.replaceState(null, '', want);

  const band = ctx.band;
  const world = worldOf(lesson);
  page.classList.add('page-narrow');

  // ----- optional prerequisite warm-up before step 1 -----
  if (step === 1 && !(saved?.maxStep > 1) && !warmupHandled.has(lesson.id)) {
    const needs = unmasteredPrereqs(lesson, ctx);
    if (needs.length) { renderWarmupOffer(page, lesson, needs, ctx, cleanups); return; }
  }

  const prevMax = saved?.maxStep || 0;
  ctx.store.markLessonStep(lesson.id, step);
  const maxStep = Math.max(prevMax, step);

  const data = steps[step - 1] || {};
  const kind = data.type || data.kind || KINDS[step - 1] || 'discover';

  // ----- header: world, title, progress, step chips -----
  const chips = h('ol', { class: 'steps', 'aria-label': 'Lesson steps' }, KINDS.slice(0, total).map((k, i) => {
    const n = i + 1;
    const label = `${n}. ${KIND_LABEL[k]}`;
    if (n === step) return h('li', {}, h('span', { 'aria-current': 'step' }, label));
    if (n <= maxStep + 1) return h('li', {}, h('a', { href: `#/learn/${lesson.id}/${n}` }, label));
    return h('li', {}, h('span', {}, label));
  }));
  page.append(h('header', { class: 'lesson-top' },
    h('p', { class: 'eyebrow' }, world ? worldTitle(world) : 'Lesson'),
    h('h1', { tabindex: '-1' }, pick(lesson.title, band)),
    progressBar({ value: step, max: total, label: KIND_LABEL[kind] || 'Step', valueText: `Step ${step} of ${total}` }),
    chips));

  // ----- step body -----
  const body = h('article', { class: 'lesson-step lesson-body', 'aria-labelledby': 'step-title' });
  page.append(body);
  const speakParts = []; // text for Read to Me
  const rtmSlot = h('div');
  const title = pick(data.title, band) || KIND_LABEL[kind];
  body.append(h('h2', { id: 'step-title' }, title), rtmSlot);
  speakParts.push(title);

  const addParas = (value) => {
    for (const p of paragraphs(value, band)) { body.append(h('p', {}, renderRichText(p, band))); speakParts.push(plainText(p)); }
  };

  if (kind === 'discover') {
    if (data.image) body.append(renderArt(data.image, { band }));
    addParas(data.text);
  } else if (kind === 'definition') {
    const entry = typeof data.term === 'string' ? termById(data.term) : null;
    const termText = entry?.term || pick(data.term, band) || '';
    body.append(h('div', { class: 'definition-card' },
      h('p', { class: 'term-name' }, termText),
      entry?.say ? h('p', { class: 'term-say' }, 'Say it: ', h('strong', {}, entry.say)) : null,
      ...paragraphs(data.text, band).map((p) => h('p', { style: 'margin-bottom:0' }, renderRichText(p, band)))));
    speakParts.push(termText, ...paragraphs(data.text, band).map(plainText));
    const key = pick(data.keyIdea, band);
    if (key) {
      body.append(h('div', { class: 'key-idea' }, h('span', { class: 'label' }, 'Key idea'), h('p', {}, renderRichText(key, band))));
      speakParts.push('Key idea. ' + plainText(key));
    }
  } else if (kind === 'visual') {
    addParas(data.text);
    const v = visualEl(data.visual, band);
    if (v) body.append(v);
    const cap = pick(data.caption, band);
    if (cap) { body.append(h('p', { class: 'small muted' }, renderRichText(cap, band))); speakParts.push(plainText(cap)); }
  } else if (kind === 'together') {
    addParas(data.intro);
    if (data.visual) { const v = visualEl(data.visual, band); if (v) body.append(v); }
    body.append(renderTogether(pick(data.steps, band) || [], band));
  } else if (kind === 'check') {
    const q = pick(data.question, band);
    if (q) body.append(renderCheck(q, band));
    else body.append(notice('This check question isn’t ready yet.', 'warn'));
    if (q?.prompt) speakParts.push(plainText(q.prompt));
  } else if (kind === 'next') {
    addParas(data.text);
    renderNext(body, lesson, ctx, prevMax);
  }

  const rtm = readToMe(rtmSlot, () => speakParts.filter(Boolean).join('. ').replace(/\.\s*\./g, '.'));
  cleanups.push(rtm.destroy);

  // ----- Back / Next -----
  const nav = h('nav', { class: 'lesson-nav', 'aria-label': 'Lesson navigation' },
    step > 1 ? linkBtn(`#/learn/${lesson.id}/${step - 1}`, '← Back', 'btn') : linkBtn('#/learn', '← All lessons', 'btn'),
    step < total ? linkBtn(`#/learn/${lesson.id}/${step + 1}`, `Next: ${KIND_LABEL[KINDS[step]] || 'Next step'} →`, 'btn btn-primary')
      : linkBtn('#/learn', 'Back to all lessons', 'btn btn-primary'));
  page.append(nav);
}

// ----- Try Together: one coached mini-question at a time -----
function renderTogether(items, band) {
  const wrap = h('div', { class: 'together' });
  if (!items.length) { wrap.append(notice('Practice-together questions are being written for this lesson.', 'warn')); return wrap; }
  let i = 0;
  const box = h('div', { class: 'together-q' });
  wrap.append(box);
  const show = () => {
    const item = items[i];
    const coach = h('div', { class: 'feedback coach', 'aria-live': 'polite' });
    const next = h('div', { class: 'btn-row' });
    const promptId = `tt-${i}`;
    let solved = false;
    const buttons = (item.choices || []).map((c) => {
      const b = h('button', { type: 'button', class: 'choice', 'aria-pressed': 'false' }, plainText(c.text));
      b.addEventListener('click', () => {
        if (solved) return;
        for (const x of buttons) x.setAttribute('aria-pressed', String(x === b));
        coach.className = `feedback coach ${c.correct ? 'is-correct' : 'is-wrong'}`;
        coach.replaceChildren(
          h('p', { class: 'fb-title' }, c.correct ? '✓ Yes!' : 'Not quite — try another choice.'),
          c.coach ? h('p', {}, renderRichText(pick(c.coach, band), band)) : null);
        b.classList.toggle('is-correct', !!c.correct);
        b.classList.toggle('is-tried', !c.correct);
        if (c.correct) {
          solved = true;
          for (const x of buttons) x.disabled = true;
          if (i < items.length - 1) {
            const nb = btn('Next question →', () => { i++; show(); box.querySelector('.q-prompt')?.focus(); }, 'btn btn-primary');
            next.replaceChildren(nb);
            nb.focus();
          } else {
            next.replaceChildren(notice('You finished practicing together. Press “Next” below to check your understanding on your own.', 'success'));
          }
        }
      });
      return b;
    });
    box.replaceChildren(
      h('p', { class: 'eyebrow' }, `Together · ${i + 1} of ${items.length}`),
      h('p', { class: 'q-prompt', id: promptId, tabindex: '-1' }, renderRichText(pick(item.prompt, band), band)),
      h('div', { class: 'choices', role: 'group', 'aria-labelledby': promptId }, buttons),
      coach, next);
  };
  show();
  return wrap;
}

// ----- Check Understanding: hints + retry, teach after 2 misses -----
function renderCheck(q, band) {
  let misses = 0, hintIndex = 0;
  const wrap = h('div');
  const view = renderQuestion(q, {
    band, mode: 'check',
    onHint: () => (q.hints && hintIndex < q.hints.length ? q.hints[hintIndex++] : null),
    onSubmit: (response) => {
      let res;
      try { res = checkResponse(q, response); } catch (e) { console.error(e); return; }
      if (res.correct) { view.showFeedback({ correct: true, feedback: res.feedback, explanation: q.explanation }); view.lock(); }
      else { misses++; view.showFeedback({ correct: false, feedback: res.feedback, misconception: res.misconception, teach: misses >= 2 ? q.teach : null }); }
    }
  });
  wrap.append(view.el, h('p', { class: 'small muted' }, 'This check is for learning — it doesn’t change your score. Tests and Practice build mastery.'));
  return wrap;
}

// ----- Next Step: complete the lesson and point to practice -----
function renderNext(body, lesson, ctx, prevMax) {
  const already = ctx.store.get().lessons[lesson.id]?.completed;
  if (already || prevMax >= 5) {
    if (!already) ctx.store.completeLesson(lesson.id);
    ctx.store.introduceSkills((lesson.skills || []).filter((s) => SKILLS[s]));
    body.append(notice(h('p', {}, h('strong', {}, 'Lesson complete! '), 'Now practice on your own — that’s how you build mastery.'), 'success'));
  } else {
    body.append(notice(h('p', {}, 'You skipped ahead. ', h('a', { href: `#/learn/${lesson.id}/5` }, 'Do the Check Understanding step'), ' to finish this lesson.'), 'warn'));
  }
  const idx = LESSONS.findIndex((l) => l.id === lesson.id);
  const nextLesson = LESSONS.slice(idx + 1).find((l) => l.status === 'ready');
  const skills = (lesson.skills || []).filter((s) => SKILLS[s]);
  body.append(h('div', { class: 'grid grid-2', style: 'margin-top:16px' },
    h('a', { class: 'card card-link', href: `#/practice?lesson=${encodeURIComponent(lesson.id)}` },
      h('h3', { class: 'card-title' }, 'Practice this lesson'),
      h('p', { class: 'card-text' }, skills.length ? `Skills: ${skills.map(skillName).join(', ')}.` : 'Fresh questions with hints.')),
    h('a', { class: 'card card-link', href: '#/thinking' },
      h('h3', { class: 'card-title' }, 'Thinking Lab'), h('p', { class: 'card-text' }, 'Explain your reasoning in your own words.')),
    h('a', { class: 'card card-link', href: `#/test/${encodeURIComponent(lesson.id)}` },
      h('h3', { class: 'card-title' }, 'Take the lesson test'), h('p', { class: 'card-text' }, 'Show what you know — no hints until you submit.')),
    nextLesson
      ? h('a', { class: 'card card-link', href: `#/learn/${nextLesson.id}/1` },
        h('h3', { class: 'card-title' }, 'Next lesson'), h('p', { class: 'card-text' }, pick(nextLesson.title, ctx.band)))
      : h('a', { class: 'card card-link', href: '#/learn' },
        h('h3', { class: 'card-title' }, 'All lessons'), h('p', { class: 'card-text' }, 'See every world and lesson.'))));
}

// ----- prerequisite warm-up -----
function unmasteredPrereqs(lesson, ctx) {
  const state = ctx.store.get();
  const skills = new Set();
  for (const p of lesson.prereqs || []) {
    if (SKILLS[p]) skills.add(p);
    else for (const s of lessonById(p)?.skills || []) if (SKILLS[s]) skills.add(s);
  }
  return [...skills].filter((s) => {
    try { return masteryFor(state, s)?.level !== 'mastered'; } catch { return false; }
  });
}

function renderWarmupOffer(page, lesson, needs, ctx, cleanups) {
  const band = ctx.band;
  const world = worldOf(lesson);
  page.append(h('header', { class: 'lesson-top' },
    h('p', { class: 'eyebrow' }, world ? worldTitle(world) : 'Lesson'),
    h('h1', { tabindex: '-1' }, pick(lesson.title, band))));
  const box = h('div', { class: 'lesson-step' });
  page.append(box);
  const skip = () => { warmupHandled.add(lesson.id); ctx.go(`#/learn/${lesson.id}/1`); };
  const start = () => {
    warmupHandled.add(lesson.id);
    let session;
    try { session = createPracticeSession({ band, skills: needs, difficulty: 'easy', mode: 'warmup' }, ctx.store); } catch (e) { console.error(e); skip(); return; }
    box.replaceChildren(h('h2', {}, 'Warm-up: 3 quick questions'), h('p', { class: 'muted' }, 'Hints are welcome. Misses go to Practice My Misses so you can review them later.'));
    const host = h('div');
    box.append(host);
    const runner = mountSession(host, session, {
      band, limit: 3, doneLabel: 'Skip the rest',
      onDone: () => ctx.go(`#/learn/${lesson.id}/1`)
    });
    cleanups.push(runner.destroy);
    host.querySelector('.q-prompt')?.setAttribute('tabindex', '-1');
    host.querySelector('.q-prompt')?.focus();
  };
  box.append(
    h('h2', {}, 'Want a quick warm-up first?'),
    h('p', {}, `This lesson builds on ${needs.map(skillName).join(' and ')}. A ${plural(3, 'question')} warm-up can help — it’s optional.`),
    h('div', { class: 'btn-row' }, btn('Start warm-up', start, 'btn btn-primary btn-lg'), btn('Skip warm-up', skip, 'btn btn-lg')));
}
