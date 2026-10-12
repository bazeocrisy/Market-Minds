import test from 'node:test';
import assert from 'node:assert/strict';
import { checkResponse, parseNumber, generateQuestion, mulberry32, answerText } from '../../js/engine/index.js';

test('parseNumber is tolerant', () => {
  assert.equal(parseNumber('$4'), 4);
  assert.equal(parseNumber(' 4 '), 4);
  assert.equal(parseNumber('4.50'), 4.5);
  assert.equal(parseNumber('$ 1,750'), 1750);
  assert.equal(parseNumber('−3'), -3);
  assert.equal(parseNumber('-$0.35'), -0.35);
  assert.equal(parseNumber('25%'), 25);
  assert.equal(parseNumber('50 cents'), 0.5);
  assert.equal(parseNumber('4 dollars'), 4);
  assert.equal(parseNumber(.3), 0.3);
  assert.ok(Number.isNaN(parseNumber('four')));
  assert.ok(Number.isNaN(parseNumber('4..5')));
});

function numQ(template, band = 'explorer', difficulty = 'easy', pred = () => true) {
  const rng = mulberry32(11);
  for (let i = 0; i < 400; i++) {
    const q = generateQuestion(template.split('-')[0] === 'pcm' ? 'price-change-math' : template.startsWith('ho') ? 'hedge-outcome' : 'future-agreement', { band, difficulty, rng });
    if (q.template === template && pred(q)) return q;
  }
  throw new Error('not found ' + template);
}

test('number answers: tolerance, formats, and floating-point safety', () => {
  const q = numQ('pcm-rise', 'analyst', 'medium');
  assert.equal(checkResponse(q, String(q.answer)).correct, true);
  assert.equal(checkResponse(q, '$' + q.answer.toFixed(2)).correct, true);
  assert.equal(checkResponse(q, ` ${q.answer} `).correct, true);
  assert.equal(checkResponse(q, q.answer + 0.01).correct, false);
  const fake = { type: 'number', answer: 0.3, tolerance: 0.005, commonErrors: [] };
  assert.equal(checkResponse(fake, 0.1 + 0.2).correct, true);
});

test('number misconception detection: added, wrong number, per-unit vs total, sign, percent of new', () => {
  const rise = numQ('pcm-rise', 'explorer', 'easy');
  const { old, new: nw } = rise.data;
  assert.equal(checkResponse(rise, String(old + nw)).misconception, 'added-instead');
  assert.equal(checkResponse(rise, String(nw)).misconception, 'used-wrong-number');
  const fb = checkResponse(rise, String(old + nw)).feedback;
  assert.ok(fb.length > 20 && !fb.includes(String(rise.answer) + ' ') && !fb.includes('$' + rise.answer));

  const tot = numQ('ho-total', 'analyst', 'challenge');
  const per = Math.abs(tot.data.market - tot.data.agreed);
  assert.equal(checkResponse(tot, per.toFixed(2)).misconception, 'per-unit-vs-total');

  const signed = numQ('pcm-drop', 'analyst', 'medium', (q) => q.answer < 0);
  assert.equal(checkResponse(signed, String(-signed.answer)).misconception, 'wrong-direction');

  const pct = numQ('pcm-percent', 'analyst', 'challenge', (q) => {
    const d = Math.abs(q.data.new - q.data.old);
    return Math.round((d / q.data.new) * 100) !== q.answer;
  });
  const d = Math.abs(pct.data.new - pct.data.old);
  assert.equal(checkResponse(pct, String(Math.round((d / pct.data.new) * 100))).misconception, 'percent-of-new');
  assert.equal(checkResponse(pct, `${pct.answer}%`).correct, true);

  const generic = checkResponse(rise, '999');
  assert.equal(generic.misconception, null);
  assert.match(generic.feedback, /steps/);
  assert.equal(checkResponse(rise, 'abc').invalid, true);
  assert.equal(checkResponse(rise, '').blank, true);
});

test('choice and match checking', () => {
  const q = generateQuestion('supply-demand', { band: 'explorer', difficulty: 'easy', seed: 3 });
  const wrong = q.choices ? q.choices.find((c) => c.id !== q.answer) : null;
  if (q.choices) {
    assert.equal(checkResponse(q, q.answer).correct, true);
    const r = checkResponse(q, wrong.id);
    assert.equal(r.correct, false);
    assert.equal(r.misconception, wrong.misconception);
    assert.equal(r.feedback, q.misconceptions[wrong.misconception]);
  }
  const rng = mulberry32(2);
  let m;
  for (let i = 0; i < 200 && !m; i++) { const x = generateQuestion('futures-risk', { band: 'analyst', difficulty: 'easy', rng }); if (x.type === 'match') m = x; }
  assert.equal(checkResponse(m, { ...m.answer }).correct, true);
  const L = Object.keys(m.answer), bad = { ...m.answer, [L[0]]: m.answer[L[1]], [L[1]]: m.answer[L[0]] };
  const r = checkResponse(m, bad);
  assert.equal(r.correct, false);
  assert.match(r.feedback, /2 of 4 matches/);
  assert.ok(answerText(m).includes('→'));
});

test('static content questions (band "all", lesson-check / story-question) are checked too', () => {
  const q = {
    key: 'story-1', skill: 'market-basics', band: 'all', template: 'story-question', type: 'choice', prompt: 'Who is the seller?',
    choices: [{ id: 'a', text: 'Nia' }, { id: 'b', text: 'Omar', misconception: 'buyer-seller-swap' }, { id: 'c', text: 'The apples', misconception: 'custom-thing' }],
    answer: 'a', misconceptions: { 'custom-thing': 'Apples are what is traded, not a person.' }
  };
  assert.equal(checkResponse(q, 'a').correct, true);
  assert.equal(checkResponse(q, 'Nia').correct, true);
  assert.equal(checkResponse(q, 'b').misconception, 'buyer-seller-swap');
  assert.match(checkResponse(q, 'b').feedback, /buyer/);
  assert.equal(checkResponse(q, 'c').feedback, 'Apples are what is traded, not a person.');
  const noMap = { type: 'choice', template: 'lesson-check', choices: [{ id: 'x', text: '1' }, { id: 'y', text: '2' }], answer: 'x' };
  assert.equal(checkResponse(noMap, 'y').correct, false);
  assert.ok(checkResponse(noMap, 'y').feedback.length > 0);
});
