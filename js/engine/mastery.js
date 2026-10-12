// Mastery comes ONLY from independent evidence — never from time spent or pages viewed.

export function missQueue(state) {
  return Object.entries(state?.misses || {})
    .filter(([, m]) => m && m.count > 0)
    .sort((a, b) => b[1].count - a[1].count || b[1].lastMissed - a[1].lastMissed)
    .map(([id]) => id);
}

/** Most frequent misconception id recorded for a skill in the miss queue (or null). */
export function topMisconception(state, skillId) {
  const mis = state?.misses?.[skillId]?.misconceptions || {};
  let best = null, n = 0;
  for (const [id, c] of Object.entries(mis)) if (c > n) { best = id; n = c; }
  return best;
}

const sum = (a) => a.reduce((s, x) => s + x, 0);

/**
 * level: 'not-started' (no record) | 'introduced' (< 3 independent attempts) | 'practicing' |
 * 'needs-review' (in miss queue, or ≤ 1 correct of the last 3 independent) |
 * 'mastered' (≥ 5 independent attempts, ≥ 4 of the last 5 correct, not in the miss queue).
 */
export function masteryFor(state, skillId) {
  const k = state?.skills?.[skillId];
  const inMiss = !!(state?.misses?.[skillId]?.count > 0);
  if (!k) {
    const base = { independentCorrect: 0, independentAttempts: 0, assistedCorrect: 0, assistedAttempts: 0, revealed: 0, recentAccuracy: null };
    return { level: inMiss ? 'needs-review' : 'not-started', ...base };
  }
  const recent = k.recent || [];
  const info = {
    independentCorrect: k.independent.correct, independentAttempts: k.independent.attempts,
    assistedCorrect: k.assisted.correct, assistedAttempts: k.assisted.attempts, revealed: k.revealed,
    recentAccuracy: recent.length ? sum(recent) / recent.length : null
  };
  const touched = k.introduced || k.independent.attempts || k.assisted.attempts || k.revealed;
  if (!touched && !inMiss) return { level: 'not-started', ...info };
  const last3 = recent.slice(-3), last5 = recent.slice(-5);
  let level;
  if (inMiss) level = 'needs-review';
  else if (k.independent.attempts < 3) level = 'introduced';
  else if (last3.length >= 3 && sum(last3) <= 1) level = 'needs-review';
  else if (k.independent.attempts >= 5 && last5.length >= 5 && sum(last5) >= 4) level = 'mastered';
  else level = 'practicing';
  return { level, ...info };
}
