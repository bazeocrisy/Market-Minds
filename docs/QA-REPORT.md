# Market Minds — QA & Accessibility Report (round 2: app-first shell, PWA, Batch 2)

Agent 5 (QA & Accessibility). Branch `feature/market-minds-v1` @ 4495a87. Date 2026-10-12.
Environment: Windows 11, Node 26.5, headless Chrome via CDP (`tests/lib/harness.mjs`), static server under `/Market-Minds/` like GitHub Pages. Suites run one at a time. No app code was changed for this report.

## 1. What was run

| Command | Result |
|---|---|
| `npm test` (unit) | **95 passed, 0 failed** |
| `node tests/browser/smoke.mjs` (Lead's) | **673 passed, 0 failed** |
| `node tests/browser/app-shell.mjs` (new) | **254 passed, 11 failed** (M1 ×6, M2 ×2, m1, m2 ×2) |
| `node tests/browser/pwa.mjs` (new) | **66 passed, 1 failed** (m3) |
| `node tests/browser/acceptance.mjs` | **459 passed, 2 failed** (M3 ×2) |
| `node tests/browser/a11y.mjs` | **3031 passed, 118 failed** (all M2: 768px overflow, 59 routes × 2 bands) |
| `node tests/browser/robustness.mjs` | **71 passed, 0 failed** (standalone run) |
| `npm run test:browser` (`run-all.mjs`, now 6 suites, sequential) | smoke, app-shell, pwa, acceptance and a11y completed with the counts above. **The run was stopped by Claude Code’s low-memory reaper during `robustness.mjs`** (12 GB PC). It was not restarted; robustness passed 71/0 when run alone, and nothing it tests changed afterwards. Expected exit: 1, because of the defects below |

Every failing check is a real app defect (section 2). No check was weakened to make it pass. The checks I corrected were the ones that encoded the old website shell, such as the "Menu" name, `#siteNav` primary links, `.site-footer` and "of 8 skills". Each now asserts the new requirement instead.

### Suite changes
- **`qa-lib.mjs`**: added two helpers.
  - `seed(b, url, state)` loads the app with an exact stored state; `null` means a brand-new learner.
  - `navTo(b, href)` navigates the way a student does: it taps a visible `.app-tabs a[data-nav]` tab, or else opens More (`#menuToggle`) and taps the `#siteNav` link. It reports which route it took.
- **`app-shell.mjs`** (new):
  - first launch at 375 and 1280;
  - deep links on first launch (3 routes × 2 widths);
  - return visits (no welcome, observed through a `data-route` recorder);
  - bottom tab bar at 375 and 390, with "content clear of the tab bar" checked on 11 routes, scrolled to the bottom;
  - top nav at 768 and 1280;
  - More sheet at 375 and 1280: name, open/close, focus in, Esc and focus return, outside tap, link closes, fits on screen, About & safety wording;
  - `.view-enter` transition and its duration, and its absence under reduced motion;
  - back/forward between tabs;
  - the app-bar grade switch;
  - no footer, promotional text or external links on 13 screens.
- **`pwa.mjs`** (new):
  - manifest link, fetch, MIME type and fields;
  - icons decoded in the browser and checked against PNG headers; apple-touch-icon;
  - `Page.getInstallabilityErrors` and `Page.getAppManifest`;
  - SW registration, `activated` state, scope, control, and the `mm-<version>` precache contents;
  - offline, two ways: Chrome emulation, and the suite's own server dropping every connection;
  - network-first online;
  - a simulated version update;
  - progress persistence.
- **`acceptance.mjs`**:
  - the walk-through now starts at onboarding and uses tab/More navigation;
  - new section 9 covers Batch 2 (Grades 6–8): w4l2 end-to-end, `candlestick-reading` practice (hint, then a correct first try), the World 2 test with a deliberate score, Market Lab Pattern Trap with Long or Short and the Line/Candles toggle, and Certificates (empty and earned).
- **`a11y.mjs`**:
  - 63 routes (was 31), including welcome, certificates, w2l2–w2l4, w4l1–w4l4, world-2/4 tests, new Thinking Lab prompts and the Pattern Trap scenario;
  - accepts Chrome's newer AX role `image` alongside `img`. Without this, unnamed images would have gone unchecked;
  - tap targets include `.app-tabs a` and `.welcome-grade`;
  - new contrast spots: tabs, the More sheet, About & safety, and certificate chips. The onboarding screen is checked worst-case over its navy and gradient tints;
  - new keyboard checks: desktop order is brand → grades → More → 7 tabs, and closed sheet links are out of the tab order. On phones: More is named "More", focus moves into the sheet, all 5 bottom tabs are reachable by Tab with a visible outline, and onboarding works by keyboard;
  - reduced motion now covers the new screens and the screen transition.
- **`robustness.mjs`**:
  - corrupt, unknown-version and blocked storage, and reset, now land on onboarding;
  - `aria-current` is read from `.app-tabs`;
  - new checks: a refresh on onboarding, and the remembered first-launch destination surviving a refresh;
  - the path-safety crawl now includes welcome, certificates and w2/w4 lessons.
- **`run-all.mjs`**: runs smoke, app-shell, pwa, acceptance, a11y and robustness, in that order.

## 2. Defects

### Critical
None found.

### Major

**M1. A deep link on first launch is lost: after choosing a grade the learner always lands on the dashboard.**
- Routes: any deep link opened before a grade is chosen, for example `#/practice`, `#/learn/w1l2/3` or `#/market-lab?activity=paper`. Tested at 375 and 1280, with both bands.
- Steps: with storage cleared, open `…/Market-Minds/#/learn/w1l2/3`. Onboarding appears (correct) and the destination is saved in `sessionStorage['mm.afterWelcome']` (correct). Then tap Grades 6–8.
- Expected (ARCHITECTURE "App-first" #1; task brief): the app continues to `#/learn/w1l2/3`.
- Actual: the app lands on `#/`. The recorded `data-route` sequence is `welcome → dashboard → dashboard`.
- Cause, confirmed by reading the code against the observed sequence. Two click handlers both navigate:
  1. `js/views/welcome.js` `choose()` is the button's own listener, so it runs first and schedules `setTimeout(() => ctx.go('#/'), 0)`.
  2. Then `js/app.js`'s document listener calls `go(next)` with the saved deep link.
  3. The timer fires before the `hashchange` task. It overwrites the hash with `#/`, and both `hashchange` events then render the dashboard.
- Suggested fix: remove the navigation from `welcome.js` (app.js already does it), or make `choose()` navigate only if `location.hash` is still `#/welcome`.
- Evidence: 6 checks in `app-shell.mjs` ("deep link … continues to the intended route").

**M2. At exactly 768px wide (tablet portrait, for example an iPad mini), every screen scrolls sideways and the Progress tab is cut off.**
- Routes: all 59 non-onboarding routes, both bands, at 768×1024. Widths of 800 and above are fine (probed at 800, 820, 900 and 1024).
- Steps: open any route at 768px.
- Expected: no horizontal overflow; all 7 top-nav tabs on screen.
- Actual: `scrollWidth` is 798. The last tab's right edge is at 798px. The 7 tabs are 96 + 92 + 110 + 146 + 134 + 81 + 115 px plus gaps and padding, and the row does not shrink (`.app-tabs li { flex: 0 0 auto }`).
- Suspected file: `styles.css` `@media (min-width: 768px)` `.app-tabs` rules. Options: allow the row to shrink or scroll inside itself, tighten padding between 768 and about 900px, or move the phone/tab breakpoint to about 820px.
- Evidence: 118 a11y checks ("768 … no horizontal overflow :: 798") and 2 app-shell checks ("top nav 768: every tab fully on screen / no horizontal page scroll"). Smoke cannot see this because it only uses 375 and 1280.

**M3. The candlestick legend swatches render as huge shapes on every candle chart, so the legend dominates the chart.**
- Routes: `#/learn/w4l2/3` (lesson visual), `#/learn/w4l2/5` (check), Market Lab Candles view (any scenario after Day 1), and any other `kind: 'candles'` visual.
- Steps: open the step and look below the chart.
- Expected: two 20px icons (hollow ▲ / filled ▼) beside short legend text.
- Actual: each swatch stretches to the full width available. The largest swatch measured 291px (lesson) and 325px (Market Lab) in the 375px acceptance run. The legend text is squeezed into a column one word wide.
- Screenshots: `375-lesson-candles.jpg`, `1440-lesson-candles.jpg`, `375-market-lab-candles.jpg`, `1440-market-lab-candles.jpg`.
- Cause: `styles.css:685` `.visual svg { display:block; width:100%; height:auto }` has specificity 0,1,1. It beats `.mm-visual__swatch { width:20px; height:20px }` at `styles.css:726`, which has specificity 0,1,0.
- Suggested fix: `.visual svg.mm-visual__swatch { width:20px; height:20px; display:inline-block }` (or scope the 100% rule to `.mm-visual__svg`).
- Why Major: World 4 is about reading candles, and the chart is the lesson's core visual. The information is still correct and the data table is still there.
- Evidence: 2 acceptance checks ("candle legend swatches are small icons (≤ 24px)"), added after the visual review.

### Minor

**m1. Back from the dashboard after onboarding shows the onboarding screen again.**
- Steps: first launch → choose a grade → dashboard → browser Back (or the Android back button in the installed app).
- Expected: leave the app, or stay on the dashboard. Onboarding is a one-time gate.
- Actual: `#/welcome` renders again, because the welcome entry is still in history. Choosing again just returns to the dashboard. No data is lost.
- Suspected files: `js/app.js` (onboarding completion uses `location.hash =`, which pushes an entry; use `location.replace`) and/or `route()` (send `#/welcome` to `#/` when a grade is already saved).
- Evidence: app-shell "Back from dashboard after onboarding…".

**m2. At 768px and wider, opening More does not move focus into the sheet.**
- Route: any route at ≥768px. Steps: Tab to More and press Enter, or tap it.
- Expected: focus moves to the first sheet link, as it does on phones.
- Actual: focus stays on the More button. Tab still reaches the sheet next, and Esc works.
- Cause: `js/ui/dom.js` focuses `s.querySelector('a[href]')`. That is the first link in the Labs group (Thinking Lab), which is `display:none` at ≥768px (`.more-labs`), so `focus()` silently does nothing.
- Suggested fix: focus the first visible link.
- Evidence: app-shell "More 1280: focus moves inside the sheet", "…Enter opens and focus goes inside".

**m3. Offline: a never-precached page in a sub-folder renders an empty app shell.**
- Steps: offline, with the SW active, navigate to `/Market-Minds/docs/never-cached.html`.
- Actual: the SW returns the cached `index.html` for any navigation. That page's relative `./js/app.js` then resolves to `/Market-Minds/docs/js/app.js`, which is not cached and gets a 503. The result is the app bar and More sheet with an empty main area, no h1 and no message.
- Expected: the plain offline message.
- Real impact is low, since no app link points there.
- Suggested fix in `sw.js`: serve the shell only for navigations inside the scope root (the path is the scope, or `index.html`), and return the plain 503 message otherwise.
- Evidence: pwa "offline: a never-precached page in a sub-folder shows something readable".

**m4. Documentation mismatch.** ARCHITECTURE "App-first" #5 lists the phone tabs as "Home, Learn, Practice, Labs, Progress". The build has Home, Learn, Practice, **Test**, Progress, with Labs in More → Labs. Test is checked as built. Pick one and update the other.

**m5. Cosmetic: the certificate seal's "SKILL SHOWN" text overlaps the seal's edge** (`375-certificate-earned.jpg`, `1440-certificate-earned.jpg`). `seal()` in `js/views/certificates.js` draws the text at y=80, close to the r=46 circle.

**Note (not a defect).** Chrome includes CSS `text-transform: uppercase` in computed accessible names, so the onboarding group is exposed as "CHOOSE YOUR GRADE LEVEL". Some screen readers may spell out all-caps words. It is harmless, but `aria-label="Choose your grade level"` on the group would avoid it.

## 3. Installability and offline: exactly what was observed

| Check | Observed |
|---|---|
| `<link rel="manifest" href="./manifest.webmanifest">` | present; fetch 200, `application/manifest+json`, valid JSON |
| Fields | `display: standalone`, `start_url: ./`, `scope: ./`, `id: ./`, `theme_color` = `<meta name=theme-color>` (#102541), background `#F7F8F5` |
| Icons | `icon-192.png` 192×192, `icon-512.png` 512×512, `icon-maskable-512.png` 512×512 (`purpose: maskable`). All loaded in the browser with matching `naturalWidth`/`naturalHeight` and PNG headers. `apple-touch-icon.png` 180×180 |
| `Page.getInstallabilityErrors` | `{"installabilityErrors":[]}`. No errors, in headless Chrome, over `http://127.0.0.1` (a secure context). It did not differ in headless here, but a real install prompt was not shown (see section 5) |
| `Page.getAppManifest` | url `…/Market-Minds/manifest.webmanifest`, `errors: []` |
| Service worker | registered from `./sw.js`, reached `activated`, scope `http://127.0.0.1:<port>/Market-Minds/`. The page was controlled without a reload (`clients.claim`) |
| Cache | exactly one `mm-ef59bdf05e60` holding all 60 PRECACHE entries, all same-origin |
| Offline via `Network.emulateNetworkConditions {offline:true}` + `Network.setCacheDisabled` | Dashboard rendered. The test server received **0** requests while emulated offline, so in this Chrome build the page-target emulation also blocked the SW's own fetches |
| Offline via a real network failure (the test server destroys every socket) | Requests were attempted and refused. After a reload the app shell, the 5 tabs and the dashboard rendered, and saved progress was intact. Also offline: `#/learn/w1l1/1` opened; `#/learn/w4l2/3` opened with its candle chart; Practice → Mixed Review generated a question; a correct answer was checked and saved to `localStorage` (+1 independent attempt) |
| Never-precached file (`fetch('./README.md')`) offline | `503`, `text/plain; charset=utf-8`, "Offline and not saved yet. Reconnect to load this part of Market Minds." No JS errors |
| Never-precached navigation in the app folder (`/Market-Minds/README.md`) offline | the cached shell, which showed the dashboard ("Dashboard \| Market Minds") |
| Never-precached navigation in a sub-folder offline | empty shell (m3) |
| Network-first online | a changed `index.html` was served on the next load with the same SW version (no stale copy) |
| Update (the test server served `sw.js` with `CACHE_VERSION = 'qa0update0v2'` plus a marked `index.html`; `registration.update()`) | The new worker activated without waiting, and `controllerchange` fired. Afterwards the caches were `mm-qa0update0v2` and `qa-unrelated` only: the old `mm-ef59bdf05e60` and an extra stale `mm-qa-stale-old` were deleted, and the non-Market-Minds cache was kept. The new cache held every PRECACHE entry. The new `index.html` was served online, and **offline after the update the new version was served, not the old one**. `localStorage` progress was byte-identical before and after the update and offline |

## 4. What passed (highlights)

**App shell**
- First launch at 375 and 1280:
  - opens `#/welcome` with a single focused h1 "Welcome to Market Minds" and title "Welcome | Market Minds";
  - no app bar, tabs or More button;
  - two grade buttons, at least 44px, named "Grades 3–5 …" / "Grades 6–8 …";
  - no inputs (nothing personal is asked);
  - fills the screen with no overflow.
- Choosing a grade by tap, Enter or Space saves it and opens the dashboard with focus on the h1.
- A returning student goes straight to the dashboard: `welcome` never appears in the `data-route` log. Deep links and refresh open directly.
- Phone tab bar at 375 and 390:
  - fixed and pinned to the bottom;
  - exactly Home, Learn, Practice, Test, Progress;
  - each tab at least 44×44 (about 75×56), named, under a "Main" nav landmark;
  - `aria-current` follows every tap, and no tab is current on More pages (the More link is current instead);
  - on 11 routes scrolled to the bottom, the last content ends above the bar and no control is hidden behind it.
- Top nav at 1280: 7 tabs in one row, at least 44px; no body padding for a tab bar; the Labs group is hidden in More.
- More sheet:
  - named "More", with `aria-controls="siteNav"`;
  - opens by tap and by Enter; Esc closes it and returns focus; an outside tap closes it; choosing a link closes it and focuses the new h1;
  - links are at least 44px;
  - it fits on screen, and on phones it sits above the tab bar;
  - About & safety includes "Futures involve substantial risk, including losses larger than the margin deposit, and are not suitable for children to trade."
- Transitions: `.view-enter` runs `mm-view-enter` for 0.18 s and the class is removed afterwards. Under `prefers-reduced-motion: reduce` the animation is `none` and nothing runs.
- Back/forward between tabs keeps `aria-current` in step and focuses the h1.
- The grade switch works in place on phones.
- None of the 13 screens has a footer element, "Our purpose", pricing or other promotional text, or external links. The Market Lab "Pretend prices only" banner is kept.

**Batch 2 (acceptance, Grades 6–8, real taps at 375)**
- w4l2 "Candlesticks: Open, High, Low, Close", end to end:
  - warm-up offered, then skipped;
  - Read to Me present; art alt text present;
  - definition term "candlestick";
  - the 3-candle chart's accessible name (role `image`) says "2 up, 1 down", with a legend and a data table;
  - Try Together: a wrong answer is coached without advancing, and all 3 items are answered right;
  - Check Understanding: hint, then a misconception message for the wrong answer, then correct;
  - lesson complete; skill introduced with no mastery evidence; step 6 links to practice.
- `#/practice?skill=candlestick-reading` preselects the skill and World 4. Q1 (hint, then correct) and Q2 (correct first try) are both analyst-band candlestick items. Store evidence is exactly 1/1 independent and 1/1 assisted, 0 revealed.
- `#/test/world-2`:
  - every item uses World 2 skills, including the lesson 2–4 skills;
  - each rendered prompt matches its generated item;
  - 3 answered right on purpose gives a score of exactly "3 of N"; saved with `scope: 'world-2'`; every result has a "Why".
- Market Lab Pattern Trap:
  - Long or Short shows long +$0.10 (gain) and short −$0.10 (loss);
  - the Line → Candles toggle by Arrow key keeps focus on the toggle and draws 2 candles; its name mentions up/down; the group is named "Chart";
  - tapping back to Line redraws the line chart;
  - at the end, the "Pattern Trap." reflection and the reflection questions appear.
- Certificates:
  - With an empty store: "0 of N" earned, "No certificates earned yet", and every card lists what is still needed. `#/certificates/world-1` says "Not earned yet … can’t be printed", with no certificate and no Print button.
  - **Earned:** World 1 lessons completed were *written to the store*. All 5 World 1 skills were then mastered through *real independent answers* in Practice (5 correct first tries each, through the UI), and the engine confirms `mastered` for all 5.
  - The World 1 certificate and its 5 Skill Badges then show as earned, and other worlds do not.
  - The print view has "Name:" and an empty line, AX-named "blank line to write your name by hand". No name key is stored. It lists World 1 and its 5 skills and has a Print button. Under print media, the app bar, tabs and buttons are hidden and the certificate is shown.
- Previous coverage is kept: onboarding → W1L1 → Practice → Misses → Test → Market Lab → reload/Continue → My Progress → Grades 6–8. These all pass as before.

**Accessibility (63 routes × 375/768/1440 × 2 bands)**
- No horizontal overflow except M2.
- Every interactive element and image is named in the Chrome AX tree. Labels are present. One focused h1 per view.
- AA contrast on every computed text node. Onboarding text is at least 5.18:1 worst case. Top-nav tab inactive 9.33:1, current 15.4:1. Bottom tab (375) inactive 5.76:1, current 15.4:1. More sheet link 9.33:1. About & safety 8.75:1.
- 144 internal links resolve; none is external.
- Keyboard order and visible focus are correct. Reduced motion is respected on 11 screens, including the transition. The no-speech fallback works.

**Robustness**
- Corrupt, malformed, unknown-version and blocked storage are all handled, with onboarding shown where no grade survives.
- Refresh on onboarding keeps it, and the remembered destination survives the refresh. Back/forward and `aria-current` work. The two-tab update and no-clobber checks pass. Refresh during practice or test is honest.
- All fetched URLs (including `sw.js`, the manifest and icons) are under `/Market-Minds/` with exact letter case.
- Reset goes to onboarding and survives a reload.

## 5. NOT tested — manual only
- **Real install prompt / Add to Home Screen:**
  - Android Chrome: the install banner, the standalone window, splash and theme colour, and the maskable icon crop in the launcher.
  - iOS Safari: Share → Add to Home Screen, the apple-touch-icon, `apple-mobile-web-app-*` behaviour, and the status bar.
  - Desktop install. CDP only reported "no installability errors".
- **Real offline on devices:** airplane mode, the installed app cold-starting offline, iOS's storage eviction of SW caches (about 7 days unused), and update timing when a phone resumes.
- **Real devices:** safe-area insets and the notch with the bottom tab bar, the on-screen keyboard covering inputs above the tab bar, real touch, and older Safari `<dialog>` support. Touch was emulated, and only Chromium ran.
- **Screen readers:** NVDA, JAWS, VoiceOver and TalkBack, including the tab bar landmark, the More sheet announcement, candle `title` elements and reading order. Names come from Chrome's AX tree only.
- **Real voices:** all Read-to-Me checks used a stub.
- **Zoom/text resize to 200%** and forced colours / Windows High Contrast. In particular: do the bottom tab labels and the 768–800px top nav survive larger text?
- **Content accuracy** of the World 2 and World 4 finance content (curriculum review).

## 6. Suggested fix order
1. M1: one line in `welcome.js`. Re-run `app-shell.mjs`.
2. M3: CSS specificity for `.mm-visual__swatch`. Re-run `acceptance.mjs` and look at the candle screenshots.
3. M2: the 768px top nav. Re-run `a11y.mjs` and `app-shell.mjs`.
4. m1–m5.

After that, `npm run test:browser` should be fully green.

---

## Round 2 fix verification (Lead)

| Defect | Fix | Verified by |
|---|---|---|
| M1 deep link lost after onboarding | `welcome.js` no longer navigates; `app.js` continues to the saved destination (and a plain launch clears any older one) | app-shell.mjs, robustness.mjs |
| M2 768px top nav overflow | tabs may shrink (`flex: 0 1 auto`) + tighter spacing at 768–1023px | a11y.mjs (0 overflow at 768), screenshot at 768 |
| M3 huge candle legend swatches | `.visual svg.mm-visual__swatch` keeps 20px | acceptance.mjs swatch checks, screenshot |
| m1 Back returned to onboarding | onboarding exit uses `location.replace` | app-shell.mjs (history reset to the onboarding entry, then Back stays on the dashboard) |
| m2 More sheet focus at ≥768px | focus first *visible* link | app-shell.mjs |
| m3 empty shell for non-app pages offline | `sw.js` serves the cached shell only for the app's start page; other pages get the plain offline message | pwa.mjs (assertion updated to the corrected behaviour) |
| m4 ARCHITECTURE tab list | doc now says Home, Learn, Practice, Test, Progress | — |
| m5 seal text overlap | caption resized inside the inner ring | visual check |

Test corrections (Lead): app-shell "Back after onboarding" now starts from a genuine single-entry history (the old setup left an extra `#/welcome` entry from `seed()`'s double load); pwa offline-navigation check updated to expect the honest offline message (the m3 decision).

Final run, one suite at a time (the combined `run-all` was stopped once by the low-memory reaper, so suites were run individually): unit 95/0 · smoke 673/0 · app-shell 267/0 · pwa 67/0 · acceptance 461/0 · a11y 3149/0 · robustness 71/0.

Known minor (open): on a candle whose low sits at the chart's bottom gridline, the ▼ marker can overlap the day label (seen in w4l2 step 3, "Wed").


---

## Round 3 — PWA completion (Lead, 2026-10-12)

Gaps found by reviewing the PWA after round 2, and fixed:

| Gap | Fix |
|---|---|
| **Mixed versions after an update (real defect):** views are lazy-loaded with network-first, so a version published mid-session could pair new view modules with the old `app.js` | `app.js` preloads all view modules after the first render → one consistent version per session |
| No update notice; update checks only on page load | status strip "A new version … is ready" + **Refresh now**; auto-applies at the next Home navigation; checks on foreground + every 30 min |
| No offline indicator | status strip: offline, "progress still saves" |
| No install affordance | More → Get the app: Install button (deferred `beforeinstallprompt`), iOS instructions, installed note; manifest shortcuts |
| Progress could be evicted on a full device | installed app requests persistent storage |
| Dashboard "What Is a Market?." double punctuation | fixed |

Found only by running in a browser: the first version of the change threw `ReferenceError: Cannot access 'pwa' before initialization` on every load (the first `route()` ran before the declaration). Unit tests could not see it; `pwa-lifecycle.mjs` caught it; fixed.

New suite `tests/browser/pwa-lifecycle.mjs` (own static server that can "publish" a new version): first launch → onboarding → grade persists across reload; offline notice on/off; publish new `sw.js` + changed view mid-session → update notice, new cache created and old `mm-` caches deleted, running session still shows its original version (no mixing), practice not interrupted, Home reloads into the new version, progress + grade kept; real connection drop afterwards → the NEW version opens from cache, saved lesson step opens; Chrome fires a real `beforeinstallprompt` (installable) → Install button → `prompt()` called → installed note; iPhone UA (with Chrome's prompt suppressed, as Safari never fires one) → Add to Home Screen instructions.

**Results (each suite run on its own, headless Chrome):** unit 95/0 · smoke 673/0 · app-shell 267/0 · pwa 67/0 · pwa-lifecycle 25/0 · acceptance 471/0 · a11y 3149/0 · robustness 71/0.
**Headless Microsoft Edge:** app-shell 267/0 · pwa 67/0 · pwa-lifecycle 25/0.

Still manual-only: the native install dialog itself, iOS Safari (WebKit is not available on this PC), real devices, screen readers, real speech voices.
