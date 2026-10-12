import test from 'node:test';
import assert from 'node:assert/strict';
import { generateQuestion, templatesFor, DIFFICULTIES, mulberry32 } from '../../js/engine/index.js';
import { SKILL_IDS } from '../../js/content/skills.js';

const BANDS = ['explorer', 'analyst'];
const NON_MONEY = ['qty', 'months', 'values', 'i', 'j', 'size', 'need', 'side', 'signed', 'field'];
const NEW_SKILLS = ['futures-standardization', 'hedgers-speculators', 'offset-delivery', 'line-chart-reading', 'candlestick-reading', 'long-short', 'chart-limits'];
const r2 = (x) => Math.round(x * 100) / 100;
const same = (a, b) => Math.abs(r2(a) - r2(b)) < 1e-9;

// Every generated question, every skill × band × difficulty (seeded, so failures are reproducible).
const ALL = [];
for (const skill of SKILL_IDS) for (const band of BANDS) for (const difficulty of DIFFICULTIES) {
  const rng = mulberry32(SKILL_IDS.indexOf(skill) * 1000 + BANDS.indexOf(band) * 100 + DIFFICULTIES.indexOf(difficulty) + 1);
  for (let i = 0; i < 40; i++) ALL.push(generateQuestion(skill, { band, difficulty, rng }));
}

/** Independent re-computation of each math template's answer from its inputs. */
function expected(q) {
  const d = q.data;
  switch (q.template) {
    case 'pcm-rise': return 'first' in d ? d.now - d.first : d.new - d.old;
    case 'pcm-drop': return q.answer < 0 ? d.new - d.old : d.old - d.new;
    case 'pcm-total': return 'change' in d ? d.change * d.qty : Math.abs(d.new - d.old) * d.qty;
    case 'pcm-percent': return Math.round((Math.abs(d.new - d.old) / d.old) * 100);
    case 'pcm-chart': return Math.abs(d.to - d.from);
    case 'pcm-bars': return d.more - d.less;
    case 'fa-total': return d.price * d.qty * d.months;
    case 'ho-unit': return Math.abs(d.market - d.agreed);
    case 'ho-total': return Math.abs(d.market - d.agreed) * d.qty;
    case 'fr-range': return (d.high - d.low) * d.qty;
    case 'fr-loss': return d.perUnit * d.qty;
    // batch 2 — World 2 rest
    case 'fs-size': return 'need' in d ? d.need / d.size : d.price * d.size;
    case 'hs-outcome': case 'od-gain': case 'ls-total': case 'ls-unit': {
      const v = (d.close - d.open) * (d.qty ?? 1) * d.side;
      return d.signed ? v : Math.abs(v);
    }
    // World 4: recomputed from the RENDERED chart data, never from generator internals
    case 'lc-read': return q.visual.points[d.i].value;
    case 'lc-change': { const v = q.visual.points[d.j].value - q.visual.points[d.i].value; return d.signed ? v : Math.abs(v); }
    case 'lc-percent': { const a = q.visual.points[d.i].value, b = q.visual.points[d.j].value; return Math.round((Math.round(Math.abs(b - a) * 100) * 100) / Math.round(a * 100)); }
    case 'cs-ohlc': return q.visual.candles[d.i][d.field];
    case 'cs-range': return q.visual.candles[d.i].high - q.visual.candles[d.i].low;
    default: throw new Error(`no formula for ${q.template}`);
  }
}
const fmt = (v, dec) => {
  const c = Math.round(Math.abs(v) * 100), whole = String(Math.floor(c / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return '$' + whole + (dec || c % 100 ? '.' + String(c % 100).padStart(2, '0') : '');
};

test('every skill has at least 6 templates and the question types/kinds span the required set', () => {
  const types = new Set(), kinds = new Set();
  for (const s of SKILL_IDS) {
    const t = templatesFor(s);
    assert.ok(t.length >= 6, `${s} has only ${t.length} templates`);
    for (const d of DIFFICULTIES) for (const b of BANDS) assert.ok(templatesFor(s, { band: b, difficulty: d }).length >= 5, `${s} ${b} ${d}`);
    t.forEach((x) => { types.add(x.type); kinds.add(x.kind); });
  }
  for (const ty of ['choice', 'match', 'fill', 'number']) assert.ok(types.has(ty), ty);
  for (const k of ['vocab', 'visual', 'chart', 'math', 'scenario', 'mistake-detective', 'concept']) assert.ok(kinds.has(k), k);
});

test('every question has the contract fields', () => {
  for (const q of ALL) {
    assert.equal(typeof q.key, 'string');
    assert.ok(q.key.startsWith(q.template + '|'));
    assert.ok(['easy', 'medium', 'challenge'].includes(q.difficulty));
    assert.ok(q.prompt && q.explanation && q.teach, q.key);
    assert.ok(Array.isArray(q.hints) && q.hints.length >= 2, q.key);
    assert.ok(!/undefined|NaN|\[object/.test(q.prompt + q.explanation + q.hints.join(' ') + JSON.stringify(q.choices || q.pairs || '')), `bad text in ${q.key}`);
    assert.ok(!/\d\.\d{3,}/.test(q.prompt + q.explanation), `float junk in ${q.key}: ${q.prompt}`);
    if (q.visual) assert.ok(['line', 'bars', 'candles', 'priceTags', 'supplyDemand', 'agreement'].includes(q.visual.kind), q.key);
  }
});

test('math answers recompute independently, are rounded to cents, and respect band limits', () => {
  const nums = ALL.filter((q) => q.type === 'number');
  assert.ok(nums.length > 150);
  for (const q of nums) {
    assert.ok(same(q.answer, expected(q)), `${q.key}: answer ${q.answer} vs ${expected(q)}`);
    assert.ok(Math.abs(q.answer * 100 - Math.round(q.answer * 100)) < 1e-6, `${q.key} not rounded to cents`);
    // every money input shown in the prompt (or chart)
    const shown = q.prompt + JSON.stringify(q.visual || {});
    for (const [k, v] of Object.entries(q.data)) {
      if (NON_MONEY.includes(k)) continue;
      if (q.visual && ['from', 'to', 'more', 'less'].includes(k)) { assert.ok(shown.includes(String(v)), `${q.key} ${k}`); continue; }
      assert.ok(q.prompt.includes(fmt(v, false)) || q.prompt.includes(fmt(v, true)), `${q.key}: ${k}=${v} not in prompt: ${q.prompt}`);
    }
    if (q.band === 'explorer') {
      assert.ok(Number.isInteger(q.answer), `explorer answer must be whole dollars: ${q.key}`);
      for (const [k, v] of Object.entries(q.data)) if (typeof v === 'number' && !NON_MONEY.includes(k)) assert.ok(Number.isInteger(v), `${q.key} ${k}`);
      if (q.difficulty === 'easy') assert.ok(q.answer <= 20, `easy cap ${q.key} ${q.answer}`);
      if (q.difficulty === 'medium') assert.ok(q.answer <= 100, `medium cap ${q.key} ${q.answer}`);
      const moneyIn = Object.entries(q.data).filter(([k, v]) => typeof v === 'number' && !NON_MONEY.includes(k)).map(([, v]) => v);
      if (q.difficulty === 'easy') assert.ok(moneyIn.every((v) => v <= 20), `easy inputs ${q.key}`);
      if (q.difficulty === 'medium') assert.ok(moneyIn.every((v) => v <= 100), `medium inputs ${q.key}`);
    }
    if (q.unit === '%') assert.match(q.prompt, /nearest whole percent/);
  }
  // analyst uses cents somewhere
  assert.ok(nums.some((q) => q.band === 'analyst' && !Number.isInteger(q.answer)));
  assert.ok(nums.some((q) => q.template === 'pcm-percent'));
  assert.ok(nums.some((q) => q.band === 'analyst' && q.data.qty >= 1000), 'contract-size quantities');
});

test('number hints never contain the numeric answer; common errors differ from the answer', () => {
  for (const q of ALL.filter((x) => x.type === 'number')) {
    const a = Math.abs(q.answer);
    const toks = [String(a), a.toFixed(2), a.toLocaleString('en-US'), a.toLocaleString('en-US', { minimumFractionDigits: 2 })];
    for (const h of q.hints) for (const t of toks) {
      const re = new RegExp(`(?<![\\d.,])${t.replace(/[.$]/g, '\\$&')}(?!\\d|[.,]\\d)`);
      assert.ok(!re.test(h), `${q.key}: hint "${h}" reveals ${t}`);
    }
    for (const e of q.commonErrors) assert.ok(!same(e.value, q.answer), q.key);
  }
});

test('choice/fill questions: exactly one correct id that exists, unique texts, wrong choices tagged', () => {
  const cs = ALL.filter((q) => q.type === 'choice' || q.type === 'fill');
  for (const q of cs) {
    const ids = q.choices.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(ids.filter((id) => id === q.answer).length, 1, q.key);
    const texts = q.choices.map((c) => c.text.toLowerCase());
    assert.equal(new Set(texts).size, texts.length, `${q.key} duplicate texts`);
    for (const c of q.choices) if (c.id !== q.answer) {
      assert.ok(c.misconception, `${q.key}: untagged wrong choice`);
      assert.ok(q.misconceptions[c.misconception], `${q.key}: no text for ${c.misconception}`);
    }
    assert.ok(!q.choices.find((c) => c.id === q.answer).misconception);
    if (q.type === 'fill') assert.ok(q.sentence.includes('___'), q.key);
  }
  assert.ok(cs.some((q) => q.kind === 'mistake-detective' && /Mistake Detective/.test(q.prompt)));
});

test('match answers are a bijection over the given ids', () => {
  const ms = ALL.filter((q) => q.type === 'match');
  assert.ok(ms.length > 20);
  for (const q of ms) {
    const L = q.pairs.left.map((x) => x.id), R = q.pairs.right.map((x) => x.id);
    assert.deepEqual(Object.keys(q.answer).sort(), [...L].sort());
    assert.deepEqual(Object.values(q.answer).sort(), [...R].sort());
    assert.equal(new Set(q.pairs.right.map((x) => x.text)).size, R.length);
  }
});

test('variation: 60 generations per skill + band give ≥ 12 keys and ≥ 4 templates', () => {
  for (const skill of SKILL_IDS) for (const band of BANDS) {
    const rng = mulberry32(42 + SKILL_IDS.indexOf(skill));
    const keys = new Set(), tpls = new Set();
    for (let i = 0; i < 60; i++) { const q = generateQuestion(skill, { band, difficulty: DIFFICULTIES[i % 3], rng }); keys.add(q.key); tpls.add(q.template); }
    assert.ok(keys.size >= 12, `${skill}/${band}: ${keys.size} keys`);
    assert.ok(tpls.size >= 4, `${skill}/${band}: ${tpls.size} templates`);
    // fixed difficulty too
    const k2 = new Set();
    for (let i = 0; i < 60; i++) k2.add(generateQuestion(skill, { band, difficulty: 'easy', rng }).key);
    assert.ok(k2.size >= 12);
  }
});

test('avoid skips used keys; seeds are reproducible; focus prefers matching templates', () => {
  const a = generateQuestion('hedge-outcome', { band: 'explorer', difficulty: 'medium', seed: 7 });
  const b = generateQuestion('hedge-outcome', { band: 'explorer', difficulty: 'medium', seed: 7 });
  assert.deepEqual(a, b);
  const c = generateQuestion('hedge-outcome', { band: 'explorer', difficulty: 'medium', seed: 7, avoid: new Set([a.key]) });
  assert.notEqual(c.key, a.key);
  const rng = mulberry32(9);
  let hits = 0;
  for (let i = 0; i < 40; i++) {
    const q = generateQuestion('price-change-math', { band: 'explorer', difficulty: 'easy', rng, focus: 'per-unit-vs-total' });
    if (templatesFor('price-change-math').find((t) => t.id === q.template).targets.includes('per-unit-vs-total')) hits++;
  }
  assert.ok(hits >= 28, `focus hits ${hits}`);
});

test('hedge-outcome includes outcomes where the agreement turns out worse for a side', () => {
  const rng = mulberry32(5);
  let worse = 0, better = 0;
  for (let i = 0; i < 80; i++) {
    const q = generateQuestion('hedge-outcome', { band: 'analyst', difficulty: 'medium', rng });
    if (/turned out worse/.test(q.explanation)) worse++;
    if (/worked out|came out ahead|did its job/.test(q.explanation)) better++;
  }
  assert.ok(worse > 3 && better > 3, `${worse} / ${better}`);
});

test('batch 2 skills: every new skill has number, choice, match and fill items, a chart/visual item, and a Mistake Detective', () => {
  for (const s of NEW_SKILLS) {
    const qs = ALL.filter((q) => q.skill === s);
    const types = new Set(qs.map((q) => q.type)), kinds = new Set(qs.map((q) => q.kind));
    for (const t of ['choice', 'match', 'fill']) assert.ok(types.has(t), `${s} lacks ${t}`);
    if (s !== 'chart-limits') assert.ok(types.has('number'), `${s} lacks number`);
    assert.ok(kinds.has('mistake-detective') && qs.some((q) => /Mistake Detective/.test(q.prompt)), s);
    assert.ok(kinds.has('chart') || kinds.has('visual'), `${s} lacks a chart/visual item`);
    assert.ok(templatesFor(s).length >= 6, s);
    for (const q of qs) {
      const text = q.prompt + q.explanation + q.hints.join(' ') + JSON.stringify(q.choices || q.pairs || '');
      assert.ok(!/\bin (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/.test(text), `"in <day>" in ${q.key}`);
      assert.ok(!/\b(will|must) (definitely )?(rise|fall|go up|go down)\b/i.test(q.explanation), `prediction framing in ${q.key}`);
    }
  }
});

test('chart answers come from the rendered data; candles are valid; up/down never described by color alone', () => {
  let lines = 0, candles = 0;
  for (const q of ALL) {
    const v = q.visual;
    if (v?.kind === 'line') {
      lines++;
      assert.ok(v.points.length >= 4 && v.points.length <= 8, q.key);
      for (const p of v.points) {
        assert.ok(Number.isFinite(p.value) && p.value > 0, q.key);
        if (q.band === 'explorer') assert.ok(Number.isInteger(p.value), `explorer whole dollars ${q.key}`);
        if (q.band === 'explorer' && q.difficulty === 'easy' && NEW_SKILLS.includes(q.skill)) assert.ok(p.value <= 20, `easy cap ${q.key}`);
      }
      assert.equal(new Set(v.points.map((p) => p.label)).size, v.points.length, `labels unique ${q.key}`);
    }
    if (v?.kind === 'candles') {
      candles++;
      for (const k of v.candles) {
        assert.ok(k.low <= Math.min(k.open, k.close) && Math.max(k.open, k.close) <= k.high, `invalid candle ${q.key}`);
        assert.ok(k.low > 0 && k.open !== k.close, q.key);
        if (q.band === 'explorer') for (const f of ['open', 'high', 'low', 'close']) assert.ok(Number.isInteger(k[f]), q.key);
        if (q.band === 'explorer' && q.difficulty === 'easy') assert.ok(k.high <= 20, `easy cap ${q.key}`);
        if (q.band === 'explorer' && q.difficulty === 'medium') assert.ok(k.high <= 100, `medium cap ${q.key}`);
      }
    }
    if (q.skill === 'candlestick-reading') {
      const text = q.prompt + q.hints.join(' ') + q.explanation + JSON.stringify(q.choices || q.pairs || '');
      assert.ok(!/\b(green|red)\b/i.test(text), `color-only wording in ${q.key}`);
    }
    // chart number questions name the label(s) they ask about
    if (['lc-read', 'lc-change', 'lc-percent'].includes(q.template)) {
      assert.ok(q.prompt.includes(v.points[q.data.i].label), q.key);
      if ('j' in q.data) assert.ok(q.prompt.includes(v.points[q.data.j].label), q.key);
    }
    if (['cs-ohlc', 'cs-range'].includes(q.template)) assert.ok(q.prompt.includes(v.candles[q.data.i].label), q.key);
    // chart choice questions: the correct answer agrees with the rendered data
    if (q.template === 'lc-highlow') {
      const vals = v.points.map((p) => p.value), hi = /HIGHEST/.test(q.prompt);
      const want = v.points[vals.indexOf(hi ? Math.max(...vals) : Math.min(...vals))].label;
      assert.equal(q.choices.find((c) => c.id === q.answer).text, want, q.key);
    }
    if (q.template === 'cs-direction' && v) {
      const lab = /Look at the (.+?) candle/.exec(q.prompt)[1], k = v.candles.find((x) => x.label === lab);
      assert.match(q.choices.find((c) => c.id === q.answer).text, k.close > k.open ? /^An up candle \(hollow body, ▲\)/ : /^A down candle \(filled body, ▼\)/, q.key);
    }
    if (q.template === 'ls-chart') {
      const p = v.points, up = p[p.length - 1].value > p[0].value;
      assert.match(q.choices.find((c) => c.id === q.answer).text, up ? /who was long/ : /who was short/, q.key);
    }
  }
  assert.ok(lines > 100 && candles > 50, `${lines} line / ${candles} candle charts`);
});

test('long/short and offset outcomes have the right sign; analyst uses fictional contract sizes', () => {
  const signedQs = ALL.filter((q) => ['hs-outcome', 'od-gain', 'ls-unit', 'ls-total'].includes(q.template));
  assert.ok(signedQs.some((q) => q.answer < 0) && signedQs.some((q) => q.answer > 0), 'both gains and losses');
  for (const q of signedQs) {
    if (q.data.signed) assert.match(q.prompt, /minus sign/, q.key);
    else assert.ok(q.answer > 0, q.key);
    if (q.band === 'explorer') assert.equal(q.data.signed, 0, q.key);
  }
  assert.ok(signedQs.some((q) => q.band === 'analyst' && q.data.qty >= 1000));
});

test('unknown skill throws', () => {
  assert.throws(() => generateQuestion('nope', {}));
});
