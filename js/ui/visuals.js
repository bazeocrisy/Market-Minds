// Market Minds visuals: real SVG/HTML diagrams for lessons, practice, Thinking Lab and Market Lab.
// renderVisual(spec, { band }) → HTMLElement (a <figure>). Every chart has role="img" + an aria-label
// summary AND a data table in a <details> ("Show the numbers") so nothing is conveyed by the picture alone.
// The pure helpers below (formatting, scales, ticks, summaries) use no DOM and are unit-tested.
//
// Kinds:
//   line         { title, unit, points:[{label,value}], highlight?: index|label }
//   bars         { title, unit, items:[{label,value}] }
//   candles      { title, unit, candles:[{label,open,high,low,close}] }
//   priceTags    { items:[{label, price, note?}] }
//   supplyDemand { item, supply, demand }      supply/demand: 'more'|'less'|'same'
//   agreement    { item, buyer, seller, price, quantity, when }
//   image        { asset, alt, caption }       named placeholder until approved art exists
// `unit`: '$' (or 'dollars'/'USD') formats values as money; any other string is appended (e.g. 'apples').

export const COLORS = { navy: '#102541', teal: '#168D86', gold: '#F0BF55', cream: '#F7F8F5', grid: '#D9DEE4', muted: '#5B6B7F', white: '#FFFFFF' };
const MINUS = '−';

// ---------------------------------------------------------------- pure helpers

export function isMoneyUnit(unit) {
  return unit === '$' || unit === 'dollars' || unit === 'USD';
}

/** $1,234.50 · −$3.00 · with { sign: true } → +$0.35 */
export function formatMoney(value, { sign = false } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  const cents = Math.round(Math.abs(n) * 100 + 1e-7);
  const body = '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (cents === 0) return body;
  if (n < 0) return MINUS + body;
  return sign ? '+' + body : body;
}

/** Plain number with up to `digits` decimals, real minus sign. */
export function formatNumber(value, digits = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  const s = Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: digits });
  return n < 0 && s !== '0' ? MINUS + s : s;
}

export function formatValue(value, unit) {
  if (isMoneyUnit(unit)) return formatMoney(value);
  return unit ? `${formatNumber(value)} ${unit}` : formatNumber(value);
}

/** [min, max] of finite numbers; [0, 0] if none. */
export function extent(values) {
  const v = values.filter(Number.isFinite);
  if (!v.length) return [0, 0];
  return [Math.min(...v), Math.max(...v)];
}

/** Linear map from domain [d0,d1] to range [r0,r1]. A zero-width domain maps to the middle. */
export function linearScale([d0, d1], [r0, r1]) {
  const span = d1 - d0;
  return (x) => (span === 0 ? (r0 + r1) / 2 : r0 + ((x - d0) / span) * (r1 - r0));
}

/** "Nice" step (1, 2, 2.5, 5 × 10^k) for roughly `count` intervals. */
export function niceStep(span, count = 5) {
  if (!(span > 0)) return 1;
  const raw = span / Math.max(1, count);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const f = raw / mag;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * mag;
}

/** Evenly spaced nice tick values covering [min, max]. */
export function niceTicks(min, max, count = 5) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min > max) [min, max] = [max, min];
  if (min === max) { const pad = Math.abs(min) * 0.1 || 1; min -= pad; max += pad; }
  const step = niceStep(max - min, count);
  const start = Math.floor(min / step + 1e-9) * step;
  const end = Math.ceil(max / step - 1e-9) * step;
  const ticks = [];
  for (let t = start, i = 0; t <= end + step / 2 && i < 50; t += step, i++) ticks.push(Math.round(t * 1e6) / 1e6);
  return ticks;
}

/** Which x-axis labels to show so they don't collide (always first and last). */
export function labelStride(n, maxLabels = 7) {
  return n <= maxLabels ? 1 : Math.ceil(n / maxLabels);
}

const DIR = { more: 1, less: -1, same: 0 };

/**
 * Likely price pressure from supply and demand changes.
 * @returns {{ direction: 'up'|'down'|'same'|'unclear', caption: string }}
 */
export function supplyDemandPressure(supply, demand, item = 'the item') {
  const s = DIR[supply] ?? 0, d = DIR[demand] ?? 0;
  const words = `${cap(word(supply))} supply and ${word(demand)} demand`;
  if (s === 0 && d === 0) return { direction: 'same', caption: `${words}: no push either way, so the price of ${item} may stay about the same.` };
  if (s === d) return { direction: 'unclear', caption: `${words}: the two pushes work against each other, so it is hard to tell which way the price of ${item} will go.` };
  const net = d - s;
  const dir = net > 0 ? 'up' : 'down';
  return { direction: dir, caption: `${words} usually push the price of ${item} ${dir.toUpperCase()}. Usually — not always. Other things can matter too.` };
}
function word(x) { return x === 'more' ? 'more' : x === 'less' ? 'less' : 'the same'; }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

export function describeLine(spec) {
  const pts = spec.points || [];
  if (!pts.length) return `${spec.title || 'Line chart'}: no data.`;
  const first = pts[0], last = pts[pts.length - 1];
  const [lo, hi] = extent(pts.map((p) => p.value));
  const diff = last.value - first.value;
  const trend = Math.abs(diff) < 1e-9 ? 'ended where it started' : diff > 0 ? `went up by ${formatValue(Math.abs(diff), spec.unit)} overall` : `went down by ${formatValue(Math.abs(diff), spec.unit)} overall`;
  return `${spec.title || 'Line chart'}. ${pts.length} points from ${first.label} (${formatValue(first.value, spec.unit)}) to ${last.label} (${formatValue(last.value, spec.unit)}). It ${trend}. Lowest ${formatValue(lo, spec.unit)}, highest ${formatValue(hi, spec.unit)}.`;
}

export function describeBars(spec) {
  const items = spec.items || [];
  if (!items.length) return `${spec.title || 'Bar chart'}: no data.`;
  const top = items.reduce((a, b) => (b.value > a.value ? b : a));
  return `${spec.title || 'Bar chart'}. ` + items.map((i) => `${i.label}: ${formatValue(i.value, spec.unit)}`).join('; ') + `. Highest: ${top.label}.`;
}

export function candleDirection(c) {
  return c.close > c.open ? 'up' : c.close < c.open ? 'down' : 'flat';
}

export function describeCandles(spec) {
  const cs = spec.candles || [];
  if (!cs.length) return `${spec.title || 'Candlestick chart'}: no data.`;
  const ups = cs.filter((c) => candleDirection(c) === 'up').length;
  const downs = cs.filter((c) => candleDirection(c) === 'down').length;
  const first = cs[0], last = cs[cs.length - 1];
  return `${spec.title || 'Candlestick chart'}. ${cs.length} candles: ${ups} up, ${downs} down. First open ${formatValue(first.open, spec.unit)}, last close ${formatValue(last.close, spec.unit)}.`;
}

// ---------------------------------------------------------------- DOM helpers (local)

const SVG_NS = 'http://www.w3.org/2000/svg';
function s(tag, attrs = {}, ...kids) {
  const e = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, String(v));
  for (const k of kids.flat()) if (k != null) e.append(typeof k === 'string' ? document.createTextNode(k) : k);
  return e;
}
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else e.setAttribute(k, v === true ? '' : String(v));
  }
  for (const k of kids.flat()) if (k != null) e.append(typeof k === 'string' ? document.createTextNode(k) : k);
  return e;
}

let figureCount = 0;
function figure(kind, title) {
  const fig = h('figure', { class: `mm-visual mm-visual--${kind}` });
  if (title) {
    const id = `mmv-${++figureCount}`;
    fig.append(h('figcaption', { class: 'mm-visual__title', id, text: title }));
    fig.setAttribute('role', 'group');
    fig.setAttribute('aria-labelledby', id);
  }
  return fig;
}

function chartSvg(label, w, hgt) {
  return s('svg', { class: 'mm-visual__svg', viewBox: `0 0 ${w} ${hgt}`, width: '100%', role: 'img', 'aria-label': label, preserveAspectRatio: 'xMidYMid meet', focusable: 'false' });
}

function dataTable(caption, headers, rows) {
  return h('details', { class: 'mm-visual__data' },
    h('summary', { text: 'Show the numbers' }),
    h('table', { class: 'mm-visual__table' },
      h('caption', { class: 'sr-only', text: caption }),
      h('thead', {}, h('tr', {}, headers.map((t) => h('th', { scope: 'col', text: t })))),
      h('tbody', {}, rows.map((r) => h('tr', {}, r.map((c, i) => (i === 0 ? h('th', { scope: 'row', text: c }) : h('td', { text: c }))))))));
}

const W = 400, H = 240, PAD = { l: 52, r: 14, t: 14, b: 34 };

function yAxis(svg, ticks, y, unit) {
  for (const t of ticks) {
    const yy = y(t);
    svg.append(s('line', { class: 'mm-visual__grid', x1: PAD.l, x2: W - PAD.r, y1: yy, y2: yy, stroke: COLORS.grid, 'stroke-width': 1 }));
    svg.append(s('text', { class: 'mm-visual__tick', x: PAD.l - 6, y: yy + 4, 'text-anchor': 'end', 'font-size': 11, fill: COLORS.muted }, isMoneyUnit(unit) ? formatMoney(t) : formatNumber(t)));
  }
}
function xLabels(svg, labels, x) {
  const stride = labelStride(labels.length);
  labels.forEach((lab, i) => {
    if (i % stride !== 0 && i !== labels.length - 1) return;
    svg.append(s('text', { class: 'mm-visual__tick', x: x(i), y: H - PAD.b + 18, 'text-anchor': 'middle', 'font-size': 11, fill: COLORS.muted }, lab));
  });
}

// ---------------------------------------------------------------- kinds

function renderLine(spec) {
  const pts = spec.points || [];
  const fig = figure('line', spec.title);
  const svg = chartSvg(describeLine(spec), W, H);
  const [lo, hi] = extent(pts.map((p) => p.value));
  const ticks = niceTicks(lo, hi, 4);
  const y = linearScale([ticks[0] ?? lo, ticks[ticks.length - 1] ?? hi], [H - PAD.b, PAD.t]);
  const n = pts.length;
  const x = linearScale([0, Math.max(1, n - 1)], [PAD.l + 12, W - PAD.r - 12]);
  yAxis(svg, ticks, y, spec.unit);
  svg.append(s('line', { class: 'mm-visual__axis', x1: PAD.l, x2: W - PAD.r, y1: H - PAD.b, y2: H - PAD.b, stroke: COLORS.navy, 'stroke-width': 1.5 }));
  if (n > 1) {
    svg.append(s('polyline', { class: 'mm-visual__line', points: pts.map((p, i) => `${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' '), fill: 'none', stroke: COLORS.teal, 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
  }
  const hl = typeof spec.highlight === 'number' ? spec.highlight : pts.findIndex((p) => p.label === spec.highlight);
  pts.forEach((p, i) => {
    const isHl = i === hl;
    svg.append(s('circle', { class: 'mm-visual__point' + (isHl ? ' is-highlight' : ''), cx: x(i), cy: y(p.value), r: isHl ? 7 : 4.5, fill: isHl ? COLORS.gold : COLORS.white, stroke: isHl ? COLORS.navy : COLORS.teal, 'stroke-width': 2.5 },
      s('title', {}, `${p.label}: ${formatValue(p.value, spec.unit)}`)));
  });
  xLabels(svg, pts.map((p) => p.label), x);
  fig.append(svg, dataTable(spec.title || 'Line chart data', ['Point', `Value${isMoneyUnit(spec.unit) ? '' : spec.unit ? ` (${spec.unit})` : ''}`], pts.map((p) => [p.label, formatValue(p.value, spec.unit)])));
  return fig;
}

function renderBars(spec) {
  const items = spec.items || [];
  const fig = figure('bars', spec.title);
  const svg = chartSvg(describeBars(spec), W, H);
  const [lo, hi] = extent(items.map((i) => i.value));
  const ticks = niceTicks(Math.min(0, lo), Math.max(0, hi), 4);
  const y = linearScale([ticks[0], ticks[ticks.length - 1]], [H - PAD.b, PAD.t]);
  yAxis(svg, ticks, y, spec.unit);
  const n = Math.max(1, items.length);
  const band = (W - PAD.l - PAD.r) / n;
  const bw = Math.min(56, band * 0.6);
  const x = (i) => PAD.l + band * i + band / 2;
  items.forEach((it, i) => {
    const y0 = y(0), y1 = y(it.value);
    svg.append(s('rect', { class: 'mm-visual__bar', x: x(i) - bw / 2, y: Math.min(y0, y1), width: bw, height: Math.max(1, Math.abs(y1 - y0)), rx: 3, fill: COLORS.teal },
      s('title', {}, `${it.label}: ${formatValue(it.value, spec.unit)}`)));
    svg.append(s('text', { class: 'mm-visual__value', x: x(i), y: Math.min(y0, y1) - 5, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: COLORS.navy }, isMoneyUnit(spec.unit) ? formatMoney(it.value) : formatNumber(it.value)));
  });
  svg.append(s('line', { class: 'mm-visual__axis', x1: PAD.l, x2: W - PAD.r, y1: y(0), y2: y(0), stroke: COLORS.navy, 'stroke-width': 1.5 }));
  xLabels(svg, items.map((i) => i.label), x);
  fig.append(svg, dataTable(spec.title || 'Bar chart data', ['Item', 'Value'], items.map((i) => [i.label, formatValue(i.value, spec.unit)])));
  return fig;
}

function renderCandles(spec) {
  const cs = spec.candles || [];
  const fig = figure('candles', spec.title);
  const svg = chartSvg(describeCandles(spec), W, H);
  const [lo, hi] = extent(cs.flatMap((c) => [c.low, c.high]));
  const ticks = niceTicks(lo, hi, 4);
  const y = linearScale([ticks[0], ticks[ticks.length - 1]], [H - PAD.b, PAD.t + 10]);
  yAxis(svg, ticks, y, spec.unit);
  const n = Math.max(1, cs.length);
  const band = (W - PAD.l - PAD.r) / n;
  const bw = Math.max(6, Math.min(26, band * 0.55));
  const x = (i) => PAD.l + band * i + band / 2;
  cs.forEach((c, i) => {
    const dir = candleDirection(c);
    const top = y(Math.max(c.open, c.close)), bot = y(Math.min(c.open, c.close));
    const g = s('g', { class: `mm-visual__candle is-${dir}` }, s('title', {}, `${c.label}: ${dir}. Open ${formatValue(c.open, spec.unit)}, high ${formatValue(c.high, spec.unit)}, low ${formatValue(c.low, spec.unit)}, close ${formatValue(c.close, spec.unit)}`));
    g.append(s('line', { x1: x(i), x2: x(i), y1: y(c.high), y2: y(c.low), stroke: COLORS.navy, 'stroke-width': 1.5 }));
    // Up = hollow teal body + ▲ above. Down = solid navy body + ▼ below. Shape AND color differ.
    g.append(s('rect', { x: x(i) - bw / 2, y: top, width: bw, height: Math.max(2, bot - top), fill: dir === 'up' ? COLORS.white : dir === 'down' ? COLORS.navy : COLORS.muted, stroke: dir === 'up' ? COLORS.teal : COLORS.navy, 'stroke-width': 2 }));
    if (dir === 'up') g.append(s('path', { d: triangle(x(i), y(c.high) - 9, 'up'), fill: COLORS.teal }));
    if (dir === 'down') g.append(s('path', { d: triangle(x(i), y(c.low) + 9, 'down'), fill: COLORS.navy }));
    svg.append(g);
  });
  xLabels(svg, cs.map((c) => c.label), x);
  const legend = h('ul', { class: 'mm-visual__legend' },
    h('li', {}, legendSwatch('up'), 'Up candle: close higher than open (hollow body, ▲)'),
    h('li', {}, legendSwatch('down'), 'Down candle: close lower than open (filled body, ▼)'));
  fig.append(svg, legend, dataTable(spec.title || 'Candle data', ['Candle', 'Open', 'High', 'Low', 'Close', 'Direction'],
    cs.map((c) => [c.label, formatValue(c.open, spec.unit), formatValue(c.high, spec.unit), formatValue(c.low, spec.unit), formatValue(c.close, spec.unit), candleDirection(c)])));
  return fig;
}
function triangle(cx, cy, dir) {
  const r = 5;
  return dir === 'up' ? `M${cx - r},${cy + r} L${cx + r},${cy + r} L${cx},${cy - r} Z` : `M${cx - r},${cy - r} L${cx + r},${cy - r} L${cx},${cy + r} Z`;
}
function legendSwatch(dir) {
  const svg = s('svg', { viewBox: '0 0 24 24', width: 20, height: 20, 'aria-hidden': 'true', focusable: 'false', class: 'mm-visual__swatch' });
  const up = dir === 'up';
  svg.append(s('rect', { x: 7, y: up ? 9 : 2, width: 10, height: 13, fill: up ? COLORS.white : COLORS.navy, stroke: up ? COLORS.teal : COLORS.navy, 'stroke-width': 2 }));
  svg.append(s('path', { d: up ? 'M8,7 L16,7 L12,1 Z' : 'M8,17 L16,17 L12,23 Z', fill: up ? COLORS.teal : COLORS.navy }));
  return svg;
}

function renderPriceTags(spec) {
  const items = spec.items || [];
  const fig = figure('priceTags', spec.title);
  const list = h('ul', { class: 'mm-pricetags', role: 'list' });
  for (const it of items) {
    list.append(h('li', { class: 'mm-pricetag' },
      h('span', { class: 'mm-pricetag__label', text: it.label }),
      h('span', { class: 'mm-pricetag__price', text: typeof it.price === 'number' ? formatMoney(it.price) : String(it.price) }),
      it.note ? h('span', { class: 'mm-pricetag__note', text: it.note }) : null));
  }
  fig.append(list);
  return fig;
}

const ARROW = { more: '↑', less: '↓', same: '=' };
const PRESSURE_ARROW = { up: '↑', down: '↓', same: '↔', unclear: '?' };

function renderSupplyDemand(spec) {
  const item = spec.item || 'the item';
  const p = supplyDemandPressure(spec.supply, spec.demand, item);
  const fig = figure('supplyDemand', spec.title || `Supply and demand: ${item}`);
  const label = `Supply: ${word(spec.supply)}. Demand: ${word(spec.demand)}. Likely price pressure: ${p.direction}.`;
  const svg = s('svg', { class: 'mm-visual__svg', viewBox: '0 0 400 170', width: '100%', role: 'img', 'aria-label': label, focusable: 'false' });
  // Balance: beam tilts toward the heavier side. Price goes up when demand outweighs supply.
  const tilt = p.direction === 'up' ? -10 : p.direction === 'down' ? 10 : 0;   // degrees; negative = demand (right) side down
  svg.append(s('path', { d: 'M200,150 L182,165 L218,165 Z', fill: COLORS.navy }));
  svg.append(s('line', { x1: 200, y1: 60, x2: 200, y2: 152, stroke: COLORS.navy, 'stroke-width': 4 }));
  const beam = s('g', { transform: `rotate(${-tilt} 200 60)`, class: 'mm-visual__beam' });
  beam.append(s('line', { x1: 70, y1: 60, x2: 330, y2: 60, stroke: COLORS.navy, 'stroke-width': 5, 'stroke-linecap': 'round' }));
  beam.append(pan(70, 'Supply', spec.supply), pan(330, 'Demand', spec.demand));
  svg.append(beam);
  svg.append(s('circle', { cx: 200, cy: 60, r: 7, fill: COLORS.gold, stroke: COLORS.navy, 'stroke-width': 2 }));
  svg.append(s('text', { x: 200, y: 26, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: COLORS.navy }, `Price ${PRESSURE_ARROW[p.direction]} ${p.direction === 'unclear' ? 'unclear' : p.direction === 'same' ? 'steady' : p.direction}`));
  fig.append(svg, h('p', { class: `mm-visual__caption is-${p.direction}`, text: p.caption }));
  return fig;

  function pan(cx, name, val) {
    const g = s('g', { class: `mm-visual__pan is-${val || 'same'}` });
    g.append(s('line', { x1: cx, y1: 60, x2: cx, y2: 82, stroke: COLORS.navy, 'stroke-width': 2 }));
    g.append(s('rect', { x: cx - 52, y: 82, width: 104, height: 50, rx: 10, fill: COLORS.cream, stroke: COLORS.teal, 'stroke-width': 2.5 }));
    g.append(s('text', { x: cx, y: 102, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: COLORS.navy }, name));
    g.append(s('text', { x: cx, y: 123, 'text-anchor': 'middle', 'font-size': 14, fill: COLORS.teal, 'font-weight': 700 }, `${ARROW[val] || '='} ${cap(word(val))}`));
    return g;
  }
}

function renderAgreement(spec) {
  const fig = figure('agreement', spec.title || 'Price agreement (pretend)');
  const card = h('div', { class: 'mm-agreement', role: 'group', 'aria-label': `Agreement: ${spec.seller} agrees to sell ${spec.quantity} ${spec.item} to ${spec.buyer} for ${typeof spec.price === 'number' ? formatMoney(spec.price) : spec.price}, ${spec.when}.` });
  card.append(h('p', { class: 'mm-agreement__head', text: 'We agree today on a price for later' }));
  const dl = h('dl', { class: 'mm-agreement__terms' });
  const rows = [['Item', spec.item], ['Buyer', spec.buyer], ['Seller', spec.seller], ['Agreed price', typeof spec.price === 'number' ? formatMoney(spec.price) : spec.price], ['Quantity', String(spec.quantity)], ['When', spec.when]];
  for (const [k, v] of rows) if (v != null && v !== '') dl.append(h('div', { class: 'mm-agreement__row' }, h('dt', { text: k }), h('dd', { text: String(v) })));
  card.append(dl, h('p', { class: 'mm-agreement__note', text: 'A practice example. Not a real contract.' }));
  fig.append(card);
  return fig;
}

function renderImage(spec) {
  // Same look as js/ui/art.js placeholders (.placeholder-art / .ph-frame) so all placeholders match.
  const fig = h('figure', { class: 'mm-visual mm-visual--image art-figure placeholder-art' });
  const file = String(spec.asset || '').split('/').pop() || 'illustration not named yet';
  const box = h('div', { class: 'ph-frame' });
  const icon = s('svg', { viewBox: '0 0 48 48', width: 48, height: 48, 'aria-hidden': 'true', focusable: 'false', class: 'ph-icon' },
    s('rect', { x: 4, y: 8, width: 40, height: 32, rx: 4, fill: 'none', stroke: COLORS.teal, 'stroke-width': 3 }),
    s('circle', { cx: 16, cy: 19, r: 4, fill: COLORS.gold }),
    s('path', { d: 'M8 36 L20 25 L28 32 L34 27 L42 35', fill: 'none', stroke: COLORS.navy, 'stroke-width': 3, 'stroke-linejoin': 'round' }));
  box.append(icon,
    h('p', { class: 'ph-label', text: 'Illustration coming soon' }),
    spec.alt ? h('p', { class: 'ph-alt' }, h('span', { class: 'sr-only', text: 'Planned picture: ' }), spec.alt) : null,
    h('code', { text: file }));
  fig.append(box);
  if (spec.caption) fig.append(h('figcaption', { text: spec.caption }));
  return fig;
}

const RENDERERS = { line: renderLine, bars: renderBars, candles: renderCandles, priceTags: renderPriceTags, supplyDemand: renderSupplyDemand, agreement: renderAgreement, image: renderImage };

/** Render a visual spec. Unknown/invalid kinds return a harmless empty figure. */
export function renderVisual(spec, { band = 'explorer' } = {}) {
  const fn = spec && RENDERERS[spec.kind];
  if (!fn) {
    console.warn('renderVisual: unknown visual kind', spec && spec.kind);
    return h('figure', { class: 'mm-visual mm-visual--empty', 'aria-hidden': 'true' });
  }
  try {
    const el = fn(spec, band);
    el.dataset.band = band;
    return el;
  } catch (e) {
    console.warn('renderVisual: could not draw', spec.kind, e);
    return h('figure', { class: 'mm-visual mm-visual--empty', 'aria-hidden': 'true' });
  }
}
