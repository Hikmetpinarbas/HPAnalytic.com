# HPAnalytic — visual & frontend UX acceptance, 2026-10-14

Base: `qa/integration-20261014` @ `6cb5ee7` (PR #30 head). Scope: presentation only.
Not touched: middleware, API routes, publishing/admission logic, editorial source, brand marks.

## Method
Astro production build served by `astro preview` (Cloudflare workerd), Chromium (Playwright 1.56).
Routes: `/`, `/articles/event-only-boundary/`, `/analysis/`, `/archive/`, `/search?q=veri`, `/search`, `/about/`, 404.
Widths: 320, 375, 430, 1440. 200% root text on `/` and the article at 375. Reduced motion emulated.
Per page: horizontal overflow, elements past the viewport, targets < 24px, text < 12px, console errors.

## Fixed (confirmed in screenshots before → after)
| # | Defect | Where | Fix |
|---|---|---|---|
| 1 | Primary CTA "ANALİZLERİ KEŞFET" and discovery tile led to an empty `/analysis` page (no message). Contradicts Design Contract §3 "EMPTY SURFACE = HIDDEN SURFACE". | `/` | CTA and tile render only when an analysis article is published; featured story becomes the primary action. Returns automatically when an analysis is admitted. |
| 2 | `/analysis` rendered a heading and nothing else when empty. | `/analysis` | Reader-facing empty state linking to the archive; `noindex` while empty. |
| 3 | Scouting empty state printed the internal rule "Boş yüzey navigasyonda gösterilmez". | `/scouting` | Reader copy. |
| 4 | Turkish diacritics collided across lines (Ç cedilla into Ö dots) in the hero and evidence-bridge headings (line-height .84/.88). | `/` all widths | line-height .96 / 1.0; tracking −.025em. |
| 5 | Schematic disclaimer had no style: large body text outside the panel padding. | `/` hero pitch | Caption style inside the panel, muted, 13px. |
| 6 | Pitch caption clipped "MEKANİZMA?" at 200% text. | `/` 375 @200% | Caption cells wrap at ≤700px. |
| 7 | Article meta line glued to the standfirst; share button centred under a left-aligned header with an orphan rule. | articles | Meta spacing; share block aligned to the header column. |
| 8 | Discovery tiles used an off-palette navy (#10151b). | `/` | Warm brand surface. |
| 9 | New empty-state link not distinguishable from text (WCAG 1.4.1). | `/analysis` | Gold + underline. |

## Checks
- `npm test`: 270 pass, 0 fail (4 new contract tests in `tests/release-visual-pass.test.mjs`).
- `astro check`: 0 errors, 0 warnings. `npm run build`: complete.
- `scripts/release-browser-qa.mjs` against the build: `BROWSER_QA_PASS`.
- Own audit: 0 overflow, 0 sub-24px targets, 0 sub-12px text on every route/width above.
- `npm run repo:health`: script does not exist on this release line (present only on older branches).

## Not fixed (open)
- 320px header wraps to two rows (logo / search + menu). No overflow or clipping; fixing it means shrinking brand or dropping the MENU label — publisher call.
- Article inline SVG "KANIT YÜZEYLERİ" renders ~6–8px labels at 375px. It is editorial source; not edited here.
- Serif stack is system-only (Iowan/Palatino/Charter/Georgia). On Linux/Android without those it falls back to a Times-like face; a self-hosted licensed serif would fix it but is a brand decision.
- Hero h1 is px/vw-sized, so it does not grow with root text size; it is already 48–111px.
- Masthead quote and triquetra-like symbol: brand approval still pending (PR #30).
- Only one article is publicly admitted; most homepage sections are method/positioning copy. Visual QA cannot substitute for content.
