// Market Lab simulation math. PURE: no DOM, no storage, no network, no real data.
// Every price here is invented for practice. Nothing in this file looks up, imitates or
// pretends to be a real market price, contract specification or account.

/** Round to whole cents, half away from zero, without floating-point drift (1.005 → 1.01). */
export function roundCents(x) {
  const n = Number(x);
  if (!Number.isFinite(n)) return 0;
  const sign = n < 0 ? -1 : 1;
  const r = Math.round(Math.abs(n) * 100 + 1e-7) / 100;
  return r === 0 ? 0 : sign * r;   // never -0
}

export const SIDES = ['long', 'short'];

/** +1 for a long (bought) position, -1 for a short (sold) position. */
export function sideSign(side) {
  if (side === 'long') return 1;
  if (side === 'short') return -1;
  throw new Error(`Unknown side: ${side}`);
}

/** Price difference new − old, in cents. */
export function priceChange(oldPrice, newPrice) {
  return roundCents(newPrice - oldPrice);
}

/**
 * Pretend profit or loss of a position:
 * (exit − entry) × quantity × (long ? 1 : −1), rounded to cents. Negative = loss.
 */
export function positionPL({ entry, exit, quantity, side }) {
  return roundCents((exit - entry) * quantity * sideSign(side));
}

/** The P/L math as human-readable lines (used by the view to "show the work"). */
export function plSteps({ entry, exit, quantity, side }, fmt = (v) => v.toFixed(2)) {
  const diff = priceChange(entry, exit);
  const perUnit = roundCents(diff * sideSign(side));
  const total = positionPL({ entry, exit, quantity, side });
  const signWord = side === 'long' ? '× 1 (bought / long)' : '× −1 (sold / short)';
  return {
    diff, perUnit, total,
    lines: [
      `Price change: ${fmt(exit)} − ${fmt(entry)} = ${fmt(diff)}`,
      `Direction: ${fmt(diff)} ${signWord} = ${fmt(perUnit)} per unit`,
      `Quantity: ${fmt(perUnit)} × ${quantity} units = ${fmt(total)}`
    ]
  };
}

/** Percent change from old to new, rounded to 2 decimals. null when old is 0 (undefined). */
export function percentChange(oldPrice, newPrice) {
  if (!Number.isFinite(oldPrice) || !Number.isFinite(newPrice) || oldPrice === 0) return null;
  return Math.round(((newPrice - oldPrice) / Math.abs(oldPrice)) * 10000) / 100;
}

/** 'up' | 'down' | 'same' — "same" when the move is within tolerancePct of the old price. */
export function classifyMove(oldPrice, newPrice, tolerancePct = 1) {
  const pct = percentChange(oldPrice, newPrice);
  if (pct === null) return 'same';
  if (Math.abs(pct) <= tolerancePct) return 'same';
  return pct > 0 ? 'up' : 'down';
}

/**
 * Compare a pretend margin deposit with a profit/loss.
 * Margin is NOT the most you can lose: a futures loss can be bigger than the deposit.
 * @returns {{ margin, loss, exceeds: boolean, extraOwed }}  loss is a positive amount (0 if no loss)
 */
export function marginVsLoss(margin, pl) {
  const loss = pl < 0 ? roundCents(-pl) : 0;
  const m = roundCents(margin);
  const exceeds = loss > m;
  return { margin: m, loss, exceeds, extraOwed: exceeds ? roundCents(loss - m) : 0 };
}

/** Is this stop price on the protective side of the entry? Long: below entry. Short: above entry. */
export function isValidStop(side, entry, stop) {
  if (!Number.isFinite(stop) || stop <= 0) return false;
  return side === 'long' ? stop < entry : stop > entry;
}

/** Turn a scenario day (or a bare price) into a bar. `prev` is the previous close. */
export function toBar(day, prev) {
  if (typeof day === 'number') return { open: day, high: day, low: day, close: day };
  const close = day.price ?? day.close;
  const open = day.open ?? (Number.isFinite(prev) ? prev : close);
  return {
    open, close,
    high: day.high ?? Math.max(open, close),
    low: day.low ?? Math.min(open, close)
  };
}

/**
 * Simulate a stop order over the days AFTER entry.
 * A stop order becomes an order to exit once the price reaches the stop. It does NOT guarantee
 * the stop price: if the price GAPS past the stop (opens beyond it), the exit happens at the
 * next available price — the open — which can be much worse.
 *
 * @param {{ side, stop, entry, days: Array<number|{price, open?, high?, low?}> }} o
 * @returns {{ triggered, dayIndex, fill, gapped, gap }} gap = how far the fill is past the stop (≥ 0)
 */
export function simulateStop({ side, stop, entry, days }) {
  let prev = entry;
  for (let i = 0; i < days.length; i++) {
    const bar = toBar(days[i], prev);
    if (side === 'long') {
      if (bar.open <= stop) return result(i, bar.open, bar.open < stop);
      if (bar.low <= stop) return result(i, stop, false);
    } else {
      if (bar.open >= stop) return result(i, bar.open, bar.open > stop);
      if (bar.high >= stop) return result(i, stop, false);
    }
    prev = bar.close;
  }
  return { triggered: false, dayIndex: -1, fill: null, gapped: false, gap: 0 };

  function result(dayIndex, fill, gapped) {
    return { triggered: true, dayIndex, fill: roundCents(fill), gapped, gap: roundCents(Math.abs(fill - stop)) };
  }
}

/** Small deterministic PRNG (mulberry32). Same seed → same sequence. */
export function createRng(seed = 1) {
  let a = (Number(seed) >>> 0) || 1;
  return function rng() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Seeded FICTIONAL price path: a random walk with optional news shocks.
 * Never negative (floored at `floor`), every value rounded to cents. Not real data.
 * @param {{ seed, start, days, volatility?: number (fraction, e.g. 0.03), shocks?: Array<{day, pct}>, floor? }} o
 * @returns {number[]} length days + 1 (index 0 = start)
 */
export function generatePricePath({ seed = 1, start = 5, days = 10, volatility = 0.03, shocks = [], floor = 0.01 } = {}) {
  const rng = createRng(seed);
  const shockAt = new Map(shocks.map((s) => [s.day, s.pct]));
  const path = [Math.max(floor, roundCents(start))];
  let p = path[0];
  for (let d = 1; d <= days; d++) {
    const step = (rng() * 2 - 1) * volatility + (shockAt.get(d) || 0);
    p = Math.max(floor, roundCents(p * (1 + step)));
    path.push(p);
  }
  return path;
}

/**
 * Run a whole pretend position through a scenario's days.
 * @param {{ side: 'long'|'short'|'none', entry, quantity, stop?, days, margin }} o
 * days = the days AFTER entry. Exits at a stop fill or at the last day's price.
 */
export function runPosition({ side, entry, quantity, stop = null, days, margin = 0 }) {
  if (side === 'none') return { side, exit: null, exitDay: -1, pl: 0, stopped: null, margin: marginVsLoss(margin, 0) };
  let stopped = null;
  if (stop != null && isValidStop(side, entry, stop)) {
    const s = simulateStop({ side, stop, entry, days });
    if (s.triggered) stopped = s;
  }
  const exitDay = stopped ? stopped.dayIndex : days.length - 1;
  const exit = stopped ? stopped.fill : toBar(days[exitDay]).close;
  const pl = positionPL({ entry, exit, quantity, side });
  return { side, exit, exitDay, pl, stopped, margin: marginVsLoss(margin, pl) };
}
