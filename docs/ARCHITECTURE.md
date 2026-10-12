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

## Runtime architecture

```
index.html            shell: header (logo, nav, grade selector, mobile menu), <main id="view">, footer
styles.css            single design system (tokens, components, responsive, reduced motion)
js/app.js             router (hash routes) + shell wiring; lazy-loads views
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
| `#/` | `dashboard.js` | Learning Dashboard |
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

### Skill ids (fixed for v1)

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

## File ownership matrix

Agents edit only files they own. Anything else → report to the Lead, who makes the change.

| Owner | Files |
|---|---|
| Lead (Claude) | `docs/ARCHITECTURE.md`, `STATUS.md`, `README.md`, `package.json`, `.nojekyll`, `js/app.js`, `js/store.js`, `js/content/band.js`, `js/content/skills.js` (ids), `tests/unit/store.test.mjs` |
| Agent 1 Curriculum Architect | `js/content/lessons.js`, `js/content/worlds.js`, `js/content/glossary.js`, `js/content/stories.js`, `docs/curriculum/**`, `docs/ASSET-MANIFEST.md`, `tests/unit/content.test.mjs`; may edit names/descriptions in `skills.js` |
| Agent 2 Learning Engine | `js/engine/**`, `tests/unit/engine*.test.mjs` |
| Agent 3 UI/UX | `index.html`, `styles.css`, `assets/placeholders/**`, `js/ui/dom.js`, `js/ui/question.js`, `js/ui/speech.js`, `js/ui/vocab.js`, `js/views/{dashboard,learn,practice,test,progress,dictionary,stories,journal,parent}.js` |
| Agent 4 Interactive Learning | `js/ui/visuals.js`, `js/lab/**`, `js/content/thinking.js`, `js/content/market-scenarios.js`, `js/views/thinking.js`, `js/views/market-lab.js`, `tests/unit/lab*.test.mjs`, `tests/unit/visuals.test.mjs` |
| Agent 5 QA & Accessibility | `tests/browser/**`, `tests/lib/**`, `docs/QA-REPORT.md` |
