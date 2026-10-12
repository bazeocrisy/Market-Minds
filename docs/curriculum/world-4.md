# World 4: Reading Markets (Ready: 4 of 4)

**Big idea:** Charts show what prices did in the past. They help us describe and ask questions; they do not tell us what will happen next. Being long means you are helped by a rise and hurt by a fall; being short is the reverse; both can lose.

## Lessons

| Id | Title | Status | Skills | Prereqs |
|---|---|---|---|---|
| w4l1 | Price Over Time: Reading Line Charts | **Ready** (batch 2) | `line-chart-reading` | `price-change-math` |
| w4l2 | Candlesticks: Open, High, Low, Close | **Ready** (batch 2) | `candlestick-reading` | `line-chart-reading` |
| w4l3 | Long and Short | **Ready** (batch 2) | `long-short` | `price-change-math` |
| w4l4 | What Charts Cannot Tell You | **Ready** (batch 2) | `chart-limits` | `line-chart-reading` |

## Teaching sequence

- **w4l1** Malik tracks six weeks of pretend apple prices for Aunt Imani's corner market. Axes (time across, price up), reading a point, highest/lowest, change between two points; analyst adds scale/gridline intervals, percent change (divide by the *starting* price), and how an axis that does not start at $0 exaggerates steepness.
- **w4l2** Nia's Market Club compares a line chart with candlesticks of the same pretend corn prices. One candle = one period; body = open↔close; wicks reach high and low; up vs. down from close vs. open. Colors vary between charts; Market Minds draws up candles hollow with ▲ and down candles filled with ▼ (matches `js/ui/visuals.js`). Analyst: range = high − low; a long upper wick shows a trip the close hides.
- **w4l3** Paper-points game (no real money): Deja long, Jaylen short. Long result = exit − entry; short result = entry − exit; analyst scales by a **pretend** 1,000-unit contract and number of contracts, with signs. Ties back to World 2 (baker bought = long side; farmer sold = short side). Both sides can lose.
- **w4l4** Malik is sure a four-day rise will continue; a pretend crop report drops the price. Description vs. prediction; trends and patterns can fail; new information is never on the chart; "not enough information" and "wait" are valid. The check is mistake-detective style in both bands.

## Learning objectives

| | Grades 3–5 | Grades 6–8 |
|---|---|---|
| w4l1 | Name the axes; read a point; find highest/lowest; change between two points. | Read with attention to scale; change and percent change between any two points (e.g. $0.40 ÷ $4.00 = 10%); spot a truncated axis. |
| w4l2 | One candle = one period; find open, high, low, close; up or down candle. | OHLC from body and wicks; up/down by close vs. open, check the key; range and open-to-close change. |
| w4l3 | Long helped by a rise, short helped by a fall; count points gained/lost; both can lose. | CFTC long/short definitions; per-unit and per-contract results with signs (e.g. −$0.15 × 1,000 × 3 = −$450). |
| w4l4 | Charts show the past; surprises change prices; "I do not know yet" is smart. | Separate description from prediction; why patterns fail; "past performance is not necessarily indicative of future results"; waiting is valid. |

## Vocabulary

line chart, axis, price change, percent change, trend, candlestick, open/high/low/close (`ohlc`, `open-price`, `high-price`, `low-price`, `close-price`), body (`candle-body`), wick, range (`price-range`), long, short, position, gain, loss, contract size, pattern, uncertainty, supply.

## Visuals used

`line` (pretend prices: w4l1, w4l4, check items, story), `candles` (pretend prices: w4l2), `priceTags` long/short outcome cards (w4l3). Hero illustrations: `w4l1-price-notebook`, `w4l2-market-club`, `w4l3-paper-points-game`, `w4l4-surprise-news`, `story-chart-detectives` (see `docs/ASSET-MANIFEST.md`).

## Practice question ideas

- `line-chart-reading`: highest/lowest (distractors: last point, first rise, swapped high/low); change and percent change (distractors: divided by new value, decimal place, forgot × 100).
- `candlestick-reading`: read OHLC (distractors: close as high, open as high); up/down (distractor: "high above open means up"); range vs. body.
- `long-short`: who gains for a given move; per-unit and per-contract results (distractors: sign flip, forgot contract count or size).
- `chart-limits`: mistake detective ("it went up 4 days so it will go up", "it's due to fall", "this pattern always works"); description vs. prediction; "wait / not enough information".

## Assessment plan

Lesson checks (misconception-tagged wrong choices, ≥2 non-revealing hints); World 4 Test with chart items; Market Story "The Chart Detectives" (w4l4); Thinking Lab: "What could make this chart turn around?" Mastery from independent performance only.

## Accuracy notes

- Long ("One who has bought a futures contract to establish a market position") and short ("The selling side of an open futures contract") are quoted from the CFTC Glossary (fetched 2026-10-12). Position = "An interest in the market, either long or short, in the form of one or more open contracts" (CFTC Glossary).
- Candlestick anatomy (body = open/close; wicks or shadows = high/low; hollow body when close > open, with the open at the bottom; filled body when close < open, with the open at the top) was checked against a broker charting-platform glossary (TD, SOURCES.md #9). That is a commercial source, not a regulator; the conventions are standard, and the content stays with basic anatomy. CME Group education pages timed out again and were not used.
- "PAST PERFORMANCE IS NOT NECESSARILY INDICATIVE OF FUTURE RESULTS" is the legend required by CFTC Rule 4.35(a)(9) (17 CFR 4.35, fetched via Cornell LII). The lesson applies the idea to charts as a principle; it does not claim the rule governs charts.
- The curriculum does **not** teach any indicator-based or pattern-based signal method. No pattern is presented as predictive; charts are taught as description.
- All prices, the 1,000-unit rice contract, and the crop report in w4l4 are pretend.
