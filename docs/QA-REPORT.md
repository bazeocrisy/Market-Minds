# Market Minds — QA & Accessibility Report

Agent 5 (QA & Accessibility). Branch `feature/market-minds-v1` @ e650c17. Date 2026-10-11.
Environment: Windows 11, Node 22+, headless Chrome 155 via CDP (`tests/lib/harness.mjs`), static server under `/Market-Minds/` like GitHub Pages. No app code was changed for this report.

## 1. What was run

| Command | Result |
|---|---|
| `npm test` (unit, `node --test`) | **77 passed, 0 failed** |
| `node tests/browser/smoke.mjs` | **449 passed, 0 failed** |
| `node tests/browser/acceptance.mjs` | **349 passed, 10 failed** |
| `node tests/browser/a11y.mjs` | **1630 passed, 1 failed** |
| `node tests/browser/robustness.mjs` | **64 passed, 2 failed** |
| `npm run test:browser` (= `tests/browser/run-all.mjs`, runs the four suites one at a time) | exit 1 (3 of 4 suites fail, on real defects listed below) |

Every failing check is a real app defect. No check was weakened to make it pass.

### Suites (new files)
- `tests/browser/qa-lib.mjs`: shared helpers: pass/fail counter, real taps (CDP mouse events at the element's centre after an `elementFromPoint` hit-test), key presses with proper virtual-key codes, Chrome AX-tree accessible names, a speechSynthesis stub and a "no speech" shim, and question capture (described below).
- `tests/browser/acceptance.mjs`: the master-prompt acceptance walk-through at 375×812 with touch emulation, starting from cleared storage, plus the Grades 6–8 path.
- `tests/browser/a11y.mjs`: covers 31 routes × 3 widths (375/768/1440) × 2 bands. Checks: overflow, accessible names (Chrome AX tree), labels, a single h1 that receives focus, text alternatives, computed-colour WCAG contrast on every visible text node, keyboard operation, focus visibility, 44px tap targets, reduced motion, link crawl, "Baze" scan, and the fallback when speech is unsupported.
- `tests/browser/robustness.mjs`: refresh/resume, back/forward, corrupt/malformed/blocked storage, a two-tab simulation, refresh during practice/test, GitHub Pages path and letter-case checks, dashboard numbers matching the store, and reset.
- `tests/browser/run-all.mjs`: runs the suites sequentially with `spawnSync` and exits non-zero if any fail.
- Screenshots: `tests/screenshots/{375,1440}-*.jpg` (git-ignored). Covers dashboard (fresh, chosen, returning), lesson visual, lesson check feedback, lesson step, practice feedback, test question, test results, Market Lab Price Watch, Market Lab paper loss, and progress.

### How the acceptance test knows the right answer
Before a check, the UI never shows the correct answer (by design), and the practice session and test objects are module-private. The suite therefore watches the engine's own Question objects in the page without changing app code (`CAPTURE_SRC` in `qa-lib.mjs`):
- An `answer` setter on `Object.prototype` records every object that receives `q.answer = …`, which is how `engine/generate.js` `assemble()` builds questions. The setter then redefines `answer` as a normal own property, so app behaviour is unchanged.
- `Set.prototype.add` is wrapped. `session.js` (`seen.add(question.key)`) and `test.js` (`avoid.add(q.key)`) add a key exactly when a question is accepted, so `__qa.accepted` is the ordered list of questions shown to the student.

Each captured question is cross-checked against the rendered `.q-prompt` text before it is used. Lesson Try-Together and Check-Understanding answers are read from `js/content/lessons.js`.

## 2. Defects

### Critical

**C1. Test questions cannot be answered. Every test item renders "This question type can’t be shown yet."**
- Route: `#/test/<scope>` (e.g. `#/test/w1l1`, `#/test/world-1`), both bands, all widths.
- Steps: Test → pick any lesson → Start test.
- Expected: the prompt and answer controls appear (choices, number box, word bank or match selects).
- Actual: the prompt is empty and the only content is the warning "This question type can’t be shown yet." A student can only submit blank, which scores 0 of N and records N independent misses toward mastery and the miss queue.
- The results page has the same root cause: each "Every question" entry shows an empty prompt, "Your answer: No answer", "Correct answer: No answer" and no "Why" explanation. The score, per-skill boxes and missed-skill links still work because they use `item.skill` and the engine results.
- Suspected file: `js/views/test.js`. `renderItem` passes `items[r.index]`, which is the engine wrapper `{ index, skill, question, response }`, to `renderQuestion`; it should pass `items[r.index].question`. `renderResults` has the same problem: it builds `per` from wrappers (`p.q.prompt`, `p.q.answer`, `p.q.explanation`). The full question is in `res.items[i].question` after submit.
- Evidence: acceptance checks "test question renders…", "each result shows its question prompt", "…correct answer…", "…explanation". Screenshots `375-test-question.jpg` and `*-test-results.jpg`. Smoke never caught this because it only opens the test intro.
- Effect on acceptance: the master prompt's "take a distinct test" cannot be completed. The engine is not at fault: retakes did get completely different question keys (checked).

### Major

**M1. Practice chooser: the Lesson and Skill dropdowns are empty, so `?lesson=` and `?skill=` deep links do nothing.**
- Route: `#/practice`, `#/practice?lesson=w1l2`, `#/practice?skill=market-basics`.
- Steps: open Practice and open the Lesson or Skill dropdown. Or press "Practice this lesson" on lesson step 6. Or press "Practice: <skill>" on test results.
- Expected: the Lesson dropdown lists the ready lessons of the chosen world and the Skill dropdown lists their skills, with the deep-linked lesson or skill preselected.
- Actual: each dropdown has only its "All…" option. The `<select>` also contains a stray text node `"[object HTMLOptionElement],[object HTMLOptionElement],…"`. Every custom practice session therefore covers all World 1 skills. The "review missed skills" links from test results and the "Practice this lesson" card land on an unfiltered chooser.
- Suspected file: `js/views/practice.js`, `fillLessons` / `fillSkills`. `select.replaceChildren(option, ls.map(...))` passes an array, and `replaceChildren` stringifies arrays instead of flattening them. Spread the array (`...ls.map(...)`) or use the `h()` helper.

### Minor

**m1. The step-3 visual (price tags figure) has no accessible name in Chrome.**
- Route: `#/learn/w1l1/3` (any `priceTags` visual).
- Steps: inspect the AX tree.
- Expected: per the visuals contract, HTML kinds are a named `role="group"`.
- Actual: `<figure>` with `<figcaption>`, and Chrome's AX tree reports name "". The tag text is still read as plain text.
- Suspected file: `js/ui/visuals.js` `figure()` / `renderPriceTags`. Add `role="group"` and `aria-labelledby` pointing at the figcaption.

**m2. Switching grade moves keyboard focus to the page h1.**
- Route: any route.
- Steps: Tab to "Grades 6–8" in the header and press Enter.
- Expected: focus stays on the grade button.
- Actual: `route()` re-renders and focuses the h1, so keyboard and screen-reader users lose their place in the header.
- Suspected file: `js/app.js`, the band click handler calls `route()`. Re-render without moving focus when the trigger was a band button.

**m3. A storage event from another tab does not refresh the visible view.**
- Route: `#/` (applies to any view).
- Steps: with the dashboard open, another tab saves a different band and a completed lesson.
- Expected: the dashboard reflects the new state.
- Actual: the store reloads correctly and the header grade buttons update, but the dashboard still says "Welcome, Market Explorer!" with "0 of 4" until navigation.
- Suspected file: `js/app.js`. Only `syncBand` subscribes. Re-render the current route when `store.reload()` fires (or have views subscribe).
- Not a data-loss problem: a later save from the stale tab did not clobber the other tab's newer data (checked).

**m4. Refreshing during a test gives no "test ended" message.**
- Route: `#/test/w1l1`.
- Steps: start a test, answer some questions, reload.
- Expected: an honest note that the unfinished test was not kept, like Practice's "Your practice session ended".
- Actual: the normal test intro appears silently. Nothing is recorded, which is correct.
- Suspected file: `js/views/test.js` `renderIntro`.

**m5. Skills table is cramped at 375px (visual review).**
- Route: `#/progress`, `#/parent`.
- The five-column table scrolls horizontally inside `.table-wrap`. Skill descriptions wrap into a very narrow column, and "With help" / "Recent" sit off-screen with no visual hint that the table scrolls.
- No page-level overflow (checked).
- Suspected file: `styles.css` (table layout) / `js/views/progress.js`. Suggest stacked rows on small screens.

**m6. Grammar: "1 skills mastered" / "1 skills to review" on My Progress.**
- `statBox(mastered.length, 'skills mastered')` doesn't pluralise.
- Suspected file: `js/views/progress.js`.

## 3. What passed (highlights, all from checks run)

**Acceptance walk-through (375×812, touch emulation, cleared storage)**
- Grade choice by real tap. The header `aria-pressed` toggles. "Start Learning" goes to `#/learn/w1l1/1`.
- The fresh dashboard shows true zeros.
- Read to Me, with `speechSynthesis` stubbed:
  - no `speak()` on load or on later steps;
  - Play speaks the step, starting with the title;
  - Pause calls `pause()`, Resume calls `resume()`, Stop calls `cancel()`;
  - the speed select is labelled;
  - leaving a step cancels speech.
- Tap-a-word: the dialog opens with the word as its accessible name, plus a definition and an example. Focus moves inside, Esc closes it and focus returns to the word.
- Try Together: a wrong choice shows coaching; there is no advance and retry is allowed. A right choice gives "Next question".
- Check Understanding:
  - the hint is progressive and does not give away the answer;
  - a wrong answer gets coaching and retry, without revealing the answer;
  - the right answer is locked and shows "Why";
  - no mastery evidence is recorded.
- Step 6 marks the lesson complete and introduces its skills, with no mastery.
- Practice:
  - wrong first → feedback explains, no auto-advance after 1.5 s, Try again;
  - two hints, progressive and different, neither revealing the answer → assisted;
  - Show answer → no credit, plus a miss;
  - three first-try correct answers → independent.
- After each question, store `independent` / `assisted` / `revealed` counts and the miss queue matched exactly what the script did. The tally and summary numbers matched too.
- Practice My Misses was enabled, served only missed skills, and ended honestly once the queue cleared.
- Test (see C1):
  - no Hint/Check/Show-answer buttons;
  - no correctness shown before submit;
  - blank submit asks for confirmation;
  - the score equals the deliberate number right (0 because of C1);
  - the per-skill store entry is right;
  - the missed-skill links are right;
  - Retake has entirely different question keys.
- Market Lab:
  - Price Watch, full 5 days: each revealed price, the change math and the up/down/"about the same" call verified against the scenario data;
  - Paper Practice, "Practice Apples", Buy: P/L lines and total −$40.00 verified;
  - the loss-exceeds-margin message ("extra $20.00", "Margin is not the most you can lose") is present, and the other side is shown as +$40.00;
  - No trade works and shows both sides;
  - `lab.decisions` stores no P/L.
- Reload: Continue Learning resumes `#/learn/w1l2/3`. Every dashboard and My Progress number equals the store.
- Grades 6–8 path:
  - lesson text uses decimals ($1.25);
  - practice questions are analyst-band with decimals;
  - the percent template exists for analyst "challenge" (engine, 60 seeds) and never appears for Grades 3–5;
  - the UI session could not target the percent skill because of M1.

**Accessibility (a11y.mjs)**
- No horizontal overflow on any route at 375, 768 or 1440, in either band.
- Every button, link, textbox, combobox, radio, tab, img and dialog has a Chrome-computed accessible name. Every input, select and textarea has a `<label>`.
- Exactly one h1 per view, and focus moves to it on every navigation.
- Contrast: 3,792 text samples meet WCAG AA from computed colours. Spot values:
  - body text 15.4:1
  - hero primary button 9.0:1
  - secondary button 15.4:1
  - "Ready" chip 5.3:1
  - card status 6.1:1
  - footer 9.1:1

  Placeholder-art text over its background image was not computable, and its readability was not checked visually.
- Keyboard:
  - from the skip link, Tab reaches the brand, both grade buttons and all 11 nav links, with a visible `:focus-visible` outline or shadow on each;
  - Enter and Space toggle grades;
  - the mobile menu button can be reached and is named "Menu"; Enter and Space open it (`aria-expanded`), Tab enters the nav, and Esc closes it and returns focus;
  - Try-Together choices work with Enter and Space;
  - the answer radiogroup is named, Space selects, arrows move, roving tabindex is in place, and Enter on Check works;
  - the word dialog traps focus.
- Primary tap targets are ≥ 44px at 375 on every route, including open mobile-menu links.
- With `prefers-reduced-motion: reduce`, there are no transitions or animations over 0.01 s, no running animations and no smooth scroll. Without the preference, 4 elements animate.
- Images and SVGs are labelled or hidden. Placeholder art carries its planned description.
- All 55 distinct internal `#/…` links resolve to real views. There are no external or root-absolute hrefs.
- No "Baze" text in rendered UI, titles or attributes on any route, nor in `index.html`, `styles.css` or `js/**`.
- No console errors and no 404s.
- Speech unsupported: the polite note "Read to Me isn’t available in this browser…" appears on all 6 steps, with no Read-to-Me controls, no "Hear it" buttons (dialog or dictionary), working navigation and no errors.

**Robustness**
- Refresh mid-lesson resumes the step. `#/learn/w1l1` without a step resumes the saved step.
- Back/forward work between steps and between views. Focus goes to the h1, `aria-current` follows, and Back closes an open dialog.
- Corrupt JSON: the app loads fresh, backs up the exact text to `mm.progress.corrupt`, and can save again.
- Malformed shapes and an unknown version are normalised with no errors.
- With localStorage completely blocked, the app still works in memory with no errors.
- Refresh during practice gives an honest "Your practice session ended" page, and the summary page is honest too.
- Dashboard, My Progress and Parent numbers equal a crafted store. A completed non-ready lesson id is not counted, and the engine agrees on mastery.
- Reset: confirmation focuses the safe choice and Cancel keeps data. Confirming erases everything, persists, and survives reload.

## 4. GitHub Pages compatibility
- All 46 distinct fetched URLs (documents, modules, CSS, SVG) are under `/Market-Minds/`, and the server saw no requests outside it.
- No root-absolute `src` / `href` / `url(` / `import(` / `from '/` / `fetch('/` in `index.html`, `styles.css` or `js/**`.
- Letter case: every fetched path matches the on-disk name exactly. GitHub Pages is case-sensitive and Windows is not, so this would otherwise go unnoticed.
- `.nojekyll` is present. The app uses hash routing, so deep links never need server rewrites.
- Not tested: the live `https://bazeocrisy.github.io/Market-Minds/` deploy (this branch is not published). The local server mimics the sub-path only.

## 5. NOT tested — manual only
- **Real speech voices.** All speech checks used a stub. Not checked: actual audio, voice selection, sentence chunking on Chrome/Edge/Safari/Firefox, and iOS Safari queue drops.
- **Pause/Resume on mobile user agents.** `speech.js` hides Pause on mobile UAs; headless Chrome kept a desktop UA.
- **Real devices.** iOS Safari, Android Chrome and tablets were not used: no real touch gestures, no on-screen keyboard behaviour (`inputmode=decimal`), no safe-area/notch handling, no `<dialog>` support on older Safari. Touch was emulated.
- **Screen readers.** NVDA, JAWS, VoiceOver and TalkBack were not used. Accessible names come from Chrome's AX tree only; live-region announcements and reading order were not listened to.
- **Browser zoom / text resize** to 200% and Windows High Contrast / forced colours.
- **Content accuracy** of financial definitions and age-appropriateness (curriculum review).
- **Firefox and Safari engines** (only Chromium ran).

## 6. Suggested fix order
1. C1: test view, pass `.question` (and use `res.items[i].question` on results). Re-run `acceptance.mjs`.
2. M1: spread the arrays in the practice chooser's `replaceChildren`.
3. m1–m6.

`npm run test:browser` should then be fully green. The acceptance suite's Grades 6–8 percent check will then also be reachable through the UI by choosing the "Finding a price change" skill.

---

## Fix verification (Lead, after the QA pass)

| Defect | Fix | Verified by |
|---|---|---|
| C1 test questions unrenderable; results page empty | `js/views/test.js` renders `item.question`; results use the full question returned by `submit()` | acceptance.mjs (answers every test item, score = deliberate correct count), screenshot `375-test-question.jpg` |
| M1 Practice Lesson/Skill selects empty | `js/views/practice.js` spreads option arrays into `replaceChildren` | acceptance.mjs (deep links prefill) |
| m1 priceTags figure unnamed | `js/ui/visuals.js` titled figures get `role="group"` + `aria-labelledby` | a11y.mjs |
| m2 grade switch moved focus to h1 | `js/app.js` keeps focus on the pressed grade button | a11y.mjs |
| m3 other-tab change left dashboard stale | `js/app.js` re-renders read-only views (dashboard, progress, parent) on `storage` events | robustness.mjs |
| m4 refresh mid-test was silent | `js/views/test.js` sessionStorage flag → "Your last test was interrupted … not scored" | robustness.mjs |
| m5 skills table cramped at 375px | `.table-stack` stacks rows into labelled blocks under 600px | screenshot `375-progress.jpg` |
| m6 "1 skills mastered" | singular/plural labels in `js/views/progress.js` | acceptance.mjs / robustness.mjs (assertions corrected — they had encoded the old wording) |

Final run (HEAD after fixes): unit 77/77 · smoke 449/0 · acceptance 351/0 · a11y 1631/0 · robustness 66/0.
