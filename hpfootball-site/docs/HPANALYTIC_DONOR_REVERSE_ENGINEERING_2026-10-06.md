# HPAnalytic — GitHub Design Reverse Engineering Lab

| Field | Value |
|---|---|
| Title | HPAnalytic donor mechanism extraction, batch 1 |
| Version | 1.0 |
| Date | 2026-10-06 |
| Scope | `hpfootball-site/` only. HPA, HPFA and the other repo projects are untouched. |
| Method | Shallow clone of each donor at a pinned commit, source read file by file, license checked before any reuse decision, mechanism re-implemented in HPAnalytic code and covered by tests. |
| Status | Development. Not deployed. No Cloudflare changes. |

## 0. Input boundary (read this first)

The brief asks to inspect "repos rated highly by Continuous Scout". **No Continuous Scout output exists in this repository or in this session**, so I can't reproduce its scores. The donor set below was chosen by me, against the HPAnalytic component list (navigation, hero, buttons, cards, article, archive, search, scouting, research, visuals, mobile), and filtered by one criterion: *does the repo contain a mechanism HPAnalytic currently lacks or gets wrong?* If a Continuous Scout ranking exists elsewhere, the next batch should start from it and the two lists should be compared.

Claim ceiling for this report: **SOURCE-READ**. Every finding is anchored to a file I read. Usability claims about donors are not tested on users.

## 1. Donor set (license verified before reuse)

| Donor | Commit | License | Role for HPAnalytic |
|---|---|---|---|
| `withastro/starlight` | f3753dd (2026-10-06) | MIT | Same framework (Astro); skip link, mobile menu, TOC observer, search integration |
| `satnaing/astro-paper` | 35cfa7f (2026-08-05) | MIT | Astro editorial blog: archive grouping, Pagefind search page, header a11y |
| `alphagov/govuk-frontend` | 283cc58 (2026-10-01) | MIT (code). Crown-copyright assets/fonts are **excluded** | Best-in-class a11y: progressive-enhancement menu, aria-current semantics, focus styles |
| `edwardtufte/tufte-css` | b5d7b7b (2026-06-25) | MIT | Sidenotes / margin notes for research articles |
| `distillpub/template` | bf862cc (2020-05-18) | Apache-2.0 | Research article apparatus: footnotes, citations, appendix. **Unmaintained since 2020** |
| `KittyGiraudel/a11y-dialog` | 04d36ff (2026-09-28) | MIT | Focus trap / modal dialog semantics |
| `pagefind/pagefind` | b033344 (2026-10-01) | MIT | Static full-text search |
| `trys/utopia-core` | 135c051 (2024-09-19) | ISC (package.json; no LICENSE file in repo) | Fluid type-scale math + WCAG 1.4.4 check |
| `andrewRowlinson/mplsoccer` | 150be3f (2026-09-14) | MIT | Pitch dimension model (dims → renderer split) |

**Copy policy applied in this batch: nothing was copied verbatim.** Every mechanism was rebuilt in HPAnalytic code. Where an MIT/ISC idea was followed closely, the file header credits the donor.

## 2. Findings: one mechanism per line

Format: **Donor → mechanism**, then the extraction table.

### 2.1 Navigation and mobile

**GOV.UK Frontend → progressive-enhancement menu: the toggle button ships `hidden`, the menu ships visible; JS turns it into a disclosure.**

| | |
|---|---|
| Donor files | `packages/govuk-frontend/src/govuk/components/service-navigation/template.njk` (l.45: `<button … hidden aria-hidden="true">`), `…/service-navigation/service-navigation.mjs` (`checkMode()`, `matchMedia` sync) |
| Mechanism | Without JS there is no dead button and no hidden menu. JS removes `hidden` from the button and hides the menu only on narrow screens; a `matchMedia` listener re-syncs state when the viewport crosses the breakpoint. |
| HP gap found | `MobileNavigation.astro` rendered the panel `hidden` and CSS hid `.desktop-nav` under 900px. **With JS off or failed, mobile users had no navigation at all.** |
| Dependency | None |
| Complexity | Low |
| HPAnalytic equivalent | `src/layouts/BaseLayout.astro` (`<html class="no-js">` plus an inline class swap), `src/styles/global.css` (`.js .desktop-nav` / `.js .mobile-navigation` rules inside the 900px query), `src/components/MobileNavigation.astro` (`desktop` matchMedia event) |
| Decision | **REBUILD** (done). Tested in `tests/mobile-navigation.test.mjs` and in the browser with JS disabled. |

**GOV.UK Frontend → `aria-current="page"` vs `aria-current="true"` (exact page vs ancestor section).**

| | |
|---|---|
| Donor files | `…/service-navigation/template.njk` l.68–80 |
| Mechanism | The exact route gets `page`; a parent section of the current route gets `true`. Visual active state hangs off the attribute, so semantics and style can't drift apart. |
| HP gap found | No current-page indication anywhere. |
| HPAnalytic equivalent | `src/lib/site-surfaces.mjs#currentState`, `BaseLayout.astro` (an article marks its section `true`), CSS `.nav-link[aria-current]` |
| Decision | **REBUILD** (done). `tests/site-surfaces.test.mjs` |

**Starlight / AstroPaper / GOV.UK → skip link to the main landmark.**

| | |
|---|---|
| Donor files | `packages/starlight/src/components/SkipLink.astro`; astro-paper `src/components/Header.astro` (`#skip-to-content`); GOV.UK `components/skip-link` |
| Mechanism | First focusable element. Off-screen until focused. Targets `<main id tabindex="-1">` so focus actually moves. |
| HP gap found | None existed. |
| HPAnalytic equivalent | `BaseLayout.astro` `.skip-link` → `#main-content`; CSS `.skip-link` |
| Decision | **REBUILD** (done). Browser-verified: first Tab lands on it, Enter moves focus to `<main>`. |

**Starlight → mobile menu built on the Popover API (`popovertarget`), state read in CSS via `:has(~ :popover-open)`.**

| | |
|---|---|
| Donor files | `packages/starlight/src/components/MobileMenuToggle.astro` |
| Mechanism | Native light-dismiss and Escape handling, zero JS. Scroll lock through `body:has(#sidebar:popover-open)`. |
| Assessment | Elegant, but `aria-expanded` is then managed by the browser and the menu becomes top-layer UI. HP's existing reducer plus tests already encode the contract's behaviour. |
| Decision | **DO NOT ADOPT NOW.** Keep the tested disclosure. Re-evaluate once the panel becomes full-screen. |

**a11y-dialog → focus trap (`trapTabKey`) for modal dialogs.**

| | |
|---|---|
| Donor files | `src/a11y-dialog.ts` l.329, `src/dom-utils.ts` |
| Assessment | The HP mobile panel is a **non-modal disclosure** (WAI-ARIA APG "disclosure navigation"). Trapping focus there would be an accessibility *regression*. The correct mechanism is the opposite: close when focus or pointer leaves. |
| HPAnalytic equivalent | `MobileNavigation.astro` closes on `pointerdown` outside and on `focusout` to an outside element. Reducer events `outside`, `focusout`, `desktop` live in `src/lib/mobile-nav-state.mjs`. |
| Decision | **REJECT the trap. Rebuild the exit behaviour** (done). Keep a11y-dialog as the reference for any future modal (Ask HP, compare drawer). |

### 2.2 Typography and tokens

**Utopia (utopia-core) → fluid type scale as `clamp()` interpolation plus a WCAG 1.4.4 zoom check.**

| | |
|---|---|
| Donor files | `src/index.ts`: `calculateClamp` (l.89–112), `checkWCAG` (l.115+), `calculateTypeStep` (l.215–235) |
| Mechanism | Each step = base × ratio^n at a min and a max viewport, linearly interpolated. The donor swaps min/max for negative steps. Viewport-relative type breaks 200% zoom unless max ≤ 2.5 × min. |
| HP gap found | Hand-picked sizes (`clamp(62px,8.6vw,128px)`) and 8–9px labels, against the contract's own §7 ("avoid tiny low-contrast copy"). |
| HPAnalytic equivalent | `src/lib/fluid-type.mjs` (re-implemented, ISC credited); `--step--1 … --step-6` in `global.css` |
| Decision | **REBUILD** (done). `tests/design-tokens.test.mjs` asserts the CSS tokens equal the generated scale, every step passes the 2.5× rule, and no text sits below 12px. That test caught an 11px label I had introduced. I also hit the negative-step min>max case the donor guards against, and fixed it. |

**GOV.UK → focus indicator that survives forced colours (transparent outline plus a visible ring).**

| | |
|---|---|
| Donor files | `src/govuk/helpers/_focused.scss` (`govuk-focused-text`, `govuk-focused-box`) |
| HPAnalytic equivalent | Global `:focus-visible { outline: 3px solid var(--focus) }` (an outline, so it survives forced colours). Contrast tested ≥ 3:1 against the background. Cards use `:has()` to ring the whole card, wrapped in `@supports selector(:has(*))` so older browsers keep the link outline. |
| Decision | **ADAPT** (done) |

### 2.3 Cards, archive, article

**AstroPaper → archive grouped year → month with counts.**

| | |
|---|---|
| Donor files | `src/pages/archives/index.astro`, `src/pages/archives/_utils/getPostsByGroupCondition.ts` |
| Mechanism | Generic group-by, applied twice (year, then month), sorted newest first, counts as `<sup>`. |
| HPAnalytic equivalent | `src/lib/archive.mjs#groupByYearMonth` (single pass over pre-sorted items, UTC-stable months), `monthName` (tr-TR), `src/pages/archive.astro` with section chips |
| Decision | **REBUILD** (done). `tests/archive.test.mjs` |

**AstroPaper → adjacent-post navigation.**

| | |
|---|---|
| Donor files | `src/pages/posts/[...slug]/_components/AdjacentPostNav.astro` |
| HPAnalytic equivalent | `src/lib/archive.mjs#adjacentItems`, prev/next block in `src/pages/articles/[...id].astro` |
| Decision | **REBUILD** (done) |

**Stretched-link card (pattern seen across Starlight/AstroPaper card components) → one tab stop per card, whole card clickable.**

| | |
|---|---|
| HP gap found | Cards were whole-`<a>` blocks that wrapped headings and badges, so the link text was the entire card. The old grid also used the `gap:1px; background:var(--line)` trick, which **painted a large brown block in empty cells** whenever the item count wasn't a multiple of 3 (visible in the baseline screenshot with 4 articles). |
| HPAnalytic equivalent | `src/components/ArticleCard.astro` (`<article>` › heading › `<a>` with `::after { inset:0 }`), `.card-grid` using real gaps and `auto-fill` |
| Decision | **REBUILD** (done) |

**Tufte CSS → sidenotes with a checkbox toggle on narrow screens (no JS).**

| | |
|---|---|
| Donor files | `tufte.css` l.251–290 (`.sidenote`, `.marginnote`, counter), l.355–440 (`input.margin-toggle`, ≤760px behaviour) |
| Relevance | Research and method articles need provenance next to the claim, not at the bottom. |
| Current content | No article uses notes yet. Building it now would create an empty surface. |
| Decision | **ADAPT LATER** (batch 2, alongside the first research object). Needs a remark plugin or MDX component. MIT. |

**Distill → citation/footnote/appendix apparatus.**

| | |
|---|---|
| Donor files | `src/components/d-footnote.js`, `d-cite.js`, `d-bibliography.js`, `d-appendix.js` |
| Assessment | Right concepts (hover footnotes, bibliography, appendix), wrong runtime: Web Components with shadow DOM. Last commit 2020-05-18. |
| Decision | **CONCEPT ONLY.** Rebuild as static Astro components when the research collection gets content. Do not take the runtime. |

### 2.4 Search

**Pagefind (used by Starlight and AstroPaper) → static full-text index built post-build, loaded on demand.**

| | |
|---|---|
| Donor files | astro-paper `package.json` (`pagefind --site dist`), `src/pages/search.astro` (idle-loaded `PagefindUI`, `?q=` sync with `history.replaceState`) |
| Constraint found | Pagefind indexes **static HTML**. HPAnalytic runs `output:'server'` on Cloudflare, and before this batch even the article pages weren't prerendered. |
| Size check | 4 articles. A WASM index plus UI bundle is unjustified at this size. |
| HPAnalytic equivalent | `src/lib/search.mjs` plus SSR `src/pages/search.astro`: a plain GET form, so it **works without JS**, and results are shareable at `/search?q=…`. Turkish-aware folding (`İ/ı/ş/ğ/ç/ö/ü`): `gordugumuz` finds "Gördüğümüz". AND semantics, field-weighted ranking. |
| Decision | **REBUILD SMALL NOW; ADOPT PAGEFIND past ~50 articles.** Content pages now prerender, so Pagefind becomes possible later without architectural change. Tested in `tests/search.test.mjs` and in the browser with and without JS. |

### 2.5 Visual system

**mplsoccer → pitch as a dimensions object separate from the renderer.**

| | |
|---|---|
| Donor files | `mplsoccer/soccer/dimensions.py` (`BaseSoccerDims`, `CustomDims`, `_arc_angles`) |
| HP gap found | `TacticalCanvas.astro` drew a pitch that was **not to scale** (penalty area 120×240 on an 820×480 field: 15.4 m × 34 m instead of 16.5 m × 40.32 m; centre circle r=62 ≈ 7.9 m instead of 9.15 m). That's minor for a diagram, but it contradicts the "Leonardo: proportion" design intent. |
| HPAnalytic equivalent | `src/lib/pitch-geometry.mjs` (IFAB Law 1 constants, so these are facts and not code; penalty arc computed from the 9.15 m circle). `TacticalCanvas.astro` only draws. |
| Decision | **REBUILD** (done). `tests/pitch-geometry.test.mjs` checks the aspect ratio, box sizes, spot and arc anchor. |

**Contract §6 epistemic strokes, applied (no external donor).**

The old hero diagram drew gold and blue flows with no legend, and the SVG was `aria-hidden`, so its epistemic status was invisible. Now: solid = observed, dashed = candidate, dotted = unknown. There's a visible legend, a caption stating "conceptual diagram, not data", and `role="img"` with `<title>`/`<desc>`. Evidence badges carry the same vocabulary as border style (`src/lib/evidence.mjs`, tested so that no two classes share a stroke).

## 3. Defects found in the existing site (fixed in this batch)

| # | Defect | Evidence | Fix | Guard |
|---|---|---|---|---|
| 1 | **Every `/articles/*` route returned HTTP 500.** `getStaticPaths` is ignored under `output:'server'` without `prerender = true`, so `Astro.props.a` was undefined. | Build warning `getStaticPaths() ignored in dynamic page`; dev server `RenderUndefinedEntryError`; baseline screenshot | `export const prerender = true` on all content pages | `tests/routes.test.mjs` |
| 2 | Mobile navigation unreachable without JS | Source read + no-JS browser run | Progressive enhancement (§2.1) | test + browser |
| 3 | 8–9px labels (contract §7 violation) | CSS | Fluid scale, 12px floor | `design-tokens.test.mjs` |
| 4 | Empty-cell colour bleed in card grids | Baseline screenshot | Real gaps | visual |
| 5 | `text-transform: uppercase` under `lang="tr"` renders English labels as "ANALYSİS", "EVİDENCE" | Screenshot of first rebuild | Labels written in final case; transforms banned | `design-tokens.test.mjs` |
| 6 | No current-page state, no skip link, no canonical/OG metadata | Source read | §2.1, `BaseLayout.astro` | tests + browser |
| 7 | Non-scale pitch, undeclared epistemic status of the hero diagram | Geometry check | §2.5 | `pitch-geometry.test.mjs` |

## 4. Not adopted, with reason

| Candidate | Reason |
|---|---|
| Web fonts (e.g. Inter, a licensed serif) | Network request, layout shift, licence review. System stacks first; revisit with a performance budget. |
| Light theme | Contract §1 (controlled darkness). Not requested. |
| Service worker / offline | Blocked by the Mobile Successor Contract §5 until its own contract exists. |
| TOC (Starlight `starlight-toc.ts` IntersectionObserver) | Current articles are 3 paragraphs and have no headings. It would be an empty surface. Keep for long-form. |
| GOV.UK fonts and crown assets | Not MIT. Excluded. |

## 5. Next batch candidates (ranked by decision value)

1. Research object template: Tufte-style sidenotes plus a Distill-concept bibliography, activated together with the first `src/content/research/*` entry.
2. Scouting report template (role / fit / risk / downside decision card), activated with the first scouting article. The page frame already exists but stays hidden from navigation, per the empty-surface rule.
3. Pagefind once the corpus exceeds about 50 articles.
4. Self-hosted variable serif for article body after a measured LCP/CLS budget.
5. Playwright e2e in CI. Today the browser checks run locally; CI covers unit tests, `astro check` and the build.

## 6. Verification log (this batch)

- `npm test`: 45/45 pass (12 pre-existing tests rewritten to assert intent instead of minified CSS strings).
- `npm run check`: 0 errors, 0 warnings, 0 hints.
- `npm run build`: pass; all content routes prerendered, `/search` and `/api/*` SSR.
- Browser (Chromium, 1440×900 and 375×812): all routes 200 (`/nope` 404), 0px horizontal overflow, 23/23 behavioural checks (menu open/Escape/focus return/outside click/Tab-out/resize, aria-current, canonical, JSON-LD, skip link, search with and without JS, no Turkish-İ labels).
