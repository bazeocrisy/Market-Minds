// Thinking Lab prompts. CURRICULUM DATA ONLY (no DOM, no scoring of free writing).
// The Thinking Lab practices REASONING: predicting, explaining, comparing, spotting missing
// information, and admitting uncertainty. Written explanations are never keyword-graded; the
// learner compares with an example answer and self-checks honestly.
//
// Prompt schema:
// {
//   id: string (unique, stable — used as the key in store.thinking),
//   world: 1|2|4, lesson: 'w1l1'…, skill: skill id from js/content/skills.js,
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
  },

  // ------------------------------------------------------------- World 2, Lesson 2 (batch 2)
  {
    id: 'tl-w2-handshake-vs-exchange',
    world: 2, lesson: 'w2l2', skill: 'futures-standardization', type: 'compare',
    title: 'Handshake deal or exchange contract?',
    scenario: {
      explorer: 'Farmer Rosa and Baker Ben shake hands: Rosa will sell Ben 70 bags of pretend wheat next month for $5 a bag. Across town, people trade a [[futures-contract|futures contract]] on an [[exchange]]. Every one of those contracts is for exactly 100 bags, the same kind of wheat, on the same date.',
      analyst: 'Rosa and Ben write a private [[forward-agreement|forward agreement]]: 70 bags of pretend wheat, their own quality rules, delivery on a date they picked. Meanwhile, a pretend [[futures-contract|futures contract]] trades on an [[exchange]] with [[standardized]] terms: 100 bags per contract, one quality grade, set delivery months.'
    },
    question: { explorer: 'What is the biggest difference between the two?', analyst: 'What does standardization make possible that the private deal does not?' },
    choices: [
      { id: 'a', text: { explorer: 'Every exchange contract is the same, so lots of people can buy and sell it easily.', analyst: 'Identical terms let any buyer trade with any seller on the exchange, and close out later with an opposite trade.' }, correct: true, feedback: { explorer: 'Yes! Because every contract is the same, buyers and sellers don’t have to agree on all the details each time.', analyst: 'Right. Standard terms make contracts interchangeable, so many strangers can trade them — and anyone can exit by trading the same contract the other way.' } },
      { id: 'b', text: { explorer: 'The exchange contract always has a better price.', analyst: 'The exchange contract guarantees a better price than the private deal.' }, feedback: { explorer: 'Nobody can promise a better price. Look at what is the SAME about every exchange contract.', analyst: 'No contract guarantees a better price. Focus on what the identical terms allow.' } },
      { id: 'c', text: { explorer: 'There is no difference. They are both just promises.', analyst: 'There is no real difference; both are agreements about a future price.' }, feedback: { explorer: 'They are both promises about later — but are their details chosen the same way?', analyst: 'Both are future-price agreements, but who sets the terms, and who can trade them?' } }
    ],
    explainPrompt: { explorer: 'Explain one way the handshake deal and the exchange contract are different.', analyst: 'Compare the forward and the futures contract: who sets the terms, who can trade it, and how you get out of it.' },
    referenceAnswer: {
      explorer: 'Rosa and Ben picked their own amount and date, so only they can use that deal. The exchange contract is always 100 bags of the same wheat on the same date, so lots of people can buy and sell it.',
      analyst: 'The forward’s terms are custom, so it only fits Rosa and Ben and is hard to pass to anyone else. The futures contract’s terms are standardized by the exchange, so contracts are interchangeable: many traders can buy and sell them, and a trader can exit by making the opposite trade.'
    },
    checklist: {
      explorer: ['who picked the details', 'that exchange contracts are all the same', 'that many people can trade them'],
      analyst: ['custom vs standardized terms', 'who can trade each one', 'how a trader can get out']
    }
  },
  {
    id: 'tl-w2-mistake-priya-trust',
    world: 2, lesson: 'w2l2', skill: 'futures-standardization', type: 'mistake-detective',
    title: 'Mistake Detective: Priya’s worry',
    scenario: {
      explorer: 'Priya buys one pretend wheat contract on an exchange. She says: "Now I have to trust the stranger who sold it to me. If they don’t pay, nobody will help me!"',
      analyst: 'Priya buys one pretend wheat [[futures-contract|futures contract]] on an [[exchange]]. She says: "My deal depends completely on the stranger who sold it. If they can’t pay, I’m stuck — there is nothing between us."'
    },
    question: 'What is the mistake in Priya’s thinking?',
    choices: [
      { id: 'a', text: { explorer: 'The exchange has a helper in the middle (a clearinghouse) that makes sure both sides keep their promise.', analyst: 'A clearinghouse stands between buyer and seller and guarantees each side, backed by the margin deposits both sides post.' }, correct: true, feedback: { explorer: 'You found it! With exchange contracts, a clearinghouse sits in the middle. Priya does not have to trust the stranger alone.', analyst: 'Exactly. The clearinghouse becomes the buyer to every seller and the seller to every buyer, and collects margin from both — so traders don’t have to trust each other directly.' } },
      { id: 'b', text: { explorer: 'There is no mistake.', analyst: 'There is no mistake; exchange trades are just private promises.' }, feedback: { explorer: 'Look again: is an exchange contract just a handshake between two people?', analyst: 'That describes a private forward. What extra protection does an exchange add?' } },
      { id: 'c', text: { explorer: 'Priya’s mistake is buying instead of selling.', analyst: 'Her mistake is choosing to buy rather than sell.' }, feedback: { explorer: 'Buying or selling isn’t the mistake. Her mistake is about who she has to trust.', analyst: 'Either side faces the same question. Focus on who stands behind the trade.' } }
    ],
    explainPrompt: { explorer: 'Help Priya. Who is in the middle of an exchange trade?', analyst: 'Explain to Priya how an exchange reduces the risk that the other side won’t pay — and what risk it does NOT remove.' },
    referenceAnswer: {
      explorer: 'On an exchange, a clearinghouse is in the middle. It makes sure both the buyer and the seller keep their promises. Priya can still lose if the price moves the wrong way, but she does not have to trust the stranger.',
      analyst: 'A clearinghouse stands between every buyer and seller and requires margin from both, so Priya doesn’t depend on one stranger paying. That removes most of the “other side won’t pay” risk — but not price risk: if the price falls, Priya still loses, and the loss can be bigger than her margin.'
    },
    checklist: {
      explorer: ['that a clearinghouse is in the middle', 'that both sides must keep their promise', 'that Priya can still lose if the price moves'],
      analyst: ['the clearinghouse’s role', 'margin from both sides', 'that price risk is not removed']
    }
  },
  {
    id: 'tl-w2-missing-handshake',
    world: 2, lesson: 'w2l2', skill: 'futures-standardization', type: 'missing-info',
    title: 'What did the handshake leave out?',
    scenario: {
      explorer: 'Two neighbors agree: "I’ll sell you pretend corn next month for $4." They shake hands. Next month they argue! One brought 10 bags. The other wanted 50 bags of a better kind of corn.',
      analyst: 'Two neighbors make a quick private deal: “Pretend corn next month at $4.” A month later they disagree about how much, what quality and which day. An exchange contract would have settled all of this in advance.'
    },
    question: { explorer: 'What information was missing from their deal?', analyst: 'Which missing information caused the argument?' },
    choices: [
      { id: 'a', text: { explorer: 'How much corn, what kind, and the exact day.', analyst: 'Quantity, quality grade and the exact delivery date — the terms a standardized contract fixes.' }, correct: true, feedback: { explorer: 'Yes! An exchange contract sets the amount, the kind of corn and the date, so nobody has to argue later.', analyst: 'Right. A [[standardized]] contract fixes quantity, quality and delivery timing, so only the price is left to agree on.' } },
      { id: 'b', text: { explorer: 'The price.', analyst: 'The price per bag.' }, feedback: { explorer: 'They did agree on a price: $4. What else did they forget?', analyst: 'The price was agreed. What else does a complete contract need?' } },
      { id: 'c', text: { explorer: 'Nothing was missing — they were just grumpy.', analyst: 'Nothing; disagreements are unavoidable.' }, feedback: { explorer: 'They argued about real details. Which details did the deal never say?', analyst: 'Look at what they argued about. Which terms were never written down?' } }
    ],
    explainPrompt: { explorer: 'Rewrite their deal so there is nothing to argue about.', analyst: 'Rewrite the deal as a complete set of terms and explain how standardization helps.' },
    referenceAnswer: {
      explorer: 'I will sell you 50 bags of yellow pretend corn for $4 a bag, on the first Monday of next month. Now we know how much, what kind and when.',
      analyst: 'Item: yellow pretend corn, grade A; quantity: 50 bags; price: $4 per bag; delivery: first Monday of next month. A standardized exchange contract sets everything except the price in advance, so traders only negotiate the price.'
    },
    checklist: {
      explorer: ['how much', 'what kind', 'when'],
      analyst: ['quantity, quality and date', 'that the price was already agreed', 'how standard terms prevent the argument']
    }
  },

  // ------------------------------------------------------------- World 2, Lesson 3 (batch 2)
  {
    id: 'tl-w2-hedger-or-speculator',
    world: 2, lesson: 'w2l3', skill: 'hedgers-speculators', type: 'explain',
    title: 'Hedger or speculator?',
    scenario: {
      explorer: 'Farmer Lin grows pretend wheat. She worries the price will fall before harvest, so she makes a deal to sell at $5 later. Sam has no wheat at all. He buys a pretend wheat contract because he thinks the price might go up.',
      analyst: 'Lin, a pretend wheat farmer, sells futures at $5 because a price drop before harvest would hurt her income. Sam owns no wheat and does not need any; he buys futures hoping to profit from a rise.'
    },
    question: { explorer: 'Who is the hedger?', analyst: 'Which trader is the hedger, and why?' },
    choices: [
      { id: 'a', text: { explorer: 'Farmer Lin — she is protecting the price of wheat she already grows.', analyst: 'Lin — she already has price risk from her crop and uses futures to reduce it.' }, correct: true, feedback: { explorer: 'Yes! A [[hedger]] already has something to protect. Lin’s crop could lose value, so she locks in a price.', analyst: 'Correct. A [[hedger]] uses futures to reduce a price risk they already face. Sam is a [[speculator]]: he takes on risk hoping to profit.' } },
      { id: 'b', text: { explorer: 'Sam — he is the one buying.', analyst: 'Sam — buyers are always hedgers.' }, feedback: { explorer: 'Buying or selling doesn’t decide it. Who already has wheat to worry about?', analyst: 'Hedgers can buy or sell. What matters is whether the trader already has a price risk.' } },
      { id: 'c', text: { explorer: 'Both of them.', analyst: 'Both; anyone who trades futures is hedging.' }, feedback: { explorer: 'Does Sam have any wheat to protect?', analyst: 'Sam has no existing exposure. Is he reducing risk or taking it on?' } }
    ],
    explainPrompt: { explorer: 'Explain why Lin and Sam are using the market for different reasons.', analyst: 'Explain each trader’s motive and what each one risks.' },
    referenceAnswer: {
      explorer: 'Lin is a hedger because she grows wheat and wants to protect her price. Sam is a speculator because he has no wheat — he is hoping the price goes up, and he could lose if it goes down.',
      analyst: 'Lin hedges: she already owns a price risk (her crop) and uses futures to reduce it, giving up some upside. Sam speculates: he has no crop, so he takes on price risk hoping to profit — if the price falls, he simply loses, possibly more than his margin.'
    },
    checklist: {
      explorer: ['that Lin has wheat to protect', 'that Sam has no wheat', 'that Sam could lose'],
      analyst: ['each trader’s motive', 'that the hedger reduces existing risk', 'that the speculator takes on risk and can lose']
    }
  },
  {
    id: 'tl-w2-mistake-dev-hedge',
    world: 2, lesson: 'w2l3', skill: 'hedgers-speculators', type: 'mistake-detective',
    title: 'Mistake Detective: Dev’s “bad” hedge',
    scenario: {
      explorer: 'Farmer Grace made a deal to sell her pretend wheat for $5 a bag later. Then the price went up to $6. Dev says: "Grace’s deal was a total mistake. She lost money, so hedging is just bad luck gambling."',
      analyst: 'Farmer Grace hedged by selling pretend wheat futures at $5. The price rose to $6, so her futures position lost $1 per bag — but she sold her real crop for $6. Dev says: "The hedge lost money, so it was a mistake. Hedging is just gambling."'
    },
    question: 'What is the mistake in Dev’s thinking?',
    choices: [
      { id: 'a', text: { explorer: 'A hedge is for protection, not for winning. Grace knew her price ahead of time.', analyst: 'A hedge’s job is to reduce risk, not to profit: the futures loss was offset by the higher price for her real crop.' }, correct: true, feedback: { explorer: 'You found it! Grace gave up the chance of a higher price to be safe from a lower one. That’s protection, not gambling.', analyst: 'Exactly. Crop at $6 minus a $1 futures loss ≈ the $5 she planned on. The hedge did its job: it removed the surprise.' } },
      { id: 'b', text: { explorer: 'There is no mistake.', analyst: 'There is no mistake; any hedge that loses money was a bad decision.' }, feedback: { explorer: 'Think about why Grace made the deal. Was she trying to win, or to be safe?', analyst: 'Judge the hedge by its purpose. What was Grace trying to avoid?' } },
      { id: 'c', text: { explorer: 'Dev is right, but Grace should have waited longer.', analyst: 'Dev is right; Grace should have held the position longer to win it back.' }, feedback: { explorer: 'Nobody knows if waiting would help. Look at what the deal was for.', analyst: 'Waiting doesn’t guarantee anything. Look at her whole position, not just the futures part.' } }
    ],
    explainPrompt: { explorer: 'Explain to Dev what Grace’s deal was for.', analyst: 'Show Dev Grace’s whole position with numbers, and explain how a hedger and a speculator differ.' },
    referenceAnswer: {
      explorer: 'Grace wanted to know her price ahead of time, so a price drop could not hurt her. When the price went up she missed out a little, but she was protected. That is hedging, not gambling.',
      analyst: 'Grace’s crop sold for $6 per bag and her futures lost $1, so she ended near her planned $5. A hedger accepts missing some upside in exchange for less risk. A speculator with the same futures loss and no crop would simply have lost $1 per bag.'
    },
    checklist: {
      explorer: ['what the deal protected Grace from', 'that she missed a higher price', 'why that is not gambling'],
      analyst: ['the crop gain and futures loss together', 'the purpose of a hedge', 'how a speculator’s result would differ']
    }
  },
  {
    id: 'tl-w2-speculator-risk',
    world: 2, lesson: 'w2l3', skill: 'hedgers-speculators', type: 'compare',
    title: 'When the price goes the wrong way',
    scenario: {
      explorer: 'Farmer Lin and Sam both made pretend wheat deals that lose $1 a bag when the price goes up. Then the price goes up. Lin grows wheat. Sam does not.',
      analyst: 'Lin (a farmer with a crop) and Sam (no crop) each hold a short pretend wheat futures position. The price rises $1 per bag, so each futures position loses $1 per bag.'
    },
    question: { explorer: 'Who is hurt more by the price going up?', analyst: 'Whose overall position is hurt more by the rise?' },
    choices: [
      { id: 'a', text: { explorer: 'Sam — he has no wheat to sell for the higher price, so his loss is a real loss.', analyst: 'Sam — nothing offsets his futures loss, so it is a straight loss (and it could exceed his margin).' }, correct: true, feedback: { explorer: 'Yes! Lin can sell her real wheat for more, which makes up for her deal. Sam has nothing to make up for it.', analyst: 'Right. Lin’s crop rose in value and offsets her futures loss. Sam took on risk with no offset, so the [[speculator]] bears the full loss — and futures losses can be bigger than the [[margin]] deposit.' } },
      { id: 'b', text: { explorer: 'Lin — farmers always lose.', analyst: 'Lin — hedgers always end up worse off.' }, feedback: { explorer: 'Lin’s wheat is worth more now. Does that help her?', analyst: 'Count Lin’s crop too. Does its value change when the price rises?' } },
      { id: 'c', text: { explorer: 'They are hurt exactly the same.', analyst: 'Both are hurt equally, since the futures losses are equal.' }, feedback: { explorer: 'Their deals lose the same. But does one of them have something else that gained?', analyst: 'The futures losses match, but their whole positions don’t. What else does Lin own?' } }
    ],
    explainPrompt: { explorer: 'Explain why the same price move feels different for Lin and Sam.', analyst: 'Compare the two traders’ whole positions after the rise.' },
    referenceAnswer: {
      explorer: 'Lin loses on her deal, but she sells her real wheat for more money, so it evens out. Sam has no wheat, so he just loses. Speculating means taking a risk.',
      analyst: 'Lin: futures −$1 per bag, crop +$1 per bag → roughly even, which is the point of a hedge. Sam: futures −$1 per bag with nothing to offset it. Speculators accept that risk hoping for gains, and their losses can exceed their margin deposit.'
    },
    checklist: {
      explorer: ['Lin’s real wheat', 'that Sam has nothing to make up the loss', 'that speculating is risky'],
      analyst: ['both parts of Lin’s position', 'Sam’s unhedged loss', 'that losses can exceed margin']
    }
  },

  // ------------------------------------------------------------- World 2, Lesson 4 (batch 2)
  {
    id: 'tl-w2-close-out',
    world: 2, lesson: 'w2l4', skill: 'offset-delivery', type: 'explain',
    title: 'Jordan doesn’t want a truck of corn',
    scenario: {
      explorer: 'Jordan bought one pretend corn contract to practice. Uh-oh — if he keeps it until the end, a pretend truck could bring him 100 bags of corn! He does not want any corn.',
      analyst: 'Jordan is long one pretend corn [[futures-contract|futures contract]] (100 bags). He has no use for corn and does not want to take [[delivery]].'
    },
    question: { explorer: 'What can Jordan do?', analyst: 'How does Jordan avoid delivery?' },
    choices: [
      { id: 'a', text: { explorer: 'Sell the same kind of contract before the end. That closes it out.', analyst: 'Sell one identical contract before delivery — an opposite, offsetting trade that closes the position.' }, correct: true, feedback: { explorer: 'Yes! Selling the same contract cancels his buy. Most people close out this way.', analyst: 'Correct. An [[offset]] (the opposite trade in the same contract) closes the position. Most futures positions are closed this way, not delivered.' } },
      { id: 'b', text: { explorer: 'Throw the contract away and forget about it.', analyst: 'Ignore it; contracts expire without consequences.' }, feedback: { explorer: 'A contract is a promise. Ignoring it does not make it go away.', analyst: 'An open position still carries its obligations at expiry. How do you cancel it?' } },
      { id: 'c', text: { explorer: 'Buy another contract.', analyst: 'Buy a second contract to cancel the first.' }, feedback: { explorer: 'That would make it 200 bags! He needs the opposite of buying.', analyst: 'Buying again doubles the position. Which trade is the opposite of buying?' } }
    ],
    explainPrompt: { explorer: 'Explain how selling closes Jordan’s contract.', analyst: 'Explain offsetting, and what Jordan’s gain or loss depends on.' },
    referenceAnswer: {
      explorer: 'Jordan bought one contract, so he sells one of the same contract. Buying one and selling one cancels out, so no corn arrives. He might gain or lose a little depending on the prices.',
      analyst: 'Jordan sells one identical contract before delivery. The buy and sell offset, so the position is closed and no corn is delivered. His result is (sell price − buy price) × 100 bags, which can be a gain or a loss.'
    },
    checklist: {
      explorer: ['selling the same contract', 'that it cancels the buy', 'that he can still gain or lose'],
      analyst: ['the offsetting trade', 'why delivery is avoided', 'how the result is calculated']
    }
  },
  {
    id: 'tl-w2-mistake-kai-offset',
    world: 2, lesson: 'w2l4', skill: 'offset-delivery', type: 'mistake-detective',
    title: 'Mistake Detective: Kai’s magic exit',
    scenario: {
      explorer: 'Kai bought a pretend oats contract at $4.00 a bag (100 bags). The price fell to $3.70. Kai says: "No problem! When I close out, my loss disappears and I get my whole deposit back."',
      analyst: 'Kai is long one pretend oats contract (100 bags) from $4.00. The price is now $3.70. Kai says: "Closing out with an opposite trade erases the loss, so I’ll get my whole margin back."'
    },
    question: 'What is the mistake in Kai’s thinking?',
    choices: [
      { id: 'a', text: { explorer: 'Closing out makes the loss final: ($3.70 − $4.00) × 100 = −$30.', analyst: 'Offsetting locks in the result: ($3.70 − $4.00) × 100 = −$30, taken from the margin (and a loss can exceed margin).' }, correct: true, feedback: { explorer: 'You found it! Closing out stops the contract, but it does not erase the loss. Kai loses $30.', analyst: 'Exactly. The offset ends the position at the current price, turning the paper loss into a realized −$30.' } },
      { id: 'b', text: { explorer: 'There is no mistake.', analyst: 'There is no mistake; offsetting cancels gains and losses.' }, feedback: { explorer: 'Try the math: he bought at $4.00 and sells at $3.70. Is that zero?', analyst: 'Work out (sell − buy) × quantity. Is it zero?' } },
      { id: 'c', text: { explorer: 'Kai should take the 100 bags of oats instead.', analyst: 'Kai should take delivery to avoid the loss.' }, feedback: { explorer: 'Taking the oats doesn’t make them worth $4.00 again. Focus on the money.', analyst: 'Delivery doesn’t restore the old price. The loss is already there.' } }
    ],
    explainPrompt: { explorer: 'Show Kai the math for closing out.', analyst: 'Show Kai the offset math and explain what closing out does and doesn’t do.' },
    referenceAnswer: {
      explorer: 'Kai bought at $4.00 and sells at $3.70. That is 30 cents less for each of 100 bags, so he loses $30. Closing out stops more gain or loss, but it doesn’t make the $30 go away.',
      analyst: 'Offset: sell at $3.70 vs buy at $4.00 → −$0.30 × 100 = −$30. Closing out ends future risk on the position but makes the current loss final. The $30 comes out of his margin — and if the price had fallen further, the loss could have been more than the margin.'
    },
    checklist: {
      explorer: ['the subtraction', 'times 100 bags', 'that closing out does not erase a loss'],
      analyst: ['the offset calculation', 'that the loss becomes final', 'that losses can exceed margin']
    }
  },

  // ------------------------------------------------------------- World 4, Lesson 1 (batch 2)
  {
    id: 'tl-w4-read-line',
    world: 4, lesson: 'w4l1', skill: 'line-chart-reading', type: 'explain',
    title: 'Reading the pear chart',
    scenario: {
      explorer: 'This [[line-chart|line chart]] shows the pretend price of a crate of pears for five days.',
      analyst: 'The [[line-chart|line chart]] shows a pretend price per crate of pears at the end of each of five days.'
    },
    visual: { kind: 'line', title: 'Pretend pear price (per crate)', unit: '$', points: [{ label: 'Day 1', value: 3.2 }, { label: 'Day 2', value: 3.5 }, { label: 'Day 3', value: 3.4 }, { label: 'Day 4', value: 3.8 }, { label: 'Day 5', value: 3.6 }] },
    question: { explorer: 'Which sentence reads the chart correctly?', analyst: 'Which statement is an accurate reading of the chart?' },
    choices: [
      { id: 'a', text: 'The highest price was on Day 4 ($3.80), and from Day 1 to Day 5 the price rose $0.40.', correct: true, feedback: { explorer: 'Yes! The highest point is Day 4. And $3.60 − $3.20 = $0.40.', analyst: 'Correct: the peak is Day 4 at $3.80, and the overall change is $3.60 − $3.20 = +$0.40.' } },
      { id: 'b', text: 'The highest price was on Day 5, because it is the last day.', feedback: { explorer: 'The last point is not always the highest. Find the point closest to the top.', analyst: 'Position on the x-axis is time, not size. Which point is highest on the y-axis?' } },
      { id: 'c', text: 'The price went up every single day.', feedback: { explorer: 'Look at Day 3 and Day 5. Did the line go up there?', analyst: 'Check each step: Day 2→3 and Day 4→5 both slope down.' } }
    ],
    explainPrompt: { explorer: 'Explain how you found the highest price and the change.', analyst: 'Explain how you read the high, the overall change, and the down days.' },
    referenceAnswer: {
      explorer: 'The highest dot is Day 4 at $3.80. Day 1 was $3.20 and Day 5 was $3.60, so the price went up $0.40. It went down on Day 3 and Day 5.',
      analyst: 'The peak is Day 4 ($3.80). Overall change = last − first = $3.60 − $3.20 = +$0.40. The overall [[trend]] was up, but two of the four steps were down.'
    },
    checklist: {
      explorer: ['the highest day and price', 'the change from Day 1 to Day 5', 'a day the price went down'],
      analyst: ['the high', 'last − first', 'that an upward trend can include down days']
    }
  },
  {
    id: 'tl-w4-missing-why-line',
    world: 4, lesson: 'w4l1', skill: 'line-chart-reading', type: 'missing-info',
    title: 'What the line doesn’t say',
    scenario: {
      explorer: 'Mo looks at this chart of pretend lemon prices. He says: "The price jumped on Day 3! I know exactly why, and I know it will keep going up."',
      analyst: 'Mo reads the chart below and claims he knows both why the pretend lemon price jumped on Day 3 and that it will keep rising.'
    },
    visual: { kind: 'line', title: 'Pretend lemon price (per bag)', unit: '$', points: [{ label: 'Day 1', value: 2.0 }, { label: 'Day 2', value: 2.05 }, { label: 'Day 3', value: 2.6 }, { label: 'Day 4', value: 2.55 }] },
    question: { explorer: 'What information is missing from the chart?', analyst: 'What would Mo need that the chart cannot show him?' },
    choices: [
      { id: 'a', text: { explorer: 'Why the price jumped — like news about a storm or more buyers.', analyst: 'The reason for the jump (news about supply or demand) — a line chart shows WHAT happened, not WHY.' }, correct: true, feedback: { explorer: 'Yes! The chart shows the jump, but not the reason. You would need the news.', analyst: 'Right. The chart records prices only. Causes come from other information, and even then the next move is uncertain.' } },
      { id: 'b', text: { explorer: 'The price on Day 3.', analyst: 'The Day 3 price.' }, feedback: { explorer: 'The chart does show Day 3: $2.60. What does it NOT show?', analyst: 'That value is on the chart. What isn’t?' } },
      { id: 'c', text: { explorer: 'Nothing is missing. The chart tells the whole story.', analyst: 'Nothing; the chart contains everything needed.' }, feedback: { explorer: 'Can a line tell you what made it move?', analyst: 'Does a price line contain the news, or only the prices?' } }
    ],
    explainPrompt: { explorer: 'What would you want to find out before explaining the jump?', analyst: 'List what you would need to know, and say whether any of it could tell you Day 5 for sure.' },
    referenceAnswer: {
      explorer: 'I would want the news from Day 3, like a lemon storm or lots of new buyers. Even then, I couldn’t know for sure what happens next.',
      analyst: 'I’d need the news around Day 3 — supply problems, new demand — and how big it was. Even with that, no information guarantees Day 5; the chart only records the past.'
    },
    checklist: {
      explorer: ['that the chart doesn’t show why', 'what news I would look for', 'that the future is still uncertain'],
      analyst: ['what vs why', 'specific missing information', 'that nothing guarantees the next price']
    }
  },

  // ------------------------------------------------------------- World 4, Lesson 2 (batch 2)
  {
    id: 'tl-w4-read-candle',
    world: 4, lesson: 'w4l2', skill: 'candlestick-reading', type: 'explain',
    title: 'One candle, four prices',
    scenario: {
      explorer: 'A [[candlestick]] shows four prices for one day: where the price started (open), its highest, its lowest, and where it ended (close).',
      analyst: 'Each [[candlestick]] packs one day’s [[ohlc|open, high, low and close]] into one shape. The body spans open to close; the thin lines reach the high and the low.'
    },
    visual: { kind: 'candles', title: 'Pretend cocoa — one day', unit: '$', candles: [{ label: 'Day 1', open: 4.0, high: 4.6, low: 3.8, close: 4.4 }] },
    question: { explorer: 'What does this candle tell you?', analyst: 'Which reading of this candle is correct?' },
    choices: [
      { id: 'a', text: 'It opened at $4.00 and closed higher at $4.40. The high was $4.60 and the low was $3.80.', correct: true, feedback: { explorer: 'Yes! It is an up candle (hollow, with ▲): it closed higher than it opened.', analyst: 'Correct. Close > open makes it an up candle; the thin lines show the high ($4.60) and low ($3.80).' } },
      { id: 'b', text: 'It opened at $4.40 and closed at $4.00, so it went down.', feedback: { explorer: 'Check the ▲ and the hollow body. Did it end higher or lower than it started?', analyst: 'Open and close are swapped. A hollow body with ▲ means close was above open.' } },
      { id: 'c', text: 'It closed at $4.60, the highest price of the day.', feedback: { explorer: '$4.60 is the tip of the thin line on top. Is that where the day ended?', analyst: 'The top of the upper line is the high, not the close.' } }
    ],
    explainPrompt: { explorer: 'Explain how you can tell the candle went up.', analyst: 'Explain how to read all four prices and the direction from the candle.' },
    referenceAnswer: {
      explorer: 'The body is hollow and has a ▲, so it is an up candle: it started at $4.00 and ended at $4.40. The top of the thin line is the highest price, $4.60, and the bottom is the lowest, $3.80.',
      analyst: 'Up candle (hollow, ▲): open $4.00 at the bottom of the body, close $4.40 at the top. The upper line reaches the high, $4.60; the lower line reaches the low, $3.80. Change for the day: +$0.40.'
    },
    checklist: {
      explorer: ['open and close', 'high and low', 'how I knew it was an up candle (not just the color)'],
      analyst: ['all four OHLC prices', 'direction from open vs close', 'the day’s change']
    }
  },
  {
    id: 'tl-w4-mistake-ana-candle',
    world: 4, lesson: 'w4l2', skill: 'candlestick-reading', type: 'mistake-detective',
    title: 'Mistake Detective: Ana’s candle',
    scenario: {
      explorer: 'Ana looks at this down candle. She says: "The top of the box is always the close. So this day closed at $6.50."',
      analyst: 'Ana reads the down candle below: "The top of the body is always the close, so the close was $6.50."'
    },
    visual: { kind: 'candles', title: 'Pretend sugar — one day', unit: '$', candles: [{ label: 'Day 1', open: 6.5, high: 6.7, low: 5.9, close: 6.1 }] },
    question: 'What is the mistake in Ana’s thinking?',
    choices: [
      { id: 'a', text: { explorer: 'In a down candle, the top of the box is the open. The close is the bottom: $6.10.', analyst: 'For a down candle the body’s top is the open ($6.50) and its bottom is the close ($6.10).' }, correct: true, feedback: { explorer: 'You found it! A down candle (filled, ▼) starts high and ends low, so the top is where it opened.', analyst: 'Exactly. The body always runs from open to close; which end is which depends on the direction.' } },
      { id: 'b', text: { explorer: 'There is no mistake.', analyst: 'There is no mistake; the top is always the close.' }, feedback: { explorer: 'Look at the ▼ and the filled body. Did the price end higher or lower than it started?', analyst: 'That rule only works for up candles. What does the ▼ tell you?' } },
      { id: 'c', text: { explorer: 'The close was $6.70, the very top.', analyst: 'The close is the high, $6.70.' }, feedback: { explorer: '$6.70 is the top of the thin line — the highest price, not the close.', analyst: 'The upper line marks the high, not the close.' } }
    ],
    explainPrompt: { explorer: 'Help Ana. How do you find the close on a down candle?', analyst: 'Write a rule for finding the open and close on any candle.' },
    referenceAnswer: {
      explorer: 'This candle is filled with a ▼, so the price went down. It started at the top of the box ($6.50) and ended at the bottom ($6.10).',
      analyst: 'Check direction first (▲ hollow = up, ▼ filled = down). Up: bottom of body = open, top = close. Down: top = open, bottom = close. Here open $6.50, close $6.10, change −$0.40.'
    },
    checklist: {
      explorer: ['that it is a down candle', 'where the open is', 'where the close is'],
      analyst: ['checking direction first', 'a rule for both kinds of candle', 'the correct open and close']
    }
  },

  // ------------------------------------------------------------- World 4, Lesson 3 (batch 2)
  {
    id: 'tl-w4-long-short-who',
    world: 4, lesson: 'w4l3', skill: 'long-short', type: 'predict',
    title: 'Who gains when the price rises?',
    scenario: {
      explorer: 'Tia is [[long]]: she bought a pretend contract of 100 bags at $3.00. Omar is [[short]]: he sold the same kind of contract at $3.00. Then the price rises to $3.40.',
      analyst: 'Tia is [[long]] one pretend contract (100 bags) from $3.00; Omar is [[short]] one identical contract from $3.00. The price rises to $3.40.'
    },
    question: { explorer: 'What happens to Tia and Omar?', analyst: 'What are the two pretend results?' },
    choices: [
      { id: 'a', text: 'Tia gains $40; Omar loses $40.', correct: true, feedback: { explorer: 'Yes! Long gains when the price rises: $0.40 × 100 = $40. Short loses the same amount.', analyst: 'Correct: ($3.40 − $3.00) × 100 = +$40 for the long, −$40 for the short. One side’s gain is the other side’s loss.' } },
      { id: 'b', text: 'Both gain $40, because the price went up.', feedback: { explorer: 'A rising price helps one side and hurts the other. Who sold?', analyst: 'Long and short are opposite positions. Can both gain from the same move?' } },
      { id: 'c', text: 'Omar gains $40; Tia loses $40.', feedback: { explorer: 'Swap them! Tia bought, so a rising price helps her.', analyst: 'Reversed. The short profits from a fall, not a rise.' } }
    ],
    explainPrompt: { explorer: 'Explain why the same price move is good for one and bad for the other.', analyst: 'Show the math for both sides, then say what would happen if the price fell to $2.60 instead.' },
    referenceAnswer: {
      explorer: 'Tia bought at $3.00, so when the price went up 40 cents, she gained 40 cents on each of 100 bags: $40. Omar sold, so he lost $40. If the price had gone down, it would be the other way around.',
      analyst: 'Long: (3.40 − 3.00) × 100 = +$40. Short: −$40. If the price fell to $2.60, the long would lose $40 and the short would gain $40. Neither side knew in advance which way it would go.'
    },
    checklist: {
      explorer: ['who gains and who loses', 'the 40 cents × 100 math', 'what happens if the price falls'],
      analyst: ['both calculations', 'the falling-price case', 'that nobody knew the direction in advance']
    }
  },
  {
    id: 'tl-w4-mistake-rio-short',
    world: 4, lesson: 'w4l3', skill: 'long-short', type: 'mistake-detective',
    title: 'Mistake Detective: Rio’s “safe” short',
    scenario: {
      explorer: 'Rio says: "Selling [[short]] is super safe. A price can only fall to zero, so I can’t lose much!"',
      analyst: 'Rio argues: "Going [[short]] is the safer side. Prices can only fall to zero, so my losses are capped and small."'
    },
    question: 'What is the mistake in Rio’s thinking?',
    choices: [
      { id: 'a', text: { explorer: 'A short LOSES when the price goes UP, and a price can keep going up and up.', analyst: 'A short loses when the price rises, and there is no ceiling on a rise — losses can grow past the margin deposit.' }, correct: true, feedback: { explorer: 'You found it! Zero is how far a price can FALL. A short is hurt by rises, and rises have no top.', analyst: 'Exactly. The zero floor limits a short’s GAIN, not its loss. Rising prices have no cap, so short losses can exceed the [[margin]].' } },
      { id: 'b', text: { explorer: 'There is no mistake.', analyst: 'There is no mistake; shorts have small, capped losses.' }, feedback: { explorer: 'Which way does the price have to move for a short to lose?', analyst: 'Check which direction hurts a short — and whether that direction has a limit.' } },
      { id: 'c', text: { explorer: 'Rio’s only mistake is that prices can go below zero.', analyst: 'The mistake is that prices can go negative.' }, feedback: { explorer: 'That isn’t the big problem. Think about what happens to a short when the price rises.', analyst: 'That’s not the key flaw. Which move causes a short to lose?' } }
    ],
    explainPrompt: { explorer: 'Explain to Rio how a short can lose a lot.', analyst: 'Give Rio a numeric example where a short loses more than the margin deposit.' },
    referenceAnswer: {
      explorer: 'If Rio sells short at $5 and the price goes up to $8, he loses $3 on every bag. The price could go even higher. Being short is not "safe" — both sides can lose.',
      analyst: 'Short 100 bags at $8.00 with a $60 pretend margin; the price rises to $8.95. Loss = (8.95 − 8.00) × 100 = $95, more than the $60 margin. Zero only limits how much a short can gain.'
    },
    checklist: {
      explorer: ['that a short loses when the price rises', 'that prices can keep rising', 'that neither side is safe'],
      analyst: ['which move hurts a short', 'a numeric example', 'a loss larger than margin']
    }
  },

  // ------------------------------------------------------------- World 4, Lesson 4 (batch 2)
  {
    id: 'tl-w4-streak-next',
    world: 4, lesson: 'w4l4', skill: 'chart-limits', type: 'uncertainty',
    title: 'Five up days. What’s next?',
    scenario: {
      explorer: 'Pretend rice went up five days in a row. Your friend says: "Day 6 HAS to go up too. Look at the line!"',
      analyst: 'The pretend rice price has risen for five straight days. A classmate says the [[trend]] proves Day 6 will be higher.'
    },
    visual: { kind: 'line', title: 'Pretend rice price (per bag)', unit: '$', points: [{ label: 'Start', value: 5.0 }, { label: 'Day 1', value: 5.1 }, { label: 'Day 2', value: 5.2 }, { label: 'Day 3', value: 5.3 }, { label: 'Day 4', value: 5.4 }, { label: 'Day 5', value: 5.5 }] },
    question: { explorer: 'What is the most honest thing to say about Day 6?', analyst: 'What can you honestly conclude about Day 6?' },
    choices: [
      { id: 'a', text: { explorer: 'I can’t be sure. Past days don’t decide the next day.', analyst: 'Nobody can know; past moves cannot guarantee the next one.' }, correct: true, feedback: { explorer: 'Yes! A chart shows what already happened. Day 6 could go up, down, or stay the same.', analyst: 'Right. A streak describes the past. It is not evidence that guarantees the next price.' } },
      { id: 'b', text: { explorer: 'It will go up for sure.', analyst: 'It will definitely rise; the trend proves it.' }, feedback: { explorer: 'Five ups feel like a promise, but are they? In the Market Lab Pattern Trap, a streak like this broke.', analyst: 'A trend describes the past; it doesn’t prove the future. Streaks can end without warning.' } },
      { id: 'c', text: { explorer: 'It will go down for sure, because it went up too much.', analyst: 'It must fall, because it has risen too long.' }, feedback: { explorer: 'That’s a prediction too! Can anyone be sure it will go down?', analyst: '“Due for a drop” is the same mistake in reverse. Can the chart guarantee a fall?' } }
    ],
    explainPrompt: { explorer: 'Explain why "five ups" is not a promise.', analyst: 'Explain what the chart can and cannot tell you about Day 6.' },
    referenceAnswer: {
      explorer: 'The chart shows five days that already happened. Nothing on it makes Day 6 go up. New news, like a big harvest, could change everything. I can’t be sure.',
      analyst: 'The chart tells me the price rose for five days. It can’t tell me why, or whether the reason still holds. Past moves cannot guarantee the next one, so the honest answer is uncertainty — and a plan for being wrong.'
    },
    checklist: {
      explorer: ['that the chart shows the past', 'something that could change the price', 'that I can’t be sure'],
      analyst: ['what the chart shows', 'what it cannot show', 'why a streak is not a guarantee']
    }
  },
  {
    id: 'tl-w4-missing-chart-news',
    world: 4, lesson: 'w4l4', skill: 'chart-limits', type: 'missing-info',
    title: 'The big down candle',
    scenario: {
      explorer: 'These candles show pretend juice prices. On Day 3 there is a big down candle. Lee says: "The chart tells me everything I need."',
      analyst: 'These candles show four days of a pretend juice price, with a large down candle on Day 3. Lee says the chart alone tells him everything he needs to decide what to do next.'
    },
    visual: { kind: 'candles', title: 'Pretend juice price (per gallon)', unit: '$', candles: [{ label: 'Day 1', open: 3.0, high: 3.08, low: 2.98, close: 3.05 }, { label: 'Day 2', open: 3.05, high: 3.12, low: 3.03, close: 3.1 }, { label: 'Day 3', open: 2.6, high: 2.64, low: 2.52, close: 2.55 }, { label: 'Day 4', open: 2.55, high: 2.58, low: 2.47, close: 2.5 }] },
    question: { explorer: 'What important information is NOT on the chart?', analyst: 'Which important information does the chart leave out?' },
    choices: [
      { id: 'a', text: { explorer: 'Why the price fell, and what will happen next.', analyst: 'The cause of the drop and whether that cause is still going on — and no chart can show the next price.' }, correct: true, feedback: { explorer: 'Yes! The chart shows THAT it fell, not WHY. And it can’t show tomorrow.', analyst: 'Right. Prices are the result of information the chart doesn’t include, and the next price is unknown.' } },
      { id: 'b', text: { explorer: 'The Day 3 prices.', analyst: 'The open, high, low and close for Day 3.' }, feedback: { explorer: 'Those are on the chart. What isn’t?', analyst: 'The OHLC data is shown. What is missing?' } },
      { id: 'c', text: { explorer: 'Nothing — Lee is right.', analyst: 'Nothing; the chart is enough to decide.' }, feedback: { explorer: 'Can a candle tell you the news?', analyst: 'Does the chart contain the reason for the drop, or the future?' } }
    ],
    explainPrompt: { explorer: 'What would you want to know before deciding anything?', analyst: 'List the missing information and explain why waiting can be a sensible choice.' },
    referenceAnswer: {
      explorer: 'I would want to know why the price fell on Day 3 — maybe there was news about lots more juice. Even then I couldn’t be sure what happens next, so waiting is okay.',
      analyst: 'Missing: the news behind the Day 3 gap down (e.g. a bigger-than-expected harvest), whether that news is still changing, and how big it is. Even with that, the next price is uncertain. Waiting until I understand more is a valid choice.'
    },
    checklist: {
      explorer: ['that the chart doesn’t say why', 'that it can’t show the future', 'that waiting is okay'],
      analyst: ['the missing cause', 'that the next price is unknown', 'that waiting is a valid decision']
    }
  }
];

export function promptById(id) {
  return THINKING_PROMPTS.find((p) => p.id === id) || null;
}
