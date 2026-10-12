// Market Lab scenarios. CURRICULUM DATA ONLY (no DOM, no scoring).
// Every item, price, headline and number here is INVENTED for practice. These are not real
// commodities, not real contract specifications, not real prices and not predictions.
//
// Scenario shape:
// {
//   id, item: 'Pretend Wheat', unit: 'bushel' (singular, pretend unit), title,
//   intro: BandValue<string>,           // what the learner reads first
//   quantity: number,                   // units in ONE practice contract (made up, not a real spec)
//   margin: number,                     // pretend margin deposit for Paper Practice
//   start: number,                      // Day 0 price
//   days: [{ label, price, open?, news: { headline: BandValue<string>, effect }, why?: BandValue<string> }],
//     // news is shown BEFORE that day's price is revealed. `open` is set when the price GAPS
//     // overnight (opens far from the previous close) — used to teach that stops can fill past the stop.
//     // effect: 'supply-less' | 'supply-more' | 'demand-more' | 'demand-less' | 'opinion' | 'none'
//     // why: shown after the reveal on days where the price did something surprising.
//   against: boolean,                   // true if at least one day moves AGAINST the news (teaches uncertainty)
//   notes: { explorer, analyst },       // band notes: what this scenario is good for teaching
//   takeaway: BandValue<string>
// }

export const NEWS_EFFECTS = ['supply-less', 'supply-more', 'demand-more', 'demand-less', 'opinion', 'none'];

/** What supply/demand reasoning would usually EXPECT from a news effect (not a promise). */
export function newsExpectation(effect) {
  switch (effect) {
    case 'supply-less': case 'demand-more': return 'up';
    case 'supply-more': case 'demand-less': return 'down';
    default: return null;   // 'opinion' and 'none' give no supply/demand evidence
  }
}

export const EFFECT_LABELS = {
  'supply-less': 'Less supply',
  'supply-more': 'More supply',
  'demand-more': 'More demand',
  'demand-less': 'Less demand',
  opinion: 'Just someone’s opinion',
  none: 'No big news'
};

const calm = { headline: { explorer: 'A calm day. No big news.', analyst: 'No major news today.' }, effect: 'none' };

export const SCENARIOS = [
  {
    id: 'pretend-wheat-storm',
    item: 'Pretend Wheat', unit: 'bushel',
    title: 'Pretend Wheat and the Storm',
    intro: {
      explorer: 'Farmers grow Pretend Wheat. Bakers buy it to make bread. Watch the news and think about supply and demand.',
      analyst: 'Pretend Wheat is a made-up crop traded in a pretend market. Use each news card to reason about supply and demand before the price is shown.'
    },
    quantity: 100, margin: 50, start: 6.00,
    days: [
      { label: 'Day 1', price: 6.05, news: calm },
      { label: 'Day 2', price: 6.40, news: { headline: { explorer: 'A big storm floods some Pretend Wheat fields.', analyst: 'Storm flooding damages part of the Pretend Wheat crop.' }, effect: 'supply-less' } },
      { label: 'Day 3', price: 6.55, news: { headline: { explorer: 'Bakers want extra flour for a holiday.', analyst: 'Bakeries increase flour orders ahead of a holiday.' }, effect: 'demand-more' } },
      { label: 'Day 4', price: 6.30, news: { headline: { explorer: 'The fields dry out faster than expected.', analyst: 'Fields drain faster than expected; less of the crop is lost.' }, effect: 'supply-more' } },
      { label: 'Day 5', price: 6.35, news: calm }
    ],
    against: false,
    notes: {
      explorer: 'Here the news and the price mostly agree. Even so, nobody knew for sure ahead of time.',
      analyst: 'A scenario where supply/demand reasoning lines up with the moves. Notice the price still gave back some of its rise on Day 4.'
    },
    takeaway: { explorer: 'Less wheat made the price climb, then it slipped back a little.', analyst: 'News can push prices, but moves reverse when new information arrives.' }
  },
  {
    id: 'practice-apples-surprise',
    item: 'Practice Apples', unit: 'crate',
    title: 'Practice Apples: A Surprise',
    intro: {
      explorer: 'Practice Apples are sold by the crate. Sometimes the news points one way and the price goes the other way. Watch closely!',
      analyst: 'Practice Apples trade by the crate in a pretend market. This scenario includes at least one move that goes against the obvious reading of the news.'
    },
    quantity: 100, margin: 20, start: 2.00,
    days: [
      {
        label: 'Day 1', price: 1.90,
        news: { headline: { explorer: 'A storm damages some Practice Apple orchards.', analyst: 'A storm damages several Practice Apple orchards.' }, effect: 'supply-less' },
        why: {
          explorer: 'Surprise! Stores still had lots of apples saved from last season, so there were plenty to sell.',
          analyst: 'Large stored inventories from last season more than covered the storm losses, so available supply was still high.'
        }
      },
      { label: 'Day 2', price: 1.80, news: { headline: { explorer: 'Stores say they have lots of apples in storage.', analyst: 'Reports show apple storage is unusually full.' }, effect: 'supply-more' } },
      {
        label: 'Day 3', price: 1.81,
        news: { headline: { explorer: 'A school fair needs lots of apples.', analyst: 'A large school fair places an apple order.' }, effect: 'demand-more' },
        why: { explorer: 'The fair helped a little, but there were still lots of apples.', analyst: 'The extra demand was small compared with the large supply, so the price barely moved.' }
      },
      { label: 'Day 4', price: 1.70, news: calm },
      { label: 'Day 5', price: 1.60, news: { headline: { explorer: 'Many people choose pears this week.', analyst: 'Shoppers switch to pears this week.' }, effect: 'demand-less' } }
    ],
    against: true,
    notes: {
      explorer: 'The storm news made many people think "up", but the price went down. That is uncertainty.',
      analyst: 'Good for showing that one headline is not the whole picture, and that a long position can lose more than the pretend margin (−$40 vs a $20 deposit).'
    },
    takeaway: { explorer: 'One news card does not tell the whole story.', analyst: 'Missing information (stored supply) can outweigh an obvious headline.' }
  },
  {
    id: 'make-believe-oj-gap',
    item: 'Make-Believe Orange Juice', unit: 'gallon',
    title: 'Make-Believe Orange Juice: The Overnight Jump',
    intro: {
      explorer: 'Make-Believe Orange Juice is sold by the gallon. One night, big news arrives while the market is closed.',
      analyst: 'Make-Believe Orange Juice trades by the gallon. Overnight news causes a price gap — the next price is far from the last one, with nothing in between.'
    },
    quantity: 100, margin: 40, start: 3.00,
    days: [
      { label: 'Day 1', price: 3.05, news: calm },
      { label: 'Day 2', price: 3.10, news: { headline: { explorer: 'Juice fans buy more for summer.', analyst: 'Summer demand for juice rises.' }, effect: 'demand-more' } },
      {
        label: 'Day 3', open: 2.60, price: 2.55,
        news: { headline: { explorer: 'Overnight: a report says there are many more pretend oranges than expected.', analyst: 'Overnight report: the pretend orange harvest is much larger than forecast.' }, effect: 'supply-more' },
        why: {
          explorer: 'The price jumped down while the market was closed. It opened at $2.60 — it never traded at the prices in between.',
          analyst: 'The market opened at $2.60, gapping past every price between $3.10 and $2.60. A stop order in that range would fill near $2.60, not at the stop.'
        }
      },
      { label: 'Day 4', price: 2.50, news: calm },
      { label: 'Day 5', price: 2.70, news: { headline: { explorer: 'Hot weather — people drink more juice.', analyst: 'A heat wave lifts juice demand.' }, effect: 'demand-more' } }
    ],
    against: false,
    notes: {
      explorer: 'Shows that prices can jump suddenly.',
      analyst: 'Use with a stop order: a long with a stop at $2.90 is filled at $2.60, $0.30 worse than the stop. Stops do not guarantee the exit price.'
    },
    takeaway: { explorer: 'Prices can jump overnight.', analyst: 'A stop order is not a guaranteed exit price: gaps skip right past it.' }
  },
  {
    id: 'sample-corn-hype',
    item: 'Sample Corn', unit: 'bushel',
    title: 'Sample Corn and the Loud Opinion',
    intro: {
      explorer: 'Sample Corn is a pretend crop. Someone on a pretend TV show is very sure about the price. Are they right?',
      analyst: 'Sample Corn is a pretend crop. This scenario separates opinions ("it will definitely rise") from supply and demand information.'
    },
    quantity: 100, margin: 30, start: 4.00,
    days: [
      { label: 'Day 1', price: 4.02, news: calm },
      {
        label: 'Day 2', price: 3.95,
        news: { headline: { explorer: 'A pretend TV host says Sample Corn will "definitely" go up!', analyst: 'A pretend TV host says Sample Corn will "definitely" rise.' }, effect: 'opinion' },
        why: { explorer: 'Being sure does not make it true. The price went down.', analyst: 'Confidence is not evidence. Nobody can know a future price for sure.' }
      },
      { label: 'Day 3', price: 3.80, news: { headline: { explorer: 'Farmers planted lots of Sample Corn this year.', analyst: 'Planting reports show a very large Sample Corn crop.' }, effect: 'supply-more' } },
      {
        label: 'Day 4', price: 3.70,
        news: { headline: { explorer: 'Animal farms need more corn for feed.', analyst: 'Livestock farms raise their feed orders.' }, effect: 'demand-more' },
        why: { explorer: 'More demand, but the giant crop was still bigger. The price kept slipping.', analyst: 'Higher feed demand was outweighed by the record crop, so the price kept falling.' }
      },
      { label: 'Day 5', price: 3.75, news: calm }
    ],
    against: true,
    notes: {
      explorer: 'Teaches that someone being very sure is not a reason.',
      analyst: 'Opinion vs evidence, and a demand headline that loses to a bigger supply story.'
    },
    takeaway: { explorer: 'Being sure is not the same as being right.', analyst: 'Weigh evidence, not confidence — and weigh how big each force is.' }
  },
  {
    id: 'toy-cocoa-gap-up',
    item: 'Toy Cocoa', unit: 'bag',
    title: 'Toy Cocoa: Up, Down, and a Jump',
    intro: {
      explorer: 'Toy Cocoa beans are sold by the bag to pretend candy makers. The price moves a lot in this one.',
      analyst: 'Toy Cocoa is a pretend, fast-moving market. Watch what a gap UP does to someone who sold short with a stop.'
    },
    quantity: 100, margin: 60, start: 8.00,
    days: [
      { label: 'Day 1', price: 8.60, news: { headline: { explorer: 'Dry weather hurts Toy Cocoa trees.', analyst: 'Drought damages Toy Cocoa trees.' }, effect: 'supply-less' } },
      { label: 'Day 2', price: 8.30, news: { headline: { explorer: 'Candy makers buy less because cocoa costs so much.', analyst: 'Candy makers cut purchases as prices climb.' }, effect: 'demand-less' } },
      {
        label: 'Day 3', open: 9.00, price: 9.10,
        news: { headline: { explorer: 'Overnight: a ship is delayed, so fewer beans are ready.', analyst: 'Overnight: a shipping delay leaves fewer beans available.' }, effect: 'supply-less' },
        why: { explorer: 'The price jumped up while the market was closed. It opened at $9.00.', analyst: 'The price gapped up to open at $9.00. A short position’s stop at $8.70 would fill near $9.00, not $8.70.' }
      },
      { label: 'Day 4', price: 8.90, news: { headline: { explorer: 'Rain returns to the Toy Cocoa farms.', analyst: 'Rain returns; crop worries ease.' }, effect: 'supply-more' } },
      { label: 'Day 5', price: 8.95, news: calm }
    ],
    against: false,
    notes: {
      explorer: 'Big moves both ways. Nobody knew what was coming.',
      analyst: 'A short from $8.00 to $8.95 loses $95 on 100 bags — more than the $60 pretend margin. A short stop at $8.70 gaps to a $9.00 fill.'
    },
    takeaway: { explorer: 'Prices can go up and down fast.', analyst: 'Selling short loses when prices rise, and losses can exceed the margin deposit.' }
  },
  {
    id: 'pretend-oats-puzzle',
    item: 'Pretend Oats', unit: 'bushel',
    title: 'Pretend Oats: The Puzzle',
    intro: {
      explorer: 'Pretend Oats are used for breakfast cereal. This one is a puzzle — the price does not always follow the news.',
      analyst: 'Pretend Oats feed a pretend cereal industry. Several moves go against the headline. Practice saying "I can’t be sure."'
    },
    quantity: 100, margin: 25, start: 3.50,
    days: [
      {
        label: 'Day 1', price: 3.49,
        news: { headline: { explorer: 'Cereal ads make oats popular.', analyst: 'A cereal ad campaign boosts interest in oats.' }, effect: 'demand-more' },
        why: { explorer: 'People talked about oats, but did not buy many more yet. The price stayed about the same.', analyst: 'Interest did not turn into extra buying yet, so the price was roughly flat.' }
      },
      { label: 'Day 2', price: 3.52, news: calm },
      {
        label: 'Day 3', price: 3.70,
        news: { headline: { explorer: 'A big harvest of Pretend Oats arrives.', analyst: 'A large Pretend Oats harvest arrives.' }, effect: 'supply-more' },
        why: { explorer: 'Surprise! A cereal company quietly bought lots of oats the same day.', analyst: 'A large buyer placed orders the same day — information the headline did not include.' }
      },
      { label: 'Day 4', price: 3.75, news: { headline: { explorer: 'A cereal company orders lots of oats.', analyst: 'News confirms a cereal maker’s big oat order.' }, effect: 'demand-more' } },
      { label: 'Day 5', price: 3.74, news: calm }
    ],
    against: true,
    notes: {
      explorer: 'A great one for practicing "Can’t be sure."',
      analyst: 'Two headline-vs-price surprises. A short from $3.50 loses $24 — close to the $25 pretend margin.'
    },
    takeaway: { explorer: 'Sometimes the honest answer is "I can’t be sure."', analyst: 'Unknown information moves prices. Plan for being wrong.' }
  }
];

export function scenarioById(id) {
  return SCENARIOS.find((s) => s.id === id) || null;
}
