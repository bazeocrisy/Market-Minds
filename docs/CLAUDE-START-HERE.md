# Claude Handoff — Start Here

1. Read [CLAUDE-MASTER-PROMPT.md](./CLAUDE-MASTER-PROMPT.md).
2. Read [BUILD-RAILS.md](./BUILD-RAILS.md).
3. Inspect the actual repo and report a Phase 0 audit before editing code.
4. Work in a feature branch; commit and open a PR, do not merge or publish without approval.

## Approved Design
- Product: **MARKET MINDS**
- Tagline: **Learn Money. Understand Markets. Think Bigger.**
- Style: **Modern Learning Academy** (clean, elegant, not exaggerated cartoon styling)
- Homepage: **Learning Dashboard** with a Start/Continue Learning feature plus six cards
- Learning: two grade groups; Read to Me; separate Practice, Thinking Lab, Market Lab, Test, Progress
- Images: polished semi-realistic Black children and families; show real-life markets and learning environments
- Remove all visible “Baze Learning Lab” attribution.

## Two reference images waiting to be added
The approved source images are in the original ChatGPT starter ZIP, but **have not been uploaded to GitHub**:
- `assets/visual-references/visual-style-guide.png`
- `assets/visual-references/screen-layout-reference.png`

Do not treat missing images as implemented or substitute arbitrary artwork. The user can add the two PNG files later; build layout with named placeholders meanwhile. Those screenshots are **not** themselves the individual story illustrations. Create an asset manifest requesting each dedicated illustration.

## First release target
Working responsive dashboard, World 1 three complete lessons, World 2 futures introduction, fully functional Learn and Practice (coaching, hints, varied questions, Practice My Misses), Thinking Lab, Test, local progress and Read to Me. Modest pretend-price Market Lab. Remaining worlds flagged in development.

## Local QA
Use responsive checks at 375px, 768px, 1440px; keyboard operation; screen reader labels; no dead controls or 404s. Include automated tests for scoring, hint vs test separation, independent mastery, question banks, and saving progress. All financial values used in learning exercises must be clear about being hypothetical.
