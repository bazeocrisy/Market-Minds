// Market Minds — Market Dictionary (CURRICULUM DATA ONLY).
// Owner: Agent 1. Definitions checked against the sources in docs/curriculum/SOURCES.md.
//
// Entry = { id, term, say, world, def: BandValue<string>, example: BandValue<string>, visual?: VisualSpec }
//   say   = simple pronunciation guide (capital letters = stressed part)
//   world = the world (1–6) where the term is first taught
// Tap-a-word markup [[id]] in lessons/stories must match an id here.
// All prices in examples are pretend.

export const GLOSSARY = [
  // ── World 1: Money & Markets ──────────────────────────────────────────────
  {
    id: 'market', term: 'market', say: 'MAR-kit', world: 1,
    def: {
      explorer: 'Any place or way that buyers and sellers come together to trade.',
      analyst: 'Any place or system, physical or online, where buyers and sellers trade goods, services or contracts.'
    },
    example: {
      explorer: 'A farmers market, a grocery store and a lemonade stand are all markets.',
      analyst: 'A farmers market and an app where neighbors sell used bikes are both markets, because buyers and sellers trade there.'
    }
  },
  {
    id: 'buyer', term: 'buyer', say: 'BY-er', world: 1,
    def: { explorer: 'The person who gives money to get something.', analyst: 'The side of a trade that pays money to receive a good, service or contract.' },
    example: { explorer: 'Amara is the buyer when she pays for peaches.', analyst: 'A bakery is a buyer of flour.' }
  },
  {
    id: 'seller', term: 'seller', say: 'SEL-er', world: 1,
    def: { explorer: 'The person who gives something to get money.', analyst: 'The side of a trade that provides a good, service or contract in exchange for money.' },
    example: { explorer: 'Mr. Okafor is the seller of peaches.', analyst: 'A wheat farmer is a seller of wheat.' }
  },
  {
    id: 'trade', term: 'trade', say: 'TRAYD', world: 1,
    def: { explorer: 'When people swap, like money for a snack.', analyst: 'An exchange in which each side gives something to get something it values more.' },
    example: { explorer: 'Jaylen trades a cup of lemonade for $1.', analyst: 'When Amara pays $2.50 for two peaches, both sides agree to trade.' }
  },
  {
    id: 'price', term: 'price', say: 'PRYSS', world: 1,
    def: { explorer: 'How much money you pay to buy something.', analyst: 'The amount of money a buyer and seller agree on for a good, service or contract.' },
    example: { explorer: 'The price of one peach is $1.', analyst: 'The price of strawberries rose from $2.50 to $5.00 per pound.' },
    visual: { kind: 'priceTags', items: [{ label: 'Peach', price: 1 }, { label: 'Loaf of bread', price: 5 }] }
  },
  {
    id: 'goods', term: 'goods', say: 'GOODZ', world: 1,
    def: { explorer: 'Things you can touch and buy, like apples or shoes.', analyst: 'Physical items that can be bought and sold.' },
    example: { explorer: 'Peaches and pencils are goods.', analyst: 'Sneakers, wheat and books are goods.' }
  },
  {
    id: 'services', term: 'services', say: 'SUR-vis-iz', world: 1,
    def: { explorer: 'Work that someone does for you, like cutting hair.', analyst: 'Work or help that people pay for, rather than an object.' },
    example: { explorer: 'A haircut at the barbershop is a service.', analyst: 'Tutoring, haircuts and bike repair are services.' }
  },
  {
    id: 'cost', term: 'cost', say: 'KAWST', world: 1,
    def: { explorer: 'The money a seller spends to make or get something to sell.', analyst: 'What a business must spend to produce or deliver a good, such as materials, labor and shipping.' },
    example: { explorer: 'Lemons and cups are costs for a lemonade stand.', analyst: 'Trucking strawberries from far away raises the cost of selling them.' }
  },
  {
    id: 'price-change', term: 'price change', say: 'PRYSS chaynj', world: 1,
    def: { explorer: 'How much a price went up or down. New price minus old price.', analyst: 'The difference between a new price and an old price: new − old. Positive means up; negative means down.' },
    example: { explorer: 'From $4 to $7 is a price change of up $3.', analyst: 'From $3.50 to $4.25 is a change of +$0.75.' }
  },
  {
    id: 'percent-change', term: 'percent change', say: 'per-SENT chaynj', world: 1,
    def: { explorer: 'How big a price change is compared with the starting price, out of 100.', analyst: 'A change divided by the starting (old) value, times 100: (new − old) ÷ old × 100.' },
    example: { explorer: 'Going from $10 to $11 is a 10 percent increase.', analyst: '$2.50 to $3.00 is a 20% increase, because $0.50 ÷ $2.50 = 0.20.' }
  },
  {
    id: 'line-chart', term: 'line chart', say: 'LYNE chart', world: 1,
    def: { explorer: 'A picture that shows how a number changes over time, with dots joined by a line.', analyst: 'A graph that plots values over time and connects them with a line to show a trend.' },
    example: { explorer: 'Deja\'s line chart shows strawberry prices going up each month.', analyst: 'A line chart of monthly prices can show whether a price is trending up, down or sideways.' },
    visual: { kind: 'line', title: 'Pretend price over time', unit: '$', points: [{ label: 'Mon', value: 3 }, { label: 'Tue', value: 4 }, { label: 'Wed', value: 3 }, { label: 'Thu', value: 5 }] }
  },
  {
    id: 'trend', term: 'trend', say: 'TREND', world: 4,
    def: { explorer: 'The general way something is moving, like mostly up or mostly down.', analyst: 'The overall direction of values over a period of time. A past trend does not guarantee the future.' },
    example: { explorer: 'The strawberry price had an up trend from June to November.', analyst: 'A price can trend up for months and then reverse.' }
  },
  {
    id: 'supply', term: 'supply', say: 'suh-PLY', world: 1,
    def: { explorer: 'How much of something is ready to sell.', analyst: 'The amount of a good that sellers are willing and able to sell at different prices.' },
    example: { explorer: 'If a storm hurts orange trees, the supply of oranges goes down.', analyst: 'A record harvest increases the supply of wheat.' }
  },
  {
    id: 'demand', term: 'demand', say: 'dih-MAND', world: 1,
    def: { explorer: 'How much people want to buy something.', analyst: 'The amount of a good that buyers are willing and able to buy at different prices.' },
    example: { explorer: 'On a hot day, demand for lemonade goes up.', analyst: 'When a new game launches, demand for controllers can jump.' }
  },
  {
    id: 'supply-and-demand', term: 'supply and demand', say: 'suh-PLY and dih-MAND', world: 1,
    def: {
      explorer: 'The idea that how much there is and how much people want it work together to push prices up or down.',
      analyst: 'The interaction between how much sellers offer and how much buyers want, which tends to move prices toward a level where they balance.'
    },
    example: { explorer: 'Few gel pens and many buyers: the price tends to go up.', analyst: 'A surplus of pens tends to push the price down; a shortage tends to push it up.' },
    visual: { kind: 'supplyDemand', item: 'gel pens', supply: 'less', demand: 'more' }
  },
  {
    id: 'shortage', term: 'shortage', say: 'SHOR-tij', world: 1,
    def: { explorer: 'When people want more of something than there is to sell.', analyst: 'When the amount demanded is greater than the amount supplied at the current price.' },
    example: { explorer: '30 students want gel pens, but there are only 10. That is a shortage.', analyst: 'Shortages tend to push prices up as buyers compete.' }
  },
  {
    id: 'scarcity', term: 'scarcity', say: 'SKAIR-sih-tee', world: 1,
    def: { explorer: 'When there is not enough of something for everyone who wants it.', analyst: 'The basic condition that wants are greater than the resources available, so people must choose and prices help decide who gets what.' },
    example: { explorer: 'Only 5 tickets are left and 20 kids want one. Tickets are scarce.', analyst: 'When a frost destroys part of an orange harvest, oranges become scarcer and their price tends to rise.' }
  },
  {
    id: 'surplus', term: 'surplus', say: 'SUR-plus', world: 1,
    def: { explorer: 'When there is more of something to sell than people want to buy.', analyst: 'When the amount supplied is greater than the amount demanded at the current price.' },
    example: { explorer: '100 pens but only 25 buyers is a surplus.', analyst: 'Sellers often cut prices to clear a surplus.' }
  },

  // ── World 2: The Future Price ─────────────────────────────────────────────
  {
    id: 'harvest', term: 'harvest', say: 'HAR-vist', world: 2,
    def: { explorer: 'The time when farmers gather their crops.', analyst: 'Gathering a crop when it is ready, and the season when that happens.' },
    example: { explorer: 'Wheat planted in spring may be ready to harvest in summer.', analyst: 'A farmer often does not know the selling price until harvest.' }
  },
  {
    id: 'market-price', term: 'market price', say: 'MAR-kit pryss', world: 2,
    def: { explorer: 'The price something sells for in the market right now.', analyst: 'The current price at which a good is being bought and sold in the market.' },
    example: { explorer: 'At harvest, the market price of wheat was $4 a bushel.', analyst: 'Compare the agreed price with the market price to see who an agreement helped.' }
  },
  {
    id: 'agreed-price', term: 'agreed price', say: 'uh-GREED pryss', world: 2,
    def: { explorer: 'The price two people promise to use, even if the market price changes.', analyst: 'The price fixed in an agreement, which applies no matter where the market price moves.' },
    example: { explorer: 'The farmer and baker\'s agreed price was $6 a bushel.', analyst: 'An agreed price of $6.25 stays $6.25 even if the market moves to $7.00.' }
  },
  {
    id: 'price-risk', term: 'price risk', say: 'PRYSS risk', world: 2,
    def: { explorer: 'The chance that a price changes in a way that hurts you.', analyst: 'The possibility of losing money because a price moves against you.' },
    example: { explorer: 'A farmer has price risk: wheat prices might drop before harvest.', analyst: 'A baker faces price risk if wheat prices rise; a farmer faces price risk if they fall.' }
  },
  {
    id: 'uncertainty', term: 'uncertainty', say: 'un-SUR-ten-tee', world: 2,
    def: { explorer: 'Not knowing for sure what will happen.', analyst: 'A situation where the outcome is unknown and several results are possible.' },
    example: { explorer: 'Nobody knows what the wheat price will be next summer.', analyst: 'Weather, demand and world events create uncertainty about future prices.' }
  },
  {
    id: 'forward-agreement', term: 'forward agreement', say: 'FOR-werd uh-GREE-ment', world: 2,
    def: {
      explorer: 'A promise made today to buy or sell something later, at a price agreed today.',
      analyst: 'A private contract between two parties to buy or sell something at a future date at a price set today. The two sides choose the terms.'
    },
    example: { explorer: 'The farmer promises to sell wheat to the baker at harvest for $6 a bushel.', analyst: 'A bakery and a farm sign a deal for 5,000 bushels at $6.25 per bushel, delivered in July.' },
    visual: { kind: 'agreement', item: 'wheat', buyer: 'Baker', seller: 'Farmer', price: '$6 per bushel', quantity: '100 bushels', when: 'At harvest' }
  },
  {
    id: 'futures-contract', term: 'futures contract', say: 'FYOO-cherz KON-trakt', world: 2,
    def: {
      explorer: 'A promise to buy or sell something later at a price agreed today, made on a special market with strict rules.',
      analyst: 'A standardized agreement to buy or sell a set amount of something at a future date, traded on a regulated exchange that sets the amount, quality and delivery months. Most positions are closed out (offset) before delivery.'
    },
    example: { explorer: 'People who grow or use wheat can use wheat futures contracts to plan ahead.', analyst: 'A wheat futures contract covers a fixed amount of wheat set by the exchange (5,000 bushels for CBOT wheat).' }
  },
  {
    id: 'exchange', term: 'exchange', say: 'iks-CHAYNJ', world: 2,
    def: { explorer: 'A special, organized market with rules where futures are traded.', analyst: 'An organized, regulated marketplace that lists standardized contracts and sets their terms.' },
    example: { explorer: 'Wheat futures are traded on an exchange in Chicago.', analyst: 'The exchange sets each contract\'s size, quality and delivery months.' }
  },
  {
    id: 'standardized', term: 'standardized', say: 'STAN-der-dyzd', world: 2,
    def: { explorer: 'Made the same every time, with the same rules.', analyst: 'Having identical, preset terms so that every contract of the same kind and month is the same.' },
    example: { explorer: 'Every contract for the same month is the same size.', analyst: 'Standardized contracts can be traded by many people and offset easily.' }
  },
  {
    id: 'commodity', term: 'commodity', say: 'kuh-MOD-ih-tee', world: 2,
    def: { explorer: 'A basic thing that is grown or dug up, like wheat, corn or gold.', analyst: 'A basic raw material or farm product, such as wheat, gold or crude oil, where one unit of the same grade is much like another.' },
    example: { explorer: 'Wheat and corn are farm commodities.', analyst: 'Gold, crude oil and soybeans are commodities traded on futures exchanges.' }
  },
  {
    id: 'hedging', term: 'hedging', say: 'HEJ-ing', world: 2,
    def: {
      explorer: 'Using a deal to protect yourself from a price change that could hurt you.',
      analyst: 'Taking a position, such as a forward or futures contract, to reduce the risk of a price change you already face. It trades away the chance of a better price for more certainty and does not guarantee a profit.'
    },
    example: { explorer: 'The farmer hedges by agreeing on a wheat price before harvest.', analyst: 'A wheat farmer worried about falling prices might hedge by selling wheat futures.' }
  },
  {
    id: 'hedger', term: 'hedger', say: 'HEJ-er', world: 2,
    def: { explorer: 'Someone who uses a deal to protect against price changes.', analyst: 'A market participant who uses futures or other contracts to reduce the price risk of their business.' },
    example: { explorer: 'A baker who locks in a wheat price is a hedger.', analyst: 'Farmers, millers and bakers can be hedgers.' }
  },
  {
    id: 'speculator', term: 'speculator', say: 'SPEK-yuh-lay-ter', world: 2,
    def: { explorer: 'Someone who trades hoping a price will move their way, and who can lose money.', analyst: 'A trader who tries to profit from price changes and accepts the risk of losses.' },
    example: { explorer: 'A speculator does not grow or use wheat.', analyst: 'Speculators take on price risk that hedgers want to reduce, and many lose money.' }
  },
  {
    id: 'delivery', term: 'delivery', say: 'dih-LIV-er-ee', world: 2,
    def: { explorer: 'Actually handing over the goods.', analyst: 'Handing over the actual commodity (or a cash settlement) under the terms of a contract.' },
    example: { explorer: 'Delivery is when the wheat is handed to the buyer.', analyst: 'Most futures positions are offset before delivery.' }
  },
  {
    id: 'offset', term: 'offset (close out)', say: 'OFF-set', world: 2,
    def: { explorer: 'Ending a futures deal early by making the opposite trade.', analyst: 'Closing a futures position by making an equal and opposite trade before delivery, such as selling the contracts you bought.' },
    example: { explorer: 'If you bought one contract, you offset by selling one.', analyst: 'A farmer who sold 10 contracts can offset by buying 10 before the delivery date.' }
  },
  {
    id: 'price-discovery', term: 'price discovery', say: 'PRYSS dis-KUV-er-ee', world: 2,
    def: { explorer: 'How buyers and sellers together figure out a price.', analyst: 'The process of finding a price level through the interaction of buyers and sellers.' },
    example: { explorer: 'At the market, buyers and sellers settle on a price for peaches.', analyst: 'Futures trading helps with price discovery for crops.' }
  },

  // ── World 3: What People Trade ────────────────────────────────────────────
  {
    id: 'stock', term: 'stock', say: 'STOK', world: 3,
    def: { explorer: 'A tiny piece of ownership in a company.', analyst: 'A share of ownership in a company. Stock prices go down as well as up, and you can lose money.' },
    example: { explorer: 'If you own stock in a shoe company, you own a small piece of it.', analyst: 'Owning stock is different from a futures contract, which is an agreement about a future trade.' }
  },
  {
    id: 'stock-index', term: 'stock index', say: 'STOK IN-deks', world: 3,
    def: { explorer: 'A number that tracks a group of companies\' stocks together.', analyst: 'A measurement of the performance of a basket of stocks chosen to represent a market or part of it.' },
    example: { explorer: 'A stock index is like a class average for a group of companies.', analyst: 'The Dow Jones Industrial Average is an index of 30 large U.S. company stocks.' }
  },
  {
    id: 'contract-size', term: 'contract size', say: 'KON-trakt syze', world: 5,
    def: { explorer: 'How much of something one contract covers.', analyst: 'The fixed amount of a commodity covered by one futures contract, set by the exchange.' },
    example: { explorer: 'One wheat contract covers a lot of wheat, not just one bag.', analyst: 'One CBOT wheat futures contract covers 5,000 bushels.' }
  },

  // ── World 4: Reading Markets ──────────────────────────────────────────────
  {
    id: 'candlestick', term: 'candlestick', say: 'KAN-dul-stik', world: 4,
    def: { explorer: 'A chart shape that shows where a price started, ended, and how high and low it went.', analyst: 'A chart symbol for one time period showing the open, high, low and close prices. The body spans open to close; the thin lines (wicks) reach the high and low.' },
    example: { explorer: 'One candle can show one day of prices.', analyst: 'If the close is above the open, the candle shows the price rose during that period.' },
    visual: { kind: 'candles', title: 'Pretend candles', unit: '$', candles: [{ label: 'Day 1', open: 10, high: 12, low: 9, close: 11 }, { label: 'Day 2', open: 11, high: 11.5, low: 9.5, close: 10 }] }
  },
  {
    id: 'ohlc', term: 'open, high, low, close', say: 'OH-pen, HY, LOH, KLOHZ', world: 4,
    def: { explorer: 'The first price, highest price, lowest price and last price in a time period.', analyst: 'The four prices for a period: the first trade (open), highest (high), lowest (low) and last (close).' },
    example: { explorer: 'Open $10, high $12, low $9, close $11.', analyst: 'A candlestick draws all four of these prices.' }
  },
  {
    id: 'long', term: 'long', say: 'LAWNG', world: 4,
    def: { explorer: 'Having bought, so you are helped if the price goes up and hurt if it goes down.', analyst: 'The position of someone who has bought a futures contract. A long position gains if the price rises and loses if it falls.' },
    example: { explorer: 'A baker who agreed to buy wheat is like being long.', analyst: 'Being long one contract means you are on the buying side.' }
  },
  {
    id: 'short', term: 'short', say: 'SHORT', world: 4,
    def: { explorer: 'Having sold, so you are helped if the price goes down and hurt if it goes up.', analyst: 'The selling side of a futures contract. A short position gains if the price falls and loses if it rises.' },
    example: { explorer: 'A farmer who agreed to sell wheat is like being short.', analyst: 'A farmer hedging a crop might go short wheat futures.' }
  },

  // ── World 5: Market Math ──────────────────────────────────────────────────
  {
    id: 'tick', term: 'tick', say: 'TIK', world: 5,
    def: { explorer: 'The smallest step a price is allowed to move.', analyst: 'The minimum price change allowed for a contract, set by the exchange. Each tick is worth a set dollar amount per contract.' },
    example: { explorer: 'If the smallest step is 1 cent, a price can go from $5.00 to $5.01 but not $5.005.', analyst: 'Pretend example: if a tick is $0.01 and a contract covers 1,000 units, each tick is worth $0.01 × 1,000 = $10 per contract.' }
  },
  {
    id: 'margin', term: 'margin', say: 'MAR-jin', world: 5,
    def: {
      explorer: 'Money a trader must set aside to show they can keep their promise. It is NOT the most they can lose.',
      analyst: 'Money deposited as a performance bond (good-faith deposit) when holding a futures position, often a small percent of the contract\'s value. It is not a down payment, and it is NOT the most you can lose: losses can be larger than the margin.'
    },
    example: { explorer: 'Margin is like a deposit, but you can lose more than it.', analyst: 'If losses shrink the account below the maintenance level, the trader must add more money (a margin call).' }
  },
  {
    id: 'margin-call', term: 'margin call', say: 'MAR-jin kawl', world: 5,
    def: { explorer: 'A message saying a trader must add more money after a loss.', analyst: 'A demand to deposit more money when losses push a margin account below the required level.' },
    example: { explorer: 'After a price drop, a trader may get a margin call.', analyst: 'Margin calls show that losses can go beyond the first deposit.' }
  },
  {
    id: 'leverage', term: 'leverage', say: 'LEV-er-ij', world: 5,
    def: {
      explorer: 'Controlling something big with a small amount of money, which makes gains AND losses bigger.',
      analyst: 'Controlling a large dollar amount of a commodity with a comparatively small amount of money. Leverage magnifies both gains and losses.'
    },
    example: { explorer: 'A small price move can mean a big loss when leverage is used.', analyst: 'With margin of 5% of a contract\'s value, a 5% price move against you equals the whole deposit, and a bigger move can cost more than the deposit.' }
  },

  // ── World 6: Decisions & Discipline ───────────────────────────────────────
  {
    id: 'risk', term: 'risk', say: 'RISK', world: 6,
    def: { explorer: 'The chance that something could go wrong or you could lose money.', analyst: 'The degree of uncertainty and the possibility of losing money in a decision.' },
    example: { explorer: 'Every trade has risk, because prices can move the wrong way.', analyst: 'Higher possible rewards usually come with higher risk.' }
  },
  {
    id: 'reward', term: 'reward', say: 'rih-WARD', world: 6,
    def: { explorer: 'What you hope to gain from a choice.', analyst: 'The possible gain from a decision, which should always be weighed against the possible loss.' },
    example: { explorer: 'The reward of waiting might be a better price, but it is not guaranteed.', analyst: 'Compare reward and risk before making any plan.' }
  },
  {
    id: 'stop-order', term: 'stop order', say: 'STOP OR-der', world: 6,
    def: {
      explorer: 'An instruction to buy or sell once the price reaches a chosen level. The final price can be worse than that level.',
      analyst: 'An order that becomes a market order when a chosen price (the stop price) is reached. The stop price is not a guaranteed exit price; in a fast market the actual price can be much worse.'
    },
    example: { explorer: 'A stop order is a plan for getting out, not a promise of the price you get.', analyst: 'A sell stop at $50 might fill at $48 if the price falls quickly.' }
  }
];

const BY_ID = new Map(GLOSSARY.map((t) => [t.id, t]));

/** Glossary entry by id, or null. */
export function termById(id) {
  return BY_ID.get(id) || null;
}
