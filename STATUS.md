# Market Minds — Status

Branch `feature/market-minds-v1` (not merged; `main` = live GitHub Pages, merge only with owner approval).

## Done
- App-first shell: first-launch onboarding (#/welcome), saved dashboard on return, persistent app bar + More sheet, bottom tab bar on phones / top nav on tablet+desktop, screen transitions (reduced-motion safe), no website footer.
- PWA: manifest, icons (any + maskable + apple-touch), network-first service worker with content-hash cache version; installability + offline + update verified in headless Chrome.
- 11 lessons ready: World 1 (3), World 2 (4), World 4 (4); both grade bands; Read to Me; tap-a-word (64 dictionary terms); prerequisite warm-up.
- Practice: 15 skills, 7–9 question templates each, hints, misconception feedback, retries, Show me how, Practice My Misses, Mixed Review, adaptive difficulty; independent vs assisted credit.
- Thinking Lab 30 prompts (9 Mistake Detective); Market Lab Price Watch + Paper Practice with Line/Candles, Pattern Trap, Long or Short panel; Test with per-skill results and retake; My Progress; Stories (6); Decision Journal; Parent & Teacher; Achievement Certificates (earned only from mastery, no names stored).

## Not done
- Worlds 3, 5, 6 (listed as "In development"; specs in `docs/curriculum/`). Worlds 3 and 5 need verified CME contract specs.
- All illustrations (see `docs/ASSET-MANIFEST.md`).
- CME contract specs could not be fetched (403) — marked "to verify" in world-3/world-5 specs; not used in app content.

## Tests
unit 95/0 · smoke 673/0 · app-shell 267/0 · pwa 67/0 · acceptance 461/0 · a11y 3149/0 · robustness 71/0 (run one at a time).
