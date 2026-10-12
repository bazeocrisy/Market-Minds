// World 4: line-chart-reading, candlestick-reading, long-short, chart-limits. All prices are pretend.
// Accuracy rules: every chart answer is computed from the exact data that is rendered; candles are valid
// (low ≤ min(open, close) ≤ max(open, close) ≤ high); up candles are described as hollow with ▲ and down candles
// as filled with ▼ — never by color alone; long gains when the price rises, short gains when it falls, and both
// can lose; charts show what happened, not why, and past movement never guarantees future prices.
import { NAMES, DETECTIVES, GOODS, MONTHS, EVENTS } from './pools.js';
import { openClose } from './futures2.js';

const MINUS = '−';
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const plain = (s) => s.replace(/\[\[([\w-]+)(\|[^\]]+)?\]\]/g, (m0, id, shown) => (shown ? shown.slice(1) : id.replace(/-/g, ' ')));
const signed = (cents, m) => (cents < 0 ? MINUS + m(-cents) : m(cents));
const DAYS5 = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAYS7 = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const UP_DESC = 'hollow body, ▲';
const DOWN_DESC = 'filled body, ▼';

const TEACH_LC = {
  explorer: 'A line chart shows how a price changed over time. The labels along the bottom are the times (days, weeks, or months). The numbers up the side are prices. To read a price, find the time along the bottom, go straight up to the line, then across to the price. The highest point is the highest price; the lowest point is the lowest price. To find a change, subtract: later price − earlier price. If the line goes up from left to right, the price rose; if it goes down, the price fell. A chart shows what already happened — it does not tell us what will happen next.',
  analyst: 'Read a line chart by matching a label on the horizontal axis to the point above it and the value on the vertical axis (the "Show the numbers" table gives exact values). Change between two points = later value − earlier value (negative means the price fell). Percent change = (change ÷ EARLIER value) × 100, rounded as the question says. Example: $4.00 → $4.50 is +$0.50; 0.50 ÷ 4.00 = 0.125 → 13% to the nearest whole percent. Look at the whole interval: a price can rise overall even if it dipped in between. A chart describes the past; it does not predict the future.'
};
const TEACH_CS = {
  explorer: 'A candlestick shows four prices for one time period: the open (first price), the close (last price), the high (highest price), and the low (lowest price). The thick part is the body — it runs from the open to the close. The thin lines are the wicks — they reach up to the high and down to the low. In our charts, an UP candle (closed higher than it opened) has a hollow body with ▲, so its open is at the bottom of the body and its close at the top. A DOWN candle (closed lower than it opened) has a filled body with ▼, so its open is at the top. The range is high − low.',
  analyst: 'Each candlestick summarizes one period with OHLC: open, high, low, close. Body = the span between open and close; wicks extend to the high and low. Up candle (close > open): hollow body with ▲ in our charts — open at the bottom of the body, close at the top. Down candle (close < open): filled body with ▼ — open at the top, close at the bottom. Range = high − low (wick tip to wick tip); body size = |close − open|, which is never more than the range. "Biggest move" questions must say which one they mean. A candle describes what happened; it does not reliably predict the next period.'
};
const TEACH_LS = {
  explorer: 'Being LONG means you bought (or agreed to buy). A long position gains when the price goes up and loses when it goes down. Being SHORT means you sold (or agreed to sell) first. A short position gains when the price goes down and loses when it goes up. "Long" and "short" are the names of the two sides — they do not mean a long time or a small amount. Whatever one side gains, the other side loses. Both sides can lose, and nobody knows which way the price will go.',
  analyst: 'Long = bought; gain per unit = (later price − entry price). Short = sold first; gain per unit = (entry price − later price). Total = per-unit result × quantity, with a minus sign for a loss. Example (pretend): short 1,000 units at $5.40, price rises to $5.65 → ($5.40 − $5.65) × 1,000 = −$250. "Long" and "short" describe direction, not size or time. In futures, every long has a matching short, so one side\'s gain is the other\'s loss — and either side can lose.'
};
const TEACH_CL = {
  explorer: 'A price chart shows what ALREADY happened. It cannot promise what happens next. A price that went up five days in a row could go down tomorrow — or up, or stay the same. A chart also does not tell you WHY a price moved; for that you need other information, like news about the weather or what people want. News can surprise everyone and change a price suddenly. The most careful statements describe the past exactly and admit that nobody knows the future for sure.',
  analyst: 'Charts record past prices; they do not guarantee future ones. Streaks ("up five days in a row") do not make the next move certain in either direction, and a chart alone does not explain causes — supply, demand, costs, and surprising news do, and news can move prices suddenly. A careful analyst separates what the chart shows (past values, highs, lows, changes) from what it cannot show (the future, the reasons), and says "not enough information" when the chart cannot answer the question.'
};

/** Labels for n points. */
function labelsFor(c, n) {
  const opts = ['week', 'month'];
  if (n === 5 || n === 7) opts.push('day');
  const k = c.pick(opts);
  if (k === 'day') return n === 5 ? DAYS5.slice() : DAYS7.slice();
  if (k === 'month') { const mi = c.int(0, 12 - n); return MONTHS.slice(mi, mi + n); }
  return Array.from({ length: n }, (_, i) => `Week ${i + 1}`);
}

/** Goods whose prices fit the band/difficulty. */
const goodsFor = (c) => GOODS.filter((g) => c.A || !c.easy || g.hi <= 9);

/** A price series (cents) with a unique highest and lowest point. Explorer: whole dollars within the cap. */
function series(c, g, n, test) {
  const top = c.A ? 99 * 100 : c.cap * 100;
  for (let t = 0; t < 80; t++) {
    let v = c.price(g.lo, Math.min(g.hi, top / 100));
    const out = [v];
    for (let k = 1; k < n; k++) {
      const mag = c.A ? (c.easy ? c.int(1, 3) * 25 : c.medium ? c.int(1, 8) * 5 : c.int(3, 40)) : c.int(1, 3) * 100;
      let nv = v + (c.chance(0.5) ? mag : -mag);
      if (nv < 100 || nv > top) nv = v + (nv < 100 ? mag : -mag);
      if (nv < 100 || nv > top) nv = v;
      v = nv; out.push(v);
    }
    const mx = Math.max(...out), mn = Math.min(...out);
    if (out.filter((x) => x === mx).length !== 1 || out.filter((x) => x === mn).length !== 1) continue;
    if (test && !test(out)) continue;
    return out;
  }
  return null;
}

function lineChart(c, n, test) {
  const [gi, g] = c.pickI(goodsFor(c));
  const v = series(c, g, n, test);
  if (!v) return null;
  const L = labelsFor(c, n);
  return { gi, g, v, L, visual: { kind: 'line', title: `Pretend price of ${g.item} (per ${g.unit})`, unit: '$', points: L.map((l, k) => ({ label: l, value: v[k] / 100 })) } };
}

/** Valid OHLC candles (cents). Distinct open/high/low/close in each candle; no flat candles. */
function candles(c, n, test) {
  const s = c.A ? (c.easy ? 25 : c.medium ? 5 : 1) : 100;
  const top = c.A ? 99 * 100 : c.cap * 100;
  const [gi, g] = c.pickI(goodsFor(c));
  for (let t = 0; t < 80; t++) {
    let prev = c.price(g.lo, Math.min(g.hi, top / 100));
    const cs = [];
    for (let k = 0; k < n; k++) {
      const open = prev + c.int(-1, 1) * s * (c.A && c.challenge ? 5 : 1);
      const body = (c.A ? (c.challenge ? c.int(5, 40) : c.int(1, 5)) : c.int(1, 3)) * s * (c.chance(0.5) ? 1 : -1);
      const close = open + body;
      const hiW = (c.A && c.challenge ? c.int(2, 20) : c.int(1, 2)) * s, loW = (c.A && c.challenge ? c.int(2, 20) : c.int(1, 2)) * s;
      cs.push({ open, close, high: Math.max(open, close) + hiW, low: Math.min(open, close) - loW });
      prev = close;
    }
    if (cs.some((x) => x.low < 100 || x.high > top)) continue;
    if (test && !test(cs)) continue;
    const L = n === 5 && c.chance(0.4) ? DAYS5.slice() : Array.from({ length: n }, (_, i) => `${c.A && c.chance(0.5) ? 'Week' : 'Day'} ${i + 1}`);
    if (L[0].startsWith('Week')) for (let i = 0; i < n; i++) L[i] = `Week ${i + 1}`;
    return {
      gi, g, cs, L,
      visual: { kind: 'candles', title: `Pretend price of ${g.item} (per ${g.unit})`, unit: '$', candles: cs.map((x, k) => ({ label: L[k], open: x.open / 100, high: x.high / 100, low: x.low / 100, close: x.close / 100 })) }
    };
  }
  return null;
}
const isUp = (x) => x.close > x.open;
const sigOf = (arr) => arr.map((x) => (typeof x === 'object' ? `${x.open}/${x.high}/${x.low}/${x.close}` : x)).join('-');

/** Fill the wrong-choice list from candidates (unique, not the correct text). */
function pickWrongs(correct, cands, n = 3) {
  const out = [], seen = new Set([correct.toLowerCase()]);
  for (const w of cands) { const k = w[0].toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push(w); } if (out.length === n) break; }
  return out;
}

const TEMPLATES = [
  // ---------------------------------------------------------------- line-chart-reading
  {
    id: 'lc-read', skill: 'line-chart-reading', kind: 'chart', type: 'number', targets: ['misread-chart'],
    make(c) {
      const n = c.int(5, 8), C = lineChart(c, n);
      if (!C) return { invalid: true };
      const i = c.int(0, n - 1);
      return {
        sig: `${C.gi}.${sigOf(C.v)}.${C.L[0]}.${i}`,
        prompt: `The [[line-chart|line chart]] shows a pretend price of ${C.g.item} over time. What was the price per ${C.g.unit} in ${C.L[i]}?`,
        visual: C.visual, answer: C.v[i] / 100, prefix: '$', data: { i },
        errors: [...(i > 0 ? [[C.v[i - 1] / 100, 'misread-chart']] : []), ...(i < n - 1 ? [[C.v[i + 1] / 100, 'misread-chart']] : [])],
        hints: [`Find ${C.L[i]} along the bottom of the chart.`, 'Go straight up from that label to the line, then across to the price scale on the side.', 'You can check your reading in the "Show the numbers" table under the chart.'],
        explanation: `Above ${C.L[i]}, the line is at ${c.m(C.v[i])}. Always match the exact label the question names.`
      };
    }
  },
  {
    id: 'lc-highlow', skill: 'line-chart-reading', kind: 'chart', type: 'choice', targets: ['misread-chart'],
    make(c) {
      const n = c.int(5, 8), C = lineChart(c, n);
      if (!C) return { invalid: true };
      const hi = c.chance(0.5), iMax = C.v.indexOf(Math.max(...C.v)), iMin = C.v.indexOf(Math.min(...C.v));
      const ans = hi ? iMax : iMin, opp = hi ? iMin : iMax;
      const rest = c.shuffle([...Array(n).keys()].filter((k) => k !== ans && k !== opp));
      const cands = [opp, n - 1, 0, ...rest].filter((k) => k !== ans);
      const wrongs = pickWrongs(C.L[ans], cands.map((k) => [C.L[k], 'misread-chart']));
      return {
        sig: `${C.gi}.${sigOf(C.v)}.${C.L[0]}.${hi ? 'h' : 'l'}`,
        prompt: `The chart shows a pretend price of ${C.g.item}. When was the price the ${hi ? 'HIGHEST' : 'LOWEST'}?`,
        visual: C.visual, correct: C.L[ans], wrongs,
        hints: [hi ? 'Look for the point that is highest up on the chart.' : 'Look for the point that is lowest down on the chart.', 'The latest date (on the right) is not always the highest or lowest.', 'Then read the label straight below that point.'],
        explanation: `The ${hi ? 'highest' : 'lowest'} point is above ${C.L[ans]}, at ${c.m(C.v[ans])}.`
      };
    }
  },
  {
    id: 'lc-change', skill: 'line-chart-reading', kind: 'chart', type: 'number', targets: ['added-instead', 'used-wrong-number', 'wrong-direction', 'misread-chart'],
    make(c) {
      const n = c.int(5, 8), C = lineChart(c, n);
      if (!C) return { invalid: true };
      const [i, j] = c.sampleI(C.v, 2);
      const ch = C.v[j] - C.v[i];
      if (ch === 0) return { invalid: true };
      const sgn = c.A && !c.easy;
      return {
        sig: `${C.gi}.${sigOf(C.v)}.${C.L[0]}.${i}.${j}.${sgn ? 's' : ''}`,
        prompt: sgn
          ? `Using the chart, what was the change in the price of ${C.g.item} from ${C.L[i]} to ${C.L[j]}? Use a minus sign (−) if the price went down.`
          : `Using the chart, how much did the price of ${C.g.item} go ${ch > 0 ? 'up' : 'down'} from ${C.L[i]} to ${C.L[j]}?`,
        visual: C.visual, answer: (sgn ? ch : Math.abs(ch)) / 100, prefix: '$', data: { i, j, signed: sgn ? 1 : 0 },
        errors: [[(C.v[i] + C.v[j]) / 100, 'added-instead'], [C.v[j] / 100, 'used-wrong-number'], [C.v[i] / 100, 'used-wrong-number'], ...(sgn ? [[-ch / 100, 'wrong-direction']] : [])],
        hints: [`Read two prices: the one at ${C.L[i]} and the one at ${C.L[j]}.`, 'Change = later price − earlier price.', sgn ? 'Is the later price higher or lower? That decides the sign.' : 'Subtract the smaller price from the larger one.'],
        explanation: `${C.L[i]}: ${c.m(C.v[i])}. ${C.L[j]}: ${c.m(C.v[j])}. ${c.m(C.v[j])} ${MINUS} ${c.m(C.v[i])} = ${signed(ch, c.m)}, so the price went ${ch > 0 ? 'up' : 'down'} ${c.m(Math.abs(ch))}.`
      };
    }
  },
  {
    id: 'lc-direction', skill: 'line-chart-reading', kind: 'chart', type: 'choice', targets: ['wrong-direction', 'misread-chart', 'chart-hides-past'],
    make(c) {
      const n = c.int(5, 8), C = lineChart(c, n);
      if (!C) return { invalid: true };
      const i = c.int(0, n - 3), j = c.int(i + 2, n - 1), up = C.v[j] > C.v[i];
      if (C.v[j] === C.v[i]) return { invalid: true };
      const UP = 'It went up overall.', DN = 'It went down overall.';
      return {
        sig: `${C.gi}.${sigOf(C.v)}.${C.L[0]}.${i}.${j}`,
        prompt: `Look at the chart from ${C.L[i]} to ${C.L[j]}. Which sentence describes the price of ${C.g.item} over that time?`,
        visual: C.visual, correct: up ? UP : DN,
        wrongs: [[up ? DN : UP, 'wrong-direction'], ['It stayed exactly the same.', 'misread-chart'], ['You cannot tell from a line chart.', 'chart-hides-past']],
        hints: [`Find the point at ${C.L[i]} and the point at ${C.L[j]}.`, 'Overall means: compare where the price STARTED with where it ENDED for that time.', 'Ups and downs in between do not change the overall direction.'],
        explanation: `At ${C.L[i]} the price was ${c.m(C.v[i])}; at ${C.L[j]} it was ${c.m(C.v[j])}. The ending price is ${up ? 'higher' : 'lower'}, so it went ${up ? 'up' : 'down'} overall.`
      };
    }
  },
  {
    id: 'lc-percent', skill: 'line-chart-reading', kind: 'chart', type: 'number', bands: ['analyst'], targets: ['percent-of-new', 'percent-not-divided', 'misread-chart'],
    make(c) {
      const n = c.int(5, 8), C = lineChart(c, n);
      if (!C) return { invalid: true };
      const i = c.int(0, n - 2), j = c.int(i + 1, n - 1), d = C.v[j] - C.v[i], ad = Math.abs(d);
      if (!d || ((ad * 200) % C.v[i] === 0 && ((ad * 200) / C.v[i]) % 2 === 1)) return { invalid: true };   // no .5 ties
      const pct = Math.round((ad * 100) / C.v[i]);
      return {
        sig: `${C.gi}.${sigOf(C.v)}.${C.L[0]}.${i}.${j}`,
        prompt: `Using the chart, by what percent did the price of ${C.g.item} ${d > 0 ? 'rise' : 'fall'} from ${C.L[i]} to ${C.L[j]}? Round to the nearest whole percent.`,
        visual: C.visual, answer: pct, unit: '%', tolerance: 0, data: { i, j },
        errors: [[Math.round((ad * 100) / C.v[j]), 'percent-of-new'], [ad / 100, 'percent-not-divided']],
        hints: [`Step 1: read both prices and find the change from ${C.L[i]} to ${C.L[j]}.`, 'Step 2: divide the change by the STARTING (earlier) price.', 'Step 3: multiply by 100 and round to the nearest whole percent.'],
        explanation: `Change: ${c.m(Math.max(C.v[i], C.v[j]))} ${MINUS} ${c.m(Math.min(C.v[i], C.v[j]))} = ${c.m(ad)}. ${c.m(ad)} ÷ ${c.m(C.v[i])} × 100 ≈ ${pct}%, a ${d > 0 ? 'rise' : 'fall'} of about ${pct}%.`
      };
    }
  },
  {
    id: 'lc-match', skill: 'line-chart-reading', kind: 'chart', type: 'match', targets: ['misread-chart'],
    make(c) {
      const n = c.int(5, 8);
      const C = lineChart(c, n, (v) => { const a = v.indexOf(Math.max(...v)), b = v.indexOf(Math.min(...v)); return a > 0 && a < n - 1 && b > 0 && b < n - 1; });
      if (!C) return { invalid: true };
      const iMax = C.v.indexOf(Math.max(...C.v)), iMin = C.v.indexOf(Math.min(...C.v));
      const at = (k) => `${c.m(C.v[k])} (${C.L[k]})`;
      const pairs = [['Highest price', at(iMax)], ['Lowest price', at(iMin)], ['Starting price', at(0)], ['Ending price', at(n - 1)]];
      return {
        sig: `${C.gi}.${sigOf(C.v)}.${C.L[0]}`, prompt: `Use the chart of a pretend price of ${C.g.item}. Match each description to the right point.`,
        visual: C.visual, pairs,
        hints: ['Starting = the first point on the left. Ending = the last point on the right.', 'Highest = the point that is highest up. Lowest = the point that is lowest down.', 'Check each price in the "Show the numbers" table.'],
        explanation: pairs.map((p) => `${p[0]}: ${p[1]}.`).join(' ')
      };
    }
  },
  {
    id: 'lc-fill', skill: 'line-chart-reading', kind: 'vocab', type: 'fill', targets: ['misread-chart', 'wrong-direction', 'past-predicts-future'],
    make(c) {
      const F = [
        { s: 'A [[line-chart|line chart]] shows how a price changes over ___.', c: 'time', w: [['color', 'vocab-mixup'], ['distance', 'vocab-mixup'], ['the future', 'past-predicts-future']] },
        { s: 'On a price chart, the labels along the bottom usually show ___.', c: 'dates', w: [['prices', 'misread-chart'], ['buyers', 'vocab-mixup'], ['future prices', 'past-predicts-future']] },
        { s: 'When the line slopes down from left to right, the price went ___.', c: 'down', w: [['up', 'wrong-direction'], ['nowhere', 'misread-chart'], ['backward', 'vocab-mixup']] },
        { s: 'The highest point on the line shows the ___ price on the chart.', c: 'highest', w: [['lowest', 'misread-chart'], ['future', 'past-predicts-future'], ['starting', 'misread-chart']] },
        { s: 'The general direction a price has moved over time is called a ___.', c: 'trend', w: [['guarantee', 'past-predicts-future'], ['wick', 'vocab-mixup'], ['receipt', 'vocab-mixup']] }
      ];
      const [i, f] = c.pickI(F);
      return {
        sig: `${i}`, prompt: 'Choose the word that best completes the sentence.', sentence: f.s, correct: f.c, wrongs: f.w,
        hints: ['Read the sentence with each choice in the blank.', 'Bottom of the chart = when. Side of the chart = how much.', 'Left to right is earlier to later.'],
        explanation: `"${plain(f.s).replace('___', f.c)}"`
      };
    }
  },
  {
    id: 'lc-mistake', skill: 'line-chart-reading', kind: 'mistake-detective', type: 'choice', targets: ['misread-chart', 'added-instead'],
    make(c) {
      const n = c.int(5, 8), C = lineChart(c, n);
      if (!C) return { invalid: true };
      const { v, L } = C, who = c.pick(DETECTIVES);
      const M = [];
      const i = c.int(0, n - 2);
      if (v[i] !== v[i + 1]) M.push({ says: `The price in ${L[i]} was ${c.m(v[i + 1])}.`, c: `${who} read the point for ${L[i + 1]}, not ${L[i]}. Always line up the exact label.`, mis: 'misread-chart' });
      const iMax = v.indexOf(Math.max(...v));
      if (iMax !== n - 1) M.push({ says: `The highest price was in ${L[n - 1]}, because it is the last point.`, c: `The highest point is above ${L[iMax]}. The last point is just the latest date, not the highest.`, mis: 'misread-chart' });
      const up = v[n - 1] > v[0], dips = [...Array(n - 1).keys()].filter((k) => (up ? v[k + 1] < v[k] : v[k + 1] > v[k]));
      if (v[n - 1] !== v[0] && dips.length) { const k = dips[0]; M.push({ says: `From ${L[0]} to ${L[n - 1]}, the price went ${up ? 'up' : 'down'} every single time.`, c: `It went ${up ? 'up' : 'down'} overall, but from ${L[k]} to ${L[k + 1]} it went ${up ? 'down' : 'up'}.`, mis: 'misread-chart' }); }
      if (v[n - 1] !== v[0]) M.push({ says: `From ${L[0]} to ${L[n - 1]}, the price changed by ${c.m(v[0] + v[n - 1])}.`, c: `${who} added the two prices. A change is found by subtracting: later price − earlier price.`, mis: 'added-instead' });
      if (!M.length) return { invalid: true };
      const foc = M.map((m, k) => [k, m]).filter(([, m]) => m.mis === c.focus);
      const [mi, x] = foc.length ? c.pick(foc) : c.pickI(M);
      const fill = [['The mistake is that charts can only show one day.', 'vocab-mixup'], ['The mistake is that prices never change.', 'prices-never-change'], ['The mistake is that the chart shows the future.', 'past-predicts-future']];
      const fi = c.sampleI(fill, 2);
      return {
        sig: `${C.gi}.${sigOf(v)}.${L[0]}.${mi}.${x.mis}.${who}.${fi.join('')}`, prompt: `Mistake Detective: ${who} looks at this chart of a pretend price of ${C.g.item} and says, "${x.says}" What is the mistake?`,
        visual: C.visual, correct: x.c, wrongs: [[`${who} is right — there is no mistake.`, x.mis], ...fi.map((k) => fill[k])],
        hints: [`Check what ${who} said against the chart, point by point.`, 'Match each label along the bottom to the point straight above it.', 'A change is a subtraction; "every time" means no dips at all.'],
        explanation: x.c
      };
    }
  },

  // ---------------------------------------------------------------- candlestick-reading
  {
    id: 'cs-ohlc', skill: 'candlestick-reading', kind: 'chart', type: 'number', targets: ['candle-open-close-mixup', 'candle-wick-body-mixup', 'misread-chart'],
    make(c) {
      const n = c.int(4, 5), K = candles(c, n);
      if (!K) return { invalid: true };
      const i = c.int(0, n - 1), x = K.cs[i], up = isUp(x);
      const field = c.focus === 'candle-open-close-mixup' ? c.pick(['open', 'close']) : c.focus === 'candle-wick-body-mixup' ? c.pick(['high', 'low']) : c.pick(['open', 'high', 'low', 'close']);
      const E = {
        open: [[x.close, 'candle-open-close-mixup'], [up ? x.low : x.high, 'candle-wick-body-mixup']],
        close: [[x.open, 'candle-open-close-mixup'], [up ? x.high : x.low, 'candle-wick-body-mixup']],
        high: [[Math.max(x.open, x.close), 'candle-wick-body-mixup'], [x.low, 'misread-chart']],
        low: [[Math.min(x.open, x.close), 'candle-wick-body-mixup'], [x.high, 'misread-chart']]
      }[field];
      const H = {
        open: [`First decide: is the ${K.L[i]} candle an up candle (${UP_DESC}) or a down candle (${DOWN_DESC})?`, 'On an up candle the open is the BOTTOM of the body; on a down candle the open is the TOP of the body.'],
        close: [`First decide: is the ${K.L[i]} candle an up candle (${UP_DESC}) or a down candle (${DOWN_DESC})?`, 'On an up candle the close is the TOP of the body; on a down candle the close is the BOTTOM of the body.'],
        high: [`Find the ${K.L[i]} candle.`, 'The high is the very top of the thin line above the body (the upper wick), not the top of the body.'],
        low: [`Find the ${K.L[i]} candle.`, 'The low is the very bottom of the thin line below the body (the lower wick), not the bottom of the body.']
      }[field];
      return {
        sig: `${K.gi}.${sigOf(K.cs)}.${K.L[0]}.${i}.${field}`,
        prompt: `Look at the ${K.L[i]} [[candlestick]] on the chart. What was its ${field.toUpperCase()} price per ${K.g.unit}?`,
        visual: K.visual, answer: x[field] / 100, prefix: '$', data: { i, field },
        errors: E.map(([v, m]) => [v / 100, m]),
        hints: [...H, 'You can check the exact numbers in the "Show the numbers" table.'],
        explanation: `The ${K.L[i]} candle is ${up ? `an up candle (${UP_DESC})` : `a down candle (${DOWN_DESC})`}: open ${c.m(x.open)}, high ${c.m(x.high)}, low ${c.m(x.low)}, close ${c.m(x.close)}. So its ${field} was ${c.m(x[field])}.`
      };
    }
  },
  {
    id: 'cs-direction', skill: 'candlestick-reading', kind: 'chart', type: 'choice', targets: ['candle-open-close-mixup', 'candle-wick-body-mixup', 'chart-hides-past'],
    make(c) {
      const UP = `An up candle (${UP_DESC}) — it closed higher than it opened.`;
      const DN = `A down candle (${DOWN_DESC}) — it closed lower than it opened.`;
      const text = c.chance(0.5);
      let prompt, visual, x, sig, label;
      if (text) {
        const K = candles(c, 1);
        if (!K) return { invalid: true };
        x = K.cs[0];
        prompt = `One day, a pretend price of ${K.g.item} opened at ${c.m(x.open)}, went as high as ${c.m(x.high)} and as low as ${c.m(x.low)}, and closed at ${c.m(x.close)}. How would its [[candlestick]] be drawn?`;
        sig = `t.${K.gi}.${sigOf(K.cs)}`; label = 'this';
      } else {
        const n = c.int(4, 5), K = candles(c, n);
        if (!K) return { invalid: true };
        const i = c.int(0, n - 1); x = K.cs[i]; visual = K.visual; label = `the ${K.L[i]}`;
        prompt = `Look at the ${K.L[i]} candle on the chart. What kind of candle is it?`;
        sig = `v.${K.gi}.${sigOf(K.cs)}.${K.L[0]}.${i}`;
      }
      const up = isUp(x);
      return {
        sig, prompt, ...(visual ? { visual } : {}), correct: up ? UP : DN,
        wrongs: [[up ? DN : UP, 'candle-open-close-mixup'], [up ? 'A down candle, because its low is below its open.' : 'An up candle, because its high is above its open.', 'candle-wick-body-mixup'], ['You cannot tell whether the price rose or fell from a candle.', 'chart-hides-past']],
        hints: ['Compare just two prices: the open and the close.', 'The high and low (the wicks) do not decide up or down.', 'Close higher than open → up (hollow, ▲). Close lower than open → down (filled, ▼).'],
        explanation: `${cap(label)} candle opened at ${c.m(x.open)} and closed at ${c.m(x.close)}. The close is ${up ? 'higher' : 'lower'}, so it is ${up ? `an up candle (${UP_DESC})` : `a down candle (${DOWN_DESC})`}.`
      };
    }
  },
  {
    id: 'cs-range', skill: 'candlestick-reading', kind: 'chart', type: 'number', targets: ['range-body-only', 'used-wrong-number', 'added-instead'],
    make(c) {
      const n = c.int(4, 5), K = candles(c, n);
      if (!K) return { invalid: true };
      const i = c.int(0, n - 1), x = K.cs[i];
      return {
        sig: `${K.gi}.${sigOf(K.cs)}.${K.L[0]}.${i}`,
        prompt: `The range of a candle is its high minus its low. What was the range of the ${K.L[i]} candle?`,
        visual: K.visual, answer: (x.high - x.low) / 100, prefix: '$', data: { i },
        errors: [[Math.abs(x.close - x.open) / 100, 'range-body-only'], [x.high / 100, 'used-wrong-number'], [(x.high + x.low) / 100, 'added-instead']],
        hints: [`Find the ${K.L[i]} candle and read its high (top of the upper wick) and its low (bottom of the lower wick).`, 'Use the wick tips, not the ends of the body.', 'Range = high − low.'],
        explanation: `High ${c.m(x.high)} ${MINUS} low ${c.m(x.low)} = ${c.m(x.high - x.low)}. (The body alone, from open to close, is only ${c.m(Math.abs(x.close - x.open))}.)`
      };
    }
  },
  {
    id: 'cs-biggest', skill: 'candlestick-reading', kind: 'chart', type: 'choice', targets: ['range-body-only', 'misread-chart'],
    make(c) {
      const body = c.focus === 'range-body-only' ? c.chance(0.5) : c.chance(0.5);
      const bodyOf = (x) => Math.abs(x.close - x.open), rangeOf = (x) => x.high - x.low;
      const metric = body ? bodyOf : rangeOf, other = body ? rangeOf : bodyOf;
      const uniqMax = (cs, f) => { const m = Math.max(...cs.map(f)); return cs.filter((x) => f(x) === m).length === 1; };
      const n = c.int(4, 5);
      const K = candles(c, n, (cs) => uniqMax(cs, metric) && uniqMax(cs, other) && cs.map(metric).indexOf(Math.max(...cs.map(metric))) !== cs.map(other).indexOf(Math.max(...cs.map(other))));
      if (!K) return { invalid: true };
      const ans = K.cs.map(metric).indexOf(Math.max(...K.cs.map(metric)));
      const trap = K.cs.map(other).indexOf(Math.max(...K.cs.map(other)));
      const rest = c.shuffle([...Array(n).keys()].filter((k) => k !== ans && k !== trap));
      const wrongs = [[K.L[trap], 'range-body-only'], ...rest.slice(0, 2).map((k) => [K.L[k], 'misread-chart'])];
      return {
        sig: `${K.gi}.${sigOf(K.cs)}.${K.L[0]}.${body ? 'b' : 'r'}`,
        prompt: body ? 'Which candle had the biggest change from its OPEN to its CLOSE (the tallest body)?' : 'Which candle had the biggest RANGE, from its low to its high (wick tip to wick tip)?',
        visual: K.visual, correct: K.L[ans], wrongs,
        hints: [body ? 'Look only at the bodies — the thick parts between open and close.' : 'Look at the whole candle, from the bottom of the lower wick to the top of the upper wick.', body ? 'Ignore the wicks for this question.' : 'Include the wicks for this question.', 'The "Show the numbers" table lets you subtract to check.'],
        explanation: body
          ? `${K.L[ans]} moved ${c.m(bodyOf(K.cs[ans]))} from open to close — the most. ${K.L[trap]} has the biggest range (wick to wick), but a smaller body.`
          : `${K.L[ans]} has a range of ${c.m(rangeOf(K.cs[ans]))} — the biggest. ${K.L[trap]} has the tallest body, but its wicks are shorter.`
      };
    }
  },
  {
    id: 'cs-match', skill: 'candlestick-reading', kind: 'vocab', type: 'match', targets: ['candle-wick-body-mixup', 'candle-open-close-mixup'],
    make(c) {
      const P = [
        ['Body', 'The thick part, between the open and the close'],
        ['Upper wick', 'The thin line that reaches up to the high'],
        ['Lower wick', 'The thin line that reaches down to the low'],
        ['Open', 'The first price of the time period'],
        ['Close', 'The last price of the time period'],
        ['High', 'The highest price during the time period'],
        ['Low', 'The lowest price during the time period'],
        ['Hollow body with ▲', 'An up candle: it closed higher than it opened'],
        ['Filled body with ▼', 'A down candle: it closed lower than it opened']
      ];
      const idx = c.sampleI(P, 4);
      return {
        sig: idx.join('.'), prompt: 'Match each part of a [[candlestick]] to what it means.', pairs: idx.map((i) => P[i]),
        hints: ['Start with the part you are surest about.', 'The body is about open and close; the wicks are about high and low.', 'Hollow with ▲ = up; filled with ▼ = down.'],
        explanation: idx.map((i) => `${P[i][0]}: ${P[i][1].charAt(0).toLowerCase() + P[i][1].slice(1)}.`).join(' ')
      };
    }
  },
  {
    id: 'cs-fill', skill: 'candlestick-reading', kind: 'vocab', type: 'fill', targets: ['candle-open-close-mixup', 'candle-wick-body-mixup', 'range-body-only'],
    make(c) {
      const F = [
        { s: `On an up candle (${UP_DESC}), the ___ is at the bottom of the body.`, c: 'open', w: [['close', 'candle-open-close-mixup'], ['high', 'candle-wick-body-mixup'], ['low', 'candle-wick-body-mixup']] },
        { s: `On a down candle (${DOWN_DESC}), the ___ is at the bottom of the body.`, c: 'close', w: [['open', 'candle-open-close-mixup'], ['high', 'candle-wick-body-mixup'], ['low', 'candle-wick-body-mixup']] },
        { s: 'The top of the upper wick shows the ___ price.', c: 'high', w: [['open', 'candle-wick-body-mixup'], ['close', 'candle-wick-body-mixup'], ['low', 'misread-chart']] },
        { s: 'A candle that closed lower than it opened is a ___ candle.', c: 'down', w: [['up', 'candle-open-close-mixup'], ['hollow', 'candle-open-close-mixup'], ['wick', 'vocab-mixup']] },
        { s: 'The thick part of a [[candlestick]], between the open and the close, is called the ___.', c: 'body', w: [['wick', 'candle-wick-body-mixup'], ['trend', 'vocab-mixup'], ['range', 'range-body-only']] },
        { s: 'The range of a candle is its high minus its ___.', c: 'low', w: [['open', 'range-body-only'], ['close', 'range-body-only'], ['high', 'vocab-mixup']] }
      ];
      const [i, f] = c.pickI(F);
      return {
        sig: `${i}`, prompt: 'Choose the word that best completes the sentence.', sentence: f.s, correct: f.c, wrongs: f.w,
        hints: ['Read the sentence with each choice in the blank.', 'Body = open to close. Wicks = out to the high and the low.', 'Up candles (hollow, ▲) start at the bottom of the body; down candles (filled, ▼) start at the top.'],
        explanation: `"${plain(f.s).replace('___', f.c)}"`
      };
    }
  },
  {
    id: 'cs-mistake', skill: 'candlestick-reading', kind: 'mistake-detective', type: 'choice', targets: ['candle-open-close-mixup', 'range-body-only', 'candle-wick-body-mixup', 'past-predicts-future'],
    make(c) {
      const n = c.int(4, 5), K = candles(c, n);
      if (!K) return { invalid: true };
      const i = c.int(0, n - 1), x = K.cs[i], up = isUp(x), lab = K.L[i];
      const M = [
        up
          ? { says: `The top of the ${lab} body is the open.`, c: `The ${lab} candle is an up candle (${UP_DESC}), so the top of its body is the close; the open is at the bottom.`, mis: 'candle-open-close-mixup' }
          : { says: `The bottom of the ${lab} body is the open.`, c: `The ${lab} candle is a down candle (${DOWN_DESC}), so the open is at the top of its body; the bottom is the close.`, mis: 'candle-open-close-mixup' },
        { says: `The range of the ${lab} candle is ${c.m(Math.abs(x.close - x.open))}.`, c: 'That is only the body. The range is high − low, from wick tip to wick tip.', mis: 'range-body-only' },
        { says: `The highest price on ${lab} was ${c.m(Math.max(x.open, x.close))}.`, c: 'That is the top of the body. The highest price is the top of the upper wick.', mis: 'candle-wick-body-mixup' },
        { says: `The ${lab} candle went ${up ? 'up' : 'down'}, so the next candle will go ${up ? 'up' : 'down'} too.`, c: 'A candle shows what already happened. It cannot tell us for sure what the next candle will do.', mis: 'past-predicts-future' }
      ];
      const foc = M.map((m, k) => [k, m]).filter(([, m]) => m.mis === c.focus);
      const [mi, mm] = foc.length ? c.pick(foc) : c.pickI(M);
      const fill = [['The mistake is that candles only show one price.', 'vocab-mixup'], ['The mistake is that prices never change.', 'prices-never-change'], ['The mistake is that a candle shows the future.', 'past-predicts-future']];
      const who = c.pick(DETECTIVES), fi = c.sampleI(fill.filter((f) => f[0] !== mm.c), 2);
      return {
        sig: `${K.gi}.${sigOf(K.cs)}.${K.L[0]}.${i}.${mi}.${who}.${fi.join('')}`,
        prompt: `Mistake Detective: ${who} looks at the ${lab} candle and says, "${mm.says}" What is the mistake?`,
        visual: K.visual, correct: mm.c, wrongs: [[`${who} is right — there is no mistake.`, mm.mis], ...fi.map((k) => fill[k])],
        hints: [`Find the ${lab} candle. Is it up (${UP_DESC}) or down (${DOWN_DESC})?`, 'Body = open to close. Wicks = out to the high and the low.', 'Ask: is this about what happened, or a guess about what comes next?'],
        explanation: mm.c
      };
    }
  },

  // ---------------------------------------------------------------- long-short
  {
    id: 'ls-who', skill: 'long-short', kind: 'scenario', type: 'choice', targets: ['long-short-swap', 'position-cant-lose', 'must-take-delivery'],
    make(c) {
      const [gi, g] = c.pickI(goodsFor(c)), [L, S] = c.sample(NAMES, 2);
      const { o, cl } = openClose(c, g, 1), up = cl > o, askGain = c.chance(0.5);
      const win = up ? `${L} (long)` : `${S} (short)`, lose = up ? `${S} (short)` : `${L} (long)`;
      return {
        sig: `${gi}.${L}.${S}.${o}.${cl}.${askGain ? 'g' : 'l'}`,
        prompt: `${L} is [[long]] pretend ${g.item} futures (bought at ${c.m(o)} per ${g.unit}). ${S} is [[short]] (sold at ${c.m(o)}). The price ${up ? 'rises' : 'falls'} to ${c.m(cl)}. Who ${askGain ? 'GAINS' : 'LOSES'}?`,
        correct: askGain ? win : lose,
        wrongs: [[askGain ? lose : win, 'long-short-swap'], [askGain ? 'Both of them gain.' : 'Neither of them can lose.', 'position-cant-lose'], ['Nobody gains or loses until the goods are delivered.', 'must-take-delivery']],
        hints: ['Long = bought. Short = sold first.', 'A buyer is happy when the price rises. A seller is happy when it falls.', `Did the price go up or down from ${c.m(o)}?`],
        explanation: `The price ${up ? 'rose' : 'fell'} from ${c.m(o)} to ${c.m(cl)}. ${up ? `${L} bought low and can sell higher, so ${L} gains; ${S} sold and must buy back higher, so ${S} loses.` : `${S} sold high and can buy back lower, so ${S} gains; ${L} bought and the price fell, so ${L} loses.`} One side's gain is the other side's loss.`
      };
    }
  },
  {
    id: 'ls-define', skill: 'long-short', kind: 'vocab', type: 'choice', targets: ['long-short-swap', 'long-short-names', 'position-cant-lose'],
    make(c) {
      const lg = c.chance(0.5);
      const LONG = 'You bought, so you gain if the price rises and lose if it falls.';
      const SHORT = 'You sold first, so you gain if the price falls and lose if it rises.';
      const W = [
        [lg ? SHORT : LONG, 'long-short-swap'],
        [lg ? 'You plan to hold it for a long time.' : 'You sold only a small amount.', 'long-short-names'],
        ['You cannot lose money.', 'position-cant-lose'],
        ['You know which way the price will go.', 'can-predict-future']
      ];
      const wi = c.sampleI(W, 3);
      if (!wi.includes(0)) wi[0] = 0;
      return {
        sig: `${lg ? 'L' : 'S'}.${[...new Set(wi)].join('')}`, prompt: lg ? 'What does it mean to be [[long]]?' : 'What does it mean to be [[short]]?',
        correct: lg ? LONG : SHORT, wrongs: [...new Set(wi)].map((i) => W[i]),
        hints: ['"Long" and "short" are names for the two sides of a trade.', 'One side bought; the other side sold first.', 'Which side is happy when the price goes up?'],
        explanation: 'Long means you bought: you gain if the price rises and lose if it falls. Short means you sold first: you gain if the price falls and lose if it rises. The names are about direction — not time or amount — and either side can lose.'
      };
    }
  },
  {
    id: 'ls-unit', skill: 'long-short', kind: 'math', type: 'number', targets: ['long-short-swap', 'used-wrong-number', 'added-instead'],
    make(c) {
      const [gi, g] = c.pickI(goodsFor(c)), who = c.pick(NAMES), lg = c.chance(0.5);
      const { o, cl } = openClose(c, g, 1), per = (cl - o) * (lg ? 1 : -1), sgn = c.A && !c.easy;
      return {
        sig: `${gi}.${who}.${lg ? 'L' : 'S'}.${o}.${cl}.${sgn ? 's' : ''}`,
        prompt: `${who} is ${lg ? '[[long]] (bought)' : '[[short]] (sold first)'} pretend ${g.item} futures at ${c.m(o)} per ${g.unit}. The price moves to ${c.m(cl)}. ${sgn ? `What is ${who}'s gain or loss per ${g.unit}? Write a loss with a minus sign (−).` : `How much does ${who} ${per > 0 ? 'gain' : 'lose'} per ${g.unit}?`}`,
        answer: (sgn ? per : Math.abs(per)) / 100, prefix: '$', data: { open: o / 100, close: cl / 100, side: lg ? 1 : -1, signed: sgn ? 1 : 0 },
        errors: [[(o + cl) / 100, 'added-instead'], [cl / 100, 'used-wrong-number'], ...(sgn ? [[-per / 100, 'long-short-swap']] : [])],
        hints: [lg ? 'A long position gains when the price rises.' : 'A short position gains when the price falls.', 'The size of the gain or loss is how far apart the two prices are.', sgn ? 'Did the price move the way this side wanted? If not, it is a loss — use a minus sign.' : 'Subtract the smaller price from the larger one.'],
        explanation: `${c.m(Math.max(o, cl))} ${MINUS} ${c.m(Math.min(o, cl))} = ${c.m(Math.abs(cl - o))} per ${g.unit}. ${who} is ${lg ? 'long' : 'short'} and the price ${cl > o ? 'rose' : 'fell'}, so it is a ${per > 0 ? 'gain' : 'loss'}${sgn ? ` (${signed(per, c.m)})` : ''}.`
      };
    }
  },
  {
    id: 'ls-total', skill: 'long-short', kind: 'math', type: 'number', targets: ['per-unit-vs-total', 'long-short-swap', 'added-instead'],
    make(c) {
      const [gi, g] = c.pickI(goodsFor(c)), who = c.pick(NAMES), lg = c.chance(0.5);
      const q = c.A ? (c.easy ? c.pick([10, 20, 50, 100]) : c.pick([1000, 2000, 5000, 10000])) : c.easy ? c.int(2, 4) : c.medium ? c.int(3, 10) : c.int(10, 40);
      const { o, cl } = openClose(c, g, q), per = (cl - o) * (lg ? 1 : -1), total = per * q, sgn = c.A && !c.easy;
      return {
        sig: `${gi}.${who}.${lg ? 'L' : 'S'}.${o}.${cl}.${q}.${sgn ? 's' : ''}`,
        prompt: `${who} is ${lg ? '[[long]]' : '[[short]]'} a pretend ${g.item} futures contract for ${c.num(q)} ${g.units}, ${lg ? 'bought' : 'sold'} at ${c.m(o)} per ${g.unit}. The price moves to ${c.m(cl)}. ${sgn ? `What is ${who}'s total gain or loss? Write a loss with a minus sign (−).` : `How much does ${who} ${total > 0 ? 'gain' : 'lose'} in total?`}`,
        answer: (sgn ? total : Math.abs(total)) / 100, prefix: '$', data: { open: o / 100, close: cl / 100, qty: q, side: lg ? 1 : -1, signed: sgn ? 1 : 0 },
        errors: [[Math.abs(per) / 100, 'per-unit-vs-total'], [((o + cl) * q) / 100, 'added-instead'], ...(sgn ? [[-total / 100, 'long-short-swap']] : [])],
        hints: [`Step 1: find the gain or loss for ONE ${g.unit}.`, `Step 2: multiply by the ${c.num(q)} ${g.units} in the contract.`, `Set it up: (${c.m(Math.max(o, cl))} ${MINUS} ${c.m(Math.min(o, cl))}) × ${c.num(q)}, then decide: gain or loss?`],
        explanation: `${c.m(Math.abs(cl - o))} per ${g.unit} × ${c.num(q)} = ${c.m(Math.abs(total))}. ${lg ? 'Long' : 'Short'} and the price ${cl > o ? 'rose' : 'fell'} → a ${total > 0 ? 'gain' : 'loss'}${sgn ? ` (${signed(total, c.m)})` : ''}.`
      };
    }
  },
  {
    id: 'ls-match', skill: 'long-short', kind: 'concept', type: 'match', targets: ['long-short-swap', 'long-short-names'],
    make(c) {
      const [gi, g] = c.pickI(GOODS), set = c.int(0, 1);
      const pairs = set === 0
        ? [['Long, and the price rises', 'Gains — bought low, can sell higher'], ['Long, and the price falls', 'Loses — bought, and it is now worth less'], ['Short, and the price falls', 'Gains — sold high, can buy back lower'], ['Short, and the price rises', 'Loses — must buy back at a higher price']]
        : [['Long', 'Bought first; hopes the price rises'], ['Short', 'Sold first; hopes the price falls'], ['Gain', 'The price moved the way the position hoped'], ['Loss', 'The price moved against the position']];
      return {
        sig: `${set}.${gi}`, prompt: `Think about pretend ${g.item} futures. Match each ${set === 0 ? 'situation to its result' : 'word to its meaning'}.`, pairs,
        hints: ['Long = bought. Short = sold first.', 'Buyers like rising prices; sellers like falling prices.', 'Every position can gain or lose, depending on the price move.'],
        explanation: pairs.map((p) => `${p[0]}: ${p[1].charAt(0).toLowerCase() + p[1].slice(1)}.`).join(' ')
      };
    }
  },
  {
    id: 'ls-fill', skill: 'long-short', kind: 'vocab', type: 'fill', targets: ['long-short-swap', 'long-short-names', 'position-cant-lose'],
    make(c) {
      const F = [
        { s: 'Being ___ means you bought, so you gain if the price rises.', c: 'long', w: [['short', 'long-short-swap'], ['patient', 'long-short-names'], ['safe', 'position-cant-lose']] },
        { s: 'Being short means you ___ first, hoping the price falls.', c: 'sold', w: [['bought', 'long-short-swap'], ['waited', 'long-short-names'], ['won', 'position-cant-lose']] },
        { s: 'A short position loses money when the price ___.', c: 'rises', w: [['falls', 'long-short-swap'], ['is small', 'long-short-names'], ['never', 'position-cant-lose']] },
        { s: 'A long position loses money when the price ___.', c: 'falls', w: [['rises', 'long-short-swap'], ['lasts long', 'long-short-names'], ['never', 'position-cant-lose']] },
        { s: 'In futures, one side\'s gain is the other side\'s ___.', c: 'loss', w: [['gain too', 'position-cant-lose'], ['delivery', 'must-take-delivery'], ['guess', 'can-predict-future']] }
      ];
      const [i, f] = c.pickI(F);
      return {
        sig: `${i}`, prompt: 'Choose the word that best completes the sentence.', sentence: f.s, correct: f.c, wrongs: f.w,
        hints: ['Read the sentence with each choice in the blank.', 'Long = bought, wants a rise. Short = sold first, wants a fall.', 'Any position loses when the price moves the "wrong" way for it.'],
        explanation: `"${plain(f.s).replace('___', f.c)}"`
      };
    }
  },
  {
    id: 'ls-mistake', skill: 'long-short', kind: 'mistake-detective', type: 'choice', targets: ['long-short-names', 'long-short-swap', 'position-cant-lose'],
    make(c) {
      const [gi, g] = c.pickI(GOODS);
      const M = [
        { says: `Being short ${g.item} futures means you sold only a little bit.`, c: 'Short means you sold first, hoping the price falls. It says nothing about how much you sold.', mis: 'long-short-names' },
        { says: `Being long ${g.item} futures means you plan to keep them for a long time.`, c: 'Long means you bought, hoping the price rises. It is about direction, not time.', mis: 'long-short-names' },
        { says: `I am short ${g.item} futures and the price went up, so I gained.`, c: 'A short position LOSES when the price rises. Short gains only when the price falls.', mis: 'long-short-swap' },
        { says: 'Being long is safe — a long position cannot lose money.', c: 'A long position loses when the price falls. Every position can lose.', mis: 'position-cant-lose' }
      ];
      const foc = M.map((m, i) => [i, m]).filter(([, m]) => m.mis === c.focus);
      const [mi, x] = foc.length ? c.pick(foc) : c.pickI(M);
      const fill = [['The mistake is that futures can only be about gold.', 'vocab-mixup'], ['The mistake is that prices never change.', 'prices-never-change'], ['The mistake is that only adults can learn about markets.', 'vocab-mixup']];
      const who = c.pick(DETECTIVES), fi = c.sampleI(fill, 2);
      return {
        sig: `${mi}.${gi}.${who}.${fi.join('')}`, prompt: `Mistake Detective: ${who} says, "${x.says}" What is the mistake?`,
        correct: x.c, wrongs: [[`${who} is right — there is no mistake.`, x.mis], ...fi.map((i) => fill[i])],
        hints: [`Reread what ${who} said about long or short.`, 'Long = bought, wants a rise. Short = sold first, wants a fall.', 'Do the words "long" and "short" describe time, amount, or direction?'],
        explanation: x.c
      };
    }
  },
  {
    id: 'ls-chart', skill: 'long-short', kind: 'chart', type: 'choice', targets: ['long-short-swap', 'position-cant-lose', 'misread-chart'],
    make(c) {
      const n = c.int(4, 6), C = lineChart(c, n, (v) => v[n - 1] !== v[0]);
      if (!C) return { invalid: true };
      const [L, S] = c.sample(NAMES, 2), up = C.v[n - 1] > C.v[0];
      return {
        sig: `${C.gi}.${sigOf(C.v)}.${C.L[0]}.${L}.${S}`,
        prompt: `In ${C.L[0]}, ${L} went [[long]] (bought) and ${S} went [[short]] (sold) pretend ${C.g.item} futures. Both closed their positions in ${C.L[n - 1]}. Use the chart: who had a gain?`,
        visual: { ...C.visual, highlight: n - 1 }, correct: up ? `${L}, who was long` : `${S}, who was short`,
        wrongs: [[up ? `${S}, who was short` : `${L}, who was long`, 'long-short-swap'], ['Both of them', 'position-cant-lose'], [`Whoever was ahead in ${C.L[1]}`, 'misread-chart']],
        hints: [`Compare the price in ${C.L[n - 1]} with the price in ${C.L[0]}.`, 'Long gains if the price rose; short gains if it fell.', 'The ups and downs in between do not matter once both positions are closed.'],
        explanation: `The price went from ${c.m(C.v[0])} to ${c.m(C.v[n - 1])}, ${up ? 'a rise' : 'a fall'}. So ${up ? `${L} (long) gained and ${S} (short) lost` : `${S} (short) gained and ${L} (long) lost`} — one side's gain is the other's loss.`
      };
    }
  },

  // ---------------------------------------------------------------- chart-limits
  {
    id: 'cl-careful', skill: 'chart-limits', kind: 'chart', type: 'choice', targets: ['past-predicts-future', 'can-predict-future', 'chart-hides-past'],
    make(c) {
      const shape = c.pick(['up', 'down']), n = c.int(5, 6);
      const C = lineChart(c, n, (v) => v.every((x, k) => k === 0 || (shape === 'up' ? x > v[k - 1] : x < v[k - 1])));
      if (!C) return { invalid: true };
      const W = [
        [`The price will ${shape === 'up' ? 'rise' : 'fall'} again next time, because it always has.`, 'past-predicts-future'],
        [`The price must ${shape === 'up' ? 'fall' : 'rise'} next, because it has gone ${shape} for too long.`, 'past-predicts-future'],
        ['The chart proves exactly what the price will be next week.', 'can-predict-future'],
        ['The price did not change at all.', 'chart-hides-past']
      ];
      const wi = c.sampleI(W, 3);
      return {
        sig: `${C.gi}.${sigOf(C.v)}.${C.L[0]}.${wi.join('')}`,
        prompt: `The chart shows a pretend price of ${C.g.item}. Which statement is the most careful?`,
        visual: C.visual, correct: `The price ${shape === 'up' ? 'rose' : 'fell'} every time on this chart, but nobody knows what it will do next.`,
        wrongs: wi.map((i) => W[i]),
        hints: ['A chart shows what ALREADY happened.', 'Does a streak in the past make the next move certain?', 'Look for the statement that describes the past exactly AND is honest about [[uncertainty]].'],
        explanation: `The chart shows the price ${shape === 'up' ? 'rising' : 'falling'} each time — that part is a fact. But past moves do not guarantee the next one: it could go up, go down, or stay the same.`
      };
    }
  },
  {
    id: 'cl-enough', skill: 'chart-limits', kind: 'chart', type: 'choice', targets: ['chart-explains-why', 'past-predicts-future', 'chart-hides-past'],
    make(c) {
      const n = c.int(5, 7), C = lineChart(c, n);
      if (!C) return { invalid: true };
      const { v, L } = C;
      const ask = c.focus === 'chart-explains-why' ? 'why' : c.focus === 'chart-hides-past' ? 'past' : c.pick(['past', 'why', 'next']);
      const i = c.int(1, n - 2);
      let q, correct, wrongs;
      if (ask === 'past') {
        q = `What was the price in ${L[i]}?`;
        correct = `Yes — it was ${c.m(v[i])}.`;
        wrongs = [['No — a chart cannot show past prices.', 'chart-hides-past'], ...(v[i + 1] !== v[i] ? [[`Yes — it was ${c.m(v[i + 1])}.`, 'misread-chart']] : []), ['No — we need to know tomorrow\'s price first.', 'past-predicts-future']];
      } else if (ask === 'why') {
        const up = v[i + 1] > v[i];
        q = `WHY did the price change from ${L[i]} to ${L[i + 1]}?`;
        correct = 'No — the chart shows what happened, not why. We would need other information, like news.';
        wrongs = [[`Yes — it went ${up ? 'up because more people wanted it' : 'down because fewer people wanted it'}.`, 'chart-explains-why'], ['Yes — the chart shows it was the weather.', 'chart-explains-why'], ['Yes — prices always change for the same reason.', 'chart-explains-why']];
      } else {
        q = 'What will the price be in the NEXT time period?';
        correct = 'No — nobody can know the next price for sure.';
        wrongs = [[`Yes — it will be ${c.m(v[n - 1] + (v[n - 1] - v[n - 2]))}, because it will keep moving the same way.`, 'past-predicts-future'], [`Yes — it will be ${c.m(v[n - 1])} again.`, 'past-predicts-future'], ['Yes — a chart shows the future too.', 'can-predict-future']];
      }
      return {
        sig: `${C.gi}.${sigOf(v)}.${L[0]}.${ask}.${i}`,
        prompt: `Can you answer this question using ONLY the chart: "${q}"`,
        visual: C.visual, correct, wrongs,
        hints: ['A chart shows past prices: what they were, when.', 'A chart does not show reasons, and it does not show the future.', 'Is the question about something that already happened and is drawn on the chart?'],
        explanation: ask === 'past' ? `Yes. Past prices are right on the chart: ${L[i]} was ${c.m(v[i])}.` : ask === 'why' ? 'A chart shows what happened, not why. Reasons — like weather, costs, or what people want — come from other information, such as news.' : 'The chart only shows the past. The next price could go up, go down, or stay the same — nobody can know for sure.'
      };
    }
  },
  {
    id: 'cl-news', skill: 'chart-limits', kind: 'scenario', type: 'choice', targets: ['past-predicts-future', 'can-predict-future', 'prices-never-change'],
    make(c) {
      const [ei, e] = c.pickI(EVENTS), opp = c.chance(0.4);
      const text = opp ? e.opp : e.t, dir = opp ? (e.dir === 'up' ? 'down' : 'up') : e.dir, why = opp ? e.whyOpp : e.why;
      // the chart before the news drifts the OTHER way, so readers cannot just copy the old direction
      const n = 5, g = { lo: 3, hi: 9, item: e.item, unit: 'item' };
      const v = series(c, g, n, (s) => (dir === 'up' ? s[n - 1] < s[0] : s[n - 1] > s[0]));
      if (!v) return { invalid: true };
      const L = labelsFor(c, n), big = c.A ? c.price(1, 3) : 100 * c.int(2, 5);
      return {
        sig: `${ei}.${opp ? 'o' : 't'}.${sigOf(v)}.${L[0]}.${big}`,
        prompt: `The chart shows a pretend price of ${e.item} before some news. Then this happens: "${text}" Which is the most careful thing to say?`,
        visual: { kind: 'line', title: `Pretend price of ${e.item}`, unit: '$', points: L.map((l, k) => ({ label: l, value: v[k] / 100 })) },
        correct: `The news could push the price ${dir}, because ${why}, but nobody knows for sure.`,
        wrongs: [[`The price must keep going ${dir === 'up' ? 'down' : 'up'}, the way the chart shows, no matter what the news says.`, 'past-predicts-future'], [`The price will definitely go ${dir} by exactly ${c.m(big)}.`, 'can-predict-future'], ['News never changes prices.', 'prices-never-change']],
        hints: ['The chart was drawn BEFORE the news.', `Think: does the news change how much ${e.item} there is, or how many people want it?`, 'A careful answer says what is likely AND admits [[uncertainty]].'],
        explanation: `News can change prices suddenly, in ways an old chart could not show. Here ${why}, which could push the price ${dir} — but many things happen at once, so nobody knows for sure how much, or even whether it will.`
      };
    }
  },
  {
    id: 'cl-mistake', skill: 'chart-limits', kind: 'mistake-detective', type: 'choice', targets: ['past-predicts-future', 'chart-explains-why', 'guaranteed-profit'],
    make(c) {
      const k = c.focus === 'chart-explains-why' ? 2 : c.focus === 'guaranteed-profit' ? 3 : c.int(0, 3);
      const up = k !== 1, n = 6;
      const C = lineChart(c, n, (v) => v.every((x, j) => j === 0 || (up ? x > v[j - 1] : x < v[j - 1])));
      if (!C) return { invalid: true };
      const M = [
        { says: 'It went up 5 times in a row, so it must go up next time.', c: 'Past movement does not guarantee the future. It could go up, go down, or stay the same.', mis: 'past-predicts-future' },
        { says: 'It went down 5 times in a row, so it is due to go up next.', c: 'A price is never "due." Past drops do not guarantee a rise — nobody knows the next move.', mis: 'past-predicts-future' },
        { says: 'The chart shows the price went up because more people wanted it.', c: 'A chart shows WHAT happened, not WHY. We would need other information, like news, to know the reason.', mis: 'chart-explains-why' },
        { says: 'The line is going up, so buying now guarantees a profit.', c: 'Nothing guarantees a profit. The price could fall after you buy.', mis: 'guaranteed-profit' }
      ];
      const x = M[k], who = c.pick(DETECTIVES);
      const fill = [['The mistake is reading the wrong label on the chart.', 'misread-chart'], ['The mistake is that charts are not allowed.', 'vocab-mixup'], ['The mistake is that prices never change.', 'prices-never-change']];
      const fi = c.sampleI(fill, 2);
      return {
        sig: `${k}.${C.gi}.${sigOf(C.v)}.${C.L[0]}.${who}.${fi.join('')}`,
        prompt: `Mistake Detective: ${who} looks at this chart of a pretend price of ${C.g.item} and says, "${x.says}" What is the mistake?`,
        visual: C.visual, correct: x.c, wrongs: [[`${who} is right — there is no mistake.`, x.mis], ...fi.map((i) => fill[i])],
        hints: [`Is ${who} describing what happened, or claiming to know something more?`, 'A chart shows the past. It does not show reasons or the future.', 'Words like "must", "due", and "guarantees" are clues.'],
        explanation: x.c
      };
    }
  },
  {
    id: 'cl-fill', skill: 'chart-limits', kind: 'vocab', type: 'fill', targets: ['past-predicts-future', 'chart-explains-why', 'can-predict-future'],
    make(c) {
      const F = [
        { s: 'A price chart shows what has ___ happened.', c: 'already', w: [['surely never', 'chart-hides-past'], ['not yet', 'past-predicts-future'], ['secretly', 'chart-explains-why']] },
        { s: 'A price that rose five days in a row ___ fall tomorrow.', c: 'could', w: [['cannot', 'past-predicts-future'], ['will never', 'past-predicts-future'], ['must', 'can-predict-future']] },
        { s: 'A surprise in the ___ can change a price suddenly.', c: 'news', w: [['chart', 'chart-explains-why'], ['font', 'irrelevant-reason'], ['past', 'past-predicts-future']] },
        { s: 'To learn WHY a price moved, you need more ___ than the chart gives.', c: 'information', w: [['lines', 'chart-explains-why'], ['colors', 'vocab-mixup'], ['guesses', 'can-predict-future']] },
        { s: 'Nobody can know the future price for sure. This is called ___.', c: 'uncertainty', w: [['a trend', 'past-predicts-future'], ['a guarantee', 'guaranteed-profit'], ['a wick', 'vocab-mixup']] }
      ];
      const [i, f] = c.pickI(F);
      return {
        sig: `${i}`, prompt: 'Choose the word that best completes the sentence.', sentence: f.s, correct: f.c, wrongs: f.w,
        hints: ['Read the sentence with each choice in the blank.', 'A chart records the past. It does not show reasons or the future.', 'Be careful with words that sound too sure.'],
        explanation: `"${plain(f.s).replace('___', f.c)}"`
      };
    }
  },
  {
    id: 'cl-match', skill: 'chart-limits', kind: 'concept', type: 'match', targets: ['chart-explains-why', 'past-predicts-future', 'chart-hides-past'],
    make(c) {
      const L = labelsFor(c, 5), a = c.int(0, 4), b = c.int(0, 4);
      const P = [
        [`What was the price in ${L[a]}?`, 'Read it from the chart'],
        ['When was the price highest?', 'Find the highest point on the line'],
        [`Why did the price drop in ${L[b]}?`, 'Need other information, like news'],
        ['What will the price be next time?', 'Nobody can know for sure'],
        ['Did the price end higher than it started?', 'Compare the first and last points']
      ];
      const idx = c.sampleI(P, 4);
      return {
        sig: `${L[0]}.${a}.${b}.${idx.join('')}`, prompt: 'A student has a line chart of a pretend price. Match each question to how it can (or cannot) be answered.', pairs: idx.map((i) => P[i]),
        hints: ['Questions about what already happened can be read from the chart.', 'Questions about WHY need more information.', 'Questions about the future cannot be answered for sure.'],
        explanation: idx.map((i) => `"${P[i][0]}" → ${P[i][1].charAt(0).toLowerCase() + P[i][1].slice(1)}.`).join(' ')
      };
    }
  },
  {
    id: 'cl-sure', skill: 'chart-limits', kind: 'chart', type: 'choice', targets: ['misread-chart', 'past-predicts-future', 'chart-explains-why'],
    make(c) {
      const n = c.int(5, 7), C = lineChart(c, n);
      if (!C) return { invalid: true };
      const [i, j] = c.sampleI(C.v, 2);
      if (C.v[i] === C.v[j]) return { invalid: true };
      const hi = C.v[j] > C.v[i];
      return {
        sig: `${C.gi}.${sigOf(C.v)}.${C.L[0]}.${i}.${j}`,
        prompt: `The chart shows a pretend price of ${C.g.item}. Which statement can we be SURE is true?`,
        visual: C.visual, correct: `The price in ${C.L[j]} was ${hi ? 'higher' : 'lower'} than in ${C.L[i]}.`,
        wrongs: [[`The price in ${C.L[j]} was ${hi ? 'lower' : 'higher'} than in ${C.L[i]}.`, 'misread-chart'], ['The price will be higher next time.', 'past-predicts-future'], [`The price changed in ${C.L[j]} because of the weather.`, 'chart-explains-why']],
        hints: ['A chart shows past prices — you can check those.', 'It cannot show the future or the reasons.', `Compare the points at ${C.L[i]} and ${C.L[j]}.`],
        explanation: `In ${C.L[i]} the price was ${c.m(C.v[i])}; in ${C.L[j]} it was ${c.m(C.v[j])}. That comparison is on the chart, so we can be sure of it. The chart cannot tell us the future or why the price moved.`
      };
    }
  }
];

/** Grammar for day labels: "in Monday" → "on Monday" in every text the templates produce. */
const DAY_RE = /\b([Ii])n (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/g;
const fixDays = (v) => (typeof v === 'string' ? v.replace(DAY_RE, (m0, i, d) => (i === 'I' ? 'On ' : 'on ') + d) : Array.isArray(v) ? v.map(fixDays) : v);
export const CHART_TEMPLATES = TEMPLATES.map((t) => ({
  ...t,
  make(c) {
    const out = t.make(c);
    if (!out || out.invalid) return out;
    for (const k of ['prompt', 'correct', 'wrongs', 'hints', 'explanation', 'pairs', 'sentence']) if (k in out) out[k] = fixDays(out[k]);
    return out;
  }
}));

export const CHART_TEACH = { 'line-chart-reading': TEACH_LC, 'candlestick-reading': TEACH_CS, 'long-short': TEACH_LS, 'chart-limits': TEACH_CL };
