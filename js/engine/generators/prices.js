// World 1, Lesson 2: price-change-math, price-change-reasons.
import { NAMES, DETECTIVES, EVENTS, IRRELEVANT, MONTHS, itemsFor, pricePair } from './pools.js';

const MINUS = '−';
const TEACH_PCM = {
  explorer: 'To find how much a price changed, compare the old price and the new price. Subtract the smaller price from the larger one to find the size of the change. If the new price is bigger, the price went UP; if it is smaller, it went DOWN. Example: a notebook was $3 and now costs $5. 5 − 3 = 2, so the price went up $2. If you buy several, find the change for one, then multiply by how many you buy: 4 notebooks × $2 = $8 more in total.',
  analyst: 'Price change = new price − old price. A positive result means the price rose; a negative result means it fell. Line up the decimal points when you subtract: $4.60 − $3.85 = $0.75. For several units, multiply the per-unit change by the quantity: $0.75 × 12 = $9.00. Percent change = (change ÷ OLD price) × 100. Example: $8.00 → $10.00 is a $2.00 change; 2.00 ÷ 8.00 = 0.25, so it is a 25% increase. Always divide by the starting (old) price, not the new one.'
};
const TEACH_PCR = {
  explorer: 'Prices change when something changes how much of a thing there is or how many people want it. Fewer available (a freeze, a drought) → the price usually goes UP. Lots available (a great harvest) → the price usually goes DOWN. More people want it (a hot day for lemonade) → usually UP. Fewer people want it → usually DOWN. When it costs more to make or deliver something, the price often goes up too. We say "usually" and "likely" because many things happen at once, and nobody can be completely sure.',
  analyst: 'Price changes usually trace back to supply (how much sellers have to sell), demand (how much buyers want), or costs (what it takes to make and deliver something). Less supply or more demand tends to push prices up; more supply or less demand tends to push prices down; higher costs often get passed on as higher prices. Real markets have many forces at once, so these are tendencies, not guarantees — we say a price will "likely" move, never "definitely".'
};

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const when = ['Last week', 'Last month', 'Two weeks ago', 'In the spring', 'Last year'];

export const PRICE_TEMPLATES = [
  // ---------------------------------------------------------------- price-change-math
  {
    id: 'pcm-rise', skill: 'price-change-math', kind: 'math', type: 'number', targets: ['added-instead', 'used-wrong-number'],
    make(c) {
      const [ii, it] = c.pickI(itemsFor(c)), w = c.pick(when);
      if (c.challenge) {
        // two steps: A → B → C, all rises; total rise C − A
        let a, b, d;
        for (let t = 0; t < 40; t++) {
          [a, b] = pricePair(c, it); d = c.price(1, Math.max(2, Math.min(15, c.cap - b / 100)));
          if (b + d <= c.cap * 100 && d > 0) break;
        }
        const cc = b + d;
        return {
          sig: `2.${ii}.${a}.${b}.${cc}`,
          prompt: `${w}, a ${it.one} cost ${c.m(a)}. A month later it cost ${c.m(b)}. Now it costs ${c.m(cc)}. How much did the [[price]] go up in all, from the first price to now?`,
          answer: (cc - a) / 100, prefix: '$', data: { first: a / 100, middle: b / 100, now: cc / 100 },
          errors: [[(cc - b) / 100, 'used-wrong-number'], [(b - a) / 100, 'used-wrong-number'], [(a + cc) / 100, 'added-instead'], [cc / 100, 'used-wrong-number']],
          hints: ['The question asks about the whole change — from the very first price to the price now.', 'You only need the first price and the last price. The middle price is not part of the subtraction.', `Set it up: ${c.m(cc)} ${MINUS} ${c.m(a)} = ?`],
          explanation: `Compare the first price with the price now: ${c.m(cc)} ${MINUS} ${c.m(a)} = ${c.m(cc - a)}. (Step by step works too: ${c.m(b - a)} + ${c.m(d)} = ${c.m(cc - a)}.)`
        };
      }
      const [lo, hi] = pricePair(c, it);
      return {
        sig: `1.${ii}.${lo}.${hi}`,
        prompt: `${w}, a ${it.one} at ${it.seller} cost ${c.m(lo)}. Now it costs ${c.m(hi)}. How much did the [[price]] go up?`,
        answer: (hi - lo) / 100, prefix: '$', data: { old: lo / 100, new: hi / 100 },
        errors: [[(lo + hi) / 100, 'added-instead'], [hi / 100, 'used-wrong-number'], [lo / 100, 'used-wrong-number']],
        hints: ['Is the new price higher or lower than the old price?', 'To find how much a price changed, subtract the smaller price from the larger price.', `Set it up: ${c.m(hi)} ${MINUS} ${c.m(lo)} = ?`],
        explanation: `${c.m(hi)} ${MINUS} ${c.m(lo)} = ${c.m(hi - lo)}. The price went up by ${c.m(hi - lo)}.`
      };
    }
  },
  {
    id: 'pcm-drop', skill: 'price-change-math', kind: 'math', type: 'number', targets: ['added-instead', 'used-wrong-number', 'wrong-direction'],
    make(c) {
      const [ii, it] = c.pickI(itemsFor(c)), w = c.pick(when);
      const [lo, hi] = pricePair(c, it);
      const signed = c.A && !c.easy;
      if (signed) {
        return {
          sig: `s.${ii}.${lo}.${hi}`,
          prompt: `${w}, a ${it.one} cost ${c.m(hi)}. Now it costs ${c.m(lo)}. What was the change in [[price]]? Use a minus sign (−) if the price went down.`,
          answer: -(hi - lo) / 100, prefix: '$', data: { old: hi / 100, new: lo / 100 },
          errors: [[(hi - lo) / 100, 'wrong-direction'], [-(hi + lo) / 100, 'added-instead'], [(hi + lo) / 100, 'added-instead'], [lo / 100, 'used-wrong-number']],
          hints: ['Change = new price − old price. Which price is new?', 'If the new price is smaller than the old price, the change is negative.', `Set it up: ${c.m(lo)} ${MINUS} ${c.m(hi)} = ?`],
          explanation: `Change = new − old = ${c.m(lo)} ${MINUS} ${c.m(hi)} = ${MINUS}${c.m(hi - lo)}. The negative sign shows the price went down.`
        };
      }
      return {
        sig: `p.${ii}.${lo}.${hi}`,
        prompt: `${w}, a ${it.one} at ${it.seller} cost ${c.m(hi)}. Now it is on sale for ${c.m(lo)}. How much did the [[price]] go down?`,
        answer: (hi - lo) / 100, prefix: '$', data: { old: hi / 100, new: lo / 100 },
        errors: [[(lo + hi) / 100, 'added-instead'], [lo / 100, 'used-wrong-number'], [hi / 100, 'used-wrong-number']],
        hints: ['Which price is bigger, the old one or the new one?', 'To find how much the price dropped, subtract the smaller price from the larger price.', `Set it up: ${c.m(hi)} ${MINUS} ${c.m(lo)} = ?`],
        explanation: `${c.m(hi)} ${MINUS} ${c.m(lo)} = ${c.m(hi - lo)}. The price went down by ${c.m(hi - lo)}.`
      };
    }
  },
  {
    id: 'pcm-total', skill: 'price-change-math', kind: 'math', type: 'number', targets: ['per-unit-vs-total', 'added-instead'],
    make(c) {
      const its = itemsFor(c).filter((i) => i.lo <= 12);
      const [ii, it] = c.pickI(its), name = c.pick(NAMES), up = c.chance(0.6);
      if (c.challenge) {
        const n = c.A ? c.int(6, 24) : c.int(3, 8);
        const [lo, hi] = pricePair(c, { lo: it.lo, hi: Math.min(it.hi + 4, 20) });
        const [o, nw] = up ? [lo, hi] : [hi, lo], d = hi - lo;
        return {
          sig: `2.${ii}.${o}.${nw}.${n}.${name}`,
          prompt: `A ${it.one} used to cost ${c.m(o)}. Now it costs ${c.m(nw)}. ${name} buys ${n} ${it.many}. How much ${up ? 'more' : 'less'} does ${name} pay in total than at the old price?`,
          answer: (d * n) / 100, prefix: '$', data: { old: o / 100, new: nw / 100, qty: n },
          errors: [[d / 100, 'per-unit-vs-total'], [(nw * n) / 100, 'used-wrong-number'], [((o + nw) * n) / 100, 'added-instead'], [(d + n * 100) / 100, 'added-instead']],
          hints: ['This takes two steps. First find the change for ONE item.', `Step 1: subtract the two prices. Step 2: multiply that change by how many ${it.many} ${name} buys.`, `Set it up: (${c.m(Math.max(o, nw))} ${MINUS} ${c.m(Math.min(o, nw))}) × ${n} = ?`],
          explanation: `Change for one: ${c.m(hi)} ${MINUS} ${c.m(lo)} = ${c.m(d)}. For ${n}: ${c.m(d)} × ${n} = ${c.m(d * n)} ${up ? 'more' : 'less'} in total.`
        };
      }
      let d, n;
      if (c.A) { d = c.easy ? c.int(1, 8) * 25 : c.int(1, 60) * 5; n = c.easy ? c.int(2, 6) : c.int(3, 20); }
      else { d = c.easy ? c.int(1, 4) * 100 : c.int(2, 9) * 100; n = c.easy ? c.int(2, 5) : c.int(3, 11); }
      if (!c.A && d * n > c.cap * 100) n = Math.max(2, Math.floor((c.cap * 100) / d));
      return {
        sig: `1.${ii}.${d}.${n}.${up}.${name}`,
        prompt: `The price of a ${it.one} went ${up ? 'up' : 'down'} by ${c.m(d)}. ${name} buys ${n} ${it.many}. How much ${up ? 'more' : 'less'} does ${name} pay in total than before?`,
        answer: (d * n) / 100, prefix: '$', data: { change: d / 100, qty: n },
        errors: [[d / 100, 'per-unit-vs-total'], [(d + n * 100) / 100, 'added-instead']],
        hints: [`The change is for ONE ${it.one}. How many does ${name} buy?`, 'When the same change happens to each item, multiply the change by the number of items.', `Set it up: ${c.m(d)} × ${n} = ?`],
        explanation: `Each one costs ${c.m(d)} ${up ? 'more' : 'less'}, and there are ${n}: ${c.m(d)} × ${n} = ${c.m(d * n)}.`
      };
    }
  },
  {
    id: 'pcm-percent', skill: 'price-change-math', kind: 'math', type: 'number', bands: ['analyst'], diffs: ['challenge'], targets: ['percent-of-new', 'percent-not-divided'],
    make(c) {
      const [ii, it] = c.pickI(itemsFor(c)), up = c.chance(0.6);
      const P = up ? [5, 10, 15, 20, 25, 30, 40, 50, 60, 75] : [5, 10, 15, 20, 25, 30, 40, 50];
      let o, p;
      for (let t = 0; t < 60; t++) {
        o = c.int(Math.max(2, it.lo), Math.min(it.hi, 60)) * 100 + c.pick([0, 20, 40, 50, 60, 80]);
        p = c.pick(P);
        if ((o * p) % 100 === 0) break;
      }
      const d = (o * p) / 100, nw = up ? o + d : o - d;
      return {
        sig: `${ii}.${o}.${p}.${up}`,
        prompt: `A ${it.one} cost ${c.m(o, { decimals: true })}. Now it costs ${c.m(nw, { decimals: true })}. What was the percent ${up ? 'increase' : 'decrease'}? Round to the nearest whole percent.`,
        answer: p, unit: '%', tolerance: 0.5, data: { old: o / 100, new: nw / 100 },
        errors: [[Math.round((d / nw) * 100), 'percent-of-new'], [d / 100, 'percent-not-divided'], [Math.round((d / o) * 10000) / 100 / 100, 'percent-not-divided']],
        hints: ['First find how many dollars the price changed.', 'Percent change compares that change with the OLD (starting) price.', 'Divide the change by the old price, then multiply by 100.'],
        explanation: `Change: ${c.m(Math.max(o, nw), { decimals: true })} ${MINUS} ${c.m(Math.min(o, nw), { decimals: true })} = ${c.m(d, { decimals: true })}. ${c.m(d, { decimals: true })} ÷ ${c.m(o, { decimals: true })} = ${(p / 100).toFixed(2)}, and ${(p / 100).toFixed(2)} × 100 = ${p}%. It is a ${p}% ${up ? 'increase' : 'decrease'}.`
      };
    }
  },
  {
    id: 'pcm-chart', skill: 'price-change-math', kind: 'chart', type: 'number', targets: ['misread-chart', 'added-instead', 'used-wrong-number'],
    make(c) {
      const [ii, it] = c.pickI(itemsFor(c).filter((i) => i.lo <= 30));
      const hi = Math.min(it.hi, c.cap), lo = Math.min(it.lo, hi - 3);
      let v;
      for (let t = 0; t < 50; t++) {
        v = Array.from({ length: 5 }, () => c.price(lo, hi));
        if (v.every((x, k) => k === 0 || x !== v[k - 1])) break;
      }
      const pairs = [[0, 2], [0, 3], [1, 3], [1, 4], [2, 4], [0, 1], [3, 4], [1, 2]].filter(([a, b]) => v[a] !== v[b]);
      const [i, j] = c.pick(pairs);
      const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
      const up = v[j] > v[i], d = Math.abs(v[j] - v[i]);
      const nb = j + 1 < 5 ? j + 1 : j - 1;
      return {
        sig: `${ii}.${v.join('-')}.${i}${j}`,
        prompt: `The chart shows the price of one ${it.one} each week. How much did the [[price]] go ${up ? 'up' : 'down'} from ${labels[i]} to ${labels[j]}?`,
        visual: { kind: 'line', title: `Price of one ${it.one}`, unit: '$', points: v.map((x, k) => ({ label: labels[k], value: x / 100 })) },
        answer: d / 100, prefix: '$', data: { from: v[i] / 100, to: v[j] / 100, values: v.map((x) => x / 100), i, j },
        errors: [[(v[i] + v[j]) / 100, 'added-instead'], [v[j] / 100, 'used-wrong-number'], [Math.abs(v[nb] - v[i]) / 100, 'misread-chart'], [Math.abs(v[j] - v[0]) / 100, 'misread-chart']],
        hints: [`Find ${labels[i]} on the chart and read its price.`, `Now find ${labels[j]} and read its price. Ignore the other weeks.`, 'Subtract the smaller of those two prices from the larger one.'],
        explanation: `${labels[i]}: ${c.m(v[i])}. ${labels[j]}: ${c.m(v[j])}. ${c.m(Math.max(v[i], v[j]))} ${MINUS} ${c.m(Math.min(v[i], v[j]))} = ${c.m(d)}, so the price went ${up ? 'up' : 'down'} ${c.m(d)}.`
      };
    }
  },
  {
    id: 'pcm-bars', skill: 'price-change-math', kind: 'chart', type: 'number', targets: ['misread-chart', 'added-instead', 'used-wrong-number'],
    make(c) {
      const [ii, it] = c.pickI(itemsFor(c));
      const stores = c.sample(['Corner Market', 'Green Grocer', 'Main St. Shop', 'Value Mart', 'Hilltop Store', 'Park Plaza'], 3);
      const hi = Math.min(it.hi, c.cap), lo = Math.min(it.lo, hi - 3);
      let v;
      for (let t = 0; t < 50; t++) { v = [c.price(lo, hi), c.price(lo, hi), c.price(lo, hi)]; if (new Set(v).size === 3) break; }
      const order = [0, 1, 2].sort((a, b) => v[b] - v[a]);
      const [a, b] = c.chance(0.5) ? [order[0], order[2]] : c.chance(0.5) ? [order[0], order[1]] : [order[1], order[2]];
      const third = [0, 1, 2].find((k) => k !== a && k !== b);
      const d = v[a] - v[b];
      return {
        sig: `${ii}.${stores.join('-')}.${v.join('-')}.${a}${b}`,
        prompt: `The bar chart shows the price of a ${it.one} at three stores. How much more does it cost at ${stores[a]} than at ${stores[b]}?`,
        visual: { kind: 'bars', title: `Price of a ${it.one}`, unit: '$', items: stores.map((s, k) => ({ label: s, value: v[k] / 100 })) },
        answer: d / 100, prefix: '$', data: { more: v[a] / 100, less: v[b] / 100, values: v.map((x) => x / 100) },
        errors: [[(v[a] + v[b]) / 100, 'added-instead'], [v[a] / 100, 'used-wrong-number'], [Math.abs(v[a] - v[third]) / 100, 'misread-chart'], [Math.abs(v[b] - v[third]) / 100, 'misread-chart']],
        hints: [`Find the bars for ${stores[a]} and ${stores[b]} only.`, 'Read the price at the top of each of those two bars.', '"How much more" means subtract the smaller price from the larger price.'],
        explanation: `${stores[a]}: ${c.m(v[a])}. ${stores[b]}: ${c.m(v[b])}. ${c.m(v[a])} ${MINUS} ${c.m(v[b])} = ${c.m(d)} more at ${stores[a]}.`
      };
    }
  },
  {
    id: 'pcm-direction', skill: 'price-change-math', kind: 'concept', type: 'choice', targets: ['wrong-direction', 'added-instead', 'used-wrong-number'],
    make(c) {
      const [ii, it] = c.pickI(itemsFor(c)), [lo, hi] = pricePair(c, it), up = c.chance(0.5);
      const [o, n] = up ? [lo, hi] : [hi, lo], d = hi - lo, dir = up ? 'up' : 'down', opp = up ? 'down' : 'up';
      return {
        sig: `${ii}.${o}.${n}`,
        prompt: `A ${it.one} cost ${c.m(o)} last month. This month it costs ${c.m(n)}. Which sentence is true?`,
        correct: `The price went ${dir} by ${c.m(d)}.`,
        wrongs: [[`The price went ${opp} by ${c.m(d)}.`, 'wrong-direction'], [`The price went ${dir} by ${c.m(o + n)}.`, 'added-instead'], [`The price went ${dir} by ${c.m(n)}.`, 'used-wrong-number']],
        hints: ['First decide: is this month\'s price bigger or smaller than last month\'s?', 'Then find how far apart the two prices are by subtracting.', 'The right sentence has the correct direction AND the correct difference.'],
        explanation: `${c.m(n)} is ${up ? 'more' : 'less'} than ${c.m(o)}, so the price went ${dir}. ${c.m(hi)} ${MINUS} ${c.m(lo)} = ${c.m(d)}.`
      };
    }
  },
  {
    id: 'pcm-mistake', skill: 'price-change-math', kind: 'mistake-detective', type: 'choice', targets: ['added-instead', 'wrong-direction', 'used-wrong-number', 'per-unit-vs-total', 'percent-of-new'],
    make(c) {
      const [ii, it] = c.pickI(itemsFor(c).filter((i) => i.lo <= 30)), who = c.pick(DETECTIVES);
      const [lo, hi] = pricePair(c, it), up = c.chance(0.5);
      const [o, n] = up ? [lo, hi] : [hi, lo], d = hi - lo, dir = up ? 'up' : 'down', opp = up ? 'down' : 'up';
      const types = ['added-instead', 'wrong-direction', 'used-wrong-number', 'per-unit-vs-total'];
      let type = c.focus && types.includes(c.focus) ? c.focus : c.pick(types);
      const q = c.int(3, 6);
      const desc = {
        'added-instead': `${who} added the two prices instead of subtracting them.`,
        'wrong-direction': `${who} mixed up whether the price went up or down.`,
        'used-wrong-number': `${who} gave the new price instead of how much it changed.`,
        'per-unit-vs-total': `${who} found the change for one, but forgot to multiply by ${q}.`
      };
      const say = {
        'added-instead': `The price went ${dir} by ${c.m(o + n)}.`,
        'wrong-direction': `The price went ${opp} by ${c.m(d)}.`,
        'used-wrong-number': `The price went ${dir} by ${c.m(n)}.`,
        'per-unit-vs-total': `If I buy ${q}, I pay ${c.m(d)} ${up ? 'more' : 'less'} in total.`
      };
      const others = c.sample(types.filter((t) => t !== type), 2);
      return {
        sig: `${ii}.${o}.${n}.${type}.${who}.${q}.${others.join('')}`,
        prompt: `Mistake Detective: A ${it.one} cost ${c.m(o)} last month and costs ${c.m(n)} now. ${who} says, "${say[type]}" What mistake did ${who} make?`,
        correct: desc[type], wrongs: [[`${who} is right — there is no mistake.`, type], ...others.map((t) => [desc[t], type])],
        misText: { [type]: `Not quite. Solve the problem yourself first, then compare your steps with ${who}'s to see where they went wrong.` },
        hints: [`Work out the right answer yourself before you look at ${who}'s.`, `The change is ${up ? 'new − old' : 'old − new'}, and its direction depends on which price is bigger.`, `Compare ${who}'s number and direction with yours. Which step is different?`],
        explanation: `The price went ${dir} by ${c.m(hi)} ${MINUS} ${c.m(lo)} = ${c.m(d)}${type === 'per-unit-vs-total' ? `, so for ${q} it is ${c.m(d)} × ${q} = ${c.m(d * q)}` : ''}. ${desc[type]}`
      };
    }
  },

  // ---------------------------------------------------------------- price-change-reasons
  {
    id: 'pcr-predict', skill: 'price-change-reasons', kind: 'scenario', type: 'choice', targets: ['reason-backwards', 'prices-never-change'],
    make(c) {
      const [ei, e] = c.pickI(EVENTS), opp = e.dir === 'up' ? 'down' : 'up';
      return {
        sig: `${ei}`, prompt: `${e.t} What will most likely happen to the [[price]] of ${e.item}?`,
        correct: `It will likely go ${e.dir}, because ${e.why}.`,
        wrongs: [[`It will likely go ${opp}, because ${e.why}.`, 'reason-backwards'], [`It will likely go ${opp}, because ${e.whyOpp}.`, 'reason-backwards'], ['It will stay exactly the same, because prices never change.', 'prices-never-change']],
        hints: ['Does this event change how much there is, or how many people want it?', 'Less available or more wanted → price usually up. More available or less wanted → price usually down.', `Decide first whether ${e.why.replace(/^it /, 'it ')} — then pick the matching direction.`],
        explanation: `${e.t} That means ${e.why}, which usually pushes the price ${e.dir}.`
      };
    }
  },
  {
    id: 'pcr-explain', skill: 'price-change-reasons', kind: 'scenario', type: 'choice', targets: ['reason-backwards', 'irrelevant-reason'],
    make(c) {
      const dir = c.chance(0.5) ? 'up' : 'down';
      const right = EVENTS.map((e, i) => [i, e]).filter(([, e]) => e.dir === dir), wrong = EVENTS.map((e, i) => [i, e]).filter(([, e]) => e.dir !== dir);
      const [ri, r] = c.pick(right), w = c.sample(wrong, 2), [ii, irr] = c.pickI(IRRELEVANT);
      return {
        sig: `${dir}.${ri}.${w.map((x) => x[0]).sort((a, b) => a - b).join('-')}.${ii}`,
        prompt: `Which event would most likely make a [[price]] go ${dir.toUpperCase()}?`,
        correct: r.t, wrongs: [...w.map(([, e]) => [e.t, 'reason-backwards']), [irr, 'irrelevant-reason']],
        hints: ['For each event, ask: does it change how much there is, or how much people want it?', `A price usually goes ${dir} when ${dir === 'up' ? 'there is less of something or more people want it' : 'there is more of something or fewer people want it'}.`, 'One choice does not change supply or demand at all, and two push the price the other way.'],
        explanation: `${r.t} That means ${r.why}, which usually pushes the price of ${r.item} ${dir}.`
      };
    }
  },
  {
    id: 'pcr-match', skill: 'price-change-reasons', kind: 'scenario', type: 'match', targets: ['reason-backwards', 'supply-demand-mixup'],
    make(c) {
      const cats = [['supply-down', 'Price likely goes up: there is less to sell'], ['supply-up', 'Price likely goes down: there is more to sell'], ['demand-up', 'Price likely goes up: more people want it'], ['demand-down', 'Price likely goes down: fewer people want it']];
      const chosen = cats.map(([cause, label]) => { const opts = EVENTS.map((e, i) => [i, e]).filter(([, e]) => e.cause === cause); const [i, e] = c.pick(opts); return [i, e, label]; });
      return {
        sig: chosen.map((x) => x[0]).join('.'), prompt: 'Match each event to what will most likely happen to the price.', pairs: chosen.map(([, e, l]) => [e.t, l]),
        hints: ['For each event, first decide: is it about how much there is (supply) or how much people want it (demand)?', 'Then decide if that amount went up or down.', 'Less to sell or more wanted → price likely up. More to sell or less wanted → price likely down.'],
        explanation: chosen.map(([, e, l]) => `${e.t} → ${l.toLowerCase()}.`).join(' ')
      };
    }
  },
  {
    id: 'pcr-fill', skill: 'price-change-reasons', kind: 'vocab', type: 'fill', targets: ['reason-backwards', 'supply-demand-mixup', 'prices-never-change'],
    make(c) {
      const v = c.chance(0.7) ? 0 : c.chance(0.5) ? 1 : 2;
      if (v === 0) {
        const [ei, e] = c.pickI(EVENTS), opp = e.dir === 'up' ? 'down' : 'up';
        return {
          sig: `e${ei}`, prompt: 'Choose the word that best completes the sentence.', sentence: `${e.t} Because ${e.why}, the price of ${e.item} will most likely go ___.`,
          correct: e.dir, wrongs: [[opp, 'reason-backwards'], ['nowhere — prices never change', 'prices-never-change']],
          hints: ['Read the reason in the middle of the sentence carefully.', 'Less available or more wanted → up. More available or less wanted → down.', `Ask: if ${e.why}, would sellers be able to charge more or less?`],
          explanation: `Because ${e.why}, the price will most likely go ${e.dir}.`
        };
      }
      const S = [
        { s: 'When a storm leaves fewer apples to sell, we say the [[supply]] of apples went ___.', c: 'down', w: [['up', 'reason-backwards'], ['sideways', 'prices-never-change']], h: 'Supply means how much there is to sell. Is there more or less now?' },
        { s: 'When lots more people want lemonade on a hot day, we say the ___ for lemonade went up.', c: 'demand', w: [['supply', 'supply-demand-mixup'], ['price tag', 'vocab-mixup'], ['seller', 'buyer-seller-swap']], h: 'The word for how much buyers want something starts with "d".' }
      ][v - 1];
      return {
        sig: `w${v}`, prompt: 'Choose the word that best completes the sentence.', sentence: S.s, correct: S.c, wrongs: S.w,
        hints: ['Read the whole sentence with each choice in the blank.', 'Supply = how much there is to sell. Demand = how much people want it.', S.h],
        explanation: `"${S.s.replace(/\[\[(\w+)\]\]/g, '$1').replace('___', S.c)}"`
      };
    }
  },
  {
    id: 'pcr-chart', skill: 'price-change-reasons', kind: 'chart', type: 'choice', targets: ['reason-backwards', 'irrelevant-reason'],
    make(c) {
      const [ei, e] = c.pickI(EVENTS), up = e.dir === 'up';
      const start = c.int(0, 7), labels = [0, 1, 2, 3, 4].map((k) => MONTHS[(start + k) % 12]);
      const base = c.price(4, 9), jump = c.price(2, 5), k = c.int(2, 3);
      const wig = () => (c.A ? c.int(-10, 10) : 0);
      const v = labels.map((_, x) => Math.max(100, x < k ? base + wig() : up ? base + jump + wig() : base - Math.min(jump, base - (c.A ? 150 : 100)) + wig()));
      const [ii, irr] = c.pickI(IRRELEVANT);
      return {
        sig: `${ei}.${start}.${base}.${jump}.${k}.${ii}`,
        prompt: `The chart shows the price of ${e.item} at a market each month. In ${labels[k]}, the price ${up ? 'jumped up' : 'dropped'}. Which event best explains the change?`,
        visual: { kind: 'line', title: `Price of ${e.item}`, unit: '$', points: labels.map((l, x) => ({ label: l, value: v[x] / 100 })), highlight: k },
        correct: e.t, wrongs: [[e.opp, 'reason-backwards'], [irr, 'irrelevant-reason'], ['Nothing happened — prices never change.', 'prices-never-change']],
        hints: [`Look at the chart: did the price go up or down in ${labels[k]}?`, 'Find the event that would push the price in that same direction.', 'Ask of each event: does it change how much there is or how many people want it — and which way?'],
        explanation: `The price ${up ? 'rose' : 'fell'} in ${labels[k]}. "${e.t}" means ${e.why}, which usually pushes the price ${e.dir}.`
      };
    }
  },
  {
    id: 'pcr-mistake', skill: 'price-change-reasons', kind: 'mistake-detective', type: 'choice', targets: ['reason-backwards'],
    make(c) {
      const [ei, e] = c.pickI(EVENTS), who = c.pick(DETECTIVES), opp = e.dir === 'up' ? 'down' : 'up';
      return {
        sig: `${ei}.${who}`, prompt: `Mistake Detective: ${who} says, "${e.t} So the price of ${e.item} will probably go ${opp}." What is ${who}'s mistake?`,
        correct: `Because ${e.why}, the price will more likely go ${e.dir}, not ${opp}.`,
        wrongs: [[`${who} is right — there is no mistake.`, 'reason-backwards'], [`Prices never change, so ${who} should say it stays the same.`, 'prices-never-change'], [`${who} mixed up the buyer and the seller.`, 'buyer-seller-swap']],
        hints: ['Does the event change how much there is, or how much people want it?', 'Less available or more wanted → price usually up. More available or less wanted → usually down.', `Check whether ${who}'s direction matches the event.`],
        explanation: `${e.t} That means ${e.why}, so the price will more likely go ${e.dir}. ${who} had the direction backwards.`
      };
    }
  },
  {
    id: 'pcr-likely', skill: 'price-change-reasons', kind: 'concept', type: 'choice', targets: ['can-predict-future', 'prices-never-change'],
    make(c) {
      const [ei, e] = c.pickI(EVENTS), name = c.pick(NAMES);
      return {
        sig: `${ei}.${name}`, prompt: `${e.t} ${name} says the price of ${e.item} will LIKELY go ${e.dir}. Why do we say "likely" instead of "for sure"?`,
        correct: 'Many things can affect a price at the same time, so nobody can be completely sure.',
        wrongs: [['Because prices never really change.', 'prices-never-change'], ['Because experts always know the exact future price, but kids do not.', 'can-predict-future'], ['Because this event has nothing to do with the price.', 'irrelevant-reason']],
        hints: ['Could something else happen at the same time that pushes the price the other way?', 'Think about all the things that can affect a price: weather, costs, what people want...', 'Even experts make careful guesses about prices — nobody knows the future for sure.'],
        explanation: `The event usually pushes the price ${e.dir}, but other things can happen at the same time. That is why we say "likely": nobody can know a future price for sure.`
      };
    }
  }
];

export const PRICE_TEACH = { 'price-change-math': TEACH_PCM, 'price-change-reasons': TEACH_PCR };
