// Market Minds — lesson content (CURRICULUM DATA ONLY: no DOM, no scoring, no engine/ui imports).
// Owner: Agent 1 (Curriculum Architect). Sources and accuracy notes: docs/curriculum/SOURCES.md.
//
// All prices in lessons are PRETEND / hypothetical numbers made up for learning. They are not real
// market prices, forecasts or advice.
//
// ── Shapes ─────────────────────────────────────────────────────────────────────────────────────
// BandValue<T> = T (shared by both bands) | { explorer: T, analyst: T }
//   explorer = Grades 3–5 (short paragraphs, simple words, whole-number prices)
//   analyst  = Grades 6–8 (richer passages, more vocabulary, decimals/percentages, multi-step)
//   Read with pick(value, band) from ./band.js.
//
// Lesson = {
//   id, world: number, number: number, title, status: 'ready'|'planned',
//   skills: [skillId], prereqs: [skillId], vocab: [glossaryId],
//   objectives: BandValue<string[]>, minutes: BandValue<number>, steps: Step[6]
// }
// A 'planned' lesson has skills: [], steps: [] and is listed as "In development".
//
// Steps of a ready lesson are ALWAYS exactly these six, in this order:
//   1 { kind:'discover',   title, text: BandValue<string[]>, image: { asset, alt, caption } }
//   2 { kind:'definition', title, term: glossaryId, text: BandValue<string[]>, keyIdea: BandValue<string> }
//   3 { kind:'visual',     title, text: BandValue<string[]>, visual: BandValue<VisualSpec>, caption: BandValue<string> }
//   4 { kind:'together',   title, intro: BandValue<string>, visual?: BandValue<VisualSpec>,
//                          steps: BandValue<[{ prompt, choices: [{ id, text, correct: boolean, coach }] }]> }
//        (2–3 guided mini-questions; exactly one correct choice each; every choice has a coach message)
//   5 { kind:'check',      title, question: BandValue<Question> }   (Question: see docs/ARCHITECTURE.md)
//   6 { kind:'next',       title, text: BandValue<string>, practiceSkills: [skillId] }
//
// VisualSpec kinds (rendered by js/ui/visuals.js): line, bars, candles, priceTags, supplyDemand,
// agreement, image. Image assets do not exist yet: see docs/ASSET-MANIFEST.md.
//
// Tap-a-word markup inside any text/prompt: [[glossaryId]] or [[glossaryId|shown words]].
// Every id used must exist in ./glossary.js (checked by tests/unit/content.test.mjs).

const W1L1 = {
  id: 'w1l1',
  world: 1,
  number: 1,
  title: 'What Is a Market?',
  status: 'ready',
  skills: ['market-basics', 'buyers-sellers'],
  prereqs: [],
  vocab: ['market', 'buyer', 'seller', 'trade', 'price', 'goods', 'services'],
  objectives: {
    explorer: [
      'Say what a market is in my own words.',
      'Point out the buyer and the seller in a trade.',
      'Tell what the buyer wants and what the seller wants.'
    ],
    analyst: [
      'Define a market as any place or system where buyers and sellers trade.',
      'Identify buyers, sellers, goods and services in everyday and online examples.',
      'Explain why a trade happens only when both the buyer and the seller agree to the price.'
    ]
  },
  minutes: { explorer: 12, analyst: 15 },
  steps: [
    {
      kind: 'discover',
      title: 'Saturday at the Farmers Market',
      text: {
        explorer: [
          'Every Saturday, Amara and her Grandma Ruth walk to the farmers market. Tables are full of peaches, greens, sweet potatoes and fresh bread.',
          'Amara has $5 from helping at home. She stops at Mr. Okafor\'s table. His peaches cost $1 each.',
          'Amara gives Mr. Okafor $3, and he gives her 3 peaches. Both of them smile. Amara got peaches, and Mr. Okafor got money for his hard work.',
          'Grandma Ruth says, "What just happened is the heart of every [[market]]."'
        ],
        analyst: [
          'Every Saturday morning, Amara and her Grandma Ruth walk to the neighborhood farmers market. Local farmers, bakers and makers set up tables of peaches, collard greens, sweet potatoes, bread and handmade soap.',
          'Amara has $5 she earned helping at home. At Mr. Okafor\'s table, a sign says peaches cost $1.25 each. She decides 2 peaches are worth it to her and pays $2.50.',
          'Nobody forced the trade. Amara valued the peaches more than the $2.50, and Mr. Okafor valued the $2.50 more than keeping two peaches. When both sides say yes, a trade happens.',
          'Grandma Ruth points around the busy market: "Every one of these tables is part of a [[market]]. So is the shoe website your cousin uses. Let\'s figure out why."'
        ]
      },
      image: {
        asset: 'assets/illustrations/w1l1-farmers-market.webp',
        alt: 'A girl and her grandmother at an outdoor farmers market buying peaches from a smiling farmer at his table.',
        caption: 'Amara and Grandma Ruth buy peaches from Mr. Okafor.'
      }
    },
    {
      kind: 'definition',
      title: 'What Is a Market?',
      term: 'market',
      text: {
        explorer: [
          'A [[market]] is any place or way that [[buyer|buyers]] and [[seller|sellers]] come together to [[trade]].',
          'The buyer gives money to get something. The seller gives something to get money.',
          'A market does not need a building. A lemonade stand, a store, or a website can all be markets.'
        ],
        analyst: [
          'A [[market]] is any place or system where [[buyer|buyers]] and [[seller|sellers]] meet to [[trade]] [[goods]] (things you can touch) or [[services]] (work someone does for you).',
          'A buyer gives up money to get something they want. A seller gives up a good or service to get money. The [[price]] is the amount of money they agree on.',
          'Markets can be physical, like a farmers market or grocery store, or digital, like a website or app where people buy and sell. What makes it a market is the trading, not the building.'
        ]
      },
      keyIdea: {
        explorer: 'A market is anywhere buyers and sellers trade.',
        analyst: 'A market is any place or system where buyers and sellers trade, and a trade only happens when both agree on the price.'
      }
    },
    {
      kind: 'visual',
      title: 'Prices at the Market',
      text: {
        explorer: [
          'Each seller puts a [[price]] on what they sell. Look at the price tags at the farmers market.',
          'A buyer looks at the price and decides, "Is it worth it to me?"'
        ],
        analyst: [
          'Sellers post a [[price]] for each item. Buyers compare prices and decide what is worth their money.',
          'Notice that some tables sell [[goods]] and one sells a [[services|service]]. Both are part of the market.'
        ]
      },
      visual: {
        explorer: {
          kind: 'priceTags',
          title: 'Farmers market price tags (pretend prices)',
          items: [
            { label: 'Peach', price: 1, note: 'Mr. Okafor' },
            { label: 'Bunch of greens', price: 3 },
            { label: 'Loaf of bread', price: 5 },
            { label: 'Sweet potato', price: 2 }
          ]
        },
        analyst: {
          kind: 'priceTags',
          title: 'Farmers market price tags (pretend prices)',
          items: [
            { label: 'Peach', price: 1.25, note: 'Mr. Okafor (good)' },
            { label: 'Bunch of collard greens', price: 3.5, note: 'good' },
            { label: 'Loaf of bread', price: 5.75, note: 'good' },
            { label: 'Knife sharpening', price: 4, note: 'service' }
          ]
        }
      },
      caption: {
        explorer: 'Every table has a seller and a price. Shoppers are the buyers.',
        analyst: 'Goods and services both have prices. A trade happens only when a buyer agrees to pay the price.'
      }
    },
    {
      kind: 'together',
      title: 'Let\'s Try It Together',
      intro: {
        explorer: 'Think about Amara buying peaches from Mr. Okafor. Answer one question at a time.',
        analyst: 'Use Amara\'s trade and the price tags to think through each question.'
      },
      steps: {
        explorer: [
          {
            prompt: 'Amara pays Mr. Okafor $3 for 3 peaches. Who is the [[buyer]]?',
            choices: [
              { id: 'a', text: 'Amara', correct: true, coach: 'Yes! Amara gives money to get peaches, so she is the buyer.' },
              { id: 'b', text: 'Mr. Okafor', correct: false, coach: 'Mr. Okafor gets the money and gives away peaches. Who gave the money?' },
              { id: 'c', text: 'The peaches', correct: false, coach: 'The peaches are the thing being traded, not a person. Who handed over money?' }
            ]
          },
          {
            prompt: 'What does Mr. Okafor, the [[seller]], want from the trade?',
            choices: [
              { id: 'a', text: 'More peaches', correct: false, coach: 'He already has lots of peaches to sell. What does he get back from Amara?' },
              { id: 'b', text: 'Money for his peaches', correct: true, coach: 'Right! The seller gives goods and wants money in return.' },
              { id: 'c', text: 'Nothing at all', correct: false, coach: 'Sellers trade for a reason. Think about what Amara handed him.' }
            ]
          },
          {
            prompt: 'Jaylen sells cups of lemonade from a table in front of his house. Neighbors buy them. Is that a [[market]]?',
            choices: [
              { id: 'a', text: 'No, a market has to be a big store.', correct: false, coach: 'Markets come in all sizes. Is someone selling, and is someone buying?' },
              { id: 'b', text: 'Yes, a buyer and a seller trade there.', correct: true, coach: 'Yes! Anywhere buyers and sellers trade is a market, even a small lemonade stand.' }
            ]
          }
        ],
        analyst: [
          {
            prompt: 'Amara pays $2.50 for 2 peaches. Which sentence describes the trade correctly?',
            choices: [
              { id: 'a', text: 'Amara is the seller because she chose the peaches.', correct: false, coach: 'Choosing is something buyers do too. Who gave up money in this trade?' },
              { id: 'b', text: 'Amara is the buyer, Mr. Okafor is the seller, and the peaches are goods.', correct: true, coach: 'Exactly. The buyer gives money, the seller gives goods, and both agreed to $1.25 each.' },
              { id: 'c', text: 'Grandma Ruth is the buyer because she is the adult.', correct: false, coach: 'Age does not decide who the buyer is. Who actually paid?' }
            ]
          },
          {
            prompt: 'Why did the trade happen?',
            choices: [
              { id: 'a', text: 'Both Amara and Mr. Okafor agreed the trade was worth it to them.', correct: true, coach: 'Yes. A voluntary trade happens when each side values what they get more than what they give up.' },
              { id: 'b', text: 'Mr. Okafor got to set any price and Amara had to pay it.', correct: false, coach: 'Amara could have walked away. What has to be true for both sides to say yes?' },
              { id: 'c', text: 'Markets always make the buyer win and the seller lose.', correct: false, coach: 'In a fair trade, both sides can be better off. What did each person get?' }
            ]
          },
          {
            prompt: 'Which of these is a [[market]]?',
            choices: [
              { id: 'a', text: 'A library where you borrow books for free', correct: false, coach: 'Borrowing for free is useful, but is anyone buying or selling there?' },
              { id: 'b', text: 'An app where neighbors buy and sell used bikes', correct: true, coach: 'Right. Buyers and sellers trade there, so it is a market even without a building.' },
              { id: 'c', text: 'A closet full of clothes that nobody is selling', correct: false, coach: 'Things alone do not make a market. Who are the buyers and sellers?' }
            ]
          }
        ]
      }
    },
    {
      kind: 'check',
      title: 'Check Your Understanding',
      question: {
        explorer: {
          key: 'lesson-check:w1l1:explorer',
          skill: 'market-basics',
          difficulty: 'easy',
          band: 'explorer',
          template: 'lesson-check',
          kind: 'concept',
          type: 'choice',
          prompt: 'Zuri sells bracelets to her classmates through a school craft fair website. Is this a [[market]]?',
          choices: [
            { id: 'a', text: 'Yes. Buyers and sellers trade there, even without a building.' },
            { id: 'b', text: 'No. A market has to be a building.', misconception: 'market-is-building' },
            { id: 'c', text: 'No. Only grown-ups can trade in a market.', misconception: 'adults-only' },
            { id: 'd', text: 'No. Markets only sell food.', misconception: 'food-only' }
          ],
          answer: 'a',
          hints: [
            'Think about what makes something a market. Is it the walls, or what people do there?',
            'Ask yourself: is somebody selling, and is somebody buying?'
          ],
          explanation: 'A market is any place or way that buyers and sellers trade. Zuri is selling and her classmates are buying, so the website is a market.',
          teach: 'A market is not about a building, the kind of things sold, or how old people are. Farmers markets, stores, lemonade stands and websites are all markets because buyers and sellers trade there. To spot a market, look for a buyer, a seller and a trade.',
          misconceptions: {
            'market-is-building': 'Many markets are buildings, but they do not have to be. Look for buyers and sellers trading, wherever that happens.',
            'adults-only': 'Kids can be buyers and sellers too, like at a lemonade stand. What matters is that people trade.',
            'food-only': 'Farmers markets sell food, but markets can sell bracelets, shoes, games or services too.'
          }
        },
        analyst: {
          key: 'lesson-check:w1l1:analyst',
          skill: 'market-basics',
          difficulty: 'medium',
          band: 'analyst',
          template: 'lesson-check',
          kind: 'concept',
          type: 'choice',
          prompt: 'Which situation is the best example of a [[market]]?',
          choices: [
            { id: 'a', text: 'A school library where students borrow books for free', misconception: 'no-trade' },
            { id: 'b', text: 'A website where students sell used textbooks to other students', },
            { id: 'c', text: 'A warehouse full of sneakers that are not for sale', misconception: 'goods-make-market' },
            { id: 'd', text: 'A group of friends talking about which phone is best', misconception: 'talk-is-trade' }
          ],
          answer: 'b',
          hints: [
            'A market needs more than people or things. What has to actually happen?',
            'Look for the choice where someone gives money and someone else gives a good or service.'
          ],
          explanation: 'A market is any place or system where buyers and sellers trade. On the textbook website, sellers offer books and buyers pay for them, so it is a market even though it is online.',
          teach: 'Three parts make a market: buyers, sellers and trading. A building, a pile of goods or a conversation about products is not enough. Markets can be physical (a farmers market) or digital (an app), and a trade only happens when both sides agree to the price.',
          misconceptions: {
            'no-trade': 'Borrowing for free is helpful, but no one is buying or selling, so there is no trade.',
            'goods-make-market': 'Goods sitting in storage are not being traded. A market needs buyers and sellers making trades.',
            'talk-is-trade': 'Talking about products is not trading. Is anyone buying or selling?'
          }
        }
      }
    },
    {
      kind: 'next',
      title: 'Great Work, Market Explorer!',
      text: {
        explorer: 'You learned that a market is anywhere buyers and sellers trade. Next, practice spotting buyers, sellers and markets on your own.',
        analyst: 'You can now define a market and explain why a trade needs both sides to agree. Practice identifying markets, buyers and sellers in new situations.'
      },
      practiceSkills: ['market-basics', 'buyers-sellers']
    }
  ]
};

const W1L2 = {
  id: 'w1l2',
  world: 1,
  number: 2,
  title: 'Why Prices Change',
  status: 'ready',
  skills: ['price-change-math', 'price-change-reasons'],
  prereqs: ['market-basics', 'buyers-sellers'],
  vocab: ['price', 'price-change', 'line-chart', 'harvest', 'cost'],
  objectives: {
    explorer: [
      'Find how much a price went up or down by subtracting.',
      'Read a simple line chart that shows a price over time.',
      'Give one reason a price might go up or down.'
    ],
    analyst: [
      'Calculate a price change in dollars and as a percent of the old price.',
      'Read a price-over-time line chart and describe its trend.',
      'Explain how weather, costs and how many people want something can change prices.'
    ]
  },
  minutes: { explorer: 12, analyst: 16 },
  steps: [
    {
      kind: 'discover',
      title: 'The Strawberry Surprise',
      text: {
        explorer: [
          'Deja loves strawberries. In June, she and her dad buy a box at the grocery store for $3.',
          'In November, Deja finds the same box of strawberries. Now the sign says $6!',
          '"Why did the price change?" Deja asks. Her dad says, "Let\'s be detectives and find out."'
        ],
        analyst: [
          'Deja and her dad shop at the same grocery store every week. In June, a pound of strawberries cost $2.50. By November, the same pound costs $5.00.',
          'Deja wonders whether the store is being unfair. Her dad, who manages produce deliveries for the store, explains that many things affect a [[price]]: where the food is grown, the weather, how far trucks have to drive it, and how many shoppers want it.',
          'In summer, strawberries grow on farms nearby. In late fall, they often come from farther away, which can raise the [[cost]] of getting them to the store. Deja decides to track the price and look for a pattern.'
        ]
      },
      image: {
        asset: 'assets/illustrations/w1l2-grocery-strawberries.webp',
        alt: 'A girl and her father in a grocery store produce aisle looking closely at a price sign above boxes of strawberries.',
        caption: 'Deja and her dad notice the strawberry price has changed.'
      }
    },
    {
      kind: 'definition',
      title: 'What Is a Price Change?',
      term: 'price-change',
      text: {
        explorer: [
          'A [[price-change]] is how much a [[price]] went up or down.',
          'To find it, subtract: new price minus old price. Strawberries went from $3 to $6, and 6 − 3 = 3. The price went up $3.',
          'If the new price is smaller than the old price, the price went down.'
        ],
        analyst: [
          'A [[price-change]] is the difference between a new [[price]] and an old price: change = new price − old price. A positive result means the price rose; a negative result means it fell.',
          'Strawberries went from $2.50 to $5.00, so the change is $5.00 − $2.50 = +$2.50.',
          'A [[percent-change]] compares the change to the old price: (change ÷ old price) × 100. Here, $2.50 ÷ $2.50 = 1, so the price rose 100%. Percents help compare changes between cheap and expensive items.'
        ]
      },
      keyIdea: {
        explorer: 'Price change = new price − old price. Bigger new price means it went up.',
        analyst: 'Price change = new − old. Percent change = (new − old) ÷ old × 100.'
      }
    },
    {
      kind: 'visual',
      title: 'Watching a Price Over Time',
      text: {
        explorer: [
          'Deja wrote down the strawberry price every month. A [[line-chart]] shows her prices with dots joined by a line.',
          'Months go left to right. Higher dots mean higher prices.'
        ],
        analyst: [
          'A [[line-chart]] plots a value over time. Time runs along the bottom (left to right) and price runs up the side.',
          'Look for the trend: is the line mostly rising, falling or flat? Then ask what might explain it. A chart shows what happened; it does not tell you for sure why, or what happens next.'
        ]
      },
      visual: {
        explorer: {
          kind: 'line',
          title: 'Box of strawberries (pretend prices)',
          unit: '$',
          points: [
            { label: 'Jun', value: 3 },
            { label: 'Jul', value: 3 },
            { label: 'Aug', value: 4 },
            { label: 'Sep', value: 4 },
            { label: 'Oct', value: 5 },
            { label: 'Nov', value: 6 }
          ]
        },
        analyst: {
          kind: 'line',
          title: 'Strawberries, price per pound (pretend prices)',
          unit: '$',
          points: [
            { label: 'Jun', value: 2.5 },
            { label: 'Jul', value: 2.75 },
            { label: 'Aug', value: 3.25 },
            { label: 'Sep', value: 3.5 },
            { label: 'Oct', value: 4.25 },
            { label: 'Nov', value: 5 }
          ]
        }
      },
      caption: {
        explorer: 'The line climbs from $3 in June to $6 in November.',
        analyst: 'The trend is upward from June to November: $2.50 to $5.00 per pound.'
      }
    },
    {
      kind: 'together',
      title: 'Let\'s Be Price Detectives',
      intro: {
        explorer: 'Use Deja\'s strawberry chart to answer each question.',
        analyst: 'Use the chart to calculate, then reason about why the price moved.'
      },
      steps: {
        explorer: [
          {
            prompt: 'From June to November, did the strawberry price go up or down?',
            choices: [
              { id: 'a', text: 'Up', correct: true, coach: 'Yes! The line climbs from $3 to $6.' },
              { id: 'b', text: 'Down', correct: false, coach: 'Look at where the line starts on the left and ends on the right. Is the end higher or lower?' },
              { id: 'c', text: 'It stayed the same', correct: false, coach: 'Compare the first dot and the last dot. Are they at the same height?' }
            ]
          },
          {
            prompt: 'The price went from $3 to $6. How much did it go up?',
            choices: [
              { id: 'a', text: '$9', correct: false, coach: 'That is 3 + 6. To find a change, subtract the old price from the new price.' },
              { id: 'b', text: '$3', correct: true, coach: 'Right! 6 − 3 = 3, so the price went up $3.' },
              { id: 'c', text: '$6', correct: false, coach: '$6 is the new price, not the change. How far is it from $3 to $6?' }
            ]
          },
          {
            prompt: 'Which reason could make strawberries cost more in November?',
            choices: [
              { id: 'a', text: 'They have to be trucked from far away, which costs more.', correct: true, coach: 'Good thinking! When it costs more to get something to the store, the price often goes up.' },
              { id: 'b', text: 'The store likes November better.', correct: false, coach: 'Stores do not change prices because of a favorite month. Think about where strawberries grow when it is cold.' },
              { id: 'c', text: 'Strawberries get bigger in November.', correct: false, coach: 'The box is the same. Think about what makes it harder to get strawberries in cold months.' }
            ]
          }
        ],
        analyst: [
          {
            prompt: 'What was the dollar change from June ($2.50) to November ($5.00)?',
            choices: [
              { id: 'a', text: '+$2.50', correct: true, coach: 'Correct: $5.00 − $2.50 = +$2.50. Positive means the price rose.' },
              { id: 'b', text: '+$7.50', correct: false, coach: 'That adds the prices. A change is found by subtracting old from new.' },
              { id: 'c', text: '−$2.50', correct: false, coach: 'Check the order: new − old. Is the new price bigger or smaller than the old one?' }
            ]
          },
          {
            prompt: 'From September ($3.50) to October ($4.25), what was the percent change?',
            choices: [
              { id: 'a', text: 'About 17.6%', correct: false, coach: 'That divides by the new price ($4.25). Percent change compares to the old price.' },
              { id: 'b', text: 'About 21.4%', correct: true, coach: 'Yes: $0.75 ÷ $3.50 ≈ 0.214, or about 21.4%.' },
              { id: 'c', text: '75%', correct: false, coach: '$0.75 is the change in dollars, not a percent. Divide it by the old price first.' }
            ]
          },
          {
            prompt: 'Which explanation best fits the rising trend?',
            choices: [
              { id: 'a', text: 'Nearby farms finish their season, so strawberries travel farther and fewer are available.', correct: true, coach: 'Strong reasoning. Higher transport costs and smaller nearby supply can both push prices up.' },
              { id: 'b', text: 'The chart proves the price will keep rising forever.', correct: false, coach: 'Charts show the past, not a guaranteed future. What could explain the past rise?' },
              { id: 'c', text: 'Prices always go up by the same amount each month.', correct: false, coach: 'Look again: June to July rose $0.25, but September to October rose $0.75. Are the steps equal?' }
            ]
          }
        ]
      }
    },
    {
      kind: 'check',
      title: 'Check Your Understanding',
      question: {
        explorer: {
          key: 'lesson-check:w1l2:explorer',
          skill: 'price-change-math',
          difficulty: 'easy',
          band: 'explorer',
          template: 'lesson-check',
          kind: 'math',
          type: 'choice',
          prompt: 'A notebook cost $4 last week. Today it costs $7. How did the [[price]] change?',
          choices: [
            { id: 'a', text: 'It went up $3.' },
            { id: 'b', text: 'It went up $11.', misconception: 'added-instead' },
            { id: 'c', text: 'It went down $3.', misconception: 'wrong-direction' },
            { id: 'd', text: 'It went up $7.', misconception: 'new-price-as-change' }
          ],
          answer: 'a',
          hints: [
            'Is today\'s price bigger or smaller than last week\'s? That tells you up or down.',
            'To find how much, subtract: new price minus old price.'
          ],
          explanation: 'The new price, $7, is bigger than the old price, $4, so the price went up. 7 − 4 = 3, so it went up $3.',
          teach: 'To find a price change, first decide the direction: if the new price is bigger, the price went up; if smaller, it went down. Then subtract the smaller price from the bigger one to find how much. Example: $4 to $7 is up 7 − 4 = $3.',
          misconceptions: {
            'added-instead': 'It looks like the prices were added. A change means the difference, so subtract.',
            'wrong-direction': 'The amount is right, but check the direction. Is $7 more or less than $4?',
            'new-price-as-change': '$7 is the new price. The change is how far it moved from $4.'
          }
        },
        analyst: {
          key: 'lesson-check:w1l2:analyst',
          skill: 'price-change-math',
          difficulty: 'medium',
          band: 'analyst',
          template: 'lesson-check',
          kind: 'math',
          type: 'choice',
          prompt: 'A pack of pens went from $2.50 to $3.00. What is the [[percent-change]]?',
          choices: [
            { id: 'a', text: 'Up 20%' },
            { id: 'b', text: 'Up 50%', misconception: 'cents-as-percent' },
            { id: 'c', text: 'Up about 16.7%', misconception: 'divided-by-new' },
            { id: 'd', text: 'Up 0.5%', misconception: 'dollars-as-percent' }
          ],
          answer: 'a',
          hints: [
            'Start by finding the change in dollars: new − old.',
            'Percent change compares the change to the OLD price. Divide, then multiply by 100.'
          ],
          explanation: 'The change is $3.00 − $2.50 = $0.50. Then $0.50 ÷ $2.50 = 0.20, and 0.20 × 100 = 20%. The price went up 20%.',
          teach: 'Percent change has two steps. Step 1: change = new − old. Step 2: divide the change by the old price and multiply by 100. Dividing by the old price matters because the percent tells you how big the change is compared with where the price started.',
          misconceptions: {
            'cents-as-percent': 'The change is 50 cents, but that is not 50%. Compare the $0.50 change to the $2.50 starting price.',
            'divided-by-new': 'That divides by the new price ($3.00). Percent change uses the old price as the starting point.',
            'dollars-as-percent': '$0.50 is the change in dollars. Turn it into a percent by dividing by the old price and multiplying by 100.'
          }
        }
      }
    },
    {
      kind: 'next',
      title: 'Nice Detective Work!',
      text: {
        explorer: 'You can find how much a price changed and read a price line chart. Next, practice price changes and reasons prices move.',
        analyst: 'You can calculate dollar and percent changes and explain possible reasons. Practice both, and remember: a chart shows the past, not a promise about the future.'
      },
      practiceSkills: ['price-change-math', 'price-change-reasons']
    }
  ]
};

const W1L3 = {
  id: 'w1l3',
  world: 1,
  number: 3,
  title: 'Supply and Demand',
  status: 'ready',
  skills: ['supply-demand'],
  prereqs: ['market-basics', 'price-change-reasons'],
  vocab: ['supply', 'demand', 'supply-and-demand', 'shortage', 'surplus'],
  objectives: {
    explorer: [
      'Explain supply as how much of something is for sale.',
      'Explain demand as how much people want to buy something.',
      'Predict whether a price will tend to go up or down when supply or demand changes.'
    ],
    analyst: [
      'Define supply, demand, shortage and surplus.',
      'Predict the likely direction of a price when supply or demand changes, and explain why.',
      'Recognize when two changes at once make the price direction uncertain.'
    ]
  },
  minutes: { explorer: 12, analyst: 16 },
  steps: [
    {
      kind: 'discover',
      title: 'The Great Gel Pen Rush',
      text: {
        explorer: [
          'Nia\'s class runs a school-supply sale to raise money for a field trip. Their teacher, Ms. Brooks, helps them set prices.',
          'Sparkly gel pens are the hit of the week. The class has only 10 gel pens, but 30 students want one!',
          'Nia wonders, "Should the gel pens cost more?" Next week, a big box of 100 gel pens arrives. Now what?'
        ],
        analyst: [
          'Nia\'s class runs a weekly school-supply sale to raise money for a field trip. Their teacher, Ms. Brooks, asks the class to act like a business: decide prices, track sales and explain their choices.',
          'Sparkly gel pens suddenly become popular after a student shows off her art. The class has only 10 pens, but at $1 each, about 30 students want one. The pens sell out in five minutes and many students leave disappointed.',
          'Next week, a donated box of 100 gel pens arrives, and the trend has cooled. Now the class has more pens than students who want them at $1. Nia realizes the right price depends on two things: how many pens there are, and how many people want them.'
        ]
      },
      image: {
        asset: 'assets/illustrations/w1l3-school-supply-sale.webp',
        alt: 'Students at a classroom school-supply sale table crowd around a small cup of gel pens while their teacher helps a girl write prices.',
        caption: 'Nia\'s class runs a school-supply sale.'
      }
    },
    {
      kind: 'definition',
      title: 'Supply and Demand',
      term: 'supply-and-demand',
      text: {
        explorer: [
          '[[supply|Supply]] is how much of something is ready to sell. [[demand|Demand]] is how much people want to buy it.',
          'When lots of people want something but there isn\'t much of it, the price tends to go up.',
          'When there is plenty of something and not many people want it, the price tends to go down.'
        ],
        analyst: [
          '[[supply|Supply]] is the amount of a good that sellers are willing and able to sell at different prices. [[demand|Demand]] is the amount buyers are willing and able to buy at different prices.',
          'When demand is greater than supply at the current price, there is a [[shortage]] and buyers compete, which tends to push the price up. When supply is greater than demand, there is a [[surplus]] and sellers often lower prices to sell what they have.',
          'These are tendencies, not guarantees. Real prices also depend on costs, rules, competition and how quickly sellers can make more.'
        ]
      },
      keyIdea: {
        explorer: 'Less supply or more demand tends to push prices up. More supply or less demand tends to push prices down.',
        analyst: 'A shortage (demand > supply) tends to push prices up; a surplus (supply > demand) tends to push prices down.'
      }
    },
    {
      kind: 'visual',
      title: 'The Supply and Demand Balance',
      text: {
        explorer: [
          'Picture a balance scale. One side is supply. The other side is demand.',
          'In week 1, there are only a few gel pens, but many students want them. Demand is heavier!'
        ],
        analyst: [
          'Think of supply and demand as two sides of a balance. When one side outweighs the other, the price feels pressure to move.',
          'In week 1, supply is small and demand is large, which creates a shortage at $1. The likely pressure is upward.'
        ]
      },
      visual: { kind: 'supplyDemand', title: 'Gel pens, week 1', item: 'gel pens', supply: 'less', demand: 'more' },
      caption: {
        explorer: 'Few pens and many buyers: the price tends to go up.',
        analyst: 'Low supply and high demand create a shortage, so the price tends to rise.'
      }
    },
    {
      kind: 'together',
      title: 'Let\'s Predict Together',
      intro: {
        explorer: 'Use what you know about supply and demand to predict each price.',
        analyst: 'For each change, decide which side moved and predict the price pressure.'
      },
      steps: {
        explorer: [
          {
            prompt: 'Week 1: only 10 gel pens and 30 students want one. What will the price most likely do?',
            choices: [
              { id: 'a', text: 'Go up', correct: true, coach: 'Yes! Few pens and lots of buyers push the price up.' },
              { id: 'b', text: 'Go down', correct: false, coach: 'There are not many pens and many people want them. Would sellers need to lower the price to sell them?' },
              { id: 'c', text: 'Pens will be free', correct: false, coach: 'Lots of students want pens. Would the class give away something so popular?' }
            ]
          },
          {
            prompt: 'Week 2: 100 gel pens arrive, and fewer students want them. What will the price most likely do?',
            choices: [
              { id: 'a', text: 'Go up', correct: false, coach: 'There are many more pens now and fewer buyers. Is that a reason to charge more?' },
              { id: 'b', text: 'Go down', correct: true, coach: 'Right! More supply and less demand push the price down.' },
              { id: 'c', text: 'Stay exactly the same', correct: false, coach: 'Both supply and demand changed. Which way do they push the price?' }
            ]
          },
          {
            prompt: 'On a cold, rainy day, fewer people want lemonade. What happens to the [[demand]] for lemonade?',
            choices: [
              { id: 'a', text: 'Demand goes down', correct: true, coach: 'Yes! Fewer people want it, so demand goes down, and the price may drop.' },
              { id: 'b', text: 'Demand goes up', correct: false, coach: 'Demand is how much people want to buy. Do more or fewer people want lemonade in the rain?' }
            ]
          }
        ],
        analyst: [
          {
            prompt: 'Week 1 at $1 each: 10 pens for sale, 30 students want one. What is this situation called, and what is the likely price pressure?',
            choices: [
              { id: 'a', text: 'A shortage; upward pressure', correct: true, coach: 'Correct. Demand (30) is greater than supply (10) at $1, so buyers compete and the price tends to rise.' },
              { id: 'b', text: 'A surplus; downward pressure', correct: false, coach: 'A surplus means extra goods left over. Are there extra pens, or not enough?' },
              { id: 'c', text: 'A surplus; upward pressure', correct: false, coach: 'Compare the numbers: are there more pens than buyers, or more buyers than pens?' }
            ]
          },
          {
            prompt: 'Week 2: 100 pens arrive, and only 25 students want one at $1. What would a smart seller likely do?',
            choices: [
              { id: 'a', text: 'Raise the price because pens were popular last week', correct: false, coach: 'Last week\'s shortage is over. With 100 pens and 25 buyers, what problem does the class have now?' },
              { id: 'b', text: 'Lower the price to sell more of the surplus', correct: true, coach: 'Yes. A surplus of 75 pens usually means sellers lower the price to attract more buyers.' },
              { id: 'c', text: 'Keep the price the same because supply does not affect price', correct: false, coach: 'Supply does matter. What happens when sellers have many more items than buyers want?' }
            ]
          },
          {
            prompt: 'A new art club makes gel pens popular again (demand rises), AND another donation adds more pens (supply rises). What happens to the price?',
            choices: [
              { id: 'a', text: 'It must go up.', correct: false, coach: 'Demand rising pushes up, but supply rising pushes down. Can you be sure which push is stronger?' },
              { id: 'b', text: 'It must go down.', correct: false, coach: 'More supply pushes down, but more demand pushes up. Which is bigger?' },
              { id: 'c', text: 'It is unclear; it depends on which change is bigger.', correct: true, coach: 'Excellent. When both sides grow, the price direction depends on which change is larger.' }
            ]
          }
        ]
      }
    },
    {
      kind: 'check',
      title: 'Check Your Understanding',
      question: {
        explorer: {
          key: 'lesson-check:w1l3:explorer',
          skill: 'supply-demand',
          difficulty: 'easy',
          band: 'explorer',
          template: 'lesson-check',
          kind: 'scenario',
          type: 'choice',
          prompt: 'A big storm damages many orange trees, so there are far fewer oranges. People still want just as many oranges. What will most likely happen to the price of oranges?',
          choices: [
            { id: 'a', text: 'The price will most likely go up.' },
            { id: 'b', text: 'The price will most likely go down.', misconception: 'less-supply-lower-price' },
            { id: 'c', text: 'The price cannot change at all.', misconception: 'prices-fixed' },
            { id: 'd', text: 'Oranges will become free.', misconception: 'scarce-is-free' }
          ],
          answer: 'a',
          hints: [
            'Did the [[supply]] of oranges go up or down after the storm?',
            'If there are fewer oranges but people want the same amount, do buyers have to compete for them?'
          ],
          explanation: 'The storm lowered the supply of oranges, but demand stayed the same. When there is less of something that people still want, the price tends to go up.',
          teach: 'Supply is how much is for sale. Demand is how much people want. If supply goes down and demand stays the same, buyers compete for fewer items, so the price tends to go up. If supply goes up, the price tends to go down.',
          misconceptions: {
            'less-supply-lower-price': 'Fewer oranges does not make them cheaper. When something becomes scarce, buyers compete for it.',
            'prices-fixed': 'Prices can change when supply or demand changes. Think about what the storm did to the number of oranges.',
            'scarce-is-free': 'Things that are hard to get usually cost more, not less.'
          }
        },
        analyst: {
          key: 'lesson-check:w1l3:analyst',
          skill: 'supply-demand',
          difficulty: 'medium',
          band: 'analyst',
          template: 'lesson-check',
          kind: 'scenario',
          type: 'choice',
          prompt: 'A popular game controller suddenly doubles in demand after a new game launches, but the factory cannot make more for 3 months. What is the most likely short-run result?',
          choices: [
            { id: 'a', text: 'The price tends to rise, because demand increased while supply stayed the same.' },
            { id: 'b', text: 'The price tends to fall, because more buyers make sellers compete harder.', misconception: 'buyers-lower-price' },
            { id: 'c', text: 'The price tends to fall, because supply did not change.', misconception: 'same-supply-lower-price' },
            { id: 'd', text: 'The price cannot change, because the factory sets it forever.', misconception: 'prices-fixed' }
          ],
          answer: 'a',
          hints: [
            'Identify which side changed: [[supply]], [[demand]], or both.',
            'If more people want something but there is no extra to sell, is there a shortage or a surplus?'
          ],
          explanation: 'Demand rose while supply stayed fixed, which creates a shortage at the old price. Buyers compete for the limited controllers, so the price tends to rise in the short run.',
          teach: 'First decide which side moved. A rise in demand with no change in supply creates a shortage, which tends to push prices up. A rise in supply with no change in demand creates a surplus, which tends to push prices down. When both move, the result depends on which change is bigger.',
          misconceptions: {
            'buyers-lower-price': 'More buyers compete with each other, not with sellers. When buyers compete for limited items, prices tend to rise.',
            'same-supply-lower-price': 'Supply staying the same is not a reason for the price to fall. What changed on the demand side?',
            'prices-fixed': 'Sellers can and do change prices when demand changes. What would a seller do with more buyers than controllers?'
          }
        }
      }
    },
    {
      kind: 'next',
      title: 'You\'re Thinking Like an Economist!',
      text: {
        explorer: 'You can predict how supply and demand push prices. Next, practice with new stories about stores, stands and storms.',
        analyst: 'You can identify shortages and surpluses and predict price pressure. Practice with new scenarios, including ones where the answer is "it depends."'
      },
      practiceSkills: ['supply-demand']
    }
  ]
};

const W2L1 = {
  id: 'w2l1',
  world: 2,
  number: 1,
  title: 'Planning Ahead: The Farmer, the Baker and the Future Price',
  status: 'ready',
  skills: ['future-agreement', 'hedge-outcome', 'futures-risk'],
  prereqs: ['buyers-sellers', 'price-change-math', 'supply-demand'],
  vocab: ['harvest', 'price-risk', 'uncertainty', 'agreed-price', 'market-price', 'forward-agreement', 'futures-contract', 'exchange', 'hedging', 'offset', 'commodity'],
  objectives: {
    explorer: [
      'Explain why a farmer and a baker both worry about the future price of wheat.',
      'Describe a promise made today to buy or sell something later at a price agreed today.',
      'Compare the agreed price with the later market price to tell who the agreement helped.',
      'Explain that nobody knows future prices, so an agreement can turn out better or worse.'
    ],
    analyst: [
      'Explain price risk for a producer (farmer) and a user (baker) of a commodity.',
      'Distinguish a private forward agreement from a standardized futures contract traded on a regulated exchange.',
      'Calculate who gained or gave up money compared with the later market price, per bushel and in total.',
      'Explain hedging as trading away the chance of a better price for more certainty, and why it does not guarantee a profit.'
    ]
  },
  minutes: { explorer: 15, analyst: 20 },
  steps: [
    {
      kind: 'discover',
      title: 'Two Worries About One Crop',
      text: {
        explorer: [
          'It is spring. Farmer Okafor plants wheat. He will not [[harvest]] it until summer, months from now.',
          'He worries: "What if lots of farms grow extra wheat and the price drops? Then I might not earn enough to pay my bills."',
          'Across town, Ms. Harris runs a family bakery. Her bread is made from flour, and flour is made from wheat.',
          'She worries too: "What if the price of wheat goes way up? Then my bread will cost more to make." Nobody knows what the price will be.'
        ],
        analyst: [
          'In early spring, Farmer Okafor plants wheat on his family farm. The [[harvest]] is months away, and he has already spent money on seed, fuel and equipment. Whether those months pay off depends partly on a number he cannot control: the price of wheat when he sells.',
          'If the weather is great in many places and farms everywhere grow extra wheat, supply could rise and the price could fall. That is his [[price-risk]]: a lower price could mean he cannot cover his costs.',
          'Ms. Harris owns Harris Family Bakery. Flour is one of her biggest costs. If a drought cuts the wheat supply, the price could rise and squeeze her budget. Her price risk runs the opposite way: she is hurt by a price increase.',
          'They face the same [[uncertainty]] from opposite sides. One is hurt if the price falls; the other is hurt if it rises. Over coffee, they wonder: could they agree on a price now?'
        ]
      },
      image: {
        asset: 'assets/illustrations/w2l1-farmer-and-baker.webp',
        alt: 'A farmer standing at the edge of a green wheat field shakes hands with a baker in an apron, while his granddaughter and her son look on.',
        caption: 'Farmer Okafor and Ms. Harris plan ahead.'
      }
    },
    {
      kind: 'definition',
      title: 'A Promise About a Future Price',
      term: 'forward-agreement',
      text: {
        explorer: [
          'Farmer Okafor and Ms. Harris make a promise. Today they agree: at harvest, he will sell her wheat for $6 a bushel, no matter what the [[market-price]] is then.',
          'A promise made today to buy or sell something later, at a price agreed today, is called a [[forward-agreement]].',
          'Using an agreement like this to protect yourself from a price change you are worried about is called [[hedging]].',
          'Real [[futures-contract|futures contracts]] are like this kind of promise, but they are traded on special markets called [[exchange|exchanges]] that have strict rules.'
        ],
        analyst: [
          'Farmer Okafor and Ms. Harris sign a private deal today: at harvest, he will sell her 5,000 bushels of wheat at $6.25 per bushel. This is a [[forward-agreement]]: a contract between two parties, with terms they choose themselves, to trade later at a price set now.',
          'A [[futures-contract]] is a related but different tool. It is a standardized agreement to buy or sell a [[commodity]] at a future date, traded on a regulated [[exchange]]. The exchange, not the two traders, sets the terms: the amount (contract size), acceptable quality, and delivery months.',
          'Because every contract for the same month is identical, a trader can close out, or [[offset]], a position by making the opposite trade before delivery. According to the CFTC, most futures contracts are offset and do not end in delivery.',
          'Using a forward or futures position to reduce the risk of a price change you already face is called [[hedging]]. Hedging trades away the chance of a better price in exchange for more certainty. It does not guarantee a profit.'
        ]
      },
      keyIdea: {
        explorer: 'A forward agreement locks in a price today for a trade later. Nobody knows if the later market price will be higher or lower.',
        analyst: 'Forward agreements are private and customized; futures contracts are standardized and exchange-traded. Hedging reduces price uncertainty but gives up the chance of a better price.'
      }
    },
    {
      kind: 'visual',
      title: 'The Agreement',
      text: {
        explorer: [
          'Here is their agreement. The price is set today. The wheat changes hands at harvest.',
          'Ask: what if the market price at harvest is higher than $6? What if it is lower?'
        ],
        analyst: [
          'The agreement fixes the price, quantity and timing. What it does not fix is the [[market-price]] at harvest, which could land above or below $6.25.',
          'Whichever way the price moves, one side will wish they had waited, and the other will be glad they agreed. Both, however, knew their price in advance.'
        ]
      },
      visual: {
        explorer: { kind: 'agreement', title: 'Wheat agreement (pretend)', item: 'wheat', buyer: 'Ms. Harris (baker)', seller: 'Farmer Okafor', price: '$6 per bushel', quantity: '100 bushels', when: 'At harvest in summer' },
        analyst: { kind: 'agreement', title: 'Wheat forward agreement (pretend)', item: 'wheat', buyer: 'Harris Family Bakery', seller: 'Okafor Family Farm', price: '$6.25 per bushel', quantity: '5,000 bushels', when: 'At harvest in July' }
      },
      caption: {
        explorer: 'The price is agreed today. The wheat and money change hands later.',
        analyst: 'Price, amount and date are fixed today. The future market price is still unknown.'
      }
    },
    {
      kind: 'together',
      title: 'What If the Price Changes?',
      intro: {
        explorer: 'Harvest day is here. Let\'s see how the $6 promise worked out.',
        analyst: 'Test the agreement against two possible harvest prices. Remember: nobody knew which one would happen.'
      },
      visual: {
        explorer: {
          kind: 'bars', title: 'Agreed price vs. two possible harvest prices (pretend)', unit: '$',
          items: [{ label: 'Agreed price', value: 6 }, { label: 'If harvest price is low', value: 4 }, { label: 'If harvest price is high', value: 8 }]
        },
        analyst: {
          kind: 'bars', title: 'Agreed price vs. two possible harvest prices, per bushel (pretend)', unit: '$',
          items: [{ label: 'Agreed price', value: 6.25 }, { label: 'Scenario A', value: 5.5 }, { label: 'Scenario B', value: 7 }]
        }
      },
      steps: {
        explorer: [
          {
            prompt: 'At harvest, the [[market-price]] of wheat is only $4. Farmer Okafor still gets $6. Who did the agreement help?',
            choices: [
              { id: 'a', text: 'Farmer Okafor', correct: true, coach: 'Yes! He gets $6 instead of $4, so he gets $2 more per bushel than the market price.' },
              { id: 'b', text: 'Ms. Harris', correct: false, coach: 'Ms. Harris must pay $6, but the market price is $4. Would she pay more or less without the promise?' },
              { id: 'c', text: 'Nobody, because the promise is canceled', correct: false, coach: 'A promise does not disappear when the price changes. What price do they use?' }
            ]
          },
          {
            prompt: 'What if the market price at harvest is $8 instead? Ms. Harris still pays $6. Who did the agreement help now?',
            choices: [
              { id: 'a', text: 'Farmer Okafor', correct: false, coach: 'He could have sold for $8 at the market, but he gets $6. Is that more or less?' },
              { id: 'b', text: 'Ms. Harris', correct: true, coach: 'Right! She pays $6 instead of $8, so she saves $2 per bushel.' },
              { id: 'c', text: 'Both of them got extra money', correct: false, coach: 'One side pays less, so the other side gets less. Compare $6 with $8 for each person.' }
            ]
          },
          {
            prompt: 'When they made the promise in spring, did they know which way the price would go?',
            choices: [
              { id: 'a', text: 'Yes, they knew it would go up.', correct: false, coach: 'Weather, crops and buyers can all change. Could anyone be sure in spring?' },
              { id: 'b', text: 'No. Nobody knows future prices for sure.', correct: true, coach: 'Exactly. They agreed so they would know their price, even though it might turn out better or worse.' }
            ]
          }
        ],
        analyst: [
          {
            prompt: 'Scenario A: the [[market-price]] at harvest is $5.50. Compared with the market, how did the agreement work out for Farmer Okafor?',
            choices: [
              { id: 'a', text: 'He received $0.75 more per bushel than the market price.', correct: true, coach: 'Correct: $6.25 − $5.50 = $0.75 more per bushel. The hedge protected him from the drop.' },
              { id: 'b', text: 'He received $0.75 less per bushel than the market price.', correct: false, coach: 'Compare what he gets ($6.25) with what the market pays ($5.50). Which is bigger?' },
              { id: 'c', text: 'He received $11.75 more per bushel.', correct: false, coach: 'That adds the two prices. Find the difference by subtracting.' }
            ]
          },
          {
            prompt: 'In Scenario A, the agreement covers 5,000 bushels. In total, how much more does the farmer receive than he would at the market price?',
            choices: [
              { id: 'a', text: '$375', correct: false, coach: 'Check the place value. Multiply $0.75 by 5,000 carefully.' },
              { id: 'b', text: '$3,750', correct: true, coach: 'Yes: $0.75 × 5,000 = $3,750. That same $3,750 is what Ms. Harris paid above the market price.' },
              { id: 'c', text: '$31,250', correct: false, coach: 'That is $6.25 × 5,000, the total sale. The question asks only for the difference from the market price.' }
            ]
          },
          {
            prompt: 'Scenario B: the market price at harvest is $7.00. Which statement is accurate?',
            choices: [
              { id: 'a', text: 'The agreement failed, so the farmer can cancel it.', correct: false, coach: 'An agreement is binding even if one side ends up wishing it had waited. What price applies?' },
              { id: 'b', text: 'Ms. Harris pays $0.75 less per bushel than the market price, and the farmer gives up $0.75 per bushel he could have earned, but he still got the price he planned on.', correct: true, coach: 'Exactly. Hedging gave both sides certainty; it did not guarantee either side the best outcome.' },
              { id: 'c', text: 'Both sides earn $0.75 extra per bushel.', correct: false, coach: 'The agreement moves money between two sides. If one pays less than the market, what happens to the other?' }
            ]
          }
        ]
      }
    },
    {
      kind: 'check',
      title: 'Check Your Understanding',
      question: {
        explorer: {
          key: 'lesson-check:w2l1:explorer',
          skill: 'hedge-outcome',
          difficulty: 'easy',
          band: 'explorer',
          template: 'lesson-check',
          kind: 'scenario',
          type: 'choice',
          prompt: 'A farmer and a baker agree today on $5 a bushel for wheat at harvest. At harvest, the [[market-price]] is $3 a bushel. Compared with the market price, who got the better deal?',
          visual: { kind: 'agreement', item: 'wheat', buyer: 'Baker', seller: 'Farmer', price: '$5 per bushel', quantity: '50 bushels', when: 'At harvest' },
          choices: [
            { id: 'a', text: 'The farmer, because he gets $5 instead of $3.' },
            { id: 'b', text: 'The baker, because the market price went down.', misconception: 'buyer-gets-drop' },
            { id: 'c', text: 'Both of them got extra money.', misconception: 'both-win' },
            { id: 'd', text: 'Nobody, because the agreement is canceled when the price changes.', misconception: 'agreement-cancels' }
          ],
          answer: 'a',
          hints: [
            'Under the agreement, what price does the wheat sell for at harvest?',
            'Compare the agreed price with the market price. The seller likes a higher price; the buyer likes a lower one.'
          ],
          explanation: 'The agreement says $5. The market price is only $3. The farmer, who is selling, gets $2 more per bushel than the market would pay, so the agreement helped the farmer this time.',
          teach: 'To see who an agreement helped, compare the agreed price with the market price at the time of the trade. If the agreed price is higher, the seller is better off than at the market. If the agreed price is lower, the buyer is better off. Nobody knows ahead of time which will happen.',
          misconceptions: {
            'buyer-gets-drop': 'The market price dropped, but the baker still has to pay the agreed $5. Is $5 more or less than $3?',
            'both-win': 'When one side gets more than the market price, the other side pays more than the market price.',
            'agreement-cancels': 'A promise to trade at a set price still counts when prices change. That is the whole point of making it.'
          }
        },
        analyst: {
          key: 'lesson-check:w2l1:analyst',
          skill: 'future-agreement',
          difficulty: 'medium',
          band: 'analyst',
          template: 'lesson-check',
          kind: 'concept',
          type: 'choice',
          prompt: 'Which statement about a [[futures-contract]] is accurate?',
          choices: [
            { id: 'a', text: 'It is a standardized agreement traded on a regulated exchange, and most positions are closed out (offset) before delivery.' },
            { id: 'b', text: 'It guarantees the trader will make a profit.', misconception: 'guaranteed-profit' },
            { id: 'c', text: 'The two traders write their own custom amount, quality and date for each contract.', misconception: 'futures-are-custom' },
            { id: 'd', text: 'Every futures contract must end with the actual goods being delivered.', misconception: 'always-delivery' }
          ],
          answer: 'a',
          hints: [
            'Think about who sets the terms of a futures contract: the two traders, or the exchange?',
            'Recall what the CFTC says usually happens to futures positions before the delivery date.'
          ],
          explanation: 'A futures contract is standardized by the exchange (size, quality, delivery months) and traded on a regulated exchange. Because contracts are identical, traders can offset them, and most futures contracts are closed out before delivery. No futures contract guarantees a profit.',
          teach: 'Compare the two tools. A forward agreement is private, and the two sides choose the terms. A futures contract is standardized and traded on an exchange, so any contract for the same month is identical and can be offset by an opposite trade. Futures can be used to reduce price risk (hedging), but prices can move against any position, so losses are always possible.',
          misconceptions: {
            'guaranteed-profit': 'No agreement can guarantee a profit, because nobody knows future prices. Prices can move against a position.',
            'futures-are-custom': 'Custom terms describe a forward agreement. Futures terms are set by the exchange.',
            'always-delivery': 'Delivery is possible, but most futures positions are offset with an opposite trade before delivery.'
          }
        }
      }
    },
    {
      kind: 'next',
      title: 'You Planned Ahead!',
      text: {
        explorer: 'You learned why farmers and bakers worry about future prices, and how a promise about a price can help. Next, practice telling who an agreement helped, and remember: nobody knows future prices.',
        analyst: 'You can explain price risk, forward agreements, futures contracts and hedging. Practice calculating who gained compared with the market price, and always weigh the downside along with the upside.'
      },
      practiceSkills: ['future-agreement', 'hedge-outcome', 'futures-risk']
    }
  ]
};

// Planned lessons: listed honestly as "In development". No steps or skills yet.
const planned = (id, world, number, title) => ({ id, world, number, title, status: 'planned', skills: [], prereqs: [], vocab: [], steps: [] });

export const LESSONS = [
  W1L1,
  W1L2,
  W1L3,
  W2L1,
  planned('w2l2', 2, 2, 'From Handshake to Exchange: What Makes a Futures Contract'),
  planned('w2l3', 2, 3, 'Hedgers and Speculators'),
  planned('w2l4', 2, 4, 'Closing Out: Why Most Futures Never Reach Delivery'),
  planned('w3l1', 3, 1, 'Farm Products: Wheat, Corn and Soybeans'),
  planned('w3l2', 3, 2, 'Metals: Gold and Silver'),
  planned('w3l3', 3, 3, 'Energy: Crude Oil and Natural Gas'),
  planned('w3l4', 3, 4, 'Stock Indexes: A Basket of Companies'),
  planned('w3l5', 3, 5, 'Futures and Stocks: How They Differ'),
  planned('w4l1', 4, 1, 'Price Over Time: Reading Line Charts'),
  planned('w4l2', 4, 2, 'Candlesticks: Open, High, Low, Close'),
  planned('w4l3', 4, 3, 'Long and Short'),
  planned('w4l4', 4, 4, 'What Charts Cannot Tell You'),
  planned('w5l1', 5, 1, 'Price Differences with Decimals'),
  planned('w5l2', 5, 2, 'Percent Change'),
  planned('w5l3', 5, 3, 'Contract Size and Ticks'),
  planned('w5l4', 5, 4, 'Gains and Losses on a Contract'),
  planned('w5l5', 5, 5, 'Margin and Leverage: Why Small Moves Matter'),
  planned('w6l1', 6, 1, 'Nobody Knows the Future: Uncertainty'),
  planned('w6l2', 6, 2, 'Make a Plan Before You Decide'),
  planned('w6l3', 6, 3, 'Stop Orders and Their Limits'),
  planned('w6l4', 6, 4, 'Patience: Choosing to Wait'),
  planned('w6l5', 6, 5, 'Learning from Losses and Reflecting')
];

const BY_ID = new Map(LESSONS.map((l) => [l.id, l]));

/** Lesson by id, or null. */
export function lessonById(id) {
  return BY_ID.get(id) || null;
}
