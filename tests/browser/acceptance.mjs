// Acceptance walk-through (docs/CLAUDE-MASTER-PROMPT.md "ACCEPTANCE CHECK") at 375×812 with touch emulation,
// as a brand-new student (cleared storage). Taps are real CDP mouse events at element centres after a
// hit-test, so covered/overlapped controls fail.
//
// How answers are known: the UI deliberately never reveals the correct answer before a check. The
// suite observes the engine's own Question objects in-page (see CAPTURE_SRC in qa-lib.mjs: an
// Object.prototype `answer` setter + a Set.prototype.add wrapper that sees each accepted question key).
// Lesson "Try together" / "Check understanding" answers come from js/content/lessons.js (content data).
// Every captured question is cross-checked against the rendered prompt text before it is used.
import path from 'node:path';
import { startServer, startBrowser, BASE } from '../lib/harness.mjs';
import * as L from './qa-lib.mjs';

const C = L.counter('acceptance');
const check = C.check;
const server = await startServer();
const b = await startBrowser();
const URL = server.origin + BASE;
const q = (e) => b.js(`return ${e};`);
const state = () => b.js('return JSON.parse(JSON.stringify(window.__mm.store.get()));');
const viewText = () => b.js(`return document.getElementById('view').innerText.replace(/\\s+/g, ' ');`);
const SHOTS = [];
async function shot(name) {
  try {
    await b.shot(path.join(L.SHOT_DIR, `375-${name}.jpg`), true);
    await b.viewport(1440, 900); await b.wait(200);
    await b.shot(path.join(L.SHOT_DIR, `1440-${name}.jpg`), true);
    await b.viewport(375, 812); await b.wait(200);
    SHOTS.push(name);
  } catch (e) { console.log('screenshot failed', name, e.message); }
}
const route = (hash) => L.route(b, hash);
const tapSel = (sel) => L.tap(b, `document.querySelector(${JSON.stringify(sel)})`);
const tapText = (re, scope = '#view') => L.tap(b, `[...document.querySelectorAll(${JSON.stringify(scope + ' button, ' + scope + ' a')})].find((x) => ${re}.test(x.textContent.replace(/\\s+/g, ' ').trim()) && x.offsetParent !== null && !x.hidden)`);
async function tapOk(name, r) { check(`${name}: tap target found and not covered`, r && r.ok, JSON.stringify(r)); await b.wait(150); }

/** App navigation like a student: a bottom tab if there is one, else More → link. */
async function navTo(href) {
  const r = await L.navTo(b, href);
  check(`nav ${href} via ${r.via}: tap targets found and not covered`, r.ok, JSON.stringify(r));
  if (r.via === 'more') check(`More sheet opened (aria-expanded) before ${href}`, r.opened === true);
  check(`nav ${href} reached`, (await q('location.hash')) === href, await q('location.hash'));
}

// ---------------------------------------------------------------- expected learning evidence
// Mirrors the engine rules from docs/ARCHITECTURE.md independently, from what this script did.
const exp = {};      // skill → { ic, ia, ac, aa, rev }
const expMiss = {};  // skill → { count, streak }
const sk = (s) => (exp[s] ||= { ic: 0, ia: 0, ac: 0, aa: 0, rev: 0 });
const addMiss = (s) => { const m = (expMiss[s] ||= { count: 0, streak: 0 }); m.count++; m.streak = 0; };
const independent = (s, ok) => {
  const k = sk(s); k.ia++; if (ok) k.ic++;
  if (ok) { if (expMiss[s]) { expMiss[s].streak++; if (expMiss[s].streak >= 2) delete expMiss[s]; } } else addMiss(s);
};
async function compareEvidence(tag) {
  const s = await state();
  for (const [id, e] of Object.entries(exp)) {
    const k = s.skills[id] || { independent: { correct: -1, attempts: -1 }, assisted: { correct: -1, attempts: -1 }, revealed: -1 };
    const got = `ind ${k.independent.correct}/${k.independent.attempts} ast ${k.assisted.correct}/${k.assisted.attempts} rev ${k.revealed}`;
    const want = `ind ${e.ic}/${e.ia} ast ${e.ac}/${e.aa} rev ${e.rev}`;
    check(`${tag}: ${id} evidence exactly matches what the student did`, got === want, `got ${got}, expected ${want}`);
  }
  for (const [id, k] of Object.entries(s.skills)) {
    if (!exp[id]) check(`${tag}: no evidence for untouched skill ${id}`, k.independent.attempts + k.assisted.attempts + k.revealed === 0, JSON.stringify(k));
  }
  const gotMiss = Object.fromEntries(Object.entries(s.misses).map(([id, m]) => [id, m.count]));
  const wantMiss = Object.fromEntries(Object.entries(expMiss).map(([id, m]) => [id, m.count]));
  check(`${tag}: miss queue exactly matches`, JSON.stringify(Object.entries(gotMiss).sort()) === JSON.stringify(Object.entries(wantMiss).sort()), `got ${JSON.stringify(gotMiss)} expected ${JSON.stringify(wantMiss)}`);
  return s;
}

// ---------------------------------------------------------------- practice helpers
const ROOT = `document.querySelector('#view .lesson-step')`;
async function cur() {
  return b.js(`const root = ${ROOT}; const q = root && __qh.find(root);
    if (!q) return null;
    return { key: q.key, skill: q.skill, type: q.type, difficulty: q.difficulty, hints: q.hints.map(__qh.plain), prompt: __qh.plain(q.prompt),
      answerText: __qh.answerText(q), answer: q.answer, explanation: q.explanation, choices: (q.choices || []).map((c) => __qh.plain(c.text)),
      shown: __qh.norm(root.querySelector('.q-prompt').textContent) };`);
}
async function respond(kind) {
  return b.js(`const root = ${ROOT}; const q = __qh.find(root);
    __qh.fill(root, q, ${kind === 'right' ? '__qh.rightResponse(q)' : '__qh.wrongResponse(q)'});
    const c = __qh.btn(root, /^Check$/); c.click(); return true;`);
}
const fbText = () => b.js(`const f = ${ROOT}.querySelector('.feedback'); return { cls: f.className, text: f.innerText.replace(/\\s+/g, ' ').trim() };`);
const tallyText = () => b.js(`const e = document.querySelector('#view .tally'); return e ? [...e.children].map((x) => x.innerText.trim()).join(' ') : null;`);
const text = (sel) => L.text(b, sel);
const revealsAnswer = (t, c) => {
  if (!c) return false;
  if (c.type === 'number') return new RegExp(`(?<![\\d.])${String(Math.abs(c.answer)).replace('.', '\\.')}(?![\\d]|\\.\\d)`).test(t);
  if (c.type === 'choice' || c.type === 'fill') return c.answerText.length >= 8 && t.toLowerCase().includes(c.answerText.toLowerCase());
  return false;
};
async function nextQuestion() {
  const r = await tapText('/^(Next question|Finish)/');
  await b.wait(200);
  return r;
}

try {
  await b.send('DOM.enable');
  await b.send('Accessibility.enable');
  await L.addInit(b, L.CAPTURE_SRC);
  await L.addInit(b, L.SPEECH_STUB_SRC);
  await b.viewport(375, 812);
  await b.load(URL);
  await b.js('localStorage.clear(); sessionStorage.clear();');
  await b.load(URL);
  await L.helpers(b);
  const R = await b.js(`const m = await import(new URL('js/content/lessons.js', document.baseURI).href); return m.LESSONS.filter((l) => l.status === 'ready').length;`);
  const NSK = await b.js(`const m = await import(new URL('js/ui/dom.js', document.baseURI).href); return m.readySkillIds().length;`);
  const skillsWord = (n) => `${n} ${n === 1 ? 'skill' : 'skills'}`;
  const lessonsMod = `await import(new URL('js/content/lessons.js', document.baseURI).href)`;

  // ================================================================ 1. first launch: onboarding, choose grade
  check('touch emulation active', await q(`'ontouchstart' in window || navigator.maxTouchPoints > 0`));
  check('375 viewport', (await q('document.documentElement.clientWidth')) === 375);
  check('fresh: store empty', JSON.stringify((await state()).lessons) === '{}' && (await state()).band === null);
  check('fresh: app opens the onboarding screen', (await q('location.hash')) === '#/welcome', await q('location.hash'));
  check('fresh: onboarding h1', (await text('#view h1')) === 'Welcome to Market Minds', await text('#view h1'));
  check('fresh: two grade buttons', (await q(`document.querySelectorAll('#view .welcome-grade[data-band]').length`)) === 2);
  check('fresh: no app bar or tabs before a grade is chosen', (await q(`getComputedStyle(document.querySelector('.app-bar')).display`)) === 'none');
  check('fresh: no Start button before a grade is chosen', !(await q(`[...document.querySelectorAll('#view a')].some((a) => /Start Learning/.test(a.textContent))`)));
  await shot('welcome');
  await tapOk('Grades 3–5', await tapSel('#view .welcome-grade[data-band="explorer"]'));
  await b.wait(300);
  check('grade 3–5 saved', (await state()).band === 'explorer');
  check('onboarding continues to the dashboard', (await q('location.hash')) === '#/', await q('location.hash'));
  check('hero welcomes Market Explorer', (await text('#view h1')) === 'Welcome, Market Explorer!', await text('#view h1'));
  check('header 3–5 pressed', (await q(`document.querySelector('.band-switch [data-band=explorer]').getAttribute('aria-pressed')`)) === 'true');
  check('header 6–8 not pressed', (await q(`document.querySelector('.band-switch [data-band=analyst]').getAttribute('aria-pressed')`)) === 'false');
  const startHref = await q(`[...document.querySelectorAll('#view a')].find((a) => /Start Learning/.test(a.textContent))?.getAttribute('href')`);
  check('Start Learning goes to World 1 Lesson 1 step 1', startHref === '#/learn/w1l1/1', startHref);
  const dash0 = await viewText();
  check('fresh dashboard: truthful lessons count', dash0.includes(`0 of ${R} lessons complete`), dash0.slice(0, 300));
  check('fresh dashboard: no misses', dash0.includes('No misses to review yet'));
  check('fresh dashboard: no tests', dash0.includes('No tests taken yet'));
  check('fresh dashboard: 0 mastered', dash0.includes(`0 of ${skillsWord(NSK)} mastered`), dash0.slice(0, 600));
  await shot('dashboard');

  // ================================================================ 2. World 1 Lesson 1
  await tapOk('Start Learning', await tapText('/Start Learning/'));
  check('lesson URL', (await q('location.hash')) === '#/learn/w1l1/1', await q('location.hash'));
  check('lesson h1', (await text('#view h1')) === 'What Is a Market?', await text('#view h1'));
  check('focus moved to lesson h1', (await q('document.activeElement.tagName')) === 'H1');
  // Read to Me
  await b.wait(1000);
  check('Read to Me controls present', await q(`!!document.querySelector('#view .read-to-me')`));
  check('Read to Me Play button', (await text('#view .read-to-me button:not([hidden])')) === '▶ Play');
  check('Read to Me speed control labelled', ((await L.axOf(b, '#view .read-to-me select'))?.name || '') === 'Speed', JSON.stringify(await L.axOf(b, '#view .read-to-me select')));
  check('Read to Me never autoplays on load', (await q('window.__speech.speak.length')) === 0, await q('JSON.stringify(window.__speech.speak)'));
  check('step 1 placeholder art has a text alternative', ((await text('#view .placeholder-art .ph-alt')) || '').includes('farmers market'), await text('#view .placeholder-art'));
  await tapOk('Play', await tapText('/^▶ Play$/', '#view .read-to-me'));
  await b.wait(200);
  const spoken = await q('window.__speech.speak.slice()');
  check('Play calls speechSynthesis.speak', spoken.length > 0, JSON.stringify(spoken));
  check('Play reads this step (title first)', (spoken[0] || '').startsWith('Saturday at the Farmers Market'), spoken[0]);
  check('status says reading', (await text('#view .rtm-status')) === 'Reading aloud…', await text('#view .rtm-status'));
  const pauseVisible = await q(`[...document.querySelectorAll('#view .read-to-me button')].some((x) => !x.hidden && x.textContent === 'Pause')`);
  check('Pause shown while playing (desktop UA)', pauseVisible);
  if (pauseVisible) {
    await tapOk('Pause', await tapText('/^Pause$/', '#view .read-to-me'));
    check('Pause calls speechSynthesis.pause', (await q('window.__speech.pause')) === 1);
    check('Resume offered', await q(`[...document.querySelectorAll('#view .read-to-me button')].some((x) => !x.hidden && x.textContent === 'Resume')`));
    await tapOk('Resume', await tapText('/^Resume$/', '#view .read-to-me'));
    check('Resume calls speechSynthesis.resume', (await q('window.__speech.resume')) >= 2);
  }
  const cancel0 = await q('window.__speech.cancel');
  await tapOk('Stop', await tapText('/Stop$/', '#view .read-to-me'));
  check('Stop calls speechSynthesis.cancel', (await q('window.__speech.cancel')) > cancel0);
  check('Stop status', (await text('#view .rtm-status')) === 'Stopped.', await text('#view .rtm-status'));
  check('Play available again after Stop', (await text('#view .read-to-me button:not([hidden])')) === '▶ Play');
  await tapOk('Play again', await tapText('/^▶ Play$/', '#view .read-to-me'));
  await b.wait(150);
  // Tap-a-word
  await b.js(`document.querySelector('#view .lesson-body button.term').dataset.qaOpener = '1';`);
  const termWord = await text('#view .lesson-body button.term');
  await tapOk('tap-a-word', await tapSel('#view .lesson-body button.term'));
  check('word dialog opens', await q(`!!document.querySelector('dialog.modal[open]')`));
  check('word dialog title is the word', (await text('dialog.modal h2')) === termWord, `${await text('dialog.modal h2')} vs ${termWord}`);
  check('word dialog has a definition', ((await text('dialog.modal .term-def')) || '').length > 15, await text('dialog.modal .term-def'));
  check('word dialog has an example', ((await text('dialog.modal .term-example')) || '').length > 10);
  check('focus moved into dialog', await q(`document.querySelector('dialog.modal').contains(document.activeElement)`));
  check('dialog accessible name', ((await L.axOf(b, 'dialog.modal'))?.name || '') === termWord, JSON.stringify(await L.axOf(b, 'dialog.modal')));
  await L.press(b, 'Escape');
  await b.wait(150);
  check('Esc closes word dialog', !(await q(`!!document.querySelector('dialog.modal')`)));
  check('focus returns to the tapped word', await q(`document.activeElement?.dataset?.qaOpener === '1'`), await q('document.activeElement.outerHTML.slice(0,80)'));
  // Steps 2..6
  const cancelBeforeNav = await q('window.__speech.cancel');
  const speaksBefore = await q('window.__speech.speak.length');
  await tapOk('Next → step 2', await tapSel('#view nav.lesson-nav a.btn-primary'));
  check('step 2 URL', (await q('location.hash')) === '#/learn/w1l1/2');
  check('leaving a step stops speech', (await q('window.__speech.cancel')) > cancelBeforeNav);
  await b.wait(600);
  check('step 2 does not autoplay', (await q('window.__speech.speak.length')) === speaksBefore);
  check('step 2 definition card shows the term', (await text('#view .definition-card .term-name')) === 'market', await text('#view .definition-card .term-name'));
  check('step 2 key idea', ((await text('#view .key-idea')) || '').includes('buyers and sellers trade'));
  check('step 2 Read to Me present', await q(`!!document.querySelector('#view .read-to-me')`));

  await tapOk('Next → step 3', await tapSel('#view nav.lesson-nav a.btn-primary'));
  check('step 3 URL', (await q('location.hash')) === '#/learn/w1l1/3');
  check('step 3 visual renders', (await q(`document.querySelectorAll('#view figure.mm-visual--priceTags .mm-pricetag').length`)) === 4);
  const visAx = await L.axOf(b, '#view figure.mm-visual');
  check('step 3 visual has an accessible name (Chrome AX tree)', !!(visAx && visAx.name), JSON.stringify(visAx) + ' — figure relies on <figcaption>, which Chrome does not expose as the name');
  check('step 3 visual has a visible title', ((await text('#view figure.mm-visual figcaption')) || '').length > 5);
  await shot('lesson-visual');

  await tapOk('Next → step 4', await tapSel('#view nav.lesson-nav a.btn-primary'));
  check('step 4 URL', (await q('location.hash')) === '#/learn/w1l1/4');
  const together = await b.js(`const m = ${lessonsMod}; return m.lessonById('w1l1').steps[3].steps.explorer.map((s) => ({ choices: s.choices.map((c) => ({ text: c.text, correct: !!c.correct, coach: c.coach })) }));`);
  for (let i = 0; i < together.length; i++) {
    const item = together[i];
    const wrong = item.choices.find((c) => !c.correct), right = item.choices.find((c) => c.correct);
    check(`together ${i + 1}: eyebrow`, (await text('#view .together-q .eyebrow')) === `Together · ${i + 1} of ${together.length}`);
    await tapOk(`together ${i + 1} wrong`, await L.tap(b, `[...document.querySelectorAll('#view .together-q .choice')].find((x) => x.textContent === ${JSON.stringify(wrong.text)})`));
    const coach = await b.js(`const f = document.querySelector('#view .together-q .coach'); return { cls: f.className, text: f.innerText.replace(/\\s+/g, ' ') };`);
    check(`together ${i + 1}: wrong shows coaching`, /is-wrong/.test(coach.cls) && coach.text.includes('Not quite') && coach.text.includes(wrong.coach.replace(/\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g, (_, id, s) => s || id)), coach.text);
    check(`together ${i + 1}: retry allowed (choices still enabled)`, await q(`[...document.querySelectorAll('#view .together-q .choice')].every((x) => !x.disabled)`));
    check(`together ${i + 1}: no advance after error`, !(await q(`[...document.querySelectorAll('#view .together-q button')].some((x) => /Next question/.test(x.textContent))`)));
    await tapOk(`together ${i + 1} right`, await L.tap(b, `[...document.querySelectorAll('#view .together-q .choice')].find((x) => x.textContent === ${JSON.stringify(right.text)})`));
    check(`together ${i + 1}: right answer confirmed`, /is-correct/.test(await q(`document.querySelector('#view .together-q .coach').className`)));
    if (i < together.length - 1) await tapOk(`together ${i + 1} next`, await tapText('/Next question/', '#view .together-q'));
    else check('together: finished notice', ((await text('#view .together .notice')) || '').includes('You finished practicing together'));
  }

  await tapOk('Next → step 5', await tapSel('#view nav.lesson-nav a.btn-primary'));
  check('step 5 URL', (await q('location.hash')) === '#/learn/w1l1/5');
  const cq = await b.js(`const m = ${lessonsMod}; const qq = m.lessonById('w1l1').steps[4].question.explorer; return JSON.parse(JSON.stringify(qq));`);
  const plainify = (t) => String(t).replace(/\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g, (_, id, s) => s || id);
  const cRight = cq.choices.find((c) => c.id === cq.answer);
  const cWrong = cq.choices.find((c) => c.id !== cq.answer && c.misconception);
  check('check: no Show answer button in lesson check', !(await q(`[...document.querySelectorAll('#view .q-actions button')].some((x) => /Show answer/.test(x.textContent))`)));
  await tapOk('check hint', await tapText('/Hint/', '#view .q-actions'));
  const hint1 = await text('#view .hint-list li');
  check('check: hint 1 shown', (hint1 || '').includes(plainify(cq.hints[0]).slice(0, 30)), hint1);
  check('check: hint does not give the answer', !(hint1 || '').toLowerCase().includes(plainify(cRight.text).toLowerCase()));
  check('check: hint counter', /1 of 2 used/.test(await text('#view .q-actions button:nth-child(2)')));
  await tapOk('check wrong choice', await L.tap(b, `document.querySelector('#view .choices [data-id="${cWrong.id}"]')`));
  await tapOk('check: Check', await tapText('/^Check$/', '#view .q-actions'));
  let fb = await b.js(`const f = document.querySelector('#view .lesson-body .feedback'); return { cls: f.className, text: f.innerText.replace(/\\s+/g, ' ') };`);
  check('check: wrong answer explained with misconception coaching', /is-wrong/.test(fb.cls) && fb.text.includes(plainify(cq.misconceptions[cWrong.misconception]).slice(0, 40)), fb.text);
  check('check: wrong feedback does not reveal answer', !fb.text.toLowerCase().includes(plainify(cRight.text).toLowerCase()), fb.text);
  check('check: retry allowed', await q(`[...document.querySelectorAll('#view .choices .choice')].every((x) => !x.disabled)`));
  await shot('lesson-check-feedback');
  await tapOk('check right choice', await L.tap(b, `document.querySelector('#view .choices [data-id="${cRight.id}"]')`));
  await tapOk('check: Check again', await tapText('/^Check$/', '#view .q-actions'));
  fb = await b.js(`const f = document.querySelector('#view .lesson-body .feedback'); return { cls: f.className, text: f.innerText.replace(/\\s+/g, ' ') };`);
  check('check: right answer confirmed with Why', /is-correct/.test(fb.cls) && fb.text.includes('Why:'), fb.text);
  check('check: question locked after correct', await q(`[...document.querySelectorAll('#view .choices .choice')].every((x) => x.disabled)`));
  check('check: lesson check gives no mastery evidence', Object.values((await state()).skills).every((k) => k.independent.attempts === 0 && k.assisted.attempts === 0));

  await tapOk('Next → step 6', await tapSel('#view nav.lesson-nav a.btn-primary'));
  check('step 6 URL', (await q('location.hash')) === '#/learn/w1l1/6');
  check('lesson complete notice', ((await text('#view .notice-success')) || '').includes('Lesson complete!'));
  let s = await state();
  check('lesson marked complete in store', s.lessons.w1l1?.completed === true, JSON.stringify(s.lessons.w1l1));
  check('lesson skills introduced', s.skills['market-basics']?.introduced === true && s.skills['buyers-sellers']?.introduced === true);
  check('completion gives no mastery', Object.values(s.skills).every((k) => k.independent.attempts === 0));
  check('practice-this-lesson link', (await q(`document.querySelector('#view a[href^="#/practice?lesson="]')?.getAttribute('href')`)) === '#/practice?lesson=w1l1');

  // ================================================================ 3. Practice (separate mode)
  await navTo('#/practice');
  check('practice h1', (await text('#view h1')) === 'Practice makes progress', await text('#view h1'));
  check('Practice My Misses disabled with no misses', await q(`[...document.querySelectorAll('#view button')].find((x) => x.textContent === 'Practice My Misses').disabled`));
  const w1Ready = await b.js(`const m = ${lessonsMod}; return m.LESSONS.filter((l) => l.world === 1 && l.status === 'ready').map((l) => l.id);`);
  const lessonOpts = await q(`[...document.getElementById('pr-lesson').options].map((o) => o.value)`);
  check('practice chooser: Lesson dropdown lists each ready World 1 lesson', w1Ready.every((id) => lessonOpts.includes(id)), `options: ${JSON.stringify(lessonOpts)} (expected ${w1Ready}); stray text: ${JSON.stringify(await q(`[...document.getElementById('pr-lesson').childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.slice(0, 60))`))}`);
  const skillOpts = await q(`[...document.getElementById('pr-skill').options].map((o) => o.value)`);
  check('practice chooser: Skill dropdown lists skills', skillOpts.filter(Boolean).length >= 2, JSON.stringify(skillOpts));
  await b.js(`const l = document.getElementById('pr-lesson'); l.value = 'w1l1'; l.dispatchEvent(new Event('change'));`);
  check('practice chooser: can choose Lesson 1', (await q(`document.getElementById('pr-lesson').value`)) === 'w1l1');
  await L.tap(b, `document.querySelector('input[name="pr-diff"][value="easy"]').closest('label')`);
  check('easy difficulty chosen by tap', await q(`document.querySelector('input[name="pr-diff"][value="easy"]').checked`));
  await tapOk('Start practice', await tapText('/^Start practice$/'));
  check('practice session route', (await q('location.hash')) === '#/practice/session');

  const doneKinds = [];
  // Q1: wrong first (no hint), then retry correct.
  let c1 = await cur();
  check('Q1 captured question matches screen', !!c1 && c1.prompt === c1.shown, JSON.stringify(c1 && [c1.prompt, c1.shown]));
  await respond('wrong');
  fb = await fbText();
  check('Q1 wrong: feedback shown', /is-wrong/.test(fb.cls), fb.cls);
  check('Q1 wrong: feedback explains (more than "not quite")', fb.text.replace('Not quite yet.', '').replace('Change your answer and press Check to try again.', '').trim().length > 15, fb.text);
  check('Q1 wrong: feedback does not reveal the answer', !revealsAnswer(fb.text, c1), `${fb.text} | answer ${c1.answerText}`);
  await b.wait(1500);
  const c1b = await cur();
  check('Q1 wrong: no auto-advance', c1b && c1b.key === c1.key);
  check('Q1 wrong: no Next button', !(await q(`[...document.querySelectorAll('#view .lesson-step button')].some((x) => /Next question/.test(x.textContent))`)));
  check('Q1 wrong: Try again offered', await q(`[...document.querySelectorAll('#view .lesson-step button')].some((x) => x.textContent === 'Try again')`));
  check('Q1 wrong: Check still enabled (retry)', await q(`!__qh.btn(${ROOT}, /^Check$/).disabled`));
  independent(c1.skill, false);
  await shot('practice-feedback');
  await tapOk('Try again', await tapText('/^Try again$/'));
  await respond('right');
  fb = await fbText();
  check('Q1 retry correct', /is-correct/.test(fb.cls), fb.text);
  sk(c1.skill).aa++; sk(c1.skill).ac++;
  check('Q1 tally: with help 1', /On your own: 0 With help: 1 Answers shown: 0/.test(await tallyText()), await tallyText());
  await compareEvidence('after Q1');
  await nextQuestion();

  // Q2: progressive hints, then correct → assisted.
  const c2 = await cur();
  check('Q2 is a new question', c2 && c2.key !== c1.key && c2.prompt === c2.shown);
  await tapOk('Hint 1', await tapText('/Hint \\(/', '#view .q-actions'));
  const h1 = await b.js(`return [...${ROOT}.querySelectorAll('.hint-list li')].map((x) => x.innerText.replace(/\\s+/g, ' '));`);
  check('Q2 hint 1 shown', h1.length === 1 && h1[0].includes(c2.hints[0].slice(0, 25)), JSON.stringify(h1));
  check('Q2 hint counter after 1', new RegExp(`1 of ${c2.hints.length} used`).test(await b.js(`return __qh.btn(${ROOT}, /Hint|No more hints/).textContent;`)));
  check('Q2 no answer feedback after a hint', !/is-correct|is-wrong/.test((await fbText()).cls));
  await tapOk('Hint 2', await tapText('/Hint \\(/', '#view .q-actions'));
  const h2 = await b.js(`return [...${ROOT}.querySelectorAll('.hint-list li')].map((x) => x.innerText.replace(/\\s+/g, ' '));`);
  check('Q2 hints are progressive (2 different)', h2.length === 2 && h2[0] !== h2[1] && h2[1].includes(c2.hints[1].slice(0, 25)), JSON.stringify(h2));
  check('Q2 hints do not reveal the answer', !h2.some((t) => revealsAnswer(t, c2)), JSON.stringify(h2) + ' | ' + c2.answerText);
  await respond('right');
  check('Q2 correct after hints', /is-correct/.test((await fbText()).cls));
  sk(c2.skill).aa++; sk(c2.skill).ac++;
  check('Q2 tally: hinted correct counts as with help', /On your own: 0 With help: 2/.test(await tallyText()), await tallyText());
  await compareEvidence('after Q2');
  await nextQuestion();

  // Q3: Show answer → no credit.
  const c3 = await cur();
  await tapOk('Show answer', await tapText('/^Show answer$/', '#view .q-actions'));
  fb = await fbText();
  check('Q3 reveal shows the answer', fb.text.includes('Here’s the answer') && (c3.type !== 'choice' || fb.text.includes(c3.answerText)), fb.text);
  check('Q3 reveal says no credit', /No credit/i.test(fb.text));
  check('Q3 reveal locks the question', await q(`!__qh.btn(${ROOT}, /^Check$/) || __qh.btn(${ROOT}, /^Check$/).disabled`));
  sk(c3.skill).rev++; addMiss(c3.skill);
  check('Q3 tally: shown 1', /Answers shown: 1/.test(await tallyText()), await tallyText());
  await compareEvidence('after Q3 (reveal gives no credit)');
  await nextQuestion();

  // Q4–Q6: correct first try → independent.
  for (let i = 4; i <= 6; i++) {
    const c = await cur();
    check(`Q${i} captured`, !!c && c.prompt === c.shown);
    await respond('right');
    check(`Q${i} correct first try`, /is-correct/.test((await fbText()).cls));
    independent(c.skill, true);
    doneKinds.push(c.type);
    if (i < 6) await nextQuestion();
  }
  check('tally after 6: own 3 help 2 shown 1', /On your own: 3 With help: 2 Answers shown: 1/.test(await tallyText()), await tallyText());
  s = await compareEvidence('after practice session');
  await tapOk('End session', await tapText('/^End session$/'));
  check('summary route', (await q('location.hash')) === '#/practice/summary');
  const sumText = await viewText();
  check('summary numbers match', /6 questions finished/.test(sumText) && /3 on your own/.test(sumText) && /2 with help/.test(sumText) && /1 answers shown/.test(sumText), sumText.slice(0, 300));

  // ================================================================ 4. Practice My Misses
  await route('#/practice');
  const missSkills = Object.keys(expMiss);
  check('there are misses to review', missSkills.length > 0, JSON.stringify(expMiss));
  check('Practice My Misses enabled', await q(`![...document.querySelectorAll('#view button')].find((x) => x.textContent === 'Practice My Misses').disabled`));
  await tapOk('Practice My Misses', await tapText('/^Practice My Misses$/'));
  check('misses session h1', (await text('#view h1')) === 'Practice My Misses');
  for (let i = 0; i < 3; i++) {
    const c = await cur();
    if (!c) { check('misses session ends when queue is cleared', ((await text('#view .lesson-step .notice')) || '').includes('every question'), await text('#view .lesson-step')); break; }
    check(`misses Q${i + 1} serves a missed skill`, Object.keys(expMiss).includes(c.skill), `${c.skill} not in ${JSON.stringify(Object.keys(expMiss))}`);
    await respond('right');
    independent(c.skill, true);
    await nextQuestion();
  }
  await compareEvidence('after Practice My Misses');
  const endBtn = await tapText('/^(End session|See summary|Back)$/');
  check('misses session can end', endBtn.ok);

  // ================================================================ 5. Test
  await navTo('#/test');
  check('test chooser h1', (await text('#view h1')) === 'Show what you know');
  await tapOk('w1l1 test card', await tapSel('#view a[href="#/test/w1l1"]'));
  check('test intro h1', (await text('#view h1')) === 'Lesson test: What Is a Market?', await text('#view h1'));
  const acc0 = await q('window.__qa.accepted.length');
  await tapOk('Start test', await tapText('/^Start test$/'));
  const n = 6;
  check('test has 6 questions', (await text('#view h1')) === 'Question 1 of 6', await text('#view h1'));
  const items = await b.js(`return window.__qa.accepted.slice(-${n}).map((q) => ({ key: q.key, skill: q.skill, type: q.type, prompt: __qh.plain(q.prompt) }));`);
  check('test generated exactly 6 new questions', (await q('window.__qa.accepted.length')) - acc0 === n);
  // A test question must render its prompt and answer controls. (If it doesn't, the suite records the
  // defect, submits blank — the only thing a student could do — and keeps checking everything after it.)
  const renders = await q(`!document.querySelector('#view .question.q-undefined') && !!document.querySelector('#view .q-answer .choices, #view .q-answer input, #view .q-answer select, #view .q-answer .word-bank')`);
  check('test question renders its prompt and answer controls', renders, await q(`(document.querySelector('#view .lesson-step')?.innerText || '').replace(/\\s+/g, ' ').slice(0, 200)`));
  await shot('test-question');
  const RIGHT = renders ? 4 : 0;
  for (let i = 0; i < n; i++) {
    check(`test Q${i + 1}: no hint/check/show-answer buttons`, !(await q(`[...document.querySelectorAll('#view .question button')].some((x) => /Hint|Check|Show answer/.test(x.textContent))`)));
    check(`test Q${i + 1}: no q-actions`, !(await q(`!!document.querySelector('#view .q-actions')`)));
    if (renders) {
      const shown = await b.js(`return __qh.norm(document.querySelector('#view .q-prompt').textContent);`);
      check(`test Q${i + 1} matches generated item`, shown === items[i].prompt, `${shown} | ${items[i].prompt}`);
      await b.js(`const root = document.querySelector('#view .lesson-step'); const q = window.__qa.accepted[window.__qa.accepted.length - ${n} + ${i}];
        __qh.fill(root, q, ${i < RIGHT ? '__qh.rightResponse(q)' : '__qh.wrongResponse(q)'});`);
      await b.wait(100);
      check(`test Q${i + 1}: no correctness shown before submit`, await q(`!document.querySelector('#view .is-correct, #view .is-tried, #view .feedback.is-correct, #view .feedback.is-wrong') && (document.querySelector('#view .feedback')?.textContent || '') === ''`));
      check(`test Q${i + 1}: answered count`, ((await text('#view .tally')) || '').includes(`Answered: ${i + 1} of ${n}`), await text('#view .tally'));
    }
    if (i < n - 1) await tapOk(`test next ${i + 1}`, await tapText('/^Next →$/'));
  }
  if (renders) {
    await tapOk('test back', await tapText('/^← Back$/'));
    check('test: Back keeps the answer', ((await text('#view .tally')) || '').includes(`Answered: ${n} of ${n}`));
  }
  const testsBefore = (await state()).tests.length;
  check('nothing recorded before submit', testsBefore === 0);
  await tapOk('Submit test', await tapText('/^Submit test$/'));
  await b.wait(300);
  if (renders) check('no blank-answer confirm needed', !(await q(`!!document.querySelector('dialog.modal')`)));
  else {
    check('blank submit asks for confirmation', ((await text('dialog.modal h2')) || '') === 'Submit with blank answers?');
    await tapOk('Submit anyway', await L.tap(b, `[...document.querySelectorAll('dialog.modal button')].find((x) => x.textContent === 'Submit anyway')`));
    await b.wait(300);
  }
  check('results score equals deliberate right answers', (await text('#view .score-big')) === `${RIGHT} of ${n}`, await text('#view .score-big'));
  s = await state();
  const t = s.tests[s.tests.length - 1];
  check('test saved to store', s.tests.length === 1 && t.score === RIGHT && t.total === n && t.scope === 'w1l1', JSON.stringify(t));
  const bySkillExp = {};
  items.forEach((it, i) => { const x = (bySkillExp[it.skill] ||= { correct: 0, total: 0 }); x.total++; if (i < RIGHT) x.correct++; independent(it.skill, i < RIGHT); });
  check('per-skill results saved', JSON.stringify(Object.entries(t.bySkill).sort()) === JSON.stringify(Object.entries(bySkillExp).sort()), `${JSON.stringify(t.bySkill)} vs ${JSON.stringify(bySkillExp)}`);
  const statTexts = await b.js(`return [...document.querySelectorAll('#view .stats .stat')].map((x) => x.innerText.replace(/\\s+/g, ' '));`);
  check('per-skill results shown', Object.keys(bySkillExp).length === statTexts.length && Object.values(bySkillExp).every((v) => statTexts.some((st) => st.startsWith(`${v.correct}/${v.total}`))), JSON.stringify(statTexts));
  const resItems = await b.js(`return [...document.querySelectorAll('#view .result-item')].map((x) => ({ cls: x.className, t: x.innerText.replace(/\\s+/g, ' ') }));`);
  check('every question listed', resItems.length === n);
  check('each result shows its question prompt', await q(`[...document.querySelectorAll('#view .result-item .q-prompt')].every((x) => x.textContent.trim().length > 10)`), JSON.stringify(resItems.map((r) => r.t.slice(0, 80))));
  check('each result shows the correct answer (not "No answer")', resItems.every((r) => /Correct answer (?!No answer)/.test(r.t)), JSON.stringify(resItems.map((r) => r.t.slice(0, 120))));
  check('each result shows an explanation (Why)', resItems.every((r) => r.t.includes('Why')), JSON.stringify(resItems.map((r) => r.t.slice(0, 80))));
  check('result marks match what was answered', resItems.every((r, i) => (i < RIGHT ? /is-right/.test(r.cls) : /is-wrong/.test(r.cls))), JSON.stringify(resItems.map((r) => r.cls)));
  await compareEvidence('after test (test items = independent evidence)');
  await shot('test-results');
  const missedLinks = await b.js(`return [...document.querySelectorAll('#view a[href^="#/practice?skill="]')].map((a) => a.getAttribute('href'));`);
  const missedSkillsExp = [...new Set(items.slice(RIGHT).map((it) => it.skill))];
  check('review-missed-skills links for each missed skill', missedSkillsExp.every((sId) => missedLinks.includes(`#/practice?skill=${sId}`)) && missedLinks.length === missedSkillsExp.length, `${JSON.stringify(missedLinks)} vs ${JSON.stringify(missedSkillsExp)}`);
  // Retake
  await tapOk('Retake', await tapText('/^Retake/'));
  check('retake starts a new test', (await text('#view h1')) === 'Question 1 of 6');
  const keys2 = await b.js(`return window.__qa.accepted.slice(-${n}).map((q) => q.key);`);
  const overlap = keys2.filter((k) => items.some((it) => it.key === k));
  check('retake uses different question keys', overlap.length === 0, JSON.stringify(overlap));
  check('retake does not record anything yet', (await state()).tests.length === 1);
  // review missed skill link
  if (missedLinks[0]) {
    await route(missedLinks[0]);
    const skillId = missedLinks[0].split('=')[1];
    check('missed-skill link preselects the skill in Practice', (await q(`document.getElementById('pr-skill').value`)) === skillId, await q(`document.getElementById('pr-skill').value`));
  }

  // ================================================================ 6. Market Lab
  await navTo('#/market-lab');
  check('market lab h1', (await text('#view h1')) === 'Market Lab');
  check('pretend-prices disclaimer', ((await text('#view .lab-disclaimer')) || '').includes('Pretend prices only'));
  check('Price Watch default tab for 3–5', (await q(`document.getElementById('lab-tab-watch').getAttribute('aria-selected')`)) === 'true');
  const sc = await b.js(`const m = await import(new URL('js/content/market-scenarios.js', document.baseURI).href); return JSON.parse(JSON.stringify(m.SCENARIOS));`);
  const wheat = sc[0];
  await tapOk('Reveal without choosing', await tapText('/^Reveal Day 1$/'));
  check('Price Watch requires prediction + reason', ((await text('#view .lab-msg')) || '').includes('Choose a prediction and a reason first'));
  let prev = wheat.start;
  for (let d = 0; d < wheat.days.length; d++) {
    const day = wheat.days[d];
    await L.tap(b, `document.querySelector('input[name="pw-pred"][value="up"]').closest('label')`);
    await L.tap(b, `document.querySelector('input[name="pw-reason"][value="news"]').closest('label')`);
    await tapOk(`reveal ${day.label}`, await tapText(`/^Reveal ${day.label}$/`));
    const head = await text('#view .lab-reveal-head');
    check(`Price Watch ${day.label} revealed price`, head === `${day.label}: $${day.price.toFixed(2)}`, head);
    const chg = Math.round((day.price - prev) * 100) / 100;
    const pct = (day.price - prev) / prev * 100;
    const dir = Math.abs(pct) <= 1 ? 'about the same' : pct > 0 ? 'up' : 'down';
    const math = await text('#view .lab-math');
    check(`Price Watch ${day.label} change math`, math.includes(`$${day.price.toFixed(2)} − $${prev.toFixed(2)}`) && math.includes(Math.abs(chg).toFixed(2)) && math.includes(`(${dir})`), `${math} | expected ${chg} ${dir}`);
    if (d === 0) await shot('market-lab-watch');
    prev = day.price;
    await tapOk(`next after ${day.label}`, await tapText('/^(Next day|See my thinking summary)$/'));
  }
  check('Price Watch summary', ((await text('#view .lab-body h3')) || '') === 'Your thinking summary');
  check('Price Watch overall move', (await viewText()).includes(`from $${wheat.start.toFixed(2)} to $${wheat.days.at(-1).price.toFixed(2)}`));
  s = await state();
  check('Price Watch run recorded', s.lab.runs === 1 && s.lab.decisions[0]?.activity === 'price-watch', JSON.stringify(s.lab));

  // Paper Practice with a loss
  await tapOk('Paper Practice tab', await tapSel('#lab-tab-paper'));
  check('Paper tab selected', (await q(`document.getElementById('lab-tab-paper').getAttribute('aria-selected')`)) === 'true');
  const apples = sc.find((x) => x.id === 'practice-apples-surprise');
  await b.js(`const s = document.querySelector('.lab-scenario-pick select'); s.value = 'practice-apples-surprise'; s.dispatchEvent(new Event('change'));`);
  await b.wait(150);
  check('scenario switched', ((await text('#view .lab-activity-title')) || '').includes(apples.item));
  await L.tap(b, `document.querySelector('input[name="pp-side"][value="long"]').closest('label')`);
  await b.js(`const t = document.querySelector('#view .lab-body textarea'); t.value = 'Lots of apples were picked so I think supply is high.'; t.dispatchEvent(new Event('input'));`);
  await tapOk('Start the pretend days', await tapText('/^Start the pretend days$/'));
  for (let i = 0; i < 10; i++) {
    const go = await tapText('/^Go to Day/');
    if (!go || !go.ok) break;
  }
  check('paper practice finished', (await text('#view .lab-body h3')) === 'How it turned out (pretend)', await text('#view .lab-body h3'));
  const exit = apples.days.at(-1).price;
  const pl = Math.round((exit - apples.start) * apples.quantity * 100) / 100;      // long: (exit − entry) × qty
  check('scenario really is a loss (test premise)', pl < 0 && -pl > apples.margin, `${pl} vs margin ${apples.margin}`);
  const lines = await b.js(`return [...document.querySelectorAll('#view .lab-body > .lab-math .lab-math-lines li')].map((x) => x.textContent);`);
  const total = await text('#view .lab-body > .lab-math .lab-math-total');
  check('P/L line 1: price change', (lines[0] || '').includes(`$${exit.toFixed(2)}`) && lines[0].includes(`$${apples.start.toFixed(2)}`) && lines[0].includes((exit - apples.start).toFixed(2).replace('-', '')), JSON.stringify(lines));
  check('P/L line 3: × quantity', (lines[2] || '').includes(`× ${apples.quantity}`) && lines[2].includes(Math.abs(pl).toFixed(2)), lines[2]);
  check('P/L total is a loss of the right size', /Pretend loss/.test(total) && total.includes(Math.abs(pl).toFixed(2)) && /[−-]/.test(total), total);
  const marginTxt = await text('#view .lab-margin');
  check('loss-exceeds-margin message', marginTxt.includes('bigger than the margin deposit') && marginTxt.includes(`extra $${(-pl - apples.margin).toFixed(2)}`) && marginTxt.includes('Margin is not the most you can lose'), marginTxt);
  check('other side shown as gain', (await viewText()).includes(`would have been +$${Math.abs(pl).toFixed(2)}`));
  await shot('market-lab-paper-loss');
  s = await state();
  check('paper run recorded without P/L score', s.lab.runs === 2 && s.lab.decisions[1]?.activity === 'paper-practice' && s.lab.decisions[1]?.choice === 'long', JSON.stringify(s.lab.decisions[1]));
  check('no profit/loss stored', s.lab.decisions.every((d) => Object.keys(d).every((k) => ['scenarioId', 'activity', 'choice', 'reasonGiven', 'date'].includes(k))), JSON.stringify(s.lab.decisions));
  // No trade
  await tapOk('Practice this market again', await tapText('/^Practice this market again$/'));
  await L.tap(b, `document.querySelector('input[name="pp-side"][value="none"]').closest('label')`);
  await tapOk('Start (no trade)', await tapText('/^Start the pretend days$/'));
  for (let i = 0; i < 10; i++) { const go = await tapText('/^Go to Day/'); if (!go || !go.ok) break; }
  const vt = await viewText();
  check('No trade option works', vt.includes('You chose not to trade') && vt.includes('Waiting is a valid'), vt.slice(0, 200));
  check('No trade comparison shows both sides', vt.includes(`Buy (long) would have been −$${Math.abs(pl).toFixed(2)}`) || vt.includes(`Buy (long) would have been -$${Math.abs(pl).toFixed(2)}`), vt.match(/Buy \(long\) would have been [^;]+/)?.[0]);
  s = await state();
  check('No trade run recorded', s.lab.runs === 3 && s.lab.decisions[2]?.choice === 'none');

  // ================================================================ 7. Save a mid-lesson spot, reload, Continue Learning
  await route('#/learn/w1l2/1');
  const warm = await text('#view .lesson-step h2');
  check('w1l2 offers optional warm-up (prereqs not mastered)', warm === 'Want a quick warm-up first?', warm);
  if (warm === 'Want a quick warm-up first?') await tapOk('Skip warm-up', await tapText('/^Skip warm-up$/'));
  check('w1l2 step 1', (await q('location.hash')) === '#/learn/w1l2/1');
  await tapOk('w1l2 next', await tapSel('#view nav.lesson-nav a.btn-primary'));
  await tapOk('w1l2 next', await tapSel('#view nav.lesson-nav a.btn-primary'));
  check('w1l2 step 3', (await q('location.hash')) === '#/learn/w1l2/3');
  const w1l2Title = await text('#view h1');
  await route('#/');
  await b.reload();
  await L.helpers(b);
  check('reload: band kept', (await state()).band === 'explorer');
  const cont = await b.js(`const a = [...document.querySelectorAll('#view a')].find((x) => /Continue Learning/.test(x.textContent)); return a ? a.getAttribute('href') : null;`);
  check('reload: Continue Learning resumes saved lesson + step', cont === '#/learn/w1l2/3', cont);
  check('reload: hero shows saved step', ((await text('#view .hero-current')) || '').includes(`${w1l2Title} · step 3 of 6`), await text('#view .hero-current'));
  s = await state();
  const dash = await viewText();
  const missN = Object.keys(s.misses).length;
  check('dashboard lessons count is true', dash.includes(`1 of ${R} lessons complete`), dash.slice(0, 400));
  check('dashboard misses count is true', missN === Object.keys(expMiss).length && (missN ? dash.includes(`${missN} skill${missN === 1 ? '' : 's'} ready for review`) : dash.includes('No misses to review yet')), `${missN}`);
  check('dashboard last test score is true', dash.includes(`Last score: ${RIGHT} of ${n}`));
  check('dashboard lab runs are true', dash.includes('3 practice runs'));
  check('dashboard thinking is true', dash.includes('Not started yet'));
  const mastered = await b.js(`const e = await import(new URL('js/engine/index.js', document.baseURI).href); const st = window.__mm.store.get(); return Object.keys(st.skills).filter((id) => e.masteryFor(st, id).level === 'mastered').length;`);
  check('dashboard mastered is true', dash.includes(`${mastered} of ${skillsWord(NSK)} mastered`), `${mastered} | ${dash.slice(0, 600)}`);
  await shot('dashboard-returning');
  await tapOk('Continue Learning', await tapText('/Continue Learning/'));
  check('Continue Learning opens saved lesson', (await text('#view h1')) === w1l2Title && (await q('location.hash')) === '#/learn/w1l2/3');
  check('Continue Learning opens saved step', ((await text('#view .progress-label')) || '').includes('Step 3 of 6'), await text('#view .progress-label'));
  await shot('lesson-step');
  await navTo('#/progress');
  const pt = await b.js(`return [...document.querySelectorAll('#view .stats .stat')].map((x) => x.innerText.replace(/\\s+/g, ' '));`);
  const introducedN = Object.values(s.skills).filter((k) => k.introduced).length;
  check('progress: lessons completed', pt[0] === `1 of ${R} lessons completed`, JSON.stringify(pt));
  const skLabel = (n, rest) => `${n} ${n === 1 ? 'skill' : 'skills'} ${rest}`;
  check('progress: skills introduced', pt[1] === skLabel(introducedN, 'introduced'), JSON.stringify(pt));
  check('progress: skills mastered', pt[2] === skLabel(mastered, 'mastered'), JSON.stringify(pt));
  check('progress: to review', pt[3] === `${missN} skills to review` || pt[3] === `${missN} skill to review`, JSON.stringify(pt));
  const rows = await b.js(`return Object.fromEntries([...document.querySelectorAll('#view table tbody tr')].filter((r) => r.querySelector('th[scope=row]')).map((r) => [r.querySelector('th').firstChild.textContent, [...r.querySelectorAll('td')].map((d) => d.innerText.replace(/\\s+/g, ' '))]));`);
  const names = await b.js(`const m = await import(new URL('js/content/skills.js', document.baseURI).href); return Object.fromEntries(Object.entries(m.SKILLS).map(([k, v]) => [k, v.name]));`);
  for (const [id, e] of Object.entries(exp)) {
    const r = rows[names[id]];
    check(`progress table ${id} on-your-own`, r && r[1] === `${e.ic} of ${e.ia} correct`, JSON.stringify(r));
    check(`progress table ${id} with-help`, r && r[2].startsWith(`${e.ac} of ${e.aa} correct`), JSON.stringify(r));
  }
  await shot('progress');

  // ================================================================ 8. Grades 6–8 path
  await b.js('localStorage.clear(); sessionStorage.clear();');
  await b.load(URL);
  await L.helpers(b);
  check('6–8: cleared storage opens onboarding again', (await q('location.hash')) === '#/welcome', await q('location.hash'));
  await tapOk('Grades 6–8', await tapSel('#view .welcome-grade[data-band="analyst"]'));
  await b.wait(300);
  check('6–8 saved', (await state()).band === 'analyst');
  check('6–8 hero', (await text('#view h1')) === 'Welcome, Market Analyst!');
  await tapOk('6–8 Start Learning', await tapText('/Start Learning/'));
  check('6–8 lesson text uses decimals', ((await text('#view .lesson-body')) || '').includes('$1.25'), (await text('#view .lesson-body'))?.slice(0, 200));
  for (let stp = 1; stp < 6; stp++) {
    if (stp === 4) {
      const tg = await b.js(`const m = ${lessonsMod}; return m.lessonById('w1l1').steps[3].steps.analyst.map((s) => s.choices.find((c) => c.correct).text);`);
      for (let i = 0; i < tg.length; i++) {
        await L.tap(b, `[...document.querySelectorAll('#view .together-q .choice')].find((x) => x.textContent === ${JSON.stringify(tg[i])})`);
        if (i < tg.length - 1) await tapText('/Next question/', '#view .together-q');
      }
      check('6–8 together finished', ((await text('#view .together .notice')) || '').includes('You finished'));
    }
    if (stp === 5) {
      const aq = await b.js(`const m = ${lessonsMod}; return m.lessonById('w1l1').steps[4].question.analyst.answer;`);
      await L.tap(b, `document.querySelector('#view .choices [data-id="${aq}"]')`);
      await tapText('/^Check$/', '#view .q-actions');
      check('6–8 check correct', /is-correct/.test(await q(`document.querySelector('#view .lesson-body .feedback').className`)));
    }
    await tapOk(`6–8 next ${stp}`, await tapSel('#view nav.lesson-nav a.btn-primary'));
  }
  check('6–8 lesson complete', (await state()).lessons.w1l1?.completed === true);
  await route('#/practice?lesson=w1l2');
  check('practice deep link preselects lesson', (await q(`document.getElementById('pr-lesson').value`)) === 'w1l2');
  await b.js(`const s = document.getElementById('pr-skill'); s.value = 'price-change-math'; s.dispatchEvent(new Event('change'));`);
  await L.tap(b, `document.querySelector('input[name="pr-diff"][value="challenge"]').closest('label')`);
  await tapOk('6–8 Start practice', await tapText('/^Start practice$/'));
  let sawDecimal = false, sawPercent = false, analystOk = 0;
  for (let i = 0; i < 14 && !(sawDecimal && sawPercent && i >= 4); i++) {
    const c = await cur();
    if (!c) break;
    const all = `${c.prompt} ${c.choices.join(' ')} ${c.shown}`;
    if (/\d\.\d{2}/.test(all) || (typeof c.answer === 'number' && !Number.isInteger(c.answer))) sawDecimal = true;
    if (/%|percent/i.test(all)) sawPercent = true;
    check(`6–8 practice Q${i + 1} is analyst band`, c.key.includes('|analyst|'), c.key);
    await respond('right');
    if (/is-correct/.test((await fbText()).cls)) analystOk++;
    await nextQuestion();
  }
  check('6–8 practice shows decimals', sawDecimal);
  // The UI cannot target price-change-math alone while the Skill dropdown is empty (see defect above),
  // so percent questions are only occasionally reached in a short UI session. Report what was seen and
  // verify the 6–8 percent template deterministically at the engine level.
  console.log(`info: 6–8 UI practice session ${sawPercent ? 'showed' : 'did not show'} a percent question`);
  const analystPct = await b.js(`const e = await import(new URL('js/engine/index.js', document.baseURI).href); let n = 0; for (let i = 0; i < 60; i++) { const qq = e.generateQuestion('price-change-math', { band: 'analyst', difficulty: 'challenge', seed: i + 1 }); if (qq.unit === '%') n++; } return n;`);
  check('6–8 challenge price-change-math produces percent questions (60 seeds)', analystPct > 0, String(analystPct));
  check('6–8 practice answers accepted', analystOk >= 4, String(analystOk));
  const explorerPct = await b.js(`const e = await import(new URL('js/engine/index.js', document.baseURI).href); let n = 0; for (let i = 0; i < 60; i++) { const qq = e.generateQuestion('price-change-math', { band: 'explorer', difficulty: 'challenge', seed: i + 1 }); if (qq.unit === '%') n++; } return n;`);
  check('3–5 band never gets percent-change questions (60 samples)', explorerPct === 0, String(explorerPct));
  await tapText('/^End session$/');

  // ================================================================ 9. Batch 2 (Grades 6–8): World 4 candlestick lesson end-to-end
  const w4 = await b.js(`const m = ${lessonsMod}; const l = m.lessonById('w4l2'); return JSON.parse(JSON.stringify({ title: l.title, steps: l.steps.map((s) => ({ kind: s.kind, together: s.steps?.analyst, question: s.question?.analyst })) }));`);
  await navTo('#/learn');
  check('Learn lists World 4 lesson 2 as ready', await q(`!!document.querySelector('#view a[href^="#/learn/w4l2"]')`));
  await tapOk('open w4l2 from Learn', await L.tap(b, `document.querySelector('#view a[href^="#/learn/w4l2"]')`));
  await b.wait(300);
  if (((await text('#view .lesson-step h2')) || '') === 'Want a quick warm-up first?') {
    check('w4l2 offers the optional warm-up (prereq line-chart-reading not mastered)', true);
    await tapOk('w4l2 skip warm-up', await tapText('/^Skip warm-up$/'));
  }
  check('w4l2 step 1', (await q('location.hash')) === '#/learn/w4l2/1', await q('location.hash'));
  check('w4l2 h1', (await text('#view h1')) === w4.title, await text('#view h1'));
  check('w4l2 Read to Me present', await q(`!!document.querySelector('#view .read-to-me')`));
  check('w4l2 placeholder art has a text alternative', ((await text('#view .placeholder-art .ph-alt')) || '').length > 20, await text('#view .placeholder-art'));
  check('w4l2 analyst text (OHLC wording)', ((await text('#view .lesson-body')) || '').includes('candle'), (await text('#view .lesson-body'))?.slice(0, 120));
  await tapOk('w4l2 next 2', await tapSel('#view nav.lesson-nav a.btn-primary'));
  check('w4l2 step 2 definition term', (await text('#view .definition-card .term-name')) === 'candlestick', await text('#view .definition-card .term-name'));
  await tapOk('w4l2 next 3', await tapSel('#view nav.lesson-nav a.btn-primary'));
  check('w4l2 step 3 candle chart', (await q(`document.querySelectorAll('#view figure.mm-visual--candles .mm-visual__candle').length`)) === 3);
  const candAx = await L.axOf(b, '#view figure.mm-visual--candles svg');
  check('w4l2 candle chart accessible name says how many up and down', /\b2 up\b/.test(candAx?.name || '') && /\b1 down\b/.test(candAx?.name || '') && ['img', 'image'].includes(candAx.role), JSON.stringify(candAx));
  check('w4l2 candle chart has a legend (shape, not only colour)', /hollow body, ▲/.test((await text('#view .mm-visual__legend')) || ''), await text('#view .mm-visual__legend'));
  check('w4l2 candle chart has a data table', (await q(`document.querySelectorAll('#view figure.mm-visual--candles table tbody tr').length`)) === 3);
  const swL = await q(`Math.max(...[...document.querySelectorAll('#view .mm-visual__swatch')].map((e) => Math.max(e.getBoundingClientRect().width, e.getBoundingClientRect().height)))`);
  check('w4l2 candle legend swatches are small icons (≤ 24px), not full-width shapes', swL > 0 && swL <= 24, `largest swatch ${swL}px`);
  await shot('lesson-candles');
  await tapOk('w4l2 next 4', await tapSel('#view nav.lesson-nav a.btn-primary'));
  const tg4 = w4.steps[3].together;
  for (let i = 0; i < tg4.length; i++) {
    const wrong = tg4[i].choices.find((c) => !c.correct), right = tg4[i].choices.find((c) => c.correct);
    if (i === 0) {
      await L.tap(b, `[...document.querySelectorAll('#view .together-q .choice')].find((x) => x.textContent === ${JSON.stringify(wrong.text)})`);
      check('w4l2 together: wrong answer coached, no advance', /is-wrong/.test(await q(`document.querySelector('#view .together-q .coach').className`)) && !(await q(`[...document.querySelectorAll('#view .together-q button')].some((x) => /Next question/.test(x.textContent))`)));
    }
    await tapOk(`w4l2 together ${i + 1} right`, await L.tap(b, `[...document.querySelectorAll('#view .together-q .choice')].find((x) => x.textContent === ${JSON.stringify(right.text)})`));
    check(`w4l2 together ${i + 1} confirmed`, /is-correct/.test(await q(`document.querySelector('#view .together-q .coach').className`)));
    if (i < tg4.length - 1) await tapText('/Next question/', '#view .together-q');
  }
  await tapOk('w4l2 next 5', await tapSel('#view nav.lesson-nav a.btn-primary'));
  const cq4 = w4.steps[4].question;
  check('w4l2 check shows its own candle', (await q(`document.querySelectorAll('#view .lesson-body figure.mm-visual--candles .mm-visual__candle').length`)) === 1);
  await tapOk('w4l2 check hint', await tapText('/Hint/', '#view .q-actions'));
  check('w4l2 check hint shown', ((await text('#view .hint-list li')) || '').includes(plainify(cq4.hints[0]).slice(0, 25)), await text('#view .hint-list li'));
  const cw4 = cq4.choices.find((c) => c.id !== cq4.answer && c.misconception);
  await L.tap(b, `document.querySelector('#view .choices [data-id="${cw4.id}"]')`);
  await tapText('/^Check$/', '#view .q-actions');
  fb = await b.js(`const f = document.querySelector('#view .lesson-body .feedback'); return { cls: f.className, text: f.innerText.replace(/\\s+/g, ' ') };`);
  check('w4l2 check: wrong → misconception coaching', /is-wrong/.test(fb.cls) && fb.text.includes(plainify(cq4.misconceptions[cw4.misconception]).slice(0, 30)), fb.text);
  await L.tap(b, `document.querySelector('#view .choices [data-id="${cq4.answer}"]')`);
  await tapText('/^Check$/', '#view .q-actions');
  check('w4l2 check: right → confirmed', /is-correct/.test(await q(`document.querySelector('#view .lesson-body .feedback').className`)));
  await tapOk('w4l2 next 6', await tapSel('#view nav.lesson-nav a.btn-primary'));
  s = await state();
  check('w4l2 complete in store', s.lessons.w4l2?.completed === true, JSON.stringify(s.lessons.w4l2));
  check('w4l2 introduces candlestick-reading without mastery evidence', s.skills['candlestick-reading']?.introduced === true && s.skills['candlestick-reading'].independent.attempts === 0, JSON.stringify(s.skills['candlestick-reading']));
  check('w4l2 step 6 links to practice candlestick-reading', await q(`[...document.querySelectorAll('#view a[href^="#/practice"]')].some((a) => /candlestick-reading|w4l2/.test(a.getAttribute('href')))`), await q(`[...document.querySelectorAll('#view a[href^="#/practice"]')].map((a) => a.getAttribute('href')).join()`));

  // ---------------------------------------------------------------- practice candlestick-reading: a hint, then a correct first try
  await route('#/practice?skill=candlestick-reading');
  check('practice deep link preselects candlestick-reading', (await q(`document.getElementById('pr-skill').value`)) === 'candlestick-reading', await q(`document.getElementById('pr-skill').value`));
  check('practice world follows the skill (World 4)', /4/.test(await q(`document.getElementById('pr-world').selectedOptions[0].textContent`)), await q(`document.getElementById('pr-world').selectedOptions[0].textContent`));
  await tapOk('candles Start practice', await tapText('/^Start practice$/'));
  const k1 = await cur();
  check('candles Q1 is candlestick-reading, analyst band', k1 && k1.skill === 'candlestick-reading' && k1.key.includes('|analyst|') && k1.prompt === k1.shown, JSON.stringify(k1 && [k1.key, k1.prompt, k1.shown]));
  await tapOk('candles Q1 hint', await tapText('/Hint \\(/', '#view .q-actions'));
  const kh = await b.js(`return [...${ROOT}.querySelectorAll('.hint-list li')].map((x) => x.innerText.replace(/\\s+/g, ' '));`);
  check('candles Q1 hint shown and does not reveal the answer', kh.length === 1 && !revealsAnswer(kh[0], k1), JSON.stringify(kh) + ' | ' + k1?.answerText);
  await respond('right');
  check('candles Q1 correct after hint', /is-correct/.test((await fbText()).cls));
  await nextQuestion();
  const k2 = await cur();
  check('candles Q2 new candlestick question', k2 && k2.key !== k1.key && k2.skill === 'candlestick-reading');
  await respond('right');
  check('candles Q2 correct first try', /is-correct/.test((await fbText()).cls));
  s = await state();
  const cs = s.skills['candlestick-reading'];
  check('candlestick-reading evidence: 1 on own, 1 with help', cs && cs.independent.correct === 1 && cs.independent.attempts === 1 && cs.assisted.correct === 1 && cs.assisted.attempts === 1 && cs.revealed === 0, JSON.stringify(cs));
  await tapText('/^End session$/');

  // ---------------------------------------------------------------- World 2 test with a deliberate score
  await route('#/test/world-2');
  check('World 2 test intro', /World 2|world/i.test((await text('#view h1')) || ''), await text('#view h1'));
  const w2acc0 = await q('window.__qa.accepted.length');
  await tapOk('World 2 Start test', await tapText('/^Start test$/'));
  const n2 = Number(((await text('#view h1')) || '').match(/of (\d+)/)?.[1] || 0);
  check('World 2 test has questions', n2 >= 6, await text('#view h1'));
  const w2items = await b.js(`return window.__qa.accepted.slice(-${n2}).map((q) => ({ key: q.key, skill: q.skill }));`);
  check('World 2 test generated exactly n new questions', (await q('window.__qa.accepted.length')) - w2acc0 === n2);
  const w2skills = await b.js(`const m = await import(new URL('js/content/skills.js', document.baseURI).href); return Object.values(m.SKILLS).filter((x) => x.world === 2).map((x) => x.id);`);
  check('World 2 test only uses World 2 skills', w2items.every((it) => w2skills.includes(it.skill)), JSON.stringify(w2items.map((i) => i.skill)));
  check('World 2 test covers lessons 2–4 skills', ['futures-standardization', 'hedgers-speculators', 'offset-delivery'].some((sId) => w2items.some((i) => i.skill === sId)), JSON.stringify([...new Set(w2items.map((i) => i.skill))]));
  const RIGHT2 = Math.min(3, n2);
  for (let i = 0; i < n2; i++) {
    const shown = await b.js(`return __qh.norm(document.querySelector('#view .q-prompt')?.textContent);`);
    const exp2 = await b.js(`return __qh.plain(window.__qa.accepted[window.__qa.accepted.length - ${n2} + ${i}].prompt);`);
    check(`World 2 test Q${i + 1} renders the generated item`, shown === exp2, `${shown} | ${exp2}`);
    await b.js(`const root = document.querySelector('#view .lesson-step'); const q = window.__qa.accepted[window.__qa.accepted.length - ${n2} + ${i}];
      __qh.fill(root, q, ${i < RIGHT2 ? '__qh.rightResponse(q)' : '__qh.wrongResponse(q)'});`);
    await b.wait(80);
    if (i < n2 - 1) await tapText('/^Next →$/');
  }
  await tapOk('World 2 Submit', await tapText('/^Submit test$/'));
  await b.wait(300);
  check('World 2 score equals the deliberate number right', (await text('#view .score-big')) === `${RIGHT2} of ${n2}`, await text('#view .score-big'));
  s = await state();
  const t2 = s.tests[s.tests.length - 1];
  check('World 2 test saved with scope world-2', t2 && t2.scope === 'world-2' && t2.score === RIGHT2 && t2.total === n2, JSON.stringify(t2));
  check('World 2 results show every question with an explanation', (await q(`[...document.querySelectorAll('#view .result-item')].filter((x) => x.innerText.includes('Why')).length`)) === n2);

  // ---------------------------------------------------------------- Market Lab: Pattern Trap, Line/Candles toggle, Long or Short
  await route('#/market-lab?activity=paper&scenario=pretend-rice-pattern-trap');
  check('Pattern Trap scenario opens from its link', ((await text('#view .lab-activity-title')) || '').includes('Pretend Rice'), await text('#view .lab-activity-title'));
  const rice = sc.find((x) => x.id === 'pretend-rice-pattern-trap') || (await b.js(`const m = await import(new URL('js/content/market-scenarios.js', document.baseURI).href); return JSON.parse(JSON.stringify(m.scenarioById('pretend-rice-pattern-trap')));`));
  await L.tap(b, `document.querySelector('input[name="pp-side"][value="long"]').closest('label')`);
  await b.js(`const t = document.querySelector('#view .lab-body textarea'); t.value = 'Three days up, but I know a pattern is not a promise.'; t.dispatchEvent(new Event('input'));`);
  await tapOk('rice start', await tapText('/^Start the pretend days$/'));
  await tapOk('rice day 1', await tapText('/^Go to Day/'));
  await tapOk('rice day 2', await tapText('/^Go to Day/'));
  check('Long or Short panel appears', ((await text('#view .lab-longshort h4')) || '') === 'Long or Short?', await text('#view .lab-longshort'));
  const lsRows = await b.js(`return [...document.querySelectorAll('#view .lab-longshort tbody tr')].map((r) => r.innerText.replace(/\\s+/g, ' '));`);
  const d2 = Math.round((rice.days[1].price - rice.days[0].price) * 100) / 100;
  check('Long or Short: long gains and short loses the same amount on an up day', lsRows.length === 2 && /Long/.test(lsRows[0]) && lsRows[0].includes(`+$${d2.toFixed(2)}`) && /gain/.test(lsRows[0]) && /Short/.test(lsRows[1]) && /loss/.test(lsRows[1]), JSON.stringify(lsRows));
  // Line → Candles with the keyboard: focus must stay on the toggle
  await b.js(`document.querySelector('#view .lab-chart-toggle input[value="line"]').focus();`);
  check('chart toggle starts on Line', await q(`document.querySelector('#view .lab-chart-toggle input[value="line"]').checked`));
  await L.press(b, 'ArrowRight'); await b.wait(150);
  check('Candles toggle: Arrow key selects Candles', await q(`document.querySelector('#view .lab-chart-toggle input[value="candles"]').checked`));
  check('Candles toggle: focus stays on the toggle', await q(`document.activeElement === document.querySelector('#view .lab-chart-toggle input[value="candles"]')`), await q('document.activeElement.outerHTML.slice(0, 100)'));
  check('Candles toggle: candle chart drawn', (await q(`document.querySelectorAll('#view .lab-chart figure.mm-visual--candles .mm-visual__candle').length`)) === 2);
  const labAx = await L.axOf(b, '#view .lab-chart figure.mm-visual--candles svg');
  check('Candles toggle: chart accessible name mentions up/down', /\bup\b/.test(labAx?.name || '') && /\bdown\b/.test(labAx?.name || ''), JSON.stringify(labAx));
  check('Candles toggle: legend group named "Chart"', ((await L.axOf(b, '#view .lab-chart-toggle'))?.name || '') === 'Chart', JSON.stringify(await L.axOf(b, '#view .lab-chart-toggle')));
  const swM = await q(`Math.max(...[...document.querySelectorAll('#view .mm-visual__swatch')].map((e) => Math.max(e.getBoundingClientRect().width, e.getBoundingClientRect().height)))`);
  check('Market Lab candle legend swatches are small icons (≤ 24px)', swM > 0 && swM <= 24, `largest swatch ${swM}px`);
  await shot('market-lab-candles');
  await L.tap(b, `document.querySelector('#view .lab-chart-toggle input[value="line"]').closest('label')`);
  check('Line toggle by tap redraws a line chart', await q(`!!document.querySelector('#view .lab-chart figure.mm-visual--line') && !document.querySelector('#view .lab-chart figure.mm-visual--candles')`));
  for (let i = 0; i < 12; i++) { const g = await tapText('/^Go to Day/'); if (!g || !g.ok) break; }
  const trap = await text('#view .lab-pattern-note');
  check('Pattern Trap reflection appears at the end', /^Pattern Trap\./.test(trap || ''), trap);
  check('reflection questions shown', (await q(`!!document.querySelector('#view .lab-reflection')`)));

  // ---------------------------------------------------------------- Certificates
  // (a) nothing earned yet
  const certState0 = { version: 1, band: 'analyst' };
  await b.js(`localStorage.setItem('mm.progress.v1', ${JSON.stringify(JSON.stringify(certState0))});`);
  await b.load('about:blank'); await b.load(URL + '#/certificates');   // a new document, so the store re-reads storage
  await L.helpers(b);
  check('certificates h1', (await text('#view h1')) === 'Achievement Certificates', await text('#view h1'));
  check('certificates: none earned with an empty store', /^0 of \d+/.test((await text('#view .stats .stat')) || '') && (await q(`document.querySelectorAll('#view .cert-card.is-earned').length`)) === 0, await text('#view .stats'));
  check('certificates: says none earned yet', ((await viewText()) || '').includes('No certificates earned yet'));
  check('certificates: every card says what is still needed', (await q(`[...document.querySelectorAll('#view .cert-card')].every((c) => /Still needed/.test(c.innerText))`)));
  await route('#/certificates/world-1');
  check('locked certificate print view says not earned', (await text('#view h1')) === 'Not earned yet' && /isn’t earned yet, so it can’t be printed/.test((await viewText()) || ''), await viewText());
  check('locked certificate has no printable certificate or Print button', !(await q(`!!document.querySelector('#view .certificate')`)) && !(await q(`[...document.querySelectorAll('#view button')].some((x) => /Print/.test(x.textContent))`)));
  // (b) World 1 earned. Lessons completed are WRITTEN to the store (lesson walk-through is covered above);
  //     every World 1 skill is mastered through REAL independent answers in Practice (5 right, first try, no hints).
  const w1 = await b.js(`const m = ${lessonsMod}; const ls = m.LESSONS.filter((l) => l.world === 1 && l.status === 'ready'); return { ids: ls.map((l) => l.id), skills: [...new Set(ls.flatMap((l) => l.skills))] };`);
  const now = Date.now();
  const certState1 = { version: 1, band: 'analyst', lessons: Object.fromEntries(w1.ids.map((id) => [id, { step: 6, maxStep: 6, completed: true, completedAt: now }])) };
  await b.js(`localStorage.setItem('mm.progress.v1', ${JSON.stringify(JSON.stringify(certState1))});`);
  await b.load('about:blank'); await b.load(URL + '#/practice');
  await L.helpers(b);
  for (const skillId of w1.skills) {
    await route(`#/practice?skill=${skillId}`);
    check(`cert prep: ${skillId} preselected`, (await q(`document.getElementById('pr-skill').value`)) === skillId);
    await tapText('/^Start practice$/');
    for (let i = 0; i < 5; i++) {
      const c = await cur();
      if (!c || c.skill !== skillId) { check(`cert prep: ${skillId} Q${i + 1} is that skill`, false, JSON.stringify(c && [c.skill, c.key])); break; }
      await respond('right');
      if (!/is-correct/.test((await fbText()).cls)) check(`cert prep: ${skillId} Q${i + 1} correct`, false, (await fbText()).text);
      if (i < 4) await nextQuestion();
    }
    await tapText('/^End session$/');
  }
  const lv = await b.js(`const e = await import(new URL('js/engine/index.js', document.baseURI).href); const st = window.__mm.store.get(); return Object.fromEntries(${JSON.stringify(w1.skills)}.map((id) => [id, e.masteryFor(st, id).level]));`);
  check('cert prep: every World 1 skill mastered by real answers', Object.values(lv).every((x) => x === 'mastered'), JSON.stringify(lv));
  await navTo('#/certificates');
  check('World 1 certificate earned', await q(`[...document.querySelectorAll('#view .cert-card.is-earned')].some((c) => /World 1/.test(c.innerText))`), await text('#view .cert-list'));
  check('World 1 Skill Badges earned', (await q(`[...document.querySelectorAll('#view .cert-card.is-earned')].filter((c) => /Skill Badge/.test(c.innerText)).length`)) === w1.skills.length);
  check('other worlds not earned', (await q(`[...document.querySelectorAll('#view .cert-card.is-earned')].filter((c) => /World [2-6]/.test(c.querySelector('h3').textContent)).length`)) === 0);
  await tapOk('View and print World 1', await L.tap(b, `document.querySelector('#view a[href="#/certificates/world-1"]')`));
  await b.wait(300);
  check('printable certificate shown', await q(`!!document.querySelector('#view .certificate')`));
  const nameLine = await b.js(`const n = document.querySelector('#view .cert-name'); const l = n?.querySelector('.cert-line'); return n ? { text: n.innerText.replace(/\\s+/g, ' ').trim(), line: l ? l.textContent : null } : null;`);
  check('certificate has a blank Name line', nameLine && nameLine.text === 'Name:' && nameLine.line === '', JSON.stringify(nameLine));
  check('Name line is announced as a blank line', /blank line/.test((await L.axOf(b, '#view .cert-line'))?.name || ''), JSON.stringify(await L.axOf(b, '#view .cert-line')));
  const stored = await q(`localStorage.getItem('mm.progress.v1')`);
  check('no name stored anywhere', !/"name"\s*:/.test(stored) && !/"studentName"|"learnerName"/.test(stored), stored.slice(0, 200));
  check('certificate names World 1 and its skills', /World 1/.test((await text('#view .cert-subject')) || '') && ((await text('#view .cert-skills')) || '').split('·').length === w1.skills.length, `${await text('#view .cert-subject')} | ${await text('#view .cert-skills')}`);
  check('Print button present', await q(`[...document.querySelectorAll('#view button')].some((x) => x.textContent === 'Print certificate')`));
  await b.send('Emulation.setEmulatedMedia', { media: 'print' });
  check('print: app bar, tabs and buttons hidden; certificate visible', await q(`getComputedStyle(document.querySelector('.app-bar')).display === 'none' && getComputedStyle(document.querySelector('.app-tabs')).display === 'none' && getComputedStyle(document.querySelector('#view .certificate')).display !== 'none'`));
  await b.send('Emulation.setEmulatedMedia', { media: '' });
  await shot('certificate-earned');

  check('no console errors during the walk-through', b.errors.length === 0, b.errors.join(' | '));
  check('no 404s', server.missing.length === 0, server.missing.join());
} catch (e) {
  check('acceptance script ran to completion', false, e.stack);
} finally { b.close(); server.close(); }
console.log('screenshots:', SHOTS.join(', '), '→', L.SHOT_DIR);
process.exit(C.done());
