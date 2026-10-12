# MARKET MINDS — CLAUDE MASTER BUILD PROMPT

Repository: https://github.com/bazeocrisy/Market-Minds.git
Brand: MARKET MINDS
Tagline: Learn Money. Understand Markets. Think Bigger.
Audience: Black children in grades 3–8; welcoming to all learners.

## Mission
Build a *working* educational app about money, markets, futures, mathematics and responsible decisions. Act as lead engineer and coordinate specialist agents. Inspect the existing repository, README, styling, GitHub Pages, and `docs/BUILD-RAILS.md` first. Do not assume features exist without checking them. Do not restore the removed “A Baze Learning Lab Experience” wording or Baze Learning Lab branding.

## APPROVED VISUAL STYLE — DO NOT REDESIGN
Modern Learning Academy: navy #102541, teal #168D86, gold #F0BF55 and cream #F7F8F5. Clean, elegant, spacious UI; not childish, neon, or cluttered. Polished semi-realistic illustrations show diverse Black kids, families and professionals in meaningful everyday scenes, without stereotypes. Diagrams and charts should be real HTML/CSS/SVG. Photos only when educationally useful. All lesson text and buttons must be genuine UI, never baked into pictures. Design reference images, when made available, are visual inspiration only—not screens to paste into the app. Do not invent illustrations, rely on random stock photos, or cut characters from mockups. Use explicitly named placeholders and provide an art-request manifest until approved images are provided.

**Artwork requested (not yet committed to this repository):** `assets/visual-references/visual-style-guide.png` and `assets/visual-references/screen-layout-reference.png`. Ask for these if they are needed before implementing final illustrations.

## APPROVED HOME — LEARNING DASHBOARD
Header: Market Minds logo, accessible navigation, grade selector (3–5 / 6–8).
Hero: Welcome Market Explorer, current World and Lesson, truthful progress, primary Start/Continue Learning CTA.
Below: six *functional* cards: Learn, Practice, Thinking Lab, Market Lab, Test, My Progress.
Responsive and uncluttered; phones, tablets and desktops. Students should not be required to create accounts or provide names/birthdates. Local, anonymous progress only. Respect keyboard and screen reader access; support reduced motion. GitHub Pages runs from /Market-Minds/, so avoid absolute root asset links.

## SIX WORLD CURRICULUM
1. Money & Markets: What is a market? Buyers/sellers, prices, supply/demand.
2. The Future Price: farmer and baker, planning ahead, future price agreements, hedging, futures introduction.
3. What People Trade: wheat, gold, oil, stock-index contracts and futures vs stocks.
4. Reading Markets: price/time charts, candlesticks, long vs short.
5. Market Math: price changes, decimals, percentages, ticks, contract units, leverage, margin and risk, age appropriate.
6. Decisions & Discipline: uncertainty, planning, patience, losses and reflective reasoning.

The original 15-page `Futures_Made_Simple_with_Baze.pdf` was an AI-assisted document supplied by the user's cousin. If supplied, use it as a topic starter only; its trading-system claims and personal promotions are not the curriculum. Verify financial definitions and contract specifications against credible authoritative sources. Do not teach the cousin's proprietary RSI signal method in the core curriculum.

## LESSON STANDARD
Each lesson: familiar illustrated story → plain-language definition → interactive example → guided work with hints → *independent* Practice → Thinking Lab (explain reasoning) → Test → Practice My Misses. Present one task at a time. Two age bands must differ in vocabulary complexity and math while keeping shared fundamentals and prerequisites.

**Read to Me:** voluntary browser speechSynthesis with play/pause/replay/stop if supported, graceful fallback if not. No autoplay. Allow independent reading. Highlight/define tappable vocabulary; accessible word descriptions, examples and optional pronunciation.

**Practice is first-class, NOT the same as Test:** plentiful varied items, hints, retries, specific coaching and misconception feedback, fresh questions, and a separate Practice My Misses queue. Never auto-advance after an error. Track hinted/coached work separately from unassisted success. Tests provide no hints or correct answers until submission. Calculate mastery from independent correct performance, not time spent or screen views.

**Market Lab:** invented prices and paper-only learning; no broker, account, money, live prices, real orders or gambling-style gamification. Show gains *and* losses, explain uncertainty and include choosing to wait. Reward good explanations and risk awareness, not pretend profit.

## BUILD PHASES — TONIGHT
**Phase 0: Audit** existing repository, identify working code, choose architecture, baseline tests. Preserve current website.
**Phase 1: App shell**: responsive modern dashboard, grade selection, six working navigable modes, lesson framework and route behavior.
**Phase 2: Curriculum vertical slice**: World 1 minimum three completed lessons; World 2 one introductory futures lesson. Every completed lesson must contain story, visual, definitions, interactive examples, coached and independent practice, reasoning, glossary and assessment. Include Read to Me.
**Phase 3: Learning engine**: Practice, missed question review, Test, Thinking Lab, progress, grade adaptation, and modest fictional Market Lab. Build real varied question banks, not one repeated example.
**Phase 4: QA**: automated tests for state, scoring, misconception feedback, no-hint Test, question variation, storage, navigation, accessibility and fallback; visual audits 375px, 768px, desktop; mobile touch, keyboard, 404s, links. Fix defects.
**Phase 5: PR & handoff**: detailed changed-file list, screenshots if possible, pass/fail tests, transparent feature matrix, asset manifest, next backlog. Do NOT merge or deploy without explicit user permission. Do not claim Worlds 3–6 are implemented if unfinished.

## AGENTS
- Curriculum agent: developmental progression, lesson content, definitions, sources, age adaptation.
- Learning engine agent: generators, hints, misconception feedback, independent mastery, tests.
- UI/accessibility agent: responsive actual screens, audio fallback, keyboard/mobile, approved brand, image manifest.
- QA/security agent: test suites, GitHub Pages path support, local-only anonymous data, regressions.
Lead engineer owns integration and quality. Allocate file ownership so agents don't overwrite one another.

## ACCEPTANCE CHECK
From a fresh browser a grade 3–5 learner can select level, begin World 1 Lesson 1, listen on a supported browser, read a definition, interact with a visual, get hints on practice errors, complete independent work, take a distinct test, review misses and revisit saved local progress. All visible buttons work; no fake progress, fake assets or false promises of investment gains. Content is accurate and age appropriate.

Start with the repository audit and phased plan, then build on a separate development branch and prepare a PR for review.
