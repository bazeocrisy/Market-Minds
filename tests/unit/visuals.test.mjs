import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatMoney, formatNumber, formatValue, isMoneyUnit, extent, linearScale, niceStep, niceTicks,
  labelStride, supplyDemandPressure, describeLine, describeBars, describeCandles, candleDirection, stepCounts
} from '../../js/ui/visuals.js';
import { THINKING_PROMPTS, THINKING_TYPES, promptById } from '../../js/content/thinking.js';
import { SKILLS } from '../../js/content/skills.js';

const M = '−';

test('formatMoney', () => {
  assert.equal(formatMoney(6.4), '$6.40');
  assert.equal(formatMoney(1234.5), '$1,234.50');
  assert.equal(formatMoney(-3), `${M}$3.00`);
  assert.equal(formatMoney(0.35, { sign: true }), '+$0.35');
  assert.equal(formatMoney(0, { sign: true }), '$0.00');
  assert.equal(formatMoney(-0.001), '$0.00');
  assert.equal(formatMoney('x'), '');
});

test('formatNumber / formatValue / isMoneyUnit', () => {
  assert.equal(formatNumber(2.5), '2.5');
  assert.equal(formatNumber(-4), `${M}4`);
  assert.equal(formatValue(3, '$'), '$3.00');
  assert.equal(formatValue(12, 'apples'), '12 apples');
  assert.equal(formatValue(7), '7');
  assert.ok(isMoneyUnit('dollars') && !isMoneyUnit('kg'));
});

test('extent and linearScale', () => {
  assert.deepEqual(extent([3, 1, NaN, 7]), [1, 7]);
  assert.deepEqual(extent([]), [0, 0]);
  const s = linearScale([0, 10], [100, 0]);
  assert.equal(s(0), 100);
  assert.equal(s(5), 50);
  assert.equal(s(10), 0);
  assert.equal(linearScale([4, 4], [0, 10])(4), 5);
});

test('niceStep and niceTicks cover the data with round numbers', () => {
  assert.equal(niceStep(10, 5), 2);
  assert.equal(niceStep(1, 4), 0.25);
  const t = niceTicks(3.49, 3.75, 4);
  assert.ok(t[0] <= 3.49 && t[t.length - 1] >= 3.75);
  for (let i = 1; i < t.length; i++) assert.ok(Math.abs((t[i] - t[i - 1]) - (t[1] - t[0])) < 1e-9);
  const flat = niceTicks(5, 5);
  assert.ok(flat[0] < 5 && flat[flat.length - 1] > 5);
  assert.deepEqual(niceTicks(0, 10, 5), [0, 2, 4, 6, 8, 10]);
  assert.deepEqual(niceTicks(NaN, 1), []);
  assert.equal(labelStride(5), 1);
  assert.equal(labelStride(20, 7), 3);
});

test('supplyDemandPressure', () => {
  assert.equal(supplyDemandPressure('less', 'same').direction, 'up');
  assert.equal(supplyDemandPressure('same', 'more').direction, 'up');
  assert.equal(supplyDemandPressure('more', 'less').direction, 'down');
  assert.equal(supplyDemandPressure('same', 'same').direction, 'same');
  assert.equal(supplyDemandPressure('more', 'more').direction, 'unclear');
  const c = supplyDemandPressure('less', 'same', 'apples').caption;
  assert.match(c, /apples/);
  assert.match(c, /not always/);
});

test('text summaries for charts', () => {
  const line = describeLine({ title: 'Price', unit: '$', points: [{ label: 'Mon', value: 2 }, { label: 'Tue', value: 1.5 }] });
  assert.match(line, /went down by \$0\.50/);
  assert.match(describeBars({ title: 'Sales', unit: 'cups', items: [{ label: 'A', value: 3 }, { label: 'B', value: 9 }] }), /Highest: B/);
  const c = describeCandles({ title: 'C', unit: '$', candles: [{ label: '1', open: 1, high: 2, low: 0.5, close: 1.5 }, { label: '2', open: 1.5, high: 1.6, low: 1, close: 1.1 }] });
  assert.match(c, /1 up, 1 down/);
  assert.equal(candleDirection({ open: 2, close: 2 }), 'flat');
  assert.match(describeLine({ points: [] }), /no data/);
});

// ------------------------------------------------------------ Thinking Lab content integrity

const both = (v) => typeof v === 'string' || (v && typeof v === 'object' && v.explorer && v.analyst);
const KINDS = ['line', 'bars', 'candles', 'priceTags', 'supplyDemand', 'agreement', 'image'];

test('thinking prompts: ids unique, schema complete, both bands', () => {
  assert.ok(THINKING_PROMPTS.length >= 10);
  const ids = new Set();
  for (const p of THINKING_PROMPTS) {
    assert.ok(!ids.has(p.id), `duplicate ${p.id}`); ids.add(p.id);
    assert.ok([1, 2, 4].includes(p.world), p.id);
    assert.ok(SKILLS[p.skill], `${p.id} skill ${p.skill}`);
    assert.equal(SKILLS[p.skill].lesson, p.lesson, `${p.id} lesson matches skill`);
    assert.ok(THINKING_TYPES[p.type], `${p.id} type`);
    assert.ok(p.title);
    assert.ok(p.scenario.explorer && p.scenario.analyst, `${p.id} scenario needs both bands`);
    for (const k of ['question', 'explainPrompt', 'referenceAnswer']) assert.ok(both(p[k]), `${p.id} ${k}`);
    for (const band of ['explorer', 'analyst']) {
      const list = Array.isArray(p.checklist) ? p.checklist : p.checklist[band];
      assert.ok(Array.isArray(list) && list.length > 0, `${p.id} checklist ${band}`);
    }
    if (p.visual) {
      const vs = p.visual.kind ? [p.visual] : [p.visual.explorer, p.visual.analyst];
      for (const v of vs) assert.ok(KINDS.includes(v.kind), `${p.id} visual kind`);
    }
  }
  assert.ok(promptById(THINKING_PROMPTS[0].id));
  assert.equal(promptById('nope'), null);
});

test('thinking prompts: exactly one correct choice unless openChoice; feedback everywhere', () => {
  for (const p of THINKING_PROMPTS) {
    assert.ok(Array.isArray(p.choices) && p.choices.length >= 2, `${p.id} choices`);
    const cids = new Set(p.choices.map((c) => c.id));
    assert.equal(cids.size, p.choices.length, `${p.id} choice ids unique`);
    for (const c of p.choices) { assert.ok(both(c.text), `${p.id}/${c.id} text`); assert.ok(both(c.feedback), `${p.id}/${c.id} feedback`); }
    const correct = p.choices.filter((c) => c.correct).length;
    if (p.openChoice) assert.equal(correct, 0, `${p.id} openChoice must not mark a correct choice`);
    else assert.equal(correct, 1, `${p.id} needs exactly one correct choice`);
  }
});

test('thinking prompts: required coverage', () => {
  const types = new Set(THINKING_PROMPTS.map((p) => p.type));
  for (const t of Object.keys(THINKING_TYPES)) assert.ok(types.has(t), `missing type ${t}`);
  assert.ok(THINKING_PROMPTS.filter((p) => p.type === 'mistake-detective').length >= 3);
  assert.ok(THINKING_PROMPTS.some((p) => p.world === 1) && THINKING_PROMPTS.some((p) => p.world === 2));
  assert.ok(THINKING_PROMPTS.some((p) => p.openChoice));
});

test('thinking prompts: every [[term]] tap-a-word markup resolves in the glossary', async () => {
  const { termById } = await import('../../js/content/glossary.js');
  const text = JSON.stringify(THINKING_PROMPTS);
  const ids = [...text.matchAll(/\[\[([^\]|]+?)(?:\|[^\]]+)?\]\]/g)].map((m) => m[1].trim());
  assert.ok(ids.length > 0);
  for (const id of ids) assert.ok(termById(id), `unknown glossary term ${id}`);
});

test('chart accessible names include the date range and the up/down count', () => {
  const line = describeLine({ title: 'P', unit: '$', points: [{ label: 'Start', value: 2 }, { label: 'D1', value: 2.5 }, { label: 'D2', value: 2.5 }, { label: 'D3', value: 2.1 }] });
  assert.ok(line.includes("from Start ($2.00) to D3 ($2.10)"), line);
  assert.match(line, /1 rise, 1 fall, 1 no change/);
  const c = describeCandles({ title: 'C', unit: '$', candles: [{ label: 'D1', open: 1, high: 2, low: 0.5, close: 1.5 }, { label: 'D2', open: 1.5, high: 1.6, low: 1, close: 1.1 }, { label: 'D3', open: 1.1, high: 1.2, low: 1, close: 1.1 }] });
  assert.match(c, /3 candles from D1 to D3: 1 up, 1 down, 1 flat/);
  assert.ok(c.includes("Highest $2.00, lowest $0.50"), c);
  assert.match(describeCandles({ candles: [{ label: 'D1', open: 1, high: 1, low: 1, close: 1 }] }), /1 candle for D1/);
  assert.deepEqual(stepCounts([1, 2, 2, 1, 3]), { ups: 2, downs: 1, flats: 1 });
});

// ------------------------------------------------------------ batch 2 prompts (w2l2–w2l4, w4l1–w4l4)

const BATCH2 = ['tl-w2-handshake-vs-exchange', 'tl-w2-mistake-priya-trust', 'tl-w2-missing-handshake', 'tl-w2-hedger-or-speculator',
  'tl-w2-mistake-dev-hedge', 'tl-w2-speculator-risk', 'tl-w2-close-out', 'tl-w2-mistake-kai-offset', 'tl-w4-read-line',
  'tl-w4-missing-why-line', 'tl-w4-read-candle', 'tl-w4-mistake-ana-candle', 'tl-w4-long-short-who', 'tl-w4-mistake-rio-short',
  'tl-w4-streak-next', 'tl-w4-missing-chart-news'];

test('batch 2 thinking prompts: coverage of every new lesson, detectives, missing info, chart visuals', () => {
  const ps = BATCH2.map((id) => promptById(id));
  ps.forEach((p, i) => assert.ok(p, `missing prompt ${BATCH2[i]}`));
  assert.ok(ps.length >= 12);
  for (const l of ['w2l2', 'w2l3', 'w2l4', 'w4l1', 'w4l2', 'w4l3', 'w4l4']) assert.ok(ps.some((p) => p.lesson === l), `no prompt for ${l}`);
  assert.ok(ps.filter((p) => p.type === 'mistake-detective').length >= 4);
  assert.ok(ps.filter((p) => p.type === 'missing-info').length >= 2);
  assert.ok(ps.some((p) => p.visual?.kind === 'line') && ps.some((p) => p.visual?.kind === 'candles'));
  for (const p of ps) {
    if (p.visual?.kind === 'candles') for (const c of p.visual.candles) {
      assert.ok(c.high >= Math.max(c.open, c.close) && c.low <= Math.min(c.open, c.close), `${p.id} candle ${c.label}`);
    }
  }
});

test('thinking prompts never promise a price move or reward profit', () => {
  const text = JSON.stringify(THINKING_PROMPTS).toLowerCase();
  for (const bad of ['guaranteed profit', 'can’t lose money', 'easy money', 'get rich']) assert.ok(!text.includes(bad), bad);
  // Correct answers about the next price must be the uncertain one.
  const streak = promptById('tl-w4-streak-next');
  const right = streak.choices.find((c) => c.correct);
  assert.match(JSON.stringify(right.text), /can’t be sure|Nobody can know/);
});
