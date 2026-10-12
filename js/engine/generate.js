// Question generation: picks a template for the skill/band/difficulty, builds a Question object
// (see docs/ARCHITECTURE.md), validates it, and retries to avoid repeated keys.
import { SKILLS } from '../content/skills.js';
import { pick as pickBand } from '../content/band.js';
import { makeRng, shuffle } from './rng.js';
import { money } from './format.js';
import { MISCONCEPTIONS } from './misconceptions.js';
import { makeCtx } from './generators/pools.js';
import { MARKET_TEMPLATES, MARKET_TEACH } from './generators/market.js';
import { PRICE_TEMPLATES, PRICE_TEACH } from './generators/prices.js';
import { SUPPLY_TEMPLATES, SUPPLY_TEACH } from './generators/supply.js';
import { FUTURES_TEMPLATES, FUTURES_TEACH } from './generators/futures.js';
import { FUTURES2_TEMPLATES, FUTURES2_TEACH } from './generators/futures2.js';
import { CHART_TEMPLATES, CHART_TEACH } from './generators/charts.js';

export const DIFFICULTIES = ['easy', 'medium', 'challenge'];
const TEMPLATES = [...MARKET_TEMPLATES, ...PRICE_TEMPLATES, ...SUPPLY_TEMPLATES, ...FUTURES_TEMPLATES, ...FUTURES2_TEMPLATES, ...CHART_TEMPLATES];
const TEACH = { ...MARKET_TEACH, ...PRICE_TEACH, ...SUPPLY_TEACH, ...FUTURES_TEACH, ...FUTURES2_TEACH, ...CHART_TEACH };
const BY_SKILL = {};
for (const t of TEMPLATES) (BY_SKILL[t.skill] ||= []).push(t);

const normBand = (b) => (b === 'analyst' ? 'analyst' : 'explorer');
const normDiff = (d) => (DIFFICULTIES.includes(d) ? d : 'easy');

function eligible(skillId, band, difficulty) {
  return (BY_SKILL[skillId] || []).filter((t) => (!t.bands || t.bands.includes(band)) && (!t.diffs || t.diffs.includes(difficulty)));
}

/** Public template metadata for a skill (optionally only those usable for a band/difficulty). */
export function templatesFor(skillId, { band, difficulty } = {}) {
  return (BY_SKILL[skillId] || [])
    .filter((t) => (!band || !t.bands || t.bands.includes(band)) && (!difficulty || !t.diffs || t.diffs.includes(difficulty)))
    .map((t) => ({ id: t.id, skill: t.skill, kind: t.kind, type: t.type, targets: t.targets.slice(), bands: t.bands ? t.bands.slice() : ['explorer', 'analyst'], difficulties: t.diffs ? t.diffs.slice() : DIFFICULTIES.slice() }));
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Text forms a numeric answer could take ("3", "3.50", "1,750", "1,750.00"). */
export function answerTokens(answer) {
  const a = Math.abs(answer);
  const cents = Math.round(a * 100);
  const toks = new Set([String(a), a.toFixed(2), money(cents).slice(1), money(cents, { decimals: true }).slice(1)]);
  return [...toks];
}

/** True if text contains the numeric answer as a standalone number. */
export function containsAnswer(text, answer) {
  return answerTokens(answer).some((tok) => new RegExp(`(?<![\\d.,])${esc(tok)}(?!\\d|[.,]\\d)`).test(text));
}

function buildChoices(rng, correct, wrongs) {
  const all = shuffle(rng, [{ text: correct, ok: true }, ...wrongs.map(([text, mis]) => ({ text, mis }))]);
  const ids = 'abcdefgh';
  let answer = null;
  const choices = all.map((x, i) => {
    const ch = { id: ids[i], text: x.text };
    if (x.mis) ch.misconception = x.mis;
    if (x.ok) answer = ch.id;
    return ch;
  });
  return { choices, answer };
}

function buildMatch(rng, pairs) {
  const order = shuffle(rng, pairs.map((p, i) => i));
  const rightOrder = shuffle(rng, pairs.map((p, i) => i));
  const left = order.map((pi, k) => ({ id: `L${k + 1}`, text: pairs[pi][0], pi }));
  const right = rightOrder.map((pi, k) => ({ id: `R${k + 1}`, text: pairs[pi][1], pi }));
  const answer = {};
  for (const l of left) answer[l.id] = right.find((r) => r.pi === l.pi).id;
  return { pairs: { left: left.map(({ id, text }) => ({ id, text })), right: right.map(({ id, text }) => ({ id, text })) }, answer };
}

function assemble(tpl, c, out) {
  if (!out || out.invalid) return null;
  const q = {
    key: `${tpl.id}|${c.band}|${out.sig}`,
    skill: tpl.skill, difficulty: c.difficulty, band: c.band, template: tpl.id, kind: out.kind || tpl.kind, type: tpl.type,
    prompt: out.prompt
  };
  if (out.visual) q.visual = out.visual;
  const misIds = new Set();
  if (tpl.type === 'choice' || tpl.type === 'fill') {
    const { choices, answer } = buildChoices(c.rng, out.correct, out.wrongs);
    const texts = choices.map((x) => x.text.trim().toLowerCase());
    if (choices.length < 2 || new Set(texts).size !== texts.length) return null;
    q.choices = choices; q.answer = answer;
    if (tpl.type === 'fill') q.sentence = out.sentence;
    for (const ch of choices) if (ch.misconception) misIds.add(ch.misconception);
  } else if (tpl.type === 'match') {
    const m = buildMatch(c.rng, out.pairs);
    const L = m.pairs.left.map((x) => x.text), R = m.pairs.right.map((x) => x.text);
    if (new Set(L).size !== L.length || new Set(R).size !== R.length) return null;
    q.pairs = m.pairs; q.answer = m.answer;
    q.matchMisconception = tpl.targets[0];
    misIds.add(tpl.targets[0]);
  } else if (tpl.type === 'number') {
    if (!Number.isFinite(out.answer)) return null;
    q.answer = Math.round(out.answer * 100) / 100;
    if (out.prefix) q.prefix = out.prefix;
    if (out.unit) q.unit = out.unit;
    q.tolerance = out.tolerance ?? 0.005;
    const errs = [];
    for (const [value, mis] of out.errors || []) {
      if (!Number.isFinite(value)) continue;
      const v = Math.round(value * 100) / 100;
      if (Math.abs(v - q.answer) <= q.tolerance + 1e-9) continue;
      if (errs.some((e) => Math.abs(e.value - v) < 1e-9)) continue;
      errs.push({ value: v, misconception: mis });
      misIds.add(mis);
    }
    q.commonErrors = errs;
    if (out.data) q.data = out.data;
    for (const h of out.hints) if (containsAnswer(h, q.answer)) return null;
  }
  q.hints = out.hints.slice();
  if (q.hints.length < 2) return null;
  q.explanation = out.explanation;
  q.teach = out.teach || pickBand(TEACH[tpl.skill], c.band);
  if (misIds.size) {
    q.misconceptions = {};
    for (const id of misIds) q.misconceptions[id] = out.misText?.[id] || MISCONCEPTIONS[id] || 'Not quite — reread the question and check each detail.';
  }
  return q;
}

/**
 * generateQuestion(skillId, { band, difficulty, rng|seed, avoid: Set<key>|key[], focus: misconceptionId, lastTemplate })
 * `focus` prefers templates that target that misunderstanding (Practice My Misses).
 */
export function generateQuestion(skillId, opts = {}) {
  if (!SKILLS[skillId] || !BY_SKILL[skillId]) throw new Error(`Unknown skill: ${skillId}`);
  const band = normBand(opts.band), difficulty = normDiff(opts.difficulty);
  const rng = makeRng(opts.rng ?? opts.seed);
  const avoid = opts.avoid instanceof Set ? opts.avoid : new Set(opts.avoid || []);
  const pool = eligible(skillId, band, difficulty);
  const focused = opts.focus ? pool.filter((t) => t.targets.includes(opts.focus)) : [];
  let fallback = null;
  for (let attempt = 0; attempt < 80; attempt++) {
    let use = focused.length && attempt < 50 && rng() < 0.85 ? focused : pool;
    if (opts.lastTemplate && attempt < 20 && use.length > 1) use = use.filter((t) => t.id !== opts.lastTemplate);
    const tpl = use[Math.floor(rng() * use.length)];
    const c = makeCtx(band, difficulty, rng, opts.focus || null);
    const q = assemble(tpl, c, tpl.make(c));
    if (!q) continue;
    fallback ||= q;
    if (!avoid.has(q.key)) return q;
  }
  if (!fallback) throw new Error(`Could not generate a question for ${skillId}`);
  return fallback;
}
