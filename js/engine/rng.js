// Seeded randomness so practice and tests are reproducible in unit tests (and varied in the app).

/** mulberry32: tiny, fast, good-enough PRNG. Returns a function → float in [0, 1). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Accepts an rng function, a numeric seed, or nothing (time-seeded). */
export function makeRng(r) {
  if (typeof r === 'function') return r;
  if (Number.isFinite(r)) return mulberry32(r);
  return mulberry32((Date.now() ^ Math.floor(Math.random() * 4294967296)) >>> 0);
}

export const int = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
export const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
export function pickIndex(rng, arr) { const i = Math.floor(rng() * arr.length); return [i, arr[i]]; }

export function shuffle(rng, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** n distinct items (in random order). */
export function sample(rng, arr, n) { return shuffle(rng, arr).slice(0, Math.min(n, arr.length)); }

/** n distinct indices, sorted (handy for stable keys). */
export function sampleIndices(rng, length, n) {
  return shuffle(rng, [...Array(length).keys()]).slice(0, Math.min(n, length)).sort((x, y) => x - y);
}

/** Pick one item with probability proportional to weight(item) (weights ≤ 0 are skipped unless all are). */
export function weighted(rng, items, weight) {
  const w = items.map((x) => Math.max(0, weight(x)));
  const total = w.reduce((s, x) => s + x, 0);
  if (!(total > 0)) return pick(rng, items);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) { r -= w[i]; if (r < 0) return items[i]; }
  return items[items.length - 1];
}
