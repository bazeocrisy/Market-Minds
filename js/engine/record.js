// Progress recording helpers. Each takes the store DRAFT (inside store.update) — never the live state.

export function skillRec(draft, id) {
  return draft.skills[id] || (draft.skills[id] = { introduced: false, independent: { correct: 0, attempts: 0 }, assisted: { correct: 0, attempts: 0 }, revealed: 0, recent: [], lastSeen: 0 });
}

export function addMiss(draft, id, misconception, now) {
  const m = draft.misses[id] || (draft.misses[id] = { count: 0, misconceptions: {}, lastMissed: 0, clearedStreak: 0 });
  m.count++;
  if (misconception) m.misconceptions[misconception] = (m.misconceptions[misconception] || 0) + 1;
  m.lastMissed = now;
  m.clearedStreak = 0;
}

/** An independent correct answer works a skill out of the miss queue (2 in a row clears it). */
export function clearStep(draft, id) {
  const m = draft.misses[id];
  if (!m) return;
  m.clearedStreak++;
  if (m.clearedStreak >= 2) delete draft.misses[id];
}

/** First submission with no hint (practice) or any test item. */
export function recordIndependent(draft, id, correct, misconception, now) {
  const k = skillRec(draft, id);
  k.introduced = true;
  k.independent.attempts++;
  if (correct) k.independent.correct++;
  k.recent = [...k.recent, correct ? 1 : 0].slice(-8);
  k.lastSeen = now;
  if (correct) clearStep(draft, id); else addMiss(draft, id, misconception, now);
}

/** Hinted first submission (newAttempt: true) or a later correct retry. */
export function recordAssisted(draft, id, { correct, newAttempt }, now) {
  const k = skillRec(draft, id);
  k.introduced = true;
  if (newAttempt) k.assisted.attempts++;
  if (correct) k.assisted.correct++;
  k.lastSeen = now;
}

export function recordReveal(draft, id, { miss, misconception = null }, now) {
  const k = skillRec(draft, id);
  k.introduced = true;
  k.revealed++;
  k.lastSeen = now;
  if (miss) addMiss(draft, id, misconception, now);
}
