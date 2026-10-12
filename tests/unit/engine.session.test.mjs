import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../../js/store.js';
import { createPracticeSession, masteryFor, missQueue, mulberry32 } from '../../js/engine/index.js';

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}
const fresh = () => createStore(memoryStorage());

const right = (q) => (q.type === 'number' ? String(q.answer) : q.answer);
function wrong(q) {
  if (q.type === 'number') return String(q.answer + 1234);
  if (q.type === 'match') { const L = Object.keys(q.answer); return { ...q.answer, [L[0]]: q.answer[L[1]], [L[1]]: q.answer[L[0]] }; }
  return q.choices.find((c) => c.id !== q.answer).id;
}
const sess = (store, o = {}) => createPracticeSession({ band: 'explorer', skills: ['price-change-math'], difficulty: 'easy', mode: 'skill', rng: mulberry32(1), ...o }, store);

test('independent correct: first try, no hint', () => {
  const store = fresh(), s = sess(store);
  const r = s.submit(right(s.current.question));
  assert.equal(r.correct, true);
  assert.ok(r.explanation);
  assert.equal(r.canRetry, false);
  const k = store.get().skills['price-change-math'];
  assert.deepEqual(k.independent, { correct: 1, attempts: 1 });
  assert.deepEqual(k.recent, [1]);
  assert.equal(k.introduced, true);
  assert.ok(k.lastSeen > 0);
});

test('independent wrong: recorded, miss added, no auto-advance, retry correct = assisted, teach after 2 misses', () => {
  const store = fresh(), s = sess(store);
  const q = s.current.question;
  const r1 = s.submit(wrong(q));
  assert.equal(r1.correct, false);
  assert.equal(r1.canRetry, true);
  assert.ok(r1.feedback);
  assert.equal(r1.teach, undefined);
  assert.equal(s.current.question, q, 'did not advance');
  const r2 = s.submit(wrong(q));
  assert.ok(r2.teach);
  const r3 = s.submit(right(q));
  assert.equal(r3.correct, true);
  const st = store.get(), k = st.skills['price-change-math'];
  assert.deepEqual(k.independent, { correct: 0, attempts: 1 });
  assert.deepEqual(k.assisted, { correct: 1, attempts: 1 });
  assert.deepEqual(k.recent, [0]);
  assert.equal(st.misses['price-change-math'].count, 1, 'only the first submission counts as a miss');
  assert.equal(st.misses['price-change-math'].clearedStreak, 0);
});

test('hint before first submission makes it assisted (correct or not)', () => {
  const store = fresh(), s = sess(store);
  const h1 = s.hint(), h2 = s.hint();
  assert.ok(h1 && h2 && h1 !== h2);
  assert.equal(s.current.hintsUsed, 2);
  s.submit(right(s.current.question));
  let k = store.get().skills['price-change-math'];
  assert.deepEqual(k.independent, { correct: 0, attempts: 0 });
  assert.deepEqual(k.assisted, { correct: 1, attempts: 1 });
  assert.deepEqual(k.recent, []);
  s.next();
  s.hint();
  s.submit(wrong(s.current.question));
  k = store.get().skills['price-change-math'];
  assert.deepEqual(k.assisted, { correct: 1, attempts: 2 });
  assert.equal(store.get().misses['price-change-math'].count, 1, 'wrong hinted first try is a miss');
  assert.equal(s.hint() !== undefined, true);
});

test('hints run out and stop after the question is finished', () => {
  const s = sess(null);
  const n = s.current.question.hints.length;
  for (let i = 0; i < n; i++) assert.ok(s.hint());
  assert.equal(s.hint(), null);
  s.next();
  s.submit(right(s.current.question));
  assert.equal(s.hint(), null);
});

test('reveal: no credit, revealed++, miss added, cannot earn credit afterwards', () => {
  const store = fresh(), s = sess(store);
  const q = s.current.question;
  const rv = s.reveal();
  assert.equal(rv.answer, q.answer);
  assert.ok(rv.explanation && rv.answerText);
  const after = s.submit(right(q));
  assert.equal(after.canRetry, false);
  const st = store.get(), k = st.skills['price-change-math'];
  assert.equal(k.revealed, 1);
  assert.deepEqual(k.independent, { correct: 0, attempts: 0 });
  assert.deepEqual(k.assisted, { correct: 0, attempts: 0 });
  assert.equal(st.misses['price-change-math'].count, 1);
  // reveal after a wrong first try does not double-count the miss
  s.next(); s.submit(wrong(s.current.question)); s.reveal();
  assert.equal(store.get().misses['price-change-math'].count, 2);
  assert.equal(store.get().skills['price-change-math'].revealed, 2);
});

test('misses: misconception tallied; two independent corrects clear the entry', () => {
  const store = fresh(), s = sess(store);
  let q = s.current.question;
  // force a known misconception on a number question
  while (q.type !== 'number' || !q.commonErrors.length) { s.next(); q = s.current.question; }
  const e = q.commonErrors[0];
  const r = s.submit(String(e.value));
  assert.equal(r.misconception, e.misconception);
  assert.equal(store.get().misses['price-change-math'].misconceptions[e.misconception], 1);
  s.next(); s.submit(right(s.current.question));
  assert.equal(store.get().misses['price-change-math'].clearedStreak, 1);
  s.next(); s.hint(); s.submit(right(s.current.question));
  assert.equal(store.get().misses['price-change-math'].clearedStreak, 1, 'assisted correct does not clear');
  s.next(); s.submit(right(s.current.question));
  assert.equal(store.get().misses['price-change-math'], undefined);
});

test('missQueue sorted by count desc; misses mode uses queue, focuses, and ends when empty', () => {
  const store = fresh();
  store.update((d) => {
    d.misses['hedge-outcome'] = { count: 3, misconceptions: { 'per-unit-vs-total': 3 }, lastMissed: 5, clearedStreak: 0 };
    d.misses['supply-demand'] = { count: 1, misconceptions: { 'supply-backwards': 1 }, lastMissed: 9, clearedStreak: 0 };
  });
  assert.deepEqual(missQueue(store.get()), ['hedge-outcome', 'supply-demand']);
  const s = createPracticeSession({ band: 'analyst', difficulty: 'medium', mode: 'misses', rng: mulberry32(4) }, store);
  const seenSkills = new Set();
  for (let i = 0; i < 12; i++) { seenSkills.add(s.current.skill); s.next(); }
  assert.ok([...seenSkills].every((x) => x === 'hedge-outcome' || x === 'supply-demand'));
  // clear everything → session ends
  const s2 = createPracticeSession({ band: 'analyst', difficulty: 'easy', mode: 'misses', rng: mulberry32(8) }, store);
  for (let i = 0; i < 20 && s2.current; i++) { s2.submit(right(s2.current.question)); s2.next(); }
  assert.equal(s2.current, null);
  assert.equal(s2.done, true);
  assert.deepEqual(missQueue(store.get()), []);
  assert.equal(createPracticeSession({ band: 'explorer', mode: 'misses' }, store).current, null);
});

test('modes: practice rotates skills, mixed/review only uses introduced skills, warmup is short', () => {
  const store = fresh();
  const p = createPracticeSession({ band: 'explorer', skills: ['market-basics', 'buyers-sellers'], difficulty: 'easy', mode: 'practice', rng: mulberry32(3) }, store);
  const order = [];
  for (let i = 0; i < 4; i++) { order.push(p.current.skill); p.next(); }
  assert.deepEqual(order, ['market-basics', 'buyers-sellers', 'market-basics', 'buyers-sellers']);
  store.introduceSkills(['supply-demand', 'future-agreement']);
  const m = createPracticeSession({ band: 'explorer', difficulty: 'easy', mode: 'mixed', rng: mulberry32(3) }, store);
  for (let i = 0; i < 10; i++) { assert.ok(['supply-demand', 'future-agreement'].includes(m.current.skill)); m.next(); }
  const w = createPracticeSession({ band: 'explorer', skills: ['market-basics'], mode: 'warmup', rng: mulberry32(3) }, store);
  let n = 0;
  while (w.current && n < 10) { n++; w.submit(right(w.current.question)); w.next(); }
  assert.equal(n, 3);
  assert.equal(store.get().skills['market-basics'].independent.attempts, 3, 'warmup records normally');
  const keys = new Set();
  const lots = createPracticeSession({ band: 'analyst', skills: ['futures-risk'], difficulty: 'medium', mode: 'world', rng: mulberry32(6) }, null);
  for (let i = 0; i < 25; i++) { keys.add(lots.current.question.key); lots.next(); }
  assert.equal(keys.size, 25, 'no repeats within a session');
});

test('adaptive difficulty steps up after 3 independent correct, down after 2 misses', () => {
  const s = createPracticeSession({ band: 'explorer', skills: ['price-change-math'], difficulty: 'adaptive', mode: 'skill', rng: mulberry32(2) }, fresh());
  assert.equal(s.difficulty, 'easy');
  for (let i = 0; i < 3; i++) { s.submit(right(s.current.question)); s.next(); }
  assert.equal(s.difficulty, 'medium');
  assert.equal(s.current.question.difficulty, 'medium');
  for (let i = 0; i < 2; i++) { s.submit(wrong(s.current.question)); s.next(); }
  assert.equal(s.difficulty, 'easy');
  const sum = s.summary();
  assert.equal(sum.independentAttempts, 5);
  assert.equal(sum.independentCorrect, 3);
});

test('mastery levels come only from independent evidence', () => {
  const store = fresh();
  const id = 'supply-demand';
  assert.equal(masteryFor(store.get(), id).level, 'not-started');
  store.introduceSkills([id]);
  assert.equal(masteryFor(store.get(), id).level, 'introduced');
  const s = createPracticeSession({ band: 'explorer', skills: [id], difficulty: 'easy', mode: 'skill', rng: mulberry32(7) }, store);
  // lots of assisted work never masters a skill
  for (let i = 0; i < 6; i++) { s.hint(); s.submit(right(s.current.question)); s.next(); }
  assert.equal(masteryFor(store.get(), id).level, 'introduced');
  for (let i = 0; i < 3; i++) { s.submit(right(s.current.question)); s.next(); }
  assert.equal(masteryFor(store.get(), id).level, 'practicing');
  for (let i = 0; i < 2; i++) { s.submit(right(s.current.question)); s.next(); }
  const m = masteryFor(store.get(), id);
  assert.equal(m.level, 'mastered');
  assert.equal(m.independentCorrect, 5);
  assert.equal(m.assistedCorrect, 6);
  assert.equal(m.recentAccuracy, 1);
  // a miss puts it in the queue → needs-review
  s.submit(wrong(s.current.question)); s.next();
  assert.equal(masteryFor(store.get(), id).level, 'needs-review');
  // ≤1 of last 3 correct → needs-review even outside the queue
  store.update((d) => { delete d.misses[id]; d.skills[id].recent = [1, 1, 1, 0, 0, 1, 0, 0]; });
  assert.equal(masteryFor(store.get(), id).level, 'needs-review');
  store.update((d) => { d.skills[id].recent = [1, 1, 0, 1, 1]; });
  assert.equal(masteryFor(store.get(), id).level, 'mastered');
});

test('session works without a store and recent keeps the last 8', () => {
  const store = fresh();
  const s = sess(store);
  for (let i = 0; i < 10; i++) { s.submit(right(s.current.question)); s.next(); }
  assert.equal(store.get().skills['price-change-math'].recent.length, 8);
  const n = sess(null);
  assert.equal(n.submit(right(n.current.question)).correct, true);
});
