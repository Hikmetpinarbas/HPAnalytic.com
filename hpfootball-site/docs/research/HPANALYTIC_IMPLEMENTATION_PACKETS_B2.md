# HPAnalytic — Implementation Packets · Batch 2

**For:** Claude Code (implementation authority) · **Date:** 2026-10-06 · **Base:** `hpanalytic-design@96bbfc2`
**Source chain:** DONOR → SOURCE → MECHANISM → HPANALYTIC FIT → PACKET. Evidence: `HPANALYTIC_DEEP_RE_2026-10-06_B2.md`, registry: `HPANALYTIC_DONOR_REGISTRY.json`.
**Path convention:** paths that exist are written as-is. New files are marked `PROPOSED:`. The removed provider is never named in this document (to stay compatible with the phone candidate's exclusion test); it is written as `<removed-provider>`.
**Clean-room:** every packet must pass the three tests in the Drive standard: Source Removal, Independent Structure, Requirements-First. No packet copies donor code.

## Priority list

| ID | P | Target | Short summary | Dependency |
|---|---|---|---|---|
| P0-01 | P0 | whole branch | Reconcile the two candidates (decision + plan) | **Owner decision** |
| P0-02 | P0 | API / docs | Purge the removed provider + exclusion test | — |
| P0-03 | P0 | rendering / deploy | Static-first policy, static search index, deployment-shape check | P0-02 |
| P1-05 | P1 | content model | Article-class discriminated union + publication status + blog collection | P0-01 |
| P1-06 | P1 | typography | Self-hosted serif + 3 KB TR subset | — |
| P2-07 | P2 | /blog | Blog surface, RSS, draft logic, opinion typography | P1-05 |
| P2-08 | P2 | homepage | Layer-map hero, publication protocol, public method chain | P1-05 |
| P3-09 | P3 | analysis | Toulmin-mapped argument template + article grid | P1-05 |
| P3-10 | P3 | research | Footnotes (native), references, backmatter parts | P1-05 |
| P3-11 | P3 | scouting | Structured dossier, no radar | P1-05 |
| P4-12 | P4 | /visual | Route rename + Figure/provenance footer | — |
| P4-13 | P4 | search UX | Facets + query highlighting (after P0-03) | P0-03 |
| P4-14 | P4 | archive | DOMAIN / CONSTRUCT facets, gated tag pages | P1-05 |
| P5-15 | P5 | polish | TOC observer, sidenotes, hover citations, OG image | P3-10 |

---

## P0-01 · Candidate reconciliation (decision packet, not code)

- **TARGET:** branch topology.
- **CURRENT PROBLEM:** PR #2 (`hpanalytic-design`, GitHub) and the phone Packet 01 (`~/HPA_SITE_DEV/packet01-isolated`, not on GitHub) change the same files. Both are "accepted locally". ONE_CAPABILITY_ONE_CURRENT_OWNER is broken.
- **SOURCE:** Drive site ledger §HP CONTENT CONTROL CHECKPOINT, §OPERATIONS CHECKPOINT 2026-10-06; main ledger TASK 03.
- **MECHANISM:** union of the two candidates' test suites = acceptance; the decision belongs to the owner.
- **PROPOSED STEPS:**
  1. Push the phone candidate to GitHub as a **separate branch** (e.g. `hpanalytic-phone-packet01`). No merge, no PR.
  2. Claude Code produces `git diff hpanalytic-design..hpanalytic-phone-packet01 -- hpfootball-site` and a conflict list.
  3. Owner chooses the base line (A: PR #2, B: Packet 01).
  4. Port the other line's **tests** first (RED), then the behaviour (GREEN).
- **ACCEPTANCE:** one branch; the union of both test suites passes; `astro check` 0/0/0; build passes; static QA build passes.
- **RISK:** mixing the editorial copy work (phone) with the structural work (PR #2) during the manual merge.
- **ROLLBACK:** both branches stay; nothing is deleted.

---

## P0-02 · Purge the removed provider + exclusion guard

- **TARGET:** API routes, status component, docs.
- **CURRENT PROBLEM:** the user removed a data provider from the site entirely (Drive ledger §PROVIDER EXCLUSION CHECKPOINT). The PR #2 line still contains:
  - `src/pages/api/<removed-provider>/competitions.json.ts` (commit `8f3365e`)
  - `src/components/LiveSourceStatus.astro` (commit `30ef823`, **not imported anywhere**)
  - `docs/HP_SITE_RESEARCH_2026-10-04.md` (commit `4545c3d`, the provider is named)
- **DONOR / SOURCE:** owner decision + the exclusion test concept already written on the phone line.
- **MECHANISM:** reverting a decision silently must be caught by a test: if the token appears in source/docs → FAIL.
- **WHY:** without this, merging PR #2 reverses a user decision.
- **CURRENT FILES:** the three files above.
- **PROPOSED FILES:**
  - delete: `src/pages/api/<removed-provider>/` (directory)
  - delete: `src/components/LiveSourceStatus.astro` (unused; it also carries "CONNECTED / SECRET_REQUIRED" infrastructure language, which the ledger says must not reach public UI)
  - edit: `docs/HP_SITE_RESEARCH_2026-10-04.md` → "removed provider" wording
  - `PROPOSED: tests/provider-exclusion.test.mjs`. Build the token from parts so the test file doesn't match itself. Scan only `src/`, `docs/`, `public/`, `astro.config.mjs`.
  - CSS: delete the now-unused `.source-status*` rules in `src/styles/global.css`.
- **DEPENDENCIES:** none. **LICENCE:** n/a.
- **TEST PLAN:**
  - GIVEN the repo tree · WHEN `npm test` runs · EXPECT a case-insensitive search for the token in `src/**`, `docs/**`, `public/**` finds nothing.
  - GIVEN a build · WHEN `dist/` is inspected · EXPECT no `api/<removed-provider>` output.
  - RED first: the test must FAIL on the current tree (3 files), then pass after the deletion.
- **ACCEPTANCE:** test GREEN; `astro check` clean; build passes; `/api/youtube.json` behaviour unchanged (503 fail-closed).
- **RISK:** is the token present in older docs (batch-1 donor report)? → checked: no.
- **ROLLBACK:** `git revert` (if the user reverses the decision).

---

## P0-03 · Static-first rendering policy + static search index + deployment-shape check

- **TARGET:** `astro.config.mjs`, `src/pages/search.astro`, deployment docs.
- **CURRENT PROBLEM:**
  1. `src/pages/search.astro` has `prerender = false`. The phone's static-QA pipeline (adapter disabled) can't build this page, so the two acceptance pipelines diverge.
  2. Production `hpanalytic.com` is the Worker `hpfootball`. The adapter 12 output (`dist/_worker.js`, `_routes.json`) is Pages-shaped, and whether it can be deployed to that Worker is **UNKNOWN**.
  3. Adapter 13+ is workerd/wrangler-bound and workerd doesn't run on Android, so an upgrade would kill phone-local builds.
- **DONOR / SOURCE:** Pagefind's static-index mechanism (D07; the tool itself is HOLD); ledger §OPERATIONS CHECKPOINT (static QA); npm peerDependencies.
- **MECHANISM:** "build-time index, query-time filter". A static page + a prerendered JSON index + the existing isomorphic `searchDocuments()`. The server is needed only for real API routes.
- **WHY:** the same HTML in all three modes (static QA, Pages-style Worker, future Workers static assets). The search lib is already tested; only the delivery changes.
- **CURRENT FILES:** `src/pages/search.astro`, `src/lib/search.mjs`, `tests/routes.test.mjs` (currently asserts `search.astro` has `prerender = false`).
- **PROPOSED FILES:**
  - `PROPOSED: src/pages/search-index.json.ts`: `export const prerender = true;` `GET` → `[{id, url, title, description, meta, body: normalizeText(body).slice(0, 4000)}]` (body truncated; size budget).
  - `src/pages/search.astro` → `prerender = true`. Markup: `<form role="search" data-search>` + `<ul data-search-results>` + `<noscript>` "Arama JavaScript gerektirir. Tüm yazılar Arşiv'de." + archive link.
  - `PROPOSED: src/scripts/search-client.ts` (Astro `<script>`, bundled): read `?q=`, `fetch('/search-index.json')` once, `searchDocuments()`, render results with `textContent`/`createElement` (**no innerHTML: XSS**), sync the input with `history.replaceState` (`?q=`).
  - `tests/routes.test.mjs`: the new policy is "outside `src/pages/api/**`, every page has `prerender = true`".
  - `PROPOSED: docs/DEPLOYMENT_SHAPE_V1.md`: record the result of a **read-only** check. Example: in CI, `npx wrangler deploy --dry-run --outdir /tmp/x` against the adapter 12 output. **No Cloudflare mutation, no deploy.**
- **STATE:** `{ index: Doc[] | null, query: string }`, lazy load on the first query.
- **INTERACTION:** results update on `input` (debounced 120 ms); `Enter` = submit; no-JS → GET `/search?q=` reaches the static page, `<noscript>` shows the archive.
- **ACCESSIBILITY:** results count in a `role="status"` live region; `<label>` stays; results list as `<ul>`; focus doesn't move automatically.
- **MOBILE:** `enterkeyhint="search"`, input font ≥16px (avoids iOS zoom; currently `--step-0` ≥ 17px ✓).
- **DEPENDENCIES:** none (fetch + existing lib). **Size budget:** index ≤ 50 KB (gzip) → about 100 articles; past that, re-evaluate MiniSearch (MIT). Pagefind only if Android builds are dropped.
- **TEST PLAN:**
  - GIVEN a build · WHEN `dist/search-index.json` is read · EXPECT it parses as JSON, contains every PUBLISHED article and no DRAFT.
  - GIVEN the static QA build (adapter disabled) · WHEN `astro build` · EXPECT PASS (this currently fails).
  - GIVEN the browser + JS · WHEN `/search?q=gordugumuz` · EXPECT 1 result and status text "1 sonuç".
  - GIVEN JS disabled · WHEN `/search` · EXPECT `<noscript>` text + archive link visible.
  - GIVEN the title `<img src=x onerror=…>` in the index · WHEN rendered · EXPECT text, no executed markup.
- **ACCEPTANCE:** both build modes pass; the existing 23 browser checks pass (the search ones are updated to the new behaviour); index size reported.
- **RISK:** no-JS search loss (accepted; the archive keeps all content reachable via real links, as the SEO contract requires).
- **ROLLBACK:** restore the SSR version of `search.astro` (lib unchanged).

---

## P1-05 · Content model: article class (discriminated union) + publication status + blog collection

- **TARGET:** `src/content.config.ts`, every `getCollection` call.
- **CURRENT PROBLEM:** `section` mixes topic and epistemic type (`method`). The ledger's Class A–E admission matrix isn't encoded, and there is no `publicationStatus`, so a draft can't be held back from publication.
- **DONOR / SOURCE:** Guardian `ArticleFormat` (D11, `src/lib/articleFormat.ts`): orthogonal axes. Drive ledger §PUBLICATION ADMISSION MATRIX (Class A–E, status vocabulary, hard blocks). Astro blog `content.config.ts` (D12): `updatedDate`.
- **MECHANISM:** one discriminator key (`articleClass`) determines which fields are **mandatory** at build time. Flat optional fields = no enforcement.
- **WHY:** a match analysis with a missing source **fails the build**; an editorial essay is not forced to fill match fields.
- **CURRENT FILES:** `src/content.config.ts`, `src/layouts/BaseLayout.astro` (gating counts), `src/pages/*.astro`, `src/components/SectionListing.astro`, the 4 `src/content/articles/*.md`.
- **PROPOSED FILES:**
  - `src/content.config.ts`:
    ```ts
    // illustrative, not a full implementation
    const status = z.enum(['DRAFT','REVIEW','READY_FOR_PUBLICATION','PUBLISHED','SUPERSEDED','WITHDRAWN']);
    const base = {
      title: z.string(), description: z.string(),
      date: z.coerce.date(), updatedAt: z.coerce.date().optional(),
      publicationStatus: status, language: z.enum(['tr','en']).default('tr'),
      section: z.enum(['analysis','scouting','culture','research']),   // topic only
      display: z.enum(['standard','longform']).default('standard'),
      domain: z.string().optional(), construct: z.string().optional(), // P4-14
      evidenceClass: z.enum(['DIRECT','DERIVED','PROXY','EDITORIAL']),
      claimCeiling: z.string(), provenanceNote: z.string().optional(), featured: z.boolean().default(false),
    };
    const articleSchema = z.discriminatedUnion('articleClass', [
      z.object({ ...base, articleClass: z.literal('EDITORIAL_PRINCIPLE') }),
      z.object({ ...base, articleClass: z.literal('METHOD_EVIDENCE'),
        observabilityBoundary: z.string().min(1), weakeningCondition: z.string().min(1) }),
      z.object({ ...base, articleClass: z.literal('MATCH_ANALYSIS'),
        match: z.object({ competition: z.string(), date: z.coerce.date(), home: z.string(), away: z.string() }),
        sources: z.array(z.object({ label: z.string(), url: z.string().url().optional() })).min(1),
        counterevidence: z.array(z.string()).min(1), unknowns: z.array(z.string()).default([]),
        weakeningCondition: z.string().min(1) }),
      z.object({ ...base, articleClass: z.literal('SCOUTING_DECISION'), /* P3-11 */ }),
      z.object({ ...base, articleClass: z.literal('NEWS_UPDATE') }),
    ]);
    ```
  - `PROPOSED: src/lib/publication.mjs`: `isPublic(entry)` → `publicationStatus === 'PUBLISHED'` (`SUPERSEDED` keeps its URL but is excluded from listings). **Every** listing, nav count, RSS and search index uses this helper.
  - `PROPOSED: blog` collection (Task 03 decision: independent of professional articles): `{title, description, date, updatedAt?, publicationStatus, tags?: string[], heroImage?: image()}`. No `articleClass` (personal writing; the class is implicitly "OPINION", which is visible in P2-07).
  - Migrating the 4 articles: `event-only-boundary` → `section: analysis`, `articleClass: METHOD_EVIDENCE` (+ boundary/weakening text **from Hikmet**); the other three → `EDITORIAL_PRINCIPLE`; all `publicationStatus: PUBLISHED`.
- **DECISION REQUIRED (owner):** where should `method` articles live? Proposal: under `section: analysis` + class `METHOD_EVIDENCE`; when the `/research` collection opens, they can move there.
- **ACCESSIBILITY / MOBILE / MOTION:** n/a (data layer).
- **DEPENDENCIES:** none (`astro/zod`; `z.discriminatedUnion` verified in 5.18.2).
- **TEST PLAN:**
  - GIVEN a fixture with `articleClass: MATCH_ANALYSIS` and no `sources` · WHEN schema parse · EXPECT failure (Zod error naming `sources`).
  - GIVEN a `DRAFT` article · WHEN build · EXPECT no `/articles/<id>/`, absent from nav count, absent from search index and RSS.
  - GIVEN only DRAFT content in `scouting` · WHEN layout · EXPECT the SCOUTING nav item hidden (empty-surface rule counts public content).
  - Put the schema in a pure module (`src/lib/content-schema.mjs`) so it can be tested with node (`content.config.ts` imports it).
- **ACCEPTANCE:** the 4 existing articles validate; the gating tests are updated to count with `isPublic`.
- **RISK:** too strict → blocks writing. Class A minimal; strict fields only for C and D.
- **ROLLBACK:** schema revert; content frontmatter is backward compatible (only fields are added).

---

## P1-06 · Typography: self-hosted serif + Turkish subset

- **TARGET:** `src/styles/global.css` (`--font-serif`), `public/fonts/`.
- **CURRENT PROBLEM:** system serif stack → a different typeface on every platform; on Android (the main platform and the WebAPK) it's Noto Serif. The editorial identity isn't stable.
- **DONOR / SOURCE:** Fontsource (D15, OFL-1.1). Astro blog example fonts (D12, HOLD).
- **MECHANISM:** `@font-face` + `unicode-range`. The browser downloads a file only if the page contains a character in its range. Turkish needs `latin` plus 5 glyphs from `latin-ext` (ğ Ğ İ ş Ş).
- **MEASURED:** Source Serif 4 latin 52 KB + latin-ext 42 KB → latin 52 KB + **TR 3.4 KB**. (With Inter as well, ≈120 KB saved.)
- **SIMPLER ALTERNATIVE (recommended first):** self-host **only the serif** (it carries the identity); keep the system sans for UI labels (Android Roboto is consistent). Total ≈ 55 KB.
- **PROPOSED FILES:**
  - `PROPOSED: public/fonts/source-serif-4-latin-wght.woff2`, `public/fonts/source-serif-4-tr-wght.woff2`, `public/fonts/OFL.txt`
  - `PROPOSED: scripts/fonts/subset.sh` (records how the files were produced: `pyftsubset … --unicodes="U+011E-011F,U+0130-0131,U+015E-015F" --flavor=woff2 --layout-features='*'`). Outputs are **committed**, so the build has no Python dependency.
  - `global.css`:
    ```css
    @font-face { font-family: "HP Serif"; src: url(/fonts/source-serif-4-latin-wght.woff2) format("woff2");
      font-weight: 200 900; font-display: swap; unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
    @font-face { font-family: "HP Serif"; src: url(/fonts/source-serif-4-tr-wght.woff2) format("woff2");
      font-weight: 200 900; font-display: swap; unicode-range: U+011E-011F, U+0130, U+015E-015F; }
    --font-serif: "HP Serif", "Iowan Old Style", Georgia, serif;
    ```
    (Take the latin range exactly from Fontsource `index.css`; the block above is illustrative.)
  - `BaseLayout.astro`: `<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/source-serif-4-latin-wght.woff2">`. Preload only latin; TR loads on demand.
  - CLS: a fallback face with `size-adjust`/`ascent-override` (values **measured**, not guessed; e.g. a capsize-style calculation against Georgia/Noto Serif).
- **LICENCE:** OFL-1.1. Font files can be redistributed; OFL.txt must sit next to them; the Reserved Font Name rule doesn't apply because subsetting doesn't rename the font, but record that it's a "modified version" in OFL.txt/README.
- **ACCESSIBILITY:** WCAG contrast unchanged; `font-display: swap` avoids invisible text.
- **MOBILE:** test on the Android device (final approval of the font choice = visual comparison on the phone).
- **TEST PLAN:**
  - GIVEN `global.css` · EXPECT an `@font-face` with the TR `unicode-range` and both files present on disk.
  - GIVEN `public/fonts/*.woff2` · EXPECT total ≤ 70 KB (budget test).
  - GIVEN the TR subset · WHEN cmap is read (fontTools in a CI-only Python step, or a JS woff2 parser) · EXPECT U+011E, U+011F, U+0130, U+015E, U+015F present.
  - Browser: GIVEN `/articles/position-role` · EXPECT `document.fonts.check('1em "HP Serif"')` true and no ğ/ş/İ glyph falling back.
- **ACCEPTANCE:** budget passes; no visible jump in the Android screenshot.
- **RISK:** font choice is subjective. This packet ships the **mechanism**; the typeface can be swapped by replacing the files.
- **ROLLBACK:** remove the `@font-face` block; the stack falls back to system fonts.

---

## P2-07 · Blog surface (`/blog`)

- **CURRENT PROBLEM:** Task 03: blog is a first-class collection, but no route exists. The AppDeploy donor has 9 authored articles (Journal).
- **DONOR / SOURCE:** Astro blog example (D12: `src/content.config.ts`, `src/pages/rss.xml.js`), Guardian Standfirst opinion typography (D11), AppDeploy Journal (D14).
- **MECHANISM:**
  1. Collection + `[...slug]` static route + RSS.
  2. **Opinion typography:** blog and EDITORIAL-class headlines use a lighter weight plus a "YORUM / GÖRÜŞ" kicker. The reader sees what kind of text it is (Guardian Comment/Editorial pattern).
- **PROPOSED FILES:** `PROPOSED: src/content/blog/`, `PROPOSED: src/pages/blog/index.astro`, `PROPOSED: src/pages/blog/[...slug].astro` (`prerender = true`), `PROPOSED: src/pages/rss.xml.ts` (blog + public articles, `isPublic`), `src/lib/site-surfaces.mjs` (BLOG surface, gated by public blog posts > 0), `ArticleCard.astro` (`data-kind="opinion"` variant).
- **DEPENDENCY:** `@astrojs/rss` (MIT, from the Astro team, small). **Alternative:** a hand-written RSS XML endpoint (~30 lines). Recommendation: the hand-written endpoint (stays at zero dependencies). Use `@astrojs/rss` only if Atom/JSON Feed is needed later.
- **CONTENT:** importing the 9 AppDeploy articles requires **Hikmet's approval**. If approved: `publicationStatus: REVIEW` → PUBLISHED after editorial review. Replace the generic "EDITORIAL NOTE" with a per-article `provenanceNote`.
- **CSS / GRID:** the blog list is a single column (reading-first), not the `card-grid`; date + DOMAIN / CONSTRUCT label + title + standfirst.
- **ACCESSIBILITY:** "YORUM" is text, not colour; the RSS `<link rel="alternate" type="application/rss+xml">` goes in the head.
- **TEST PLAN:**
  - GIVEN 0 public blog posts · EXPECT no BLOG in nav, `/blog` shows an empty-state page that is not linked from nav.
  - GIVEN 1 DRAFT + 1 PUBLISHED post · EXPECT 1 listed item and 1 `<item>` in RSS.
  - GIVEN `/rss.xml` · EXPECT valid XML with absolute `https://hpanalytic.com/...` links.
  - GIVEN a blog page · EXPECT the kicker "YORUM" and `h1` with the light-weight class.
- **ACCEPTANCE:** RSS validated (xmllint); routes 200; mobile overflow 0.
- **RISK:** generic blog-template smell → mitigated by opinion typography + claim boundary.
- **ROLLBACK:** remove the BLOG surface from nav (the collection can stay).

---

## P2-08 · Homepage: layer-map hero, publication protocol, public method chain

- **CURRENT PROBLEM:** (1) the "Postmatch first" module puts internal system names (HPA/HPFA/HIO/YELL) in public copy, against the ledger rule. (2) The hero diagram is conceptual; the information on the homepage is scarce.
- **DONOR / SOURCE:** AppDeploy (D14: `index.html` `.hero-art.layer-map`, `.publication-protocol`, `.pipeline` GÖZLEM→İLİŞKİ→KARŞI SORU→ANLAM; copy is owner content). Guardian FrontSection (D11: title rail + content).
- **MECHANISM:**
  - The hero right-hand side = the **real surface map**, generated from `buildVisibleNavigation()` + counts ("01 ANALYSIS · 2 yazı"). An empty surface doesn't appear.
  - A module that explains the publication standard in plain Turkish (SOURCE → EVIDENCE → COUNTEREVIDENCE → CLAIM CEILING → FOOTBALL MEANING).
  - FrontSection: kicker + "Tümü →" in the left rail, content on the right (named grid lines; single column on mobile, DOM order preserved).
- **PROPOSED FILES:** `src/pages/index.astro`, `PROPOSED: src/components/LayerMap.astro`, `PROPOSED: src/components/FrontSection.astro`, `src/lib/site-surfaces.mjs` (`buildSurfaceIndex({counts})` → `[{href,label,count,descriptor}]`).
- **DECISION REQUIRED (owner):** does TacticalCanvas leave the hero (move to `/visual`) or stay on another module? Proposal: hero = LayerMap; TacticalCanvas → `/visual` and "Kanıt sınırı" explanations.
- **CSS / GRID / BREAKPOINTS:** hero `grid-template-areas: "copy" "map"` (mobile) → `"copy map"` (≥900px). FrontSection: `minmax(10rem, 14rem) 1fr` (≥900px).
- **MOTION:** none (Contract §8).
- **ACCESSIBILITY:** the LayerMap is a `<nav aria-label="Bölümler">` + `<ol>`. It is a second navigation, so its label must differ from the primary nav.
- **TEST PLAN:**
  - GIVEN surface counts {analysis:2, culture:1} · WHEN `buildSurfaceIndex` · EXPECT only these two (+ always-visible) items in order.
  - GIVEN the homepage HTML · EXPECT the strings "HPFA", "HIO", "YELL" absent from public copy (test).
  - GIVEN 375px · EXPECT 0 horizontal overflow; the LayerMap comes after the hero copy in the DOM.
- **ACCEPTANCE:** owner approval of the copy; screenshots at 1440 and 375.
- **RISK:** two navigations on the page → redundancy. LayerMap shows counts + descriptors, so it isn't a copy of nav.
- **ROLLBACK:** restore the old module (git).

---

## P3-09 · Analysis template: Toulmin-mapped argument structure

- **CURRENT PROBLEM:** the CLAIM → EVIDENCE → MECHANISM → CONTEXT → COUNTEREVIDENCE → VERDICT chain exists only in prose; it's neither verifiable nor visible.
- **DONOR / SOURCE:** **Toulmin model** (S01, SCIENCE_METHOD_DONOR): claim → CLAIM, data → EVIDENCE, warrant → MECHANISM, backing → CONTEXT/SOURCE, qualifier → CLAIM CEILING, rebuttal → COUNTEREVIDENCE. Guardian `articleArrangements.ts` (D11): single DOM order + named areas.
- **MECHANISM:** an argument's parts are **typed data**; the page renders them in a fixed order with headings. A missing part = build error (for MATCH_ANALYSIS).
- **PROPOSED FILES:** `PROPOSED: src/components/AnalysisArgument.astro`; `src/pages/articles/[...id].astro` (render if the class is MATCH_ANALYSIS or METHOD_EVIDENCE); P1-05 schema: `argument: { claim, evidence: [{text, sourceRef, evidenceClass}], mechanism, context, counterevidence: string[], verdict }`.
- **DATA / PROPS:** `argument`, `claimCeiling`, `sources`.
- **CSS / GRID:**
  ```
  mobile:  "head" "meta" "argument" "body" "boundary" "notes"
  ≥1100px: "meta head" "meta argument" "meta body" ". boundary"   (meta = left rail, 14rem)
  ```
- **ACCESSIBILITY:** each part is `<section aria-labelledby>` + `h2`; `evidenceClass` is shown as text + stroke (not colour alone).
- **TEST PLAN:**
  - GIVEN a MATCH_ANALYSIS fixture with an empty `counterevidence` array · EXPECT a build/schema error.
  - GIVEN a rendered page · EXPECT the h2 order: İddia, Kanıt, Mekanizma, Bağlam, Karşı kanıt, Hüküm.
  - GIVEN the title/OG description · EXPECT them not to exceed the claim ceiling (manual editorial check; the test only verifies `og:description == description`).
- **ACCEPTANCE:** a real match analysis (accepted output from HPA→HPFA→HIO→YELL) renders with this template. **0 EMIT is valid**, so an empty surface is not an error.
- **RISK:** the template can't be validated without a real match analysis → wait for content; one fixture is enough for the template test.
- **ROLLBACK:** without `argument`, the page falls back to the existing prose template.

---

## P3-10 · Research apparatus: footnotes, references, backmatter parts

- **CURRENT PROBLEM:** `/research` is empty; there's no reference/note/limitation infrastructure.
- **DONOR / SOURCE:** **native Astro GFM footnotes** (verified, zero dependency); MyST `Backmatter.tsx`, `Bibliography.tsx` (D10, PATTERN_ONLY); Tufte sidenotes (D04, Phase B).
- **VERIFIED OUTPUT:** `@astrojs/markdown-remark` + `remarkRehype: { footnoteLabel: 'Notlar', footnoteBackLabel: i => 'Metne dön ' + (i+1) }` →
  `<sup><a href="#user-content-fn-x" data-footnote-ref aria-describedby="footnote-label">1</a></sup>` + `<section data-footnotes class="footnotes"><h2 class="sr-only" id="footnote-label">Notlar</h2>…`.
  **Two traps:** (a) HP has no `.sr-only` class (only `.visually-hidden`), so the heading would show up unstyled; (b) `footnote-label` appears in `metadata.headings`, so any TOC must filter it.
- **PROPOSED FILES:**
  - `astro.config.mjs`: `markdown: { remarkRehype: { footnoteLabel: 'Notlar', footnoteBackLabel: … } }`
  - `global.css`: `.sr-only` (alias of `.visually-hidden`) + `.footnotes` styles (smaller size, ≥12px).
  - `PROPOSED: src/components/References.astro`: frontmatter `references: [{id, author, year, title, url?, doi?, note?}]` → `<section id="kaynaklar"><ol>` with `id="ref-<id>"` per item; >15 items → `<details>` (no JS).
  - `PROPOSED: src/components/Backmatter.astro`: `part ∈ {method, limitations, dataAvailability, related}`; **returns nothing if empty** (MyST mechanism = empty-surface rule).
  - `research` collection schema: `question, method, sample?, limitations: string[].min(1), dataAvailability?, references[], related?: reference('research')[]`.
- **TEST PLAN:**
  - GIVEN markdown `[^a]` · WHEN rendered · EXPECT `#footnote-label` text "Notlar" and the back-link aria-label "Metne dön 1".
  - GIVEN the TOC heading list · EXPECT `footnote-label` excluded.
  - GIVEN a research object without `limitations` · EXPECT a schema error (a methodology without limitations can't be published).
  - GIVEN 20 references · EXPECT the first 15 visible and the rest inside `<details>`.
- **ACCEPTANCE:** at least 1 real research object (otherwise the surface stays hidden).
- **RISK:** sidenotes (Phase B) are complex on mobile → Phase B only when a long document exists.
- **ROLLBACK:** remove the components; markdown footnotes keep working.

---

## P3-11 · Scouting dossier: editorial + structured evidence, no radar

- **CURRENT PROBLEM:** `/scouting` has only a framework page; there's no player dossier structure.
- **DONOR / SOURCE:** GOV.UK summary-list (D03, PATTERN_ONLY; the `<dl>` key/value pattern); ledger Class D (SCOUTING_DECISION); the user's scouting question ("Bu transfer kararını ben vermiş olsaydım…"). **Negative control:** radar/pizza (D09 file names; S02 literature).
- **MECHANISM:** facts (`<dl>`), decision dimensions (9) with an explicit **UNKNOWN** state, risk + counterevidence, and a decision sentence tied to the claim ceiling.
- **PROPOSED FILES:** `PROPOSED: src/components/ScoutingDossier.astro`, `PROPOSED: src/lib/scouting.mjs` (dimension status vocabulary: `STRENGTH | NEUTRAL | RISK | UNKNOWN`). P1-05 Class D: `player, roleContext, sampleScope {competition, minutes, matches}, transferabilityCaveat, dimensions: [{key, status, note}], risks: min1, counterevidence: min1`.
- **VISUAL:** for comparisons, a **dot/strip plot** (shared axis, denominator and sample visible in a label). Radar/pizza is **REJECTED** as the primary comparison visual (shape depends on axis order; S02).
- **ACCESSIBILITY:** status as text + stroke pattern; UNKNOWN is never shown as "0".
- **TEST PLAN:**
  - GIVEN a dimension with `status: UNKNOWN` · EXPECT the rendered text "UNKNOWN / Bilinmiyor" and **no** "0" or empty bar.
  - GIVEN `sampleScope.minutes` missing · EXPECT a schema error.
  - GIVEN a narrow sample (≤ 2 matches) · EXPECT a "Dar örneklem" warning shown automatically (the hard block: "1–2 match repetition → stable trait" can't happen).
- **ACCEPTANCE:** the template renders with one fixture; the real surface stays hidden until real content exists.
- **ROLLBACK:** remove the component.

---

## P4-12 · `/visual` route + Figure/provenance footer

- **CURRENT PROBLEM:** Task 03: the canonical route is `/visual`, but the code has `/visual-lab`. Figures have no standard source/class/ceiling line.
- **DONOR / SOURCE:** OWID chart footer **concept** (D13, PROPRIETARY: public behaviour only, no code), Guardian `Caption.tsx`/`Figure.tsx` (D11, file names; mechanism: figure + caption as one semantic unit).
- **PROPOSED FILES:** `src/pages/visual-lab.astro` → `PROPOSED: src/pages/visual.astro`; `astro.config.mjs` `redirects: { '/visual-lab': '/visual' }` (301); `site-surfaces.mjs` href; `PROPOSED: src/components/Figure.astro` (props: `visualClass` (8 classes in content.config), `caption`, `source`, `sourceUrl?`, `claimCeiling`, `alt`), footer line "Kaynak · Görsel sınıfı · Kanıt tavanı".
- **TEST PLAN:** GIVEN `/visual-lab` · EXPECT a 301 to `/visual` · GIVEN a Figure without `source` · EXPECT a build error (except EDITORIAL_ILLUSTRATION, which must say "illüstrasyon, kanıt değil").
- **ROLLBACK:** remove the redirect.

## P4-13 · Search UX (after P0-03)
Section/class facets (URL params `?q=&s=analysis`), `<mark>` highlighting of query terms (built with `textContent`), result-count status. Dependencies: none.

## P4-14 · Archive taxonomy
`domain` / `construct` fields (AppDeploy's two-level label). Tag pages are generated **only for tags with ≥2 public items** (no thin pages; empty-surface rule). Pattern: AstroPaper `src/pages/tags/[tag]/[...page].astro` (D02, PATTERN_ONLY).

## P5-15 · Polish (open later)
Starlight TOC observer (long documents only), Tufte sidenotes (Phase B), hover citation popover (JS enhancement), OG image generation (satori: heavy dependency → evaluate separately), motion (line reveal; reduced-motion compatible).

---

## Next 3 packets for Claude Code

1. **P0-02: purge the removed provider + exclusion test.** Small, decided, implementable today. Without it, merging PR #2 breaks a user decision.
2. **P0-03: static-first policy + static search index + read-only deployment-shape check.** Makes both acceptance pipelines (CI + phone static QA) produce the same HTML; reduces the production Worker uncertainty to a concrete measurement.
3. **P1-05: content model (article class + publicationStatus + blog collection).** Foundation for every later surface packet (blog, analysis, research, scouting).

**Precondition (not code):** P0-01, push the phone Packet 01 to GitHub as a separate branch, plus the owner's choice of base line. Without it, packets 1–3 should be implemented on the line the owner picks; implementing on both lines means duplicate work.
