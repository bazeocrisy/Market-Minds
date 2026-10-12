// Market Minds — the six curriculum worlds (CURRICULUM DATA ONLY).
// Owner: Agent 1. World = { id, number, title, tagline: BandValue<string>, summary: BandValue<string>,
//   status: 'ready'|'partial'|'planned', lessons: [lessonId] } — lesson ids must exist in ./lessons.js.
// status: 'ready' = every lesson playable; 'partial' = some lessons playable; 'planned' = in development.

export const WORLDS = [
  {
    id: 'world-1', number: 1, title: 'Money & Markets', status: 'ready',
    tagline: { explorer: 'Buyers, sellers and prices.', analyst: 'How markets set and change prices.' },
    summary: {
      explorer: 'Find out what a market is, why prices go up and down, and how supply and demand work.',
      analyst: 'Define markets, calculate price changes in dollars and percents, and use supply and demand to predict price pressure.'
    },
    lessons: ['w1l1', 'w1l2', 'w1l3']
  },
  {
    id: 'world-2', number: 2, title: 'The Future Price', status: 'ready',
    tagline: { explorer: 'Planning ahead for prices nobody knows yet.', analyst: 'Price risk, forward agreements, futures and hedging.' },
    summary: {
      explorer: 'Meet a farmer and a baker who both worry about the price of wheat, and see how a promise about a future price can help, or not.',
      analyst: 'Explore why producers and users face price risk, how forward agreements and standardized futures contracts differ, and what hedging can and cannot do.'
    },
    lessons: ['w2l1', 'w2l2', 'w2l3', 'w2l4']
  },
  {
    id: 'world-3', number: 3, title: 'What People Trade', status: 'planned',
    tagline: { explorer: 'Wheat, gold, oil and more.', analyst: 'Commodities, stock indexes, and futures vs. stocks.' },
    summary: {
      explorer: 'Discover the things people trade on special markets, from farm crops to metals to energy.',
      analyst: 'Compare farm, metal, energy and stock-index contracts, and learn how a futures contract differs from owning a stock.'
    },
    lessons: ['w3l1', 'w3l2', 'w3l3', 'w3l4', 'w3l5']
  },
  {
    id: 'world-4', number: 4, title: 'Reading Markets', status: 'ready',
    tagline: { explorer: 'Charts tell a story about the past.', analyst: 'Line charts, candlesticks, long and short.' },
    summary: {
      explorer: 'Learn to read price charts and candlesticks, and remember that charts show what happened, not what will happen.',
      analyst: 'Read line and candlestick charts, explain long and short positions, and recognize the limits of what charts can tell you.'
    },
    lessons: ['w4l1', 'w4l2', 'w4l3', 'w4l4']
  },
  {
    id: 'world-5', number: 5, title: 'Market Math', status: 'planned',
    tagline: { explorer: 'Counting price steps and changes.', analyst: 'Decimals, percents, ticks, contract size, margin and leverage.' },
    summary: {
      explorer: 'Practice the math of price changes and see why small moves can add up to big amounts.',
      analyst: 'Calculate price changes, percent changes, tick values and contract gains and losses, and see how leverage magnifies losses as well as gains.'
    },
    lessons: ['w5l1', 'w5l2', 'w5l3', 'w5l4', 'w5l5']
  },
  {
    id: 'world-6', number: 6, title: 'Decisions & Discipline', status: 'planned',
    tagline: { explorer: 'Think first, plan ahead, learn from mistakes.', analyst: 'Uncertainty, planning, risk limits and reflection.' },
    summary: {
      explorer: 'Practice making careful choices when nobody knows the future, including choosing to wait.',
      analyst: 'Make plans under uncertainty, understand what stop orders can and cannot do, and reflect honestly on losses.'
    },
    lessons: ['w6l1', 'w6l2', 'w6l3', 'w6l4', 'w6l5']
  }
];

/** World by id ('world-1') or number (1), or null. */
export function worldById(id) {
  return WORLDS.find((w) => w.id === id || w.number === id) || null;
}
