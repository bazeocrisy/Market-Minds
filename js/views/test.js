// Test — chooser (#/test) and a test for a lesson or world (#/test/<scope>).
// No hints and no correctness feedback until the learner submits. Results are recorded by the engine.
import { h, pageHead, notice, linkBtn, btn, plural, skillName, worldTitle, lessonsInWorld, readyLessons, formatDate, statBox, confirmDialog, closeAllModals, readySkillIds } from '../ui/dom.js';
import { renderQuestion, formatAnswer } from '../ui/question.js';
import { renderRichText } from '../ui/vocab.js';
import { stopAll } from '../ui/speech.js';
import { pick } from '../content/band.js';
import { WORLDS } from '../content/worlds.js';
import { lessonById } from '../content/lessons.js';
import { SKILLS } from '../content/skills.js';
import { createTest, checkResponse } from '../engine/index.js';

// Survives in-app navigation only; a refresh mid-test starts over (nothing is recorded until submit).
// Going Home and back keeps it exactly as it was; only Retake / starting another test replaces it.
let running = null; // { scope, test, answers, index, results }

const workChanged = () => { try { document.dispatchEvent(new CustomEvent('mm:work-changed')); } catch { /* no DOM */ } };

/** A started, unsubmitted test (answers live only in memory until submit). */
export function pendingWork() {
  return running && !running.results ? { kind: 'test', label: 'your test', resume: `#/test/${encodeURIComponent(running.scope)}` } : null;
}

export function render(el, params, ctx) {
  const page = h('section', { class: 'page' });
  el.append(page);
  const scope = params[0];
  if (!scope) renderChooser(page, ctx);
  else renderScope(page, scope, ctx);
  return () => { stopAll(); closeAllModals(); };
}

function scopeInfo(scope) {
  const lesson = lessonById(scope);
  if (lesson) return lesson.status === 'ready' ? { kind: 'lesson', lesson, length: 6 } : null;
  const world = WORLDS.find((w) => w.id === scope);
  if (world && lessonsInWorld(world).some((l) => l.status === 'ready')) return { kind: 'world', world, length: 10 };
  return null;
}
const scopeTitle = (info, band) => (info.kind === 'lesson' ? `Lesson test: ${pick(info.lesson.title, band)}` : `${worldTitle(info.world)} test`);

// ---------------------------------------------------------------- chooser
function renderChooser(page, ctx) {
  const state = ctx.store.get();
  page.append(pageHead({
    eyebrow: 'Test',
    title: 'Show what you know',
    lead: 'Tests have no hints. You’ll see every answer, the correct answer and an explanation after you submit.'
  }));
  const ready = readyLessons();
  if (!ready.length) { page.append(notice('Tests open when the first lesson is ready.', 'warn')); return; }
  const pw = pendingWork();
  if (pw) {
    const info = scopeInfo(running.scope);
    page.append(notice(h('div', {},
      h('p', {}, h('strong', {}, 'You have a test in progress'), info ? `: ${scopeTitle(info, ctx.band)}` : '', ` (${running.answers.filter((a) => a != null).length} of ${running.answers.length} answered). Your answers are kept until you submit.`),
      h('div', { class: 'btn-row', style: 'margin-top:8px' }, linkBtn(pw.resume, 'Resume test')))));
  }

  const lastFor = (scope) => [...state.tests].reverse().find((t) => t.scope === scope);
  const testCard = (scope, title, sub) => {
    const last = lastFor(scope);
    return h('li', { style: 'margin:0' }, h('a', { class: 'card card-link', href: `#/test/${encodeURIComponent(scope)}`, style: 'height:100%' },
      h('h3', { class: 'card-title' }, title),
      h('p', { class: 'card-text' }, sub),
      h('p', { class: 'card-status' }, last ? `Last score: ${last.score} of ${last.total}` : 'Not taken yet')));
  };
  for (const w of WORLDS) {
    const ls = lessonsInWorld(w).filter((l) => l.status === 'ready' && l.id);
    if (!ls.length) continue;
    page.append(h('section', { class: 'section' },
      h('h2', {}, worldTitle(w)),
      h('ul', { class: 'grid grid-3', style: 'list-style:none;padding:0;margin:0' },
        ls.map((l) => testCard(l.id, pick(l.title, ctx.band), `Lesson ${l.number ?? ''} · 6 questions`)),
        ls.length > 1 ? testCard(w.id, `Whole world: ${w.title}`, `Mixes all ${ls.length} ready lessons · 10 questions`) : null)));
  }
}

// ---------------------------------------------------------------- scope: intro / items / results
function renderScope(page, scope, ctx) {
  const info = scopeInfo(scope);
  if (!info) {
    page.append(pageHead({ eyebrow: 'Test', title: 'That test isn’t available' }),
      h('p', {}, 'It may still be in development, or the link is mistyped.'), h('div', { class: 'btn-row' }, linkBtn('#/test', 'Choose a test')));
    return;
  }
  page.classList.add('page-narrow');
  if (running && running.scope === scope && running.results) return renderResults(page, info, ctx);
  if (running && running.scope === scope) return renderItem(page, info, ctx);
  renderIntro(page, info, ctx);
}

const ACTIVE_KEY = 'mm.test.active';
const flag = { get() { try { return sessionStorage.getItem(ACTIVE_KEY); } catch { return null; } },
  set(v) { try { if (v) sessionStorage.setItem(ACTIVE_KEY, v); else sessionStorage.removeItem(ACTIVE_KEY); } catch { /* ignore */ } } };

function renderIntro(page, info, ctx) {
  page.append(pageHead({ eyebrow: 'Test', title: scopeTitle(info, ctx.band) }));
  // The flag outlives a reload but the in-memory test does not: flag set + nothing running = interrupted.
  if (flag.get() && !pendingWork()) {
    page.append(notice('Your last test was interrupted (the page was refreshed or closed) before you submitted it, so it was not scored. You can start a fresh test.', 'info'));
    flag.set(null);
  }
  const pw = pendingWork();
  if (pw) {
    page.append(notice(h('div', {},
      h('p', {}, 'You have another test in progress. Starting this one will end it without a score.'),
      h('div', { class: 'btn-row', style: 'margin-top:8px' }, linkBtn(pw.resume, 'Resume the other test')))));
  }
  const skills = info.kind === 'lesson' ? info.lesson.skills || [] : lessonsInWorld(info.world).filter((l) => l.status === 'ready').flatMap((l) => l.skills || []);
  page.append(h('div', { class: 'card stack' },
    h('p', {}, `${plural(info.length, 'question')}, one at a time. You can go back and change answers before you submit.`),
    h('ul', {},
      h('li', {}, 'No hints and no “correct / not correct” until you submit.'),
      h('li', {}, 'Your score counts as on-your-own work toward mastery.'),
      h('li', {}, 'After you submit you’ll see every answer with an explanation.')),
    skills.length ? h('p', { class: 'small muted' }, 'Skills: ', skills.filter((s) => SKILLS[s]).map(skillName).join(', ')) : null,
    h('div', { class: 'btn-row' }, btn('Start test', () => start(info, ctx), 'btn btn-primary btn-lg'), linkBtn('#/test', 'Choose a different test', 'btn'))));
}

function start(info, ctx) {
  const scope = info.kind === 'lesson' ? info.lesson.id : info.world.id;
  let test;
  try { test = createTest({ band: ctx.band, scope, length: info.length, readySkills: readySkillIds() }, ctx.store); } catch (e) { console.error(e); return; }
  running = { scope, test, answers: new Array(test.items.length).fill(null), index: 0, results: null };
  flag.set(scope);
  workChanged();
  ctx.go(location.hash); // re-render this route (now showing item 1)
}

function renderItem(page, info, ctx) {
  const r = running;
  const items = r.test.items;
  const n = items.length;
  const answered = () => r.answers.filter((a) => a != null).length;
  page.append(pageHead({ eyebrow: scopeTitle(info, ctx.band), title: `Question ${r.index + 1} of ${n}` }));
  const count = h('p', { class: 'tally', 'aria-live': 'polite' });
  const paint = () => count.replaceChildren(h('span', {}, 'Answered: ', h('strong', {}, `${answered()} of ${n}`)), h('span', {}, 'No hints on tests'));
  paint();
  const item = items[r.index];
  const q = item.question || item;   // engine items wrap the (answer-free) question
  const view = renderQuestion(q, {
    band: ctx.band, mode: 'test', value: r.answers[r.index],
    onSubmit: (resp) => { r.answers[r.index] = resp; try { r.test.answer(r.index, resp); } catch (e) { console.error(e); } paint(); }
  });
  const go = (i) => { r.index = i; ctx.go(location.hash); };
  const nav = h('div', { class: 'lesson-nav' },
    r.index > 0 ? btn('← Back', () => go(r.index - 1), 'btn') : null,
    r.index < n - 1 ? btn('Next →', () => go(r.index + 1), 'btn btn-primary') : null);
  const submit = btn('Submit test', async () => {
    const left = n - answered();
    if (left > 0) {
      const ok = await confirmDialog({
        title: 'Submit with blank answers?',
        message: `You have ${plural(left, 'question')} without an answer. Blank answers count as not correct.`,
        confirmLabel: 'Submit anyway', cancelLabel: 'Keep working'
      });
      if (!ok) return;
    }
    let results;
    try { results = r.test.submit(); } catch (e) { console.error(e); results = {}; }
    r.results = results || {};
    flag.set(null);
    workChanged();
    ctx.go(location.hash);
  }, `btn ${r.index === n - 1 ? 'btn-gold' : ''} btn-lg`);
  page.append(count, h('div', { class: 'lesson-step' }, view.el), nav, h('div', { class: 'btn-row' }, submit));
}

function renderResults(page, info, ctx) {
  const r = running;
  const items = r.test.items;
  const res = r.results;
  const per = items.map((item, i) => {
    // After submit the engine returns the full question (answer + explanation) in res.items.
    const q = res.items?.[i]?.question || item.question || item;
    const given = res.items?.[i]?.response ?? r.answers[i];
    let correct = res.items?.[i]?.correct;
    if (typeof correct !== 'boolean') { try { correct = given != null && checkResponse(q, given).correct; } catch { correct = false; } }
    return { q, given, correct };
  });
  const score = Number.isFinite(res.score) ? res.score : per.filter((p) => p.correct).length;
  const total = Number.isFinite(res.total) ? res.total : items.length;
  const bySkill = {};
  for (const p of per) { const b = bySkill[p.q.skill] || (bySkill[p.q.skill] = { correct: 0, total: 0 }); b.total++; if (p.correct) b.correct++; }
  const missedSkills = Object.entries(bySkill).filter(([, v]) => v.correct < v.total).map(([k]) => k).filter((k) => SKILLS[k]);

  page.append(pageHead({ eyebrow: 'Test results', title: scopeTitle(info, ctx.band) }));
  page.append(h('div', { class: 'card' },
    h('p', { class: 'score-big' }, `${score} of ${total}`),
    h('p', {}, score === total ? 'Every answer correct — excellent, careful work!' : 'Look over the explanations below, then practice the skills you missed.'),
    h('p', { class: 'small muted' }, `Taken ${formatDate(Date.now())}. This score was saved to My Progress.`)));

  page.append(h('section', { class: 'section' }, h('h2', {}, 'By skill'),
    h('div', { class: 'stats' }, Object.entries(bySkill).map(([k, v]) => statBox(`${v.correct}/${v.total}`, skillName(k))))));

  const missedRow = missedSkills.length
    ? h('div', { class: 'btn-row' }, missedSkills.map((s) => linkBtn(`#/practice?skill=${encodeURIComponent(s)}`, `Practice: ${skillName(s)}`, 'btn btn-primary')))
    : null;
  if (missedRow) page.append(h('section', { class: 'section' }, h('h2', {}, 'Practice these skills'), missedRow));

  page.append(h('section', { class: 'section' }, h('h2', {}, 'Every question'),
    h('ol', { class: 'entry-list' }, per.map((p, i) => h('li', {}, h('div', { class: `result-item ${p.correct ? 'is-right' : 'is-wrong'}` },
      h('p', { class: 'eyebrow', style: 'margin-bottom:4px' }, `Question ${i + 1} · ${p.correct ? 'Correct' : 'Not correct'}`),
      h('div', { class: 'q-prompt', style: 'margin-bottom:8px' }, renderRichText(p.q.prompt, ctx.band)),
      h('dl', {},
        h('dt', {}, 'Your answer'), h('dd', {}, formatAnswer(p.q, p.given)),
        h('dt', {}, 'Correct answer'), h('dd', {}, formatAnswer(p.q, p.q.answer)),
        p.q.explanation ? [h('dt', {}, 'Why'), h('dd', {}, renderRichText(p.q.explanation, ctx.band))] : null)))))));

  page.append(h('div', { class: 'btn-row section' },
    btn('Retake (new questions)', () => { running = null; start(info, ctx); }, 'btn btn-primary'),
    linkBtn('#/progress', 'See My Progress', 'btn'),
    linkBtn('#/test', 'Choose another test', 'btn btn-ghost')));
}
