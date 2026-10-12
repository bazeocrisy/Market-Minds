# Sources (verified 2026-10-11)

Only sources that were **actually fetched and read** during curriculum writing are listed in the first table. Anything not verified is listed separately and kept conservative in the content.

## Fetched and read

| # | Source | URL | What it supports in Market Minds |
|---|---|---|---|
| 1 | CFTC, *The Economic Purpose of Futures Markets and How They Work* | https://www.cftc.gov/LearnAndProtect/EducationCenter/economicpurpose | Hedging lets producers (farmers) and consumers (millers) limit price risk; the Kansas wheat farmer example (risk of price falling before harvest); futures "typically are traded on organized exchanges that set standardized terms"; exchanges set contract size, delivery months, last trading day, delivery locations and grades; "Most futures contracts (by volume) are liquidated by offsetting and do not result in delivery"; forwards cannot be offset the same way; clearing house acts as buyer to all sellers and seller to all buyers; margin is a performance bond, "typically between two and 10 percent" of contract value, "not down payments"; daily mark-to-market, maintenance and variation margin; a CBOT wheat contract "provides for delivery of 5,000 bushels". Used in: w2l1, glossary (futures-contract, exchange, standardized, offset, hedging, hedger, delivery, margin, margin-call, contract-size), world-2 and world-5 docs. |
| 2 | CFTC, *Futures Market Basics* | https://www.cftc.gov/LearnAndProtect/EducationCenter/FuturesMarketBasics/index.htm | "A commodity futures contract is an agreement to buy or sell a particular commodity at a future date"; price and amount fixed at the time of agreement; futures must (with limited exceptions) be traded through an exchange; most participants are hedgers; speculators "attempt to profit from price changes"; "Many individuals lose all of their money, and can be required to pay more than they invested initially." Used in: glossary (futures-contract, hedger, speculator, margin), world-5/world-6 risk notes. |
| 3 | CFTC Glossary | https://www.cftc.gov/LearnandProtect/AdvisoriesAndArticles/CFTCGlossary/index.htm | Definitions of futures contract ("may be satisfied by delivery or offset"), forward contract, hedger, commodity, contract size ("The actual amount of a commodity represented in a contract"), delivery, initial/original margin, maintenance margin, margin call, leverage ("control large dollar amounts … with a comparatively small amount of capital"), long ("One who has bought a futures contract"), short ("The selling side of an open futures contract"), offset, stop order ("becomes a market order when a particular price level is reached"), tick ("a minimum change in price up or down"), price discovery. Used throughout the glossary. |
| 4 | Investor.gov (SEC), *Investor Bulletin: Stop, Stop-Limit, and Trailing Stop Orders* | https://www.investor.gov/additional-resources/news-alerts/alerts-bulletins/investor-bulletin-stop-stop-limit-trailing-stop | "The stop price is not the guaranteed execution price for a stop order"; once triggered it becomes a market order whose price "can deviate significantly from the stop price"; stop-limit orders may not execute at all. Used in: glossary `stop-order`, world-6 accuracy notes. (Written about stocks; the core idea that a stop is a trigger, not a guaranteed price, is the same idea the CFTC glossary states for futures.) |
| 5 | Investor.gov (SEC), *Stocks* | https://www.investor.gov/introduction-investing/investing-basics/investment-products/stocks | Stock gives "a share of ownership in a company"; "stock prices move down as well as up … you can lose money". Used in: glossary `stock`, world-3 docs. |
| 6 | Investor.gov (SEC) Glossary, *Market Index* | https://www.investor.gov/introduction-investing/investing-basics/glossary/market-index | Index = "A measurement of the performance of a specific 'basket' of stocks"; the DJIA is an index of 30 blue-chip U.S. company stocks. Used in: glossary `stock-index`. |
| 7 | Investor.gov (SEC), *What Is Risk?* | https://www.investor.gov/introduction-investing/investing-basics/what-risk | Risk = "the degree of uncertainty and/or potential financial loss inherent in an investment decision"; higher risk is associated with seeking higher returns. Used in: glossary `risk`, `reward`, world-6 docs. |

## Searched but not directly fetched (not used as authority)

- Web-search summaries pointed to NFA investor advisories and broker risk disclosures stating that futures losses can exceed the initial deposit. The NFA pages themselves could not be opened (404 / blocked). The claim "margin is not the maximum loss" in Market Minds rests on **source 1** (margin calls / variation margin) and **source 2** ("can be required to pay more than they invested initially"), which were fetched.

## Could NOT verify (marked "to verify" in docs; not stated as fact in app content)

- **CME Group contract specifications** (wheat tick value, gold, crude oil, Micro E-mini S&P 500 contract units and ticks). Every cmegroup.com request returned HTTP 403 or timed out. Only the CBOT wheat contract size of **5,000 bushels** is verified (via CFTC source 1). All other contract-unit and tick facts in `world-3.md` and `world-5.md` are marked **to verify**, and the glossary `tick` example uses a clearly pretend contract instead.
- **Supply and demand** wording (World 1) is standard introductory economics. A Federal Reserve education PDF was downloaded but could not be read (no PDF text tool available). Content is phrased as tendencies ("tends to", "most likely"), never as guarantees.
- **Candlestick / open-high-low-close** conventions (World 4) were not checked against an authoritative source; they are standard chart conventions. Verify before building World 4.

## Content rules that follow from the sources

- A futures contract is presented as standardized and exchange-traded; the farmer/baker handshake is explicitly called a **forward agreement**.
- "Most futures positions are closed out (offset) before delivery" is attributed to the CFTC.
- Margin is a performance bond, never described as a maximum loss.
- A stop price is a trigger, never a guaranteed exit price.
- Hedging reduces uncertainty; it never guarantees profit.
- All prices in lessons, stories and the glossary are pretend.
