// Content integrity checks (Agent 1). Pure data checks; no DOM.
import test from 'node:test';
import assert from 'node:assert/strict';
import { LESSONS, lessonById } from '../../js/content/lessons.js';
import { GLOSSARY, termById } from '../../js/content/glossary.js';
import { WORLDS } from '../../js/content/worlds.js';
import { STORIES } from '../../js/content/stories.js';
import { SKILLS } from '../../js/content/skills.js';

const STEP_ORDER = ['discover', 'definition', 'visual', 'together', 'check', 'next'];
const VISUAL_KINDS = new Set(['line', 'bars', 'candles', 'priceTags', 'supplyDemand', 'agreement', 'image']);
const BANDS = ['explorer', 'analyst'];
const ready = LESSONS.filter((l) => l.status === 'ready');

const isBandObj = (v) => v && typeof v === 'object' && !Array.isArray(v) && ('explorer' in v || 'analyst' in v);
/** Expand a BandValue into [[band, value], …] (shared values appear for both bands). */
const bands = (v) => (isBandObj(v) ? BANDS.map((b) => [b, v[b]]) : BANDS.map((b) => [b, v]));

/** Walk any value, calling fn(value, path) on every node. */
function walk(v, fn, path = '') {
  fn(v, path);
  if (Array.isArray(v)) v.forEach((x, i) => walk(x, fn, `${path}[${i}]`));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, fn, `${path}.${k}`);
}
const allStrings = (v) => { const out = []; walk(v, (x, p) => { if (typeof x === 'string') out.push([x, p]); }); return out; };

function checkQuestion(q, where) {
  assert.ok(q && typeof q === 'object', `${where}: question missing`);
  for (const f of ['key', 'skill', 'difficulty', 'band', 'template', 'kind', 'type', 'prompt', 'explanation', 'teach']) {
    assert.ok(q[f] != null && q[f] !== '', `${where}: missing ${f}`);
  }
  assert.equal(q.type, 'choice', `${where}: type`);
  assert.ok(SKILLS[q.skill], `${where}: unknown skill ${q.skill}`);
  assert.ok(['easy', 'medium', 'challenge'].includes(q.difficulty), `${where}: difficulty`);
  assert.ok(Array.isArray(q.choices) && q.choices.length >= 2, `${where}: choices`);
  const ids = q.choices.map((c) => c.id);
  const texts = q.choices.map((c) => c.text.trim().toLowerCase());
  assert.equal(new Set(ids).size, ids.length, `${where}: duplicate choice ids`);
  assert.equal(new Set(texts).size, texts.length, `${where}: duplicate choice texts`);
  assert.ok(ids.includes(q.answer), `${where}: answer ${q.answer} not a choice`);
  const right = q.choices.find((c) => c.id === q.answer);
  assert.ok(!right.misconception, `${where}: correct choice must not carry a misconception`);
  for (const c of q.choices) {
    if (c.id === q.answer) continue;
    assert.ok(c.misconception, `${where}: wrong choice ${c.id} needs a misconception id`);
    assert.ok(q.misconceptions && q.misconceptions[c.misconception], `${where}: misconception ${c.misconception} has no message`);
  }
  assert.ok(Array.isArray(q.hints) && q.hints.length >= 2, `${where}: needs ≥2 hints`);
  const answerText = right.text.trim().toLowerCase();
  for (const h of q.hints) assert.ok(!h.toLowerCase().includes(answerText), `${where}: hint gives the answer away`);
  if (q.visual) assert.ok(VISUAL_KINDS.has(q.visual.kind), `${where}: visual kind`);
}

test('lesson ids are unique and lessonById works', () => {
  const ids = LESSONS.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const l of LESSONS) assert.equal(lessonById(l.id), l);
  assert.equal(lessonById('nope'), null);
});

test('batch 1 + batch 2 lessons are ready; the rest are planned with no steps', () => {
  assert.deepEqual(ready.map((l) => l.id), ['w1l1', 'w1l2', 'w1l3', 'w2l1', 'w2l2', 'w2l3', 'w2l4', 'w4l1', 'w4l2', 'w4l3', 'w4l4']);
  for (const l of LESSONS.filter((x) => x.status !== 'ready')) {
    assert.equal(l.status, 'planned', l.id);
    assert.deepEqual(l.steps, [], l.id);
    assert.deepEqual(l.skills, [], l.id);
  }
});

test('ready lessons have the six steps in the required order and required fields', () => {
  for (const l of ready) {
    assert.deepEqual(l.steps.map((s) => s.kind), STEP_ORDER, l.id);
    for (const f of ['title', 'objectives', 'minutes', 'vocab', 'prereqs', 'skills']) assert.ok(l[f] != null, `${l.id}.${f}`);
    for (const [b, objs] of bands(l.objectives)) assert.ok(Array.isArray(objs) && objs.length, `${l.id} objectives ${b}`);
    for (const [b, m] of bands(l.minutes)) assert.ok(Number.isFinite(m) && m > 0, `${l.id} minutes ${b}`);
    const [disc, def, vis, tog, chk, nxt] = l.steps;
    for (const s of l.steps) assert.ok(s.title, `${l.id} ${s.kind} title`);
    assert.match(disc.image.asset, /^assets\/illustrations\/[a-z0-9-]+\.webp$/, `${l.id} image`);
    assert.ok(disc.image.alt && disc.image.caption, `${l.id} image alt/caption`);
    assert.ok(termById(def.term), `${l.id} definition term ${def.term}`);
    for (const [b, k] of bands(def.keyIdea)) assert.ok(typeof k === 'string' && k, `${l.id} keyIdea ${b}`);
    for (const [b, v] of bands(vis.visual)) assert.ok(VISUAL_KINDS.has(v.kind), `${l.id} visual ${b}`);
    for (const [b, c] of bands(vis.caption)) assert.ok(typeof c === 'string' && c, `${l.id} caption ${b}`);
    if (tog.visual) for (const [b, v] of bands(tog.visual)) assert.ok(VISUAL_KINDS.has(v.kind), `${l.id} together visual ${b}`);
    for (const [b, q] of bands(chk.question)) {
      checkQuestion(q, `${l.id} check ${b}`);
      assert.equal(q.template, 'lesson-check');
      assert.equal(q.band, b, `${l.id} check band`);
      assert.ok(l.skills.includes(q.skill), `${l.id} check skill belongs to lesson`);
    }
    for (const [b, t] of bands(nxt.text)) assert.ok(typeof t === 'string' && t, `${l.id} next ${b}`);
    for (const s of nxt.practiceSkills) assert.ok(SKILLS[s], `${l.id} practice skill ${s}`);
  }
});

/** Rough sentence count: ignores tap-a-word markup and title abbreviations (Mr., Ms.). */
const sentenceCount = (p) => p.replace(/\[\[[^\]]*\]\]/g, 'x').replace(/\b(Mr|Ms|Mrs|Dr)\./g, '$1')
  .split(/[.!?]+["”]?\s+(?=[A-Z"“])/).length;

test('text BandValues are string arrays per band; explorer paragraphs stay short', () => {
  const sources = [
    ...ready.flatMap((l) => l.steps.filter((x) => ['discover', 'definition', 'visual'].includes(x.kind)).map((s) => [`${l.id} ${s.kind}`, s.text])),
    ...STORIES.map((s) => [`story ${s.id}`, s.text])
  ];
  for (const [where, text] of sources) {
    for (const [b, paras] of bands(text)) {
      assert.ok(Array.isArray(paras) && paras.length >= 1, `${where} ${b}`);
      if (b === 'explorer') {
        assert.ok(paras.length <= 4, `${where} explorer has >4 paragraphs`);
        for (const p of paras) assert.ok(sentenceCount(p) <= 3, `${where} explorer paragraph too long: ${p}`);
      }
    }
  }
});

test('every band object has both bands', () => {
  const targets = [['lessons', LESSONS], ['glossary', GLOSSARY], ['worlds', WORLDS], ['stories', STORIES]];
  for (const [name, data] of targets) {
    walk(data, (v, p) => {
      if (isBandObj(v)) {
        assert.ok(v.explorer != null && v.analyst != null, `${name}${p} missing a band`);
      }
    });
  }
});

test('together steps: 2–3 prompts, exactly one correct choice, every choice coached', () => {
  for (const l of ready) {
    const tog = l.steps[3];
    for (const [b, steps] of bands(tog.steps)) {
      assert.ok(steps.length >= 2 && steps.length <= 3, `${l.id} ${b} together count`);
      for (const [i, st] of steps.entries()) {
        assert.ok(st.prompt, `${l.id} ${b} #${i} prompt`);
        assert.equal(st.choices.filter((c) => c.correct === true).length, 1, `${l.id} ${b} #${i} one correct`);
        const ids = st.choices.map((c) => c.id);
        assert.equal(new Set(ids).size, ids.length, `${l.id} ${b} #${i} unique ids`);
        for (const c of st.choices) {
          assert.equal(typeof c.correct, 'boolean');
          assert.ok(c.coach && c.coach.length > 10, `${l.id} ${b} #${i} coach for ${c.id}`);
          if (!c.correct) assert.ok(!/^(wrong|no|incorrect)[.!]?$/i.test(c.coach.trim()), 'coach must explain');
        }
      }
    }
  }
});

test('skill and prereq ids exist', () => {
  for (const l of LESSONS) {
    for (const s of [...l.skills, ...(l.prereqs || [])]) assert.ok(SKILLS[s], `${l.id}: unknown skill ${s}`);
  }
  for (const s of STORIES) for (const q of s.questions) assert.ok(SKILLS[q.skill], `${s.id}: ${q.skill}`);
  // every v1 skill is taught by a ready lesson
  const taught = new Set(ready.flatMap((l) => l.skills));
  for (const id of Object.keys(SKILLS)) assert.ok(taught.has(id), `skill ${id} not taught`);
});

test('glossary: unique ids, required fields, vocab lists resolve, ≥35 terms', () => {
  assert.ok(GLOSSARY.length >= 35, `only ${GLOSSARY.length} terms`);
  const ids = GLOSSARY.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const t of GLOSSARY) {
    for (const f of ['id', 'term', 'say', 'world', 'def', 'example']) assert.ok(t[f], `${t.id}.${f}`);
    assert.ok(t.world >= 1 && t.world <= 6);
    if (t.visual) assert.ok(VISUAL_KINDS.has(t.visual.kind), `${t.id} visual`);
  }
  for (const l of LESSONS) for (const v of l.vocab || []) assert.ok(termById(v), `${l.id} vocab ${v}`);
  for (const id of ['commodity', 'futures-contract', 'forward-agreement', 'exchange', 'hedging', 'price-risk', 'contract-size', 'tick', 'long', 'short', 'margin', 'leverage', 'candlestick', 'ohlc', 'stock', 'stock-index', 'stop-order', 'uncertainty', 'risk', 'reward']) {
    assert.ok(termById(id), `core term ${id}`);
  }
});

test('every [[id]] tap-a-word markup resolves in the glossary', () => {
  const bad = [];
  for (const [name, data] of [['lessons', LESSONS], ['stories', STORIES], ['glossary', GLOSSARY], ['worlds', WORLDS]]) {
    for (const [s, p] of allStrings(data)) {
      for (const m of s.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) if (!termById(m[1])) bad.push(`${name}${p}: ${m[1]}`);
      const opens = (s.match(/\[\[/g) || []).length, closes = (s.match(/\]\]/g) || []).length;
      if (opens !== closes) bad.push(`${name}${p}: unbalanced markup`);
    }
  }
  assert.deepEqual(bad, []);
});

test('worlds: six, ordered, statuses match lesson readiness, lessons exist', () => {
  assert.equal(WORLDS.length, 6);
  WORLDS.forEach((w, i) => {
    assert.equal(w.number, i + 1);
    assert.equal(w.id, `world-${i + 1}`);
    assert.ok(w.title && w.tagline && w.summary);
    for (const id of w.lessons) {
      const l = lessonById(id);
      assert.ok(l, `${w.id}: missing lesson ${id}`);
      assert.equal(l.world, w.number, `${id} world`);
    }
    const states = w.lessons.map((id) => lessonById(id).status);
    const expected = states.every((s) => s === 'ready') ? 'ready' : states.some((s) => s === 'ready') ? 'partial' : 'planned';
    assert.equal(w.status, expected, `${w.id} status`);
  });
  // every lesson belongs to exactly one world
  const listed = WORLDS.flatMap((w) => w.lessons);
  assert.deepEqual([...listed].sort(), LESSONS.map((l) => l.id).sort());
});

test('stories: 6 stories, 3 valid questions each, unique keys', () => {
  assert.equal(STORIES.length, 6);
  const keys = new Set();
  for (const s of STORIES) {
    assert.ok(lessonById(s.lesson), `${s.id} lesson`);
    assert.ok([1, 2, 4].includes(s.world), `${s.id} world`);
    assert.equal(lessonById(s.lesson).world, s.world, `${s.id} lesson world`);
    assert.equal(lessonById(s.lesson).status, 'ready', `${s.id} lesson ready`);
    assert.match(s.image.asset, /^assets\/illustrations\/[a-z0-9-]+\.webp$/);
    assert.ok(s.image.alt && s.image.caption);
    for (const [b, paras] of bands(s.text)) assert.ok(Array.isArray(paras) && paras.length, `${s.id} text ${b}`);
    assert.equal(s.questions.length, 3, s.id);
    for (const q of s.questions) { checkQuestion(q, `${s.id} ${q.key}`); assert.ok(!keys.has(q.key)); keys.add(q.key); }
  }
});

test('no "Baze" branding and no profit promises anywhere in content', () => {
  for (const [name, data] of [['lessons', LESSONS], ['glossary', GLOSSARY], ['worlds', WORLDS], ['stories', STORIES], ['skills', SKILLS]]) {
    for (const [s, p] of allStrings(data)) {
      assert.ok(!/baze/i.test(s), `${name}${p} mentions Baze`);
      assert.ok(!/guaranteed (profit|gains?|returns?)|risk[- ]free|get rich/i.test(s) || /(no|not|never|cannot|can't|doesn't|does not)\b[^.]*guarantee/i.test(s), `${name}${p}: profit promise? ${s}`);
      assert.ok(!/\bRSI\b/.test(s), `${name}${p} mentions RSI`);
    }
  }
});

test('margin is never described as the maximum loss; stop orders never promise a price', () => {
  const margin = termById('margin');
  for (const [, d] of bands(margin.def)) assert.match(d, /NOT the most/i);
  const stop = termById('stop-order');
  for (const [, d] of bands(stop.def)) assert.match(d, /worse|not a guaranteed/i);
});
