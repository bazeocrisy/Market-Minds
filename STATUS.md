# Market Minds — Status

Branch `feature/market-minds-v1` (not merged; `main` = live GitHub Pages, merge only with owner approval).

## Done (v1 first release candidate)
- Phase 0 audit, architecture, contracts, file-ownership matrix (`docs/ARCHITECTURE.md`).
- Learning Dashboard, grade selector (3–5 / 6–8), responsive shell, mobile menu.
- World 1 lessons 1–3 + World 2 lesson 1, full 6-step sequence, both bands, Read to Me, tap-a-word, prerequisite warm-up.
- Practice (world/lesson/skill/difficulty/adaptive, hints, misconception feedback, retries, Show me how, Practice My Misses, Mixed Review); independent vs assisted credit.
- Thinking Lab (14 prompts, 3 Mistake Detective, self-check — free text never auto-graded).
- Market Lab (Price Watch, Paper Practice; invented prices; losses, margin, stop gaps; no profit scoring).
- Test (no hints, per-skill results, explanations, retake with new questions).
- My Progress, Dictionary (48 terms), Stories (4), Decision Journal, Parent & Teacher view (printable).

## Not done
- Worlds 3–6 and World 2 lessons 2+ (listed as "In development"; specs in `docs/curriculum/`).
- All illustrations (see `docs/ASSET-MANIFEST.md`); achievement certificates.
- CME contract specs could not be fetched (403) — marked "to verify" in world-3/world-5 specs; not used in app content.

## Tests
`npm test` 77/77 · `npm run test:browser`: smoke 449 · acceptance 351 · a11y 1631 · robustness 66 (0 failures).
