# Market Minds — Architecture, Audit & File Ownership

Lead Architect: Claude. Branch: `feature/market-minds-v1`. Never merge to `main` (GitHub Pages deploys `main` / root) without the owner's explicit approval.

## Phase 0 — Repository audit (2026-10-11, main @ df8a1bd)

| Item | Finding |
|---|---|
| Files | `index.html` (one-page landing), `styles.css` (minified, brand palette), `assets/logo.svg`, `README.md`, `docs/BUILD-RAILS.md`, `docs/CLAUDE-MASTER-PROMPT.md`, `docs/CLAUDE-START-HERE.md` |
| App logic | None. One inline script sets the footer year. The six mode cards are static previews ("coming next"). |
| Dependencies / build | None. No package.json, no tests. |
| Hosting | GitHub Pages, legacy build, source `main` / root, live at https://bazeocrisy.github.io/Market-Minds/ (HTTP 200). |
| Images | Only `assets/logo.svg`. The two reference PNGs (`assets/visual-references/*.png`) and every lesson illustration are **missing**. See `docs/ASSET-MANIFEST.md`. |
| Branding | Name, tagline, palette and logo are in place. README still says "A free Baze Learning Lab education project" — removed in this branch. |
| Worth keeping | Logo, palette, tagline, accessible skip link, "educational only / futures risk" footer wording, purpose copy. |

Decision: keep the static GitHub Pages architecture — plain HTML/CSS and native ES modules, no build step, no runtime dependencies. All URLs are relative so the app works under `/Market-Minds/`. A `.nojekyll` file stops the legacy Jekyll build from touching files.

## App-first requirement (owner directive, 2026-10-12)

**Market Minds is an educational application, not a website.** The original `index.html` landing page was only a branding foundation; its marketing layout is not the student experience. Opening Market Minds puts the child straight inside a polished learning app.

| # | Requirement | Implementation |
|---|---|---|
| 1 | App-first launch | No landing page. First launch (no grade chosen) → full-screen onboarding `#/welcome` (choose Grades 3–5 or 6–8, no personal info) → dashboard. Returning students land on their saved dashboard. `app.js` redirects every route to `#/welcome` until a grade is chosen. |
| 2 | Application shell | Persistent compact branded app bar (logo, current grade switch, More menu) + app navigation for Learn, Practice, Thinking Lab, Market Lab, Test, My Progress. Each is a dedicated view; no long promotional scrolling pages. |
| 3 | Navigation | Hash routes managed by `app.js`; short screen transitions (fade/slide ≤200 ms, disabled under `prefers-reduced-motion`). Lessons, practice and tests show one concept/task at a time with Back, Next, Hint and Try Again where appropriate. Browser back/forward and refresh restore the screen. |
| 4 | Dashboard | Current world, current lesson, true mastery progress, Continue Learning, six working activity cards. |
| 5 | Responsive | Phones (<768px): compact app bar + fixed bottom tab bar (Home, Learn, Practice, Test, Progress; Thinking Lab and Market Lab reachable from Home cards and the More sheet), safe-area insets, ≥44px targets, full-height app layout. Tablet/desktop: top app nav, content constrained (reading width ≈ 68ch for lesson text, dashboard grid max ≈ 1200px). |
| 6 | PWA | `manifest.webmanifest` (name, short_name, `display: standalone`, theme/background colors, start_url/scope `./`), PNG icons 192/512 + maskable 512 + apple-touch-icon 180, `sw.js` service worker (below). |
| 7 | Student-first | No marketing hero, pricing, promotional footer or external navigation. The educational-only / futures-risk notice stays (Market Lab banner + a short line in More → About), not as a website footer. |
| 8 | Preserve education | Grade pathways, illustration slots (Black children and families), Read to Me, tap-a-word, Practice with hints, Practice My Misses, Thinking Lab, Market Lab, Test, local progress — unchanged. |
| 9 | Testing | Browser suites cover first-launch onboarding, return visits, navigation/transitions, mobile tab bar, installability (CDP `Page.getInstallabilityErrors`, manifest fields, icons load), offline fallback (service worker + `Network.emulateNetworkConditions` offline), cache versioning, and progress persistence. |

### Offline caching rules (`sw.js`, Lead)
- One versioned cache, `mm-<CACHE_VERSION>`. `install` precaches the full app-shell file list (`PRECACHE`); a unit test fails if that list drifts from the files on disk.
- **Network-first** for every same-origin GET: online students always get the newest files, and the cache is refreshed as they go. Only when the network fails is the cached copy served; navigations fall back to the cached `index.html`.
- `activate` deletes every cache that is not the current version and calls `clients.claim()`; new workers `skipWaiting()`. Obsolete versions are therefore never kept or served when online.
- Never caches cross-origin requests or non-GET requests. localStorage progress is untouched by the worker.
- Registered from `app.js` only over http(s) (not `file://`), scope `./` so it works under `/Market-Minds/`. `app.js` re-checks for a new version when the app returns to the foreground and every 30 minutes.
- **One consistent version per session:** after the first screen renders, `app.js` preloads every view module (ES modules are cached per page), so a version published mid-session can never be mixed with the running one.
- **Safe update boundary (never interrupts work):** screens that can hold unfinished work export `pendingWork()` → `null | { kind, label, resume }` and fire `mm:work-changed` on document when it starts/ends — `practice.js` (active session), `test.js` (test not yet submitted), `journal.js` (unsaved draft), `thinking.js` (unsaved answer draft), `learn.js` (lesson warm-up). A new version is applied only when the learner goes Home **and** nothing is pending, or taps **Refresh now**, which is only offered when nothing is pending (re-checked at the tap). While work is pending the strip says the update will load after it is finished. Lesson steps save as they go, so an open lesson never blocks or loses anything.
- **Going Home never erases work:** the practice session and running test stay in memory across navigation; journal and Thinking Lab drafts are also kept in sessionStorage (`mm.draft.journal`, `mm.draft.thinking`) so they survive a refresh; the dashboard shows "Pick up where you left off" with a Resume link per item. (A browser refresh still ends an in-memory practice session or test; the pages say so honestly and no recorded progress is lost.)
- **Upfront download:** precache = app code + icons only (≈288 KB gzipped, budget 400 KB, enforced by `tests/unit/pwa.test.mjs`); illustrations and reference images are never precached and load lazily (`loading="lazy"`) only when shown.
- **Offline notice:** `#appStatus` (data-kind `offline`) tells the learner opened lessons still work and progress still saves.
- **Install:** Chromium's `beforeinstallprompt` is deferred behind an **Install Market Minds** button in More → Get the app; iPhone/iPad get Add to Home Screen instructions; installed apps show an "installed" note. Manifest shortcuts: Learn, Practice, My Progress.
- **Keeping progress:** in the installed app, `navigator.storage.persist()` is requested so the browser keeps this device's progress (not requested in a normal tab, to avoid permission prompts).

## Runtime architecture

```
index.html            app shell: app bar (logo, grade switch, More), app nav (top on desktop, bottom tab bar on phones), <main id="view">
styles.css            single design system (tokens, components, responsive, reduced motion)
js/app.js             router (hash routes), first-launch gate, screen transitions, SW registration; lazy-loads views
manifest.webmanifest  PWA manifest; assets/icons/ PNG icons
sw.js                 service worker (versioned, network-first offline cache)
js/store.js           local progress persistence (versioned, validated, cross-tab safe)
js/content/           CURRICULUM DATA ONLY (no DOM, no scoring)
js/engine/            LEARNING LOGIC ONLY (no DOM): generators, checking, sessions, mastery
js/lab/               Market Lab simulation math (no DOM)
js/ui/                shared DOM helpers: visuals (SVG charts), question renderer, speech, tap-a-word
js/views/             one module per screen
tests/unit/           node --test (pure modules)
tests/browser/        headless Chrome checks (run ONE AT A TIME — the dev PC has 12 GB RAM)
```

Content, engine and UI are separate layers: content never imports engine/ui; engine imports content only for skill metadata; views import both.

### Routes (hash)

| Route | View module | Purpose |
|---|---|---|
| `#/welcome` | `welcome.js` | first-launch onboarding (grade choice) |
| `#/` | `dashboard.js` | Learning Dashboard (returning students) |
| `#/learn` | `learn.js` | worlds + lessons list |
| `#/learn/<lessonId>` / `#/learn/<lessonId>/<step>` | `learn.js` | lesson player (step is 1-based) |
| `#/practice` | `practice.js` | chooser (world, lesson, skill, difficulty, Practice My Misses, Mixed Review) |
| `#/practice/session` | `practice.js` | active practice session |
| `#/thinking`, `#/thinking/<promptId>` | `thinking.js` | Thinking Lab |
| `#/market-lab` | `market-lab.js` | Market Lab |
| `#/test`, `#/test/<scope>` | `test.js` | Test chooser / test (`scope` = lesson id or `world-1`) |
| `#/progress` | `progress.js` | My Progress |
| `#/dictionary` | `dictionary.js` | Market Dictionary |
| `#/stories`, `#/stories/<id>` | `stories.js` | Market Stories |
| `#/journal` | `journal.js` | Decision Journal |
| `#/parent` | `parent.js` | Parent/Teacher view (read-only) |
| `#/certificates` | `certificates.js` | printable skill-milestone certificates |

A view module exports `render(el, params, ctx)` and may return a cleanup function. `params` = path segments after the first (`['w1l1','3']`), `ctx = { store, band, go(hash), query }`. Views must not keep timers or speech running after cleanup.

### Grade bands

`'explorer'` = Grades 3–5 (Market Explorer), `'analyst'` = Grades 6–8 (Market Analyst). Band text in content is either a plain string (shared) or `{ explorer, analyst }`; use `pick(value, band)` from `js/content/band.js`. Band is never treated as mastery: mastery comes only from independent performance.

## Interface contracts

### Store (`js/store.js`, Lead)

`store.get()` → state (treat as read-only), `store.update(fn)` (mutate the draft inside `fn`; saved + subscribers notified), `store.subscribe(fn)` → unsubscribe, `store.reset()`. Helpers: `setBand`, `markLessonStep(lessonId, step)`, `completeLesson(lessonId)`, `introduceSkills(skillIds)`. Key `mm.progress.v1`. Corrupt JSON is backed up to `mm.progress.corrupt` and replaced with a fresh state. A `storage` event from another tab reloads state and notifies subscribers. State shape:

```js
{ version: 1, updatedAt, band: null|'explorer'|'analyst',
  current: { lessonId, step } | null,
  lessons: { [lessonId]: { step, maxStep, completed, completedAt } },
  skills:  { [skillId]: { introduced, independent: { correct, attempts }, assisted: { correct, attempts },
                          revealed, recent: [1|0 …last 8 independent results], lastSeen } },
  misses:  { [skillId]: { count, misconceptions: { [id]: n }, lastMissed, clearedStreak } },
  tests:   [ { id, scope, band, date, score, total, bySkill: { [skillId]: { correct, total } } } ],
  thinking:{ [promptId]: { choice, response, selfCheck: [bool], completedAt } },
  journal: [ { id, date, prediction, reasoning, outcome, lesson } ],
  lab:     { runs: 0, decisions: [] } }
```

### Question object (engine output, rendered by `js/ui/question.js`)

```js
{ key,            // unique string for template+values — used to avoid repeats
  skill, difficulty: 'easy'|'medium'|'challenge', band, template, kind, // kind: vocab|visual|chart|math|scenario|mistake-detective|concept
  type: 'choice'|'number'|'fill'|'match',
  prompt,         // may contain [[termId]] / [[termId|shown text]] tap-a-word markup
  visual?,        // spec for js/ui/visuals.js
  choices?: [{ id, text, misconception? }],   // choice + fill (word bank)
  sentence?,      // fill: text with ___ for the blank
  answer,         // choice/fill: choice id; number: number; match: { leftId: rightId }
  pairs?: { left: [{ id, text }], right: [{ id, text }] },   // match
  prefix?, unit?, tolerance?,                  // number
  hints: [str, str, …],      // progressive, ≥2, never state the answer outright
  explanation,               // why the right answer works (shown when correct / after reveal / after test)
  teach,                     // fuller mini-lesson after repeated misses
  misconceptions?: { [id]: 'what the student probably thought + a clue' } }
```

### Engine (`js/engine/index.js`, Agent 2)

- `generateQuestion(skillId, { band, difficulty, rng?, avoid?: Set<key> })` → Question
- `checkResponse(question, response)` → `{ correct, misconception: id|null, feedback }` (feedback explains what is wrong, never reveals the answer)
- `createPracticeSession({ band, skills, difficulty, mode }, store)` → session: `.current` `{ question, attempts, hintsUsed, revealed, status }`, `.hint()` → next hint or null, `.submit(response)` → `{ correct, feedback, misconception, explanation?, teach?, canRetry }`, `.reveal()` → `{ answer, explanation }`, `.next()`, `.summary()`. Independent credit only for first-try correct with no hint; hinted/retried correct = assisted; revealed = no credit. Misses go to the miss queue.
- `createTest({ band, scope, length }, store)` → `{ items, answer(i, response), submit() → results }`. No hints, no feedback before submit. Results are recorded as independent evidence.
- `masteryFor(state, skillId)` → `{ level: 'not-started'|'introduced'|'practicing'|'needs-review'|'mastered', … }`, `missQueue(state)` → skillIds.

### Visuals (`js/ui/visuals.js`, Agent 4)

`renderVisual(spec)` → element with `role="img"` + text alternative. Kinds: `line {title, unit, points:[{label,value}]}`, `bars {title, unit, items:[{label,value}]}`, `candles {title, candles:[{label,open,high,low,close}]}`, `priceTags {items:[{label,price,note?}]}`, `supplyDemand {item, supply, demand}` (each `'more'|'less'|'same'`), `agreement {item, buyer, seller, price, quantity, when}`, `image {asset, alt, caption}` (named placeholder until art exists). Optional second argument `{ band }`. SVG kinds use `role="img"` + summary and a "Show the numbers" table; HTML kinds (`priceTags`, `agreement`) stay readable text (`role="group"`).

Market Lab route accepts `?activity=watch|paper&scenario=<id>`. `lab.decisions` entries: `{ scenarioId, activity: 'price-watch'|'paper-practice', choice, reasonGiven, date }` — pretend profit/loss is never stored as a score.

### Content (`js/content/`, Agent 1)

`skills.js` (skill ids are FIXED — see below), `worlds.js`, `lessons.js` (`LESSONS`, `lessonById`), `glossary.js`, `stories.js`. Lesson: `{ id, world, number, title, status: 'ready'|'planned', skills, prereqs, vocab, objectives: BandValue<string[]>, steps }` with steps in the required order `discover → definition → visual → together → check → next`. See `js/content/lessons.js` header comment for the step shapes.

### Skill ids (fixed; batch 2 added 2026-10-12)

| Skill id | Lesson | Name |
|---|---|---|
| `market-basics` | w1l1 | What a market is |
| `buyers-sellers` | w1l1 | Buyers and sellers |
| `price-change-math` | w1l2 | Finding a price change |
| `price-change-reasons` | w1l2 | Why prices change |
| `supply-demand` | w1l3 | Supply and demand |
| `future-agreement` | w2l1 | Agreeing on a future price |
| `hedge-outcome` | w2l1 | Who did the agreement help? |
| `futures-risk` | w2l1 | Uncertainty and risk |
| `futures-standardization` | w2l2 | Forward vs. futures |
| `hedgers-speculators` | w2l3 | Hedgers and speculators |
| `offset-delivery` | w2l4 | Closing out a position |
| `line-chart-reading` | w4l1 | Reading line charts |
| `candlestick-reading` | w4l2 | Reading candlesticks |
| `long-short` | w4l3 | Long and short |
| `chart-limits` | w4l4 | What charts cannot tell you |

## File ownership matrix

Agents edit only files they own. Anything else → report to the Lead, who makes the change.

| Owner | Files |
|---|---|
| Lead (Claude) | `sw.js`, `manifest.webmanifest`, `assets/icons/**`, `tests/unit/pwa.test.mjs`, `tests/browser/pwa-lifecycle.mjs`, `tests/browser/smoke.mjs`, `docs/ARCHITECTURE.md`, `STATUS.md`, `README.md`, `package.json`, `.nojekyll`, `js/app.js`, `js/store.js`, `js/content/band.js`, `js/content/skills.js` (ids), `tests/unit/store.test.mjs` |
| Agent 1 Curriculum Architect | `js/content/lessons.js`, `js/content/worlds.js`, `js/content/glossary.js`, `js/content/stories.js`, `docs/curriculum/**`, `docs/ASSET-MANIFEST.md`, `tests/unit/content.test.mjs`; may edit names/descriptions in `skills.js` |
| Agent 2 Learning Engine | `js/engine/**`, `tests/unit/engine*.test.mjs` |
| Agent 3 UI/UX | `js/views/welcome.js`, `js/views/certificates.js`, `index.html`, `styles.css`, `assets/placeholders/**`, `js/ui/dom.js`, `js/ui/question.js`, `js/ui/speech.js`, `js/ui/vocab.js`, `js/views/{dashboard,learn,practice,test,progress,dictionary,stories,journal,parent}.js` |
| Agent 4 Interactive Learning | `js/ui/visuals.js`, `js/lab/**`, `js/content/thinking.js`, `js/content/market-scenarios.js`, `js/views/thinking.js`, `js/views/market-lab.js`, `tests/unit/lab*.test.mjs`, `tests/unit/visuals.test.mjs` |
| Agent 5 QA & Accessibility | `tests/browser/**`, `tests/lib/**`, `docs/QA-REPORT.md` |
