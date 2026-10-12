// Skill ids are fixed (see docs/ARCHITECTURE.md). Curriculum may refine names/descriptions.
export const SKILLS = {
  'market-basics': { id: 'market-basics', world: 1, lesson: 'w1l1', name: 'What a market is', description: 'Recognize a market as any place or way that buyers and sellers trade.' },
  'buyers-sellers': { id: 'buyers-sellers', world: 1, lesson: 'w1l1', name: 'Buyers and sellers', description: 'Tell who is the buyer and who is the seller, and what each one wants.' },
  'price-change-math': { id: 'price-change-math', world: 1, lesson: 'w1l2', name: 'Finding a price change', description: 'Find how much a price went up or down.' },
  'price-change-reasons': { id: 'price-change-reasons', world: 1, lesson: 'w1l2', name: 'Why prices change', description: 'Explain everyday reasons a price might rise or fall.' },
  'supply-demand': { id: 'supply-demand', world: 1, lesson: 'w1l3', name: 'Supply and demand', description: 'Predict how changes in supply or demand can push a price up or down.' },
  'future-agreement': { id: 'future-agreement', world: 2, lesson: 'w2l1', name: 'Agreeing on a future price', description: 'Understand an agreement today about a price for a later trade.' },
  'hedge-outcome': { id: 'hedge-outcome', world: 2, lesson: 'w2l1', name: 'Who did the agreement help?', description: 'Compare the agreed price with the later market price.' },
  'futures-risk': { id: 'futures-risk', world: 2, lesson: 'w2l1', name: 'Uncertainty and risk', description: 'Recognize that nobody knows future prices and agreements can turn out better or worse.' },
  // Phase 4, batch 2 (2026-10-12): rest of World 2 and all of World 4.
  'futures-standardization': { id: 'futures-standardization', world: 2, lesson: 'w2l2', name: 'Forward vs. futures', description: 'Tell a private forward agreement from a standardized, exchange-traded futures contract, and explain the clearinghouse and margin (a performance bond, not a loss limit).' },
  'hedgers-speculators': { id: 'hedgers-speculators', world: 2, lesson: 'w2l3', name: 'Hedgers and speculators', description: 'Tell why different people use futures: to reduce a price risk they already have, or to take on risk hoping to profit.' },
  'offset-delivery': { id: 'offset-delivery', world: 2, lesson: 'w2l4', name: 'Closing out a position', description: 'Explain how an opposite trade closes a futures position before delivery.' },
  'line-chart-reading': { id: 'line-chart-reading', world: 4, lesson: 'w4l1', name: 'Reading line charts', description: 'Read prices, highs, lows and changes from a price-over-time line chart.' },
  'candlestick-reading': { id: 'candlestick-reading', world: 4, lesson: 'w4l2', name: 'Reading candlesticks', description: 'Find the open, high, low and close of a candlestick and tell whether the price rose or fell.' },
  'long-short': { id: 'long-short', world: 4, lesson: 'w4l3', name: 'Long and short', description: 'Tell which side gains or loses when a price rises or falls.' },
  'chart-limits': { id: 'chart-limits', world: 4, lesson: 'w4l4', name: 'What charts cannot tell you', description: 'Explain why past price movements cannot guarantee future prices.' }
};
export const SKILL_IDS = Object.keys(SKILLS);
