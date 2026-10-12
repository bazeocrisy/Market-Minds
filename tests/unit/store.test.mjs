import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore, normalize, emptyState, KEY, CORRUPT_KEY } from '../../js/store.js';

function memStorage(init = {}) {
  const m = new Map(Object.entries(init));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), _m: m };
}

test('fresh store is empty and saves band', () => {
  const st = memStorage();
  const s = createStore(st);
  assert.equal(s.get().band, null);
  s.setBand('analyst');
  assert.equal(JSON.parse(st.getItem(KEY)).band, 'analyst');
  s.setBand('hacker');
  assert.equal(s.get().band, 'analyst');
});

test('progress survives a reload (new store on same storage)', () => {
  const st = memStorage();
  const a = createStore(st);
  a.markLessonStep('w1l1', 3);
  a.completeLesson('w1l1');
  a.introduceSkills(['market-basics']);
  const b = createStore(st);
  assert.deepEqual(b.get().current, { lessonId: 'w1l1', step: 3 });
  assert.equal(b.get().lessons.w1l1.completed, true);
  assert.equal(b.get().skills['market-basics'].introduced, true);
});

test('corrupt JSON is backed up and replaced', () => {
  const st = memStorage({ [KEY]: '{not json' });
  const s = createStore(st);
  assert.deepEqual(s.get().lessons, {});
  assert.equal(st.getItem(CORRUPT_KEY), '{not json');
});

test('normalize repairs bad fields and rejects other versions', () => {
  assert.deepEqual(normalize({ version: 99, band: 'analyst' }), emptyState());
  const n = normalize({ version: 1, band: 'x', skills: { a: { independent: { correct: 9, attempts: 2 }, recent: [1, 'x', 0] } }, tests: [{ score: 5, total: 3 }, { score: 1, total: 2 }] });
  assert.equal(n.band, null);
  assert.deepEqual(n.skills.a.independent, { correct: 2, attempts: 2 });
  assert.deepEqual(n.skills.a.recent, [1, 0]);
  assert.equal(n.tests.length, 1);
});

test('update never clobbers a newer write from another tab', () => {
  const st = memStorage();
  const tabA = createStore(st);
  const tabB = createStore(st);
  tabA.markLessonStep('w1l1', 2);
  tabB.markLessonStep('w1l2', 1);   // tabB had a stale copy; it must merge onto tabA's save
  const final = JSON.parse(st.getItem(KEY));
  assert.ok(final.lessons.w1l1 && final.lessons.w1l2);
});

test('works with no storage at all (private mode)', () => {
  const s = createStore(null);
  s.setBand('explorer');
  assert.equal(s.get().band, 'explorer');
});
