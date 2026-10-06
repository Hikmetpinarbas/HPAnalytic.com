# HPAnalytic — Deep Reverse Engineering Dossier · Batch 2

| | |
|---|---|
| Version | B2 · 2026-10-06 |
| Rol | Research operator / donor dissector. **Production implementation authority: Claude Code.** In this batch no site code was changed; only `docs/research/*` and one registry policy test were added. |
| Target | `Hikmetpinarbas/HP-PROJELERI` · `hpfootball-site/` · branch `hpanalytic-design` @ `96bbfc2` (PR #2, base `site-hp-standard-v2` @ `683f3f6`) |
| Claim ceiling | **SOURCE-READ**: every mechanism finding rests on a file I read. **MEASURED**: font sizes, Pagefind platform list, GFM footnote output and the Astro version were checked by running them. **NOT TESTED**: usability effects on users. |
| Companion files | `HPANALYTIC_IMPLEMENTATION_PACKETS_B2.md` (packets) · `HPANALYTIC_DONOR_REGISTRY.json` (registry, test: `tests/donor-registry.test.mjs`) · Batch 1: `docs/HPANALYTIC_DONOR_REVERSE_ENGINEERING_2026-10-06.md` |

---

## 0. What was examined

| Source | Content | How much |
|---|---|---|
| Repo, `hpanalytic-design@96bbfc2` | full `hpfootball-site/` tree, tests, docs, contracts | full |
| Drive · *HPANALYTIC.COM — ANA OPERASYON DEFTERİ* | domain/DNS, Worker binding, Task 03 inventory decisions | full |
| Drive · *HP FOOTBALL SITE — LIVING OPERATIONS LEDGER* | 6,809 lines: topology, Packet 01, article-class matrix, provider exclusion, QA pipeline | **full (100%)** |
| Drive · *CLEAN-ROOM IP, PROVENANCE & DONOR GOVERNANCE* | reuse rules, three clean-room tests | full |
| New donors (B2) | Guardian DCR, MyST theme, Astro blog example, OWID Grapher (licence only), Fontsource, AppDeploy HP (owner preview) | file level (registry) |
| Literature | star-glyph / radar perception | **abstract level** (2 sources) |

**Searched, not found:** donor lists from Gemini, Perplexity, Grok, Qwen or Manus for the HPAnalytic site (repo + Drive, 2026-09-25 → 10-06). "Continuous Scout" scores. Both are **UNKNOWN**. The donor set was therefore driven by HPAnalytic's own requirements (blog, analysis, research, scouting, visual, search). The ledger's "research families" (The Athletic, Tifo, data desks) are proprietary products: PATTERN_ONLY at most, with no source to read.

**Not repeated (anti-duplication):** the 9 donors analysed in Batch 1 (Starlight, AstroPaper, GOV.UK, Tufte, Distill, a11y-dialog, Pagefind, Utopia, mplsoccer) were not re-dissected. They were reopened only under the "NEW_REQUIREMENT" trigger: GOV.UK summary-list for scouting, the Pagefind platform list for search, mplsoccer pizza/radar for scouting.

---

## 1. Current HPAnalytic state (only what is on GitHub)

> **Critical boundary:** the ledger shows a second active candidate on the phone (`~/HPA_SITE_DEV/packet01-isolated`, 59–60 tests, Content Control, editorial polish, provider exclusion, `HPANALYTIC_ROUTE_CONTENT_INVENTORY_V1.json`, `DESIGN_EVOLUTION_STATE.json`). **None of it is on GitHub.** I cannot see that tree, so its content is **UNKNOWN** to me. Everything below describes the PR #2 line only.

### 1.1 Architecture
- Astro **5.18.2** (`^5.14.1`), `output: 'server'`, `@astrojs/cloudflare` **12.x** (Pages-style output: `dist/_worker.js` + `_routes.json`), `site: https://hpanalytic.com`.
- Content pages are prerendered (`prerender = true`). On the server: `/search`, `/api/youtube.json` and `/api/<removed-provider>/competitions.json`.
- Dependencies: `astro`, `@astrojs/cloudflare` · dev: `typescript`, `@astrojs/check`. **No runtime JS library.**
- Upstream: astro **7.3.6**, adapter **14.3.4**. Adapter 13+ requires `@cloudflare/vite-plugin` + `wrangler`, which means a **workerd-bound build**.

### 1.2 Route map
| Route | Mode | Nav | Note |
|---|---|---|---|
| `/` | static | — | hero, principles, pipeline (HPA/HPFA/HIO/YELL), latest |
| `/analysis` `/culture` `/scouting` | static | gated (article count) | `scouting` hidden for now (0 articles) |
| `/research` | static | gated (`research` collection) | collection empty → hidden |
| `/visual-lab` | static | gated (`visuals` collection) | **Task 03 decision: canonical `/visual`; `/visual-lab` legacy** → mismatch |
| `/archive` `/search` | static / SSR | utility (article > 0) | |
| `/articles/[...id]` | static | — | 4 articles |
| `/about` `/404` | static | always / — | |
| `/blog` `/blog/[slug]` | **missing** | — | Task 03: blog is a first-class collection |
| `/api/youtube.json` | SSR | — | fails closed with 503 |
| `/api/<removed-provider>/competitions.json` | SSR | — | **contradicts the user's provider-exclusion decision** |

### 1.3 Component map
`BaseLayout` (head metadata, skip link, header, footer nav) · `Logo` · `MobileNavigation` (disclosure + reducer) · `Button` · `ArticleCard` (stretched link) · `EvidenceBadge` (stroke per class) · `SectionListing` · `TacticalCanvas` (IFAB geometry) · `LiveSourceStatus` (**not imported anywhere; contains the removed provider's name**).
Libraries: `site-surfaces`, `mobile-nav-state`, `search`, `archive`, `evidence`, `pitch-geometry`, `fluid-type`.

### 1.4 Content model
`articles` {title, description, date, section∈{analysis,scouting,culture,method}, evidenceClass∈{DIRECT,DERIVED,PROXY,EDITORIAL}, claimCeiling:string, featured}. `research` and `visuals` are defined but have no folder.
**Debt:** `section` mixes *topic* (analysis, culture) with *epistemic type* (method). It lacks the **article-class matrix** defined in the ledger (Class A–E: EDITORIAL_PRINCIPLE, METHOD_EVIDENCE, MATCH/PLAYER_ANALYSIS, SCOUTING_DECISION, NEWS_UPDATE) and the `publicationStatus`, `updatedAt`, `provenance`, `counterevidence`, `language` and `canonicalSlug` fields.

### 1.5 Design system
Tokens on `:root`, a generated fluid type scale, a 12px floor, WCAG AA contrast and the evidence-stroke vocabulary, all tested. Typography uses **system font stacks only**.

### 1.6 Test surface
49 node tests (45 + 4 new registry policy tests). CI: `site-acceptance` = test → `astro check` → build (Linux). **PR #2 CI is green.**

### 1.7 Technical debt (priority order)
1. **[P0] Removed provider is still present** (route, `LiveSourceStatus`, `docs/HP_SITE_RESEARCH_2026-10-04.md`). The phone candidate has a test that FAILs on the provider's name, so a merge would break that test.
2. **[P0] Two candidates.** PR #2 and the phone Packet 01 change the same files (`global.css`, `index.astro`, `BaseLayout.astro`, page copy). A merge conflict is certain, and the authoritative candidate is undecided.
3. **[P0] Deployment shape unknown.** Production `hpanalytic.com` = Worker `hpfootball` (currently a baseline page). Adapter 12 output is Pages-style. Whether it can be deployed to this Worker as-is is **UNKNOWN** (no Cloudflare access; none attempted).
4. **[P1] SSR `/search` breaks the phone static-QA pipeline.** Packet 01 QA disables the adapter and does a static build; a page with `prerender=false` needs an adapter.
5. **[P1] Content model is flat.** The class matrix is not encoded.
6. **[P1] Route debt:** `/visual-lab` → `/visual`; `/blog` missing.

### 1.8 Design debt
1. **Internal system names on the homepage:** the "Postmatch first" module shows HPA/HPFA/HIO/YELL. The ledger says do not carry internal governance names into public copy. The AppDeploy donor has a better public chain: GÖZLEM → İLİŞKİ → KARŞI SORU → ANLAM.
2. **System fonts → identity varies by platform:** Linux renders Liberation Serif, iOS Iowan, Windows Georgia. On Android (the main operator's and the WebAPK's platform) neither Georgia nor Iowan exists, so it falls back to Noto Serif. The "editorial serif" is a different typeface on every device.
3. **Opinion vs evidence-bound analysis are visually identical.** Blog (personal view) and analysis (claim ceiling) share the same card and the same headline weight.
4. **The hero diagram is still conceptual decoration.** It has a legend and a caption, but the AppDeploy "layer map" (the site's own section map as the hero visual) carries more information.

---

## 2. Most valuable donors (Batch 2)

| ID | Donor | Licence | Why it's valuable | Final decision |
|---|---|---|---|---|
| D11 | guardian/dotcom-rendering | Apache-2.0 | Editorial typology as orthogonal axes; single-DOM responsive article grid | PATTERN_ONLY (React/Emotion → rebuild in Astro) |
| D10 | jupyter-book/myst-theme | MIT | Research apparatus: backmatter parts, bibliography anchors, frontmatter block | PATTERN_ONLY (React/Remix) |
| D12 | withastro/astro `examples/blog` | MIT | Same framework; blog schema, RSS | ADAPT |
| D14 | AppDeploy HP (owner's preview) | owner content + 3rd-party overlay | 9 authored articles; publication-protocol module; layer-map hero; also lessons from its mistakes | ADAPT (content: owner approval) / REJECT (head/meta/SW) |
| D15 | Fontsource (Source Serif 4, Inter) | OFL-1.1 | Turkish subset measurement | ADAPT (self-host + TR subset) |
| D13 | owid/owid-grapher | **PROPRIETARY (relicensed)** | provenance footer concept | PATTERN_ONLY: **source not read** |

---

## 3. Donor dossiers

### D11 · guardian/dotcom-rendering
- **URL / commit:** github.com/guardian/dotcom-rendering @ `8540a6c` (2026-10-06) · **Apache-2.0** · React 18 + Emotion SSR · actively maintained.
- **Primary purpose:** theguardian.com article/front rendering.
- **Why selected:** the most mature open source example of separating editorial *types* (Analysis, Comment, Explainer…) from layout.
- **Strongest mechanisms:**
  1. `src/lib/articleFormat.ts`: `ArticleFormat = { design: ArticleDesign, display: ArticleDisplay, theme }`. **design** (what kind of text: Analysis, Comment, Explainer, MatchReport, Interview…), **display** (how it is laid out: Standard, Immersive, Showcase, NumberedList) and **theme** (which pillar's colour) are three independent axes.
     **Why it matters:** HP's `section` enum carries topic and epistemic type together. Without a three-axis model, the claim class (Class A–E) gets mixed up with topic.
  2. `src/layouts/lib/articleArrangements.ts`: the DOM order is the mobile order (`media → title → headline → standfirst → meta → body → right-column`). At wider breakpoints only the grid row/column of named areas changes (`grid.column.left`, `grid.between('centre-column-start','right-column-end')`).
     **Why it matters:** reading order (screen reader, mobile) is identical everywhere. Moving meta and evidence into the left rail on desktop needs no extra DOM.
  3. `src/components/Standfirst.tsx` (l.87–171): `Comment`/`Editorial`/`Letter`/`Obituary` use `headlineLight*` (light weight), news uses `headlineMedium*`. **The reader sees typographically that this is opinion.**
  4. `src/components/FrontSection.tsx`: the front container is a title rail (section name + link) plus content, built with named grid lines (`[decoration-start content-start title-start]`).
- **Dependencies:** Emotion, @guardian/source. None are carried over (CSS grid + custom properties are enough).
- **Accessibility:** single DOM order; semantic section/article.
- **Mobile:** mobile-first, single column by default.
- **Performance:** islands (`*.island.tsx`) for selective hydration. Not needed in HP; zero-JS Astro is already lighter.
- **Maintainability:** very large monorepo; only the concept is taken.
- **HPAnalytic fit:** HIGH (P1-05 content model, P3-09 article grid, P2-07 blog typography, P2-08 homepage modules).
- **Risk:** Guardian's ~30 design types → turning HP into a news portal. **Mitigation:** HP gets 5 classes (the ledger matrix) and 2–3 display variants.
- **Final decision:** PATTERN_ONLY, rebuilt in Astro + CSS grid.

### D10 · jupyter-book/myst-theme
- **commit** `23817b1` (2026-10-06) · **MIT** · React + Remix + Tailwind.
- **Purpose:** web reading layer for scientific documents (MyST Markdown).
- **Strongest mechanisms:**
  1. `packages/site/src/components/Backmatter.tsx`: named parts (`acknowledgments`, `data_availability`) are declared in frontmatter; **`if (!content) return null`**. The empty-surface rule at component scale.
  2. `packages/site/src/components/Bibliography.tsx`: ordered references, stable anchors `id="cite-<label>"`, collapse after 15.
  3. `packages/myst-to-react/src/cite.tsx`: hover popover. JS enhancement; without JS the anchor jump works.
  4. `packages/frontmatter/src/*`: authors, license, downloads block.
- **HP fit:** HIGH for `/research` (P3-10). React/Remix is not carried over.
- **Decision:** PATTERN_ONLY. HP equivalent = frontmatter array + Astro components + native GFM footnotes.

### D12 · withastro/astro `examples/blog`
- **commit** `e4f8f46` · **MIT** · **Astro 7**.
- **Relevant files:** `src/content.config.ts` (`pubDate`, `updatedDate?`, `heroImage: image()`), `src/pages/rss.xml.js` (`@astrojs/rss`), `src/pages/blog/[...slug].astro`, `astro.config.mjs` (`fonts: [{ provider: fontProviders.local(), … }]`).
- **Measured version gap:** HP 5.18.2. In 5.18.2 fonts exist only as `experimental.fonts` (`node_modules/astro/dist/core/config/schemas/base.js:287`); they are stable in 7. **Using the fonts API means migration churn on the 5→7 upgrade.**
- **Decision:** ADAPT (collection + RSS); HOLD (fonts API).

### D14 · AppDeploy HP Football Intelligence (the owner's own preview)
- **Access:** the egress proxy blocked the direct fetch (`connect_rejected`). rawHtml was read through a scrape service (home, journal, one article).
- **Mechanisms to port:**
  - Homepage `section.publication-protocol`: "Kanıt, cümleden önce gelir." + `SOURCE → EVIDENCE → COUNTEREVIDENCE → CLAIM CEILING → FOOTBALL MEANING` + a plain-Turkish publication standard paragraph.
  - `div.hero-art.layer-map`: the hero visual is the **site's own section index** (01 JOURNAL "Long-form football thinking"…). It carries information, not decoration.
  - `section.editorial .pipeline`: GÖZLEM → İLİŞKİ → KARŞI SORU → ANLAM, a public method chain with no internal system names.
  - Journal cards: two-level label `DOMAIN / CONSTRUCT` ("VISUAL FOOTBALL / EVIDENCE"), a ready taxonomy seed.
  - **9 authored articles.** The ledger audit classes them as claim-safe EDITORIAL/METHOD. Blog seed content (owner approval required).
- **Mechanisms rejected (and cutover risks):**
  - `og:description` / `twitter:description` on **every page** = an internal deploy note ("Strengthen publication protocol, remove unwanted technology wording…"). Internal notes leak into public metadata.
  - `author=AppDeploy`, `twitter:site=@appdeployai`, favicon from appdeploy.ai, `theme-color #6366f1` (Contract §11: the forbidden "purple/blue AI identity").
  - A third-party overlay script (z-index max, share and ChatGPT links).
  - `navigator.serviceWorker.register('./sw.js')`: **the installed WebAPK runs a service worker.** The Astro successor has none, by contract. After cutover the old origin's SW stays on that origin (a new origin doesn't inherit it), but the user experience changes ("offline" behaviour may disappear). This must be added to the mobile successor acceptance.
  - Article page `description` = title copy; generic "EDITORIAL NOTE" (ledger WC 3/5: not a citation system).

### D15 · Fontsource (OFL-1.1)
- Measured on `@fontsource-variable/source-serif-4@5.3.0` and `@fontsource-variable/inter@5.3.0`:
  - The `latin` file contains ç ö ü ı. **ğ Ğ İ ş Ş are missing** (verified on the cmap).
  - Any Turkish page therefore downloads `latin-ext` too: **42,040 B (Source Serif 4) + 85,068 B (Inter)**.
  - Subsetting only the TR glyphs from `latin-ext` with `pyftsubset` (U+011E–011F, U+0130–0131, U+015E–015F): **3,372 B + 3,052 B**.
  - **Saving ≈ 120 KB on first load** (two families, wght axis).
- `unicode-range` mechanism: the browser downloads a file only if the page contains a character in its range. With a TR-only file the extra cost for Turkish is ~3 KB.

### D13 · owid/owid-grapher: licence trap
- At HEAD `8fa2601`, `LICENSE.md`: "view and study only… you may not copy, modify, distribute, sublicense, **adapt**…". MIT applies only up to `a139fcf`.
- My prior knowledge ("OWID = MIT") is now wrong. **After discovering the licence I read no further source.** Only the publicly visible product concept (chart footer: "Source: … · licence", a "Sources" tab) is used: PATTERN_ONLY.

---

## 4. What was dissected: mechanism ≠ code

| Donor implementation | Underlying mechanism | HPAnalytic adaptation |
|---|---|---|
| Guardian `ArticleFormat` enum + per-design Emotion styles | content type, layout and theme are independent; the reader **sees** the type | Zod: `articleClass` (epistemic) ⟂ `section` (topic) ⟂ `display` (layout) + CSS `[data-class="EDITORIAL_PRINCIPLE"]` → lighter headline |
| Guardian `articleArrangements.ts` (Emotion + breakpoints) | single DOM order; named areas repositioned on a grid | `.article-page` `grid-template-areas` + 2 breakpoints, no extra DOM |
| MyST `Backmatter` (React) | named part renders only if present | Astro `<Backmatter part="limitations">`, `return null` when empty |
| MyST `Bibliography` (React state collapse) | stable anchor + collapse for long lists | frontmatter `references[]` → `<ol id="kaynaklar">` + `<details>` (no JS) |
| Distill/MyST hover footnotes (JS) | the note is reachable without leaving the reading line | **native GFM footnotes** (already in Astro) + Turkish labels; hover is P5 |
| Pagefind (Rust binary + WASM) | build-time index, query-time chunk loading | build-time JSON index (`/search-index.json`, prerendered) + the existing isomorphic `searchDocuments` |
| Fontsource npm package | unicode-range subset files | self-hosted woff2: `latin` + `tr` (≈3 KB) subset, plain `@font-face` |
| AppDeploy hero `layer-map` (static HTML) | hero visual = map of real surfaces | layer map generated from `buildVisibleNavigation()`: empty surface → not in the hero |

---

## 5. Mechanisms suited to HPAnalytic (target component map)

| Mechanism | Target | Implementation | Packet |
|---|---|---|---|
| removed-provider purge + exclusion test | `src/pages/api/*`, `LiveSourceStatus.astro`, docs | delete + token test | P0-02 |
| candidate reconciliation | entire branch | decision → merge plan | P0-01 |
| static-first rendering policy | `astro.config.mjs`, `search.astro` | SSR only for API | P0-03 / P4-13 |
| three-axis content model + class matrix | `src/content.config.ts` | `z.discriminatedUnion('articleClass', …)` | P1-05 |
| self-hosted TR-subset typography | `global.css`, `public/fonts/*` | `@font-face` + `size-adjust` fallback | P1-06 |
| public method chain + publication protocol | `index.astro` | replace the HPA/HPFA/HIO/YELL module | P2-08 |
| layer-map hero | `index.astro`, `site-surfaces.mjs` | gated surface index | P2-08 |
| blog collection + RSS + draft | `content.config.ts`, `pages/blog/*`, `rss.xml.ts` | Astro collection | P2-07 |
| opinion typography | `ArticleCard`, article page | `data-class` CSS | P2-07 |
| Toulmin-mapped analysis template | `pages/articles/[...id].astro`, new `AnalysisArgument.astro` | frontmatter + sections | P3-09 |
| research apparatus | new `Backmatter`, `References` | frontmatter + GFM | P3-10 |
| scouting dossier | new `ScoutingDossier.astro` | `<dl>` + decision dimensions + risk | P3-11 |
| figure + provenance footer | new `Figure.astro`; `/visual` | figcaption + source line + visualClass | P4-12 |
| static search index | `search.astro`, new `search-index.json.ts` | prerendered JSON + PE | P4-13 |
| taxonomy facets | `content.config.ts` (`domain`, `construct`), tag pages | gated tag pages (≥2 items) | P4-14 |

---

## 6. Rejected / high-risk ideas

| Idea | Why rejected | Evidence |
|---|---|---|
| **Pagefind (now)** | no android binary → can't run in the phone's local-first build; needs static HTML; 4 articles | `npm view pagefind optionalDependencies` |
| **Astro 7 + adapter 14 upgrade (now)** | adapter 13+ is wrangler/workerd-bound; the ledger says workerd doesn't run on Android arm64 → phone builds become impossible; major version churn | npm peerDependencies; ledger §HP CONTENT CONTROL |
| **Astro `fonts` API** | experimental in 5.18; API changes in 7 | `base.js:287` |
| **Radar / pizza chart as the primary scouting comparison** | perceived shape depends on arbitrary axis order; shape/contour drives similarity judgements → a design artifact disguised as a comparison | Klippel et al. 2009; Fuchs et al. 2014 (**abstract level**) |
| **Distill runtime** | Web Components + shadow DOM, last commit 2020 | `distillpub/template@bf862cc` |
| **Code/structure from OWID Grapher** | relicensed: "may not … adapt" | `LICENSE.md@8fa2601` |
| **AppDeploy head/meta, SW, overlay** | public leak of internal notes, forbidden identity colour, unconsented SW, third-party script | rawHtml |
| **Hover-popover citations (now)** | JS-only; the anchor version works without JS; low value at 0 research objects | MyST `cite.tsx` |
| **Guardian's ~30 design types** | turns HP into a news portal | `articleFormat.ts` |
| **A Content Control route in public nav** | the ledger keeps it internal | ledger |

---

## 7. Red team (whole batch)

- **Does this solve the real problem?** The highest-value finding is not a donor: two candidates plus one user-decision conflict. If the next code packet goes into PR #2 before those are fixed, the merge cost grows. **So the first three packets are hygiene/architecture, not design.**
- **Is there a simpler solution?** Search: the existing `searchDocuments` lib + a prerendered JSON file is enough; MiniSearch/Pagefind are unnecessary. Footnotes: Astro already provides them, zero dependency. Typography: plain `@font-face` beats the experimental API.
- **Is a donor dragging us into another framework?** Guardian, MyST and OWID are all React. Only concepts were taken; no React dependency was proposed.
- **Unnecessary JS?** None of the proposed packets requires JS for core functionality (search is the exception and has a no-JS fallback via the archive).
- **Mobile?** The font packet is based on Android as the main platform; search is static-QA compatible on the phone; Guardian's single-DOM order is mobile-first.
- **Is HPAnalytic losing its character?** Public chain in Turkish and evidence vocabulary are preserved; the AppDeploy indigo/overlay identity is rejected.
- **Generic template smell?** The blog template (Astro example) is the most generic risk. The opinion typography + class badge + claim boundary keep the difference visible.
- **Overengineering warning:** P1-05 (discriminated union) is valuable only for the stricter classes (MATCH, SCOUTING). Most of today's content is EDITORIAL; making it **too strict** blocks writing. Packet solution: Class A requires only a minimal field set.

---

## 8. Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| PR #2 ↔ phone Packet 01 merge conflict | High | High | P0-01: decide first; merge test suites as a union |
| Merging PR #2 as-is violates the provider exclusion | Certain (if merged) | Medium (decision breach) | P0-02 |
| Adapter 12 output not deployable to the `hpfootball` Worker | UNKNOWN | High (production) | P0-03: read-only verification (`wrangler deploy --dry-run`, no Cloudflare mutation) |
| Font self-hosting lowers LCP | Low | Medium | `font-display: swap` + `size-adjust` fallback + preload only for the body serif |
| Over-strict schema blocks writing | Medium | Medium | Class A minimal; strict fields only for C/D |
| AppDeploy content moved without approval | Low | High | P2-07: content import only after Hikmet's approval |

---

## 9. Next research gap

1. **Phone Packet 01 tree is unknown.** Pushing it to GitHub (a separate branch, without merging) is the only way to compare; nothing can be reconciled without it.
2. **Deployment shape:** which artifact can go to the `hpfootball` Worker (adapter 12 `_worker.js` vs Workers static assets). A read-only check is needed.
3. **Font choice is a design decision.** Source Serif 4 / Inter are candidates measured for their Turkish subset; the final choice needs visual approval (render comparison on the Android device).
4. **Radar evidence is abstract level.** If the scouting visual decision becomes critical, read Klippel 2009 and Fuchs 2014 in full.
5. **No donor lists from other agents were found.** If they exist, they should be shared via Drive/repo and checked against this registry (duplication control).

**ENOUGH EVIDENCE TO DECIDE** for P0–P1. Additional donor reading won't change these packets; the next value comes from implementation and owner decisions.
