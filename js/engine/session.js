// Practice sessions: coached practice with hints, retries, reveal, and evidence recording.
// Rules: the FIRST submission on a question is the evidence. No hint before it → independent attempt
// (correct or not). Hint(s) before it → assisted attempt. A later retry that becomes correct → assisted correct.
// reveal() → revealed++, no credit, and no credit possible afterwards. A wrong first submission (or a reveal
// before any submission) adds to the miss queue. Never auto-advance after an error.
import { SKILLS, SKILL_IDS } from '../content/skills.js';
import { makeRng, weighted, pick } from './rng.js';
import { generateQuestion, DIFFICULTIES } from './generate.js';
import { checkResponse, answerText } from './check.js';
import { missQueue, topMisconception } from './mastery.js';
import { recordIndependent, recordAssisted, recordReveal, addMiss } from './record.js';

const MODE_ALIAS = { practice: 'rotate', skill: 'rotate', lesson: 'rotate', world: 'random', review: 'review', mixed: 'review', misses: 'misses', warmup: 'warmup' };
const DAY = 86400000;
const PRAISE = ['Correct!', 'Nice work!', 'Yes — that is right!', 'Great thinking!', 'You got it!'];

function reviewWeight(state, id, now) {
  const k = state?.skills?.[id];
  if (!k) return 1;
  const r = k.recent || [];
  const acc = r.length ? r.reduce((s, x) => s + x, 0) / r.length : 0.5;
  const ageDays = k.lastSeen ? Math.min(14, (now - k.lastSeen) / DAY) : 14;
  return 1 + (1 - acc) * 3 + ageDays / 7 + (state.misses?.[id] ? 1 : 0);
}

/**
 * createPracticeSession({ band, skills, readySkills?, difficulty, mode, length?, rng|seed?, now? }, store?)
 * mode: 'practice'|'skill'|'lesson' (round-robin) · 'world' (random) · 'misses' · 'review'|'mixed' · 'warmup' (short, default 3)
 * difficulty: 'easy'|'medium'|'challenge'|'adaptive'
 */
export function createPracticeSession(opts = {}, store = null) {
  const R = makeRng(opts.rng ?? opts.seed);
  const clock = typeof opts.now === 'function' ? opts.now : Date.now;
  const band = opts.band === 'analyst' ? 'analyst' : 'explorer';
  const mode = MODE_ALIAS[opts.mode] ? opts.mode : 'practice';
  const strategy = MODE_ALIAS[mode];
  // readySkills (optional): only these skills may appear (e.g. skills whose lessons are ready). Empty intersection → ignored.
  const ready = Array.isArray(opts.readySkills) ? new Set(opts.readySkills) : null;
  const base = (Array.isArray(opts.skills) && opts.skills.length ? opts.skills : SKILL_IDS).filter((s) => SKILLS[s]);
  const readyBase = ready ? base.filter((s) => ready.has(s)) : base;
  const given = readyBase.length ? readyBase : base;
  const restrict = (Array.isArray(opts.skills) && opts.skills.length > 0) || given.length < SKILL_IDS.length;
  const adaptive = opts.difficulty === 'adaptive';
  let level = adaptive ? 'easy' : DIFFICULTIES.includes(opts.difficulty) ? opts.difficulty : 'easy';
  const limit = Number.isFinite(opts.length) && opts.length > 0 ? Math.floor(opts.length) : strategy === 'warmup' ? 3 : Infinity;
  let runRight = 0, runMiss = 0, rr = 0, lastSkill = null, lastTemplate = null, exhausted = false;
  const seen = new Set();
  const stats = { questions: 0, independentCorrect: 0, independentAttempts: 0, assistedCorrect: 0, assistedAttempts: 0, revealed: 0, bySkill: {} };
  const write = (fn) => { if (store) store.update(fn); };
  const state = () => (store ? store.get() : null);
  const sk = (id) => (stats.bySkill[id] ||= { independentCorrect: 0, independentAttempts: 0, assistedCorrect: 0, assistedAttempts: 0, revealed: 0 });

  function chooseSkill() {
    const s = state();
    if (strategy === 'misses') {
      const q = missQueue(s).filter((id) => SKILLS[id] && (!restrict || given.includes(id)));
      if (!q.length) return null;
      return weighted(R, q, (id) => s.misses[id].count);
    }
    if (strategy === 'review') {
      const intro = s ? given.filter((id) => s.skills[id]?.introduced) : [];
      const pool = intro.length ? intro : given;
      const cands = pool.length > 1 ? pool.filter((id) => id !== lastSkill) : pool;
      return weighted(R, cands, (id) => reviewWeight(s, id, clock()));
    }
    if (strategy === 'random') {
      const cands = given.length > 1 ? given.filter((id) => id !== lastSkill) : given;
      return pick(R, cands);
    }
    return given[rr++ % given.length];   // rotate + warmup
  }

  function adjust(kind) {
    if (!adaptive) return;
    if (kind === 'right') { runRight++; runMiss = 0; } else if (kind === 'miss') { runMiss++; runRight = 0; } else { runRight = 0; }
    const i = DIFFICULTIES.indexOf(level);
    if (runRight >= 3 && i < 2) { level = DIFFICULTIES[i + 1]; runRight = 0; }
    if (runMiss >= 2 && i > 0) { level = DIFFICULTIES[i - 1]; runMiss = 0; }
  }

  function makeCurrent() {
    if (stats.questions >= limit) { exhausted = true; return null; }
    const skill = chooseSkill();
    if (!skill) { exhausted = true; return null; }
    const focus = strategy === 'misses' ? topMisconception(state(), skill) : null;
    const question = generateQuestion(skill, { band, difficulty: level, rng: R, avoid: seen, focus, lastTemplate });
    seen.add(question.key);
    lastSkill = skill; lastTemplate = question.template;
    stats.questions++;
    return { question, skill, attempts: 0, hintsUsed: 0, revealed: false, status: 'open', wrong: 0, assistedCounted: false };
  }

  const session = {
    band, mode, current: null,
    get difficulty() { return level; },
    get done() { return exhausted; },

    /** Next progressive hint, or null when none are left / question finished. */
    hint() {
      const cur = session.current;
      if (!cur || cur.status !== 'open') return null;
      const hs = cur.question.hints || [];
      if (cur.hintsUsed >= hs.length) return null;
      return hs[cur.hintsUsed++];
    },

    submit(response) {
      const cur = session.current;
      if (!cur) return { correct: false, feedback: 'There is no question right now.', misconception: null, canRetry: false };
      const q = cur.question;
      if (cur.status !== 'open') {
        return { correct: cur.status === 'correct', feedback: 'This question is finished. Go on to the next one.', misconception: null, canRetry: false, explanation: q.explanation };
      }
      const res = checkResponse(q, response);
      if (res.blank || res.invalid) return { correct: false, feedback: res.feedback, misconception: null, canRetry: true, counted: false };
      cur.attempts++;
      const now = clock(), skill = cur.skill, first = cur.attempts === 1;
      let credit = null;
      if (first && cur.hintsUsed === 0) {
        credit = 'independent';
        write((d) => recordIndependent(d, skill, res.correct, res.misconception, now));
        stats.independentAttempts++; sk(skill).independentAttempts++;
        if (res.correct) { stats.independentCorrect++; sk(skill).independentCorrect++; }
        adjust(res.correct ? 'right' : 'miss');
      } else if (first) {
        credit = 'assisted';
        cur.assistedCounted = true;
        write((d) => { recordAssisted(d, skill, { correct: res.correct, newAttempt: true }, now); if (!res.correct) addMiss(d, skill, res.misconception, now); });
        stats.assistedAttempts++; sk(skill).assistedAttempts++;
        if (res.correct) { stats.assistedCorrect++; sk(skill).assistedCorrect++; }
        adjust(res.correct ? 'assisted' : 'miss');
      } else if (res.correct) {
        credit = 'assisted';
        const newAttempt = !cur.assistedCounted;
        cur.assistedCounted = true;
        write((d) => recordAssisted(d, skill, { correct: true, newAttempt }, now));
        if (newAttempt) { stats.assistedAttempts++; sk(skill).assistedAttempts++; }
        stats.assistedCorrect++; sk(skill).assistedCorrect++;
      }
      if (res.correct) {
        cur.status = 'correct';
        return { correct: true, feedback: pick(R, PRAISE), misconception: null, explanation: q.explanation, canRetry: false, credit };
      }
      cur.wrong++;
      const out = { correct: false, feedback: res.feedback, misconception: res.misconception, canRetry: true };
      if (cur.wrong >= 2) out.teach = q.teach;
      return out;
    },

    /** Show the answer: no credit, and the question can no longer earn credit. */
    reveal() {
      const cur = session.current;
      if (!cur) return null;
      const q = cur.question;
      if (cur.status === 'open') {
        cur.status = 'revealed'; cur.revealed = true;
        const now = clock(), skill = cur.skill, miss = cur.attempts === 0;
        write((d) => recordReveal(d, skill, { miss }, now));
        stats.revealed++; sk(skill).revealed++;
        if (miss) adjust('miss');
      }
      return { answer: q.answer, answerText: answerText(q), explanation: q.explanation };
    },

    /** Move on (also allowed while a question is open — skipping records nothing). Returns the new current or null. */
    next() {
      session.current = makeCurrent();
      return session.current;
    },

    summary() {
      return { mode, band, difficulty: level, done: exhausted, ...stats, bySkill: JSON.parse(JSON.stringify(stats.bySkill)) };
    }
  };
  session.current = makeCurrent();
  return session;
}
