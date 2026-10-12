import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../../js/store.js';
import { createTest, createPracticeSession, scopeSkills, missQueue, mulberry32 } from '../../js/engine/index.js';
import { SKILLS, SKILL_IDS } from '../../js/content/skills.js';
import { _resetTestMemory } from '../../js/engine/test.js';

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}
const rightAnswer = (q) => (q.type === 'number' ? String(q.answer) : q.answer);

/** Same seed + cleared retake memory → identical test; the first copy's results tell us the answers. */
function twin(opts, store) {
  _resetTestMemory();
  const answers = createTest({ ...opts, rng: mulberry32(opts.seed) }, null).submit().items.map((x) => rightAnswer(x.question));
  _resetTestMemory();
  return { t: createTest({ ...opts, rng: mulberry32(opts.seed) }, store), answers };
}

test('scope resolution', () => {
  assert.deepEqual(scopeSkills('w1l1'), ['market-basics', 'buyers-sellers']);
  assert.deepEqual(scopeSkills('world-2'), ['future-agreement', 'hedge-outcome', 'futures-risk', 'futures-standardization', 'hedgers-speculators', 'offset-delivery']);
  assert.deepEqual(scopeSkills('world-4'), ['line-chart-reading', 'candlestick-reading', 'long-short', 'chart-limits']);
  assert.equal(scopeSkills('world-1').length, 5);
  assert.equal(scopeSkills('all').length, SKILL_IDS.length);
  const byLesson = { w2l2: 'futures-standardization', w2l3: 'hedgers-speculators', w2l4: 'offset-delivery', w4l1: 'line-chart-reading', w4l2: 'candlestick-reading', w4l3: 'long-short', w4l4: 'chart-limits' };
  for (const [lesson, skill] of Object.entries(byLesson)) assert.deepEqual(scopeSkills(lesson), [skill], lesson);
  // the mapping comes from the skills.js `lesson` / `world` fields
  for (const id of SKILL_IDS) {
    assert.ok(scopeSkills(SKILLS[id].lesson).includes(id));
    assert.ok(scopeSkills(`world-${SKILLS[id].world}`).includes(id));
  }
  assert.deepEqual(scopeSkills({ skills: ['supply-demand', 'bogus'] }), ['supply-demand']);
  assert.throws(() => createTest({ scope: 'nope' }));
});

test('readySkills intersects the scope (default unchanged)', () => {
  const ready = ['market-basics', 'buyers-sellers', 'future-agreement', 'hedge-outcome', 'futures-risk', 'futures-standardization'];
  assert.deepEqual(scopeSkills('world-2', ready), ['future-agreement', 'hedge-outcome', 'futures-risk', 'futures-standardization']);
  assert.deepEqual(scopeSkills('world-4', ready), []);
  assert.deepEqual(scopeSkills('all', ready), ready);
  assert.deepEqual(scopeSkills('world-2', undefined), scopeSkills('world-2'));
  _resetTestMemory();
  const t = createTest({ band: 'explorer', scope: 'world-2', length: 12, readySkills: ready, rng: mulberry32(3) }, null);
  assert.deepEqual([...new Set(t.items.map((it) => it.skill))].sort(), ['future-agreement', 'futures-risk', 'futures-standardization', 'hedge-outcome']);
  assert.throws(() => createTest({ scope: 'world-4', readySkills: ready }), /No skills/);
  // practice sessions honour readySkills too
  const s = createPracticeSession({ band: 'analyst', mode: 'world', readySkills: ['long-short', 'chart-limits'], length: 10, rng: mulberry32(4) }, null);
  const seen = new Set();
  for (let i = 0; i < 10 && s.current; i++) { seen.add(s.current.question.skill); s.reveal(); s.next(); }
  assert.ok(seen.size && [...seen].every((id) => ['long-short', 'chart-limits'].includes(id)), [...seen].join());
  const s2 = createPracticeSession({ band: 'explorer', skills: ['supply-demand', 'long-short'], readySkills: ['long-short'], rng: mulberry32(5) }, null);
  assert.equal(s2.current.question.skill, 'long-short');
});

test('world-2, world-4 and the new lesson scopes build complete tests for both bands', () => {
  for (const scope of ['world-2', 'world-4', 'w2l2', 'w2l3', 'w2l4', 'w4l1', 'w4l2', 'w4l3', 'w4l4']) for (const band of ['explorer', 'analyst']) {
    _resetTestMemory();
    const t = createTest({ band, scope, length: 8, rng: mulberry32(scope.length * 7 + band.length) }, null);
    assert.equal(t.items.length, 8);
    assert.equal(new Set(t.keys).size, 8, `${scope}/${band} repeats`);
    assert.equal(t.submit().total, 8);
  }
});

test('no hints, explanations or answers exposed before submit; balanced and mixed', () => {
  const t = createTest({ band: 'analyst', scope: 'world-1', length: 10, rng: mulberry32(1) }, null);
  assert.equal(t.items.length, 10);
  for (const it of t.items) {
    const q = it.question;
    assert.deepEqual(q.hints, []);
    for (const f of ['answer', 'explanation', 'teach', 'misconceptions', 'commonErrors', 'data', 'matchMisconception']) assert.equal(q[f], undefined, f);
    if (q.choices) for (const c of q.choices) assert.deepEqual(Object.keys(c).sort(), ['id', 'text']);
  }
  const counts = {};
  for (const it of t.items) counts[it.skill] = (counts[it.skill] || 0) + 1;
  assert.equal(Object.keys(counts).length, 5);
  assert.ok(Object.values(counts).every((n) => n === 2));
  assert.equal(new Set(t.items.map((it) => it.question.difficulty)).size, 3);
  assert.equal(new Set(t.keys).size, 10);
});

test('scoring, results, and recording as independent evidence', () => {
  const store = createStore(memoryStorage());
  const { t, answers } = twin({ band: 'explorer', scope: 'w1l2', length: 6, seed: 2 }, store);
  assert.equal(t.items.length, 6);
  for (let i = 0; i < 4; i++) assert.equal(t.answer(i, answers[i]), true);
  // item 4 wrong on purpose, item 5 left blank
  const q4 = t.items[4].question;
  t.answer(4, q4.type === 'number' ? '99999' : q4.type === 'match' ? { L1: 'nope' } : q4.choices.find((c) => c.id !== answers[4]).id);
  assert.equal(t.answeredCount(), 5);
  const res = t.submit();
  assert.equal(res.total, 6);
  assert.equal(res.score, 4);
  assert.equal(res.percent, 67);
  assert.deepEqual(res.items.map((x) => x.correct), [true, true, true, true, false, false]);
  for (const x of res.items) {
    assert.ok(x.explanation);
    assert.ok(x.question.hints.length >= 2, 'full question available after submit');
    if (!x.correct) assert.ok(x.misconceptionFeedback); else assert.equal(x.misconceptionFeedback, null);
  }
  assert.equal(Object.values(res.bySkill).reduce((s, b) => s + b.correct, 0), 4);
  assert.equal(t.answer(1, 'a'), false, 'locked after submit');
  assert.equal(t.submit(), res, 'submit is idempotent');
  const st = store.get();
  assert.equal(st.tests.length, 1);
  assert.deepEqual({ scope: st.tests[0].scope, score: st.tests[0].score, total: st.tests[0].total, band: st.tests[0].band }, { scope: 'w1l2', score: 4, total: 6, band: 'explorer' });
  const sum = (f) => ['price-change-math', 'price-change-reasons'].reduce((s, id) => s + f(st.skills[id]), 0);
  assert.equal(sum((k) => k.independent.attempts), 6);
  assert.equal(sum((k) => k.independent.correct), 4);
  assert.equal(sum((k) => k.assisted.attempts), 0);
  const missCount = Object.values(st.misses).reduce((s, m) => s + m.count, 0);
  assert.equal(missCount, 2);
  assert.ok(missQueue(st).length >= 1);
});

test('a perfect world test scores 100%', () => {
  const store = createStore(memoryStorage());
  const { t, answers } = twin({ band: 'analyst', scope: 'world-2', length: 10, seed: 5 }, store);
  answers.forEach((a, i) => t.answer(i, a));
  const r = t.submit();
  assert.equal(r.score, 10);
  assert.equal(r.percent, 100);
  assert.deepEqual(missQueue(store.get()), []);
});

test('a retake avoids the previous test keys (memory and explicit avoid)', () => {
  _resetTestMemory();
  const a = createTest({ band: 'explorer', scope: 'w1l3', length: 6, rng: mulberry32(10) }, null);
  const b = createTest({ band: 'explorer', scope: 'w1l3', length: 6, rng: mulberry32(10) }, null);
  assert.equal(b.keys.filter((k) => a.keys.includes(k)).length, 0);
  _resetTestMemory();
  const c = createTest({ band: 'explorer', scope: 'w1l3', length: 6, rng: mulberry32(10), avoid: a.keys }, null);
  assert.equal(c.keys.filter((k) => a.keys.includes(k)).length, 0);
});
