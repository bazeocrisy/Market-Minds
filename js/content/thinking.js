// Thinking Lab prompts. CURRICULUM DATA ONLY (no DOM, no scoring of free writing).
// The Thinking Lab practices REASONING: predicting, explaining, comparing, spotting missing
// information, and admitting uncertainty. Written explanations are never keyword-graded; the
// learner compares with an example answer and self-checks honestly.
//
// Prompt schema:
// {
//   id: string (unique, stable — used as the key in store.thinking),
//   world: 1|2, lesson: 'w1l1'…, skill: skill id from js/content/skills.js,
//   type: 'predict' | 'explain' | 'compare' | 'missing-info' | 'price-change' | 'uncertainty' | 'mistake-detective',
//   title: string,
//   scenario: BandValue<string>,             // { explorer, analyst } or a shared string
//   visual?: visual spec for js/ui/visuals.js,
//   question: BandValue<string>,             // the structured-choice question
//   choices?: [{ id, text: BandValue<string>, correct?: true, feedback: BandValue<string> }],
//     // when openChoice is false, EXACTLY ONE choice is correct (a defensible single answer).
//   openChoice?: boolean,                    // true = no single right answer; every choice gets thoughtful feedback
//   explainPrompt: BandValue<string>,        // label for the written explanation
//   referenceAnswer: BandValue<string>,      // an example of a strong answer (not the only one)
//   checklist: BandValue<string[]>           // "My answer mentioned…" self-check items
// }
// Mistake Detective prompts feature a fictional student who gives an incorrect explanation.
// All prices and items are pretend.

export const THINKING_TYPES = {
  predict: 'Predict',
  explain: 'Explain your reasoning',
  compare: 'Compare two decisions',
  'missing-info': 'What information is missing?',
  'price-change': 'Why might the price change?',
  uncertainty: 'Recognize uncertainty',
  'mistake-detective': 'Mistake Detective'
};

export const THINKING_PROMPTS = [
  // ------------------------------------------------------------- World 1, Lesson 1
  {
    id: 'tl-w1-saturday-swap',
    world: 1, lesson: 'w1l1', skill: 'market-basics', type: 'explain',
    title: 'Is the Saturday swap a market?',
    scenario: {
      explorer: 'Every Saturday, kids at the community center bring snacks they made at home. Some kids sell muffins for $1. Others buy them. There is no store building — just tables in the gym.',
      analyst: 'On Saturdays, students at a community center set up folding tables in the gym. Some sell homemade muffins for $1 each; others buy. There is no store, cash register or website.'
    },
    question: { explorer: 'Is the Saturday swap a market?', analyst: 'Does the Saturday swap count as a market?' },
    choices: [
      { id: 'a', text: 'Yes — buyers and sellers are trading there.', correct: true, feedback: { explorer: 'Yes! A market is any place or way that buyers and sellers trade. A gym can be a market.', analyst: 'Right. A market is defined by buyers and sellers trading, not by a building.' } },
      { id: 'b', text: 'No — a market needs a store building.', feedback: { explorer: 'Think again: does a market need walls, or does it need buyers and sellers?', analyst: 'Look at the definition: is a building required, or is trading what matters?' } },
      { id: 'c', text: 'No — it is too small to count.', feedback: { explorer: 'Markets can be tiny or huge. What makes something a market?', analyst: 'Size does not decide it. What has to happen for something to be a market?' } }
    ],
    explainPrompt: { explorer: 'Explain why. Who are the buyers and who are the sellers?', analyst: 'Explain your reasoning using the words buyer, seller and market.' },
    referenceAnswer: {
      explorer: 'It is a market because the kids with muffins are sellers and the kids who pay are buyers. They trade muffins for money. A market does not need a building.',
      analyst: 'Yes. A market is any place or system where buyers and sellers trade. The sellers offer muffins, buyers pay $1, and a trade happens — the gym tables are enough.'
    },
    checklist: {
      explorer: ['who the sellers are', 'who the buyers are', 'that a market does not need a building'],
      analyst: ['the definition of a market', 'both buyers and sellers', 'why a building is not required']
    }
  },
  {
    id: 'tl-w1-two-sellers',
    world: 1, lesson: 'w1l1', skill: 'buyers-sellers', type: 'compare',
    title: 'Two sellers, two choices',
    scenario: {
      explorer: 'Aaliyah and her cousin both sell bracelets at the park. Aaliyah charges $3. Her cousin charges $5 but uses fancier beads.',
      analyst: 'Two young sellers offer bracelets at a weekend park market. One charges $3 for simple bracelets; the other charges $5 for bracelets with nicer beads and a small gift bag.'
    },
    visual: { kind: 'priceTags', items: [{ label: 'Simple bracelet', price: 3 }, { label: 'Fancy bracelet', price: 5, note: 'nicer beads + gift bag' }] },
    question: { explorer: 'Which seller made the better choice?', analyst: 'Which pricing decision is better?' },
    openChoice: true,
    choices: [
      { id: 'a', text: 'The $3 seller', feedback: { explorer: 'A lower price might bring more buyers. But each sale earns less. There is no single right answer.', analyst: 'A lower price may attract more buyers, but each sale brings in less. It depends on what buyers value.' } },
      { id: 'b', text: 'The $5 seller', feedback: { explorer: 'Some buyers will pay more for fancy beads. Others might walk away. There is no single right answer.', analyst: 'Some buyers pay more for quality; others are price-sensitive. It depends on who shows up.' } },
      { id: 'c', text: 'It depends on the buyers', feedback: { explorer: 'Good thinking — what buyers want matters a lot!', analyst: 'Good reasoning — the better choice depends on what buyers want and how many there are.' } }
    ],
    explainPrompt: { explorer: 'Explain your choice. What would buyers think?', analyst: 'Compare the two decisions. What does each seller gain and risk?' },
    referenceAnswer: {
      explorer: 'The $3 seller might sell more bracelets because they cost less. The $5 seller might sell fewer but earn more on each one. It depends on what the buyers want.',
      analyst: 'The $3 seller trades a lower price for possibly more sales; the $5 seller earns more per sale but risks fewer buyers. Which works better depends on buyers’ preferences and how much each bracelet costs to make.'
    },
    checklist: {
      explorer: ['what is good about the $3 choice', 'what is good about the $5 choice', 'what buyers want'],
      analyst: ['a benefit and a risk of the lower price', 'a benefit and a risk of the higher price', 'that the answer depends on buyers']
    }
  },
  {
    id: 'tl-w1-mistake-zuri',
    world: 1, lesson: 'w1l1', skill: 'buyers-sellers', type: 'mistake-detective',
    title: 'Mistake Detective: Zuri’s bike',
    scenario: {
      explorer: 'Zuri’s neighbor wants to sell an old bike. Zuri pays the neighbor $20 for it. Zuri says: "I’m the seller because I gave money."',
      analyst: 'Zuri pays a neighbor $20 for a used bike. Zuri explains: "I’m the seller in this trade, because I’m the one who handed over money."'
    },
    question: 'What is the mistake in Zuri’s thinking?',
    choices: [
      { id: 'a', text: 'Zuri mixed up the roles: the one who pays is the buyer.', correct: true, feedback: { explorer: 'You found it! Zuri pays money to get the bike, so Zuri is the buyer. The neighbor is the seller.', analyst: 'Exactly. The buyer gives money to get something; the seller gives the item to get money.' } },
      { id: 'b', text: 'There is no mistake.', feedback: { explorer: 'Look again: who gave the money and who gave the bike?', analyst: 'Check the roles: who gives money, and who gives the item?' } },
      { id: 'c', text: 'Zuri paid too much.', feedback: { explorer: 'We don’t know if $20 is too much. Zuri’s mistake is about who is who.', analyst: 'The price could be fair or not — that’s not the mistake in the explanation.' } }
    ],
    explainPrompt: { explorer: 'Help Zuri. How can you tell who the buyer is?', analyst: 'Write how you would explain the buyer and seller roles to Zuri.' },
    referenceAnswer: {
      explorer: 'Zuri is the buyer, because Zuri gives money to get the bike. The neighbor is the seller, because the neighbor gives the bike to get money.',
      analyst: 'Zuri is the buyer: a buyer gives money in exchange for a good. The neighbor is the seller, giving up the bike in exchange for $20.'
    },
    checklist: {
      explorer: ['that Zuri is the buyer', 'that the neighbor is the seller', 'how money and the bike change hands'],
      analyst: ['the correct roles', 'a rule for telling buyers from sellers', 'what each side gives and gets']
    }
  },

  // ------------------------------------------------------------- World 1, Lesson 2
  {
    id: 'tl-w1-mistake-jaylen',
    world: 1, lesson: 'w1l2', skill: 'price-change-math', type: 'mistake-detective',
    title: 'Mistake Detective: Jaylen’s math',
    scenario: {
      explorer: 'A pretend juice box cost $3 last week. This week it costs $5. Jaylen says: "The price changed by $8, because 3 + 5 = 8."',
      analyst: 'A pretend snack pack was $3.25 last month and is $5.00 now. Jaylen says: "The change is $8.25, because I added the two prices."'
    },
    visual: { explorer: { kind: 'priceTags', items: [{ label: 'Last week', price: 3 }, { label: 'This week', price: 5 }] }, analyst: { kind: 'priceTags', items: [{ label: 'Last month', price: 3.25 }, { label: 'Now', price: 5 }] } },
    question: 'What did Jaylen do wrong?',
    choices: [
      { id: 'a', text: 'He added. To find a change, subtract: new price − old price.', correct: true, feedback: { explorer: 'Yes! $5 − $3 = $2. The price went up by $2.', analyst: 'Correct: $5.00 − $3.25 = $1.75, an increase of $1.75.' } },
      { id: 'b', text: 'He should have multiplied the prices.', feedback: { explorer: 'Multiplying makes an even bigger number. How do we find how far apart two prices are?', analyst: 'Multiplying doesn’t measure a difference. Which operation finds how far apart two numbers are?' } },
      { id: 'c', text: 'Nothing — adding is right.', feedback: { explorer: 'If the price only went from $3 to $5, could it really have changed by $8?', analyst: 'Check: could a price that moved from $3.25 to $5.00 have changed by more than either price?' } }
    ],
    explainPrompt: { explorer: 'Show the right math and tell Jaylen how to remember it.', analyst: 'Show the correct calculation and explain why subtraction measures change.' },
    referenceAnswer: {
      explorer: 'To find a change, subtract: new − old. $5 − $3 = $2, so the price went up $2. Adding tells you a total, not a change.',
      analyst: 'Change = new − old = $5.00 − $3.25 = $1.75. Subtraction measures the distance between the two prices; adding gives a total, which isn’t a change.'
    },
    checklist: {
      explorer: ['subtracting new − old', 'the answer $2', 'that the price went up'],
      analyst: ['the formula new − old', 'the answer $1.75 (an increase)', 'why adding does not measure change']
    }
  },
  {
    id: 'tl-w1-winter-berries',
    world: 1, lesson: 'w1l2', skill: 'price-change-reasons', type: 'price-change',
    title: 'Why did strawberries cost more?',
    scenario: {
      explorer: 'At a pretend market, a box of strawberries cost $3 in summer. In winter, the same box cost $6.',
      analyst: 'At a pretend grocery, a box of strawberries is $3 in July and $6 in January. Nothing else about the box changed.'
    },
    visual: { kind: 'line', title: 'Pretend strawberry price', unit: '$', points: [{ label: 'Jul', value: 3 }, { label: 'Sep', value: 3.5 }, { label: 'Nov', value: 4.75 }, { label: 'Jan', value: 6 }], highlight: 3 },
    question: { explorer: 'What is the best reason the price might go up in winter?', analyst: 'Which explanation best fits the price rising in winter?' },
    choices: [
      { id: 'a', text: { explorer: 'Fewer strawberries grow in winter, so there are fewer to sell.', analyst: 'Fewer strawberries grow nearby in winter, so supply is lower (some are shipped from far away).' }, correct: true, feedback: { explorer: 'Great reasoning! When there is less of something, the price often goes up.', analyst: 'Strong reasoning: lower supply (and higher shipping costs) tends to push the price up.' } },
      { id: 'b', text: 'Strawberries taste better in winter.', feedback: { explorer: 'Do strawberries really taste better in winter? Think about how many there are.', analyst: 'There’s no evidence of that. Think about how much supply is available.' } },
      { id: 'c', text: 'Prices always go up over time.', feedback: { explorer: 'Prices can go down too! Look for a reason about this season.', analyst: 'Prices don’t always rise — many fall. Look for a reason specific to winter.' } }
    ],
    explainPrompt: { explorer: 'Explain why the price might change.', analyst: 'Explain the price change using the word supply.' },
    referenceAnswer: {
      explorer: 'In winter, not many strawberries grow nearby, so there are fewer to sell. When there are fewer, the price often goes up. In summer there are lots, so the price is lower.',
      analyst: 'Winter supply is lower because strawberries don’t grow well nearby and must be shipped from farther away, which also costs more. With demand about the same, lower supply tends to push the price up.'
    },
    checklist: {
      explorer: ['fewer strawberries in winter', 'that less to sell can raise the price', 'a comparison with summer'],
      analyst: ['lower supply', 'demand staying about the same', 'a cost such as shipping']
    }
  },
  {
    id: 'tl-w1-festival-predict',
    world: 1, lesson: 'w1l2', skill: 'price-change-reasons', type: 'predict',
    title: 'Predict: the festival weekend',
    scenario: {
      explorer: 'A big music festival is coming to town. Thousands of visitors will be hungry. Mr. Okafor sells pretend tacos near the park.',
      analyst: 'A large music festival will bring thousands of visitors to town next weekend. A food truck sells pretend tacos beside the festival park and has a limited amount of food.'
    },
    question: { explorer: 'What could happen to the taco price that weekend?', analyst: 'What is the most likely effect on taco prices that weekend?' },
    choices: [
      { id: 'a', text: 'It could go up, because more people want tacos.', correct: true, feedback: { explorer: 'Good prediction! More buyers can push a price up. It could still stay the same — nobody knows for sure.', analyst: 'A sound prediction: higher demand with limited supply tends to raise prices. It’s likely, not certain.' } },
      { id: 'b', text: 'It will definitely go down.', feedback: { explorer: 'Would more hungry people make the price go down? And can we be "definitely" sure?', analyst: 'Two problems: the reasoning points the other way, and "definitely" claims certainty nobody has.' } },
      { id: 'c', text: 'The festival can’t change prices.', feedback: { explorer: 'Thousands of new buyers is a big change! How might that matter?', analyst: 'A big jump in buyers is exactly the kind of change that can move prices.' } }
    ],
    explainPrompt: { explorer: 'Explain your prediction. What else could happen?', analyst: 'Explain your prediction and name one thing that could make it wrong.' },
    referenceAnswer: {
      explorer: 'More people will want tacos, so the price could go up. But the truck might keep the same price to make customers happy, so I can’t be sure.',
      analyst: 'Demand will rise while the truck’s supply is limited, so the price is likely to rise. It might not if the truck chooses to keep prices steady or if many other food trucks show up (more supply).'
    },
    checklist: {
      explorer: ['more buyers', 'that the price could go up', 'something else that could happen'],
      analyst: ['higher demand', 'limited supply', 'one reason the prediction could be wrong']
    }
  },

  // ------------------------------------------------------------- World 1, Lesson 3
  {
    id: 'tl-w1-orchard-storm',
    world: 1, lesson: 'w1l3', skill: 'supply-demand', type: 'predict',
    title: 'Predict: the orchard storm',
    scenario: {
      explorer: 'A storm knocks down many apples in the pretend orchards. People still want the same number of apples as before.',
      analyst: 'A storm destroys a large share of the pretend apple crop, cutting the [[supply]]. [[demand|Demand]] for apples is unchanged.'
    },
    visual: { kind: 'supplyDemand', item: 'apples', supply: 'less', demand: 'same' },
    question: { explorer: 'What will probably happen to the apple price?', analyst: 'What is the likely price pressure?' },
    choices: [
      { id: 'a', text: 'Probably up', correct: true, feedback: { explorer: 'Yes. Fewer apples but the same number of buyers usually pushes the price up. Usually — not always!', analyst: 'Right: lower supply with steady demand usually pushes the price up — a tendency, not a guarantee.' } },
      { id: 'b', text: 'Probably down', feedback: { explorer: 'If there are fewer apples and the same number of buyers, would they cost less?', analyst: 'Check the direction: what happens when there’s less of something people still want?' } },
      { id: 'c', text: 'Stay exactly the same', feedback: { explorer: 'Something changed — the supply! Could the price stay exactly the same?', analyst: 'Supply changed, so there’s pressure in some direction.' } }
    ],
    explainPrompt: { explorer: 'Explain using the words supply and demand.', analyst: 'Explain the price pressure, and say why it is not guaranteed.' },
    referenceAnswer: {
      explorer: 'The storm means less supply. Demand is the same. When there are fewer apples for the same buyers, the price usually goes up. It might not, if stores saved lots of apples.',
      analyst: 'Supply fell while demand stayed the same, so buyers compete for fewer apples and the price is likely to rise. It’s not guaranteed — stored apples or imports could fill the gap.'
    },
    checklist: {
      explorer: ['less supply', 'demand stayed the same', 'that it is not 100% sure'],
      analyst: ['the supply change', 'the steady demand', 'something that could make the price not rise']
    }
  },
  {
    id: 'tl-w1-mistake-nia',
    world: 1, lesson: 'w1l3', skill: 'supply-demand', type: 'mistake-detective',
    title: 'Mistake Detective: Nia’s pumpkins',
    scenario: {
      explorer: 'After Halloween, the pretend farm stand has piles of extra pumpkins, and not many people want them. Nia says: "So many pumpkins means they will cost MORE now."',
      analyst: 'After Halloween, a pretend farm stand has a large [[surplus]] of pumpkins and few shoppers want them. Nia argues: "Supply went up, so the price will go up too."'
    },
    visual: { kind: 'supplyDemand', item: 'pumpkins', supply: 'more', demand: 'less' },
    question: 'What is wrong with Nia’s explanation?',
    choices: [
      { id: 'a', text: 'More supply and less demand usually push the price DOWN, not up.', correct: true, feedback: { explorer: 'You cracked the case! Lots of pumpkins and few buyers usually means lower prices.', analyst: 'Correct. A surplus with falling demand usually pushes prices down.' } },
      { id: 'b', text: 'Pumpkins never change price.', feedback: { explorer: 'Prices can change for pumpkins too. Look at what happened to supply and demand.', analyst: 'Any price can change. Focus on what supply and demand did.' } },
      { id: 'c', text: 'Nia is right.', feedback: { explorer: 'Would you pay more for something nobody wants and there’s lots of?', analyst: 'Test her idea: does a surplus usually raise or lower prices?' } }
    ],
    explainPrompt: { explorer: 'Explain to Nia what will probably happen and why.', analyst: 'Correct Nia’s reasoning step by step.' },
    referenceAnswer: {
      explorer: 'There are lots of pumpkins (more supply) and fewer people want them (less demand). The stand will probably lower the price so pumpkins don’t go to waste.',
      analyst: 'Supply rose and demand fell — both push the price down. Sellers with a surplus usually cut prices to attract the few remaining buyers.'
    },
    checklist: {
      explorer: ['more supply', 'less demand', 'that the price will probably go down'],
      analyst: ['both forces', 'the correct direction (down)', 'why sellers lower prices with a surplus']
    }
  },
  {
    id: 'tl-w1-missing-cocoa',
    world: 1, lesson: 'w1l3', skill: 'supply-demand', type: 'missing-info',
    title: 'What do we still need to know?',
    scenario: {
      explorer: 'Deja hears a friend say: "Pretend cocoa will cost more next month because cocoa farmers had a good year!"',
      analyst: 'Deja’s friend claims: "Pretend cocoa prices will rise next month — the farmers had a great growing season."'
    },
    question: { explorer: 'What information is missing before we can believe this?', analyst: 'Which missing information matters most for judging the claim?' },
    choices: [
      { id: 'a', text: { explorer: 'Whether more people want cocoa, and how much cocoa there is.', analyst: 'What is happening to demand, and how big the extra supply is.' }, correct: true, feedback: { explorer: 'Yes! A good year usually means MORE cocoa, which could push the price down. We need to know about demand too.', analyst: 'Exactly — a great season usually raises supply (downward pressure). Without demand information the claim doesn’t hold up.' } },
      { id: 'b', text: 'The friend’s favorite chocolate bar.', feedback: { explorer: 'That’s fun to know, but does it change the price of cocoa?', analyst: 'A personal favorite doesn’t affect market supply or demand.' } },
      { id: 'c', text: 'Nothing — the friend sounds sure.', feedback: { explorer: 'Sounding sure is not the same as being right! What facts would help?', analyst: 'Confidence isn’t evidence. What facts would test the claim?' } }
    ],
    explainPrompt: { explorer: 'What would you ask the friend? Why?', analyst: 'List the information you would want, and explain how each piece could change the prediction.' },
    referenceAnswer: {
      explorer: 'I would ask: Do more people want cocoa now? A good year means more cocoa, so the price might actually go down. I need to know about buyers too.',
      analyst: 'A good season suggests higher supply, which usually lowers prices — the opposite of the claim. I’d want demand information (are candy makers buying more?), how big the harvest is, and whether stored supply is high.'
    },
    checklist: {
      explorer: ['a question about demand (buyers)', 'that a good year means more cocoa', 'that the friend could be wrong'],
      analyst: ['demand information', 'the size of the supply change', 'that the claim may point the wrong way']
    }
  },
  {
    id: 'tl-w1-harvest-surprise',
    world: 1, lesson: 'w1l3', skill: 'supply-demand', type: 'uncertainty',
    title: 'The price did the opposite',
    scenario: {
      explorer: 'The news said there would be a big harvest of Pretend Oats. Many people guessed the price would go down. But the price went UP.',
      analyst: 'A big Pretend Oats [[harvest]] was reported, so many expected prices to fall. Instead the price rose that week.'
    },
    visual: { kind: 'line', title: 'Pretend Oats price this week', unit: '$', points: [{ label: 'Mon', value: 3.5 }, { label: 'Tue', value: 3.52 }, { label: 'Wed', value: 3.7 }, { label: 'Thu', value: 3.75 }], highlight: 2 },
    question: { explorer: 'Which could explain the surprise?', analyst: 'Which explanations could account for the surprise?' },
    openChoice: true,
    choices: [
      { id: 'a', text: 'A big buyer suddenly wanted lots of oats.', feedback: { explorer: 'That could do it! More demand can outweigh more supply. There is no single right answer here.', analyst: 'Plausible: a demand jump can outweigh a supply increase. Other explanations could also be true.' } },
      { id: 'b', text: 'The harvest was smaller than the news said.', feedback: { explorer: 'Possible! News can be wrong or change. There is no single right answer here.', analyst: 'Plausible: early reports can be revised. Other explanations could also be true.' } },
      { id: 'c', text: 'Nobody can know for sure — prices are uncertain.', feedback: { explorer: 'Wise thinking. We can make good guesses, but nobody knows for sure.', analyst: 'A mature answer: we can reason about likely causes, but uncertainty never goes away.' } }
    ],
    explainPrompt: { explorer: 'Why can a good guess still turn out wrong?', analyst: 'Explain why sound reasoning can still lead to a wrong prediction.' },
    referenceAnswer: {
      explorer: 'My guess used the news, which was smart. But something we didn’t know — like a big buyer — pushed the price up. Good guesses can still be wrong because nobody knows the future.',
      analyst: 'Reasoning from the harvest news was sound, but prices react to all information, including things we don’t see (new demand, revised reports). A good process can still produce a wrong prediction; that’s uncertainty.'
    },
    checklist: {
      explorer: ['something we did not know', 'that a smart guess can still be wrong', 'that nobody knows the future'],
      analyst: ['a possible hidden cause', 'the difference between good reasoning and a good outcome', 'uncertainty']
    }
  },

  // ------------------------------------------------------------- World 2, Lesson 1
  {
    id: 'tl-w2-farmer-baker',
    world: 2, lesson: 'w2l1', skill: 'hedge-outcome', type: 'compare',
    title: 'Who did the agreement help?',
    scenario: {
      explorer: 'In spring, Farmer Grace and Baker Malcolm agree: in fall, Grace will sell Malcolm 100 bags of pretend wheat for $5 a bag. In fall, the market price is only $4 a bag.',
      analyst: 'In spring, a farmer and a baker agree on 100 bags of pretend wheat at $5 per bag, to be delivered in fall. At [[delivery]], the [[market-price|market price]] has fallen to $4 per bag.'
    },
    visual: { kind: 'agreement', item: 'pretend wheat (bags)', buyer: 'Baker Malcolm', seller: 'Farmer Grace', price: 5, quantity: 100, when: 'In the fall' },
    question: { explorer: 'Who did the agreement help this time?', analyst: 'Compared with the fall market price, which side benefited from the agreement?' },
    choices: [
      { id: 'a', text: 'Farmer Grace (the seller)', correct: true, feedback: { explorer: 'Yes. Grace still gets $5 a bag, even though the market is $4. That’s $1 more per bag, $100 in all.', analyst: 'Correct: the seller receives $5 instead of $4 — $1 × 100 = $100 better than selling at the market price.' } },
      { id: 'b', text: 'Baker Malcolm (the buyer)', feedback: { explorer: 'Malcolm pays $5, but the market price is $4. Is that better or worse for him?', analyst: 'The buyer pays $5 when the market is $4. Better or worse for him?' } },
      { id: 'c', text: 'Neither — nothing changed.', feedback: { explorer: 'The market price changed from what they agreed. Compare $5 and $4.', analyst: 'Compare the agreed price with the market price at delivery.' } }
    ],
    explainPrompt: { explorer: 'Compare the two prices. Was the baker’s choice silly?', analyst: 'Compare both sides. Was the baker’s decision a bad one, given what he knew in spring?' },
    referenceAnswer: {
      explorer: 'Grace gets $5 instead of $4, so she got $1 more per bag. Malcolm paid $1 more per bag this time. But in spring, nobody knew the price would fall. Malcolm got to plan ahead and know his cost.',
      analyst: 'The seller gained $1 × 100 = $100 relative to the market; the buyer paid $100 more. The baker’s decision wasn’t necessarily bad: he locked in a known cost when the future price was uncertain. If prices had risen, he would have benefited.'
    },
    checklist: {
      explorer: ['comparing $5 with $4', 'who got the better deal this time', 'that nobody knew the future price in spring'],
      analyst: ['the $100 difference', 'both sides’ outcomes', 'why a locked price can still be a reasonable decision']
    }
  },
  {
    id: 'tl-w2-missing-baker',
    world: 2, lesson: 'w2l1', skill: 'future-agreement', type: 'missing-info',
    title: 'Before you agree',
    scenario: {
      explorer: 'Baker Imani wants to agree on a price today for flour she will buy later. The seller says: "Let’s agree on $4."',
      analyst: 'A bakery owner wants to agree today on a price for flour delivered later. The seller proposes: "$4 — deal?"'
    },
    question: { explorer: 'What important information is missing?', analyst: 'Which missing terms must be settled before this is a complete agreement?' },
    choices: [
      { id: 'a', text: 'How much flour, and when it will be delivered.', correct: true, feedback: { explorer: 'Yes! An agreement needs the price, how much, and when.', analyst: 'Right — a future agreement needs item, price, quantity and date. "$4" alone is incomplete.' } },
      { id: 'b', text: 'The seller’s favorite color.', feedback: { explorer: 'Does that change the deal? Think about what the baker will get.', analyst: 'Not a term of the deal. What would make the agreement complete?' } },
      { id: 'c', text: 'Nothing — $4 is enough.', feedback: { explorer: '$4 for how much flour? And when?', analyst: '$4 per what, and for delivery when?' } }
    ],
    explainPrompt: { explorer: 'Write the full agreement you would want.', analyst: 'Write a complete agreement and explain why each part matters.' },
    referenceAnswer: {
      explorer: 'We agree today: the seller will sell Imani 50 bags of flour for $4 a bag, delivered in one month. Now everyone knows the price, how much, and when.',
      analyst: 'Item: flour; quantity: 50 bags; price: $4 per bag; delivery: one month from today. Each term matters — without quantity and date, neither side knows what they’ve promised.'
    },
    checklist: {
      explorer: ['how much (quantity)', 'when', 'the price'],
      analyst: ['item, price, quantity and date', 'why "$4" alone is incomplete', 'that both sides make a promise']
    }
  },
  {
    id: 'tl-w2-mistake-malik',
    world: 2, lesson: 'w2l1', skill: 'futures-risk', type: 'mistake-detective',
    title: 'Mistake Detective: Malik’s "sure thing"',
    scenario: {
      explorer: 'Malik says: "If you agree on a price now for later, you can never lose. It’s a sure thing!"',
      analyst: 'Malik claims: "A future price agreement removes all [[risk]]. Whoever makes one can’t end up worse off."'
    },
    question: 'What is wrong with Malik’s idea?',
    choices: [
      { id: 'a', text: 'The market price can move either way, so one side can end up worse off than the market.', correct: true, feedback: { explorer: 'Detective work! If the price changes, one side might wish they hadn’t agreed. Nobody knows the future.', analyst: 'Correct. Locking a price removes surprise about YOUR price, but you can still do worse than the market price — and practice futures positions can lose more than the margin deposit.' } },
      { id: 'b', text: 'Nothing — agreements are always safe.', feedback: { explorer: 'Think about Farmer Grace and Baker Malcolm. Did both sides come out ahead?', analyst: 'Recall the farmer and baker: did both sides benefit?' } },
      { id: 'c', text: 'Agreements only work for wheat.', feedback: { explorer: 'People make agreements for lots of things. Is Malik right about never losing?', analyst: 'Future agreements cover many goods. Focus on the "can’t lose" claim.' } }
    ],
    explainPrompt: { explorer: 'Explain to Malik how someone could lose.', analyst: 'Give Malik an example where an agreement turns out worse than waiting.' },
    referenceAnswer: {
      explorer: 'If you agree to buy at $5 and later the price is $4, you pay $1 more than everyone else. Agreements help you plan, but they are not a sure thing.',
      analyst: 'A buyer who locks $5 when the market later trades at $4 pays $1 per unit more than the market. Agreements trade uncertainty about price for a known price — they don’t remove the chance of a worse outcome. With futures, losses can even exceed the margin deposit.'
    },
    checklist: {
      explorer: ['an example with two prices', 'that someone can end up worse off', 'that nobody knows the future'],
      analyst: ['a numeric example', 'the difference between "known price" and "no risk"', 'that losses can exceed a margin deposit']
    }
  },
  {
    id: 'tl-w2-lock-or-wait',
    world: 2, lesson: 'w2l1', skill: 'futures-risk', type: 'uncertainty',
    title: 'Lock the price or wait?',
    scenario: {
      explorer: 'Baker Malcolm needs pretend wheat in three months. Today he could agree on $5 a bag. Or he could wait and pay whatever the price is later. Nobody knows the future price. That is [[uncertainty]].',
      analyst: 'A bakery needs pretend wheat in three months. It can lock in $5 per bag today, or wait and pay the market price then. Forecasts disagree about where the price is heading.'
    },
    question: { explorer: 'What would you do?', analyst: 'Which choice would you make?' },
    openChoice: true,
    choices: [
      { id: 'a', text: 'Agree on $5 now', feedback: { explorer: 'Now he knows his cost and can plan. If the price falls, he pays more than others. No single right answer!', analyst: 'You trade possible savings for certainty and easier planning. If prices fall, you pay above market.' } },
      { id: 'b', text: 'Wait and see', feedback: { explorer: 'Waiting is a real choice! If the price drops, he saves. If it rises, he pays more. No single right answer!', analyst: 'Waiting is a valid decision: you keep the chance of a lower price but carry the risk of a higher one.' } },
      { id: 'c', text: 'Agree on some now and wait on the rest', feedback: { explorer: 'Splitting it up is clever — less risk either way. No single right answer!', analyst: 'Splitting reduces the impact of being wrong in either direction. A thoughtful middle path.' } }
    ],
    explainPrompt: { explorer: 'Explain your choice. What could go wrong?', analyst: 'Justify your choice and describe the outcome you’d regret most.' },
    referenceAnswer: {
      explorer: 'I would agree on $5 now so the bakery knows its cost. If the price goes down, we pay a little more, but we won’t be surprised by a big jump.',
      analyst: 'I’d lock part of the order at $5 to make costs predictable, and leave the rest open. If prices rise, the locked part protects me; if they fall, I still benefit on the rest. Either way I’ve planned for being wrong.'
    },
    checklist: {
      explorer: ['my choice', 'what could go wrong', 'that nobody knows the future price'],
      analyst: ['a clear choice', 'the main risk of that choice', 'why it fits the bakery’s needs']
    }
  }
];

export function promptById(id) {
  return THINKING_PROMPTS.find((p) => p.id === id) || null;
}
