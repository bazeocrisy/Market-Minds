// World 1, Lesson 1: market-basics, buyers-sellers.
import { NAMES, DETECTIVES, ITEMS } from './pools.js';

const TEACH_MB = {
  explorer: 'A market is any place or way where buyers and sellers trade. It can be a farmers market, a lemonade stand, a store, a yard sale, or a website. What makes it a market is the trade: a buyer gives money, and a seller gives goods (things, like apples) or services (jobs done for someone, like a haircut). A park or a library is not a market by itself, because nobody is buying or selling there. Try it: at a bake sale, who is buying, who is selling, and what is traded?',
  analyst: 'A market is any place or way where buyers and sellers trade goods or services. Markets can be tiny (a lemonade stand), online (a website for used books), or huge and organized — an exchange is a market with set rules where things like wheat and corn are bought and sold. A building is not required; a trade between a buyer and a seller is. A place where people gather without trading (a park, a free library) is not a market.'
};
const TEACH_BS = {
  explorer: 'In every trade there is a buyer and a seller. The buyer gives money and gets something. The seller gives something and gets money. The price is the amount of money they agree on. Buyers usually hope to pay less; sellers usually hope to get more — a trade happens when both agree. The same person can be a buyer in one trade and a seller in another (a lemonade seller buys lemons!).',
  analyst: 'Every trade has two sides. The buyer pays money and receives the good or service; the seller provides it and receives money. The price is what both sides agree to. Buyers generally want a lower price and sellers a higher one, so the price ends up where both are willing to trade. One person or business can be a buyer in one trade and a seller in another — a bakery buys flour and sells bread.'
};

const ROLE_DEFS = [
  ['Buyer', 'The one who gives money to get something'],
  ['Seller', 'The one who gives something to get money'],
  ['Price', 'The amount of money paid for something'],
  ['Market', 'Any place or way where people buy and sell'],
  ['Trade', 'Swapping one thing for another, like money for goods'],
  ['Goods', 'Things you can buy, like bread or sneakers'],
  ['Services', 'Jobs done for others, like a haircut']
];
const ROLE_DEFS_ANALYST = [
  ['Commodity', 'A basic good, like wheat, where one unit is much like another'],
  ['Exchange', 'An organized market with rules where things are bought and sold']
];

export const MARKET_TEMPLATES = [
  // ---------------------------------------------------------------- market-basics
  {
    id: 'mb-define', skill: 'market-basics', kind: 'vocab', type: 'choice', targets: ['market-is-a-building', 'market-any-gathering', 'market-one-side'],
    make(c) {
      const stems = ['Which sentence best describes a [[market]]?', 'What makes something a [[market]]?', 'Which is the best meaning of the word [[market]]?'];
      const corrects = ['Any place or way where buyers and sellers trade', 'A place — real or online — where people buy and sell', 'Anywhere buyers and sellers come together to trade'];
      const wrongs = [
        ['Only a big building with shopping carts', 'market-is-a-building'],
        ['A place where everything is free', 'market-any-gathering'],
        ['A place where people only sell and nobody buys', 'market-one-side'],
        ['Any place where lots of people gather, like a park', 'market-any-gathering'],
        ['A store that must have a roof and walls', 'market-is-a-building'],
        ['A place where prices can never change', 'prices-never-change']
      ];
      const [si, stem] = c.pickI(stems), [ci, correct] = c.pickI(corrects), wi = c.sampleI(wrongs, 3);
      return {
        sig: `${si}.${ci}.${wi.join('')}`, prompt: stem, correct, wrongs: wi.map((i) => wrongs[i]),
        hints: ['Think about what has to happen for a market to exist.', 'A market needs two kinds of people, and they trade with each other.', 'Look for the choice that says buyers and sellers trade — and does not require a building.'],
        explanation: 'A market is any place or way buyers and sellers trade. A stand, a store, a website, or an exchange can all be markets — a building is not required, and both buyers and sellers are needed.'
      };
    }
  },
  {
    id: 'mb-which', skill: 'market-basics', kind: 'scenario', type: 'choice', targets: ['market-any-gathering', 'market-is-a-building'],
    make(c) {
      const markets = ['a sidewalk lemonade stand where neighbors pay for cups', 'a website where people buy and sell used books', 'a school book fair where students pay for books', 'a Saturday farmers market', 'a yard sale in front of a house', 'a bake sale at a basketball game'];
      if (c.A) markets.push('a grain exchange where wheat and corn are bought and sold');
      const non = ['a park where kids play tag', 'a library where you borrow books for free', 'a family dinner at home', 'a classroom spelling test', 'a bus ride to school', 'a walk around the neighborhood'];
      const notMode = c.chance(0.4);
      if (!notMode) {
        const [mi, m] = c.pickI(markets), ni = c.sampleI(non, 3);
        return {
          sig: `y${mi}.${ni.join('')}`, prompt: 'Which of these is a [[market]]?', correct: cap(m), wrongs: ni.map((i) => [cap(non[i]), 'market-any-gathering']),
          hints: ['For each choice, ask: is anything being bought or sold?', 'A market needs a buyer who gives money and a seller who gives something.', 'Only one choice has people paying for things. Find it.'],
          explanation: `${cap(m)} is a market because buyers pay sellers for things there. The other places have people, but nobody is buying or selling.`
        };
      }
      const [ni, n] = c.pickI(non), mi = c.sampleI(markets, 3);
      return {
        sig: `n${ni}.${mi.join('')}`, prompt: 'Which of these is NOT a [[market]]?', correct: cap(n), wrongs: mi.map((i) => [cap(markets[i]), 'market-is-a-building']),
        hints: ['Three of these are markets, even if they are small, outside, or online.', 'Look for the place where nobody is buying or selling.', 'Ask for each one: who is the buyer? Who is the seller? One choice has neither.'],
        explanation: `${cap(n)} is not a market — nobody is buying or selling there. Stands, yard sales, websites, and fairs are markets because buyers and sellers trade.`
      };
    }
  },
  {
    id: 'mb-fill', skill: 'market-basics', kind: 'vocab', type: 'fill', targets: ['market-one-side', 'market-is-a-building', 'vocab-mixup'],
    make(c) {
      const F = [
        { s: 'A market is any place or way where buyers and ___ trade.', c: 'sellers', w: [['teachers', 'market-any-gathering'], ['builders', 'market-is-a-building'], ['players', 'market-any-gathering']], h: 'One side buys. What do we call the other side?' },
        { s: 'At a market, a buyer usually trades ___ for goods or services.', c: 'money', w: [['nothing', 'market-any-gathering'], ['a building', 'market-is-a-building'], ['homework', 'vocab-mixup']], h: 'What does a buyer hand over at the lemonade stand?' },
        { s: 'A lemonade stand counts as a market because ___ and sellers trade there.', c: 'buyers', w: [['tables', 'market-is-a-building'], ['lemons', 'vocab-mixup'], ['nobody', 'market-one-side']], h: 'Who comes to the stand and pays for a cup?' },
        { s: 'Things you can buy, like apples or sneakers, are called ___.', c: 'goods', w: [['services', 'vocab-mixup'], ['buyers', 'buyer-seller-swap'], ['markets', 'vocab-mixup']], h: 'Things you can hold and carry home have a special name.' },
        { s: 'Work people do for others, like a haircut, is called a ___.', c: 'service', w: [['good', 'vocab-mixup'], ['market', 'vocab-mixup'], ['seller', 'buyer-seller-swap']], h: 'A haircut is not a thing you carry home — it is a job someone does for you.' },
        { s: 'A website where people buy and sell is a market even though it has no ___.', c: 'building', w: [['buyers', 'market-one-side'], ['sellers', 'market-one-side'], ['trading', 'market-any-gathering']], h: 'An online market still has buyers, sellers, and trading. What is missing?' }
      ];
      const [i, f] = c.pickI(F);
      return {
        sig: `${i}`, prompt: 'Choose the word that best completes the sentence.', sentence: f.s, correct: f.c, wrongs: f.w,
        hints: ['Read the sentence once with each word in the blank.', 'Remember: a market is any place or way where buyers and sellers trade.', f.h],
        explanation: `The sentence reads: "${f.s.replace('___', f.c)}"`
      };
    }
  },
  {
    id: 'mb-match', skill: 'market-basics', kind: 'vocab', type: 'match', targets: ['market-is-a-building', 'vocab-mixup'],
    make(c) {
      const P = [['Farmers market', 'Fruits and vegetables'], ['Shoe store', 'Sneakers'], ['Lemonade stand', 'Cups of lemonade'], ['Used-book website', 'Books'], ['Bakery', 'Bread and muffins'], ['Hair salon', 'Haircuts (a service)'], ['Bike shop', 'Bikes and helmets']];
      if (c.A) P.push(['Grain exchange', 'Wheat and corn']);
      const idx = c.sampleI(P, 4);
      const rest = P.filter((_, i) => !idx.includes(i));
      const ex = c.pick(rest);
      return {
        sig: idx.join(''), prompt: 'Match each market to what is traded there.', pairs: idx.map((i) => P[i]),
        hints: ['Start with the pair you are most sure about.', 'Think about what a buyer would leave each place with.', `For example, at a ${ex[0].toLowerCase()} people trade for ${ex[1].toLowerCase()}. Use the same thinking for each one.`],
        explanation: 'Each market is a place where buyers and sellers trade something: ' + idx.map((i) => `${P[i][0]} → ${P[i][1].toLowerCase()}`).join('; ') + '.'
      };
    }
  },
  {
    id: 'mb-tags', skill: 'market-basics', kind: 'visual', type: 'choice', targets: ['misread-chart'],
    make(c) {
      const stands = [
        { name: "Nia's farm stand", items: [['Apples', 2, 6], ['Corn', 1, 5], ['Honey', 4, 12], ['Peaches', 3, 9], ['Pumpkins', 5, 15]] },
        { name: 'the school book fair', items: [['Poster', 2, 6], ['Comic book', 3, 9], ['Bookmark', 1, 3], ['Chapter book', 5, 14], ['Puzzle book', 4, 10]] },
        { name: "Kofi's bake sale", items: [['Cookie', 1, 3], ['Muffin', 2, 5], ['Pie', 8, 18], ['Brownie', 2, 4], ['Banana bread', 5, 12]] },
        { name: 'the corner market', items: [['Milk', 2, 6], ['Eggs', 3, 7], ['Bread', 2, 6], ['Cheese', 4, 10], ['Rice', 3, 9]] }
      ];
      const [si, st] = c.pickI(stands);
      const ii = c.sampleI(st.items, 4);
      let prices;
      for (let t = 0; t < 30; t++) {
        prices = ii.map((i) => c.price(st.items[i][1], st.items[i][2]));
        if (new Set(prices).size === prices.length) break;
      }
      const high = c.chance(0.5);
      const target = high ? Math.max(...prices) : Math.min(...prices);
      const k = prices.indexOf(target);
      const labels = ii.map((i) => st.items[i][0]);
      return {
        sig: `${si}.${ii.join('')}.${prices.join('-')}.${high ? 'h' : 'l'}`,
        prompt: `These price tags are from ${st.name}, a market where buyers pay sellers for food and things. Which item has the ${high ? 'highest' : 'lowest'} [[price]]?`,
        visual: { kind: 'priceTags', title: `Price tags at ${st.name}`, items: labels.map((l, j) => ({ label: l, price: prices[j] / 100 })) },
        correct: labels[k], wrongs: labels.filter((_, j) => j !== k).map((l) => [l, 'misread-chart']),
        hints: ['Read the price on every tag first.', `Compare the prices two at a time and keep the ${high ? 'bigger' : 'smaller'} one.`, `Look at the dollars first. If two tags have the same dollars, compare the cents.`],
        explanation: `${labels[k]} costs ${c.m(target)}, which is the ${high ? 'highest' : 'lowest'} price on the tags (${labels.map((l, j) => `${l} ${c.m(prices[j])}`).join(', ')}).`
      };
    }
  },
  {
    id: 'mb-mistake', skill: 'market-basics', kind: 'mistake-detective', type: 'choice', targets: ['market-is-a-building', 'market-any-gathering', 'market-one-side'],
    make(c) {
      const M = [
        { says: 'An online shop is not a market, because there is no building.', c: 'A market does not need a building — buying and selling online counts.', mis: 'market-is-a-building' },
        { says: 'A park is a market, because lots of people are there.', c: 'Having people around is not enough — a market needs buyers and sellers trading.', mis: 'market-any-gathering' },
        { says: "A yard sale is not a market, because it is at somebody's house.", c: 'Any place where buyers and sellers trade is a market, even a front yard.', mis: 'market-is-a-building' },
        { says: 'A market only needs sellers. Buyers are optional.', c: 'A trade needs both sides: someone to buy and someone to sell.', mis: 'market-one-side' },
        { says: 'A library is a market, because it has lots of books.', c: 'Library books are borrowed for free — nobody is buying or selling, so it is not a market.', mis: 'market-any-gathering' }
      ];
      if (c.A) M.push({ says: 'A grain exchange is not a market, because the wheat is not sitting there on a table.', c: 'An exchange is an organized market where buyers and sellers trade, even when the goods are stored somewhere else.', mis: 'market-is-a-building' });
      const fill = [['The mistake is that markets can only sell food.', 'vocab-mixup'], ['The mistake is that only grown-ups can be buyers.', 'market-one-side'], ['The mistake is that every market must be open every day.', 'market-is-a-building']];
      const [mi, x] = c.pickI(M), who = c.pick(DETECTIVES), fi = c.sampleI(fill, 2);
      return {
        sig: `${mi}.${who}.${fi.join('')}`, kind: 'mistake-detective',
        prompt: `Mistake Detective: ${who} says, "${x.says}" What is the mistake?`,
        correct: x.c, wrongs: [[`${who} is right — there is no mistake.`, x.mis], ...fi.map((i) => fill[i])],
        hints: [`Reread what ${who} said. Which idea seems off?`, 'Remember the meaning: a market is any place or way buyers and sellers trade.', 'Ask: are buyers and sellers trading here? Does that need a building?'],
        explanation: `${x.c} ${who}'s idea does not match the meaning of a market.`
      };
    }
  },
  {
    id: 'mb-scene', skill: 'market-basics', kind: 'scenario', type: 'choice', targets: ['market-is-a-building', 'market-any-gathering'],
    make(c) {
      const S = [
        { t: 'Amara makes bracelets and sells them to classmates for $2 each before school.', y: true },
        { t: 'Kofi and his family watch a movie together at home.', y: false },
        { t: 'Mr. Okafor sells oranges from his truck, and neighbors pay him.', y: true },
        { t: 'Imani posts her old bike online, and someone pays her for it.', y: true },
        { t: 'Darius borrows a book from the school library and returns it next week.', y: false },
        { t: "Layla's soccer team practices at the park.", y: false },
        { t: 'At the school store, students pay for pencils and erasers.', y: true },
        { t: 'Mateo pays a neighbor $5 to mow the lawn while his family is away.', y: true }
      ];
      const [i, s] = c.pickI(S);
      const yesW = [['No — it is not inside a real store.', 'market-is-a-building'], ['No — it is too small to count as a market.', 'market-is-a-building'], ['No — only food can be traded at a market.', 'vocab-mixup']];
      const noW = [['Yes — any place with people is a market.', 'market-any-gathering'], ['Yes — it happens in a building, so it is a market.', 'market-is-a-building'], ['Yes — something is being used, so it is a market.', 'market-any-gathering']];
      return {
        sig: `${i}`, prompt: `${s.t} Is this an example of a [[market]]?`,
        correct: s.y ? 'Yes — a buyer and a seller are trading.' : 'No — nobody is buying or selling.', wrongs: s.y ? yesW : noW,
        hints: ['Look for a buyer and a seller in the story.', 'Is money (or something else) being traded for goods or a service?', 'Size and buildings do not matter — only whether a trade happens.'],
        explanation: s.y ? 'Someone gives money and someone gives goods or a service, so buyers and sellers are trading — that is a market, no matter how small.' : 'Nobody is buying or selling, so there is no trade — it is not a market.'
      };
    }
  },

  // ---------------------------------------------------------------- buyers-sellers
  {
    id: 'bs-who', skill: 'buyers-sellers', kind: 'scenario', type: 'choice', targets: ['buyer-seller-swap', 'market-one-side'],
    make(c) {
      const sellers = [['Ms. Johnson', 'her bakery', 'loaf of bread', 2, 7], ['Mr. Okafor', 'his fruit stand', 'bag of oranges', 3, 9], ['Aaliyah', 'her lemonade stand', 'cup of lemonade', 1, 3], ['Mr. Lee', 'the school store', 'notebook', 1, 5], ['Ms. Rivera', 'her craft table', 'friendship bracelet', 2, 6], ['Coach Brown', 'the snack booth', 'bag of popcorn', 1, 4]];
      const [si, s] = c.pickI(sellers), name = c.pick(NAMES), p = c.price(s[3], s[4]);
      const askBuyer = c.chance(0.5);
      const opts = { buyer: name, seller: s[0] };
      return {
        sig: `${si}.${name}.${p}.${askBuyer ? 'b' : 's'}`,
        prompt: `${name} pays ${s[0]} ${c.m(p)} for a ${s[2]} at ${s[1]}. Who is the [[${askBuyer ? 'buyer' : 'seller'}]]?`,
        correct: askBuyer ? opts.buyer : opts.seller,
        wrongs: [[askBuyer ? opts.seller : opts.buyer, 'buyer-seller-swap'], [`The ${s[2]}`, 'vocab-mixup'], ['Nobody — there is no trade', 'market-one-side']],
        hints: [`Who gives money, and who gives the ${s[2]}?`, 'The buyer gives money and gets something. The seller gives something and gets money.', `${name} hands over ${c.m(p)}. Is that what a buyer or a seller does?`],
        explanation: `${name} gives money and gets the ${s[2]}, so ${name} is the buyer. ${s[0]} gives the ${s[2]} and gets ${c.m(p)}, so ${s[0]} is the seller.`
      };
    }
  },
  {
    id: 'bs-wants', skill: 'buyers-sellers', kind: 'concept', type: 'choice', targets: ['role-goals-swapped', 'seller-sets-price'],
    make(c) {
      const ctxs = [['Mr. Okafor', 'oranges at his stand', 'a bag of oranges'], ['Zuri', 'her old video games online', 'a used video game'], ['The bakery', 'fresh bread', 'a loaf of bread'], ['Farmer Andre', 'his wheat', 'wheat'], ['Darius', 'cups of lemonade', 'a cup of lemonade'], ['The shoe store', 'sneakers', 'a pair of sneakers']];
      const low = (s) => (s.startsWith('The ') ? s.toLowerCase() : s);
      const [ci, x] = c.pickI(ctxs), seller = c.chance(0.5);
      const name = c.pick(NAMES.filter((n) => !x[0].includes(n)));
      if (seller) {
        return {
          sig: `s${ci}`, prompt: `${x[0]} is selling ${x[1]}. What does a [[seller]] like ${low(x[0])} usually hope for?`,
          correct: 'To sell at a higher price', wrongs: [['To sell at a lower price', 'role-goals-swapped'], ['To make buyers pay any price, even if they say no', 'seller-sets-price'], ['To have no buyers show up', 'market-one-side']],
          hints: ['Think about what the seller gets in the trade.', 'The seller receives the money. Would they want more money or less?', 'Sellers and buyers want opposite things about the price.'],
          explanation: 'Sellers receive the money, so they usually hope for a higher price. But a trade only happens if a buyer agrees to pay it.'
        };
      }
      return {
        sig: `b${ci}.${name}`, prompt: `${name} wants to buy ${x[2]} from ${low(x[0])}. What does a [[buyer]] like ${name} usually hope for?`,
        correct: 'To pay a lower price', wrongs: [['To pay a higher price', 'role-goals-swapped'], ['To get it without any trade at all', 'market-one-side'], ['To let the seller decide everything, no matter the price', 'seller-sets-price']],
        hints: ['Think about what the buyer gives in the trade.', 'The buyer pays the money. Would they want to pay more or less?', 'Buyers and sellers want opposite things about the price.'],
        explanation: `${name} pays the money, so buyers usually hope for a lower price. The seller hopes for a higher one — the trade happens at a price both agree on.`
      };
    }
  },
  {
    id: 'bs-match', skill: 'buyers-sellers', kind: 'vocab', type: 'match', targets: ['vocab-mixup', 'buyer-seller-swap'],
    make(c) {
      const P = c.A ? ROLE_DEFS.concat(ROLE_DEFS_ANALYST) : ROLE_DEFS;
      const idx = c.sampleI(P, 4);
      if (!idx.includes(0) && !idx.includes(1)) idx[0] = c.chance(0.5) ? 0 : 1;
      const uniq = [...new Set(idx)].sort((a, b) => a - b);
      while (uniq.length < 4) { const j = c.int(0, P.length - 1); if (!uniq.includes(j)) uniq.push(j); }
      uniq.sort((a, b) => a - b);
      return {
        sig: uniq.join('.'), prompt: 'Match each market word to its meaning.', pairs: uniq.map((i) => P[i]),
        hints: ['Start with the word you know best.', 'Buyer and seller are opposites: one gives money, one gets money.', 'For each leftover word, ask: is it a person, an amount of money, a thing, or a place?'],
        explanation: uniq.map((i) => `${P[i][0]}: ${P[i][1].toLowerCase()}.`).join(' ')
      };
    }
  },
  {
    id: 'bs-fill', skill: 'buyers-sellers', kind: 'scenario', type: 'fill', targets: ['buyer-seller-swap', 'vocab-mixup'],
    make(c) {
      const name = c.pick(NAMES), [ii, it] = c.pickI(ITEMS.filter((i) => i.lo <= 12)), p = c.price(it.lo, Math.min(it.hi, 15));
      const v = c.int(0, 2);
      const bank = { buyer: ['buyer', 'buyer-seller-swap'], seller: ['seller', 'buyer-seller-swap'], price: ['price', 'vocab-mixup'], market: ['market', 'vocab-mixup'] };
      const S = [
        { s: `${name} pays ${it.seller} ${c.m(p)} for a ${it.one}. ${name} is the ___.`, c: 'buyer', h: `${name} gives the money. What do we call the person who pays?` },
        { s: `${cap(it.seller)} gets ${c.m(p)} from ${name} for a ${it.one}. ${cap(it.seller)} is the ___.`, c: 'seller', h: `${cap(it.seller)} gives the ${it.one} and gets money. What is that side called?` },
        { s: `${name} pays ${c.m(p)} for a ${it.one}. The ${c.m(p)} is the ___.`, c: 'price', h: 'It is not a person or a place — it is an amount of money.' }
      ][v];
      return {
        sig: `${v}.${name}.${ii}.${p}`, prompt: 'Choose the word that best completes the sentence.', sentence: S.s,
        correct: S.c, wrongs: Object.keys(bank).filter((k) => k !== S.c).map((k) => bank[k]),
        hints: ['Find who gives money and who gives the item.', 'The buyer pays, the seller receives money, and the price is the amount paid.', S.h],
        explanation: `"${S.s.replace('___', S.c)}" — ${S.c === 'price' ? 'the price is the amount of money paid' : S.c === 'buyer' ? 'the buyer gives money to get something' : 'the seller gives something to get money'}.`
      };
    }
  },
  {
    id: 'bs-both', skill: 'buyers-sellers', kind: 'scenario', type: 'choice', targets: ['market-one-side', 'buyer-seller-swap'],
    make(c) {
      const S = [
        ['Darius', 'sells lemonade, then uses the money to buy more lemons', 'lemonade', 'lemons'],
        ['Nia', 'sells her old video game, then buys a new book', 'a video game', 'a book'],
        ['Baker Keisha', 'buys flour from a mill and sells bread to families', 'bread', 'flour'],
        ['Farmer Andre', 'sells his wheat, then buys seeds for next year', 'wheat', 'seeds'],
        ['Omar', 'sells cookies at a bake sale, then buys a ticket to the school play', 'cookies', 'a ticket'],
        ['The juice company', 'buys oranges from farmers and sells orange juice to stores', 'orange juice', 'oranges']
      ];
      const [i, s] = c.pickI(S);
      return {
        sig: `${i}`, prompt: `${s[0]} ${s[1]}. Which sentence is true?`,
        correct: `${s[0]} is a seller of ${s[2]} and a buyer of ${s[3]}.`,
        wrongs: [[`${s[0]} is only a buyer.`, 'market-one-side'], [`${s[0]} is only a seller.`, 'market-one-side'], [`${s[0]} is a buyer of ${s[2]} and a seller of ${s[3]}.`, 'buyer-seller-swap']],
        hints: ['Look at each trade in the story separately.', `In each trade, does ${s[0]} give money or get money?`, 'The same person can be on different sides of different trades.'],
        explanation: `${s[0]} gets money for ${s[2]} (seller) and pays money for ${s[3]} (buyer). One person can be a buyer in one trade and a seller in another.`
      };
    }
  },
  {
    id: 'bs-mistake', skill: 'buyers-sellers', kind: 'mistake-detective', type: 'choice', targets: ['buyer-seller-swap', 'role-goals-swapped', 'seller-sets-price', 'market-one-side'],
    make(c) {
      const M = [
        { says: 'At the bake sale, the person who hands over the cookies and gets the money is the buyer.', c: 'That person is the seller — the buyer is the one who pays.', mis: 'buyer-seller-swap' },
        { says: 'A seller wants the lowest price possible for the things they sell.', c: 'Sellers usually hope for a higher price; buyers hope for a lower one.', mis: 'role-goals-swapped' },
        { says: 'You can only be a buyer or a seller, never both.', c: 'The same person can sell in one trade and buy in another.', mis: 'market-one-side' },
        { says: 'The price is whatever the seller wants. Buyers have no say.', c: 'If buyers will not pay a price, there is no trade — both sides have to agree.', mis: 'seller-sets-price' },
        { says: 'When I pay for a snack, I am the seller because I am giving something away.', c: 'Paying money for a snack makes you the buyer; the snack shop is the seller.', mis: 'buyer-seller-swap' }
      ];
      const fill = [['The mistake is that buyers and sellers must be grown-ups.', 'vocab-mixup'], ['The mistake is that trades only happen in big stores.', 'market-is-a-building'], ['The mistake is that money is never used in trades.', 'vocab-mixup']];
      const [mi, x] = c.pickI(M), who = c.pick(DETECTIVES), fi = c.sampleI(fill, 2);
      return {
        sig: `${mi}.${who}.${fi.join('')}`, prompt: `Mistake Detective: ${who} says, "${x.says}" What is the mistake?`,
        correct: x.c, wrongs: [[`${who} is right — there is no mistake.`, x.mis], ...fi.map((i) => fill[i])],
        hints: [`Reread what ${who} said. Who gives money, and who gets it?`, 'Buyer: gives money, gets the item. Seller: gives the item, gets money.', 'Buyers usually want lower prices; sellers usually want higher prices; a trade needs both to agree.'],
        explanation: `${x.c}`
      };
    }
  },
  {
    id: 'bs-tags', skill: 'buyers-sellers', kind: 'visual', type: 'choice', targets: ['buyer-seller-swap', 'misread-chart'],
    make(c) {
      const goods = [['Bag of oranges', 3, 8], ['Loaf of bread', 2, 6], ['Jar of honey', 5, 12], ['Bunch of carrots', 1, 4], ['Basket of strawberries', 4, 9], ['Dozen eggs', 3, 7]];
      const sellers = ['Mr. Okafor', 'Ms. Johnson', 'Farmer Grace', 'Aaliyah', 'Mr. Lee', 'Ms. Rivera'];
      const gi = c.sampleI(goods, 3), si = c.sample(sellers, 3);
      const buyer = c.pick(NAMES), k = c.int(0, 2), askBuyer = c.chance(0.3);
      const prices = gi.map((i) => c.price(goods[i][1], goods[i][2]));
      const g = goods[gi[k]][0];
      const others = si.filter((_, j) => j !== k);
      return {
        sig: `${gi.join('')}.${si.join('-')}.${buyer}.${k}.${askBuyer ? 'b' : 's'}.${prices.join('-')}`,
        prompt: `The tags show who is selling each item at the farmers market. ${buyer} pays for the ${g.toLowerCase()}. In that trade, who is the [[${askBuyer ? 'buyer' : 'seller'}]]?`,
        visual: { kind: 'priceTags', title: 'Farmers market tags', items: gi.map((i, j) => ({ label: goods[i][0], price: prices[j] / 100, note: `Sold by ${si[j]}` })) },
        correct: askBuyer ? buyer : si[k],
        wrongs: askBuyer ? [[si[k], 'buyer-seller-swap'], ...others.map((o) => [o, 'misread-chart'])] : [[buyer, 'buyer-seller-swap'], ...others.map((o) => [o, 'misread-chart'])],
        hints: [`Find the tag for the ${g.toLowerCase()}.`, 'Each tag says who is selling that item.', `${buyer} pays the money. The person on the ${g.toLowerCase()} tag gets the money.`],
        explanation: `${buyer} pays, so ${buyer} is the buyer. The ${g.toLowerCase()} tag says it is sold by ${si[k]}, so ${si[k]} is the seller.`
      };
    }
  }
];

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

export const MARKET_TEACH = { 'market-basics': TEACH_MB, 'buyers-sellers': TEACH_BS };
