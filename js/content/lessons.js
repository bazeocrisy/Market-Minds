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

const W2L2 = {
  id: 'w2l2',
  world: 2,
  number: 2,
  title: 'From Handshake to Exchange: What Makes a Futures Contract',
  status: 'ready',
  skills: ['futures-standardization'],
  prereqs: ['future-agreement'],
  vocab: ['futures-contract', 'standardized', 'exchange', 'clearinghouse', 'counterparty', 'margin', 'margin-call', 'daily-settlement', 'commodity'],
  objectives: {
    explorer: [
      'Explain why it is hard to make a private promise with a stranger.',
      'Describe a futures contract as a "recipe" that is the same for everyone: same amount, same quality, same months.',
      'Tell which part of a futures contract buyers and sellers still decide: the price.',
      'Explain that a clearinghouse stands in the middle of every trade.'
    ],
    analyst: [
      'Compare a private forward agreement with a standardized, exchange-traded futures contract.',
      'Identify the terms the exchange sets (contract size, grade, delivery months and locations) and the term set by trading (price).',
      'Explain the clearinghouse as the buyer to every seller and the seller to every buyer.',
      'Describe margin as a performance bond that is not a down payment and not a limit on losses, and explain daily settlement and margin calls.'
    ]
  },
  minutes: { explorer: 14, analyst: 20 },
  steps: [
    {
      kind: 'discover',
      title: 'Looking for a Buyer You Can Trust',
      text: {
        explorer: [
          'Farmer Okafor\'s promise with Ms. Harris worked because they know each other. But this year he grew extra wheat, and her bakery only needs part of it.',
          'He could look for other buyers, but that is hard. Each buyer wants a different amount, a different kind of wheat, and a different day.',
          'And how can he be sure a stranger will keep a promise? What if the buyer disappears when the price drops?',
          'Ms. Harris says, "That is why there are special markets called [[exchange|exchanges]], with the same rules for everyone."'
        ],
        analyst: [
          'Last year\'s handshake deal worked because Farmer Okafor and Ms. Harris trust each other. This year his farm grew more wheat than her bakery can use, and he wants to lock in a price for the rest.',
          'Finding another buyer for a private deal is hard. A cereal company wants a different amount, a feed mill wants a different quality, and a flour mill wants a different month. Every deal would need its own long negotiation.',
          'There is a bigger problem: trust. If prices fall sharply, will a stranger who agreed to pay $6.25 a bushel really show up and pay? In a private deal, each side depends on the other side, its [[counterparty]], keeping its word.',
          'Futures markets were organized to solve both problems: one set of contract terms for everyone, and a middle party that stands between every buyer and seller.'
        ]
      },
      image: {
        asset: 'assets/illustrations/w2l2-finding-a-buyer.webp',
        alt: 'A farmer at his kitchen table looks at a tablet, thinking about several different possible buyers, with a busy, modern trading room shown in a thought bubble.',
        caption: 'How can Farmer Okafor find a buyer he can count on?'
      }
    },
    {
      kind: 'definition',
      title: 'The Same Recipe for Everyone',
      term: 'standardized',
      text: {
        explorer: [
          'On an [[exchange]], every wheat [[futures-contract]] for the same month follows the same recipe. The amount of wheat is the same. The kind and quality of wheat are the same.',
          'Because every contract is the same, we say it is [[standardized]]. Buyers and sellers only have to agree on the price and how many contracts.',
          'A [[clearinghouse]] stands in the middle of every trade. It is the buyer to every seller and the seller to every buyer, so nobody depends on one stranger keeping a promise.'
        ],
        analyst: [
          'A [[futures-contract]] is a [[standardized]] agreement to buy or sell a set amount of a [[commodity]] at a future date, traded on a regulated [[exchange]]. The exchange sets the terms: contract size (a CBOT wheat contract covers 5,000 bushels), acceptable grades, delivery months and delivery locations. Traders negotiate only the price and the number of contracts.',
          'Each trade is cleared through a [[clearinghouse]], which, in the CFTC\'s words, "acts as the buyer to all sellers and the seller to all buyers." Each trader now deals with the clearinghouse instead of depending on one unknown [[counterparty]].',
          'To show they can keep their promises, traders deposit [[margin]], a performance bond (a good-faith deposit). The CFTC says futures margin is typically 2 to 10 percent of a contract\'s value and is not a down payment. Margin is also NOT the most you can lose.',
          'Positions are marked to the market every day ([[daily-settlement]]): gains are added to accounts and losses are taken out. If losses push an account below the required level, the trader must deposit more money, which is called a [[margin-call]].'
        ]
      },
      keyIdea: {
        explorer: 'A futures contract is a standard recipe: same amount, same quality, same months. Traders only agree on the price, and a clearinghouse stands in the middle.',
        analyst: 'Futures are standardized and exchange-traded, a clearinghouse stands between every buyer and seller, and margin is a performance bond: not a down payment and not a limit on losses.'
      }
    },
    {
      kind: 'visual',
      title: 'The Contract Recipe',
      text: {
        explorer: [
          'This card shows the recipe for a wheat futures contract. The exchange fills in almost every line.',
          'Only one line is left for buyers and sellers to decide. Can you find it?'
        ],
        analyst: [
          'Compare this with the forward agreement in Lesson 1, where the farmer and the baker chose every term. Here the exchange fixes almost everything, so any two contracts for the same month are identical and can be swapped for each other.',
          'Price is the one term set by trading. It changes as buyers and sellers react to new information about supply and demand.'
        ]
      },
      visual: {
        explorer: {
          kind: 'priceTags', title: 'Wheat futures contract recipe',
          items: [
            { label: 'Amount', price: 'Same for every contract', note: 'One wheat contract covers 5,000 bushels.' },
            { label: 'Quality', price: 'Set by the exchange', note: 'Only certain kinds of wheat count.' },
            { label: 'Month', price: 'Set months only', note: 'The exchange lists which months you can trade.' },
            { label: 'Price', price: 'Decided by trading', note: 'The one thing buyers and sellers agree on.' }
          ]
        },
        analyst: {
          kind: 'priceTags', title: 'Wheat futures contract terms',
          items: [
            { label: 'Contract size', price: '5,000 bushels', note: 'Set by the exchange (CBOT wheat, per the CFTC).' },
            { label: 'Grade (quality)', price: 'Set by exchange rules', note: 'Only listed grades can be delivered.' },
            { label: 'Delivery months and places', price: 'Listed by the exchange', note: 'Traders choose among listed months only.' },
            { label: 'Counterparty', price: 'The clearinghouse', note: 'Buyer to every seller, seller to every buyer.' },
            { label: 'Price', price: 'Set by trading', note: 'Changes as buyers and sellers trade. Pretend prices are used in this app.' }
          ]
        }
      },
      caption: {
        explorer: 'The exchange sets the recipe. Buyers and sellers decide the price.',
        analyst: 'Everything except price (and how many contracts) is standardized by the exchange.'
      }
    },
    {
      kind: 'together',
      title: 'Handshake or Exchange?',
      intro: {
        explorer: 'Let\'s use the recipe card to answer some questions together.',
        analyst: 'Apply what you know about standardization, clearing and margin.'
      },
      steps: {
        explorer: [
          {
            prompt: 'Two traders want to trade one July wheat [[futures-contract]] on an exchange. What do they get to decide?',
            choices: [
              { id: 'a', text: 'The price', correct: true, coach: 'Yes! The exchange set the amount, quality and months. The price is decided by trading.' },
              { id: 'b', text: 'How much wheat is in the contract', correct: false, coach: 'The exchange already set the amount. Every contract for that month is the same size.' },
              { id: 'c', text: 'What kind of wheat counts', correct: false, coach: 'Quality is part of the recipe the exchange writes. Which line was left open on the card?' }
            ]
          },
          {
            prompt: 'Why is a [[clearinghouse]] helpful?',
            choices: [
              { id: 'a', text: 'It stands between buyers and sellers, so nobody depends on a stranger keeping a promise.', correct: true, coach: 'Right. It is the buyer to every seller and the seller to every buyer.' },
              { id: 'b', text: 'It promises that everyone will make money.', correct: false, coach: 'Nobody can promise that. Prices can move against anyone.' },
              { id: 'c', text: 'It decides the price for everyone.', correct: false, coach: 'Buyers and sellers set the price by trading. The clearinghouse stands in the middle of each trade.' }
            ]
          },
          {
            prompt: '[[margin|Margin]] is money a trader sets aside to show they can keep their promise. Is it the most they can lose?',
            choices: [
              { id: 'a', text: 'Yes. You can never lose more than the margin.', correct: false, coach: 'Losses can grow bigger than the margin. Then the trader must add more money.' },
              { id: 'b', text: 'No. Losses can be bigger than the margin.', correct: true, coach: 'Exactly. Margin is like a deposit, not a limit on how much you can lose.' }
            ]
          }
        ],
        analyst: [
          {
            prompt: 'Which term of an exchange-traded wheat [[futures-contract]] is NOT set by the exchange?',
            choices: [
              { id: 'a', text: 'Contract size', correct: false, coach: 'Contract size is fixed by the exchange (5,000 bushels for CBOT wheat).' },
              { id: 'b', text: 'Deliverable grade', correct: false, coach: 'Grades are listed in the exchange\'s rules so every contract is identical.' },
              { id: 'c', text: 'Price', correct: true, coach: 'Correct. Price is discovered by buyers and sellers trading; everything else is standardized.' }
            ]
          },
          {
            prompt: 'Trader A sells one wheat contract and Trader B buys it. After the trade is cleared, who is Trader B\'s [[counterparty]]?',
            choices: [
              { id: 'a', text: 'Trader A', correct: false, coach: 'In a private forward agreement, yes. After clearing, something steps in between them. What is it?' },
              { id: 'b', text: 'The clearinghouse', correct: true, coach: 'Right. The clearinghouse acts as buyer to every seller and seller to every buyer, so neither trader depends on the other.' },
              { id: 'c', text: 'Whoever owns the most wheat', correct: false, coach: 'Ownership of wheat does not matter here. Think about the middle party in every cleared trade.' }
            ]
          },
          {
            prompt: 'A trader deposits $3,000 of [[margin]] for a contract worth $60,000 (pretend numbers). Which statement is accurate?',
            choices: [
              { id: 'a', text: 'The margin is 5% of the contract value. It is a performance bond, and losses can be larger than it.', correct: true, coach: 'Yes: $3,000 ÷ $60,000 = 0.05 = 5%. Daily losses come out of the account, and a margin call can require more money.' },
              { id: 'b', text: 'The trader now owns $3,000 worth of wheat.', correct: false, coach: 'Futures margin is not a down payment on the goods. It is a good-faith deposit.' },
              { id: 'c', text: 'The trader can lose at most $3,000.', correct: false, coach: 'Margin is not a loss limit. If losses drain the account, the trader must add money.' }
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
          key: 'lesson-check:w2l2:explorer',
          skill: 'futures-standardization',
          difficulty: 'easy',
          band: 'explorer',
          template: 'lesson-check',
          kind: 'concept',
          type: 'choice',
          prompt: 'On a futures [[exchange]], what is the same in every wheat contract for the same month?',
          choices: [
            { id: 'a', text: 'The amount and quality of the wheat' },
            { id: 'b', text: 'The price', misconception: 'price-is-standard' },
            { id: 'c', text: 'Nothing. Each pair of traders writes their own rules.', misconception: 'futures-are-custom' },
            { id: 'd', text: 'How much money each trader will make', misconception: 'guaranteed-profit' }
          ],
          answer: 'a',
          hints: [
            'Think of a futures contract as a recipe that the exchange writes for everyone.',
            'One part changes all day as people trade. The parts that never change are the recipe.'
          ],
          explanation: 'The exchange sets the recipe: the amount of wheat, its quality and the months. Those are the same in every contract for that month. Buyers and sellers decide only the price.',
          teach: 'A private promise between two people can have any terms they like. A futures contract is standardized: the exchange sets the amount, quality and months, so every contract for the same month is the same. Traders agree only on the price, which keeps changing as people trade. Nobody is promised a profit.',
          misconceptions: {
            'price-is-standard': 'The price is the one part that is NOT set ahead of time. It changes as buyers and sellers trade.',
            'futures-are-custom': 'Writing your own rules describes a private promise (a forward agreement). Futures follow the exchange\'s recipe.',
            'guaranteed-profit': 'Nobody can know who will make money. Prices can move against any trader.'
          }
        },
        analyst: {
          key: 'lesson-check:w2l2:analyst',
          skill: 'futures-standardization',
          difficulty: 'medium',
          band: 'analyst',
          template: 'lesson-check',
          kind: 'mistake-detective',
          type: 'choice',
          prompt: 'Mistake detective: a student says, "I deposited $2,000 of [[margin]] for one futures contract, so the most I can possibly lose is $2,000." What is the best correction?',
          choices: [
            { id: 'a', text: 'Margin is a performance bond, not a loss limit. Losses are settled daily, and if they drain the account the trader gets a margin call and must add money.' },
            { id: 'b', text: 'There is no mistake. Margin is the maximum loss on a futures contract.', misconception: 'margin-is-max-loss' },
            { id: 'c', text: 'Margin is a down payment, so the student already owns $2,000 of the commodity.', misconception: 'margin-down-payment' },
            { id: 'd', text: 'The clearinghouse pays back any losses bigger than the margin.', misconception: 'clearinghouse-covers-losses' }
          ],
          answer: 'a',
          hints: [
            'Recall the CFTC\'s description of futures margin: is it a down payment, or something else?',
            'Think about what happens when daily losses push an account below the required level.'
          ],
          explanation: 'Futures margin is a performance bond (a good-faith deposit), often a small percent of the contract value. Gains and losses are settled every day. If losses push the account below the required level, the trader must deposit more money, so total losses can be larger than the first deposit.',
          teach: 'Margin lets a trader hold a large contract with a small deposit, which is why losses can quickly grow larger than that deposit. The clearinghouse stands between buyers and sellers so that each side\'s obligations are met, but it does not cover a trader\'s own losses; the trader must pay them. Margin is not a down payment and not the most you can lose.',
          misconceptions: {
            'margin-is-max-loss': 'This is the most common margin mistake. Losses are taken out daily, and a margin call can require more money than the first deposit.',
            'margin-down-payment': 'The CFTC says futures margins are not down payments. The trader does not own the commodity; margin is a good-faith deposit.',
            'clearinghouse-covers-losses': 'The clearinghouse makes sure obligations are met between traders. The trader who loses still has to pay the loss.'
          }
        }
      }
    },
    {
      kind: 'next',
      title: 'From Handshake to Exchange!',
      text: {
        explorer: 'You learned why futures contracts follow one recipe, why traders only agree on the price, and how a clearinghouse stands in the middle. Next, meet the different kinds of people who use futures, and why.',
        analyst: 'You can compare forwards and futures, name what the exchange standardizes, explain the clearinghouse, and describe margin as a performance bond that does not limit losses. Next: hedgers, speculators, and the risks each one takes.'
      },
      practiceSkills: ['futures-standardization']
    }
  ]
};

const W2L3 = {
  id: 'w2l3',
  world: 2,
  number: 3,
  title: 'Hedgers and Speculators',
  status: 'ready',
  skills: ['hedgers-speculators'],
  prereqs: ['hedge-outcome'],
  vocab: ['hedger', 'speculator', 'hedging', 'price-risk', 'risk'],
  objectives: {
    explorer: [
      'Explain that a hedger already has a price worry from their work and uses futures to make it smaller.',
      'Explain that a speculator has no wheat to sell or use and trades hoping to make money from price changes.',
      'Explain that speculators can lose money, and that hedging does not promise the best price either.'
    ],
    analyst: [
      'Classify market participants as hedgers or speculators by their reason for trading, not by whether they buy or sell.',
      'Calculate a speculator\'s gain or loss on a contract with pretend prices.',
      'Describe both groups neutrally and accurately, including the CFTC\'s warning that speculation is risky and many individuals lose money.'
    ]
  },
  minutes: { explorer: 14, analyst: 18 },
  steps: [
    {
      kind: 'discover',
      title: 'Career Day: Three Reasons to Trade',
      text: {
        explorer: [
          'It is Career Day at Malik\'s school. His mom, Ms. Harris, tells the class she buys lots of wheat for her bakery. She worries the price will go up, so she locks in a price ahead of time.',
          'Farmer Okafor grows wheat. He worries the price will go down, so he locks in a price too.',
          'The third guest is Ms. Tate, a trader. She has no wheat and no bakery, but she trades wheat futures hoping the price will move her way.',
          '"Sometimes I am wrong and I lose money," Ms. Tate says. Why would people trade for such different reasons?'
        ],
        analyst: [
          'At Career Day, Malik\'s mom, Ms. Harris, explains that her bakery will need wheat for months. Rising prices would raise her costs, so she buys wheat futures to lock in a price. Farmer Okafor will have wheat to sell; falling prices would cut his income, so he sells wheat futures.',
          'Both of them already face [[price-risk]] from their businesses, and both use futures to reduce it. People who trade for this reason are called [[hedger|hedgers]].',
          'The third guest, Ms. Tate, works as a trader. She grows no wheat and bakes no bread. She buys or sells wheat futures when she thinks the price will move, accepting risk in hopes of a profit. She is a [[speculator]].',
          'Ms. Tate is honest with the class: "Some months I lose money. Nobody can know the future price." The CFTC describes speculating as "a volatile, complex and risky venture."'
        ]
      },
      image: {
        asset: 'assets/illustrations/w2l3-career-day.webp',
        alt: 'At a school career day, a baker in an apron, a farmer in a work jacket and a trader holding a laptop stand at the front of a classroom while students listen and raise their hands.',
        caption: 'Three guests, three different reasons to trade.'
      }
    },
    {
      kind: 'definition',
      title: 'Hedgers and Speculators',
      term: 'hedger',
      text: {
        explorer: [
          'A [[hedger]] already has a price worry from their work, like a farmer or a baker. They use futures to make that worry smaller.',
          'A [[speculator]] has no wheat to sell and no bread to bake. They trade to try to make money from price changes, and they can lose money.',
          'Neither one is good or bad. They trade for different reasons, and both face [[risk]].'
        ],
        analyst: [
          'The CFTC Glossary describes a [[hedger]] as someone who takes futures positions opposite to positions they already have in the actual commodity, to limit losses from price changes. A farmer who will sell wheat sells futures; a baker who will buy wheat buys futures.',
          'A [[speculator]], in the CFTC\'s words, is a trader "who does not hedge, but who trades with the objective of achieving profits." A speculator takes on price risk they did not have before.',
          'Every futures trade has a buyer and a seller. When a hedger wants to sell, the buyer on the other side might be another hedger or a speculator. The role comes from the reason for trading, not from buying or selling.',
          'The CFTC warns that many individuals who speculate lose all of their money and can be required to pay more than they first invested. Hedging is not a sure win either: it trades away the chance of a better price for more certainty.'
        ]
      },
      keyIdea: {
        explorer: 'Hedgers already have a price worry and use futures to shrink it. Speculators take on risk hoping to make money, and they can lose.',
        analyst: 'Hedgers reduce a price risk they already face; speculators take on price risk hoping to profit. The difference is the reason, and both can end up worse off.'
      }
    },
    {
      kind: 'visual',
      title: 'Why Do They Trade?',
      text: {
        explorer: [
          'Read each card. Does this person already have a wheat worry from their work?',
          'If yes, they are a hedger. If they are taking on a new risk to try to make money, they are a speculator.'
        ],
        analyst: [
          'Notice that the baker buys futures and the farmer sells futures, yet both are hedgers. Buying or selling does not decide the role.',
          'Ms. Tate could buy or sell. What makes her a speculator is that she has no wheat business to protect.'
        ]
      },
      visual: {
        explorer: {
          kind: 'priceTags', title: 'Three people, three reasons',
          items: [
            { label: 'Ms. Harris (baker)', price: 'Hedger', note: 'Worried wheat will cost more. Locks in a price.' },
            { label: 'Farmer Okafor', price: 'Hedger', note: 'Worried wheat will sell for less. Locks in a price.' },
            { label: 'Ms. Tate (trader)', price: 'Speculator', note: 'Has no wheat. Takes a risk hoping the price moves her way. Can lose money.' }
          ]
        },
        analyst: {
          kind: 'priceTags', title: 'Role comes from the reason for trading',
          items: [
            { label: 'Harris Family Bakery buys wheat futures', price: 'Hedger', note: 'Already exposed to rising wheat costs; trading reduces that risk.' },
            { label: 'Okafor Family Farm sells wheat futures', price: 'Hedger', note: 'Already exposed to falling wheat prices; trading reduces that risk.' },
            { label: 'Ms. Tate buys or sells wheat futures', price: 'Speculator', note: 'No wheat business; takes on new risk hoping to profit. Can lose more than she deposits.' }
          ]
        }
      },
      caption: {
        explorer: 'Hedgers protect against a worry they already have. Speculators take on a new risk.',
        analyst: 'Same contract, different reasons. The reason, not the direction, decides the role.'
      }
    },
    {
      kind: 'together',
      title: 'Who Is Who?',
      intro: {
        explorer: 'Let\'s sort some people together. Ask: do they already have a price worry from their work?',
        analyst: 'Classify each trader, then look at what risk really means for a speculator.'
      },
      steps: {
        explorer: [
          {
            prompt: 'A cereal company buys lots of oats every month. It locks in an oat price because it worries prices will rise. Is it a [[hedger]] or a [[speculator]]?',
            choices: [
              { id: 'a', text: 'Hedger', correct: true, coach: 'Yes! The company already needs oats, so it already has a price worry. It is making that worry smaller.' },
              { id: 'b', text: 'Speculator', correct: false, coach: 'The company already uses oats every month. Is it taking on a new risk, or shrinking one it has?' }
            ]
          },
          {
            prompt: 'Mr. Lee has no farm and no bakery. He buys a corn futures contract hoping the price will go up. Is he a hedger or a speculator?',
            choices: [
              { id: 'a', text: 'Hedger', correct: false, coach: 'Mr. Lee does not grow or use corn. Does he have a corn worry to protect?' },
              { id: 'b', text: 'Speculator', correct: true, coach: 'Right. He is taking on a new risk, hoping to make money from a price change.' }
            ]
          },
          {
            prompt: 'Mr. Lee hoped corn would go up, but the price went down. What happens?',
            choices: [
              { id: 'a', text: 'He loses money.', correct: true, coach: 'Yes. Speculators can lose money when the price moves the wrong way. That is the risk they take.' },
              { id: 'b', text: 'He still makes money, because speculators are experts.', correct: false, coach: 'Nobody, not even an expert, knows future prices. When the price moves against him, he loses.' },
              { id: 'c', text: 'Nothing happens, because it was only a hope.', correct: false, coach: 'His contract is real. When the price moves, his account goes up or down.' }
            ]
          }
        ],
        analyst: [
          {
            prompt: 'A trucking company buys fuel futures because rising fuel prices would raise its costs. Which describes the company?',
            choices: [
              { id: 'a', text: 'A hedger reducing a price risk it already has', correct: true, coach: 'Correct. The company buys fuel for its business, so it already faces that risk.' },
              { id: 'b', text: 'A speculator, because it is buying futures', correct: false, coach: 'Buying or selling does not decide the role. What is the reason for the trade?' },
              { id: 'c', text: 'Neither, because only farms can hedge', correct: false, coach: 'Any business with a price risk, like bakeries, airlines or trucking companies, can hedge.' }
            ]
          },
          {
            prompt: 'Ms. Tate buys 1 wheat futures contract (5,000 bushels) at $6.00 per bushel. The price falls to $5.70. Not counting fees, what is her result?',
            choices: [
              { id: 'a', text: 'A loss of $1,500', correct: true, coach: 'Yes: $5.70 − $6.00 = −$0.30 per bushel, and −$0.30 × 5,000 = −$1,500.' },
              { id: 'b', text: 'A gain of $1,500', correct: false, coach: 'She bought, so she needed the price to rise. It fell. Check the sign.' },
              { id: 'c', text: 'A loss of $0.30', correct: false, coach: 'That is per bushel. Multiply by the 5,000 bushels in the contract.' }
            ]
          },
          {
            prompt: 'Which statement is fair and accurate?',
            choices: [
              { id: 'a', text: 'Hedgers and speculators trade for different reasons, and either one can end up worse off than if they had not traded.', correct: true, coach: 'Exactly. A hedger can miss out on a better price; a speculator can lose money, sometimes more than they deposited.' },
              { id: 'b', text: 'Speculators always lose, so they are the bad guys.', correct: false, coach: 'Some speculative trades gain and some lose; nobody knows in advance. Describe the risk honestly, without labels.' },
              { id: 'c', text: 'Hedgers always come out ahead.', correct: false, coach: 'Hedging gives certainty, not the best result. Remember the farmer who missed the higher price in Lesson 1.' }
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
          key: 'lesson-check:w2l3:explorer',
          skill: 'hedgers-speculators',
          difficulty: 'easy',
          band: 'explorer',
          template: 'lesson-check',
          kind: 'scenario',
          type: 'choice',
          prompt: 'A peanut farmer worries peanut prices will fall before harvest, so she locks in a price now. What is she?',
          choices: [
            { id: 'a', text: 'A hedger, because she is protecting against a price worry she already has' },
            { id: 'b', text: 'A speculator, because she made a futures deal', misconception: 'any-trader-is-speculator' },
            { id: 'c', text: 'A speculator, because she is sure to make money', misconception: 'hedging-is-profit' },
            { id: 'd', text: 'Neither, because only bakers can be hedgers', misconception: 'only-bakers-hedge' }
          ],
          answer: 'a',
          hints: [
            'Does the farmer already have a price worry from her work?',
            'One kind of trader makes a risk they already have smaller. The other takes on a new risk.'
          ],
          explanation: 'The farmer grows peanuts, so a falling price could already hurt her. Locking in a price makes that worry smaller. That makes her a hedger.',
          teach: 'Ask one question: does this person already have a price worry from their work? If yes, and they trade to shrink it, they are a hedger. If they have no business with the item and trade to try to make money from price changes, they are a speculator. Both can end up worse off, and nobody is sure to make money.',
          misconceptions: {
            'any-trader-is-speculator': 'Making a deal does not make you a speculator. What matters is why you trade.',
            'hedging-is-profit': 'Nobody is sure to make money. She locked in a price to feel safer, not to win big.',
            'only-bakers-hedge': 'Farmers, bakers and many other businesses can hedge. Anyone protecting a price worry they already have is a hedger.'
          }
        },
        analyst: {
          key: 'lesson-check:w2l3:analyst',
          skill: 'hedgers-speculators',
          difficulty: 'medium',
          band: 'analyst',
          template: 'lesson-check',
          kind: 'concept',
          type: 'choice',
          prompt: 'Which statement about [[speculator|speculators]] is accurate?',
          choices: [
            { id: 'a', text: 'A speculator has no business exposure to the commodity and takes on price risk hoping to profit; speculators can lose money, sometimes more than they first deposited.' },
            { id: 'b', text: 'Speculators always profit because they study the market carefully.', misconception: 'speculators-always-win' },
            { id: 'c', text: 'Anyone who sells futures is a speculator.', misconception: 'direction-decides-role' },
            { id: 'd', text: 'Speculators cannot lose more than the margin they deposit.', misconception: 'margin-is-max-loss' }
          ],
          answer: 'a',
          hints: [
            'What makes someone a speculator: the direction of the trade, or the reason for it?',
            'Recall what the CFTC says happens to many individuals who speculate.'
          ],
          explanation: 'The CFTC describes a speculator as a trader who does not hedge but trades to try to make a profit. Because they take on new price risk, they can lose, and the CFTC warns that many individuals lose all of their money and can owe more than they first invested.',
          teach: 'Hedgers and speculators are defined by why they trade. A hedger already has a price risk and uses futures to reduce it. A speculator has no such risk and takes one on, hoping prices move their way. Studying the market does not remove risk, and margin is not a loss limit.',
          misconceptions: {
            'speculators-always-win': 'Study does not reveal the future. Prices can move against any position, and many speculators lose money.',
            'direction-decides-role': 'Farmers who hedge sell futures too. The reason for the trade, not its direction, decides the role.',
            'margin-is-max-loss': 'Margin is a performance bond, not a limit on losses. Losses can be larger than the deposit.'
          }
        }
      }
    },
    {
      kind: 'next',
      title: 'You Can Tell Them Apart!',
      text: {
        explorer: 'You learned that hedgers protect against a price worry they already have, and speculators take on new risk hoping to make money. Both can end up worse off. Next, find out how people close out a futures deal early.',
        analyst: 'You can classify hedgers and speculators by their reason for trading and calculate a speculator\'s gain or loss. Next: how futures positions are closed out with an opposite trade, and why most never reach delivery.'
      },
      practiceSkills: ['hedgers-speculators']
    }
  ]
};

const W2L4 = {
  id: 'w2l4',
  world: 2,
  number: 4,
  title: 'Closing Out: Why Most Futures Never Reach Delivery',
  status: 'ready',
  skills: ['offset-delivery'],
  prereqs: ['futures-standardization'],
  vocab: ['offset', 'position', 'delivery', 'cash-settlement', 'contract-size', 'short'],
  objectives: {
    explorer: [
      'Explain that you can close out (offset) a futures deal by making the opposite trade.',
      'Find the gain or loss per unit as the difference between the two prices.',
      'Explain that deals that are not closed out end with delivery of the goods or, for some contracts, a cash payment.'
    ],
    analyst: [
      'Identify the trade that offsets a long or short position (same contract, same delivery month, same number of contracts).',
      'Calculate the gain or loss from an offset: price difference × contract size × number of contracts, with the correct sign.',
      'Explain, citing the CFTC, that most futures contracts are offset rather than delivered, and distinguish physical delivery from cash settlement.'
    ]
  },
  minutes: { explorer: 14, analyst: 20 },
  steps: [
    {
      kind: 'discover',
      title: 'Harvest Time, and a Promise to Close',
      text: {
        explorer: [
          'In spring, Farmer Okafor used a wheat futures contract to lock in a price. He agreed to sell wheat in July.',
          'Now it is July. A grain buyer in his own town wants his wheat, which is much easier than shipping it far away.',
          'But he still has his futures promise. Can he end it without delivering any wheat?',
          'Yes! He can make the opposite trade. Most futures contracts end this way.'
        ],
        analyst: [
          'In March, Farmer Okafor sold 2 July wheat futures contracts at a pretend price of $6.50 per bushel to hedge part of his crop. Each contract covers 5,000 bushels, so his futures cover 10,000 bushels.',
          'By July, his wheat is harvested. The grain elevator a few miles from his farm will buy it, which is simpler than delivering it to a delivery location approved by the exchange.',
          'He still holds a [[short]] futures [[position]]. He could keep it until [[delivery]], but there is another way: he can buy 2 July wheat contracts, which cancels, or [[offset|offsets]], the 2 he sold.',
          'This is common. According to the CFTC, "Most futures contracts (by volume) are liquidated by offsetting and do not result in delivery."'
        ]
      },
      image: {
        asset: 'assets/illustrations/w2l4-grain-elevator.webp',
        alt: 'A farmer in a pickup truck loaded with harvested wheat pulls up to a local grain elevator on a sunny summer day, checking his phone.',
        caption: 'Farmer Okafor sells his wheat close to home.'
      }
    },
    {
      kind: 'definition',
      title: 'Offsetting: The Opposite Trade',
      term: 'offset',
      text: {
        explorer: [
          'To [[offset]] means to close out a futures deal by making the opposite trade. If you sold 1 contract, you buy 1. If you bought 1, you sell 1.',
          'The two trades cancel each other out. Your gain or loss is the difference between the two prices.',
          'Some deals that are not closed out end with [[delivery]] of the real goods. Others end with a cash payment instead, called [[cash-settlement]].'
        ],
        analyst: [
          'To [[offset]] (close out) a futures [[position]], you make an equal and opposite trade in the same contract and the same delivery month. The CFTC Glossary describes offset as liquidating a purchase "through the sale of an equal number of contracts of the same delivery month" (or buying back contracts you sold).',
          'Because futures are standardized, a July contract you buy back is identical to the July contract you sold, so the two cancel to zero. The CFTC notes that forward contracts cannot be offset this way.',
          'Your result per unit is the price you sold at minus the price you bought at, whichever trade came first. Multiply by the [[contract-size]] and the number of contracts. Fees are extra.',
          'Positions that are not offset are settled by [[delivery]] of the commodity or, for contracts that allow it, by [[cash-settlement]], where cash changes hands instead of the goods.'
        ]
      },
      keyIdea: {
        explorer: 'You can close out a futures deal with the opposite trade. The gain or loss is the difference between the two prices.',
        analyst: 'Offset = equal and opposite trade, same contract and month. Result = (sell price − buy price) × contract size × number of contracts. Most futures are offset, not delivered.'
      }
    },
    {
      kind: 'visual',
      title: 'Two Trades That Cancel',
      text: {
        explorer: [
          'Farmer Okafor sold in spring and bought in July. The two trades cancel.',
          'He sold for more than he paid to buy back, so his futures deal gained.'
        ],
        analyst: [
          'The wheat price fell between March and July. His short futures gained, while the wheat he sells at the elevator brings less money than it would have in March. The two results partly balance each other: that is the hedge at work.',
          'Check the math: $6.50 − $5.90 = $0.60 per bushel, and $0.60 × 5,000 × 2 = $6,000.'
        ]
      },
      visual: {
        explorer: {
          kind: 'priceTags', title: 'Farmer Okafor closes out (pretend prices)',
          items: [
            { label: 'Spring: sells 1 July contract', price: '$6 per bushel', note: 'A promise to sell wheat in July' },
            { label: 'July: buys 1 July contract', price: '$5 per bushel', note: 'The opposite trade closes it out' },
            { label: 'Result', price: '+$1 per bushel', note: 'He sold for $1 more than he paid to buy back.' }
          ]
        },
        analyst: {
          kind: 'priceTags', title: 'Offsetting a short hedge (pretend prices)',
          items: [
            { label: 'March: sell 2 July contracts', price: '$6.50', note: 'Opens a short position (2 × 5,000 bushels)' },
            { label: 'July: buy 2 July contracts', price: '$5.90', note: 'Equal and opposite trade, same month' },
            { label: 'Result per bushel', price: '+$0.60', note: '$6.50 sold − $5.90 bought' },
            { label: 'Result on the futures', price: '+$6,000', note: '$0.60 × 5,000 × 2, not counting fees' }
          ]
        }
      },
      caption: {
        explorer: 'Opposite trades cancel. The difference between the prices is the gain or loss.',
        analyst: 'Same contract, same month, opposite direction: the position is closed and the difference is the result.'
      }
    },
    {
      kind: 'together',
      title: 'Close It Out',
      intro: {
        explorer: 'Let\'s practice with a pretend practice game. No real money!',
        analyst: 'Find the offsetting trade, then calculate the result with the correct sign.'
      },
      steps: {
        explorer: [
          {
            prompt: 'In a pretend practice game, Jaylen bought 1 contract. How does he close it out?',
            choices: [
              { id: 'a', text: 'Sell 1 contract', correct: true, coach: 'Yes! The opposite of buying 1 is selling 1. The two trades cancel out.' },
              { id: 'b', text: 'Buy 1 more contract', correct: false, coach: 'That makes his deal bigger, not closed. What is the opposite of buying?' },
              { id: 'c', text: 'Tear up the paper and walk away', correct: false, coach: 'A futures deal is a real promise. It ends with the opposite trade or with delivery.' }
            ]
          },
          {
            prompt: 'Jaylen bought at $7 and sold at $9. Did he gain or lose, and how much per unit?',
            choices: [
              { id: 'a', text: 'Gained $2', correct: true, coach: 'Right: he sold for $9 and bought for $7. $9 − $7 = $2.' },
              { id: 'b', text: 'Lost $2', correct: false, coach: 'He sold for more than he paid. Is that a gain or a loss?' },
              { id: 'c', text: 'Gained $16', correct: false, coach: 'That adds the prices. Find the difference by subtracting.' }
            ]
          },
          {
            prompt: 'A futures deal that is NOT closed out can end with...',
            choices: [
              { id: 'a', text: 'delivery of the real goods, or a cash payment for some contracts', correct: true, coach: 'Yes. Delivery is possible, but most deals are closed out before then.' },
              { id: 'b', text: 'a prize for everyone who waited', correct: false, coach: 'There are no prizes. One side gains and the other loses compared with the agreed price.' },
              { id: 'c', text: 'nothing at all, because it just disappears', correct: false, coach: 'Promises do not disappear. The deal ends with delivery or a cash payment.' }
            ]
          }
        ],
        analyst: [
          {
            prompt: 'A trader is [[long]] 3 September corn futures contracts. Which trade offsets the position?',
            choices: [
              { id: 'a', text: 'Sell 3 September corn contracts', correct: true, coach: 'Correct: equal number, opposite direction, same contract and delivery month.' },
              { id: 'b', text: 'Sell 3 December corn contracts', correct: false, coach: 'Offsetting requires the same delivery month. This would leave a September long and a December short.' },
              { id: 'c', text: 'Buy 3 more September corn contracts', correct: false, coach: 'Buying adds to a long position. Offsetting needs the opposite direction.' }
            ]
          },
          {
            prompt: 'She bought the 3 contracts at $4.80 per bushel and sells them at $4.62. Using a pretend contract size of 5,000 bushels, what is her result (not counting fees)?',
            choices: [
              { id: 'a', text: 'A loss of $2,700', correct: true, coach: 'Yes: $4.62 − $4.80 = −$0.18; −$0.18 × 5,000 × 3 = −$2,700.' },
              { id: 'b', text: 'A gain of $2,700', correct: false, coach: 'She sold for less than she paid. Check the sign.' },
              { id: 'c', text: 'A loss of $900', correct: false, coach: 'That is one contract. She had 3.' }
            ]
          },
          {
            prompt: 'Why can a futures position be offset with an opposite trade, while a private forward agreement usually cannot be offset the same way?',
            choices: [
              { id: 'a', text: 'Futures are standardized and cleared, so an opposite contract is identical and cancels the first.', correct: true, coach: 'Exactly. A forward has custom terms and a specific counterparty, so there is no identical contract to cancel against.' },
              { id: 'b', text: 'Forward agreements are against the law.', correct: false, coach: 'Forward agreements are legal and common. The difference is standardization.' },
              { id: 'c', text: 'Futures prices never change, so closing out is free.', correct: false, coach: 'Futures prices change all the time; that is why offsetting produces a gain or loss.' }
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
          key: 'lesson-check:w2l4:explorer',
          skill: 'offset-delivery',
          difficulty: 'easy',
          band: 'explorer',
          template: 'lesson-check',
          kind: 'concept',
          type: 'choice',
          prompt: 'Farmer Okafor sold 1 July wheat futures contract. How can he [[offset|close it out]] before delivery?',
          choices: [
            { id: 'a', text: 'Buy 1 July wheat contract' },
            { id: 'b', text: 'Sell another July wheat contract', misconception: 'same-direction' },
            { id: 'c', text: 'Throw away the contract and walk away', misconception: 'walk-away' },
            { id: 'd', text: 'He cannot. Every futures contract must end with delivery.', misconception: 'always-delivery' }
          ],
          answer: 'a',
          hints: [
            'To close out, you make the opposite trade. What is the opposite of selling?',
            'The new trade should match the old one: same thing, same month, same number.'
          ],
          explanation: 'He sold 1 July contract, so the opposite trade is buying 1 July contract. The two trades cancel, and his deal is closed without delivering any wheat.',
          teach: 'Offsetting means making the opposite trade: if you sold, you buy; if you bought, you sell. It must be the same contract, the same month and the same number of contracts. Most futures deals end this way instead of with delivery.',
          misconceptions: {
            'same-direction': 'Selling again makes his deal bigger. Closing out needs the opposite trade.',
            'walk-away': 'A futures contract is a real promise. You end it with the opposite trade, or by delivery.',
            'always-delivery': 'Delivery is possible, but most futures contracts are closed out with an opposite trade first.'
          }
        },
        analyst: {
          key: 'lesson-check:w2l4:analyst',
          skill: 'offset-delivery',
          difficulty: 'medium',
          band: 'analyst',
          template: 'lesson-check',
          kind: 'math',
          type: 'choice',
          prompt: 'A trader buys 1 wheat futures contract (5,000 bushels) at a pretend price of $5.80 per bushel and later [[offset|offsets]] it by selling 1 contract of the same month at $6.10. Not counting fees, what is the result?',
          choices: [
            { id: 'a', text: 'A gain of $1,500' },
            { id: 'b', text: 'A loss of $1,500', misconception: 'sign-flip' },
            { id: 'c', text: 'A gain of $0.30', misconception: 'forgot-contract-size' },
            { id: 'd', text: 'A gain of $30,500', misconception: 'used-total-value' }
          ],
          answer: 'a',
          hints: [
            'First find the per-bushel difference: the price sold minus the price bought.',
            'Then scale up: one contract covers 5,000 bushels.'
          ],
          explanation: '$6.10 − $5.80 = $0.30 per bushel. One contract covers 5,000 bushels, so $0.30 × 5,000 = $1,500. The trader sold for more than they paid, so it is a gain (before fees).',
          teach: 'For any offset: result per unit = sell price − buy price (it does not matter which came first). Multiply by the contract size and the number of contracts. A positive result is a gain; a negative result is a loss.',
          misconceptions: {
            'sign-flip': 'The trader sold for more than they paid. Is that a gain or a loss?',
            'forgot-contract-size': '$0.30 is per bushel. One contract covers 5,000 bushels.',
            'used-total-value': '$30,500 is the total value of the contract at $6.10. The result is only the difference between the two prices, times the size.'
          }
        }
      }
    },
    {
      kind: 'next',
      title: 'You Closed It Out!',
      text: {
        explorer: 'You learned that a futures deal can be closed with the opposite trade, and that the gain or loss is the difference between the two prices. Practice finding the opposite trade and the difference.',
        analyst: 'You can find the offsetting trade, calculate the result with the correct sign, and explain delivery and cash settlement. That completes World 2. Practice with mixed contract sizes and numbers of contracts.'
      },
      practiceSkills: ['offset-delivery']
    }
  ]
};

const W4L1 = {
  id: 'w4l1',
  world: 4,
  number: 1,
  title: 'Price Over Time: Reading Line Charts',
  status: 'ready',
  skills: ['line-chart-reading'],
  prereqs: ['price-change-math'],
  vocab: ['line-chart', 'axis', 'price-change', 'percent-change', 'trend'],
  objectives: {
    explorer: [
      'Name the two axes of a line chart: time along the bottom, price up the side.',
      'Read the price at one point on a line chart.',
      'Find the highest and lowest points.',
      'Find how much the price went up or down between two points.'
    ],
    analyst: [
      'Read points accurately, paying attention to the scale and the interval between gridlines.',
      'Identify the highest and lowest values and describe the overall direction.',
      'Calculate the change and the percent change between any two points.',
      'Explain how an axis that does not start at zero can make changes look bigger than they are.'
    ]
  },
  minutes: { explorer: 12, analyst: 16 },
  steps: [
    {
      kind: 'discover',
      title: 'Malik\'s Price Notebook',
      text: {
        explorer: [
          'Malik helps Aunt Imani at her corner market. Every Monday for six weeks, he writes down the price of a box of apples.',
          'His notebook is full of numbers, but they are hard to compare. "Is the price going up or down?" he asks.',
          'Aunt Imani says, "Let\'s turn the numbers into a picture. Let\'s make a [[line-chart]]."'
        ],
        analyst: [
          'Malik is helping Aunt Imani plan the fruit orders for her corner market. She asks him to track the price she pays for a crate of apples each week. (All prices in this lesson are pretend.)',
          'After six weeks, his list reads: $5.00, $5.40, $5.25, $5.80, $6.00, $5.70. "So did it go up or down?" he asks. The honest answer: both, depending on which weeks you compare.',
          'A [[line-chart]] turns a list like this into a picture, so the highest point, the lowest point and the overall direction are easier to see at a glance. But reading it well still takes care.'
        ]
      },
      image: {
        asset: 'assets/illustrations/w4l1-price-notebook.webp',
        alt: 'A boy writes in a notebook beside crates of apples in a small corner market while his aunt, at the counter, sketches a simple line on a sheet of graph paper.',
        caption: 'Malik and Aunt Imani turn a list of prices into a picture.'
      }
    },
    {
      kind: 'definition',
      title: 'How to Read a Line Chart',
      term: 'line-chart',
      text: {
        explorer: [
          'A [[line-chart]] shows how a price changes over time. Each dot is one price at one time, and a line connects the dots.',
          'The line along the bottom is an [[axis]] that shows time, like weeks. The line up the side is an axis that shows price.',
          'To read a dot, look straight down to find the time. Then look straight across to find the price.'
        ],
        analyst: [
          'A [[line-chart]] plots values over time. The horizontal [[axis]] (x-axis) shows time in equal steps, weeks here; the vertical axis (y-axis) shows price. Each point is one price at one time, and line segments connect the points.',
          'To read a point, go down to the time axis and across to the price axis. Check the scale first: the gridlines might be $0.25 apart, not $1.',
          'The change between two points is the later price − the earlier price, a [[price-change]]. The [[percent-change]] is that change ÷ the earlier price × 100.',
          'Look at where the price axis starts. If it starts at $5.00 instead of $0, the same change looks much steeper. The numbers, not the steepness of the line, tell you how big a change is.'
        ]
      },
      keyIdea: {
        explorer: 'Time goes along the bottom, price goes up the side. Each dot is one price at one time.',
        analyst: 'Read the axes and the scale first. Change = later − earlier; percent change = change ÷ earlier × 100.'
      }
    },
    {
      kind: 'visual',
      title: 'Malik\'s Line Chart',
      text: {
        explorer: [
          'Find the highest dot and the lowest dot. Which weeks are they?',
          'Now look from Week 5 to Week 6. Does the line go up or down?'
        ],
        analyst: [
          'Find the highest and lowest points, then the change from Week 1 to Week 6.',
          'The price rose overall, but not every week. Most price lines go up and down along the way.'
        ]
      },
      visual: {
        explorer: {
          kind: 'line', title: 'Pretend price of a box of apples', unit: '$',
          points: [{ label: 'Wk 1', value: 4 }, { label: 'Wk 2', value: 5 }, { label: 'Wk 3', value: 7 }, { label: 'Wk 4', value: 6 }, { label: 'Wk 5', value: 8 }, { label: 'Wk 6', value: 6 }]
        },
        analyst: {
          kind: 'line', title: 'Pretend price of a crate of apples', unit: '$',
          points: [{ label: 'Wk 1', value: 5 }, { label: 'Wk 2', value: 5.4 }, { label: 'Wk 3', value: 5.25 }, { label: 'Wk 4', value: 5.8 }, { label: 'Wk 5', value: 6 }, { label: 'Wk 6', value: 5.7 }]
        }
      },
      caption: {
        explorer: 'Six weeks of pretend apple prices. Highest: Week 5. Lowest: Week 1.',
        analyst: 'Overall change from Week 1 to Week 6: +$0.70. Highest: Week 5 ($6.00). Lowest: Week 1 ($5.00).'
      }
    },
    {
      kind: 'together',
      title: 'Read It Together',
      intro: {
        explorer: 'Use Malik\'s chart to answer these together.',
        analyst: 'Use Malik\'s chart. Watch the decimals and the signs.'
      },
      steps: {
        explorer: [
          {
            prompt: 'Which week had the lowest price?',
            choices: [
              { id: 'a', text: 'Week 1 ($4)', correct: true, coach: 'Yes! Week 1 is the dot closest to the bottom of the chart.' },
              { id: 'b', text: 'Week 6', correct: false, coach: 'Week 6 is the last dot, not the lowest. Look for the dot closest to the bottom.' },
              { id: 'c', text: 'Week 3', correct: false, coach: 'Week 3 is $7. Look for the dot with the smallest price.' }
            ]
          },
          {
            prompt: 'How much did the price change from Week 1 ($4) to Week 3 ($7)?',
            choices: [
              { id: 'a', text: 'Up $3', correct: true, coach: 'Right: $7 − $4 = $3, and the line went up.' },
              { id: 'b', text: 'Down $3', correct: false, coach: 'The price went from $4 to $7. Is $7 more or less than $4?' },
              { id: 'c', text: 'Up $11', correct: false, coach: 'That adds the prices. Find the difference by subtracting.' }
            ]
          },
          {
            prompt: 'From Week 5 to Week 6, did the line go up or down?',
            choices: [
              { id: 'a', text: 'Up', correct: false, coach: 'Week 5 is $8 and Week 6 is $6. Which is lower?' },
              { id: 'b', text: 'Down', correct: true, coach: 'Yes. It went from $8 down to $6, a drop of $2.' }
            ]
          }
        ],
        analyst: [
          {
            prompt: 'What was the [[price-change]] from Week 2 to Week 5?',
            choices: [
              { id: 'a', text: '+$0.60', correct: true, coach: 'Correct: $6.00 − $5.40 = +$0.60.' },
              { id: 'b', text: '−$0.60', correct: false, coach: 'Later minus earlier: $6.00 − $5.40. Is that positive or negative?' },
              { id: 'c', text: '+$1.00', correct: false, coach: 'That is the change from Week 1 ($5.00). Start from Week 2.' }
            ]
          },
          {
            prompt: 'What was the [[percent-change]] from Week 1 to Week 5?',
            choices: [
              { id: 'a', text: '20%', correct: true, coach: 'Yes: change $1.00 ÷ starting price $5.00 = 0.20 = 20%.' },
              { id: 'b', text: 'About 16.7%', correct: false, coach: 'That divides by the later price ($6.00). Percent change divides by the starting price.' },
              { id: 'c', text: '1%', correct: false, coach: 'The change is $1.00, but percent change compares it with the starting price. Divide, then × 100.' }
            ]
          },
          {
            prompt: 'Suppose a chart\'s price [[axis]] starts at $4.50 instead of $0. What should a careful reader do?',
            choices: [
              { id: 'a', text: 'Read the actual numbers, because the line will look steeper than the change really is.', correct: true, coach: 'Exactly. A cut-off axis stretches changes. The numbers tell the real size.' },
              { id: 'b', text: 'Assume the prices on the chart are wrong.', correct: false, coach: 'The prices can be right. Only the picture is stretched.' },
              { id: 'c', text: 'Assume the price has never been below $4.50.', correct: false, coach: 'The axis only covers the time shown. It says nothing about other times.' }
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
          key: 'lesson-check:w4l1:explorer',
          skill: 'line-chart-reading',
          difficulty: 'easy',
          band: 'explorer',
          template: 'lesson-check',
          kind: 'chart',
          type: 'choice',
          prompt: 'Look at the [[line-chart]]. On which day was the pretend price of a melon highest?',
          visual: {
            kind: 'line', title: 'Pretend price of a melon', unit: '$',
            points: [{ label: 'Mon', value: 3 }, { label: 'Tue', value: 5 }, { label: 'Wed', value: 4 }, { label: 'Thu', value: 7 }, { label: 'Fri', value: 6 }]
          },
          choices: [
            { id: 'a', text: 'Thursday' },
            { id: 'b', text: 'Friday', misconception: 'last-is-highest' },
            { id: 'c', text: 'Monday', misconception: 'high-low-swap' },
            { id: 'd', text: 'Tuesday', misconception: 'first-rise' }
          ],
          answer: 'a',
          hints: [
            'Find the dot that sits closest to the top of the chart.',
            'Look straight down from that dot to read the day.'
          ],
          explanation: 'Thursday\'s dot is the highest on the chart, at $7. The price fell a little on Friday, to $6.',
          teach: 'On a line chart, higher dots mean higher prices. To find the highest price, find the dot closest to the top, then look down to the time axis to see when it happened. The last dot is not always the highest.',
          misconceptions: {
            'last-is-highest': 'Friday is the last dot, but it is lower than the one before it. Compare the heights of all the dots.',
            'high-low-swap': 'Monday is the lowest dot, closest to the bottom. Highest means closest to the top.',
            'first-rise': 'The price went up on Tuesday, but it went even higher later. Find the very top dot.'
          }
        },
        analyst: {
          key: 'lesson-check:w4l1:analyst',
          skill: 'line-chart-reading',
          difficulty: 'medium',
          band: 'analyst',
          template: 'lesson-check',
          kind: 'chart',
          type: 'choice',
          prompt: 'Using the [[line-chart]], what was the [[percent-change]] in the pretend price of oats from Week 1 to Week 4?',
          visual: {
            kind: 'line', title: 'Pretend price of a bushel of oats', unit: '$',
            points: [{ label: 'Wk 1', value: 4 }, { label: 'Wk 2', value: 4.2 }, { label: 'Wk 3', value: 3.9 }, { label: 'Wk 4', value: 4.4 }, { label: 'Wk 5', value: 4.6 }, { label: 'Wk 6', value: 4.3 }]
          },
          choices: [
            { id: 'a', text: '+10%' },
            { id: 'b', text: 'About +9.1%', misconception: 'divided-by-new' },
            { id: 'c', text: '+40%', misconception: 'decimal-place' },
            { id: 'd', text: '+0.4%', misconception: 'forgot-times-100' }
          ],
          answer: 'a',
          hints: [
            'Read the two prices first, then find the change: later − earlier.',
            'Divide the change by the STARTING price, then multiply by 100.'
          ],
          explanation: 'Week 1 is $4.00 and Week 4 is $4.40. The change is +$0.40. $0.40 ÷ $4.00 = 0.10, and 0.10 × 100 = 10%, so the price rose 10%.',
          teach: 'Percent change = (later − earlier) ÷ earlier × 100. Always divide by the starting value, keep the sign (+ for up, − for down), and check that the size makes sense: a 40-cent rise on a $4 price is a small fraction, not 40%.',
          misconceptions: {
            'divided-by-new': 'You divided by the later price ($4.40). Percent change divides by the starting price.',
            'decimal-place': 'The change is $0.40, not $1.60. Compare $0.40 with $4.00: is that 40% or a smaller part?',
            'forgot-times-100': '$0.40 ÷ $4.00 = 0.10. To turn that into a percent, multiply by 100.'
          }
        }
      }
    },
    {
      kind: 'next',
      title: 'You Can Read a Line Chart!',
      text: {
        explorer: 'You learned to read the axes, find the highest and lowest dots, and find the change between two points. Next, meet a chart that shows even more about each day: the candlestick.',
        analyst: 'You can read points carefully, find highs, lows, changes and percent changes, and spot a stretched axis. Next: candlestick charts, which show four prices for every period.'
      },
      practiceSkills: ['line-chart-reading']
    }
  ]
};

const W4L2 = {
  id: 'w4l2',
  world: 4,
  number: 2,
  title: 'Candlesticks: Open, High, Low, Close',
  status: 'ready',
  skills: ['candlestick-reading'],
  prereqs: ['line-chart-reading'],
  vocab: ['candlestick', 'ohlc', 'open-price', 'high-price', 'low-price', 'close-price', 'candle-body', 'wick', 'price-range'],
  objectives: {
    explorer: [
      'Explain that one candle shows one time period, like one day.',
      'Find the open, high, low and close on a candle.',
      'Tell whether a candle is an up candle or a down candle.'
    ],
    analyst: [
      'Identify the open, high, low and close of a candlestick, using the body for open and close and the wicks for high and low.',
      'Classify up and down candles by comparing close with open, and explain that chart colors vary, so a key must be checked.',
      'Calculate a period\'s range (high − low) and its open-to-close change.'
    ]
  },
  minutes: { explorer: 14, analyst: 18 },
  steps: [
    {
      kind: 'discover',
      title: 'Charts That Look Like Candles',
      text: {
        explorer: [
          'Nia\'s after-school Market Club is looking at a new kind of chart. Instead of dots, it has little boxes with thin lines sticking out.',
          '"They look like candles!" says Nia. Ms. Brooks nods. "That is why they are called [[candlestick|candlesticks]]."',
          'Each candle tells a story about one day of prices. It shows where the price started, where it ended, and how high and low it went.'
        ],
        analyst: [
          'At Market Club, Ms. Brooks puts up two charts of the same three days of pretend corn prices. The line chart shows one price per day. The other chart is a row of shapes that look like candles.',
          '"Our line chart shows one price per day," she explains. "A [[candlestick]] packs four prices into each day: where trading started, the highest and lowest prices reached, and where it ended."',
          'Nia notices something the line chart hid: on Tuesday the price climbed high during the day, then fell back before the end of the day. The candle shows the whole trip; the line shows only the end.'
        ]
      },
      image: {
        asset: 'assets/illustrations/w4l2-market-club.webp',
        alt: 'A teacher points to a large screen showing a simple candlestick chart while a group of middle-school students in an after-school club lean in, one girl pointing at a candle.',
        caption: 'Nia and Market Club meet candlestick charts.'
      }
    },
    {
      kind: 'definition',
      title: 'Four Prices in One Candle',
      term: 'candlestick',
      text: {
        explorer: [
          'A [[candlestick]] shows four prices for one time period, like one day. They are the [[open-price|open]], the [[high-price|high]], the [[low-price|low]] and the [[close-price|close]].',
          'The thick box is the [[candle-body|body]]. It goes from the open price to the close price.',
          'The thin lines are the [[wick|wicks]]. The top of the top wick is the high, and the bottom of the bottom wick is the low.',
          'If the close is higher than the open, it is an up candle. If the close is lower than the open, it is a down candle.'
        ],
        analyst: [
          'A [[candlestick]] summarizes one time period (a day, an hour, a week) with four prices, often called [[ohlc|OHLC]]: the [[open-price|open]] (first price), [[high-price|high]], [[low-price|low]] and [[close-price|close]] (last price).',
          'The [[candle-body|body]] spans the open and the close. The thin lines above and below, called [[wick|wicks]] or shadows, reach up to the high and down to the low.',
          'If the close is above the open, it is an up candle: the bottom of the body is the open and the top is the close. If the close is below the open, it is a down candle: the top of the body is the open and the bottom is the close.',
          'Charts mark up and down candles in different ways: many use colors such as green and red, and some use hollow and filled bodies. In Market Minds, up candles are hollow with ▲ and down candles are filled with ▼. Always check the chart\'s key. A period\'s [[price-range|range]] is high − low.'
        ]
      },
      keyIdea: {
        explorer: 'One candle = one time period. The body shows open and close; the wicks reach the high and the low.',
        analyst: 'Body = open to close; wicks = high and low; up or down comes from close vs. open, not from a color. Range = high − low.'
      }
    },
    {
      kind: 'visual',
      title: 'Three Days of Candles',
      text: {
        explorer: [
          'Monday\'s candle is hollow with ▲, so the price closed higher than it opened. Tuesday and Wednesday are filled with ▼, so they closed lower.',
          'Other charts may use colors like green and red instead. Always check the key.'
        ],
        analyst: [
          'Tuesday\'s long upper wick shows the price reached $4.80 during the day but closed at $4.45. A line of closing prices would hide that trip.',
          'Read each candle: Is it up or down? What were its high and low? What is its range?'
        ]
      },
      visual: {
        explorer: {
          kind: 'candles', title: 'Pretend corn prices, three days', unit: '$',
          candles: [
            { label: 'Mon', open: 10, high: 13, low: 9, close: 12 },
            { label: 'Tue', open: 12, high: 15, low: 11, close: 11 },
            { label: 'Wed', open: 11, high: 12, low: 8, close: 9 }
          ]
        },
        analyst: {
          kind: 'candles', title: 'Pretend corn prices per bushel, three days', unit: '$',
          candles: [
            { label: 'Mon', open: 4.2, high: 4.45, low: 4.1, close: 4.4 },
            { label: 'Tue', open: 4.4, high: 4.8, low: 4.35, close: 4.45 },
            { label: 'Wed', open: 4.45, high: 4.5, low: 4.15, close: 4.2 }
          ]
        }
      },
      caption: {
        explorer: 'Up candles are hollow with ▲. Down candles are filled with ▼.',
        analyst: 'Monday and Tuesday closed above their opens (up); Wednesday closed below its open (down).'
      }
    },
    {
      kind: 'together',
      title: 'Read the Candles Together',
      intro: {
        explorer: 'Use the three candles to answer these together. Tap "Show the numbers" under the chart if you want to check.',
        analyst: 'Use the three candles. Remember: up or down comes from close vs. open.'
      },
      steps: {
        explorer: [
          {
            prompt: 'Look at Monday\'s up candle. What was the [[open-price|open]] price?',
            choices: [
              { id: 'a', text: '$10', correct: true, coach: 'Yes! On an up candle, the open is at the bottom of the body.' },
              { id: 'b', text: '$13', correct: false, coach: '$13 is the top of the top wick. That is the high.' },
              { id: 'c', text: '$12', correct: false, coach: 'On an up candle, the top of the body is the close. Where does the body start?' }
            ]
          },
          {
            prompt: 'What was the lowest price on Wednesday?',
            choices: [
              { id: 'a', text: '$8', correct: true, coach: 'Right. The bottom of the bottom wick is the low.' },
              { id: 'b', text: '$9', correct: false, coach: '$9 is the bottom of the body, which is the close on a down candle. The wick goes lower.' },
              { id: 'c', text: '$11', correct: false, coach: '$11 is where Wednesday opened. Look at the bottom of the wick.' }
            ]
          },
          {
            prompt: 'Is Tuesday an up candle or a down candle?',
            choices: [
              { id: 'a', text: 'Up', correct: false, coach: 'It went up to $15 during the day, but compare the close ($11) with the open ($12).' },
              { id: 'b', text: 'Down', correct: true, coach: 'Yes. It closed at $11, lower than its $12 open, even though it went high during the day.' }
            ]
          }
        ],
        analyst: [
          {
            prompt: 'What is Tuesday\'s [[price-range|range]]?',
            choices: [
              { id: 'a', text: '$0.45', correct: true, coach: 'Correct: high $4.80 − low $4.35 = $0.45.' },
              { id: 'b', text: '$0.05', correct: false, coach: 'That is close − open, the size of the body. Range uses the high and the low.' },
              { id: 'c', text: '$9.15', correct: false, coach: 'That adds the high and the low. Range is a difference.' }
            ]
          },
          {
            prompt: 'Wednesday opened at $4.45 and closed at $4.20. Which describes it?',
            choices: [
              { id: 'a', text: 'A down candle that closed $0.25 below its open', correct: true, coach: 'Yes: $4.20 − $4.45 = −$0.25.' },
              { id: 'b', text: 'An up candle, because its high ($4.50) is above its open', correct: false, coach: 'Up or down depends on close vs. open, not on the high.' },
              { id: 'c', text: 'A down candle that closed $0.30 below its open', correct: false, coach: 'Recheck the subtraction: $4.45 − $4.20.' }
            ]
          },
          {
            prompt: 'On a different website, up candles are green and down candles are red. What should you do?',
            choices: [
              { id: 'a', text: 'Check the chart\'s key; up or down always comes from comparing the close with the open.', correct: true, coach: 'Exactly. Colors and fills vary by chart; the open-close rule does not.' },
              { id: 'b', text: 'Assume green always means down, like in Market Minds.', correct: false, coach: 'Market Minds uses hollow ▲ and filled ▼, not colors. Each chart has its own key.' },
              { id: 'c', text: 'Ignore the candles and just guess.', correct: false, coach: 'The candles hold real information. Use the key and the numbers.' }
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
          key: 'lesson-check:w4l2:explorer',
          skill: 'candlestick-reading',
          difficulty: 'easy',
          band: 'explorer',
          template: 'lesson-check',
          kind: 'chart',
          type: 'choice',
          prompt: 'Look at this [[candlestick]]. What was the highest price that day?',
          visual: { kind: 'candles', title: 'Pretend price, one day', unit: '$', candles: [{ label: 'Day 1', open: 6, high: 9, low: 5, close: 8 }] },
          choices: [
            { id: 'a', text: '$9' },
            { id: 'b', text: '$8', misconception: 'close-as-high' },
            { id: 'c', text: '$5', misconception: 'low-as-high' },
            { id: 'd', text: '$6', misconception: 'open-as-high' }
          ],
          answer: 'a',
          hints: [
            'The highest price is not on the body. Look above it.',
            'Follow the thin line on top all the way to its end, then read across to the price.'
          ],
          explanation: 'The top of the upper wick marks the high, which is $9. The body only goes from the open ($6) to the close ($8).',
          teach: 'A candle shows four prices. The body goes from the open to the close. The top wick reaches the high, and the bottom wick reaches the low. To find the high, always look at the very top of the top wick.',
          misconceptions: {
            'close-as-high': '$8 is the top of the body, which is the close on an up candle. The wick goes higher.',
            'low-as-high': '$5 is the bottom of the bottom wick, the lowest price. Look at the top.',
            'open-as-high': '$6 is where the price started (the open). The highest price is above the body.'
          }
        },
        analyst: {
          key: 'lesson-check:w4l2:analyst',
          skill: 'candlestick-reading',
          difficulty: 'medium',
          band: 'analyst',
          template: 'lesson-check',
          kind: 'chart',
          type: 'choice',
          prompt: 'Read the [[candlestick]]. Which statement is accurate?',
          visual: { kind: 'candles', title: 'Pretend price, one day', unit: '$', candles: [{ label: 'Friday', open: 24.5, high: 26, low: 23.75, close: 24 }] },
          choices: [
            { id: 'a', text: 'It is a down candle: it closed $0.50 below its open, and its range was $2.25.' },
            { id: 'b', text: 'It is an up candle, because the high is above the open.', misconception: 'high-means-up' },
            { id: 'c', text: 'Its range was $0.50.', misconception: 'body-as-range' },
            { id: 'd', text: 'It shows the price will fall again next period.', misconception: 'candle-predicts' }
          ],
          answer: 'a',
          hints: [
            'Compare the close with the open to decide up or down.',
            'Range uses the two ends of the wicks, not the body.'
          ],
          explanation: 'Close $24.00 is below open $24.50, so it is a down candle that closed $0.50 lower. The range is high $26.00 − low $23.75 = $2.25.',
          teach: 'Up or down comes from close vs. open. The body size is |close − open|; the range is high − low. A candle describes one period that already happened; it does not tell you what the next period will do.',
          misconceptions: {
            'high-means-up': 'Almost every candle has a high above its open. Up or down depends on where it closed compared with where it opened.',
            'body-as-range': '$0.50 is the body (open − close). Range is high − low.',
            'candle-predicts': 'A candle records the past. No single candle can tell you the next price.'
          }
        }
      }
    },
    {
      kind: 'next',
      title: 'You Can Read Candlesticks!',
      text: {
        explorer: 'You learned that one candle shows one time period, and how to find the open, high, low and close. Next, learn what it means to be long or short.',
        analyst: 'You can read OHLC from a candle, classify up and down candles by close vs. open, and calculate range. Next: long and short positions, and who gains or loses when prices move.'
      },
      practiceSkills: ['candlestick-reading']
    }
  ]
};

const W4L3 = {
  id: 'w4l3',
  world: 4,
  number: 3,
  title: 'Long and Short',
  status: 'ready',
  skills: ['long-short'],
  prereqs: ['price-change-math'],
  vocab: ['long', 'short', 'position', 'gain', 'loss', 'contract-size'],
  objectives: {
    explorer: [
      'Explain that being long means you are helped if the price goes up and hurt if it goes down.',
      'Explain that being short means you are helped if the price goes down and hurt if it goes up.',
      'Find how many points a long or a short gains or loses in a pretend game.'
    ],
    analyst: [
      'Define long and short positions using the CFTC Glossary.',
      'Calculate per-unit and per-contract gains and losses for long and short positions, with the correct sign.',
      'Explain that both long and short positions carry real risk.'
    ]
  },
  minutes: { explorer: 12, analyst: 18 },
  steps: [
    {
      kind: 'discover',
      title: 'The Paper-Points Game',
      text: {
        explorer: [
          'At Market Club, Ms. Brooks starts a pretend game with paper points, not real money. The pretend price of a bag of rice starts at $5.',
          'Deja chooses to be long. She gains points if the price goes up and loses points if it goes down.',
          'Jaylen chooses to be short. He gains points if the price goes down and loses points if it goes up.',
          '"Which one of us is right?" asks Jaylen. Ms. Brooks says, "Nobody knows yet, and both of you can lose points."'
        ],
        analyst: [
          'Remember Ms. Harris and Farmer Okafor? When Ms. Harris bought wheat futures, she was on the buying side. When the farmer sold wheat futures, he was on the selling side. Traders have short names for these two sides.',
          'The buying side is called [[long]]: a long position gains when the price rises and loses when it falls. The selling side is called [[short]]: a short position gains when the price falls and loses when it rises.',
          'At Market Club, Ms. Brooks runs a paper-points game with a pretend rice contract, so students can see both sides without any real money. Deja goes long, Jaylen goes short, and the starting pretend price is $5.00 per unit.',
          '"One of you will gain and one will lose," Ms. Brooks says, "and neither of you knows which yet."'
        ]
      },
      image: {
        asset: 'assets/illustrations/w4l3-paper-points-game.webp',
        alt: 'Two students sit across a classroom table holding paper scorecards, one pointing up and one pointing down, while their teacher writes on a whiteboard with an up arrow and a down arrow.',
        caption: 'Deja goes long and Jaylen goes short in a paper-points game.'
      }
    },
    {
      kind: 'definition',
      title: 'Long and Short',
      term: 'long',
      text: {
        explorer: [
          'Being [[long]] means you are on the buying side. You are helped if the price goes up and hurt if it goes down.',
          'Being [[short]] means you are on the selling side. You are helped if the price goes down and hurt if it goes up.',
          'For a long, the change is the new price minus the starting price. For a short, flip it around: the starting price minus the new price.'
        ],
        analyst: [
          'The CFTC Glossary defines a [[long]] as "one who has bought a futures contract to establish a market position" and a [[short]] as "the selling side of an open futures contract."',
          'Long result per unit = exit price − entry price. Short result per unit = entry price − exit price. A positive result is a [[gain]]; a negative result is a [[loss]].',
          'For a contract, multiply the per-unit result by the [[contract-size]] and by the number of contracts. In this lesson, a pretend rice contract covers 1,000 units.',
          'Neither side is safe. A long loses if the price falls; a short loses if the price rises, and there is no top limit on how high a price can go. Both positions carry real risk.'
        ]
      },
      keyIdea: {
        explorer: 'Long is helped when the price goes up. Short is helped when the price goes down. Both can lose.',
        analyst: 'Long: exit − entry. Short: entry − exit. Multiply by contract size and number of contracts, and keep the sign.'
      }
    },
    {
      kind: 'visual',
      title: 'Same Price Move, Opposite Results',
      text: {
        explorer: [
          'When the price goes up, the long side gains and the short side loses the same amount.',
          'When the price goes down, they switch.'
        ],
        analyst: [
          'For every price move, the long and the short have results of equal size and opposite sign.',
          'Check each row: price change × 1,000 units, with the sign flipped for the short.'
        ]
      },
      visual: {
        explorer: {
          kind: 'priceTags', title: 'Pretend rice price starts at $5',
          items: [
            { label: 'Price goes up to $8: Deja (long)', price: '+3 points', note: 'Up helps the long side.' },
            { label: 'Price goes up to $8: Jaylen (short)', price: '−3 points', note: 'Up hurts the short side.' },
            { label: 'Price goes down to $2: Deja (long)', price: '−3 points', note: 'Down hurts the long side.' },
            { label: 'Price goes down to $2: Jaylen (short)', price: '+3 points', note: 'Down helps the short side.' }
          ]
        },
        analyst: {
          kind: 'priceTags', title: 'Pretend rice contract: start $5.00, 1,000 units per contract',
          items: [
            { label: 'Rises to $5.40: long', price: '+$400', note: '(+$0.40) × 1,000' },
            { label: 'Rises to $5.40: short', price: '−$400', note: '(−$0.40) × 1,000' },
            { label: 'Falls to $4.70: long', price: '−$300', note: '(−$0.30) × 1,000' },
            { label: 'Falls to $4.70: short', price: '+$300', note: '(+$0.30) × 1,000' }
          ]
        }
      },
      caption: {
        explorer: 'Pretend points only. Up helps long; down helps short.',
        analyst: 'Pretend numbers. Long and short results are equal in size and opposite in sign (before fees).'
      }
    },
    {
      kind: 'together',
      title: 'Who Gains? Who Loses?',
      intro: {
        explorer: 'Deja is long and Jaylen is short. The pretend price starts at $5.',
        analyst: 'Use a pretend contract size of 1,000 units. Keep track of the signs.'
      },
      steps: {
        explorer: [
          {
            prompt: 'The price goes from $5 to $7. Who gains points?',
            choices: [
              { id: 'a', text: 'Deja, who is long', correct: true, coach: 'Yes! The price went up, and up helps the long side.' },
              { id: 'b', text: 'Jaylen, who is short', correct: false, coach: 'Short is helped when the price goes down. Did it go up or down?' },
              { id: 'c', text: 'Both of them', correct: false, coach: 'They are on opposite sides. When one gains, the other loses.' }
            ]
          },
          {
            prompt: 'The price goes from $5 to $3. How many points does Jaylen (short) gain or lose?',
            choices: [
              { id: 'a', text: 'Gains 2 points', correct: true, coach: 'Right. The price fell $2, and a fall helps the short side.' },
              { id: 'b', text: 'Loses 2 points', correct: false, coach: 'The price went down. Does down help or hurt the short side?' },
              { id: 'c', text: 'Gains 8 points', correct: false, coach: 'That adds the prices. Find the difference between $5 and $3.' }
            ]
          },
          {
            prompt: 'Can someone who is long lose points?',
            choices: [
              { id: 'a', text: 'Yes, if the price goes down.', correct: true, coach: 'Exactly. Both sides can lose. That is why it is called risk.' },
              { id: 'b', text: 'No, being long is always safe.', correct: false, coach: 'If the price falls, the long side loses. No side is always safe.' }
            ]
          }
        ],
        analyst: [
          {
            prompt: 'Deja is [[long]] 1 pretend contract at $5.00. She exits at $5.25. What is her result?',
            choices: [
              { id: 'a', text: '+$250', correct: true, coach: 'Correct: ($5.25 − $5.00) × 1,000 = +$250.' },
              { id: 'b', text: '−$250', correct: false, coach: 'For a long, result = exit − entry. Is $5.25 − $5.00 positive or negative?' },
              { id: 'c', text: '+$0.25', correct: false, coach: 'That is per unit. Multiply by the 1,000 units in the contract.' }
            ]
          },
          {
            prompt: 'Jaylen is [[short]] 1 pretend contract at $5.00. The price rises to $5.25 and he exits. What is his result?',
            choices: [
              { id: 'a', text: '−$250', correct: true, coach: 'Yes: entry − exit = $5.00 − $5.25 = −$0.25, × 1,000 = −$250.' },
              { id: 'b', text: '+$250', correct: false, coach: 'A short is hurt when the price rises. Check the sign.' },
              { id: 'c', text: '$0, because shorts do not own anything', correct: false, coach: 'A short position is real and gains or loses as the price moves.' }
            ]
          },
          {
            prompt: 'A trader is short 2 pretend contracts at $7.50 and exits at $7.10. What is the result?',
            choices: [
              { id: 'a', text: '+$800', correct: true, coach: 'Right: ($7.50 − $7.10) × 1,000 × 2 = +$800.' },
              { id: 'b', text: '+$400', correct: false, coach: 'That is one contract. The trader had 2.' },
              { id: 'c', text: '−$800', correct: false, coach: 'The price fell, and a fall helps a short. Check the sign.' }
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
          key: 'lesson-check:w4l3:explorer',
          skill: 'long-short',
          difficulty: 'easy',
          band: 'explorer',
          template: 'lesson-check',
          kind: 'scenario',
          type: 'choice',
          prompt: 'In the paper-points game, Jaylen is [[short]]. The pretend price goes up from $5 to $8. What happens to Jaylen?',
          choices: [
            { id: 'a', text: 'He loses 3 points, because a price rise hurts the short side.' },
            { id: 'b', text: 'He gains 3 points, because the price moved.', misconception: 'any-move-gains' },
            { id: 'c', text: 'He gains 3 points, because short means the price goes up.', misconception: 'short-backwards' },
            { id: 'd', text: 'Nothing happens, because the short side cannot lose.', misconception: 'short-no-risk' }
          ],
          answer: 'a',
          hints: [
            'Which price direction helps the short side?',
            'Did the price go up or down? Then find the difference between $5 and $8.'
          ],
          explanation: 'A short is helped when the price goes down and hurt when it goes up. The price rose $3, so Jaylen loses 3 points.',
          teach: 'Long: helped by a rise, hurt by a fall. Short: helped by a fall, hurt by a rise. To find how much, subtract the two prices. Both sides can lose.',
          misconceptions: {
            'any-move-gains': 'A price move helps one side and hurts the other. Which side does a rise help?',
            'short-backwards': 'It is the long side that is helped when the price goes up. Short is the opposite.',
            'short-no-risk': 'Both sides can lose. A short loses when the price goes up.'
          }
        },
        analyst: {
          key: 'lesson-check:w4l3:analyst',
          skill: 'long-short',
          difficulty: 'medium',
          band: 'analyst',
          template: 'lesson-check',
          kind: 'math',
          type: 'choice',
          prompt: 'A trader is [[long]] 3 pretend contracts (1,000 units each) at $4.80. The price falls to $4.65 and the trader exits. What is the result, before fees?',
          choices: [
            { id: 'a', text: '−$450' },
            { id: 'b', text: '+$450', misconception: 'sign-flip' },
            { id: 'c', text: '−$150', misconception: 'forgot-contract-count' },
            { id: 'd', text: '−$0.15', misconception: 'forgot-contract-size' }
          ],
          answer: 'a',
          hints: [
            'For a long, result per unit = exit − entry. Watch the sign.',
            'Scale the per-unit result by the units in one contract, then by the number of contracts.'
          ],
          explanation: 'Exit − entry = $4.65 − $4.80 = −$0.15 per unit. × 1,000 units = −$150 per contract, × 3 contracts = −$450. The price fell, so the long position lost.',
          teach: 'Long result = (exit − entry) × contract size × number of contracts. Short result = (entry − exit) × contract size × number of contracts. Find the per-unit result, attach the sign, then scale up twice.',
          misconceptions: {
            'sign-flip': 'The price fell, and a fall hurts a long. The result should be negative.',
            'forgot-contract-count': '−$150 is one contract. The trader had 3.',
            'forgot-contract-size': '−$0.15 is per unit. Each contract covers 1,000 units.'
          }
        }
      }
    },
    {
      kind: 'next',
      title: 'Long, Short and Risk!',
      text: {
        explorer: 'You learned that long is helped by a rise, short is helped by a fall, and both can lose. Next, find out what charts can and cannot tell you.',
        analyst: 'You can calculate long and short results with the correct sign and scale them by contract size. Next: why no chart can tell you which side will win.'
      },
      practiceSkills: ['long-short']
    }
  ]
};

const W4L4 = {
  id: 'w4l4',
  world: 4,
  number: 4,
  title: 'What Charts Cannot Tell You',
  status: 'ready',
  skills: ['chart-limits'],
  prereqs: ['line-chart-reading'],
  vocab: ['trend', 'pattern', 'uncertainty', 'supply'],
  objectives: {
    explorer: [
      'Explain that a chart shows what prices did in the past, not what they will do.',
      'Give an example of surprise news that can change a price.',
      'Explain that "I do not know yet" and "I will wait" can be smart answers.'
    ],
    analyst: [
      'Separate a description of a chart (what happened) from a prediction (a guess about what will happen).',
      'Explain why trends and patterns can fail, including the role of new information.',
      'Recognize "not enough information" and "wait" as legitimate conclusions.'
    ]
  },
  minutes: { explorer: 12, analyst: 16 },
  steps: [
    {
      kind: 'discover',
      title: 'The Chart Did Not Warn Him',
      text: {
        explorer: [
          'Malik has been watching a chart of the pretend price of orange juice. It went up four days in a row.',
          '"It will go up again tomorrow for sure!" he says. Aunt Imani asks, "How do you know?"',
          'The next morning, the news says farmers grew a huge crop of oranges. The price drops.',
          'Malik frowns. "The chart did not warn me!" Aunt Imani says, "A chart shows the past, not the future."'
        ],
        analyst: [
          'Malik has been following a chart of the pretend price of orange juice. Four days in a row, the price rose: $2.00, $2.10, $2.25, $2.40.',
          '"It is on a [[trend]]," he says. "Tomorrow has to be higher." Aunt Imani asks him to write his prediction in her notebook and explain how he knows.',
          'The next morning, a pretend crop report says the orange harvest will be much bigger than expected. With more [[supply]] on the way, the price falls to $2.05. Nothing on the chart could have told Malik that report was coming.',
          'Aunt Imani is not trying to make him feel bad. "A chart is a record of what already happened," she says. "It helps you ask good questions. It cannot answer the question everyone wants answered: what happens next?"'
        ]
      },
      image: {
        asset: 'assets/illustrations/w4l4-surprise-news.webp',
        alt: 'A boy at a kitchen table looks surprised at a tablet showing a rising line chart, while his aunt points to a newspaper photo of an orange grove heavy with fruit.',
        caption: 'Surprise news changes the price of orange juice.'
      }
    },
    {
      kind: 'definition',
      title: 'Trends and Patterns Describe the Past',
      term: 'pattern',
      text: {
        explorer: [
          'A [[trend]] is the way a price has mostly been moving, like mostly up. A [[pattern]] is a shape people notice on a chart.',
          'Trends and patterns describe the past. They do not promise what happens next, because news and surprises can change prices at any time.',
          'Sometimes the smartest answer is "I do not know yet" or "I will wait." That is not giving up; it is being honest about [[uncertainty]].'
        ],
        analyst: [
          'A [[trend]] is the overall direction of prices over a period. A [[pattern]] is a shape or repeated behavior people notice in a chart. Both describe the past.',
          'When commodity trading advisors show their past trading results, CFTC rules require them to include this statement: "PAST PERFORMANCE IS NOT NECESSARILY INDICATIVE OF FUTURE RESULTS." The same idea applies to price charts: what a price did does not decide what it will do.',
          'Prices react to new information: weather, crop reports, world events, and shifts in supply and demand. New information is, by definition, not on the chart yet. That is why a pattern that seemed to "work" before can fail without warning.',
          'Careful thinkers separate what the chart shows (a description) from what they guess (a prediction). They treat "not enough information" and "wait" as legitimate answers, not as failures.'
        ]
      },
      keyIdea: {
        explorer: 'A chart shows what already happened. Nobody, and no chart, knows tomorrow\'s price for sure.',
        analyst: 'Charts describe; they do not predict. Past prices are not necessarily indicative of future prices, and new information can break any trend or pattern.'
      }
    },
    {
      kind: 'visual',
      title: 'Four Days Up',
      text: {
        explorer: [
          'The line goes up four days in a row. That really happened.',
          'What the chart cannot show is tomorrow. Tomorrow has not happened yet.'
        ],
        analyst: [
          'Describe: the price rose $0.40 over four days, a 20% increase. That is a fact about the past.',
          'Predict: "it will rise tomorrow" is a guess. The chart contains no information about tomorrow\'s news.'
        ]
      },
      visual: {
        explorer: {
          kind: 'line', title: 'Pretend orange juice price, Days 1 to 4', unit: '$',
          points: [{ label: 'Day 1', value: 2 }, { label: 'Day 2', value: 3 }, { label: 'Day 3', value: 4 }, { label: 'Day 4', value: 5 }]
        },
        analyst: {
          kind: 'line', title: 'Pretend orange juice price, Days 1 to 4', unit: '$',
          points: [{ label: 'Day 1', value: 2 }, { label: 'Day 2', value: 2.1 }, { label: 'Day 3', value: 2.25 }, { label: 'Day 4', value: 2.4 }]
        }
      },
      caption: {
        explorer: 'Four days of the past. Day 5 is not on the chart.',
        analyst: 'A description of four days. The chart is silent about Day 5.'
      }
    },
    {
      kind: 'together',
      title: 'Describe, Then Think',
      intro: {
        explorer: 'Here is what happened on Day 5. Let\'s think about it together.',
        analyst: 'Day 5 is now on the chart. Separate description from prediction.'
      },
      visual: {
        explorer: {
          kind: 'line', title: 'Pretend orange juice price, Days 1 to 5', unit: '$',
          points: [{ label: 'Day 1', value: 2 }, { label: 'Day 2', value: 3 }, { label: 'Day 3', value: 4 }, { label: 'Day 4', value: 5 }, { label: 'Day 5', value: 3 }]
        },
        analyst: {
          kind: 'line', title: 'Pretend orange juice price, Days 1 to 5', unit: '$',
          points: [{ label: 'Day 1', value: 2 }, { label: 'Day 2', value: 2.1 }, { label: 'Day 3', value: 2.25 }, { label: 'Day 4', value: 2.4 }, { label: 'Day 5', value: 2.05 }]
        }
      },
      steps: {
        explorer: [
          {
            prompt: 'What does the chart show for sure?',
            choices: [
              { id: 'a', text: 'The price went up for four days, then fell on Day 5.', correct: true, coach: 'Yes! That is what really happened. It is a fact about the past.' },
              { id: 'b', text: 'What the price will be on Day 6', correct: false, coach: 'Day 6 is not on the chart. Charts only show what already happened.' },
              { id: 'c', text: 'That prices always go up', correct: false, coach: 'Look at Day 5. The price went down.' }
            ]
          },
          {
            prompt: 'Why did the price fall on Day 5?',
            choices: [
              { id: 'a', text: 'Surprise news: a huge crop of oranges', correct: true, coach: 'Right. More oranges means more supply, which tends to push the price down. The chart could not see that news coming.' },
              { id: 'b', text: 'Because the chart said it would', correct: false, coach: 'The chart only showed four days going up. It did not say anything about Day 5.' },
              { id: 'c', text: 'Because four days up means it must fall', correct: false, coach: 'There is no rule like that. It fell because of news, and it could have kept rising.' }
            ]
          },
          {
            prompt: 'What is the most honest prediction for Day 6?',
            choices: [
              { id: 'a', text: 'It will go up for sure.', correct: false, coach: 'Nobody can be sure. What else could happen?' },
              { id: 'b', text: 'It will go down for sure.', correct: false, coach: 'One down day does not decide the next day either.' },
              { id: 'c', text: 'I do not know. It could go up, go down or stay the same.', correct: true, coach: 'Exactly. Saying "I do not know yet" is honest and smart.' }
            ]
          }
        ],
        analyst: [
          {
            prompt: 'Which statement is a description, not a prediction?',
            choices: [
              { id: 'a', text: 'From Day 1 to Day 4, the price rose 20%.', correct: true, coach: 'Correct: ($2.40 − $2.00) ÷ $2.00 = 20%. It describes what happened.' },
              { id: 'b', text: 'The uptrend will continue after this dip.', correct: false, coach: 'That is a guess about the future, not something the chart shows.' },
              { id: 'c', text: 'The Day 5 drop means a crash is coming.', correct: false, coach: 'That is also a prediction. The chart shows only Days 1 to 5.' }
            ]
          },
          {
            prompt: 'A classmate says: "This [[pattern]] worked the last 3 times, so it will work this time." What is the best reply?',
            choices: [
              { id: 'a', text: 'Three past cases cannot guarantee the next one; new information can change the outcome.', correct: true, coach: 'Exactly. Past performance is not necessarily indicative of future results.' },
              { id: 'b', text: 'Right. Three times in a row proves it.', correct: false, coach: 'A few past cases are not proof. Malik\'s four-day trend broke on Day 5.' },
              { id: 'c', text: 'Then it will fail this time, because it is due.', correct: false, coach: 'That is the same mistake in reverse. Past results do not make any outcome "due".' }
            ]
          },
          {
            prompt: 'Someone has no plan and no clear information, but feels pressure to make a trade right now. Which choice is reasonable?',
            choices: [
              { id: 'a', text: 'Wait and gather more information; choosing not to act is a valid decision.', correct: true, coach: 'Yes. "Not enough information" and "wait" are legitimate answers.' },
              { id: 'b', text: 'Trade right away so you do not miss out.', correct: false, coach: 'Pressure is not information. Acting without a plan adds risk.' },
              { id: 'c', text: 'Do whatever the chart did yesterday.', correct: false, coach: 'Yesterday\'s move does not decide tomorrow\'s.' }
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
          key: 'lesson-check:w4l4:explorer',
          skill: 'chart-limits',
          difficulty: 'easy',
          band: 'explorer',
          template: 'lesson-check',
          kind: 'mistake-detective',
          type: 'choice',
          prompt: 'Mistake detective: Malik looks at this chart and says, "The price went up four days in a row, so it will go up tomorrow for sure." What is the mistake?',
          visual: {
            kind: 'line', title: 'Pretend price of a bag of popcorn', unit: '$',
            points: [{ label: 'Mon', value: 1 }, { label: 'Tue', value: 2 }, { label: 'Wed', value: 3 }, { label: 'Thu', value: 4 }]
          },
          choices: [
            { id: 'a', text: 'A chart shows the past. Tomorrow\'s price could go up, go down or stay the same.' },
            { id: 'b', text: 'There is no mistake. Prices that go up keep going up.', misconception: 'trend-continues' },
            { id: 'c', text: 'The mistake is that it will go down tomorrow for sure.', misconception: 'reversal-certain' },
            { id: 'd', text: 'The mistake is that charts are only wrong on Fridays.', misconception: 'random-reason' }
          ],
          answer: 'a',
          hints: [
            'Does the chart have a dot for tomorrow?',
            'Think about Malik\'s orange juice. What happened after four days up?'
          ],
          explanation: 'The chart only shows days that already happened. Surprise news can change a price at any time, so nobody can be sure what tomorrow\'s price will be.',
          teach: 'A chart is a record of the past. It can help you describe what happened, but it cannot see tomorrow\'s news. When someone says "for sure" about a future price, that is the mistake to look for.',
          misconceptions: {
            'trend-continues': 'Prices that went up can go down. Remember the orange juice: it fell after four days up.',
            'reversal-certain': 'Being sure it will go DOWN is the same mistake as being sure it will go up. Nobody knows.',
            'random-reason': 'The day of the week is not the point. What can a chart never show?'
          }
        },
        analyst: {
          key: 'lesson-check:w4l4:analyst',
          skill: 'chart-limits',
          difficulty: 'medium',
          band: 'analyst',
          template: 'lesson-check',
          kind: 'mistake-detective',
          type: 'choice',
          prompt: 'Mistake detective: a classmate looks at this chart and writes, "Up five months in a row, so buying now is a sure thing." Which response is most accurate?',
          visual: {
            kind: 'line', title: 'Pretend monthly price of a commodity', unit: '$',
            points: [{ label: 'Jan', value: 40 }, { label: 'Feb', value: 42 }, { label: 'Mar', value: 43.5 }, { label: 'Apr', value: 45 }, { label: 'May', value: 47 }, { label: 'Jun', value: 48.5 }]
          },
          choices: [
            { id: 'a', text: 'The chart shows the price rose over these months; it cannot show next month\'s price, and new information can reverse any trend.' },
            { id: 'b', text: 'The classmate is right: a clear trend will continue.', misconception: 'trend-continues' },
            { id: 'c', text: 'A pattern this clear always works.', misconception: 'pattern-always-works' },
            { id: 'd', text: 'It is due to fall, because it has risen so long.', misconception: 'due-to-reverse' }
          ],
          answer: 'a',
          hints: [
            'Separate what the chart shows (a description) from what the classmate guesses (a prediction).',
            'Can anything on this chart tell you about news that has not happened yet?'
          ],
          explanation: 'The chart describes a past rise. It contains no information about future events, and past performance is not necessarily indicative of future results. "Sure thing" is a prediction the chart cannot support.',
          teach: 'Describe first: what did the price do? Then ask what the chart cannot know: future weather, reports, events, and changes in supply and demand. Trends and patterns can continue or fail; claiming either outcome is certain is the mistake. "Not enough information" is a valid conclusion.',
          misconceptions: {
            'trend-continues': 'Trends can continue or end. Malik\'s orange juice trend ended with one crop report.',
            'pattern-always-works': 'No pattern always works. New information can break it without warning.',
            'due-to-reverse': 'Past rises do not make a fall "due". That is the same mistake in the opposite direction.'
          }
        }
      }
    },
    {
      kind: 'next',
      title: 'You Know the Limits!',
      text: {
        explorer: 'You learned that charts show the past, surprises can change prices, and "I do not know yet" is an honest answer. You finished World 4! Practice spotting the "for sure" mistake.',
        analyst: 'You can separate description from prediction, explain why trends and patterns fail, and treat waiting as a valid choice. That completes World 4. Practice mistake-detective questions next.'
      },
      practiceSkills: ['chart-limits', 'line-chart-reading']
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
  W2L2,
  W2L3,
  W2L4,
  planned('w3l1', 3, 1, 'Farm Products: Wheat, Corn and Soybeans'),
  planned('w3l2', 3, 2, 'Metals: Gold and Silver'),
  planned('w3l3', 3, 3, 'Energy: Crude Oil and Natural Gas'),
  planned('w3l4', 3, 4, 'Stock Indexes: A Basket of Companies'),
  planned('w3l5', 3, 5, 'Futures and Stocks: How They Differ'),
  W4L1,
  W4L2,
  W4L3,
  W4L4,
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
