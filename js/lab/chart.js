// Market Lab chart data. PURE: no DOM. Turns a scenario's pretend days into visual specs for
// js/ui/visuals.js (line or candles) and builds the "Long or Short?" per-unit table.
// The chart mode is ONLY a picture choice: every price, change and P/L number comes from the
// same daily closes whichever chart is shown.
import { roundCents, toBar, priceChange, sideSign } from './sim.js';

export const CHART_MODES = ['line', 'candles'];

/** Short axis label: 'Day 3' → 'D3'. */
export function shortLabel(label) {
  return String(label).replace('Day ', 'D');
}

/** Every day of a scenario as an OHLC bar { label, open, high, low, close }. Open = previous close unless the day gaps. */
export function scenarioBars(sc) {
  let prev = sc.start;
  return sc.days.map((d) => {
    const b = toBar(d, prev);
    prev = b.close;
    return { label: d.label, open: roundCents(b.open), high: roundCents(b.high), low: roundCents(b.low), close: roundCents(b.close) };
  });
}

/** Is this a valid OHLC bar? high ≥ max(open, close), low ≤ min(open, close), all positive. */
export function isValidBar(b) {
  return [b.open, b.high, b.low, b.close].every((v) => Number.isFinite(v) && v > 0)
    && b.high >= Math.max(b.open, b.close) && b.low <= Math.min(b.open, b.close);
}

/** Daily closes as line points, starting with the Start price. `dayCount` = days revealed so far. */
export function linePoints(sc, dayCount = sc.days.length) {
  const pts = [{ label: 'Start', value: sc.start }];
  for (let i = 0; i < Math.min(dayCount, sc.days.length); i++) pts.push({ label: shortLabel(sc.days[i].label), value: sc.days[i].price });
  return pts;
}

/** Candles for the revealed days (Start is a single price, not a candle). */
export function candleList(sc, dayCount = sc.days.length) {
  return scenarioBars(sc).slice(0, Math.max(0, dayCount)).map((b) => ({ ...b, label: shortLabel(b.label) }));
}

/**
 * Visual spec for the chosen chart mode, or null when there is nothing to draw yet
 * (candles before Day 1 is revealed).
 */
export function chartSpec(sc, dayCount, mode = 'line') {
  const title = `${sc.item} — pretend price`;
  if (mode === 'candles') {
    const candles = candleList(sc, dayCount);
    return candles.length ? { kind: 'candles', title: `${title} (candles)`, unit: '$', candles } : null;
  }
  return { kind: 'line', title, unit: '$', points: linePoints(sc, dayCount), highlight: dayCount };
}

/**
 * "Long or Short?" rows for a price change: what one unit and one practice contract would gain or
 * lose for each side. Long gains when the price rises; short gains when it falls. Always opposite.
 */
export function longShortRows(oldPrice, newPrice, quantity) {
  const change = priceChange(oldPrice, newPrice);
  return ['long', 'short'].map((side) => {
    const perUnit = roundCents(change * sideSign(side));
    return { side, change, perUnit, total: roundCents(perUnit * quantity) };
  });
}
