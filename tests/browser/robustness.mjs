// Robustness: refresh/resume, back/forward, corrupt + blocked storage, cross-tab updates, refresh during
// practice/test, GitHub Pages path safety (incl. case-sensitive file names), reset, and dashboard truth.
import fs from 'node:fs';
import path from 'node:path';
import { startServer, startBrowser, BASE, ROOT } from '../lib/harness.mjs';
import * as L from './qa-lib.mjs';

const C = L.counter('robustness');
const check = C.check;
const server = await startServer();
const b = await startBrowser();
const URL = server.origin + BASE;
const q = (e) => b.js(`return ${e};`);
const text = (sel) => L.text(b, sel);
const state = () => b.js('return JSON.parse(JSON.stringify(window.__mm.store.get()));');
const requested = [];

async function freshWith(obj) {
  await b.load(URL);
  await b.js(`localStorage.clear(); ${obj ? `localStorage.setItem('mm.progress.v1', ${JSON.stringify(JSON.stringify(obj))});` : ''}`);
  await b.load(URL);
}
const back = async () => { await b.js('history.back();'); await b.wait(400); };
const fwd = async () => { await b.js('history.forward();'); await b.wait(400); };

try {
  await b.viewport(375, 812);
  // Every URL the page fetched (document + scripts, module imports, styles, images) from Resource Timing,
  // collected after each full load; the static server also records anything outside /Market-Minds/.
  const perfUrls = async () => b.js(`return [location.href, ...performance.getEntriesByType('resource').map((e) => e.name)];`);

  // ================================================================ refresh mid-lesson
  await freshWith({ version: 1, band: 'explorer' });
  await L.route(b, '#/learn/w1l1/1');
  for (let i = 0; i < 2; i++) { await b.js(`document.querySelector('#view nav.lesson-nav a.btn-primary').click();`); await b.wait(300); }
  check('reached step 3 by Next links', (await q('location.hash')) === '#/learn/w1l1/3');
  requested.push(...await perfUrls());
  await b.reload();
  check('refresh keeps the step URL', (await q('location.hash')) === '#/learn/w1l1/3');
  check('refresh resumes step 3', ((await text('#view .progress-label')) || '').includes('Step 3 of 6'), await text('#view .progress-label'));
  check('saved current step', JSON.stringify((await state()).current) === JSON.stringify({ lessonId: 'w1l1', step: 3 }));
  await L.route(b, '#/learn/w1l1');
  check('lesson link without step resumes saved step', (await q('location.hash')) === '#/learn/w1l1/3' && ((await text('#view .progress-label')) || '').includes('Step 3 of 6'), await q('location.hash'));

  // ================================================================ back / forward between steps and views
  await L.route(b, '#/learn/w1l1/1');
  await b.js(`document.querySelector('#view nav.lesson-nav a.btn-primary').click();`); await b.wait(300);
  await b.js(`document.querySelector('#view nav.lesson-nav a.btn-primary').click();`); await b.wait(300);
  await back();
  check('Back goes to step 2', (await q('location.hash')) === '#/learn/w1l1/2' && ((await text('#view .progress-label')) || '').includes('Step 2 of 6'), await q('location.hash'));
  check('Back moves focus to the h1', await q(`document.activeElement === document.querySelector('#view h1')`));
  await back();
  check('Back again goes to step 1', (await q('location.hash')) === '#/learn/w1l1/1');
  await fwd();
  check('Forward goes to step 2', (await q('location.hash')) === '#/learn/w1l1/2' && ((await text('#view .progress-label')) || '').includes('Step 2 of 6'));
  await L.route(b, '#/'); await L.route(b, '#/learn'); await L.route(b, '#/practice');
  await back();
  check('Back from Practice → Learn', (await text('#view h1')) === 'Choose a lesson', await text('#view h1'));
  await back();
  check('Back from Learn → Dashboard', /^Welcome/.test(await text('#view h1')), await text('#view h1'));
  await fwd();
  check('Forward → Learn', (await text('#view h1')) === 'Choose a lesson');
  check('nav aria-current follows back/forward', (await q(`document.querySelector('#siteNav a[aria-current=page]')?.getAttribute('href')`)) === '#/learn');
  await L.route(b, '#/learn/w1l1/1');
  await b.js(`document.querySelector('#view .lesson-body button.term').click();`); await b.wait(150);
  check('word dialog open before Back', await q(`!!document.querySelector('dialog.modal[open]')`));
  await back();
  check('Back closes an open dialog', !(await q(`!!document.querySelector('dialog.modal')`)));
  check('no errors during back/forward', b.errors.length === 0, b.errors.join(' | '));

  // ================================================================ corrupt storage
  await b.load(URL);
  await b.js(`localStorage.clear(); localStorage.setItem('mm.progress.v1', '{"version":1,"band":"explorer",BROKEN');`);
  let errs = b.errors.length;
  await b.load(URL);
  check('corrupt JSON: app still loads', (await text('#view h1')) === 'Welcome to Market Minds!', await text('#view h1'));
  check('corrupt JSON: fresh state', (await state()).band === null && JSON.stringify((await state()).lessons) === '{}');
  check('corrupt JSON: backed up to mm.progress.corrupt', (await q(`localStorage.getItem('mm.progress.corrupt')`)) === '{"version":1,"band":"explorer",BROKEN');
  check('corrupt JSON: no console errors', b.errors.length === errs, b.errors.slice(errs).join(' | '));
  await b.js(`document.querySelector('.grade-choice [data-band=explorer]').click();`); await b.wait(300);
  check('corrupt JSON: app can save again', JSON.parse(await q(`localStorage.getItem('mm.progress.v1')`)).band === 'explorer');
  // wrong shape
  await b.js(`localStorage.setItem('mm.progress.v1', JSON.stringify({ version: 1, band: 'wizard', lessons: 'x', skills: [1, 2], misses: { a: 'b' }, tests: [{ score: 9, total: 2 }, null], lab: 5, current: { lessonId: 7 } }));`);
  errs = b.errors.length;
  await b.load(URL);
  for (const r of ['#/', '#/learn', '#/practice', '#/progress', '#/test', '#/market-lab', '#/parent']) { await L.route(b, r); }
  check('malformed (valid JSON) state: no errors on any main route', b.errors.length === errs, b.errors.slice(errs).join(' | '));
  check('malformed state normalized', (await state()).band === null && (await state()).tests.length === 0);
  // different version
  await b.js(`localStorage.setItem('mm.progress.v1', JSON.stringify({ version: 99, band: 'explorer' }));`);
  await b.load(URL);
  check('unknown version → fresh state, no crash', (await state()).band === null && (await text('#view h1')) === 'Welcome to Market Minds!');

  // ================================================================ storage blocked entirely
  const blockId = await L.addInit(b, `Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('blocked', 'SecurityError'); } });`);
  errs = b.errors.length;
  await b.load(URL);
  check('storage blocked: app loads', (await text('#view h1')) === 'Welcome to Market Minds!', await text('#view h1'));
  await b.js(`document.querySelector('.grade-choice [data-band=analyst]').click();`); await b.wait(300);
  check('storage blocked: grade choice works in memory', (await text('#view h1')) === 'Welcome, Market Analyst!');
  await L.route(b, '#/learn/w1l1/2');
  check('storage blocked: lessons work', (await text('#view h1')) === 'What Is a Market?');
  check('storage blocked: no console errors', b.errors.length === errs, b.errors.slice(errs).join(' | '));
  await L.removeInit(b, blockId);

  // ================================================================ two tabs (storage event)
  await freshWith({ version: 1, band: 'explorer' });
  check('two-tab: starts as explorer', (await q(`document.querySelector('.band-switch [data-band=explorer]').getAttribute('aria-pressed')`)) === 'true');
  const other = { version: 1, updatedAt: Date.now() + 5000, band: 'analyst', current: { lessonId: 'w1l1', step: 4 },
    lessons: { w1l1: { step: 6, maxStep: 6, completed: true, completedAt: Date.now() } }, skills: {}, misses: {}, tests: [], thinking: {}, journal: [{ id: 'j-other-tab', date: Date.now(), prediction: 'x', reasoning: 'y', outcome: 'z', lesson: 'market-lab' }], lab: { runs: 0, decisions: [] } };
  await b.js(`const v = ${JSON.stringify(JSON.stringify(other))}; localStorage.setItem('mm.progress.v1', v);
    window.dispatchEvent(new StorageEvent('storage', { key: 'mm.progress.v1', newValue: v, storageArea: localStorage }));`);
  await b.wait(300);
  check('two-tab: store reloads from the other tab', (await state()).band === 'analyst' && (await state()).lessons.w1l1?.completed === true);
  check('two-tab: header grade buttons update', (await q(`document.querySelector('.band-switch [data-band=analyst]').getAttribute('aria-pressed')`)) === 'true');
  check('two-tab: visible dashboard updates (no stale welcome/progress)', (await text('#view h1')) === 'Welcome, Market Analyst!' && ((await text('#view .hero-current')) || '').includes('1 of 4'),
    `${await text('#view h1')} | ${await text('#view .hero-current')}`);
  // no clobber: other tab writes newer data WITHOUT an event reaching us, then we save something
  const other2 = { ...other, updatedAt: Date.now() + 60000, journal: [...other.journal, { id: 'j-other-2', date: Date.now(), prediction: 'p', reasoning: 'r', outcome: 'o', lesson: 'market-lab' }] };
  await b.js(`localStorage.setItem('mm.progress.v1', ${JSON.stringify(JSON.stringify(other2))});`);
  await b.js(`document.querySelector('.band-switch [data-band=explorer]').click();`); await b.wait(300);
  const saved = JSON.parse(await q(`localStorage.getItem('mm.progress.v1')`));
  check('two-tab: our save does not clobber the other tab\'s newer write', saved.journal.some((j) => j.id === 'j-other-2') && saved.band === 'explorer', JSON.stringify(saved.journal.map((j) => j.id)));

  // ================================================================ refresh during practice / test
  await freshWith({ version: 1, band: 'explorer' });
  await L.route(b, '#/practice');
  await b.js(`[...document.querySelectorAll('#view button')].find((x) => x.textContent === 'Mixed Review').click();`); await b.wait(400);
  check('practice session running', (await q('location.hash')) === '#/practice/session' && !!(await q(`document.querySelector('#view .question')`)));
  requested.push(...await perfUrls());
  await b.reload();
  check('refresh during practice: honest "session ended" page', (await text('#view h1')) === 'Your practice session ended' && ((await text('#view')) || '').includes('not kept after the page reloads'), await text('#view'));
  check('refresh during practice: link to start again', !!(await q(`document.querySelector('#view a[href="#/practice"]')`)));
  await L.route(b, '#/practice/summary');
  check('summary after reload is honest', (await text('#view h1')) === 'No practice summary to show');
  await L.route(b, '#/test/w1l1');
  await b.js(`[...document.querySelectorAll('#view button')].find((x) => x.textContent === 'Start test').click();`); await b.wait(400);
  check('test running', (await text('#view h1')) === 'Question 1 of 6');
  await b.reload();
  check('refresh during test: nothing recorded', (await state()).tests.length === 0);
  const afterTest = (await text('#view')) || '';
  check('refresh during test: page says the unfinished test was not kept', /not (kept|saved|scored)|ended|started over|didn’t save|wasn’t saved/i.test(afterTest), `h1="${await text('#view h1')}" body="${afterTest.slice(0, 160)}"`);

  // ================================================================ GitHub Pages path safety
  for (const r of ['#/', '#/learn', '#/learn/w1l1/1', '#/learn/w1l1/3', '#/practice', '#/thinking', '#/market-lab', '#/test', '#/progress', '#/dictionary', '#/stories', '#/journal', '#/parent']) {
    await b.load(URL + r);
    requested.push(...await perfUrls());
  }
  const uniq = [...new Set(requested.map((u) => u.split('#')[0]))];
  const outside = uniq.filter((u) => !u.startsWith(server.origin + BASE) && !u.startsWith('data:') && !u.startsWith('blob:'));
  check('every fetched URL is under /Market-Minds/', outside.length === 0, outside.join(', '));
  check('no 404s (server saw no requests outside /Market-Minds/ or for missing files)', server.missing.length === 0, server.missing.join(', '));
  // case-sensitive file names (GitHub Pages is case-sensitive; Windows is not)
  const caseBad = [];
  for (const u of uniq) {
    const rel = decodeURIComponent(new globalThis.URL(u).pathname).slice(BASE.length).split('?')[0];
    if (!rel) continue;
    let dir = ROOT;
    for (const seg of rel.split('/').filter(Boolean)) {
      const names = fs.existsSync(dir) && fs.statSync(dir).isDirectory() ? fs.readdirSync(dir) : [];
      if (!names.includes(seg)) { caseBad.push(rel); break; }
      dir = path.join(dir, seg);
    }
  }
  check('every fetched file exists with exactly that letter case', caseBad.length === 0, caseBad.join(', '));
  console.log(`info: ${uniq.length} distinct URLs fetched`);
  // static scan for root-absolute references
  const srcFiles = ['index.html', 'styles.css', ...fs.readdirSync(path.join(ROOT, 'js'), { recursive: true }).filter((f) => f.endsWith('.js')).map((f) => path.join('js', f))];
  const absRx = /(?:\b(?:src|href)\s*=\s*["']\/(?!\/)|url\(\s*["']?\/(?!\/)|\bimport\s*\(\s*[`'"]\/|\bfrom\s+['"]\/|\bfetch\s*\(\s*[`'"]\/)/;
  const absHits = srcFiles.filter((f) => absRx.test(fs.readFileSync(path.join(ROOT, f), 'utf8')));
  check('no root-absolute URLs in index.html / styles.css / js/**', absHits.length === 0, absHits.join(', '));
  check('.nojekyll present', fs.existsSync(path.join(ROOT, '.nojekyll')));

  // ================================================================ dashboard numbers equal real store state
  const now = Date.now();
  const crafted = { version: 1, updatedAt: now, band: 'explorer', current: { lessonId: 'w1l3', step: 2 },
    lessons: { w1l1: { step: 6, maxStep: 6, completed: true, completedAt: now }, w1l2: { step: 6, maxStep: 6, completed: true, completedAt: now },
      w1l3: { step: 2, maxStep: 2, completed: false, completedAt: 0 }, w9l9: { step: 6, maxStep: 6, completed: true, completedAt: now } },
    skills: {
      'market-basics': { introduced: true, independent: { correct: 5, attempts: 5 }, assisted: { correct: 0, attempts: 0 }, revealed: 0, recent: [1, 1, 1, 1, 1], lastSeen: now },
      'buyers-sellers': { introduced: true, independent: { correct: 1, attempts: 2 }, assisted: { correct: 3, attempts: 3 }, revealed: 1, recent: [1, 0], lastSeen: now },
      'price-change-math': { introduced: true, independent: { correct: 0, attempts: 0 }, assisted: { correct: 0, attempts: 0 }, revealed: 0, recent: [], lastSeen: 0 } },
    misses: { 'supply-demand': { count: 2, misconceptions: {}, lastMissed: now, clearedStreak: 0 } },
    tests: [{ id: 't1', scope: 'w1l1', band: 'explorer', date: now, score: 5, total: 6, bySkill: {} }],
    thinking: { 'p1': { choice: 'a', response: 'because', selfCheck: [true], completedAt: now } }, journal: [], lab: { runs: 2, decisions: [] } };
  await freshWith(crafted);
  const R = await b.js(`const m = await import(new URL('js/content/lessons.js', document.baseURI).href); return m.LESSONS.filter((l) => l.status === 'ready').length;`);
  const eng = await b.js(`const e = await import(new URL('js/engine/index.js', document.baseURI).href); const s = window.__mm.store.get();
    return { mastered: Object.keys(s.skills).filter((id) => e.masteryFor(s, id).level === 'mastered'), queue: e.missQueue(s) };`);
  check('crafted state: engine agrees market-basics is mastered', JSON.stringify(eng.mastered) === '["market-basics"]', JSON.stringify(eng));
  const dash = (await q(`document.getElementById('view').innerText.replace(/\\s+/g, ' ')`));
  check('dashboard: lessons complete counts only real, ready lessons', dash.includes(`2 of ${R} lessons complete`), dash.slice(0, 300));
  check('dashboard: progress bar value', (await q(`document.querySelector('#view [role=progressbar]').getAttribute('aria-valuenow')`)) === '2');
  check('dashboard: current lesson + step', ((await text('#view .hero-current')) || '').includes('step 2 of 6'), await text('#view .hero-current'));
  check('dashboard: Continue Learning resumes w1l3 step 2', (await q(`[...document.querySelectorAll('#view a')].find((a) => /Continue Learning/.test(a.textContent))?.getAttribute('href')`)) === '#/learn/w1l3/2');
  check('dashboard: misses', dash.includes('1 skill ready for review'));
  check('dashboard: thinking', dash.includes('1 prompt answered'));
  check('dashboard: lab', dash.includes('2 practice runs'));
  check('dashboard: last test', dash.includes('Last score: 5 of 6'));
  check('dashboard: mastered', dash.includes('1 skill mastered of 8') && ((await text('#view .hero-current')) || '').includes('1 skill mastered'));
  await L.route(b, '#/progress');
  const stats = await b.js(`return [...document.querySelectorAll('#view .stats .stat')].map((x) => x.innerText.replace(/\\s+/g, ' '));`);
  check('progress stats equal store', JSON.stringify(stats) === JSON.stringify([`2 of ${R} lessons completed`, '3 skills introduced', '1 skill mastered', '1 skill to review']), JSON.stringify(stats));
  check('progress table: with-help shows revealed count', ((await q(`[...document.querySelectorAll('#view table tbody tr')].map((r) => r.innerText).join('|')`)) || '').includes('1 shown'));
  await L.route(b, '#/parent');
  check('parent view renders same numbers', ((await text('#view')) || '').includes('5 of 5 correct'));

  // ================================================================ reset progress
  await L.route(b, '#/progress');
  await b.js(`[...document.querySelectorAll('#view button')].find((x) => x.textContent === 'Reset my progress').click();`); await b.wait(200);
  check('reset asks for confirmation', (await text('dialog.modal h2')) === 'Reset all progress?');
  check('reset dialog focuses the safe choice', await q(`document.activeElement.textContent === 'Keep my progress'`));
  await b.js(`[...document.querySelectorAll('dialog.modal button')].find((x) => x.textContent === 'Keep my progress').click();`); await b.wait(200);
  check('cancel keeps progress', (await state()).lessons.w1l1?.completed === true);
  await b.js(`[...document.querySelectorAll('#view button')].find((x) => x.textContent === 'Reset my progress').click();`); await b.wait(200);
  await b.js(`[...document.querySelectorAll('dialog.modal button')].find((x) => x.textContent === 'Yes, erase it').click();`); await b.wait(400);
  const after = await state();
  check('reset clears everything', after.band === null && JSON.stringify(after.lessons) === '{}' && JSON.stringify(after.skills) === '{}' && after.tests.length === 0 && after.lab.runs === 0 && JSON.stringify(after.thinking) === '{}', JSON.stringify(after));
  check('reset persisted to storage', JSON.parse(await q(`localStorage.getItem('mm.progress.v1')`)).band === null);
  check('reset returns to dashboard grade choice', (await q('location.hash')) === '#/' && (await text('#view h1')) === 'Welcome to Market Minds!');
  await b.reload();
  check('reset survives reload', (await state()).band === null && Object.keys((await state()).lessons).length === 0);
  check('no console errors overall', b.errors.length === 0, b.errors.join(' | '));
} catch (e) {
  check('robustness script ran to completion', false, e.stack);
} finally { b.close(); server.close(); }
process.exit(C.done());
