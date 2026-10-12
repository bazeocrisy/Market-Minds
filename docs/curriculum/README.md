# Market Minds Curriculum: Scope and Sequence

Market Minds teaches money, markets, futures, math and careful decision-making to learners in grades 3–8. Characters are fictional, everyday Black children, families, farmers, bakers, shop owners and teachers, and every learner is welcome. All prices are pretend. The curriculum does not include any trading system, signal method or profit promise.

## Six worlds

| World | Title | Status | Lessons | Big idea |
|---|---|---|---|---|
| 1 | [Money & Markets](world-1.md) | **Ready** (3 of 3) | w1l1–w1l3 | Buyers and sellers trade in markets; prices change; supply and demand push prices. |
| 2 | [The Future Price](world-2.md) | **Ready** (4 of 4) | w2l1–w2l4 | Nobody knows future prices; agreements and futures can reduce price risk, not remove uncertainty. |
| 3 | [What People Trade](world-3.md) | Planned | w3l1–w3l5 | Commodities and stock indexes; futures vs. stocks. |
| 4 | [Reading Markets](world-4.md) | **Ready** (4 of 4) | w4l1–w4l4 | Charts describe the past; long and short; what charts cannot tell you. |
| 5 | [Market Math](world-5.md) | Planned | w5l1–w5l5 | Decimals, percents, ticks, contract size; leverage magnifies losses too. |
| 6 | [Decisions & Discipline](world-6.md) | Planned | w6l1–w6l5 | Uncertainty, planning, stop orders and their limits, patience, reflection. |

Planned lessons appear in `js/content/lessons.js` with `status: 'planned'` and no steps, so the Learn page lists them honestly as "In development".

## Lesson pattern

Every ready lesson has six steps in this order (see the header of `js/content/lessons.js`):

1. **Discover**: a familiar illustrated story (farmers market, grocery store, school-supply sale, bakery, career day, corner market, after-school Market Club)
2. **Definition**: plain-language meaning plus one key idea
3. **Visual**: an interactive SVG chart or diagram (real UI, not baked into pictures)
4. **Together**: 2–3 guided mini-questions with a coaching message on every choice
5. **Check**: one independent question with misconception-specific feedback and progressive hints
6. **Next**: what was learned and which skills to practice

Practice, Test, Thinking Lab and Practice My Misses then use the same skill ids (`js/content/skills.js`).

## Two grade bands

| | Market Explorer (Grades 3–5) | Market Analyst (Grades 6–8) |
|---|---|---|
| Reading | Short paragraphs (up to 3 sentences, up to 4 per step), everyday words | Longer passages, more vocabulary (shortage, surplus, standardized, offset) |
| Math | Whole-dollar prices, one-step subtraction | Decimals, percent change, multi-step totals (per unit × quantity) |
| Futures | "A promise made today to buy or sell something later at a price agreed today", plus a note that real futures trade on special markets with rules | Forward vs. futures: standardized, exchange-traded, most positions offset before delivery (CFTC) |
| Risk | "Nobody knows future prices; it could turn out better or worse." | Hedging trades the chance of a better price for certainty; margin is not a maximum loss |

Both bands share the same skills, prerequisites and core ideas. Only the language, the numbers and the depth change.

## Mastery is not grade level

Choosing a band (3–5 or 6–8) chooses how things are explained. It never counts as evidence that a learner knows something. Mastery comes only from **independent** performance: first-try correct answers without hints in Practice, and Test results. Hinted, retried or revealed answers are tracked as assisted work, not mastery. A sixth grader can be "practicing" a World 1 skill, and a fourth grader can master it. Learners can switch bands at any time without losing progress.

## Files

- `js/content/lessons.js`, `worlds.js`, `glossary.js`, `stories.js`: curriculum data
- `docs/curriculum/world-1.md` … `world-6.md`: per-world plans
- `docs/curriculum/SOURCES.md`: verified sources and what could not be verified
- `docs/ASSET-MANIFEST.md`: every illustration still needed
