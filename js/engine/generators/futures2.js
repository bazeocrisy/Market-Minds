// World 2, Lessons 2–4: futures-standardization, hedgers-speculators, offset-delivery. All amounts are pretend.
// Accuracy rules: a forward is a private agreement whose terms the two sides choose; a futures contract is
// standardized by the exchange (amount, quality, delivery months), traded on a regulated exchange, and a
// clearinghouse stands between buyer and seller. Hedgers already have a price risk and use futures to reduce it;
// speculators take on price risk hoping to profit; BOTH can lose. Most futures positions are closed with an
// opposite trade (offset) before delivery; gain/loss = (close − open) × quantity for a bought position, the
// reverse for a sold one. No trading signals, no "get rich" framing.
import { NAMES, DETECTIVES, GOODS, MONTHS } from './pools.js';

const MINUS = '−';
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
/** Strip tap-a-word markup for quoting a sentence back. */
const plain = (s) => s.replace(/\[\[([\w-]+)(\|[^\]]+)?\]\]/g, (m0, id, shown) => (shown ? shown.slice(1) : id.replace(/-/g, ' ')));
const signed = (cents, m) => (cents < 0 ? MINUS + m(-cents) : m(cents));

const TEACH_FS = {
  explorer: 'A forward agreement is a private deal between two people. They choose everything themselves: how much, what kind, the price, and the date. A futures contract is the same idea — agree today on a price for a trade later — but the exchange sets the rules. Every contract is the same: the same amount, the same quality, and set delivery months. That is what "standardized" means. Futures are traded on a regulated exchange, and a clearinghouse (a middle helper) stands between the buyer and the seller so each side gets what it was promised. Because every contract is the same, it is easy to find someone to trade with. The traders still decide the price and how many contracts to trade.',
  analyst: 'Forward: a private, customized agreement — the two parties negotiate the quantity, quality, delivery date and place, and price, and each side relies on the other to perform. Futures: standardized by the exchange (contract size, quality grade, delivery months), traded on a regulated exchange, and cleared through a clearinghouse that becomes the buyer to every seller and the seller to every buyer, which reduces the risk that the other side fails to pay. Standardization makes contracts interchangeable, so they are easy to trade and to close out. The exchange does NOT set the price — buyers and sellers do, by trading. Example (pretend): if one corn contract is 5,000 bushels, hedging 20,000 bushels takes 20,000 ÷ 5,000 = 4 contracts.'
};
const TEACH_HS = {
  explorer: 'People use futures for two different reasons. A HEDGER already has a price worry from their work: a farmer who grows wheat worries the price will fall before harvest; a baker who needs flour worries the price will rise. A hedger uses futures to lock in a price and reduce that worry. A SPECULATOR has no wheat to sell and needs none — they take on the price risk on purpose, hoping to profit if the price moves the way they expect. Both can lose! A hedge can turn out worse than waiting, and a speculator loses if the price moves the other way. Speculators also help markets, because they make it easier for hedgers to find someone to trade with.',
  analyst: 'Hedgers have an existing exposure to a price (a producer who will sell, like a farmer or an orange grower; or a user who must buy, like a baker, cereal company, or airline buying jet fuel). They take a futures position that offsets that exposure — producers usually sell futures, users usually buy them — trading possible gains for certainty. Speculators have no underlying exposure; they take on price risk hoping to profit, and in doing so they add trading activity that helps hedgers find a counterparty. Outcome math (pretend): a speculator who buys at $5.20 and later sells at $4.95 on 1,000 units has ($4.95 − $5.20) × 1,000 = −$250. Both groups can lose: a hedge can turn out worse than not hedging, and a speculator can be wrong.'
};
const TEACH_OD = {
  explorer: 'You do not have to wait until the delivery date. If you BOUGHT a futures contract, you can close it by SELLING the same contract. If you SOLD one, you close it by BUYING it back. That opposite trade is called an offset. Most futures contracts are closed this way, so most never end with anyone delivering the goods. When you close, you find out your gain or loss: compare the price you started at with the price you closed at, then multiply by how much the contract covers.',
  analyst: 'An open futures position is closed (offset) with an equal and opposite trade in the same contract and delivery month: long (bought) → sell to close; short (sold) → buy to close. The vast majority of futures positions are offset rather than held to delivery. Gain or loss: for a bought position, (closing price − opening price) × quantity; for a sold position, (opening price − closing price) × quantity. Example (pretend): bought a 1,000-unit contract at $3.40, sold to close at $3.15 → ($3.15 − $3.40) × 1,000 = −$250, a $250 loss.'
};

/** Pretend contract sizes. Explorer keeps numbers small. */
const sizeFor = (c) => (c.A ? c.pick([1000, 2000, 5000, 10000]) : c.easy ? c.int(2, 5) : c.medium ? c.pick([5, 10, 20]) : c.pick([10, 20, 25, 50]));

/** Open/close prices in cents for a position (explorer whole dollars; easy keeps total ≤ $20, medium ≤ $100). */
export function openClose(c, g, qty, { dir } = {}) {
  for (let t = 0; t < 60; t++) {
    const o = c.price(g.lo, Math.min(g.hi, c.A ? 99 : c.cap));
    const d = c.A ? c.price(0.05, c.easy ? 1 : 0.8) : 100 * c.int(1, c.easy ? Math.max(1, Math.min(4, Math.floor(20 / qty))) : c.medium ? Math.max(1, Math.min(5, Math.floor(100 / qty))) : 5);
    const up = dir ? dir === 'up' : c.chance(0.5);
    const cl = up ? o + d : o - d;
    if (cl < 100 || cl === o) continue;
    if (!c.A && cl > c.cap * 100) continue;
    return { o, cl, d, up };
  }
  return { o: 500, cl: 600, d: 100, up: true };
}

// Feature banks for forward vs futures.
const FWD = [
  { e: 'The two sides choose their own amount.', a: 'The two parties negotiate their own quantity.' },
  { e: 'The two sides pick their own delivery date.', a: 'The delivery date is whatever the two parties agree on.' },
  { e: 'It is a private deal between two people or businesses.', a: 'It is a private agreement between two parties.' },
  { e: 'Each side has to trust the other to keep the promise.', a: 'Each party relies on the other to perform — there is no clearinghouse in the middle.' },
  { e: 'The terms are made to fit just these two traders.', a: 'The terms are customized to fit the two parties.' }
];
const FUT = [
  { e: 'The exchange sets how much is in each contract.', a: 'The exchange sets the contract size.' },
  { e: 'The exchange sets the quality of the goods.', a: 'The exchange sets the quality grade of the goods.' },
  { e: 'Delivery can only be in set months chosen by the exchange.', a: 'Delivery happens only in standard months set by the exchange.' },
  { e: 'It is traded on a regulated exchange.', a: 'It is traded on a regulated exchange.' },
  { e: 'A clearinghouse stands between the buyer and the seller.', a: 'A clearinghouse acts as the buyer to every seller and the seller to every buyer.' },
  { e: 'Every contract is the same, so it is easy to find someone to trade with.', a: 'Contracts are interchangeable, so they are easy to trade and to close out.' }
];

// Hedgers and speculators.
const HEDGERS = [
  { who: 'Farmer Andre, who grows wheat', item: 'wheat', worry: 'the price of wheat will FALL before harvest', act: 'sells', motive: 'Lock in a selling price for the wheat he grows' },
  { who: 'Baker Keisha, who buys lots of flour made from wheat', item: 'wheat', worry: 'the price of wheat will RISE', act: 'buys', motive: 'Lock in a buying price for the wheat her flour is made from' },
  { who: 'the Sunrise Cereal Company, which turns corn into cereal', item: 'corn', worry: 'the price of corn will RISE', act: 'buys', motive: 'Lock in a buying price for the corn it needs' },
  { who: 'the Skyway Airline, whose planes burn jet fuel every day', item: 'jet fuel', worry: 'the price of jet fuel will RISE', act: 'buys', motive: 'Lock in a price for the jet fuel its planes need' },
  { who: 'Farmer Aaliyah, who grows oranges', item: 'orange juice', worry: 'the price of oranges will FALL before her harvest', act: 'sells', motive: 'Lock in a selling price for the oranges she grows' },
  { who: 'Café Nia, which roasts coffee beans', item: 'coffee', worry: 'the price of coffee beans will RISE', act: 'buys', motive: 'Lock in a buying price for the coffee beans it roasts' },
  { who: 'Farmer Rosa, who grows corn', item: 'corn', worry: 'the price of corn will FALL before harvest', act: 'sells', motive: 'Lock in a selling price for the corn she grows' }
];
const SPECS = [
  { who: 'Trader Mei, who has no wheat and does not need any', item: 'wheat', expect: 'RISE', act: 'buys', motive: 'Try to profit if wheat prices rise' },
  { who: 'Trader Omar, who owns no corn and will never use any', item: 'corn', expect: 'FALL', act: 'sells', motive: 'Try to profit if corn prices fall' },
  { who: 'Trader Sofia, who has no planes and never uses jet fuel', item: 'jet fuel', expect: 'RISE', act: 'buys', motive: 'Try to profit if jet fuel prices rise' },
  { who: 'Trader Mateo, who has no coffee farm and no café', item: 'coffee', expect: 'FALL', act: 'sells', motive: 'Try to profit if coffee prices fall' }
];
const PRICE_ITEMS = {
  wheat: { unit: 'bushel', units: 'bushels', lo: 4, hi: 9 },
  corn: { unit: 'bushel', units: 'bushels', lo: 3, hi: 7 },
  'jet fuel': { unit: 'gallon', units: 'gallons', lo: 2, hi: 5 },
  'orange juice': { unit: 'pound', units: 'pounds', lo: 2, hi: 5 },
  coffee: { unit: 'pound', units: 'pounds', lo: 3, hi: 8 }
};

export const FUTURES2_TEMPLATES = [
  // ---------------------------------------------------------------- futures-standardization
  {
    id: 'fs-define', skill: 'futures-standardization', kind: 'vocab', type: 'choice', targets: ['forward-futures-mixup', 'futures-custom-terms', 'standardized-fixed-price', 'futures-informal'],
    make(c) {
      const Q = [
        { p: 'What makes a [[futures-contract|futures contract]] different from a [[forward-agreement|forward agreement]]?', c: c.L('Futures are standardized: the exchange sets the amount, quality, and delivery months, and they trade on a regulated exchange.', 'Futures are standardized by the exchange (size, quality, delivery months), trade on a regulated exchange, and clear through a clearinghouse.') },
        { p: 'What is a [[forward-agreement|forward agreement]]?', c: 'A private agreement where the two sides choose their own terms for a trade on a later date.' },
        { p: 'What does [[standardized]] mean for a futures contract?', c: 'Every contract has the same terms — amount, quality, and delivery months — set by the exchange.' }
      ];
      const W = [
        ['Futures let the two traders pick any amount they like.', 'futures-custom-terms'],
        ['Forwards trade on an exchange, and futures are private handshake deals.', 'forward-futures-mixup'],
        ['Standardized means the exchange decides the price.', 'standardized-fixed-price'],
        ['Futures have no agreed price at all.', 'vocab-mixup'],
        ['Futures are informal deals with no rules.', 'futures-informal']
      ];
      const [qi, q] = c.pickI(Q);
      const wi = c.sampleI(W, 3);
      const fI = W.findIndex((w) => w[1] === c.focus);
      if (fI >= 0 && !wi.includes(fI)) wi[0] = fI;
      const uniq = [...new Set(wi)].sort((x, y) => x - y);
      return {
        sig: `${qi}.${uniq.join('')}`, prompt: q.p, correct: q.c, wrongs: uniq.map((i) => W[i]),
        hints: ['Think about WHO decides the terms in each kind of agreement.', 'In a forward, the two sides decide. In futures, the [[exchange]] sets the rules.', 'Standardized means "made the same every time".'],
        explanation: 'A forward is a private deal whose terms the two sides choose. A futures contract is standardized: the exchange sets the amount, quality, and delivery months, it trades on a regulated exchange, and a clearinghouse stands between buyer and seller. Buyers and sellers still set the price by trading.'
      };
    }
  },
  {
    id: 'fs-which', skill: 'futures-standardization', kind: 'concept', type: 'choice', targets: ['forward-futures-mixup', 'futures-custom-terms'],
    make(c) {
      const askFut = c.focus === 'futures-custom-terms' ? true : c.chance(0.5);
      const [ri, r] = c.pickI(askFut ? FUT : FWD);
      const other = askFut ? FWD : FUT;
      const oi = c.sampleI(other, 3);
      const t = (x) => c.L(x.e, x.a);
      return {
        sig: `${askFut ? 'u' : 'w'}${ri}.${oi.join('')}`,
        prompt: askFut ? 'Which feature belongs to a [[futures-contract|futures contract]], not a private forward agreement?' : 'Which feature belongs to a private [[forward-agreement|forward agreement]], not a futures contract?',
        correct: t(r), wrongs: oi.map((i) => [t(other[i]), askFut ? 'futures-custom-terms' : 'forward-futures-mixup']),
        hints: ['Sort each choice: is it about the two sides choosing, or about the exchange setting the rules?', 'Forward = private and custom. Futures = [[standardized]] and on an [[exchange]].', askFut ? 'Look for the choice where the exchange (or its clearinghouse) is in charge.' : 'Look for the choice where the two traders are in charge.'],
        explanation: askFut ? `"${t(r)}" is true of futures. The other choices describe a private forward, where the two sides set their own terms.` : `"${t(r)}" is true of a forward. The other choices describe futures, which are standardized by the exchange.`
      };
    }
  },
  {
    id: 'fs-match', skill: 'futures-standardization', kind: 'vocab', type: 'match', targets: ['vocab-mixup', 'forward-futures-mixup'],
    make(c) {
      const P = [
        ['Forward agreement', 'A private deal; the two sides choose the terms'],
        ['Futures contract', 'A standardized agreement traded on an exchange'],
        ['Standardized', 'Every contract has the same amount, quality, and delivery months'],
        ['Exchange', 'An organized, regulated market where contracts are traded'],
        ['Clearinghouse', 'Stands between buyer and seller so each gets what was promised'],
        ['Contract size', 'How much of the goods one contract covers, set by the exchange'],
        ['Delivery month', 'The set month when the goods would change hands']
      ];
      const idx = c.sampleI(P, 4);
      return {
        sig: idx.join(''), prompt: 'Match each futures word to its meaning.', pairs: idx.map((i) => P[i]),
        hints: ['Start with the word you know best.', 'Words about "the same every time" go with [[standardized]] futures; "private" goes with forwards.', 'The [[exchange]] is the market; the clearinghouse stands in the middle of each trade.'],
        explanation: idx.map((i) => `${P[i][0]}: ${P[i][1].toLowerCase()}.`).join(' ')
      };
    }
  },
  {
    id: 'fs-fill', skill: 'futures-standardization', kind: 'vocab', type: 'fill', targets: ['futures-custom-terms', 'forward-futures-mixup', 'standardized-fixed-price'],
    make(c) {
      const F = [
        { s: 'In a futures contract, the ___ sets the amount, quality, and delivery months.', c: 'exchange', w: [['buyer', 'futures-custom-terms'], ['seller', 'futures-custom-terms'], ['weather', 'vocab-mixup']] },
        { s: 'A forward agreement is made ___ between two sides, who choose their own terms.', c: 'privately', w: [['on an exchange', 'forward-futures-mixup'], ['by the clearinghouse', 'forward-futures-mixup'], ['never', 'vocab-mixup']] },
        { s: 'Because every futures contract has the same terms, futures are called ___.', c: 'standardized', w: [['custom', 'futures-custom-terms'], ['private', 'forward-futures-mixup'], ['guaranteed', 'guaranteed-profit']] },
        { s: 'In futures trading, a ___ stands between the buyer and the seller.', c: 'clearinghouse', w: [['farmer', 'vocab-mixup'], ['customer', 'vocab-mixup'], ['forward', 'forward-futures-mixup']] },
        { s: 'The exchange sets the contract terms, but the ___ comes from buyers and sellers trading.', c: 'price', w: [['contract size', 'standardized-fixed-price'], ['delivery month', 'standardized-fixed-price'], ['quality', 'standardized-fixed-price']] }
      ];
      const [i, f] = c.pickI(F);
      return {
        sig: `${i}`, prompt: 'Choose the word that best completes the sentence.', sentence: f.s, correct: f.c, wrongs: f.w,
        hints: ['Read the sentence with each choice in the blank.', 'Forward = private, custom. Futures = [[standardized]], on a regulated [[exchange]], with a clearinghouse.', 'Which choice makes the sentence true about who decides what?'],
        explanation: `"${plain(f.s).replace('___', f.c)}"`
      };
    }
  },
  {
    id: 'fs-scenario', skill: 'futures-standardization', kind: 'scenario', type: 'choice', targets: ['forward-futures-mixup', 'futures-custom-terms'],
    make(c) {
      const [gi, g] = c.pickI(GOODS), fwd = c.chance(0.5), mi = c.int(0, 8);
      const amt = fwd ? c.int(11, 97) * (c.A ? 37 : 3) : c.A ? sizeFor(c) : c.pick([10, 20, 50, 100]);
      const p = c.price(g.lo, g.hi), day = c.int(2, 27);
      const visual = fwd && c.chance(0.5) ? { kind: 'agreement', item: g.item, buyer: cap(g.buyer), seller: cap(g.seller), price: p / 100, quantity: `${c.num(amt)} ${g.units}`, when: `Delivery on ${MONTHS[mi + 2]} ${day}` } : null;
      const prompt = fwd
        ? `${cap(g.buyer)} and ${g.seller} write their own pretend agreement: ${c.num(amt)} ${g.units} of ${g.item} at ${c.m(p)} per ${g.unit}, delivered on ${MONTHS[mi + 2]} ${day}, to ${g.b === 'the baker' ? 'the bakery' : 'the buyer'}'s back door. They chose every detail themselves. What kind of agreement is this?`
        : `${cap(g.buyer)} buys one pretend ${g.item} futures contract on an exchange at ${c.m(p)} per ${g.unit}. The exchange's rules say every ${g.item} contract is ${c.num(amt)} ${g.units} of a set quality, for delivery in ${MONTHS[mi + 2]}. What kind of agreement is this?`;
      return {
        sig: `${fwd ? 'w' : 'u'}.${gi}.${amt}.${p}.${mi}.${day}.${visual ? 'v' : ''}`, prompt, ...(visual ? { visual, kind: 'visual' } : {}),
        correct: fwd ? 'A forward agreement — a private deal with custom terms.' : 'A futures contract — standardized terms on a regulated exchange.',
        wrongs: fwd
          ? [['A futures contract — any agreement about a later date is a futures contract.', 'forward-futures-mixup'], ['A futures contract, because they picked their own amount.', 'futures-custom-terms'], ['Not an agreement at all — the trade happens today.', 'agreement-today-trade']]
          : [['A forward agreement — the two traders chose the amount.', 'futures-custom-terms'], ['A forward agreement, because it is on an exchange.', 'forward-futures-mixup'], ['Not an agreement at all — the trade happens today.', 'agreement-today-trade']],
        hints: ['Who decided the amount, the quality, and the date?', 'If the two sides chose everything, it is private and custom. If the [[exchange]] set the terms, it is [[standardized]].', fwd ? 'Is there an exchange anywhere in this story?' : 'Did the buyer get to choose the amount in the contract?'],
        explanation: fwd ? `The two sides chose an unusual amount (${c.num(amt)} ${g.units}), an exact day, and a delivery place themselves — that is a private, customized forward agreement.` : `The exchange set the amount (${c.num(amt)} ${g.units}), the quality, and the delivery month, and the trade happened on an exchange — that is a standardized futures contract. The buyer still chose the price to trade at.`
      };
    }
  },
  {
    id: 'fs-mistake', skill: 'futures-standardization', kind: 'mistake-detective', type: 'choice', targets: ['futures-custom-terms', 'forward-futures-mixup', 'standardized-fixed-price', 'futures-informal'],
    make(c) {
      const [gi, g] = c.pickI(GOODS);
      const M = [
        { says: `In a ${g.item} futures contract, the two traders pick their own amount.`, c: 'The exchange sets the amount in each futures contract; the traders choose how many contracts and the price.', mis: 'futures-custom-terms' },
        { says: 'A forward agreement is traded on an exchange, with a clearinghouse in the middle.', c: 'That describes futures. A forward is a private deal between two sides, with no clearinghouse.', mis: 'forward-futures-mixup' },
        { says: 'Standardized means the exchange decides the price of every contract.', c: 'Standardized means the terms (amount, quality, delivery months) are the same. Buyers and sellers set the price by trading.', mis: 'standardized-fixed-price' },
        { says: `With ${g.item} futures, I can choose to have them delivered on any day I like.`, c: 'Futures can only be delivered in the set delivery months the exchange chooses.', mis: 'futures-custom-terms' },
        { says: 'Futures are just friendly handshake deals with no rules.', c: 'Futures are standardized and traded on a regulated exchange with clear rules.', mis: 'futures-informal' }
      ];
      const foc = M.map((m, i) => [i, m]).filter(([, m]) => m.mis === c.focus);
      const [mi, x] = foc.length ? c.pick(foc) : c.pickI(M);
      const fill = [['The mistake is that futures can only be about gold.', 'vocab-mixup'], ['The mistake is that agreements are not allowed.', 'vocab-mixup'], ['The mistake is that prices never change.', 'prices-never-change']];
      const who = c.pick(DETECTIVES), fi = c.sampleI(fill, 2);
      return {
        sig: `${mi}.${gi}.${who}.${fi.join('')}`,
        prompt: `Mistake Detective: ${who} says, "${x.says}" What is the mistake?`,
        correct: x.c, wrongs: [[`${who} is right — there is no mistake.`, x.mis], ...fi.map((i) => fill[i])],
        hints: [`Reread what ${who} said. Who really sets that detail?`, 'Forward = private and custom. Futures = [[standardized]] by the exchange.', 'The exchange sets the terms; buyers and sellers set the price.'],
        explanation: x.c
      };
    }
  },
  {
    id: 'fs-size', skill: 'futures-standardization', kind: 'math', type: 'number', targets: ['futures-custom-terms', 'per-unit-vs-total', 'used-wrong-number'],
    make(c) {
      const [gi, g] = c.pickI(GOODS), who = cap(g.buyer);
      const size = !c.A && c.chance(0.5) ? c.pick([5, 10, 20]) : sizeFor(c);
      const count = c.focus === 'futures-custom-terms' || c.chance(0.5);
      if (count) {
        const k = c.int(2, c.A ? 12 : c.easy ? 5 : 9), need = size * k;
        return {
          sig: `n.${gi}.${size}.${k}`,
          prompt: `On a pretend exchange, every ${g.item} [[futures-contract|futures contract]] is for exactly ${c.num(size)} ${g.units} — the exchange sets that amount. ${who} wants to lock in a price for ${c.num(need)} ${g.units}. How many contracts does ${g.buyer} need to buy?`,
          answer: k, unit: 'contracts', data: { size, need },
          errors: [[1, 'futures-custom-terms'], [need, 'used-wrong-number'], [need + size, 'added-instead']],
          hints: ['The traders cannot change the amount in one contract.', `How many groups of ${c.num(size)} fit into the total?`, `Set it up: ${c.num(need)} ÷ ${c.num(size)} = ?`],
          explanation: `${c.num(need)} ÷ ${c.num(size)} = ${k} contracts. Because futures are standardized, ${g.buyer} trades whole contracts of ${c.num(size)} ${g.units} each.`
        };
      }
      const p = !c.A && c.easy ? 100 * c.int(1, Math.max(1, Math.floor(20 / size))) : !c.A && c.medium ? 100 * c.int(1, Math.max(1, Math.floor(100 / size))) : c.price(g.lo, g.hi);
      return {
        sig: `v.${gi}.${size}.${p}`,
        prompt: `On a pretend exchange, one ${g.item} [[futures-contract|futures contract]] covers ${c.num(size)} ${g.units}. The futures price is ${c.m(p)} per ${g.unit}. What is the total value of one contract?`,
        answer: (p * size) / 100, prefix: '$', data: { price: p / 100, size },
        errors: [[p / 100, 'per-unit-vs-total'], [(p + size * 100) / 100, 'added-instead'], [size, 'used-wrong-number']],
        hints: [`The price is for ONE ${g.unit}. How many ${g.units} are in the contract?`, 'Value of one contract = price per unit × contract size.', `Set it up: ${c.m(p)} × ${c.num(size)} = ?`],
        explanation: `${c.m(p)} × ${c.num(size)} = ${c.m(p * size)}. The exchange sets the ${c.num(size)}-${g.unit} size; the price comes from trading.`
      };
    }
  },

  // ---------------------------------------------------------------- hedgers-speculators
  {
    id: 'hs-classify', skill: 'hedgers-speculators', kind: 'scenario', type: 'choice', targets: ['hedger-speculator-swap'],
    make(c) {
      const isH = c.chance(0.6);
      const [pi, P] = c.pickI(isH ? HEDGERS : SPECS);
      const prompt = isH
        ? `${cap(P.who)}, is worried that ${P.worry}. So ${P.who.split(',')[0]} ${P.act} ${P.item} futures. Is this person a [[hedger]] or a [[speculator]]?`
        : `${cap(P.who)}, expects ${P.item} prices to ${P.expect.toLowerCase()} and ${P.act} ${P.item} futures, hoping to profit. Is this person a [[hedger]] or a [[speculator]]?`;
      const H = 'A hedger — they already face a price risk from their work and want to reduce it.';
      const S = 'A speculator — they have no business need for it and take on price risk hoping to profit.';
      return {
        sig: `${isH ? 'h' : 's'}${pi}`, prompt,
        correct: isH ? H : S,
        wrongs: [[isH ? S : H, 'hedger-speculator-swap'], ['Neither — only banks are allowed to use futures.', 'vocab-mixup'], [isH ? 'A speculator — anyone who trades futures is a speculator.' : 'A hedger — anyone who expects a price change is a hedger.', 'hedger-speculator-swap']],
        hints: ['Does this person grow, make, or use the item in their work?', 'A [[hedger]] already has a price worry and wants less risk. A [[speculator]] has no such worry and takes on risk.', 'Ask: would a price change hurt this person even if they never traded futures?'],
        explanation: isH ? `${cap(P.who.split(',')[0])} already faces a price risk because of their work, and uses futures to reduce it — that makes them a hedger.` : `${cap(P.who.split(',')[0])} has no business need for ${P.item}; they take on price risk hoping to profit — that makes them a speculator. They could lose if the price moves the other way.`
      };
    }
  },
  {
    id: 'hs-define', skill: 'hedgers-speculators', kind: 'vocab', type: 'choice', targets: ['hedger-speculator-swap', 'hedge-is-winning', 'speculator-always-wins'],
    make(c) {
      const h = c.chance(0.5);
      const W = h
        ? [['Someone with no need for the item who takes on risk hoping to profit', 'hedger-speculator-swap'], ['Someone who always makes money on futures', 'hedge-is-winning'], ['Someone who runs the exchange', 'vocab-mixup'], ['Someone who knows what prices will do next', 'can-predict-future']]
        : [['Someone who uses futures to reduce a price risk they already have', 'hedger-speculator-swap'], ['Someone who always makes money on futures', 'speculator-always-wins'], ['Someone who runs the exchange', 'vocab-mixup'], ['Someone who knows what prices will do next', 'can-predict-future']];
      const wi = c.sampleI(W, 3);
      return {
        sig: `${h ? 'h' : 's'}.${wi.join('')}`, prompt: h ? 'What is a [[hedger]]?' : 'What is a [[speculator]]?',
        correct: h ? 'Someone who uses futures to reduce a price risk they already have' : 'Someone with no need for the item who takes on price risk hoping to profit',
        wrongs: wi.map((i) => W[i]),
        hints: ['Think about WHY each person trades futures.', 'One kind already has a price worry from their work; the other takes on risk on purpose.', 'Nobody knows future prices, and nobody always wins.'],
        explanation: 'A hedger already has a price risk (like a farmer or a baker) and uses futures to reduce it. A speculator has no such risk and takes one on hoping to profit. Either one can lose.'
      };
    }
  },
  {
    id: 'hs-match', skill: 'hedgers-speculators', kind: 'scenario', type: 'match', targets: ['hedger-speculator-swap'],
    make(c) {
      const hi = c.sampleI(HEDGERS, 3), si = c.int(0, SPECS.length - 1);
      const people = [...hi.map((i) => HEDGERS[i]), SPECS[si]];
      const pairs = people.map((p) => [cap(p.who.split(',')[0]) + (p.expect ? ` (no ${p.item} needs)` : ''), p.motive]);
      return {
        sig: `${hi.join('')}.${si}`, prompt: 'Match each person to the main reason they trade futures.', pairs,
        hints: ['Start with the people whose work uses or grows the item.', 'Growers worry about prices falling; buyers worry about prices rising.', 'One person has no need for the item at all — why would they trade?'],
        explanation: people.map((p) => `${cap(p.who.split(',')[0])}: ${p.motive.toLowerCase()}${p.expect ? ' (a speculator).' : ' (a hedger).'}`).join(' ')
      };
    }
  },
  {
    id: 'hs-fill', skill: 'hedgers-speculators', kind: 'vocab', type: 'fill', targets: ['hedger-speculator-swap', 'speculator-always-wins', 'hedge-is-winning'],
    make(c) {
      const F = [
        { s: 'A ___ uses futures to reduce a price risk they already have.', c: 'hedger', w: [['speculator', 'hedger-speculator-swap'], ['clearinghouse', 'vocab-mixup'], ['winner', 'hedge-is-winning']] },
        { s: 'A ___ takes on price risk, hoping to profit from a price change.', c: 'speculator', w: [['hedger', 'hedger-speculator-swap'], ['farmer', 'hedger-speculator-swap'], ['exchange', 'vocab-mixup']] },
        { s: 'A wheat farmer who worries that prices could fall might ___ wheat futures to lock in a price.', c: 'sell', w: [['ignore', 'vocab-mixup'], ['eat', 'vocab-mixup'], ['guarantee', 'guaranteed-profit']] },
        { s: 'Speculators can make it easier for hedgers to find someone to ___ with.', c: 'trade', w: [['argue', 'vocab-mixup'], ['predict', 'can-predict-future'], ['win', 'speculator-always-wins']] },
        { s: 'Both hedgers and speculators can ___ money if prices move the wrong way for them.', c: 'lose', w: [['only make', 'speculator-always-wins'], ['never lose', 'hedge-is-winning'], ['print', 'vocab-mixup']] }
      ];
      const [i, f] = c.pickI(F);
      return {
        sig: `${i}`, prompt: 'Choose the word that best completes the sentence.', sentence: f.s, correct: f.c, wrongs: f.w,
        hints: ['Read the sentence with each choice in the blank.', 'Hedger = already has a price worry. Speculator = takes on risk hoping to profit.', 'Remember: nobody knows future prices, so anyone can lose.'],
        explanation: `"${plain(f.s).replace('___', f.c)}"`
      };
    }
  },
  {
    id: 'hs-mistake', skill: 'hedgers-speculators', kind: 'mistake-detective', type: 'choice', targets: ['hedge-is-winning', 'hedger-speculator-swap', 'speculator-always-wins'],
    make(c) {
      const M = [
        { says: 'Hedgers can never lose, because they locked in a price.', c: 'A hedge can turn out worse than waiting — the hedger gives up possible gains in exchange for certainty.', mis: 'hedge-is-winning' },
        { says: 'The airline buys jet fuel futures, so it must be a speculator.', c: 'The airline needs jet fuel for its planes, so it is a hedger reducing a price risk it already has.', mis: 'hedger-speculator-swap' },
        { says: 'Speculators always make money, because they study prices carefully.', c: 'Speculators take on risk; if the price moves the other way, they lose.', mis: 'speculator-always-wins' },
        { says: 'A farmer who sells wheat futures to protect the price of her crop is a speculator.', c: 'The farmer grows wheat and is reducing a risk she already has — she is a hedger.', mis: 'hedger-speculator-swap' },
        { says: 'Only speculators take any risk in the futures market.', c: 'Hedgers face risk too: their hedge can turn out worse than not hedging. Everyone in the trade can lose.', mis: 'only-one-side-risk' }
      ];
      const foc = M.map((m, i) => [i, m]).filter(([, m]) => m.mis === c.focus);
      const [mi, x] = foc.length ? c.pick(foc) : c.pickI(M);
      const fill = [['The mistake is that futures can only be about gold.', 'vocab-mixup'], ['The mistake is that prices never change.', 'prices-never-change'], ['The mistake is that hedgers and speculators cannot trade with each other.', 'vocab-mixup']];
      const who = c.pick(DETECTIVES), fi = c.sampleI(fill, 2);
      return {
        sig: `${mi}.${who}.${fi.join('')}`, prompt: `Mistake Detective: ${who} says, "${x.says}" What is the mistake?`,
        correct: x.c, wrongs: [[`${who} is right — there is no mistake.`, x.mis], ...fi.map((i) => fill[i])],
        hints: [`Reread what ${who} said. Does the person already have a price worry from their work?`, 'Hedger = reduces a risk they already have. Speculator = takes on risk hoping to profit.', 'Can a price move the wrong way for anyone?'],
        explanation: x.c
      };
    }
  },
  {
    id: 'hs-outcome', skill: 'hedgers-speculators', kind: 'math', type: 'number', targets: ['wrong-direction', 'per-unit-vs-total', 'added-instead', 'speculator-always-wins'],
    make(c) {
      const isH = c.chance(0.5);
      const [pi, P] = c.pickI(isH ? HEDGERS : SPECS);
      const it = PRICE_ITEMS[P.item];
      const q = c.A ? c.pick(c.easy ? [10, 20, 50, 100] : [1000, 2000, 5000]) : c.easy ? c.int(2, 4) : c.medium ? c.int(3, 10) : c.int(5, 25);
      const { o, cl } = openClose(c, it, q);
      const side = P.act === 'buys' ? 1 : -1;
      const per = (cl - o) * side, total = per * q, sgn = c.A && !c.easy;
      const nm = P.who.split(',')[0], name = cap(nm);
      const gain = total > 0;
      const ask = sgn
        ? 'What is the gain or loss on the futures? Write a loss with a minus sign (−).'
        : `How much did ${nm} ${gain ? 'gain' : 'lose'} on the futures?`;
      return {
        sig: `${isH ? 'h' : 's'}${pi}.${o}.${cl}.${q}.${sgn ? 's' : ''}`,
        prompt: `${name} ${P.act === 'buys' ? 'buys' : 'sells'} pretend ${P.item} futures for ${c.num(q)} ${it.units} at ${c.m(o)} per ${it.unit}. Later, ${nm} closes the position with the opposite trade at ${c.m(cl)} per ${it.unit}. ${ask}`,
        answer: (sgn ? total : Math.abs(total)) / 100, prefix: '$', data: { open: o / 100, close: cl / 100, qty: q, side, signed: sgn ? 1 : 0 },
        errors: [[Math.abs(per) / 100, 'per-unit-vs-total'], [((o + cl) * q) / 100, 'added-instead'], [(cl * q) / 100, 'used-wrong-number'], ...(sgn ? [[-total / 100, 'wrong-direction']] : [])],
        hints: [P.act === 'buys' ? 'A buyer gains when the price rises and loses when it falls.' : 'A seller gains when the price falls and loses when it rises.', `Step 1: find the change per ${it.unit}. Step 2: multiply by the ${c.num(q)} ${it.units}.`, `Set it up: (${c.m(Math.max(o, cl))} ${MINUS} ${c.m(Math.min(o, cl))}) × ${c.num(q)}, then decide: gain or loss?`],
        explanation: `${c.m(Math.max(o, cl))} ${MINUS} ${c.m(Math.min(o, cl))} = ${c.m(Math.abs(cl - o))} per ${it.unit}; × ${c.num(q)} = ${c.m(Math.abs(total))}. ${name} ${P.act === 'buys' ? 'bought' : 'sold'} and the price ${cl > o ? 'rose' : 'fell'}, so it is a ${gain ? 'gain' : 'loss'}${sgn ? ` (${signed(total, c.m)})` : ''}. ${isH ? (gain ? 'The hedge paid off on the futures this time.' : 'A hedger can lose on the futures — but the price of the real goods moved the other way, which is the point of the hedge.') : (gain ? 'This time the speculator was right — next time the price could move the other way.' : 'Speculators can lose: the price moved against what was expected.')}`
      };
    }
  },
  {
    id: 'hs-both', skill: 'hedgers-speculators', kind: 'chart', type: 'choice', targets: ['speculator-always-wins', 'hedge-is-winning', 'hedger-speculator-swap'],
    make(c) {
      const h = c.pick(HEDGERS.filter((x) => x.act === 'sells')), s = c.pick(['Trader Mei', 'Trader Omar', 'Trader Sofia', 'Trader Mateo']);
      const it = PRICE_ITEMS[h.item], farmer = h.who.split(',')[0];
      const { o, cl } = openClose(c, it, 1);
      const mi = c.int(0, 7), labels = [0, 1, 2, 3].map((k) => MONTHS[mi + k]);
      const top = c.A ? 1e9 : c.cap * 100, wob = () => Math.min(top, Math.max(100, o + (c.A ? c.int(-30, 30) : c.int(-1, 1) * 100)));
      const v = [o, wob(), wob(), cl];
      const up = cl > o;
      return {
        sig: `${farmer}.${s}.${v.join('-')}.${mi}`,
        prompt: `In ${labels[0]}, ${farmer} (a hedger) sells pretend ${h.item} futures at ${c.m(o)} per ${it.unit}. ${s}, a speculator who has no ${h.item}, buys them, expecting the price to rise. The chart shows the futures price until both close their positions in ${labels[3]}. Who lost money on the futures?`,
        visual: { kind: 'line', title: `Pretend ${h.item} futures price (per ${it.unit})`, unit: '$', points: labels.map((l, k) => ({ label: l, value: v[k] / 100 })), highlight: 3 },
        correct: up ? `${farmer}, the hedger — the price rose after the sale.` : `${s}, the speculator — the price fell after the purchase.`,
        wrongs: [[up ? `${s}, the speculator — speculators always lose.` : `${farmer}, the hedger — hedgers always lose.`, up ? 'speculator-always-wins' : 'hedge-is-winning'], ['Nobody — in futures, everyone wins.', up ? 'hedge-is-winning' : 'speculator-always-wins'], ['Both of them lost money.', 'only-one-side-risk']],
        hints: [`Compare the price in ${labels[3]} with the starting price in ${labels[0]}.`, 'The seller gains if the price falls; the buyer gains if it rises.', 'One side’s futures gain is the other side’s futures loss.'],
        explanation: up
          ? `The price rose from ${c.m(o)} to ${c.m(cl)}, so the buyer (${s}) gained and the seller (${farmer}) lost on the futures. The hedger can still be fine overall — the crop is now worth more — but the futures turned out worse than not hedging. Both sides can lose.`
          : `The price fell from ${c.m(o)} to ${c.m(cl)}, so the seller (${farmer}) gained and the buyer (${s}) lost. The speculator expected a rise and was wrong — speculators can lose.`
      };
    }
  },

  // ---------------------------------------------------------------- offset-delivery
  {
    id: 'od-close', skill: 'offset-delivery', kind: 'concept', type: 'choice', targets: ['offset-same-direction', 'must-take-delivery'],
    make(c) {
      const [gi, g] = c.pickI(GOODS), who = c.pick(NAMES), n = c.int(1, 6), bought = c.chance(0.5), mi = c.int(0, 8);
      const ct = (k) => `${k} ${g.item} futures contract${k === 1 ? '' : 's'}`;
      return {
        sig: `${gi}.${who}.${n}.${bought ? 'b' : 's'}.${mi}`,
        prompt: `${who} ${bought ? 'bought' : 'sold'} ${ct(n)} for ${MONTHS[mi + 3]} delivery. ${who} wants to close the position before the delivery date. What should ${who} do?`,
        correct: `${bought ? 'Sell' : 'Buy'} ${ct(n)} for ${MONTHS[mi + 3]} — the opposite trade.`,
        wrongs: [[`${bought ? 'Buy' : 'Sell'} ${n} more ${g.item} futures contract${n === 1 ? '' : 's'} for ${MONTHS[mi + 3]}.`, 'offset-same-direction'], ['Nothing can be done — every futures contract must end in delivery.', 'must-take-delivery'], [`${bought ? 'Sell' : 'Buy'} ${n} ${g.item === 'wheat' ? 'corn' : 'wheat'} contracts instead.`, 'vocab-mixup']],
        hints: ['To close a position, you undo it.', 'What is the opposite of buying? The opposite of selling?', 'The closing trade uses the same item, the same delivery month, and the same number of contracts.'],
        explanation: `${who} ${bought ? 'bought' : 'sold'}, so the opposite trade — ${bought ? 'selling' : 'buying'} the same ${n} ${g.item} contract${n === 1 ? '' : 's'} for ${MONTHS[mi + 3]} — closes (offsets) the position. Most futures positions end this way, not with delivery.`
      };
    }
  },
  {
    id: 'od-define', skill: 'offset-delivery', kind: 'vocab', type: 'choice', targets: ['must-take-delivery', 'offset-same-direction', 'offset-no-gain-loss'],
    make(c) {
      const Q = [
        { p: 'What does it mean to [[offset]] a futures position?', c: 'To close it by making the opposite trade in the same contract.', w: [['To make the same trade again, doubling the position.', 'offset-same-direction'], ['To wait for the goods to be delivered.', 'must-take-delivery'], ['To cancel it so there is no gain or loss.', 'offset-no-gain-loss'], ['To let the exchange pick a new price for you.', 'standardized-fixed-price']] },
        { p: 'How do MOST futures positions end?', c: 'They are closed with an opposite trade before the delivery date.', w: [['The goods are always delivered to the buyer’s door.', 'must-take-delivery'], ['The trader buys more of the same contract.', 'offset-same-direction'], ['The exchange throws them away with no gain or loss.', 'offset-no-gain-loss'], ['The trader waits forever and never closes them.', 'must-take-delivery']] },
        { p: 'What is [[delivery]] in futures?', c: 'When the seller actually hands over the goods and the buyer pays, at the end of the contract.', w: [['Any trade that closes a position early.', 'must-take-delivery'], ['Buying more contracts.', 'offset-same-direction'], ['A promise that the price will rise.', 'can-predict-future'], ['When the exchange sets the contract size.', 'vocab-mixup']] }
      ];
      const [qi, q] = c.pickI(Q), wi = c.sampleI(q.w, 3);
      return {
        sig: `${qi}.${wi.join('')}`, prompt: q.p, correct: q.c, wrongs: wi.map((i) => q.w[i]),
        hints: ['Think about how you would UNDO a trade.', 'Bought → sell to close. Sold → buy to close.', 'Most traders never want a truckload of wheat — they close out first.'],
        explanation: 'To offset means to close a futures position with the opposite trade (bought → sell, sold → buy). Most futures positions are offset before the delivery date, and the trader keeps the gain or loss from the price change.'
      };
    }
  },
  {
    id: 'od-fill', skill: 'offset-delivery', kind: 'vocab', type: 'fill', targets: ['offset-same-direction', 'must-take-delivery', 'offset-no-gain-loss'],
    make(c) {
      const F = [
        { s: 'If you bought a futures contract, you close it by ___ the same contract.', c: 'selling', w: [['buying', 'offset-same-direction'], ['delivering', 'must-take-delivery'], ['ignoring', 'vocab-mixup']] },
        { s: 'If you sold a futures contract, you close it by ___ the same contract.', c: 'buying', w: [['selling', 'offset-same-direction'], ['delivering', 'must-take-delivery'], ['hiding', 'vocab-mixup']] },
        { s: 'Most futures positions are closed with an opposite trade instead of ending in ___.', c: 'delivery', w: [['a gain', 'offset-no-gain-loss'], ['a second purchase', 'offset-same-direction'], ['a guess', 'can-predict-future']] },
        { s: 'When you close a position, your gain or loss comes from the ___ between the opening and closing prices.', c: 'difference', w: [['sum', 'added-instead'], ['delivery', 'must-take-delivery'], ['color', 'vocab-mixup']] }
      ];
      const [i, f] = c.pickI(F);
      return {
        sig: `${i}`, prompt: 'Choose the word that best completes the sentence.', sentence: f.s, correct: f.c, wrongs: f.w,
        hints: ['Read the sentence with each choice in the blank.', 'Closing a position means doing the OPPOSITE trade — that is an [[offset]].', 'A gain or loss compares two prices: where you started and where you closed.'],
        explanation: `"${plain(f.s).replace('___', f.c)}"`
      };
    }
  },
  {
    id: 'od-gain', skill: 'offset-delivery', kind: 'math', type: 'number', targets: ['wrong-direction', 'per-unit-vs-total', 'offset-no-gain-loss', 'added-instead'],
    make(c) {
      const [gi, g] = c.pickI(GOODS), who = c.pick(NAMES), bought = c.chance(0.5);
      const size = c.A ? (c.easy ? c.pick([10, 50, 100]) : c.pick([1000, 2000, 5000])) : c.easy ? c.int(2, 4) : c.medium ? c.pick([5, 10]) : c.pick([10, 20, 25]);
      const { o, cl } = openClose(c, g, size);
      const side = bought ? 1 : -1, total = (cl - o) * side * size, sgn = c.A && !c.easy;
      const gain = total > 0;
      return {
        sig: `${gi}.${who}.${bought ? 'b' : 's'}.${o}.${cl}.${size}.${sgn ? 's' : ''}`,
        prompt: `${who} ${bought ? 'bought' : 'sold'} a pretend ${g.item} futures contract of ${c.num(size)} ${g.units} at ${c.m(o)} per ${g.unit}. Before delivery, ${who} closed it by ${bought ? 'selling' : 'buying'} the same contract at ${c.m(cl)} per ${g.unit}. ${sgn ? `What was ${who}'s gain or loss? Write a loss with a minus sign (−).` : `How much did ${who} ${gain ? 'gain' : 'lose'}?`}`,
        answer: (sgn ? total : Math.abs(total)) / 100, prefix: '$', data: { open: o / 100, close: cl / 100, qty: size, side, signed: sgn ? 1 : 0 },
        errors: [[Math.abs(cl - o) / 100, 'per-unit-vs-total'], [0, 'offset-no-gain-loss'], [((o + cl) * size) / 100, 'added-instead'], ...(sgn ? [[-total / 100, 'wrong-direction']] : [])],
        hints: [`Did ${who} ${bought ? 'sell for more or less than the buying price' : 'buy back for more or less than the selling price'}?`, `Step 1: the difference per ${g.unit}. Step 2: multiply by the ${c.num(size)} ${g.units} in the contract.`, `Set it up: (${c.m(Math.max(o, cl))} ${MINUS} ${c.m(Math.min(o, cl))}) × ${c.num(size)}, then decide: gain or loss?`],
        explanation: `${c.m(Math.max(o, cl))} ${MINUS} ${c.m(Math.min(o, cl))} = ${c.m(Math.abs(cl - o))} per ${g.unit}; × ${c.num(size)} = ${c.m(Math.abs(total))}. ${who} ${bought ? `bought at ${c.m(o)} and sold at ${c.m(cl)}` : `sold at ${c.m(o)} and bought back at ${c.m(cl)}`}, so it is a ${gain ? 'gain' : 'loss'}${sgn ? ` (${signed(total, c.m)})` : ''}. Closing early locks in the result; no ${g.item} was delivered.`
      };
    }
  },
  {
    id: 'od-match', skill: 'offset-delivery', kind: 'concept', type: 'match', targets: ['offset-same-direction'],
    make(c) {
      const [ga, gb] = c.sample(['wheat', 'corn', 'oranges', 'coffee', 'milk'], 2);
      const n = c.sample([1, 2, 3, 4, 5, 6], 2);
      const ct = (k, item) => `${k} ${item} contract${k === 1 ? '' : 's'}`;
      const pairs = [
        [`Bought ${ct(n[0], ga)}`, `Sell ${ct(n[0], ga)}`],
        [`Sold ${ct(n[0], ga)}`, `Buy ${ct(n[0], ga)}`],
        [`Bought ${ct(n[1], gb)}`, `Sell ${ct(n[1], gb)}`],
        [`Sold ${ct(n[1], gb)}`, `Buy ${ct(n[1], gb)}`]
      ];
      return {
        sig: `${ga}.${gb}.${n.join('')}`, prompt: 'Match each open position to the trade that closes it.', pairs,
        hints: ['Closing a position means doing the opposite trade.', 'Bought → sell. Sold → buy.', 'The item and the number of contracts stay the same.'],
        explanation: 'Each position is closed by the opposite trade in the same item and the same number of contracts: bought → sell, sold → buy.'
      };
    }
  },
  {
    id: 'od-mistake', skill: 'offset-delivery', kind: 'mistake-detective', type: 'choice', targets: ['must-take-delivery', 'offset-same-direction', 'offset-no-gain-loss', 'wrong-direction'],
    make(c) {
      const [gi, g] = c.pickI(GOODS), { o, cl } = openClose(c, g, 1, { dir: 'down' });
      const M = [
        { says: `I bought a ${g.item} futures contract, so I will have to take the ${g.item} home. There is no other way out.`, c: 'Most futures positions are closed with an opposite trade (selling the same contract) before delivery.', mis: 'must-take-delivery' },
        { says: `To close the ${g.item} contract I bought, I will buy another one.`, c: 'Buying again doubles the position. To close a bought contract, you sell the same contract.', mis: 'offset-same-direction' },
        { says: 'If I close my position before delivery, there is no gain or loss.', c: 'Closing locks in a gain or loss: the difference between the opening and closing prices, times the amount.', mis: 'offset-no-gain-loss' },
        { says: `I bought at ${c.m(o)} per ${g.unit} and sold at ${c.m(cl)} to close, so I made money.`, c: `Selling for less than the buying price (${c.m(cl)} is less than ${c.m(o)}) is a loss, not a gain.`, mis: 'wrong-direction' }
      ];
      const foc = M.map((m, i) => [i, m]).filter(([, m]) => m.mis === c.focus);
      const [mi, x] = foc.length ? c.pick(foc) : c.pickI(M);
      const fill = [['The mistake is that futures can only be about gold.', 'vocab-mixup'], ['The mistake is that prices never change.', 'prices-never-change'], ['The mistake is that you can only trade on Mondays.', 'vocab-mixup']];
      const who = c.pick(DETECTIVES), fi = c.sampleI(fill, 2);
      return {
        sig: `${mi}.${gi}.${o}.${cl}.${who}.${fi.join('')}`, prompt: `Mistake Detective: ${who} says, "${x.says}" What is the mistake?`,
        correct: x.c, wrongs: [[`${who} is right — there is no mistake.`, x.mis], ...fi.map((i) => fill[i])],
        hints: [`Reread what ${who} said. Is the closing trade the opposite one?`, 'Bought → sell to close. Sold → buy to close. Most positions close this way.', 'Gain or loss = compare the opening price with the closing price.'],
        explanation: x.c
      };
    }
  },
  {
    id: 'od-chart', skill: 'offset-delivery', kind: 'chart', type: 'choice', targets: ['wrong-direction', 'offset-no-gain-loss', 'misread-chart'],
    make(c) {
      const [gi, g] = c.pickI(GOODS), who = c.pick(NAMES), bought = c.chance(0.5);
      let { o, cl } = openClose(c, g, 1);
      const step = c.A ? c.int(5, 30) : 100;
      for (let t = 0; t < 30 && !c.A && cl < o && o + step > c.cap * 100; t++) ({ o, cl } = openClose(c, g, 1));
      if (!c.A && cl < o && o + step > c.cap * 100) return { invalid: true };
      // a middle week that pointed the other way, so readers must use the closing week
      const mid = cl > o ? Math.max(100, o - step) : o + step;
      const v = [o, mid, Math.max(100, Math.round((o + cl) / 2 / (c.A ? 1 : 100)) * (c.A ? 1 : 100)), cl];
      const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const gain = (cl - o) * (bought ? 1 : -1) > 0;
      return {
        sig: `${gi}.${who}.${bought ? 'b' : 's'}.${v.join('-')}`,
        prompt: `${who} ${bought ? 'bought' : 'sold'} one pretend ${g.item} futures contract in Week 1 and closed it with the opposite trade in Week 4. The chart shows the futures price. Did ${who} have a gain or a loss?`,
        visual: { kind: 'line', title: `Pretend ${g.item} futures price (per ${g.unit})`, unit: '$', points: labels.map((l, k) => ({ label: l, value: v[k] / 100 })), highlight: 3 },
        correct: gain ? `A gain — ${bought ? 'sold for more than the buying price' : 'bought back for less than the selling price'}.` : `A loss — ${bought ? 'sold for less than the buying price' : 'bought back for more than the selling price'}.`,
        wrongs: [[gain ? `A loss — ${bought ? 'the price dipped in Week 2' : 'the price jumped in Week 2'}.` : `A gain — ${bought ? 'buyers always gain' : 'sellers always gain'}.`, gain ? 'misread-chart' : 'wrong-direction'], ['Neither — closing early means no gain or loss.', 'offset-no-gain-loss'], ['You cannot tell until the goods are delivered.', 'must-take-delivery']],
        hints: ['Only the opening week (Week 1) and the closing week (Week 4) matter.', bought ? 'A buyer gains if the closing price is higher than the opening price.' : 'A seller gains if the closing price is lower than the opening price.', 'Compare the Week 4 price with the Week 1 price.'],
        explanation: `${who} opened at ${c.m(o)} and closed at ${c.m(cl)}. ${bought ? 'For a buyer' : 'For a seller'}, a ${cl > o ? 'higher' : 'lower'} closing price means a ${gain ? 'gain' : 'loss'} of ${c.m(Math.abs(cl - o))} per ${g.unit}. The ups and downs in between did not matter once the position was closed.`
      };
    }
  }
];

export const FUTURES2_TEACH = { 'futures-standardization': TEACH_FS, 'hedgers-speculators': TEACH_HS, 'offset-delivery': TEACH_OD };
