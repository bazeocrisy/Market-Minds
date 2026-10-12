// Checking learner responses. Feedback explains what is wrong (misconception + clue) but never the answer.
import { MISCONCEPTIONS, GENERIC_FEEDBACK } from './misconceptions.js';

/** Tolerant number parsing: "$4", "4.50", " 4 ", "-3", "−3", "1,750", "25%", "50 cents". NaN if not a number. */
export function parseNumber(resp) {
  if (typeof resp === 'number') return Number.isFinite(resp) ? resp : NaN;
  if (typeof resp !== 'string') return NaN;
  let s = resp.trim().toLowerCase().replace(/[−–—]/g, '-').replace(/\s+/g, '');
  let scale = 1;
  if (/(cents?|¢)$/.test(s)) { scale = 0.01; s = s.replace(/(cents?|¢)$/, ''); }
  s = s.replace(/(dollars?|usd|percent|%)$/, '').replace(/\$/g, '');
  if (/^[-+]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, '');
  else if (/^[-+]?\d+,\d{1,2}$/.test(s)) s = s.replace(',', '.');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
  return Number(s) * scale;
}

const misText = (q, id) => (id && (q.misconceptions?.[id] || MISCONCEPTIONS[id])) || null;
const isBlank = (r) => r == null || (typeof r === 'string' && r.trim() === '') || (typeof r === 'object' && !Array.isArray(r) && Object.keys(r).length === 0);

/**
 * checkResponse(question, response) → { correct, misconception: id|null, feedback, blank?, invalid? }
 * choice/fill: response = choice id (or its exact text). number: number or string. match: { leftId: rightId }.
 * Works for engine questions and for static content questions (lesson checks, story questions).
 */
export function checkResponse(q, response) {
  if (isBlank(response)) return { correct: false, misconception: null, feedback: GENERIC_FEEDBACK.blank, blank: true };
  const type = q.type || 'choice';

  if (type === 'choice' || type === 'fill') {
    const choices = q.choices || [];
    let ch = choices.find((x) => x.id === response);
    if (!ch && typeof response === 'string') ch = choices.find((x) => String(x.text).trim().toLowerCase() === response.trim().toLowerCase());
    if (ch && ch.id === q.answer) return { correct: true, misconception: null, feedback: 'Correct!' };
    const mis = ch?.misconception || null;
    return { correct: false, misconception: mis, feedback: misText(q, mis) || GENERIC_FEEDBACK.choice };
  }

  if (type === 'number') {
    const v = parseNumber(response);
    if (!Number.isFinite(v)) return { correct: false, misconception: null, feedback: GENERIC_FEEDBACK.invalid, invalid: true };
    const tol = (q.tolerance ?? 0.005) + 1e-9;
    if (Math.abs(v - q.answer) <= tol) return { correct: true, misconception: null, feedback: 'Correct!' };
    const errTol = Math.max(tol, q.unit === '%' ? 0.5 : 0.005);
    const hit = (q.commonErrors || []).find((e) => Math.abs(v - e.value) <= errTol);
    if (hit) return { correct: false, misconception: hit.misconception, feedback: misText(q, hit.misconception) || GENERIC_FEEDBACK.number };
    if (q.answer !== 0 && Math.abs(v + q.answer) <= tol) {
      return { correct: false, misconception: 'wrong-direction', feedback: misText(q, 'wrong-direction') };
    }
    if (q.prefix === '$' && q.answer !== 0 && !Number.isInteger(q.answer) && Math.abs(v - q.answer * 100) <= tol * 100) {
      return { correct: false, misconception: null, feedback: 'Check your units: the answer should be in dollars, not cents (for example, 35 cents is $0.35).' };
    }
    return { correct: false, misconception: null, feedback: GENERIC_FEEDBACK.number };
  }

  if (type === 'match') {
    const ans = q.answer || {};
    const keys = Object.keys(ans);
    const right = keys.filter((k) => response && response[k] === ans[k]).length;
    if (right === keys.length) return { correct: true, misconception: null, feedback: 'Correct!' };
    const mis = q.matchMisconception || null;
    return { correct: false, misconception: mis, feedback: `${right} of ${keys.length} matches are right. ${GENERIC_FEEDBACK.match}` };
  }

  return { correct: false, misconception: null, feedback: GENERIC_FEEDBACK.choice };
}

/** Human-readable correct answer (for reveal / results). */
export function answerText(q) {
  if (q.type === 'number') {
    const a = q.answer;
    if (q.prefix === '$') {
      const body = Math.abs(a).toFixed(Number.isInteger(a) ? 0 : 2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return (a < 0 ? '-' : '') + '$' + body;
    }
    return String(a) + (q.unit ? (q.unit === '%' ? '%' : ` ${q.unit}`) : '');
  }
  if (q.type === 'match') {
    const L = q.pairs?.left || [], R = q.pairs?.right || [];
    return L.map((l) => `${l.text} → ${R.find((r) => r.id === q.answer[l.id])?.text}`).join('; ');
  }
  return (q.choices || []).find((c) => c.id === q.answer)?.text ?? String(q.answer);
}
