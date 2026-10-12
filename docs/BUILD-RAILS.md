# Market Minds — Claude build rails

## Purpose
Deliver an age-appropriate financial literacy app for grades 3–8. The uploaded cousin-created 15-page *Futures Made Simple with Baze* PDF is a **reference source**, not a complete, verified curriculum and not an endorsement of any trading group or system. Use its broad topics (futures, commodities, charts, ticks, margin, risk), but do not copy its branding or personal claims. Independently check financial definitions with authoritative sources before lessons ship.

## Non-negotiable UX
- Mobile-first; accessible keyboard and screen-reader controls; responsive on phone, tablet, desktop.
- Respect current brand palette, logo, typography, and brand wording.
- Learn, Practice, Thinking Lab, Market Lab, Test, Progress as separate modes.
- Two pathways: grades 3–5 and grades 6–8. Allow learners to choose a grade without collecting names or birthdays.
- Practice: varied question bank, hints, coached feedback, retries, Practice My Misses. Test: no hints until submission. Store only local, non-identifying progress.
- Every lesson: familiar story → plain-language concept → visual example → coached practice → independent practice → reasoning → assessment → review.
- Use Black children and communities in warm, varied, respectful illustrations without stereotypes; welcoming to all learners.
- No gambling-like engagement, leaderboards by earnings, simulated profit incentives, real trading execution, brokerage integrations, financial solicitations, or live market accounts.
- Always show uncertainty and downside risk alongside any upside; margin is not a maximum loss.

## Six curriculum worlds
1. Money & Markets — prices, buyers/sellers, supply/demand.
2. The Future Price — farmers, bakers, price agreements, hedging and futures.
3. What Do People Trade? — farm products, metals, energy, stock indexes.
4. Read the Market — lines, candles, long/short and interpretation.
5. The Math of Trading — price differences, ticks, unit sizes, gains/losses, leverage.
6. Decisions & Discipline — uncertainty, stops, decisions, risk and reflection.

## First vertical slice
Build World 1 with at least three complete lessons, each including definitions, visual, coached practice, independent quiz and mastery tracking; then build World 2 introductory futures lesson. Avoid placeholder buttons that appear functional. Make Practice a first-class mode. Test on mobile widths, keyboard, back/forward navigation, and storage reset. Write tests for scoring, hint handling, question variation, progress saving and practice-my-misses.

## Engineering
Use existing simple static site as foundation; preserve working page while adding modular JS and content data. Keep curriculum separate from question generators and UI. No dependencies unless justified. Use relative asset URLs compatible with GitHub Pages project path `/Market-Minds/`. Work on a feature branch and submit PR with screenshots and test report rather than pushing unreviewed changes to main.
