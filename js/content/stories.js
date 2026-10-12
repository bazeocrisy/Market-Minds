// Market Minds — Market Stories (CURRICULUM DATA ONLY).
// Owner: Agent 1.
// Story = { id, world, lesson, title, text: BandValue<string[]>, image: { asset, alt, caption }, questions: [Question] }
// Questions follow the Question object in docs/ARCHITECTURE.md (type 'choice', template 'story-question').
// Story questions are written to work for both bands (no band-specific numbers), so `band` is 'all'.
// All prices are pretend. Image assets do not exist yet: see docs/ASSET-MANIFEST.md.

const sq = (storyId, n, fields) => ({
  key: `story:${storyId}:${n}`,
  band: 'all',
  template: 'story-question',
  type: 'choice',
  ...fields
});

export const STORIES = [
  {
    id: 'market-morning',
    world: 1,
    lesson: 'w1l1',
    title: 'Saturday Morning at the Market',
    text: {
      explorer: [
        'Grandma Ruth sells sweet potato pies at the farmers market every Saturday. Amara helps her set up the table.',
        'Their first customer is Mr. Okafor, the peach farmer. He buys a pie for $8. Then Grandma Ruth walks over and buys peaches from him!',
        '"Wait," Amara laughs, "Mr. Okafor was a buyer, and now he\'s a seller?" Grandma Ruth nods. "In a [[market]], the same person can be both."',
        'By noon, the pies are gone. Amara counts the money in the cash box and smiles. Everyone got something they wanted.'
      ],
      analyst: [
        'Grandma Ruth has sold sweet potato pies at the neighborhood farmers market for twenty years. This Saturday, Amara is her assistant, in charge of the price sign and the cash box.',
        'Their first customer is Mr. Okafor, the peach farmer from two tables down. He pays $8.00 for a pie. An hour later, Grandma Ruth buys a basket of his peaches for her next batch of cobbler.',
        'Amara realizes that being a [[buyer]] or a [[seller]] is a role in a trade, not a type of person. Mr. Okafor sold peaches and bought a pie. Grandma Ruth sold pies and bought peaches. Each trade happened because both sides agreed it was worth it.',
        'By noon, the pies are gone. A late shopper asks if Grandma Ruth will save one next week. "Come early," she says. "When something is popular, it goes fast."'
      ]
    },
    image: {
      asset: 'assets/illustrations/story-market-morning.webp',
      alt: 'A grandmother and her granddaughter stand behind a farmers market table of sweet potato pies, handing a pie to a farmer in a straw hat.',
      caption: 'Amara and Grandma Ruth sell pies at the farmers market.'
    },
    questions: [
      sq('market-morning', 1, {
        skill: 'buyers-sellers', difficulty: 'easy', kind: 'scenario',
        prompt: 'When Mr. Okafor pays for a pie, what is his role in that trade?',
        choices: [
          { id: 'a', text: 'Buyer' },
          { id: 'b', text: 'Seller', misconception: 'role-is-fixed' },
          { id: 'c', text: 'Neither, because he is a farmer', misconception: 'job-not-role' }
        ],
        answer: 'a',
        hints: ['Who is handing over money in this trade?', 'The person who pays to get something is in which role?'],
        explanation: 'Mr. Okafor pays money to get a pie, so in that trade he is the buyer, even though he sells peaches at his own table.',
        teach: 'Buyer and seller are roles in a single trade. The person who pays money is the buyer; the person who gives the item is the seller. The same person can be a buyer in one trade and a seller in another.',
        misconceptions: {
          'role-is-fixed': 'Mr. Okafor sells peaches, but in this trade he is paying for a pie. Look at who gives money.',
          'job-not-role': 'A farmer can still buy things. What is he doing in this trade?'
        }
      }),
      sq('market-morning', 2, {
        skill: 'market-basics', difficulty: 'easy', kind: 'concept',
        prompt: 'Why can the same person be both a buyer and a seller at the market?',
        choices: [
          { id: 'a', text: 'Because buyer and seller describe what you do in a trade, not who you are.' },
          { id: 'b', text: 'Because sellers are not allowed to keep their money.', misconception: 'rules-confusion' },
          { id: 'c', text: 'Because only grown-ups can be buyers.', misconception: 'adults-only' }
        ],
        answer: 'a',
        hints: ['Think about what Mr. Okafor did first, and what he did later.', 'Is "buyer" a kind of person, or something you do in one trade?'],
        explanation: 'Buyer and seller are roles. Mr. Okafor sold peaches in one trade and bought a pie in another, so he played both roles.',
        teach: 'A market is any place or way that buyers and sellers trade. Each trade has a buyer and a seller, and people switch roles from one trade to the next.',
        misconceptions: {
          'rules-confusion': 'Sellers can spend their money however they like. The story is about roles in each trade.',
          'adults-only': 'Kids can be buyers too, like at a lemonade stand. Being a buyer is about paying for something.'
        }
      }),
      sq('market-morning', 3, {
        skill: 'price-change-reasons', difficulty: 'medium', kind: 'scenario',
        prompt: 'The pies sold out by noon, and shoppers asked for more. If Grandma Ruth brings the same number of pies next week and even more people want them, what might happen to the price?',
        choices: [
          { id: 'a', text: 'She might be able to charge more, because many people want them.' },
          { id: 'b', text: 'She would have to charge less, because they are popular.', misconception: 'popular-means-cheaper' },
          { id: 'c', text: 'The price can never change once it is on a sign.', misconception: 'prices-fixed' }
        ],
        answer: 'a',
        hints: ['Are more people or fewer people wanting the pies?', 'When something is popular and there is not more of it, which way does the price tend to be pushed?'],
        explanation: 'When many people want something and there isn\'t more of it, the price tends to go up. She might charge more, or she might bake more pies.',
        teach: 'Prices can change when demand changes. More people wanting the same number of pies tends to push the price up. It is a tendency, not a rule: Grandma Ruth could also keep her price the same to be kind to regular customers.',
        misconceptions: {
          'popular-means-cheaper': 'Popular items usually do not need lower prices to sell. Think about lots of buyers and few pies.',
          'prices-fixed': 'Sellers can change the price on their sign. What would make her think about changing it?'
        }
      })
    ]
  },
  {
    id: 'sneaker-mystery',
    world: 1,
    lesson: 'w1l2',
    title: 'The Sneaker Price Mystery',
    text: {
      explorer: [
        'Malik is saving for blue sneakers at the shop on his street. In March, they cost $60, and he has $60 saved.',
        'In April, a famous basketball player wears the same sneakers in a big game. Suddenly, everyone wants them, and the price goes up to $80!',
        'Aunt Imani says, "Let\'s watch the price for a while." In August, a new color comes out and fewer people want the blue ones, so the price drops to $50.',
        'Malik buys them and has $10 left. His aunt reminds him that waiting was risky, because the price could have gone higher instead.'
      ],
      analyst: [
        'Malik has been saving for a pair of blue sneakers from the shop on his corner. In March, they cost $59.99, and he has $60 saved.',
        'In April, a star player wears them in a playoff game. Within a week, the shop marks them up to $79.99. Malik is frustrated, but his Aunt Imani, who works in retail, suggests he track the price instead of rushing.',
        'Over the summer, the price slides: $74.99 in June, then $49.99 in August after the brand releases a new color and demand for the old one fades.',
        'Malik buys them and keeps $10.01. But Aunt Imani points out that waiting was not a sure thing. If the shoes had sold out, the price might never have come down. "You made a choice under uncertainty," she says. "It worked this time. That doesn\'t mean it always will."'
      ]
    },
    image: {
      asset: 'assets/illustrations/story-sneaker-mystery.webp',
      alt: 'A boy and his aunt look through a sneaker shop window at a display of blue sneakers with a price tag.',
      caption: 'Malik and Aunt Imani watch the sneaker price.'
    },
    questions: [
      sq('sneaker-mystery', 1, {
        skill: 'price-change-reasons', difficulty: 'easy', kind: 'scenario',
        prompt: 'Why did the sneaker price go up in April?',
        choices: [
          { id: 'a', text: 'A famous player wore them, so many more people wanted them.' },
          { id: 'b', text: 'The shop ran out of price tags.', misconception: 'random-reason' },
          { id: 'c', text: 'Fewer people wanted them.', misconception: 'demand-backwards' }
        ],
        answer: 'a',
        hints: ['What happened in April in the story?', 'Did more people or fewer people want the sneakers after the big game?'],
        explanation: 'After the famous player wore them, demand jumped. When many more people want something, the price tends to go up.',
        teach: 'Prices change for reasons. One common reason is a change in how many people want something (demand). More demand tends to push prices up; less demand tends to push them down.',
        misconceptions: {
          'random-reason': 'Look for a reason in the story that changed how many people wanted the shoes.',
          'demand-backwards': 'Fewer people wanting them would push the price down. What happened after the game?'
        }
      }),
      sq('sneaker-mystery', 2, {
        skill: 'price-change-reasons', difficulty: 'medium', kind: 'scenario',
        prompt: 'Why did the price drop in August?',
        choices: [
          { id: 'a', text: 'A new color came out, so fewer people wanted the blue ones.' },
          { id: 'b', text: 'The shoes became more popular.', misconception: 'demand-backwards' },
          { id: 'c', text: 'Malik asked nicely.', misconception: 'random-reason' }
        ],
        answer: 'a',
        hints: ['What new thing came out in August?', 'If people switch to a new color, what happens to demand for the old one?'],
        explanation: 'The new color pulled buyers away from the blue sneakers. Less demand tended to push their price down.',
        teach: 'When a new choice appears, demand for older items can fall. Sellers then often lower prices to sell what they have.',
        misconceptions: {
          'demand-backwards': 'If the shoes were more popular, the price would tend to rise, not drop.',
          'random-reason': 'Shops set prices based on things like demand and supply, not on one shopper\'s request.'
        }
      }),
      sq('sneaker-mystery', 3, {
        skill: 'futures-risk', difficulty: 'medium', kind: 'concept',
        prompt: 'Aunt Imani says waiting "worked this time." What does she mean?',
        choices: [
          { id: 'a', text: 'Nobody knew the price would drop; it could have gone up or the shoes could have sold out.' },
          { id: 'b', text: 'Prices always drop if you wait long enough.', misconception: 'prices-always-fall' },
          { id: 'c', text: 'Malik knew exactly what would happen.', misconception: 'future-known' }
        ],
        answer: 'a',
        hints: ['Could anyone be sure in April what the price would be in August?', 'What else could have happened if Malik waited?'],
        explanation: 'The future price was uncertain. Waiting turned out well, but the price could have risen or the shoes could have sold out.',
        teach: 'Nobody knows future prices for sure. A choice can turn out well or badly. A good decision weighs the possible downside, not just the hoped-for upside.',
        misconceptions: {
          'prices-always-fall': 'Some prices go up and stay up. Waiting is not a guaranteed way to pay less.',
          'future-known': 'Malik was hoping, not knowing. Nobody knows future prices for sure.'
        }
      })
    ]
  },
  {
    id: 'lemonade-heat-wave',
    world: 1,
    lesson: 'w1l3',
    title: 'The Lemonade Heat Wave',
    text: {
      explorer: [
        'Jaylen and his cousin Deja run a lemonade stand at the park. Most days, a cup costs $1 and they sell about 20 cups.',
        'Then a heat wave hits. It is so hot! A long line forms, and they run out of lemonade by lunch.',
        'The next week, three more lemonade stands open at the park. Now there is lemonade everywhere, and shoppers can pick any stand.',
        'Jaylen and Deja talk it over. With so much lemonade around, they decide to keep their price at $1 and add a free orange slice.'
      ],
      analyst: [
        'Jaylen and his cousin Deja run a weekend lemonade stand at the park. At $1.00 a cup, they usually sell about 20 cups, enough to cover lemons, sugar and cups with a little left over.',
        'During a heat wave, the line stretches past the swings. They sell out by noon, and people are still asking for more. Deja suggests raising the price to $1.50, since demand is clearly higher than what they can make.',
        'The next weekend, three new stands open nearby. With much more lemonade for sale, shoppers can compare prices. A stand charging $1.50 has almost no customers.',
        'Jaylen and Deja keep their price at $1.00 and add a free orange slice to stand out. They learn that a price that works one week can fail the next, because supply and demand keep shifting.'
      ]
    },
    image: {
      asset: 'assets/illustrations/story-lemonade-heat-wave.webp',
      alt: 'Two cousins serve lemonade at a park stand on a sunny day while a line of neighbors waits in the shade.',
      caption: 'Jaylen and Deja\'s lemonade stand during the heat wave.'
    },
    questions: [
      sq('lemonade-heat-wave', 1, {
        skill: 'supply-demand', difficulty: 'easy', kind: 'scenario',
        prompt: 'During the heat wave, what happened to the [[demand]] for lemonade?',
        choices: [
          { id: 'a', text: 'It went up.' },
          { id: 'b', text: 'It went down.', misconception: 'demand-backwards' },
          { id: 'c', text: 'It stayed the same.', misconception: 'nothing-changes' }
        ],
        answer: 'a',
        hints: ['Look at the line of people in the story.', 'Demand is how much people want to buy. Did more people want lemonade?'],
        explanation: 'The heat made many more people want lemonade, so demand went up. That is why they sold out early.',
        teach: 'Demand can rise because of weather, events or trends. When demand rises and supply does not, there is a shortage, and the price tends to go up.',
        misconceptions: {
          'demand-backwards': 'A long line means lots of people want to buy. Is that more or less demand?',
          'nothing-changes': 'They usually sell 20 cups, but during the heat wave they sold out by lunch. Something changed.'
        }
      }),
      sq('lemonade-heat-wave', 2, {
        skill: 'supply-demand', difficulty: 'medium', kind: 'scenario',
        prompt: 'When three new stands opened, what happened to the [[supply]] of lemonade at the park?',
        choices: [
          { id: 'a', text: 'Supply went up, which tends to push prices down.' },
          { id: 'b', text: 'Supply went down, which tends to push prices up.', misconception: 'supply-backwards' },
          { id: 'c', text: 'Supply went up, which tends to push prices up.', misconception: 'more-supply-higher-price' }
        ],
        answer: 'a',
        hints: ['Are there more places selling lemonade, or fewer?', 'When shoppers have many choices, do sellers usually charge more or less?'],
        explanation: 'More stands means more lemonade for sale, so supply went up. More supply tends to push prices down, which is why a $1.50 stand had few customers.',
        teach: 'Supply is how much is for sale. More sellers usually means more supply and more competition, which tends to push prices down.',
        misconceptions: {
          'supply-backwards': 'Three new stands opened. Is there more lemonade for sale, or less?',
          'more-supply-higher-price': 'The direction of supply is right, but think about prices when shoppers have many choices.'
        }
      }),
      sq('lemonade-heat-wave', 3, {
        skill: 'supply-demand', difficulty: 'challenge', kind: 'concept',
        prompt: 'What is the big lesson Jaylen and Deja learned?',
        choices: [
          { id: 'a', text: 'A price that works one week might not work the next, because supply and demand keep changing.' },
          { id: 'b', text: 'You should always charge the highest price you can.', misconception: 'always-max-price' },
          { id: 'c', text: 'Once you pick a price, supply and demand stop mattering.', misconception: 'prices-fixed' }
        ],
        answer: 'a',
        hints: ['Compare the heat-wave week with the week the new stands opened.', 'Did the same price work in both weeks?'],
        explanation: 'In the heat wave, demand was high. A week later, supply was high. The best price changed because supply and demand changed.',
        teach: 'Supply and demand are always moving. Smart sellers watch both and adjust, and they know that what worked before is not guaranteed to work again.',
        misconceptions: {
          'always-max-price': 'The $1.50 stand had almost no customers when supply grew. A high price can drive buyers away.',
          'prices-fixed': 'Supply and demand kept affecting which price worked. Look at what happened to the $1.50 stand.'
        }
      })
    ]
  },
  {
    id: 'pumpkin-promise',
    world: 2,
    lesson: 'w2l1',
    title: 'The Pumpkin Promise',
    text: {
      explorer: [
        'Every fall, Mr. Carter\'s pie shop makes pumpkin pies. He needs lots of pumpkins in October.',
        'In June, he visits Nia\'s family pumpkin patch. Nia\'s mom says, "Let\'s agree today: in October, we will sell you 200 pumpkins for $4 each." They shake hands.',
        'In October, a dry summer means fewer pumpkins everywhere. At the market, pumpkins now cost $6 each. But Mr. Carter still pays $4, just like they promised.',
        'Nia asks, "Did we lose?" Her mom says, "We earned less than we could have this time, but in June we didn\'t know. Our promise meant we knew what we would get."'
      ],
      analyst: [
        'Mr. Carter owns a pie shop that sells hundreds of pumpkin pies each fall. To plan his budget, he wants to know what his pumpkins will cost before the season starts.',
        'In June, he meets with Nia\'s mom, who runs the family pumpkin patch. They sign a [[forward-agreement]]: in October, the patch will sell him 200 pumpkins at $4.00 each, no matter the [[market-price]] then.',
        'A dry summer shrinks pumpkin supply across the region. By October, the market price is $6.00 each. Mr. Carter pays the agreed $4.00, saving $2.00 per pumpkin compared with the market.',
        'Nia is disappointed until her mom explains: "If there had been a huge crop, the price might have dropped to $2.00, and the agreement would have protected us. We gave up the chance of a higher price to get certainty. That\'s what [[hedging]] is."'
      ]
    },
    image: {
      asset: 'assets/illustrations/story-pumpkin-promise.webp',
      alt: 'A mother and daughter in a pumpkin patch shake hands with a pie-shop owner in a baker\'s apron on a summer day.',
      caption: 'Nia\'s family and Mr. Carter make a pumpkin promise in June.'
    },
    questions: [
      sq('pumpkin-promise', 1, {
        skill: 'future-agreement', difficulty: 'easy', kind: 'concept',
        prompt: 'What did Mr. Carter and Nia\'s mom agree to in June?',
        choices: [
          { id: 'a', text: 'To trade pumpkins in October at a price they set in June.' },
          { id: 'b', text: 'To trade pumpkins in October at whatever the market price is then.', misconception: 'no-locked-price' },
          { id: 'c', text: 'To trade pumpkins right away in June.', misconception: 'trade-now' }
        ],
        answer: 'a',
        hints: ['When did they make the deal, and when do the pumpkins change hands?', 'Was the price decided in June or in October?'],
        explanation: 'They agreed in June on a price for a trade in October. That is a promise about a future price.',
        teach: 'A forward agreement is a promise made today to buy or sell something later at a price agreed today. The price stays the same even if the market price changes.',
        misconceptions: {
          'no-locked-price': 'If they used October\'s market price, there would be nothing to agree on in June. What did they set early?',
          'trade-now': 'Pumpkins are not ready in June. When does the trade actually happen?'
        }
      }),
      sq('pumpkin-promise', 2, {
        skill: 'hedge-outcome', difficulty: 'medium', kind: 'scenario',
        prompt: 'In October, the market price was higher than the agreed price. Who did the agreement help this time?',
        choices: [
          { id: 'a', text: 'Mr. Carter, the buyer, because he paid less than the market price.' },
          { id: 'b', text: 'Nia\'s family, the seller, because they got more than the market price.', misconception: 'seller-always-wins' },
          { id: 'c', text: 'Both sides earned extra money.', misconception: 'both-win' }
        ],
        answer: 'a',
        hints: ['Compare the agreed price with the October market price.', 'A buyer is happy to pay less; a seller is happy to get more. Who paid or got less than the market?'],
        explanation: 'The agreed price was lower than the market price, so the buyer, Mr. Carter, paid less than he would have at the market. The seller received less than the market price.',
        teach: 'To see who an agreement helped, compare the agreed price with the market price at the time of the trade. If the market price is higher, the buyer benefits; if it is lower, the seller benefits.',
        misconceptions: {
          'seller-always-wins': 'Nia\'s family received the agreed price, which was less than the market price in October.',
          'both-win': 'When the buyer pays less than the market, the seller receives less than the market.'
        }
      }),
      sq('pumpkin-promise', 3, {
        skill: 'futures-risk', difficulty: 'challenge', kind: 'concept',
        prompt: 'Nia\'s mom says the agreement was still a reasonable choice. Which reason is best?',
        choices: [
          { id: 'a', text: 'In June, nobody knew the October price. The agreement gave them a known price, even though it turned out lower this time.' },
          { id: 'b', text: 'She knew the price would go up and wanted to lose money.', misconception: 'future-known' },
          { id: 'c', text: 'Agreements like this always make the seller the most money.', misconception: 'guaranteed-profit' }
        ],
        answer: 'a',
        hints: ['Could anyone know the October price back in June?', 'What did the family get from the agreement, even when the price rose?'],
        explanation: 'The future price was uncertain. The agreement traded away the chance of a higher price for the certainty of knowing what they would earn. If the price had fallen, it would have protected them.',
        teach: 'Hedging reduces uncertainty; it does not guarantee the best result. Sometimes the hedger ends up with less than the market price, and sometimes more. Nobody knows in advance.',
        misconceptions: {
          'future-known': 'Nobody can know future prices. She made the deal without knowing what would happen.',
          'guaranteed-profit': 'In this story the seller earned less than the market price. No agreement guarantees the most money.'
        }
      })
    ]
  },
  {
    id: 'two-reasons-to-trade',
    world: 2,
    lesson: 'w2l3',
    title: 'Two Reasons to Trade',
    text: {
      explorer: [
        'After Career Day, Malik walks home with his mom, Ms. Harris. "Why do you use futures, Mom?" he asks.',
        '"Flour is a big part of what our bread costs," she says. "If wheat prices jump, our bakery could be in trouble. Locking in a price helps me plan."',
        '"Ms. Tate trades wheat too, but she has no bakery," Malik says. "She is a [[speculator]]," says Mom, "and she takes a risk on purpose, hoping to make money, but sometimes she loses."',
        '"So you are trying to stay safe, and she is trying to win?" Malik asks. "That is close," says Mom, "but neither of us can see the future."'
      ],
      analyst: [
        'Walking home from Career Day, Malik asks his mom why Harris Family Bakery uses wheat futures at all.',
        '"Flour is one of our biggest costs," Ms. Harris explains. "If wheat prices jump, our costs jump, and we can\'t raise bread prices every week. So we lock in part of our wheat cost ahead of time. That makes us a [[hedger]]. Sometimes the market price ends up lower and we pay more than we had to; we accept that for the certainty."',
        '"Ms. Tate said she has no wheat at all," Malik says. "Right. She is a [[speculator]]: she takes on price risk on purpose, hoping to profit. She told me about a month when a surprise rainstorm moved prices against her and she lost much more than she expected. Speculating is risky, and the CFTC warns that many individuals lose all of their money."',
        'Malik thinks about it. "So the difference isn\'t buying or selling. It\'s why you trade." His mom smiles. "Exactly. And either way, nobody gets to see the future price."'
      ]
    },
    image: {
      asset: 'assets/illustrations/story-two-reasons-to-trade.webp',
      alt: 'A boy and his mother, still wearing her bakery apron, walk home along a tree-lined neighborhood sidewalk in the late afternoon, talking.',
      caption: 'Malik and his mom talk about why people trade.'
    },
    questions: [
      sq('two-reasons-to-trade', 1, {
        skill: 'hedgers-speculators', difficulty: 'easy', kind: 'scenario',
        prompt: 'Why does Ms. Harris use wheat futures?',
        choices: [
          { id: 'a', text: 'To protect her bakery from a rise in wheat prices, a risk she already has.' },
          { id: 'b', text: 'To try to win money by guessing prices, like a game.', misconception: 'hedger-as-speculator' },
          { id: 'c', text: 'Because futures always save money.', misconception: 'hedging-always-wins' }
        ],
        answer: 'a',
        hints: ['What does Ms. Harris\'s bakery need to buy?', 'Is she trying to shrink a worry she already has, or take on a new one?'],
        explanation: 'Ms. Harris already buys wheat for her bakery, so rising wheat prices are a risk she already has. She uses futures to make that risk smaller. That makes her a hedger.',
        teach: 'A hedger already has a price risk from their work and uses futures to reduce it. A speculator has no such risk and takes one on, hoping to profit. Hedging can also mean paying more than the market price later.',
        misconceptions: {
          'hedger-as-speculator': 'Ms. Harris is not playing a guessing game. She is protecting the bakery from a risk it already has.',
          'hedging-always-wins': 'Ms. Harris says sometimes she pays more than she had to. Hedging gives certainty, not savings every time.'
        }
      }),
      sq('two-reasons-to-trade', 2, {
        skill: 'hedgers-speculators', difficulty: 'medium', kind: 'concept',
        prompt: 'What makes Ms. Tate a speculator?',
        choices: [
          { id: 'a', text: 'She has no wheat business and takes on price risk hoping to make money.' },
          { id: 'b', text: 'She sells futures, and anyone who sells is a speculator.', misconception: 'direction-decides-role' },
          { id: 'c', text: 'She always makes money because she is an expert.', misconception: 'speculators-always-win' }
        ],
        answer: 'a',
        hints: ['Does Ms. Tate grow, store or use any wheat?', 'Malik figures out that the difference is not buying or selling. What is it?'],
        explanation: 'Ms. Tate has no wheat to protect. She trades to try to profit from price changes, taking on risk she did not have before. That is what makes her a speculator.',
        teach: 'The role comes from the reason for trading, not the direction. Hedgers reduce a risk they already have. Speculators take on new risk hoping to profit, and they can lose, sometimes a lot.',
        misconceptions: {
          'direction-decides-role': 'Farmers who hedge also sell futures. The reason for trading decides the role.',
          'speculators-always-win': 'Ms. Tate told the class about a month when she lost money. Experts cannot see the future either.'
        }
      }),
      sq('two-reasons-to-trade', 3, {
        skill: 'futures-risk', difficulty: 'challenge', kind: 'concept',
        prompt: 'Which sentence about Ms. Harris and Ms. Tate is true?',
        choices: [
          { id: 'a', text: 'Both face risk: Ms. Harris may pay more than the market price, and Ms. Tate may lose money.' },
          { id: 'b', text: 'Ms. Harris has no risk at all because she hedges.', misconception: 'hedging-removes-all-risk' },
          { id: 'c', text: 'Ms. Tate cannot lose, because she trades every day.', misconception: 'experience-removes-risk' }
        ],
        answer: 'a',
        hints: ['What does Ms. Harris say can happen when she locks in a price?', 'Ms. Tate trades often. Does that mean she always gains?'],
        explanation: 'Hedging reduces one risk but can mean paying more than the later market price. Speculating takes on risk directly and can lead to losses. Nobody in the story can see the future price.',
        teach: 'Every choice about future prices carries risk because the future is uncertain. Hedging trades away the chance of a better price for certainty; speculating accepts the chance of loss in hopes of gain.',
        misconceptions: {
          'hedging-removes-all-risk': 'Hedging reduces price uncertainty, but Ms. Harris may pay more than the market price.',
          'experience-removes-risk': 'Trading often does not remove risk. Ms. Tate says she sometimes loses.'
        }
      })
    ]
  },
  {
    id: 'chart-detectives',
    world: 4,
    lesson: 'w4l4',
    title: 'The Chart Detectives',
    text: {
      explorer: [
        'Deja and Jaylen are the Chart Detectives at Market Club. Ms. Brooks gives them a [[line-chart]] of a pretend cocoa price for five days: $3, $4, $6, $5, $7.',
        '"Day 5 is the highest!" says Jaylen. "And Day 1 is the lowest," adds Deja.',
        'Then Jaylen grins. "It zigzags, so tomorrow it goes down!" Deja says, "Detectives use clues, and the chart has no clues about tomorrow."',
        'Ms. Brooks writes on the board: "Describe what happened. Do not pretend to know what will happen."'
      ],
      analyst: [
        'Deja and Jaylen are the Chart Detectives at Market Club. Their case: a [[line-chart]] of a pretend cocoa price over five days: $3.00, $4.00, $6.00, $5.00, $7.00.',
        'First they gather the facts. The high is $7.00 on Day 5; the low is $3.00 on Day 1. From Day 1 to Day 5, the price rose $4.00, a [[percent-change]] of about 133%.',
        'Then Jaylen spots what he calls a [[pattern]]: up, up, down, up. "It zigzags," he says. "So Day 6 has to be a down day." Deja is not convinced. "That\'s a guess, not a clue. A weather report or a big order could change everything, and none of that is on the chart."',
        'Ms. Brooks writes their final report on the board: "Facts: the price rose from $3.00 to $7.00. Prediction for Day 6: not enough information." Jaylen laughs. "Case closed. For now."'
      ]
    },
    image: {
      asset: 'assets/illustrations/story-chart-detectives.webp',
      alt: 'Two students wearing playful detective hats study a large printed line chart with a magnifying glass while their teacher smiles nearby.',
      caption: 'Deja and Jaylen investigate a chart.'
    },
    questions: [
      sq('chart-detectives', 1, {
        skill: 'line-chart-reading', difficulty: 'easy', kind: 'chart',
        prompt: 'On which day was the pretend cocoa price lowest?',
        visual: { kind: 'line', title: 'Pretend cocoa price', unit: '$', points: [{ label: 'Day 1', value: 3 }, { label: 'Day 2', value: 4 }, { label: 'Day 3', value: 6 }, { label: 'Day 4', value: 5 }, { label: 'Day 5', value: 7 }] },
        choices: [
          { id: 'a', text: 'Day 1' },
          { id: 'b', text: 'Day 4', misconception: 'first-drop-is-lowest' },
          { id: 'c', text: 'Day 5', misconception: 'high-low-swap' }
        ],
        answer: 'a',
        hints: ['Look for the dot closest to the bottom of the chart.', 'A day when the price dropped is not always the lowest day. Compare all the prices.'],
        explanation: 'Day 1 has the lowest dot, at $3. Day 4 dropped from Day 3, but at $5 it was still higher than Day 1.',
        teach: 'To find the lowest price on a line chart, find the dot closest to the bottom, then look down to see the time. A drop is not the same as the lowest point.',
        misconceptions: {
          'first-drop-is-lowest': 'The price dropped on Day 4, but only to $5. Is there a lower dot?',
          'high-low-swap': 'Day 5 is the highest dot. Lowest means closest to the bottom.'
        }
      }),
      sq('chart-detectives', 2, {
        skill: 'chart-limits', difficulty: 'medium', kind: 'mistake-detective',
        prompt: 'Jaylen says, "It zigzags, so Day 6 has to go down." What is the problem with his idea?',
        choices: [
          { id: 'a', text: 'A pattern in the past does not decide the future; Day 6 could go up, down or stay the same.' },
          { id: 'b', text: 'Nothing. Zigzag patterns always repeat.', misconception: 'pattern-always-works' },
          { id: 'c', text: 'He is wrong because it will definitely go up on Day 6.', misconception: 'opposite-certainty' }
        ],
        answer: 'a',
        hints: ['Does the chart have any information about Day 6?', 'What did Deja say a chart is missing?'],
        explanation: 'Jaylen noticed a shape in past prices, but shapes can fail. News or a big order could move the price either way, and none of that is on the chart.',
        teach: 'Charts describe what happened. Patterns are shapes in the past, and they can fail without warning. Being sure of the opposite is the same mistake.',
        misconceptions: {
          'pattern-always-works': 'No pattern always repeats. New information can change prices at any time.',
          'opposite-certainty': 'Being sure it will go UP is the same mistake as being sure it will go down.'
        }
      }),
      sq('chart-detectives', 3, {
        skill: 'chart-limits', difficulty: 'challenge', kind: 'concept',
        prompt: 'Why is "not enough information" a good answer for the Day 6 prediction?',
        choices: [
          { id: 'a', text: 'Because the chart only records the past, and honest thinkers say so when the facts cannot answer a question.' },
          { id: 'b', text: 'Because the detectives were too lazy to decide.', misconception: 'waiting-is-lazy' },
          { id: 'c', text: 'Because prices never change after Day 5.', misconception: 'prices-fixed' }
        ],
        answer: 'a',
        hints: ['Can the detectives find any facts about Day 6 on the chart?', 'Is saying "I do not know yet" the same as not trying?'],
        explanation: 'The detectives gathered every fact the chart had. None of those facts were about Day 6, so the honest conclusion is that there is not enough information to predict it.',
        teach: '"Not enough information" and "wait" are legitimate answers. They are not laziness; they are honesty about uncertainty.',
        misconceptions: {
          'waiting-is-lazy': 'The detectives worked hard to gather facts. Saying "not enough information" is honest, not lazy.',
          'prices-fixed': 'Prices keep changing. The point is that nobody knows which way.'
        }
      })
    ]
  }
];

/** Story by id, or null. */
export function storyById(id) {
  return STORIES.find((s) => s.id === id) || null;
}
