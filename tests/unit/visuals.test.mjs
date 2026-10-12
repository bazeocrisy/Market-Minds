import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatMoney, formatNumber, formatValue, isMoneyUnit, extent, linearScale, niceStep, niceTicks,
  labelStride, supplyDemandPressure, describeLine, describeBars, describeCandles, candleDirection
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
    assert.ok([1, 2].includes(p.world), p.id);
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
