import test from 'node:test';
import assert from 'node:assert/strict';
import {
  roundCents, positionPL, plSteps, percentChange, classifyMove, marginVsLoss, isValidStop,
  simulateStop, createRng, generatePricePath, runPosition, priceChange, toBar
} from '../../js/lab/sim.js';
import { SCENARIOS, NEWS_EFFECTS, newsExpectation, scenarioById } from '../../js/content/market-scenarios.js';

test('roundCents rounds to cents without float drift and never returns -0', () => {
  assert.equal(roundCents(1.005), 1.01);
  assert.equal(roundCents(0.1 + 0.2), 0.3);
  assert.equal(roundCents(-2.345), -2.35);
  assert.equal(roundCents(12), 12);
  assert.ok(Object.is(roundCents(-0.001), 0));
  assert.equal(roundCents(NaN), 0);
});

test('position P/L uses (exit − entry) × qty × sign', () => {
  assert.equal(positionPL({ entry: 6, exit: 6.4, quantity: 100, side: 'long' }), 40);
  assert.equal(positionPL({ entry: 6, exit: 6.4, quantity: 100, side: 'short' }), -40);
  assert.equal(positionPL({ entry: 2, exit: 1.6, quantity: 100, side: 'long' }), -40);
  assert.equal(positionPL({ entry: 2, exit: 1.6, quantity: 100, side: 'short' }), 40);
  assert.equal(positionPL({ entry: 3.1, exit: 3.1, quantity: 100, side: 'long' }), 0);
  assert.equal(positionPL({ entry: 0.1, exit: 0.3, quantity: 3, side: 'long' }), 0.6);
  assert.throws(() => positionPL({ entry: 1, exit: 2, quantity: 1, side: 'up' }));
});

test('plSteps shows the work line by line and agrees with positionPL', () => {
  const r = plSteps({ entry: 8, exit: 8.95, quantity: 100, side: 'short' });
  assert.equal(r.diff, 0.95);
  assert.equal(r.perUnit, -0.95);
  assert.equal(r.total, -95);
  assert.equal(r.lines.length, 3);
  assert.match(r.lines[0], /8\.95 − 8\.00/);
});

test('percent change and move classification', () => {
  assert.equal(percentChange(4, 5), 25);
  assert.equal(percentChange(5, 4), -20);
  assert.equal(percentChange(3, 3.1), 3.33);
  assert.equal(percentChange(0, 5), null);
  assert.equal(classifyMove(3.5, 3.49), 'same');
  assert.equal(classifyMove(2, 1.9), 'down');
  assert.equal(classifyMove(6, 6.4), 'up');
  assert.equal(priceChange(3.25, 5), 1.75);
});

test('margin is not the maximum loss: loss can exceed the deposit', () => {
  const m = marginVsLoss(20, -40);
  assert.deepEqual(m, { margin: 20, loss: 40, exceeds: true, extraOwed: 20 });
  assert.equal(marginVsLoss(50, -10).exceeds, false);
  assert.equal(marginVsLoss(50, 30).loss, 0);
});

test('stop validity: long below entry, short above entry', () => {
  assert.ok(isValidStop('long', 6, 5.8));
  assert.ok(!isValidStop('long', 6, 6.2));
  assert.ok(isValidStop('short', 8, 8.7));
  assert.ok(!isValidStop('short', 8, 7.5));
  assert.ok(!isValidStop('long', 6, NaN));
});

test('stop fills at the stop when the price trades through it smoothly', () => {
  const r = simulateStop({ side: 'long', stop: 5.9, entry: 6, days: [{ price: 5.95 }, { price: 5.8 }] });
  assert.deepEqual(r, { triggered: true, dayIndex: 1, fill: 5.9, gapped: false, gap: 0 });
});

test('stop GAP: a long stop fills at the next available price (the open), not the stop', () => {
  const sc = scenarioById('make-believe-oj-gap');
  const r = simulateStop({ side: 'long', stop: 2.9, entry: sc.start, days: sc.days });
  assert.equal(r.triggered, true);
  assert.equal(r.dayIndex, 2);
  assert.equal(r.fill, 2.6);
  assert.equal(r.gapped, true);
  assert.equal(r.gap, 0.3);
});

test('stop GAP: a short stop gaps up past the stop', () => {
  const sc = scenarioById('toy-cocoa-gap-up');
  const r = simulateStop({ side: 'short', stop: 8.7, entry: sc.start, days: sc.days });
  assert.equal(r.fill, 9);
  assert.equal(r.gapped, true);
  assert.equal(r.gap, 0.3);
  // Bare number days are single trade prices: fill is that price.
  const n = simulateStop({ side: 'short', stop: 10, entry: 9, days: [9.5, 10.6] });
  assert.equal(n.fill, 10.6);
});

test('stop that is never reached does not trigger', () => {
  const r = simulateStop({ side: 'long', stop: 1, entry: 2, days: [2.1, 2.2] });
  assert.equal(r.triggered, false);
  assert.equal(r.fill, null);
});

test('toBar derives open from previous close unless the day gaps', () => {
  assert.deepEqual(toBar({ price: 5 }, 4), { open: 4, close: 5, high: 5, low: 4 });
  assert.deepEqual(toBar({ price: 2.55, open: 2.6 }, 3.1), { open: 2.6, close: 2.55, high: 2.6, low: 2.55 });
});

test('runPosition: whole trade, including loss beyond margin and no trade', () => {
  const sc = scenarioById('practice-apples-surprise');
  const long = runPosition({ side: 'long', entry: sc.start, quantity: sc.quantity, days: sc.days, margin: sc.margin });
  assert.equal(long.pl, -40);
  assert.equal(long.margin.exceeds, true);
  const short = runPosition({ side: 'short', entry: sc.start, quantity: sc.quantity, days: sc.days, margin: sc.margin });
  assert.equal(short.pl, 40);
  const none = runPosition({ side: 'none', entry: sc.start, quantity: sc.quantity, days: sc.days, margin: sc.margin });
  assert.equal(none.pl, 0);
  const stopped = runPosition({ side: 'long', entry: 3, quantity: 100, stop: 2.9, days: scenarioById('make-believe-oj-gap').days, margin: 40 });
  assert.equal(stopped.exit, 2.6);
  assert.equal(stopped.pl, -40);
  // An invalid stop (wrong side) is ignored rather than triggering instantly.
  const bad = runPosition({ side: 'long', entry: 3, quantity: 100, stop: 3.5, days: scenarioById('make-believe-oj-gap').days, margin: 40 });
  assert.equal(bad.stopped, null);
});

test('seeded price path is deterministic, never negative, rounded to cents', () => {
  const a = generatePricePath({ seed: 42, start: 5, days: 30 });
  const b = generatePricePath({ seed: 42, start: 5, days: 30 });
  const c = generatePricePath({ seed: 43, start: 5, days: 30 });
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
  assert.equal(a.length, 31);
  const crash = generatePricePath({ seed: 7, start: 1, days: 60, volatility: 0.5, shocks: [{ day: 3, pct: -2 }, { day: 10, pct: -5 }] });
  for (const p of [...a, ...crash]) {
    assert.ok(p > 0, `price ${p} must stay positive`);
    assert.equal(roundCents(p), p);
  }
  const shocked = generatePricePath({ seed: 1, start: 10, days: 2, volatility: 0, shocks: [{ day: 1, pct: 0.2 }] });
  assert.deepEqual(shocked, [10, 12, 12]);
  const r = createRng(9);
  for (let i = 0; i < 100; i++) { const v = r(); assert.ok(v >= 0 && v < 1); }
});

test('scenario integrity', () => {
  assert.ok(SCENARIOS.length >= 6);
  const ids = new Set();
  for (const s of SCENARIOS) {
    assert.ok(!ids.has(s.id), `duplicate id ${s.id}`); ids.add(s.id);
    assert.match(s.item, /^(Pretend|Practice|Make-Believe|Sample|Toy) /, `${s.id} item must be clearly pretend`);
    assert.ok(s.intro.explorer && s.intro.analyst, `${s.id} intro both bands`);
    assert.ok(s.notes.explorer && s.notes.analyst, `${s.id} notes both bands`);
    assert.ok(s.quantity > 0 && s.margin > 0 && s.start > 0);
    assert.ok(s.days.length >= 4);
    let prev = s.start, against = false;
    for (const d of s.days) {
      assert.ok(d.price > 0 && roundCents(d.price) === d.price, `${s.id} ${d.label} price`);
      assert.ok(NEWS_EFFECTS.includes(d.news.effect), `${s.id} ${d.label} effect`);
      const hl = d.news.headline;
      assert.ok(typeof hl === 'string' || (hl.explorer && hl.analyst), `${s.id} ${d.label} headline`);
      const exp = newsExpectation(d.news.effect);
      if (exp && classifyMove(prev, d.price) !== exp) against = true;
      prev = d.price;
    }
    assert.equal(s.against, against, `${s.id} 'against' flag must match the data`);
  }
  assert.ok(SCENARIOS.filter((s) => s.against).length >= 2, 'some scenarios move against the news');
  assert.ok(SCENARIOS.some((s) => s.days.some((d) => d.open != null)), 'at least one gap day');
  assert.ok(SCENARIOS.some((s) => ['long', 'short'].some((side) => runPosition({ side, entry: s.start, quantity: s.quantity, days: s.days, margin: s.margin }).margin.exceeds)), 'a loss-exceeds-margin case exists');
});
