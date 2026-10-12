// Skill ids are fixed (see docs/ARCHITECTURE.md). Curriculum may refine names/descriptions.
export const SKILLS = {
  'market-basics': { id: 'market-basics', world: 1, lesson: 'w1l1', name: 'What a market is', description: 'Recognize a market as any place or way that buyers and sellers trade.' },
  'buyers-sellers': { id: 'buyers-sellers', world: 1, lesson: 'w1l1', name: 'Buyers and sellers', description: 'Tell who is the buyer and who is the seller, and what each one wants.' },
  'price-change-math': { id: 'price-change-math', world: 1, lesson: 'w1l2', name: 'Finding a price change', description: 'Find how much a price went up or down.' },
  'price-change-reasons': { id: 'price-change-reasons', world: 1, lesson: 'w1l2', name: 'Why prices change', description: 'Explain everyday reasons a price might rise or fall.' },
  'supply-demand': { id: 'supply-demand', world: 1, lesson: 'w1l3', name: 'Supply and demand', description: 'Predict how changes in supply or demand can push a price up or down.' },
  'future-agreement': { id: 'future-agreement', world: 2, lesson: 'w2l1', name: 'Agreeing on a future price', description: 'Understand an agreement today about a price for a later trade.' },
  'hedge-outcome': { id: 'hedge-outcome', world: 2, lesson: 'w2l1', name: 'Who did the agreement help?', description: 'Compare the agreed price with the later market price.' },
  'futures-risk': { id: 'futures-risk', world: 2, lesson: 'w2l1', name: 'Uncertainty and risk', description: 'Recognize that nobody knows future prices and agreements can turn out better or worse.' }
};
export const SKILL_IDS = Object.keys(SKILLS);
