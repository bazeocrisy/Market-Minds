// Scenario pools shared by the generators. All prices are pretend.
import { int, pick, pickIndex, shuffle, sample, sampleIndices } from '../rng.js';
import { money, num } from '../format.js';

export const NAMES = ['Jaylen', 'Zuri', 'Malik', 'Nia', 'Amara', 'Kofi', 'Imani', 'Darius', 'Aaliyah', 'Marcus', 'Keisha', 'Andre', 'Layla', 'Omar', 'Sofia', 'Mateo', 'Mei', 'Priya', 'Tariq', 'Ava'];
export const DETECTIVES = ['Jaylen', 'Zuri', 'Malik', 'Nia', 'Kofi', 'Imani'];

/** Everyday items: dollar ranges are typical pretend prices. */
export const ITEMS = [
  { one: 'loaf of bread', many: 'loaves of bread', lo: 2, hi: 8, seller: 'the bakery' },
  { one: 'bag of apples', many: 'bags of apples', lo: 3, hi: 10, seller: 'the fruit stand' },
  { one: 'cup of lemonade', many: 'cups of lemonade', lo: 1, hi: 4, seller: 'the lemonade stand' },
  { one: 'box of crayons', many: 'boxes of crayons', lo: 2, hi: 9, seller: 'the school store' },
  { one: 'notebook', many: 'notebooks', lo: 1, hi: 7, seller: 'the school store' },
  { one: 'bag of flour', many: 'bags of flour', lo: 3, hi: 12, seller: 'the grocery store' },
  { one: 'bag of oranges', many: 'bags of oranges', lo: 3, hi: 11, seller: 'the farmers market' },
  { one: 'jar of peanut butter', many: 'jars of peanut butter', lo: 3, hi: 9, seller: 'the grocery store' },
  { one: 'carton of milk', many: 'cartons of milk', lo: 2, hi: 6, seller: 'the corner market' },
  { one: 'basketball', many: 'basketballs', lo: 12, hi: 40, seller: 'the sports shop' },
  { one: 'calculator', many: 'calculators', lo: 8, hi: 30, seller: 'the school store' },
  { one: 'pair of sneakers', many: 'pairs of sneakers', lo: 35, hi: 100, seller: 'the shoe store' },
  { one: 'backpack', many: 'backpacks', lo: 20, hi: 70, seller: 'the school store' },
  { one: 'bike helmet', many: 'bike helmets', lo: 20, hi: 60, seller: 'the bike shop' },
  { one: 'video game', many: 'video games', lo: 20, hi: 70, seller: 'the game shop' },
  { one: 'winter jacket', many: 'winter jackets', lo: 30, hi: 95, seller: 'the clothing store' }
];

/** Farm and food goods for price agreements (World 2). */
export const GOODS = [
  { item: 'wheat', unit: 'bushel', units: 'bushels', lo: 4, hi: 9, buyer: 'Baker Keisha', seller: 'Farmer Andre', b: 'the baker', s: 'the farmer' },
  { item: 'corn', unit: 'bushel', units: 'bushels', lo: 3, hi: 7, buyer: 'the Sunrise Cereal Company', seller: 'Farmer Rosa', b: 'the cereal company', s: 'the farmer' },
  { item: 'flour', unit: 'bag', units: 'bags', lo: 2, hi: 9, buyer: 'Baker Marcus', seller: 'the Mill Street flour mill', b: 'the baker', s: 'the mill' },
  { item: 'oranges', unit: 'crate', units: 'crates', lo: 10, hi: 19, buyer: 'the Sunny Juice Company', seller: 'Farmer Aaliyah', b: 'the juice company', s: 'the farmer' },
  { item: 'apples', unit: 'crate', units: 'crates', lo: 8, hi: 18, buyer: "Imani's applesauce shop", seller: 'Farmer Tariq', b: 'the applesauce shop', s: 'the farmer' },
  { item: 'milk', unit: 'gallon', units: 'gallons', lo: 2, hi: 5, buyer: 'the Scoops ice cream shop', seller: 'Farmer Grace', b: 'the ice cream shop', s: 'the farmer' },
  { item: 'coffee beans', unit: 'pound', units: 'pounds', lo: 3, hi: 8, buyer: 'Café Nia', seller: 'the Hilltop coffee farm', b: 'the café', s: 'the coffee farm' }
];

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Events that move prices. dir = likely direction; cause = which side changed. */
export const EVENTS = [
  { item: 'oranges', t: 'A freeze damages many orange trees.', opp: 'Orange trees grow a huge crop.', dir: 'up', cause: 'supply-down', why: 'fewer oranges are available', whyOpp: 'more oranges are available' },
  { item: 'corn', t: 'Farmers have a great season and harvest lots of extra corn.', opp: 'A dry summer leaves farmers with much less corn.', dir: 'down', cause: 'supply-up', why: 'more corn is available', whyOpp: 'less corn is available' },
  { item: 'lemonade', t: 'A heat wave makes lots of people thirsty for lemonade.', opp: 'A cold, rainy week keeps people away from lemonade stands.', dir: 'up', cause: 'demand-up', why: 'more people want lemonade', whyOpp: 'fewer people want lemonade' },
  { item: 'hot cocoa', t: 'Summer arrives, and fewer people want hot cocoa.', opp: 'A snowstorm makes lots of people want hot cocoa.', dir: 'down', cause: 'demand-down', why: 'fewer people want hot cocoa', whyOpp: 'more people want hot cocoa' },
  { item: 'a popular sneaker', t: 'A famous athlete wears a sneaker, and lots of kids want it.', opp: 'The sneaker goes out of style, and kids stop asking for it.', dir: 'up', cause: 'demand-up', why: 'more people want the sneaker', whyOpp: 'fewer people want the sneaker' },
  { item: 'notebooks', t: 'It is back-to-school week, and many families need notebooks.', opp: 'School lets out for summer, and few families need notebooks.', dir: 'up', cause: 'demand-up', why: 'more people want notebooks', whyOpp: 'fewer people want notebooks' },
  { item: 'apples', t: 'Apple orchards grow a record crop this fall.', opp: 'A hailstorm knocks most apples off the trees.', dir: 'down', cause: 'supply-up', why: 'more apples are available', whyOpp: 'fewer apples are available' },
  { item: 'wheat', t: 'A long drought dries up many wheat fields.', opp: 'Rain comes at just the right time and wheat fields grow extra wheat.', dir: 'up', cause: 'supply-down', why: 'less wheat is available', whyOpp: 'more wheat is available' },
  { item: 'a toy', t: 'A toy goes out of style, and kids stop asking for it.', opp: 'A hit movie makes the toy super popular.', dir: 'down', cause: 'demand-down', why: 'fewer people want the toy', whyOpp: 'more people want the toy' },
  { item: 'strawberries', t: 'Two new farms nearby start growing lots of strawberries.', opp: 'A plant disease wipes out many strawberry fields.', dir: 'down', cause: 'supply-up', why: 'more strawberries are available', whyOpp: 'fewer strawberries are available' },
  { item: 'umbrellas', t: 'A rainy week is coming, and many people want umbrellas.', opp: 'A long dry, sunny spell means few people want umbrellas.', dir: 'up', cause: 'demand-up', why: 'more people want umbrellas', whyOpp: 'fewer people want umbrellas' },
  { item: 'bread', t: 'Flour and delivery costs go up for bakeries.', opp: 'Flour and delivery costs go down for bakeries.', dir: 'up', cause: 'cost-up', why: 'it costs more to make and deliver bread', whyOpp: 'it costs less to make and deliver bread' },
  { item: 'peaches', t: 'A late spring frost ruins many peach blossoms.', opp: 'Peach trees are loaded with fruit this summer.', dir: 'up', cause: 'supply-down', why: 'fewer peaches are available', whyOpp: 'more peaches are available' },
  { item: 'winter coats', t: 'A warm winter means fewer people shop for winter coats.', opp: 'An early cold snap sends lots of people shopping for coats.', dir: 'down', cause: 'demand-down', why: 'fewer people want winter coats', whyOpp: 'more people want winter coats' }
];

export const IRRELEVANT = ['The store painted its walls a new color.', 'A town far away renamed one of its streets.', 'The store changed the font on its sign.', 'A cloud passed over the parking lot one afternoon.'];

/** Build the per-question helper context. */
export function makeCtx(band, difficulty, rng, focus) {
  const A = band === 'analyst';
  const c = {
    band, difficulty, rng, focus, A,
    easy: difficulty === 'easy', medium: difficulty === 'medium', challenge: difficulty === 'challenge',
    int: (a, b) => int(rng, a, b),
    pick: (arr) => pick(rng, arr),
    pickI: (arr) => pickIndex(rng, arr),
    shuffle: (arr) => shuffle(rng, arr),
    sample: (arr, n) => sample(rng, arr, n),
    sampleI: (arr, n) => sampleIndices(rng, arr.length, n),
    chance: (p) => rng() < p,
    L: (e, a) => (A ? a : e),
    m: money, num,
    /** Price in cents between lo and hi dollars. Explorer: whole dollars. Analyst: cents (coarser when easier). */
    price(lo, hi) {
      if (!A) return int(rng, Math.ceil(lo), Math.floor(hi)) * 100;
      const step = difficulty === 'easy' ? 25 : difficulty === 'medium' ? 5 : 1;
      return int(rng, Math.ceil((lo * 100) / step), Math.floor((hi * 100) / step)) * step;
    },
    /** Explorer easy keeps every amount ≤ $20, medium ≤ $100. */
    cap: difficulty === 'easy' ? 20 : 100
  };
  return c;
}

/** Two different prices for an item within the band cap; returns [low, high] cents. */
export function pricePair(c, item, { minGap = 1 } = {}) {
  const hi = Math.min(item.hi, c.cap), lo = Math.min(item.lo, hi - 2);
  for (let i = 0; i < 50; i++) {
    const a = c.price(lo, hi), b = c.price(lo, hi);
    if (Math.abs(a - b) >= minGap * (c.A ? 5 : 100)) return a < b ? [a, b] : [b, a];
  }
  return [lo * 100, hi * 100];
}

/** Items whose price range fits the difficulty cap. */
export function itemsFor(c) {
  return ITEMS.filter((i) => i.lo + 2 <= c.cap && (!c.easy || i.lo <= 12));
}
