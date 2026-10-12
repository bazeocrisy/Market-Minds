// Tests: balanced across skills, mixed difficulty, NO hints/feedback/explanations before submit.
// Results are recorded as independent evidence (+ misses + a tests history entry).
import { SKILLS, SKILL_IDS } from '../content/skills.js';
import { makeRng, shuffle } from './rng.js';
import { generateQuestion, DIFFICULTIES } from './generate.js';
import { checkResponse, answerText } from './check.js';
import { recordIndependent } from './record.js';

const LAST_KEYS = new Map();   // `${band}|${scope}` → keys of the previous test (so a retake differs)

/**
 * Skill ids for a scope: lesson id ('w1l1'), 'world-1', 'all', or { skills: [...] }. The mapping comes from the
 * skills.js `world` / `lesson` fields. Optional `readySkills` (array) intersects the result — the UI passes the
 * skills whose lessons are ready, so a world test never includes planned lessons. Default behaviour unchanged.
 */
export function scopeSkills(scope, readySkills) {
  let out;
  if (scope && typeof scope === 'object' && Array.isArray(scope.skills)) out = scope.skills.filter((id) => SKILLS[id]);
  else if (!scope || scope === 'all') out = SKILL_IDS.slice();
  else {
    const w = /^world-(\d+)$/.exec(scope);
    out = w ? SKILL_IDS.filter((id) => SKILLS[id].world === Number(w[1])) : SKILL_IDS.filter((id) => SKILLS[id].lesson === scope);
  }
  if (Array.isArray(readySkills)) { const r = new Set(readySkills); out = out.filter((id) => r.has(id)); }
  return out;
}

/** A copy safe to show before submit: no answer, hints, explanation, teach, misconception tags. */
export function publicQuestion(q) {
  const p = { key: q.key, skill: q.skill, difficulty: q.difficulty, band: q.band, template: q.template, kind: q.kind, type: q.type, prompt: q.prompt, hints: [] };
  if (q.visual) p.visual = q.visual;
  if (q.choices) p.choices = q.choices.map(({ id, text }) => ({ id, text }));
  if (q.sentence) p.sentence = q.sentence;
  if (q.pairs) p.pairs = { left: q.pairs.left.map((x) => ({ ...x })), right: q.pairs.right.map((x) => ({ ...x })) };
  if (q.prefix) p.prefix = q.prefix;
  if (q.unit) p.unit = q.unit;
  return p;
}

export function createTest(opts = {}, store = null) {
  const band = opts.band === 'analyst' ? 'analyst' : 'explorer';
  const scope = opts.scope ?? 'all';
  const skills = scopeSkills(scope, opts.readySkills);
  if (!skills.length) throw new Error(`No skills for test scope ${JSON.stringify(scope)}`);
  const length = Number.isFinite(opts.length) && opts.length > 0 ? Math.floor(opts.length) : 8;
  const R = makeRng(opts.rng ?? opts.seed);
  const clock = typeof opts.now === 'function' ? opts.now : Date.now;
  const scopeKey = typeof scope === 'string' ? scope : `skills:${skills.join(',')}`;
  const memKey = `${band}|${scopeKey}`;
  const avoid = new Set([...(opts.avoid || []), ...(LAST_KEYS.get(memKey) || [])]);

  // Balanced: every skill appears ⌊length/n⌋ or ⌈length/n⌉ times. Mixed difficulty: cycle easy/medium/challenge.
  const order = shuffle(R, skills);
  const plan = Array.from({ length }, (_, i) => order[i % order.length]);
  const diffs = shuffle(R, Array.from({ length }, (_, i) => DIFFICULTIES[i % 3]));
  const lastTpl = {};
  const questions = shuffle(R, plan.map((skill, i) => ({ skill, diff: diffs[i] }))).map(({ skill, diff }) => {
    const q = generateQuestion(skill, { band, difficulty: diff, rng: R, avoid, lastTemplate: lastTpl[skill] });
    avoid.add(q.key); lastTpl[skill] = q.template;
    return q;
  });
  LAST_KEYS.set(memKey, questions.map((q) => q.key));

  const id = `t${clock().toString(36)}${Math.floor(R() * 1e6).toString(36)}`;
  const items = questions.map((q, i) => ({ index: i, skill: q.skill, question: publicQuestion(q), response: null }));
  let results = null;

  return {
    id, band, scope: scopeKey, skills, items, length,
    keys: questions.map((q) => q.key),
    get submitted() { return !!results; },
    answeredCount() { return items.filter((it) => it.response != null && it.response !== '').length; },
    answer(i, response) {
      if (results || !Number.isInteger(i) || i < 0 || i >= items.length) return false;
      items[i].response = response;
      return true;
    },
    submit() {
      if (results) return results;
      const now = clock();
      const bySkill = {};
      const out = questions.map((q, i) => {
        const response = items[i].response;
        const r = checkResponse(q, response);
        const b = (bySkill[q.skill] ||= { correct: 0, total: 0 });
        b.total++; if (r.correct) b.correct++;
        return {
          question: q, response, correct: r.correct, answerText: answerText(q), explanation: q.explanation,
          misconception: r.correct ? null : r.misconception, misconceptionFeedback: r.correct ? null : r.feedback
        };
      });
      const score = out.filter((x) => x.correct).length, total = out.length;
      results = { id, scope: scopeKey, band, score, total, percent: Math.round((score / total) * 100), bySkill, items: out };
      if (store) {
        store.update((d) => {
          for (const x of out) recordIndependent(d, x.question.skill, x.correct, x.misconception, now);
          d.tests.push({ id, scope: scopeKey, band, date: now, score, total, bySkill: JSON.parse(JSON.stringify(bySkill)) });
        });
      }
      return results;
    }
  };
}

/** For tests/diagnostics: forget remembered retake keys. */
export function _resetTestMemory() { LAST_KEYS.clear(); }
