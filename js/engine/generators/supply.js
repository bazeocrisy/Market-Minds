// World 1, Lesson 3: supply-demand.
import { DETECTIVES, EVENTS } from './pools.js';

const TEACH_SD = {
  explorer: 'Supply is how much of something sellers have to sell. Demand is how much buyers want it. Picture a seesaw: if supply goes DOWN (a storm ruins a crop) and people still want it just as much, the thing gets scarce and the price usually goes UP. If supply goes UP (a huge harvest), the price usually goes DOWN. If demand goes UP (everyone wants the new toy), the price usually goes UP; if demand goes DOWN, the price usually goes DOWN. Scarcity means there is not enough for everyone who wants it.',
  analyst: 'Supply = how much sellers offer; demand = how much buyers want at a given price. With demand unchanged, less supply tends to raise the price and more supply tends to lower it. With supply unchanged, more demand tends to raise the price and less demand tends to lower it. Scarcity (not enough for everyone who wants it) pushes prices up; a surplus (more than people want) pushes them down. When supply and demand change at the same time in the same direction, the price effect is uncertain — it depends on which change is bigger.'
};

const ITEMS_SD = ['strawberries', 'basketballs', 'winter hats', 'lemonade', 'corn', 'sneakers', 'pumpkins', 'bike helmets', 'oranges', 'notebooks'];
const S_TXT = { more: 'There is more to sell', less: 'There is less to sell', same: 'There is the same amount to sell' };
const D_TXT = { more: 'more people want it', less: 'fewer people want it', same: 'people want it about the same' };
const CAUSE_LABEL = { 'supply-down': 'Supply went down', 'supply-up': 'Supply went up', 'demand-up': 'Demand went up', 'demand-down': 'Demand went down' };
const flip = (x) => (x === 'more' ? 'less' : x === 'less' ? 'more' : 'more');

export const SUPPLY_TEMPLATES = [
  {
    id: 'sd-picture', skill: 'supply-demand', kind: 'visual', type: 'choice', targets: ['supply-demand-mixup', 'misread-chart'],
    make(c) {
      const combos = [['less', 'same'], ['more', 'same'], ['same', 'more'], ['same', 'less'], ['less', 'more'], ['more', 'less']];
      const [ci, [s, d]] = c.pickI(combos), [ii, item] = c.pickI(ITEMS_SD);
      const txt = (a, b) => `${S_TXT[a]}, and ${D_TXT[b]}.`;
      const wrongs = [[txt(d, s), 'supply-demand-mixup'], [txt(flip(s), d), 'misread-chart'], [txt(s, flip(d)), 'misread-chart'], [txt(flip(s), flip(d)), 'misread-chart']];
      return {
        sig: `${ci}.${ii}`, prompt: `The picture shows what is happening with ${item} this week. Which sentence matches the picture?`,
        visual: { kind: 'supplyDemand', item, supply: s, demand: d },
        correct: txt(s, d), wrongs: c.sample(wrongs.filter((w) => w[0] !== txt(s, d)), 3),
        hints: ['Look at each side of the picture separately: one side is supply, the other is demand.', '[[supply|Supply]] is how much there is to sell. [[demand|Demand]] is how much people want it.', 'Read the arrow on the supply side, then the arrow on the demand side, and find the sentence that says both.'],
        explanation: `The supply side shows "${s}" and the demand side shows "${d}": ${txt(s, d).toLowerCase()}`
      };
    }
  },
  {
    id: 'sd-side', skill: 'supply-demand', kind: 'scenario', type: 'choice', targets: ['supply-demand-mixup', 'reason-backwards'],
    make(c) {
      const ev = EVENTS.map((e, i) => [i, e]).filter(([, e]) => CAUSE_LABEL[e.cause]);
      const [ei, e] = c.pick(ev);
      const sameSide = Object.keys(CAUSE_LABEL).find((k) => k !== e.cause && k.split('-')[0] === e.cause.split('-')[0]);
      const others = Object.keys(CAUSE_LABEL).filter((k) => k.split('-')[0] !== e.cause.split('-')[0]);
      return {
        sig: `${ei}`, prompt: `${e.t} Which change is this?`,
        correct: CAUSE_LABEL[e.cause], wrongs: [[CAUSE_LABEL[sameSide], 'reason-backwards'], ...others.map((k) => [CAUSE_LABEL[k], 'supply-demand-mixup'])],
        hints: ['Is the event about how much there is to sell, or about how much people want it?', '[[supply|Supply]] = how much sellers have. [[demand|Demand]] = how much buyers want.', 'Once you know which side, decide if it went up or down.'],
        explanation: `${e.t} This is about ${e.cause.startsWith('supply') ? 'how much there is to sell' : 'how much people want it'}, so it is a change in ${e.cause.split('-')[0]}: ${CAUSE_LABEL[e.cause].toLowerCase()}. That usually pushes the price ${e.dir}.`
      };
    }
  },
  {
    id: 'sd-vocab', skill: 'supply-demand', kind: 'vocab', type: 'choice', targets: ['supply-demand-mixup', 'vocab-mixup'],
    make(c) {
      const T = [
        ['supply', 'How much of something sellers have to sell', 'supply-demand-mixup'],
        ['demand', 'How much of something buyers want', 'supply-demand-mixup'],
        ['scarcity', 'When there is not enough of something for everyone who wants it', 'vocab-mixup'],
        ['price', 'The amount of money paid for something', 'vocab-mixup']
      ];
      const [ti, t] = c.pickI(T.slice(0, 3)), reverse = c.chance(0.5);
      const others = T.filter((x) => x[0] !== t[0]);
      if (!reverse) {
        return {
          sig: `d${ti}`, kind: 'vocab', prompt: `What does [[${t[0]}]] mean?`,
          correct: t[1], wrongs: others.map((o) => [o[1], t[2]]),
          hints: ['Think about the word in a sentence, like "the ___ of apples went up."', 'Supply is about sellers. Demand is about buyers. Scarcity is about not having enough.', `Which meaning fits "${t[0]}" best?`],
          explanation: `${cap(t[0])} means: ${t[1].toLowerCase()}.`
        };
      }
      return {
        sig: `r${ti}`, prompt: `Which word means "${t[1].toLowerCase()}"?`,
        correct: cap(t[0]), wrongs: others.map((o) => [cap(o[0]), t[2]]),
        hints: ['Read the meaning slowly. Is it about sellers, buyers, or not having enough?', 'Supply is about sellers. Demand is about buyers. Scarcity is about not having enough.', 'Try each word in a sentence and see which one fits the meaning.'],
        explanation: `"${cap(t[1])}" is the meaning of ${t[0]}.`
      };
    }
  },
  {
    id: 'sd-match', skill: 'supply-demand', kind: 'scenario', type: 'match', targets: ['supply-demand-mixup', 'reason-backwards'],
    make(c) {
      const chosen = Object.keys(CAUSE_LABEL).map((cause) => { const opts = EVENTS.map((e, i) => [i, e]).filter(([, e]) => e.cause === cause); const [i, e] = c.pick(opts); return [i, e, CAUSE_LABEL[cause]]; });
      return {
        sig: chosen.map((x) => x[0]).join('.'), prompt: 'Match each event to the change it causes.', pairs: chosen.map(([, e, l]) => [e.t, l]),
        hints: ['For each event, ask: is this about how much there is (supply) or how much people want it (demand)?', 'Weather and harvests usually change supply. Trends, seasons, and needs usually change demand.', 'After you pick supply or demand, decide whether it went up or down.'],
        explanation: chosen.map(([, e, l]) => `${e.t} → ${l.toLowerCase()}.`).join(' ')
      };
    }
  },
  {
    id: 'sd-fill', skill: 'supply-demand', kind: 'vocab', type: 'fill', targets: ['supply-backwards', 'demand-backwards', 'supply-demand-mixup'],
    make(c) {
      const F = [
        { s: 'When [[demand]] goes up and [[supply]] stays the same, the price usually goes ___.', c: 'up', w: [['down', 'demand-backwards'], ['nowhere — it never changes', 'prices-never-change']] },
        { s: 'When [[supply]] goes up and [[demand]] stays the same, the price usually goes ___.', c: 'down', w: [['up', 'supply-backwards'], ['nowhere — it never changes', 'prices-never-change']] },
        { s: 'When [[supply]] goes down and [[demand]] stays the same, the price usually goes ___.', c: 'up', w: [['down', 'supply-backwards'], ['nowhere — it never changes', 'prices-never-change']] },
        { s: 'When [[demand]] goes down and [[supply]] stays the same, the price usually goes ___.', c: 'down', w: [['up', 'demand-backwards'], ['nowhere — it never changes', 'prices-never-change']] },
        { s: 'When there is not enough of something for everyone who wants it, we call that ___.', c: 'scarcity', w: [['supply', 'supply-demand-mixup'], ['profit', 'vocab-mixup'], ['demand', 'supply-demand-mixup']] },
        { s: 'How much of something buyers want is called ___.', c: 'demand', w: [['supply', 'supply-demand-mixup'], ['scarcity', 'vocab-mixup'], ['price', 'vocab-mixup']] }
      ];
      const [i, f] = c.pickI(F);
      return {
        sig: `${i}`, prompt: 'Choose the word that best completes the sentence.', sentence: f.s, correct: f.c, wrongs: f.w,
        hints: ['Read the sentence with each choice in the blank.', 'More wanted or less available → price usually up. Less wanted or more available → price usually down.', 'Imagine a real example, like lots of kids wanting the same toy. What happens?'],
        explanation: `"${f.s.replace(/\[\[(\w+)\]\]/g, '$1').replace('___', f.c)}"`
      };
    }
  },
  {
    id: 'sd-mistake', skill: 'supply-demand', kind: 'mistake-detective', type: 'choice', targets: ['demand-backwards', 'supply-backwards', 'supply-demand-mixup', 'both-change-certain'],
    make(c) {
      const M = [
        { says: 'Lots of people want the new game, so its price will probably go down.', c: 'More demand usually pushes the price up, not down.', mis: 'demand-backwards' },
        { says: 'The farmers grew extra corn this year, so corn will probably cost more.', c: 'More supply usually pushes the price down, not up.', mis: 'supply-backwards' },
        { says: 'Supply means how much people want something.', c: 'That is demand. Supply is how much there is to sell.', mis: 'supply-demand-mixup' },
        { says: 'If something is scarce, that means it is easy to find.', c: 'Scarce means there is not enough of it for everyone who wants it.', mis: 'vocab-mixup' },
        { says: 'A freeze ruined lots of orange trees, so there are more oranges and the price will drop.', c: 'A freeze means FEWER oranges, so the price will more likely go up.', mis: 'supply-backwards' }
      ];
      if (c.A) M.push({ says: 'Supply went up AND demand went up, so the price must go up.', c: 'When both go up, the price could rise, fall, or stay about the same — it depends on which change is bigger.', mis: 'both-change-certain' });
      const fill = [['The mistake is that only sellers care about prices.', 'vocab-mixup'], ['The mistake is mixing up the buyer and the seller.', 'buyer-seller-swap'], ['The mistake is that prices can never change.', 'prices-never-change']];
      let mi, x;
      const foc = M.map((m, i) => [i, m]).filter(([, m]) => m.mis === c.focus);
      if (foc.length) [mi, x] = c.pick(foc); else [mi, x] = c.pickI(M);
      const who = c.pick(DETECTIVES), fi = c.sampleI(fill, 2);
      return {
        sig: `${mi}.${who}.${fi.join('')}`, prompt: `Mistake Detective: ${who} says, "${x.says}" What is the mistake?`,
        correct: x.c, wrongs: [[`${who} is right — there is no mistake.`, x.mis], ...fi.map((i) => fill[i])],
        hints: [`Reread what ${who} said. Is it about supply (how much there is) or demand (how much people want)?`, 'Less supply or more demand → price usually up. More supply or less demand → price usually down.', `Check whether ${who}'s direction matches that rule.`],
        explanation: x.c
      };
    }
  },
  {
    id: 'sd-scarce', skill: 'supply-demand', kind: 'scenario', type: 'choice', targets: ['reason-backwards', 'prices-never-change', 'vocab-mixup'],
    make(c) {
      const P = [['the school play', 'tickets'], ['the toy store', 'new robot kits'], ['the farmers market', 'baskets of strawberries'], ['the bakery', 'pumpkin pies'], ['the shoe store', 'pairs of the new sneakers'], ['the snack stand', 'soft pretzels']];
      const [pi, p] = c.pickI(P), scarce = c.chance(0.6), askWord = c.A && scarce && c.chance(0.4);
      const n = c.A ? c.int(4, 30) * 10 : c.int(8, 40);
      const m = scarce ? n + (c.A ? c.int(3, 30) * 10 : c.int(5, 40)) : Math.max(2, n - (c.A ? c.int(2, Math.max(2, n / 10 - 1)) * 10 : c.int(3, n - 2)));
      const setup = `${cap(p[0])} has ${n} ${p[1]}, but ${m} people want one.`;
      if (askWord) {
        return {
          sig: `w${pi}.${n}.${m}`, prompt: `${setup} Which word best describes this?`,
          correct: 'Scarcity', wrongs: [['Surplus (more than people want)', 'reason-backwards'], ['Demand going down', 'demand-backwards'], ['Supply going up', 'supply-backwards']],
          hints: ['Compare the two numbers: how many are there, and how many people want one?', 'Is there enough for everyone who wants one?', '[[scarcity|Scarcity]] means not enough for everyone who wants it.'],
          explanation: `${m} people want one but only ${n} exist, so there is not enough for everyone — that is scarcity.`
        };
      }
      return {
        sig: `p${pi}.${n}.${m}`, prompt: `${setup} What is most likely to happen to the price?`,
        correct: scarce ? 'It will likely go up, because there are not enough for everyone who wants one.' : 'It will likely go down, because there are more than people want.',
        wrongs: scarce
          ? [['It will likely go down, because there are not enough for everyone who wants one.', 'reason-backwards'], ['It will likely go down, because there are more than people want.', 'misread-chart'], ['It will stay the same no matter what.', 'prices-never-change']]
          : [['It will likely go up, because there are more than people want.', 'reason-backwards'], ['It will likely go up, because there are not enough for everyone who wants one.', 'misread-chart'], ['It will stay the same no matter what.', 'prices-never-change']],
        hints: ['Compare the two numbers: how many are there, and how many people want one?', scarce ? 'Are there enough for everyone who wants one?' : 'Will some be left over with nobody to buy them?', 'Not enough → sellers can charge more. Extra left over → sellers often lower the price.'],
        explanation: scarce ? `${m} is more than ${n}, so there are not enough for everyone (scarcity). Sellers can usually charge more, so the price will likely go up.` : `${n} is more than ${m}, so some will be left over. Sellers often lower the price to sell them, so the price will likely go down.`
      };
    }
  }
];

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

export const SUPPLY_TEACH = { 'supply-demand': TEACH_SD };
