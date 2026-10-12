# World 2: The Future Price (Ready: 4 of 4)

**Big idea:** Nobody knows future prices. Farmers worry prices will fall; bakers worry prices will rise. An agreement made today about a future price can reduce that uncertainty, but it can turn out better or worse, and it never guarantees a profit. Futures contracts make such agreements standardized and tradable, and people use them for different reasons, all of which carry risk.

## Lessons

| Id | Title | Status | Skills | Prereqs |
|---|---|---|---|---|
| w2l1 | Planning Ahead: The Farmer, the Baker and the Future Price | **Ready** | `future-agreement`, `hedge-outcome`, `futures-risk` | `buyers-sellers`, `price-change-math`, `supply-demand` |
| w2l2 | From Handshake to Exchange: What Makes a Futures Contract | **Ready** (batch 2) | `futures-standardization` | `future-agreement` |
| w2l3 | Hedgers and Speculators | **Ready** (batch 2) | `hedgers-speculators` | `hedge-outcome` |
| w2l4 | Closing Out: Why Most Futures Never Reach Delivery | **Ready** (batch 2) | `offset-delivery` | `futures-standardization` |

## Teaching sequence

**w2l1** builds the *why* before the vocabulary: the farmer's and baker's opposite worries, then the handshake deal (forward agreement), then hedging; analyst adds standardized exchange-traded futures and offsetting (CFTC). Together: two harvest scenarios. Check: who did the agreement help (explorer); which statement about futures is accurate (analyst).

**w2l2** story first: the farmer grew extra wheat and needs other buyers, but each wants a different amount, quality and month, and he cannot be sure a stranger will keep a promise (the counterparty problem). Then: the exchange's standard "recipe" (amount, quality, months; price is the only term set by trading) and the clearinghouse as buyer to every seller and seller to every buyer. Analyst adds margin as a performance bond (2–10% typical, not a down payment, NOT the most you can lose), daily mark-to-market / settlement and margin calls. Visual: a `priceTags` "contract recipe" card.

**w2l3** Career Day: Ms. Harris (baker, hedger, buys futures), Farmer Okafor (hedger, sells futures), Ms. Tate (trader, speculator, no wheat business). Role comes from the *reason* for trading, not the direction. Neutral framing: neither is good or bad; both can end up worse off; speculation is described with the CFTC's own risk warnings and is not glamorized. Analyst computes a speculator's loss.

**w2l4** Harvest: the farmer sells his wheat locally and closes his short futures with an equal and opposite trade (same contract, same month, same number). Gain/loss = sell price − buy price, × contract size × contracts. Delivery and cash settlement described per CFTC; most contracts are offset rather than delivered.

## Learning objectives

| | Grades 3–5 | Grades 6–8 |
|---|---|---|
| w2l1 | Explain both worries; describe a promise today for a trade later; compare agreed vs. market price; nobody knows the future. | Price risk for producer and user; forward vs. futures; per-bushel and total comparison ($0.75 × 5,000 = $3,750); hedging gives certainty, not profit. |
| w2l2 | Why private promises with strangers are hard; futures follow one recipe (amount, quality, months); traders decide only price; a clearinghouse stands in the middle. | Forward vs. futures terms; what the exchange standardizes vs. price set by trading; clearinghouse as buyer to all sellers/seller to all buyers; margin as performance bond (e.g. $3,000 ÷ $60,000 = 5%), not a loss limit; daily settlement and margin calls. |
| w2l3 | Hedgers already have a price worry and shrink it; speculators take on risk hoping to make money and can lose; neither is good or bad. | Classify by reason, not direction; speculator loss on a contract ($0.30 × 5,000 = $1,500); CFTC risk warnings; both roles can end up worse off. |
| w2l4 | Close out with the opposite trade; gain/loss is the difference in prices; deals not closed out end with delivery or a cash payment. | Identify the offsetting trade (same month); result with sign × size × contracts (e.g. −$0.18 × 5,000 × 3 = −$2,700); why forwards cannot be offset the same way; delivery vs. cash settlement. |

## Vocabulary

harvest, market price, agreed price, price risk, uncertainty, forward agreement, futures contract, exchange, standardized, commodity, hedging, hedger, speculator, delivery, offset, price discovery; **batch 2:** counterparty, clearinghouse, daily settlement (mark to market), position, cash settlement, margin, margin call, contract size, risk.

## Visuals used

- `agreement` card (w2l1) and `bars` scenarios (w2l1)
- `priceTags` contract-recipe card (w2l2), "why do they trade?" role cards (w2l3), offset trade ledger (w2l4)
- Hero illustrations: see `docs/ASSET-MANIFEST.md` (`w2l1-farmer-and-baker`, `w2l2-finding-a-buyer`, `w2l3-career-day`, `w2l4-grain-elevator`, `story-pumpkin-promise`, `story-two-reasons-to-trade`).

## Practice question ideas

- `future-agreement`, `hedge-outcome`, `futures-risk`: see w2l1 (unchanged).
- `futures-standardization`: which term is set by trading vs. the exchange; who is the counterparty after clearing; margin percent of contract value; mistake detective "margin is the most I can lose".
- `hedgers-speculators`: classify a business or person (trucking company, cereal maker, someone with no business exposure); speculator gain/loss with pretend prices; "fair and accurate" statements (no good/bad labels).
- `offset-delivery`: identify the offsetting trade (watch same month and direction); gain/loss with sign, contract size and number of contracts; delivery vs. cash settlement; why forwards differ.

## Assessment plan

- Lesson checks (one per band per lesson; every wrong choice misconception-tagged) + World 2 Test items for all six skills (no hints until submit).
- Market Stories "The Pumpkin Promise" (w2l1) and "Two Reasons to Trade" (w2l3).
- Mastery from independent performance only.

## Accuracy notes (verified, see SOURCES.md)

- Futures "typically are traded on organized exchanges that set standardized terms"; exchanges set contract size, delivery months, last trading day, delivery locations and grades. (CFTC, *Economic Purpose*)
- Clearing house "acts as the buyer to all sellers and the seller to all buyers" (CFTC, *Economic Purpose*). Clearing organization: "An entity through which futures and other derivative transactions are cleared and settled" (CFTC Glossary).
- Margins are "performance bonds", "typically between two and 10 percent of the total value of the contract", "not down payments"; positions are "marked to the market" daily with variation margin. Settlement price = "The daily price at which the clearing organization clears all trades and settles all accounts." (CFTC)
- Hedger and speculator definitions (CFTC Glossary); speculating is "a volatile, complex and risky venture"; "Many individuals lose all of their money" (CFTC, *Futures Market Basics*).
- "Most futures contracts (by volume) are liquidated by offsetting and do not result in delivery"; forward contracts "cannot be offset" (CFTC). Offset uses the same delivery month (CFTC Glossary). "Some contracts allow cash settlement in lieu of delivery" (CFTC, *Futures Market Basics*).
- A CBOT wheat contract provides for delivery of 5,000 bushels (CFTC). The corn contract size in w2l4 is labelled **pretend** (not verified).
- The lessons do not name specific wheat delivery months (not verified).
- No content claims hedging or speculating guarantees profit; margin is never described as a maximum loss.
