# Market Minds

**Learn Money. Understand Markets. Think Bigger.**

A free financial-education web app for grades 3–8, centered on Black learners and welcoming to everyone. It introduces money, prices, markets, futures, math, uncertainty, and responsible decision-making.

Educational only. Pretend prices. No real-money trading, live market prices, accounts, or brokerage connections. Futures involve substantial risk, including losses larger than the margin deposit.

## What's in the app

| Area | Status |
|---|---|
| Learning Dashboard, grade selector (Grades 3–5 Market Explorer / Grades 6–8 Market Analyst) | Working |
| Learn — World 1 lessons 1–3, World 2 lesson 1 (Discover → Definition → Visual → Try Together → Check → Next Step), Read to Me, tap-a-word | Working |
| Practice — world/lesson/skill/difficulty, hints, misconception feedback, retries, Practice My Misses, Mixed Review | Working |
| Thinking Lab — 14 reasoning prompts incl. Mistake Detective, guided self-check | Working |
| Market Lab — Price Watch and Paper Practice with invented prices | Working |
| Test — no hints, results by skill, explanations, retake | Working |
| My Progress, Market Dictionary, Market Stories, Decision Journal, Parent & Teacher view | Working |
| Worlds 3–6 and the remaining World 2 lessons | Planned (listed as "In development") |
| Illustrations | Not yet supplied — named placeholders; see `docs/ASSET-MANIFEST.md` |
| Achievement certificates | Planned |

Progress is stored only in this browser's localStorage (`mm.progress.v1`): no names, no accounts, no data collection.

## Run locally

Serve the folder (ES modules need http, not `file://`): `python -m http.server 8000`, then open http://localhost:8000/. No build step and no dependencies.

## Tests

- `npm test` — unit tests (store, curriculum integrity, question engine, Market Lab math, visuals).
- `npm run test:browser` — headless Chrome/Edge suites served under `/Market-Minds/` like GitHub Pages (run one at a time on low-memory machines).

## Documentation

- `docs/ARCHITECTURE.md` — architecture, interface contracts, file ownership.
- `docs/curriculum/` — scope and sequence, world specifications, verified sources.
- `docs/ASSET-MANIFEST.md` — illustrations still needed.
- `docs/QA-REPORT.md` — latest QA results.
- `docs/BUILD-RAILS.md` — product guardrails.

## GitHub Pages

Published from `main` / root at https://bazeocrisy.github.io/Market-Minds/. All URLs are relative so the app works under `/Market-Minds/`.
