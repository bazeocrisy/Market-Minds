import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENARIOS, scenarioById } from '../../js/content/market-scenarios.js';
import { scenarioBars, isValidBar, linePoints, candleList, chartSpec, longShortRows, CHART_MODES } from '../../js/lab/chart.js';
import { roundCents, positionPL, runPosition, simulateStop } from '../../js/lab/sim.js';
import { describeCandles } from '../../js/ui/visuals.js';

// Snapshot of every daily close BEFORE OHLC data was added (batch 1). Closes must never change:
// lessons, tests and QA checks rely on these exact numbers.
const CLOSES_V1 = {
  'pretend-wheat-storm': { start: 6.00, closes: [6.05, 6.40, 6.55, 6.30, 6.35] },
  'practice-apples-surprise': { start: 2.00, closes: [1.90, 1.80, 1.81, 1.70, 1.60] },
  'make-believe-oj-gap': { start: 3.00, closes: [3.05, 3.10, 2.55, 2.50, 2.70] },
  'sample-corn-hype': { start: 4.00, closes: [4.02, 3.95, 3.80, 3.70, 3.75] },
  'toy-cocoa-gap-up': { start: 8.00, closes: [8.60, 8.30, 9.10, 8.90, 8.95] },
  'pretend-oats-puzzle': { start: 3.50, closes: [3.49, 3.52, 3.70, 3.75, 3.74] }
};
const GAP_DAYS = { 'make-believe-oj-gap': ['Day 3'], 'toy-cocoa-gap-up': ['Day 3'] };

test('closes are unchanged from batch 1', () => {
  for (const [id, snap] of Object.entries(CLOSES_V1)) {
    const sc = scenarioById(id);
    assert.ok(sc, id);
    assert.equal(sc.start, snap.start, `${id} start`);
    assert.deepEqual(sc.days.map((d) => d.price), snap.closes, `${id} closes`);
  }
});

test('every scenario day has valid, explicit, deterministic OHLC data', () => {
  for (const sc of SCENARIOS) {
    let prev = sc.start;
    for (const d of sc.days) {
      for (const k of ['open', 'high', 'low', 'price']) {
        assert.ok(Number.isFinite(d[k]) && d[k] > 0, `${sc.id} ${d.label} ${k}`);
        assert.equal(roundCents(d[k]), d[k], `${sc.id} ${d.label} ${k} whole cents`);
      }
      assert.ok(d.high >= Math.max(d.open, d.price), `${sc.id} ${d.label} high ≥ max(open, close)`);
      assert.ok(d.low <= Math.min(d.open, d.price), `${sc.id} ${d.label} low ≤ min(open, close)`);
      const gapIntended = (GAP_DAYS[sc.id] || []).includes(d.label);
      if (gapIntended) assert.notEqual(d.open, prev, `${sc.id} ${d.label} should gap`);
      else assert.equal(d.open, prev, `${sc.id} ${d.label} open = previous close`);
      prev = d.price;
    }
    const bars = scenarioBars(sc);
    assert.equal(bars.length, sc.days.length);
    bars.forEach((b, i) => {
      assert.ok(isValidBar(b), `${sc.id} bar ${i}`);
      assert.equal(b.close, sc.days[i].price);
    });
    assert.deepEqual(scenarioBars(sc), bars, 'deterministic');
  }
  assert.ok(!isValidBar({ open: 2, high: 1.9, low: 1.5, close: 1.8 }));
  assert.ok(!isValidBar({ open: 2, high: 2.2, low: 1.9, close: 1.8 }));
});

test('intraday highs/lows keep the batch 1 stop examples exactly', () => {
  const oj = scenarioById('make-believe-oj-gap');
  assert.deepEqual(simulateStop({ side: 'long', stop: 2.9, entry: oj.start, days: oj.days }), { triggered: true, dayIndex: 2, fill: 2.6, gapped: true, gap: 0.3 });
  const cocoa = scenarioById('toy-cocoa-gap-up');
  assert.deepEqual(simulateStop({ side: 'short', stop: 8.7, entry: cocoa.start, days: cocoa.days }), { triggered: true, dayIndex: 2, fill: 9, gapped: true, gap: 0.3 });
  // An intraday touch (not a gap) fills AT the stop: Pretend Oats dips to $3.45 on Day 3.
  const oats = scenarioById('pretend-oats-puzzle');
  const s = simulateStop({ side: 'long', stop: 3.46, entry: oats.start, days: oats.days });
  assert.deepEqual(s, { triggered: true, dayIndex: 2, fill: 3.46, gapped: false, gap: 0 });
});

test('chart mode never changes the maths', () => {
  for (const sc of SCENARIOS) {
    for (let k = 0; k <= sc.days.length; k++) {
      const line = chartSpec(sc, k, 'line');
      const candles = chartSpec(sc, k, 'candles');
      assert.equal(line.kind, 'line');
      assert.equal(line.points.length, k + 1);
      assert.equal(line.points[0].value, sc.start);
      if (k === 0) { assert.equal(candles, null, 'no candle before Day 1'); continue; }
      assert.equal(candles.kind, 'candles');
      assert.deepEqual(candles.candles.map((c) => c.close), line.points.slice(1).map((p) => p.value), `${sc.id} k=${k} closes match`);
      assert.deepEqual(candles.candles.map((c) => c.label), line.points.slice(1).map((p) => p.label));
      assert.match(describeCandles(candles), new RegExp(`from D1 to D${k}|for D1`));
    }
    // P/L only ever uses closes, so it is identical whichever chart is on screen.
    const lastLine = linePoints(sc).at(-1).value;
    const lastCandle = candleList(sc).at(-1).close;
    assert.equal(lastLine, lastCandle);
    for (const side of ['long', 'short']) {
      assert.equal(runPosition({ side, entry: sc.start, quantity: sc.quantity, days: sc.days, margin: sc.margin }).pl,
        positionPL({ entry: sc.start, exit: lastLine, quantity: sc.quantity, side }));
    }
  }
  assert.deepEqual(CHART_MODES, ['line', 'candles']);
  assert.equal(chartSpec(SCENARIOS[0], 2, 'nonsense').kind, 'line', 'unknown mode falls back to line');
});

test('Long or Short? rows are always opposite and match positionPL', () => {
  const rows = longShortRows(6.05, 6.40, 100);
  assert.deepEqual(rows, [
    { side: 'long', change: 0.35, perUnit: 0.35, total: 35 },
    { side: 'short', change: 0.35, perUnit: -0.35, total: -35 }
  ]);
  for (const sc of SCENARIOS) {
    let prev = sc.start;
    for (const d of sc.days) {
      const [l, s] = longShortRows(prev, d.price, sc.quantity);
      assert.equal(l.total, -s.total || 0);
      assert.equal(l.total, positionPL({ entry: prev, exit: d.price, quantity: sc.quantity, side: 'long' }));
      prev = d.price;
    }
  }
  const flat = longShortRows(3, 3, 100);
  assert.ok(flat.every((r) => r.total === 0 && Object.is(r.perUnit, 0)), 'no −0');
});

test('Pattern Trap scenario: steady calm rise, then a no-news reversal, with a reflection note', () => {
  const traps = SCENARIOS.filter((s) => s.patternTrap);
  assert.equal(traps.length, 1);
  const sc = traps[0];
  assert.equal(sc.lesson, 'w4l4');
  assert.ok(sc.reflection.explorer && sc.reflection.analyst);
  assert.match(sc.reflection.explorer + sc.reflection.analyst, /can’t guarantee|cannot guarantee/);
  const closes = [sc.start, ...sc.days.map((d) => d.price)];
  // Find the streak, then the reversal.
  let i = 1;
  while (i < closes.length && closes[i] > closes[i - 1]) i++;
  assert.ok(i - 1 >= 3, 'at least three up days in a row');
  assert.ok(closes[i] < closes[i - 1], 'then the price falls');
  for (let k = 0; k < i - 1; k++) assert.equal(sc.days[k].news.effect, 'none', 'the rise had no news');
  // The reversal day offers no supply/demand evidence (no news, or only an opinion).
  assert.ok(['none', 'opinion'].includes(sc.days[i - 1].news.effect));
});
