// World 2, Lesson 1: future-agreement, hedge-outcome, futures-risk. All amounts are pretend.
// Accuracy rules: a forward/futures agreement is made today to buy or sell a set amount at a set price on a
// later date; real futures are standardized and traded on regulated exchanges; hedging reduces price risk but
// gives up some possible benefit; nobody can know future prices. No trading signals, no "get rich" framing.
import { NAMES, DETECTIVES, GOODS, MONTHS } from './pools.js';

const MINUS = '−';
const TEACH_FA = {
  explorer: 'A forward agreement is an agreement made TODAY to buy or sell a set amount of something at a set price on a LATER date. Example: in March, Baker Keisha and Farmer Andre agree that in August Keisha will buy 100 bushels of wheat for $6 a bushel. In August, Keisha pays $6 a bushel — even if the market price is now $8 or $4. The item, the amount, the price, and the date were all set on the day they agreed. Nobody knows what the market price will be later; the agreement just locks in their price.',
  analyst: 'A forward agreement is a private agreement made today to buy or sell a set quantity at a set price on a later date. A futures contract is the same idea, but standardized (set quantity, quality, and delivery months) and traded on a regulated exchange, which makes it easy to find a trading partner. In both, the agreed price does not change when the market price changes later. Total cost = agreed price per unit × quantity. Agreeing on a price does not mean anyone knows the future price, and it does not guarantee a profit.'
};
const TEACH_HO = {
  explorer: 'To see who came out ahead, compare the agreed price with the market price on the later date. If the market price ends HIGHER than the agreed price, the buyer pays less than the market (the buyer comes out ahead) and the seller misses out. If the market price ends LOWER, the seller gets more than the market (the seller comes out ahead) and the buyer pays extra. Difference for one = bigger price − smaller price. Total difference = difference for one × how many. A price agreement is a hedge: it gives both sides certainty about the price, but one side usually ends up wishing they had waited. It is about knowing your price, not about winning.',
  analyst: 'Compare the agreed price (A) with the market price at delivery (M). If M > A, the buyer saves (M − A) per unit compared with the market, and the seller receives (M − A) less than the market. If M < A, the seller receives (A − M) more per unit and the buyer pays (A − M) more. Total = per-unit difference × quantity, e.g. ($4.60 − $4.25) × 5,000 bushels = $0.35 × 5,000 = $1,750. Hedging reduces price risk — each side knows its price in advance — but it gives up the possible benefit of a favorable move. A hedge that "lost" compared with the market still did its job: it provided certainty.'
};
const TEACH_FR = {
  explorer: 'Nobody can know future prices for sure — that is uncertainty. Weather, costs, and what people want can all change. Risk is the chance that things turn out worse than you hoped. In a price agreement BOTH sides take a risk: if the market price goes up, the seller misses out on the higher price; if it goes down, the buyer pays more than the market. Past prices do not tell us for sure what will happen next. A hedge reduces price risk, but it cannot remove all risk.',
  analyst: 'Uncertainty means future prices cannot be known; risk is the chance of an outcome worse than expected. Both sides of a futures agreement face price risk in opposite directions. In futures trading, margin is a good-faith deposit — NOT the maximum loss; if prices move far enough against you, losses can exceed the deposit. Leverage means a small deposit controls a large quantity, so price moves are magnified in BOTH directions: gains and losses grow compared with the deposit. Example (pretend): a contract for 5,000 bushels and a $0.20 drop is a $1,000 loss, no matter how small the deposit was.'
};

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** A pretend agreement: goods, months, agreed price (cents), market price later (cents). */
function deal(c, { dir, maxDiff } = {}) {
  const [gi, g] = c.pickI(GOODS);
  const mi = c.int(0, 7), made = MONTHS[mi], deliv = MONTHS[mi + c.int(2, 4)];
  const a = c.price(g.lo, g.hi);
  const md = maxDiff ?? (c.A ? Math.max(0.3, (g.hi - g.lo) / 2) : Math.max(1, Math.min(4, Math.floor((g.hi - g.lo) / 2))));
  const d = c.A ? c.price(0.05, md) : c.int(1, Math.max(1, Math.floor(md))) * 100;
  let up = dir ? dir === 'up' : c.chance(0.5);
  if (up && !c.A && a + d > c.cap * 100) up = false;   // Explorer easy keeps every amount ≤ $20
  if (!up && a - d < 100) up = true;
  const mk = up ? a + d : a - d;
  return { gi, g, made, deliv, a, mk, up: mk > a, d: Math.abs(mk - a) };
}

/** Quantity of units by band/difficulty. */
function qty(c) {
  if (c.A) return c.easy ? c.int(2, 10) : c.medium ? c.pick([100, 200, 250, 400, 500]) : c.pick([1000, 2000, 5000, 10000]);
  return c.easy ? c.int(2, 5) : c.medium ? c.int(3, 12) : c.int(10, 50);
}

function perspective(c, D) {
  const buyerSide = c.chance(0.5);
  const { g, up } = D;
  const party = buyerSide ? g.buyer : g.seller;
  const ahead = (buyerSide && up) || (!buyerSide && !up);
  return { buyerSide, party, ahead };
}

export const FUTURES_TEMPLATES = [
  // ---------------------------------------------------------------- future-agreement
  {
    id: 'fa-define', skill: 'future-agreement', kind: 'vocab', type: 'choice', targets: ['agreement-today-trade', 'agreement-later-price', 'can-predict-future', 'futures-informal', 'guaranteed-profit'],
    make(c) {
      const futures = c.A && c.chance(0.5);
      const stems = futures ? ['What is a [[futures-contract|futures contract]]?', 'Which sentence best describes a [[futures-contract|futures contract]]?'] : ['What is a [[forward-agreement|forward agreement]]?', 'Which sentence best describes a [[forward-agreement|forward agreement]]?', 'What does it mean to agree on a future price?'];
      const correct = futures ? 'A standardized agreement, traded on a regulated exchange, to buy or sell a set amount of something at a set price on a later date' : 'An agreement made today to buy or sell a set amount of something at a set price on a later date';
      const W = [
        ['A promise that the price will go up later', 'can-predict-future'],
        ['Buying something today and taking it home today', 'agreement-today-trade'],
        ['A deal where the buyer pays whatever the market price is on the later date', 'agreement-later-price'],
        ['A guarantee that both sides will make a profit', 'guaranteed-profit'],
        ['A guess about what the weather will be next month', 'vocab-mixup']
      ];
      if (futures) W.push(['An informal handshake deal with no rules, made only between neighbors', 'futures-informal']);
      const [si, stem] = c.pickI(stems), wi = futures ? [5, ...c.sampleI(W.slice(0, 5), 2)] : c.sampleI(W, 3);
      const focusI = W.findIndex((w) => w[1] === c.focus);
      if (focusI >= 0 && !wi.includes(focusI)) wi[wi.length - 1] = focusI;
      const uniq = [...new Set(wi)].sort((x, y) => x - y);
      return {
        sig: `${futures ? 'f' : 'a'}${si}.${uniq.join('')}`, prompt: stem, correct, wrongs: uniq.map((i) => W[i]),
        hints: ['Think about WHEN the agreement is made and WHEN the trade happens.', 'The price is decided on the day they agree — not later.', futures ? 'Real futures contracts follow set rules and are traded in an organized, regulated place.' : 'Look for the choice that has: today, a set amount, a set price, and a later date.'],
        explanation: futures ? 'A futures contract is an agreement made today to buy or sell a set amount at a set price on a later date. Real futures are standardized and traded on regulated exchanges. Nobody knows the future price, and no profit is guaranteed.' : 'A forward agreement is made today and sets the amount and price for a trade on a later date. The price does not change when the market price changes, and nobody knows what the market price will be.'
      };
    }
  },
  {
    id: 'fa-card', skill: 'future-agreement', kind: 'visual', type: 'choice', targets: ['buyer-seller-swap', 'agreement-today-trade', 'agreement-later-price', 'per-unit-vs-total'],
    make(c) {
      const D = deal(c), q = qty(c), { g, a, made, deliv } = D;
      const ask = c.pick(['seller', 'buyer', 'price', 'when', 'qty']);
      const A = {
        seller: { q: 'Who agreed to SELL?', c: g.seller, w: [[g.buyer, 'buyer-seller-swap'], [`Whoever has ${g.item} on the delivery date`, 'agreement-later-price'], ['Nobody — it is only a guess', 'can-predict-future']] },
        buyer: { q: 'Who agreed to BUY?', c: cap(g.buyer), w: [[cap(g.seller), 'buyer-seller-swap'], [`Whoever wants ${g.item} on the delivery date`, 'agreement-later-price'], ['Nobody — it is only a guess', 'can-predict-future']] },
        price: { q: `What price per ${g.unit} will the buyer pay?`, c: `${c.m(a)} per ${g.unit}`, w: [[`Whatever the market price is in ${deliv}`, 'agreement-later-price'], [`${c.m(a * q)} per ${g.unit}`, 'per-unit-vs-total'], [`Nothing — the agreement is free`, 'vocab-mixup']] },
        when: { q: 'When will the trade happen?', c: `In ${deliv}`, w: [[`In ${made}, the day they agreed`, 'agreement-today-trade'], ['Whenever the price goes up', 'can-predict-future'], ['Whenever the buyer feels like it', 'vocab-mixup']] },
        qty: { q: `How much ${g.item} will be traded?`, c: `${c.num(q)} ${q === 1 ? g.unit : g.units}`, w: [[`1 ${g.unit}`, 'per-unit-vs-total'], [`${c.num(q * 2)} ${g.units}`, 'misread-chart'], [`As much as the market wants in ${deliv}`, 'agreement-later-price']] }
      }[ask];
      return {
        sig: `${D.gi}.${a}.${q}.${made}.${deliv}.${ask}`,
        prompt: `In ${made}, ${g.buyer} and ${g.seller} made this pretend agreement. ${A.q}`,
        visual: { kind: 'agreement', item: g.item, buyer: cap(g.buyer), seller: cap(g.seller), price: a / 100, quantity: `${c.num(q)} ${g.units}`, when: `Delivery in ${deliv}` },
        correct: A.c, wrongs: A.w,
        hints: ['Read every row of the agreement card.', 'The card lists the item, the buyer, the seller, the agreed price, the amount, and when.', 'Find the one row that answers the question exactly.'],
        explanation: `The card says: ${cap(g.seller)} will sell ${c.num(q)} ${g.units} of ${g.item} to ${g.buyer} for ${c.m(a)} per ${g.unit}, with delivery in ${deliv}. Those terms were set in ${made}, when they agreed.`
      };
    }
  },
  {
    id: 'fa-pays', skill: 'future-agreement', kind: 'scenario', type: 'choice', targets: ['agreement-later-price'],
    make(c) {
      const D = deal(c), q = qty(c), { g, a, mk, made, deliv } = D;
      return {
        sig: `${D.gi}.${a}.${mk}.${q}.${made}.${deliv}`,
        prompt: `In ${made}, ${g.buyer} agrees to buy ${c.num(q)} ${g.units} of ${g.item} from ${g.seller} for ${c.m(a)} per ${g.unit}, delivered in ${deliv}. In ${deliv}, the market price is ${c.m(mk)} per ${g.unit}. What price per ${g.unit} does ${g.buyer} pay?`,
        correct: `${c.m(a)} per ${g.unit}`,
        wrongs: [[`${c.m(mk)} per ${g.unit}`, 'agreement-later-price'], [`${c.m(D.d)} per ${g.unit}`, 'used-wrong-number'], [`${c.m(a + mk)} per ${g.unit}`, 'added-instead']],
        hints: ['Which price did they agree on, and when?', 'In a price agreement, the price is set on the day they agree.', `Does the ${deliv} market price change what they already agreed to?`],
        explanation: `They agreed in ${made} on ${c.m(a)} per ${g.unit}. That price stays the same in ${deliv}, even though the market price is now ${c.m(mk)}.`
      };
    }
  },
  {
    id: 'fa-fill', skill: 'future-agreement', kind: 'vocab', type: 'fill', targets: ['agreement-today-trade', 'agreement-later-price', 'futures-informal'],
    make(c) {
      const F = [
        { s: 'A forward agreement is made ___, but the trade happens on a later date.', c: 'today', w: [['on the delivery day', 'agreement-today-trade'], ['after the trade', 'agreement-today-trade'], ['never', 'vocab-mixup']], h: 'The agreement comes first; the trade comes later. When is the agreement made?' },
        { s: 'The price in the agreement is set when they agree, so it does not change when the ___ price changes later.', c: 'market', w: [['agreed', 'agreement-later-price'], ['promised', 'agreement-later-price'], ['zero', 'vocab-mixup']], h: 'There are two prices in the story: the one they agreed on, and the one at the market later.' },
        { s: 'The buyer and seller agree on the item, the amount, the price, and the ___ of the trade.', c: 'date', w: [['color', 'vocab-mixup'], ['winner', 'guaranteed-profit'], ['weather', 'can-predict-future']], h: 'An agreement for later needs to say WHEN the trade will happen.' },
        { s: 'In the agreement, the [[seller]] promises to deliver the goods, and the [[buyer]] promises to ___ the agreed price.', c: 'pay', w: [['change', 'agreement-later-price'], ['guess', 'can-predict-future'], ['skip', 'vocab-mixup']], h: 'What does a buyer give in any trade?' }
      ];
      if (c.A) F.push({ s: 'Real futures contracts are standardized and traded on a regulated ___.', c: 'exchange', w: [['playground', 'futures-informal'], ['handshake', 'futures-informal'], ['guess', 'can-predict-future']], h: 'It is an organized market with rules — like a grain [[exchange]].' });
      const [i, f] = c.pickI(F);
      return {
        sig: `${i}`, prompt: 'Choose the word that best completes the sentence.', sentence: f.s, correct: f.c, wrongs: f.w,
        hints: ['Read the sentence with each choice in the blank.', 'Remember: agree today → set amount and set price → trade on a later date.', f.h],
        explanation: `"${f.s.replace(/\[\[(\w+)\]\]/g, '$1').replace('___', f.c)}"`
      };
    }
  },
  {
    id: 'fa-match', skill: 'future-agreement', kind: 'scenario', type: 'match', targets: ['buyer-seller-swap', 'per-unit-vs-total'],
    make(c) {
      const D = deal(c), q = qty(c), { g, a, deliv } = D;
      const parts = [['What is traded', cap(g.item)], ['How much', `${c.num(q)} ${g.units}`], ['The agreed price', `${c.m(a)} per ${g.unit}`], ['When the trade happens', deliv], ['Who will buy', cap(g.buyer)], ['Who will sell', cap(g.seller)]];
      const idx = c.sampleI(parts, 4);
      return {
        sig: `${D.gi}.${a}.${q}.${deliv}.${idx.join('')}`,
        prompt: `${cap(g.buyer)} and ${g.seller} agree: "${cap(g.seller)} will deliver ${c.num(q)} ${g.units} of ${g.item} to ${g.buyer} in ${deliv} for ${c.m(a)} per ${g.unit}." Match each part of the agreement to its value.`,
        pairs: idx.map((i) => parts[i]),
        hints: ['Reread the agreement sentence slowly.', 'Look for a name, an amount, a price, and a month in the sentence.', 'The buyer receives the goods; the seller delivers them.'],
        explanation: idx.map((i) => `${parts[i][0]}: ${parts[i][1]}.`).join(' ')
      };
    }
  },
  {
    id: 'fa-mistake', skill: 'future-agreement', kind: 'mistake-detective', type: 'choice', targets: ['agreement-later-price', 'agreement-today-trade', 'can-predict-future', 'guaranteed-profit', 'futures-informal'],
    make(c) {
      const D = deal(c), { g, a, deliv } = D;
      const M = [
        { says: `In ${deliv}, ${g.buyer} will pay whatever the market price is then.`, c: `The price (${c.m(a)} per ${g.unit}) was set on the day they agreed; it stays the same in ${deliv}.`, mis: 'agreement-later-price' },
        { says: `The ${g.item} changes hands on the day they make the agreement.`, c: 'The agreement is made today, but the trade happens on the later date.', mis: 'agreement-today-trade' },
        { says: 'Since they agreed on a price, they must know what the market price will be later.', c: 'Nobody knows the future market price; the agreement only sets the price THEY will trade at.', mis: 'can-predict-future' },
        { says: `The agreement guarantees that ${g.seller} will make a profit.`, c: 'An agreement sets a price, but it cannot guarantee a profit — costs and market prices can still change.', mis: 'guaranteed-profit' }
      ];
      if (c.A) M.push({ says: 'Futures contracts are just friendly handshake deals with no rules.', c: 'Real futures contracts are standardized and traded on regulated exchanges.', mis: 'futures-informal' });
      const fill = [['The mistake is that only farmers can make agreements.', 'vocab-mixup'], ['The mistake is mixing up the item and the price.', 'vocab-mixup'], ['The mistake is that agreements can only be about wheat.', 'vocab-mixup']];
      const foc = M.map((m, i) => [i, m]).filter(([, m]) => m.mis === c.focus);
      const [mi, x] = foc.length ? c.pick(foc) : c.pickI(M);
      const who = c.pick(DETECTIVES), fi = c.sampleI(fill, 2);
      return {
        sig: `${mi}.${D.gi}.${a}.${deliv}.${who}.${fi.join('')}`,
        prompt: `${cap(g.buyer)} agreed to buy ${g.item} from ${g.seller} for ${c.m(a)} per ${g.unit}, to be delivered in ${deliv}. Mistake Detective: ${who} says, "${x.says}" What is the mistake?`,
        correct: x.c, wrongs: [[`${who} is right — there is no mistake.`, x.mis], ...fi.map((i) => fill[i])],
        hints: [`Reread what ${who} said and compare it with the agreement.`, 'Remember: agreed today, set amount, set price, trade on a later date.', 'Ask: does anyone know the future price? Does the agreed price change?'],
        explanation: x.c
      };
    }
  },
  {
    id: 'fa-total', skill: 'future-agreement', kind: 'math', type: 'number', targets: ['per-unit-vs-total', 'agreement-later-price', 'added-instead'],
    make(c) {
      const D = deal(c), { g, deliv, mk } = D;
      let q = qty(c), a = D.a;
      if (!c.A && c.easy) { q = c.int(2, 4); a = c.int(1, Math.floor(20 / q)) * 100; }
      if (!c.A && c.medium) { a = Math.min(a, 1900); q = Math.max(2, Math.min(q, Math.floor(10000 / a))); }
      const twoStep = !c.A && c.challenge;
      const months = twoStep ? c.int(2, 4) : 1;
      if (twoStep) q = c.int(3, 12);
      const total = a * q * months;
      const showMarket = c.A && !c.easy;
      return {
        sig: `${D.gi}.${a}.${q}.${months}.${showMarket ? mk : ''}`,
        prompt: twoStep
          ? `${cap(g.buyer)} agrees today to buy ${q} ${g.units} of ${g.item} from ${g.seller} every month for the next ${months} months, at ${c.m(a)} per ${g.unit}. How much will ${g.buyer} pay in total for all ${months} months?`
          : `${cap(g.buyer)} agrees to buy ${c.num(q)} ${g.units} of ${g.item} from ${g.seller} for ${c.m(a)} per ${g.unit}, delivered in ${deliv}.${showMarket ? ` In ${deliv}, the market price turns out to be ${c.m(mk)} per ${g.unit}.` : ''} How much does ${g.buyer} pay in total under the agreement?`,
        answer: total / 100, prefix: '$', data: { price: a / 100, qty: q, months, ...(showMarket ? { market: mk / 100 } : {}) },
        errors: [[a / 100, 'per-unit-vs-total'], [(a * q) / 100, 'per-unit-vs-total'], [(mk * q * months) / 100, 'agreement-later-price'], [(a + q * 100) / 100, 'added-instead']],
        hints: twoStep
          ? ['This takes two steps. How many ' + g.units + ' are bought in all?', `Step 1: ${g.units} per month × number of months. Step 2: total ${g.units} × the agreed price.`, `Set it up: (${q} × ${months}) × ${c.m(a)} = ?`]
          : [`The agreed price is for ONE ${g.unit}. How many ${g.units} are there?`, showMarket ? 'Use the AGREED price — the later market price does not change the agreement.' : 'Total cost = price for one × how many.', `Set it up: ${c.m(a)} × ${c.num(q)} = ?`],
        explanation: twoStep
          ? `${q} × ${months} = ${q * months} ${g.units}. ${q * months} × ${c.m(a)} = ${c.m(total)}.`
          : `${c.m(a)} × ${c.num(q)} = ${c.m(total)}.${showMarket ? ` The ${c.m(mk)} market price does not matter — they agreed on ${c.m(a)}.` : ''}`
      };
    }
  },

  // ---------------------------------------------------------------- hedge-outcome
  {
    id: 'ho-who', skill: 'hedge-outcome', kind: 'scenario', type: 'choice', targets: ['hedge-wrong-side', 'hedge-is-winning', 'agreement-later-price'],
    make(c) {
      const D = deal(c), { g, a, mk, made, deliv, up } = D;
      const B = `${cap(g.buyer)} (the buyer) — paying ${c.m(a)} is less than the market price.`;
      const S = `${cap(g.seller)} (the seller) — getting ${c.m(a)} is more than the market price.`;
      return {
        sig: `${D.gi}.${a}.${mk}.${made}.${deliv}`,
        prompt: `In ${made}, ${g.buyer} agreed to buy ${g.item} from ${g.seller} at ${c.m(a)} per ${g.unit}, for delivery in ${deliv}. In ${deliv}, the market price is ${c.m(mk)} per ${g.unit}. Compared with trading at the market price, who came out ahead?`,
        correct: up ? B : S,
        wrongs: [[up ? `${cap(g.seller)} (the seller) — the market price went up, so the seller wins too.` : `${cap(g.buyer)} (the buyer) — the market price went down, so the buyer wins too.`, 'hedge-wrong-side'], ['Both of them came out ahead.', 'hedge-is-winning'], ['Neither — the agreed price switches to the market price.', 'agreement-later-price']],
        hints: ['Is the market price in ' + deliv + ' higher or lower than the agreed price?', 'The buyer pays the agreed price. The seller receives the agreed price.', `Ask: would ${g.buyer} rather pay ${c.m(a)} or ${c.m(mk)}? Would ${g.seller} rather receive ${c.m(a)} or ${c.m(mk)}?`],
        explanation: up
          ? `The market price (${c.m(mk)}) ended higher than the agreed price (${c.m(a)}), so ${g.buyer} paid ${c.m(D.d)} per ${g.unit} less than the market. ${cap(g.seller)} missed out on the higher price — but both knew their price in advance. That certainty is the point of hedging.`
          : `The market price (${c.m(mk)}) ended lower than the agreed price (${c.m(a)}), so ${g.seller} received ${c.m(D.d)} per ${g.unit} more than the market. This time the agreement turned out worse for ${g.buyer} — but ${g.buyer} knew the cost in advance. Hedging is about certainty, not winning.`
      };
    }
  },
  {
    id: 'ho-unit', skill: 'hedge-outcome', kind: 'math', type: 'number', targets: ['added-instead', 'used-wrong-number'],
    make(c) {
      const D = deal(c), { g, a, mk, deliv, up, d } = D, P = perspective(c, D);
      const qtext = P.buyerSide
        ? (up ? `How much per ${g.unit} did the agreement save ${g.buyer}, compared with paying the market price?` : `Because of the agreement, how much MORE per ${g.unit} did ${g.buyer} pay than the market price?`)
        : (up ? `Because of the agreement, how much LESS per ${g.unit} did ${g.seller} receive than the market price?` : `Thanks to the agreement, how much MORE per ${g.unit} did ${g.seller} receive than the market price?`);
      return {
        sig: `${D.gi}.${a}.${mk}.${P.buyerSide ? 'b' : 's'}.${deliv}`,
        prompt: `${cap(g.buyer)} agreed to buy ${g.item} from ${g.seller} at ${c.m(a)} per ${g.unit}. In ${deliv}, the market price is ${c.m(mk)} per ${g.unit}. ${qtext}`,
        answer: d / 100, prefix: '$', data: { agreed: a / 100, market: mk / 100 },
        errors: [[(a + mk) / 100, 'added-instead'], [a / 100, 'used-wrong-number'], [mk / 100, 'used-wrong-number']],
        hints: ['Find the two prices: the agreed price and the market price in ' + deliv + '.', 'The difference per unit is how far apart those two prices are.', `Set it up: ${c.m(Math.max(a, mk))} ${MINUS} ${c.m(Math.min(a, mk))} = ?`],
        explanation: `${c.m(Math.max(a, mk))} ${MINUS} ${c.m(Math.min(a, mk))} = ${c.m(d)} per ${g.unit}. ${P.ahead ? `This time the agreement worked out in ${P.party}'s favor.` : `This time the agreement turned out worse for ${P.party} than waiting — that is the trade-off for knowing the price ahead of time.`}`
      };
    }
  },
  {
    id: 'ho-total', skill: 'hedge-outcome', kind: 'math', type: 'number', targets: ['per-unit-vs-total', 'used-wrong-number', 'added-instead'],
    make(c) {
      let D = deal(c, { maxDiff: c.A ? undefined : c.easy ? 4 : 6 }), q = qty(c);
      if (!c.A && c.easy) q = c.int(2, Math.max(2, Math.floor(2000 / D.d)));
      if (!c.A && c.medium) q = c.int(3, Math.max(3, Math.min(20, Math.floor(10000 / D.d))));
      const { g, a, mk, deliv, up, d } = D, P = perspective(c, D);
      const qtext = P.buyerSide
        ? (up ? `Compared with paying the market price, how much did the agreement save ${g.buyer} in total?` : `Compared with paying the market price, how much MORE did ${g.buyer} pay in total because of the agreement?`)
        : (up ? `Compared with selling at the market price, how much LESS did ${g.seller} receive in total because of the agreement?` : `Compared with selling at the market price, how much MORE did ${g.seller} receive in total because of the agreement?`);
      const total = d * q;
      return {
        sig: `${D.gi}.${a}.${mk}.${q}.${P.buyerSide ? 'b' : 's'}`,
        prompt: `${cap(g.buyer)} made a pretend agreement to buy ${c.num(q)} ${g.units} of ${g.item} from ${g.seller} at ${c.m(a)} per ${g.unit}. In ${deliv}, the market price is ${c.m(mk)} per ${g.unit}. ${qtext}`,
        answer: total / 100, prefix: '$', data: { agreed: a / 100, market: mk / 100, qty: q },
        errors: [[d / 100, 'per-unit-vs-total'], [(a * q) / 100, 'used-wrong-number'], [(mk * q) / 100, 'used-wrong-number'], [((a + mk) * q) / 100, 'added-instead']],
        hints: ['This takes two steps: first find the difference for ONE ' + g.unit + '.', `Step 1: subtract the two prices. Step 2: multiply by the number of ${g.units}.`, `Set it up: (${c.m(Math.max(a, mk))} ${MINUS} ${c.m(Math.min(a, mk))}) × ${c.num(q)} = ?`],
        explanation: `Difference per ${g.unit}: ${c.m(Math.max(a, mk))} ${MINUS} ${c.m(Math.min(a, mk))} = ${c.m(d)}. Total: ${c.m(d)} × ${c.num(q)} = ${c.m(total)}. ${P.ahead ? `The agreement worked out for ${P.party} this time.` : `The agreement turned out worse for ${P.party} this time — hedging trades away possible gains for certainty.`}`
      };
    }
  },
  {
    id: 'ho-chart', skill: 'hedge-outcome', kind: 'chart', type: 'choice', targets: ['hedge-wrong-side', 'misread-chart', 'hedge-is-winning'],
    make(c) {
      const D = deal(c), { g, a, mk, up } = D;
      const mi = c.int(0, 6), labels = [0, 1, 2, 3, 4].map((k) => MONTHS[mi + k]);
      const v = [a];
      for (let k = 1; k < 4; k++) v.push(Math.max(100, a + (c.A ? c.int(-60, 60) : c.int(-2, 2) * 100)));
      v.push(mk);
      // a middle month that pointed the OTHER way, so readers must use the delivery month
      v[2] = up ? Math.max(100, a - (c.A ? c.int(10, 50) : 100)) : a + (c.A ? c.int(10, 50) : 100);
      return {
        sig: `${D.gi}.${a}.${v.join('-')}.${mi}`,
        prompt: `In ${labels[0]}, ${g.buyer} and ${g.seller} agreed on ${c.m(a)} per ${g.unit} of ${g.item}, for delivery in ${labels[4]}. The chart shows the market price each month. At delivery in ${labels[4]}, who came out ahead compared with the market price?`,
        visual: { kind: 'line', title: `Market price of ${g.item} (per ${g.unit})`, unit: '$', points: labels.map((l, k) => ({ label: l, value: v[k] / 100 })), highlight: 4 },
        correct: up ? `${cap(g.buyer)}, the buyer` : `${cap(g.seller)}, the seller`,
        wrongs: [[up ? `${cap(g.seller)}, the seller` : `${cap(g.buyer)}, the buyer`, 'hedge-wrong-side'], ['Both of them', 'hedge-is-winning'], [`Whoever was ahead in ${labels[2]}`, 'misread-chart']],
        hints: [`Only the delivery month matters for the trade. Find ${labels[4]} on the chart.`, `Compare the ${labels[4]} market price with the agreed price, ${c.m(a)}.`, 'Market higher than agreed → buyer ahead. Market lower than agreed → seller ahead.'],
        explanation: `In ${labels[4]} the market price was ${c.m(mk)}, ${up ? 'higher' : 'lower'} than the agreed ${c.m(a)}. So ${up ? `${g.buyer} paid less than the market` : `${g.seller} received more than the market`}. The ups and downs in between did not change the agreed price.`
      };
    }
  },
  {
    id: 'ho-why', skill: 'hedge-outcome', kind: 'concept', type: 'choice', targets: ['hedge-is-winning', 'can-predict-future'],
    make(c) {
      const [gi, g] = c.pickI(GOODS), buyerSide = c.chance(0.5);
      const who = buyerSide ? g.buyer : g.seller;
      return {
        sig: `${gi}.${buyerSide ? 'b' : 's'}`,
        prompt: `Why might ${who} agree ahead of time on a price for ${g.item}, even though the agreement could turn out worse than waiting?`,
        correct: buyerSide ? 'To know the cost ahead of time and reduce price risk, even if the market price ends up lower.' : 'To know what they will be paid ahead of time and reduce price risk, even if the market price ends up higher.',
        wrongs: [['To be sure of making the most money possible.', 'hedge-is-winning'], ['Because they know which way the price will move.', 'can-predict-future'], ['So they never have to pay or deliver anything.', 'agreement-today-trade']],
        hints: ['Think about how it feels to NOT know a price you will need to plan around.', 'A [[hedge]] is about certainty — knowing your price — not about winning.', 'Which choice mentions reducing price risk AND admits it could turn out worse?'],
        explanation: `${cap(who)} gives up the chance of a better price in exchange for certainty. Knowing the price ahead of time makes planning easier and reduces price risk — that is what hedging is for. Nobody knows which way prices will move.`
      };
    }
  },
  {
    id: 'ho-mistake', skill: 'hedge-outcome', kind: 'mistake-detective', type: 'choice', targets: ['hedge-is-winning', 'hedge-wrong-side', 'per-unit-vs-total'],
    make(c) {
      const who = c.pick(DETECTIVES);
      const D = deal(c), { g, a, mk, up, d } = D, q = qty(c);
      const M = [
        { setup: `${cap(g.seller)} agreed to sell ${g.item} at ${c.m(a)} per ${g.unit}. Later the market price was ${c.m(up ? mk : a + d)}.`, says: 'The agreement was a total failure, so hedging is pointless.', c: 'The agreement did its job: it gave certainty. Giving up a possible gain is the trade-off of hedging.', mis: 'hedge-is-winning' },
        { setup: `${cap(g.buyer)} agreed to buy ${g.item} at ${c.m(a)} per ${g.unit}. Later the market price was ${c.m(up ? mk : a + d)}.`, says: 'The market price went up, so the buyer AND the seller both came out ahead.', c: 'Compared with the market, the buyer came out ahead and the seller missed out — the same difference, on opposite sides.', mis: 'hedge-is-winning' },
        { setup: `${cap(g.buyer)} agreed to buy ${g.item} at ${c.m(a)} per ${g.unit}. Later the market price was ${c.m(up ? Math.max(50, a - d) : mk)}.`, says: 'The market price ended lower than the agreed price, so the buyer came out ahead.', c: 'When the market price ends lower, the seller comes out ahead; the buyer pays more than the market price.', mis: 'hedge-wrong-side' },
        { setup: `${cap(g.buyer)} agreed to buy ${c.num(q)} ${g.units} of ${g.item} at ${c.m(a)} per ${g.unit}. Later the market price was ${c.m(a + d)}.`, says: `The agreement saved ${c.m(d)} per ${g.unit}, so it saved ${c.m(d)} in total.`, c: `${who} forgot to multiply by the ${c.num(q)} ${g.units}.`, mis: 'per-unit-vs-total' }
      ];
      const foc = M.map((m, i) => [i, m]).filter(([, m]) => m.mis === c.focus);
      const [mi, x] = foc.length ? c.pick(foc) : c.pickI(M);
      const fill = [['The mistake is that agreements can only be about wheat.', 'vocab-mixup'], ['The mistake is that the agreed price changes every day.', 'agreement-later-price'], ['The mistake is that buyers and sellers never agree on anything.', 'vocab-mixup']];
      const fi = c.sampleI(fill, 2);
      return {
        sig: `${mi}.${D.gi}.${a}.${d}.${q}.${who}.${fi.join('')}`,
        prompt: `${x.setup} Mistake Detective: ${who} says, "${x.says}" What is the mistake?`,
        correct: x.c, wrongs: [[`${who} is right — there is no mistake.`, x.mis], ...fi.map((i) => fill[i])],
        hints: ['Compare the agreed price with the later market price. Which is higher?', 'Market higher → buyer ahead, seller misses out. Market lower → seller ahead, buyer pays extra.', 'Remember: a hedge is for certainty. And a total needs the number of units.'],
        explanation: x.c
      };
    }
  },
  {
    id: 'ho-match', skill: 'hedge-outcome', kind: 'concept', type: 'match', targets: ['hedge-wrong-side', 'can-predict-future'],
    make(c) {
      const [gi, g] = c.pickI(GOODS);
      const P = [
        ['The market price ends ABOVE the agreed price', `${cap(g.buyer)} pays less than the market price`],
        ['The market price ends BELOW the agreed price', `${cap(g.seller)} gets more than the market price`],
        ['The market price ends EQUAL to the agreed price', 'Neither side gains or misses out compared with the market'],
        ['Before the delivery date', 'Nobody knows which way the price will go']
      ];
      return {
        sig: `${gi}`, prompt: `${cap(g.buyer)} and ${g.seller} agreed on a price for ${g.item} to be delivered later. Match each situation to what it means.`, pairs: P,
        hints: ['Start with the situation you are surest about.', 'The buyer pays the agreed price; the seller receives it. Compare that with the market price.', 'Before the delivery date, can anyone know the future price?'],
        explanation: 'Market above agreed → the buyer pays less than the market. Market below agreed → the seller gets more than the market. Equal → nobody gains or misses out. Before delivery, nobody knows which way the price will go.'
      };
    }
  },
  {
    id: 'ho-fill', skill: 'hedge-outcome', kind: 'vocab', type: 'fill', targets: ['hedge-is-winning', 'hedge-wrong-side'],
    make(c) {
      const F = [
        { s: 'A [[hedge]] reduces [[price-risk|price risk]], but it can mean giving up some possible ___.', c: 'benefit', w: [['deliveries', 'vocab-mixup'], ['buyers', 'buyer-seller-swap'], ['rules', 'futures-informal']] },
        { s: 'If the market price ends higher than the agreed price, the ___ comes out ahead.', c: 'buyer', w: [['seller', 'hedge-wrong-side'], ['both sides', 'hedge-is-winning'], ['nobody', 'agreement-later-price']] },
        { s: 'If the market price ends lower than the agreed price, the ___ comes out ahead.', c: 'seller', w: [['buyer', 'hedge-wrong-side'], ['both sides', 'hedge-is-winning'], ['nobody', 'agreement-later-price']] },
        { s: 'The main goal of a [[hedge]] is ___, not winning.', c: 'certainty', w: [['profit', 'hedge-is-winning'], ['luck', 'can-predict-future'], ['speed', 'vocab-mixup']] }
      ];
      const [i, f] = c.pickI(F);
      return {
        sig: `${i}`, prompt: 'Choose the word that best completes the sentence.', sentence: f.s, correct: f.c, wrongs: f.w,
        hints: ['Read the sentence with each choice in the blank.', 'The buyer pays the agreed price, the seller receives it. Hedging trades possible gains for knowing the price.', 'Picture a baker who agreed to pay $5. If the market price jumps to $8, how does the baker feel?'],
        explanation: `"${f.s.replace(/\[\[([\w-]+)(\|[^\]]+)?\]\]/g, (m0, id, shown) => (shown ? shown.slice(1) : id)).replace('___', f.c)}"`
      };
    }
  },

  // ---------------------------------------------------------------- futures-risk
  {
    id: 'fr-know', skill: 'futures-risk', kind: 'concept', type: 'choice', targets: ['can-predict-future', 'past-predicts-future', 'prices-never-change'],
    make(c) {
      const [gi, g] = c.pickI(GOODS), per = c.pick(['next month', 'next season', 'in three months', 'next year']), name = c.pick(NAMES);
      return {
        sig: `${gi}.${per}.${name}`, prompt: `${name} asks, "What will the price of ${g.item} be ${per}?" Which answer is true?`,
        correct: 'Nobody can know for sure — it could go up, go down, or stay about the same.',
        wrongs: [['Experts always know the exact future price.', 'can-predict-future'], ['It will be the same as last month, because prices repeat.', 'past-predicts-future'], ['It will go up, because prices always go up.', 'past-predicts-future']],
        hints: ['Think about everything that can change a price: weather, costs, what people want.', 'Can anyone see into the future?', 'Look for the answer that admits [[uncertainty]].'],
        explanation: 'Future prices are uncertain. Weather, costs, and what people want can all change, so nobody — not even experts — can know a future price for sure.'
      };
    }
  },
  {
    id: 'fr-both', skill: 'futures-risk', kind: 'scenario', type: 'choice', targets: ['only-one-side-risk', 'hedge-is-winning'],
    make(c) {
      const D = deal(c), { g, a, deliv } = D;
      return {
        sig: `${D.gi}.${a}.${deliv}`, prompt: `${cap(g.buyer)} and ${g.seller} agree today on ${c.m(a)} per ${g.unit} of ${g.item}, for delivery in ${deliv}. Who is taking a [[risk]]?`,
        correct: 'Both: if the market price rises, the seller misses out; if it falls, the buyer pays more than the market.',
        wrongs: [['Only the buyer, because the buyer pays the money.', 'only-one-side-risk'], ['Only the seller, because the seller grows or makes the goods.', 'only-one-side-risk'], ['Nobody — once the price is set, nothing can turn out worse.', 'hedge-is-winning']],
        hints: ['Imagine the market price goes UP by delivery. Who wishes they had not agreed?', 'Now imagine the market price goes DOWN. Who wishes they had not agreed this time?', 'If each direction is bad news for someone, how many sides are taking a risk?'],
        explanation: 'Both sides take a risk. If the market price rises, the seller misses out on the higher price. If it falls, the buyer pays more than the market. Nobody knows which will happen.'
      };
    }
  },
  {
    id: 'fr-margin', skill: 'futures-risk', kind: 'concept', type: 'choice', bands: ['analyst'], targets: ['margin-is-max-loss', 'leverage-only-gains'],
    make(c) {
      const dep = c.pick([500, 1000, 1500, 2000, 2500]) * 100, [gi, g] = c.pickI(GOODS.slice(0, 2));
      const lev = c.focus === 'leverage-only-gains' ? true : c.focus === 'margin-is-max-loss' ? false : c.chance(0.5);
      if (!lev) {
        return {
          sig: `m${dep}.${gi}`, prompt: `A trader puts down a pretend margin deposit of ${c.m(dep)} to hold a futures contract for ${g.item}. Which statement is true?`,
          correct: 'Margin is a good-faith deposit; if the price moves far enough against the trader, the loss can be bigger than the deposit.',
          wrongs: [['The deposit is the most the trader could ever lose.', 'margin-is-max-loss'], ['The deposit is a fee that guarantees a profit.', 'guaranteed-profit'], ['Margin is the price of one bushel.', 'vocab-mixup']],
          hints: ['A deposit is money set aside to show you can keep your promise.', 'Does a deposit put a ceiling on how far a price can move?', 'Losses depend on how much the price moves × how much the contract covers.'],
          explanation: 'Margin is a deposit, not a limit. A futures contract covers a large quantity, so a big price move can cause a loss larger than the deposit.'
        };
      }
      return {
        sig: `l${dep}.${gi}`, prompt: `With a deposit of ${c.m(dep)}, a trader controls a pretend futures contract worth much more. This is called leverage. Which statement is true?`,
        correct: 'Leverage makes both gains and losses bigger compared with the deposit.',
        wrongs: [['Leverage only makes gains bigger.', 'leverage-only-gains'], ['Leverage removes the risk of losing money.', 'leverage-only-gains'], ['Leverage means the price cannot change.', 'prices-never-change']],
        hints: ['A small deposit controls a large amount. What happens if the price moves the wrong way?', 'A price move affects the WHOLE contract, not just the deposit.', 'Does magnifying work in only one direction?'],
        explanation: 'Leverage magnifies price moves in both directions. Compared with the small deposit, gains can be large — and so can losses, which can be bigger than the deposit.'
      };
    }
  },
  {
    id: 'fr-range', skill: 'futures-risk', kind: 'math', type: 'number', targets: ['added-instead', 'used-wrong-number', 'per-unit-vs-total'],
    make(c) {
      const [gi, g] = c.pickI(GOODS.filter((x) => !c.easy || x.hi <= 19)), farmer = g.seller;
      const lo = c.price(Math.max(1, g.lo - 1), g.lo + 1), hi = lo + c.price(1, Math.max(2, Math.min(6, g.hi - g.lo)));
      const total = c.challenge;
      const q = total ? (c.A ? c.pick([1000, 2000, 5000]) : c.int(5, 20)) : 1;
      const ans = (hi - lo) * q;
      return {
        sig: `${gi}.${lo}.${hi}.${q}`,
        prompt: `${cap(farmer)} does not know what ${g.item} will sell for ${c.pick(['next month', 'at harvest', 'next season'])}. It could be as low as ${c.m(lo)} or as high as ${c.m(hi)} per ${g.unit} — nobody knows which. ${total ? `For ${c.num(q)} ${g.units}, how far apart are the lowest and highest possible totals?` : 'How far apart are the lowest and highest possible prices?'}`,
        answer: ans / 100, prefix: '$', data: { low: lo / 100, high: hi / 100, qty: q },
        errors: [[(hi + lo) * q / 100, 'added-instead'], [hi * q / 100, 'used-wrong-number'], ...(total ? [[(hi - lo) / 100, 'per-unit-vs-total']] : [])],
        hints: ['"How far apart" means find the difference.', total ? `First find the difference for one ${g.unit}, then multiply by the number of ${g.units}.` : 'Subtract the lowest possible price from the highest.', total ? `Set it up: (${c.m(hi)} ${MINUS} ${c.m(lo)}) × ${c.num(q)} = ?` : `Set it up: ${c.m(hi)} ${MINUS} ${c.m(lo)} = ?`],
        explanation: `${c.m(hi)} ${MINUS} ${c.m(lo)} = ${c.m(hi - lo)}${total ? ` per ${g.unit}; × ${c.num(q)} = ${c.m(ans)}` : ''}. That gap shows the uncertainty: nobody knows where in that range the price will land.`
      };
    }
  },
  {
    id: 'fr-loss', skill: 'futures-risk', kind: 'math', type: 'number', bands: ['analyst'], diffs: ['medium', 'challenge'], targets: ['margin-is-max-loss', 'per-unit-vs-total', 'leverage-only-gains'],
    make(c) {
      const [gi, g] = c.pickI(GOODS.slice(0, 2)), N = c.challenge ? c.pick([5000, 10000]) : c.pick([1000, 2000, 5000]);
      const x = c.challenge ? c.int(5, 60) : c.int(2, 20) * 5, dep = c.pick([500, 1000, 1500, 2000]) * 100;
      const loss = c.chance(0.7), move = x * N;
      return {
        sig: `${gi}.${N}.${x}.${dep}.${loss}`,
        prompt: `A pretend futures contract covers ${c.num(N)} ${g.units} of ${g.item}. A trader agreed to buy and put down a margin deposit of ${c.m(dep)}. Then the price ${loss ? 'falls' : 'rises'} by ${c.m(x, { decimals: true })} per ${g.unit}. How big is the pretend ${loss ? 'loss' : 'gain'}?`,
        answer: move / 100, prefix: '$', data: { perUnit: x / 100, qty: N, deposit: dep / 100 },
        errors: [[x / 100, 'per-unit-vs-total'], [dep / 100, 'margin-is-max-loss'], [(dep + move) / 100, 'added-instead'], [(dep - move) / 100, 'margin-is-max-loss']],
        hints: [`The price change applies to every ${g.unit} in the contract.`, 'The deposit does not cap the result — it is not part of this calculation.', `Set it up: ${c.m(x, { decimals: true })} × ${c.num(N)} = ?`],
        explanation: `${c.m(x, { decimals: true })} × ${c.num(N)} = ${c.m(move)}. ${move > dep ? `That is MORE than the ${c.m(dep)} deposit — margin is not the most you can lose.` : `Here it is less than the ${c.m(dep)} deposit, but a bigger move could cost more than the deposit.`} Leverage magnifies gains and losses alike.`
      };
    }
  },
  {
    id: 'fr-match', skill: 'futures-risk', kind: 'vocab', type: 'match', targets: ['vocab-mixup', 'margin-is-max-loss', 'leverage-only-gains'],
    make(c) {
      const P = [
        ['Uncertainty', 'Not knowing for sure what will happen'],
        ['Risk', 'The chance that something turns out worse than you hoped'],
        ['Price risk', 'The chance that a price moves in a way that hurts you'],
        ['Hedge', 'A step taken to reduce price risk'],
        ['Profit', 'Money gained when you get back more than you spent'],
        ['Loss', 'Money lost when you get back less than you spent']
      ];
      if (c.A) P.push(['Margin', 'A good-faith deposit — not a limit on losses'], ['Leverage', 'Controlling a large amount with a small deposit, which magnifies gains and losses'], ['Futures contract', 'A standardized agreement traded on a regulated exchange']);
      const idx = c.sampleI(P, 4);
      return {
        sig: idx.join('.'), prompt: 'Match each word to its meaning.', pairs: idx.map((i) => P[i]),
        hints: ['Start with the word you know best.', 'Risk and uncertainty are related but different: one is not knowing, the other is the chance of a bad outcome.', 'Profit and loss are opposites. A hedge is something you DO to reduce price risk.'],
        explanation: idx.map((i) => `${P[i][0]}: ${P[i][1].toLowerCase()}.`).join(' ')
      };
    }
  },
  {
    id: 'fr-fill', skill: 'futures-risk', kind: 'vocab', type: 'fill', targets: ['can-predict-future', 'only-one-side-risk', 'margin-is-max-loss'],
    make(c) {
      const F = [
        { s: 'Nobody can know future prices for sure. Not knowing what will happen is called ___.', c: 'uncertainty', w: [['profit', 'vocab-mixup'], ['a guarantee', 'can-predict-future'], ['supply', 'supply-demand-mixup']] },
        { s: 'The chance that something turns out worse than you hoped is called ___.', c: 'risk', w: [['profit', 'vocab-mixup'], ['demand', 'supply-demand-mixup'], ['a promise', 'guaranteed-profit']] },
        { s: 'In a price agreement, ___ sides take on risk, because the market price could move either way.', c: 'both', w: [['neither of the', 'hedge-is-winning'], ['only the buyer\'s', 'only-one-side-risk'], ['only the seller\'s', 'only-one-side-risk']] },
        { s: 'A price that went up last week ___ go up again next week.', c: 'might or might not', w: [['will definitely', 'past-predicts-future'], ['can never', 'past-predicts-future'], ['must', 'can-predict-future']] }
      ];
      if (c.A) F.push({ s: 'Margin is a deposit. If prices move a lot, losses can be ___ than the margin.', c: 'bigger', w: [['never bigger', 'margin-is-max-loss'], ['always smaller', 'margin-is-max-loss'], ['exactly equal', 'margin-is-max-loss']] });
      const [i, f] = c.pickI(F);
      return {
        sig: `${i}`, prompt: 'Choose the words that best complete the sentence.', sentence: f.s, correct: f.c, wrongs: f.w,
        hints: ['Read the sentence with each choice in the blank.', 'Remember: nobody can know future prices, and price moves can hurt either side.', 'Pick the choice that is honest about what we cannot know.'],
        explanation: `"${f.s.replace('___', f.c)}"`
      };
    }
  },
  {
    id: 'fr-mistake', skill: 'futures-risk', kind: 'mistake-detective', type: 'choice', targets: ['past-predicts-future', 'only-one-side-risk', 'hedge-is-winning', 'margin-is-max-loss', 'leverage-only-gains'],
    make(c) {
      const [gi, g] = c.pickI(GOODS), who = c.pick(DETECTIVES);
      const M = [
        { says: `The price of ${g.item} went up three weeks in a row, so it will definitely go up next week.`, c: 'Past prices do not guarantee future prices; next week it could go up, down, or stay the same.', mis: 'past-predicts-future', chart: true },
        { says: 'In a price agreement, only the buyer takes a risk.', c: 'Both sides take risk: a higher market price hurts the seller, and a lower one hurts the buyer.', mis: 'only-one-side-risk' },
        { says: 'If I hedge, I can never end up worse off than the market.', c: 'A hedge reduces price risk, but it can turn out worse than waiting — you give up possible gains for certainty.', mis: 'hedge-is-winning' }
      ];
      if (c.A) M.push(
        { says: 'I only put down a small margin deposit, so that is the most I could lose.', c: 'Margin is a deposit, not a limit; losses can be bigger than the deposit.', mis: 'margin-is-max-loss' },
        { says: 'Leverage is great because it only makes my gains bigger.', c: 'Leverage magnifies losses just as much as gains.', mis: 'leverage-only-gains' });
      const foc = M.map((m, i) => [i, m]).filter(([, m]) => m.mis === c.focus);
      const [mi, x] = foc.length ? c.pick(foc) : c.pickI(M);
      const fill = [['The mistake is that prices never change.', 'prices-never-change'], ['The mistake is mixing up the item and the price.', 'vocab-mixup'], ['The mistake is that agreements are not allowed.', 'vocab-mixup']];
      const fi = c.sampleI(fill, 2);
      let visual, vs = '';
      if (x.chart) {
        const base = c.price(g.lo, g.hi), step = c.A ? c.int(5, 40) : 100;
        const v = [base, base + step, base + 2 * step, base + 3 * step];
        vs = v.join('-');
        visual = { kind: 'line', title: `Price of ${g.item} (per ${g.unit})`, unit: '$', points: v.map((y, k) => ({ label: `Week ${k + 1}`, value: y / 100 })) };
      }
      return {
        sig: `${mi}.${gi}.${who}.${fi.join('')}.${vs}`, prompt: `Mistake Detective: ${who} says, "${x.says}" What is the mistake?`,
        ...(visual ? { visual } : {}),
        correct: x.c, wrongs: [[`${who} is right — there is no mistake.`, x.mis], ...fi.map((i) => fill[i])],
        hints: [`Reread what ${who} said. Is ${who} too sure about something?`, 'Nobody can know future prices, and both sides of an agreement face risk.', 'Think about what could go WRONG in the situation, not just what could go right.'],
        explanation: x.c
      };
    }
  },
  {
    id: 'fr-chart', skill: 'futures-risk', kind: 'chart', type: 'choice', targets: ['past-predicts-future', 'can-predict-future'],
    make(c) {
      const [gi, g] = c.pickI(GOODS), shape = c.pick(['up', 'down', 'zigzag']);
      const base = c.price(g.lo, g.hi), step = c.A ? c.int(5, 40) : 100;
      const pat = { up: [0, 1, 2, 3, 4], down: [4, 3, 2, 1, 0], zigzag: [1, 3, 0, 4, 2] }[shape];
      const v = pat.map((k) => base + k * step);
      const trend = { up: 'It will keep going up, because it went up every week.', down: 'It will keep going down, because it went down every week.', zigzag: 'It will go up, because it went down last week.' }[shape];
      return {
        sig: `${gi}.${shape}.${base}.${step}`, prompt: `The chart shows the price of ${g.item} for five weeks. What can we say FOR SURE about the price in Week 6?`,
        visual: { kind: 'line', title: `Price of ${g.item} (per ${g.unit})`, unit: '$', points: v.map((y, k) => ({ label: `Week ${k + 1}`, value: y / 100 })) },
        correct: 'Nobody can know for sure — it could go up, go down, or stay the same.',
        wrongs: [[trend, 'past-predicts-future'], [`It will be exactly ${c.m(v[4])} again.`, 'past-predicts-future'], ['Experts can tell us the exact Week 6 price.', 'can-predict-future']],
        hints: ['A chart shows what already happened.', 'Does a pattern in the past make the future certain?', 'Look for the answer that is honest about [[uncertainty]].'],
        explanation: 'The chart only shows the past. Weather, costs, and what people want can change at any time, so nobody can know the Week 6 price for sure.'
      };
    }
  }
];

export const FUTURES_TEACH = { 'future-agreement': TEACH_FA, 'hedge-outcome': TEACH_HO, 'futures-risk': TEACH_FR };
