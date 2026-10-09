# EDITORIAL_AND_BRAND_ASSET_INVENTORY — HPWEB-UNIFIED-TREE-20261009-001

Candidate: `77e2387896da24621dde5eea13836eb87f83f550`. No asset was redrawn, replaced or invented.

## 1. Brand / identity (in candidate)

| Asset | Blob | Last change | Status |
|---|---|---|---|
| `src/components/Logo.astro` (HP mark + wordmark) | `61c4852` | 5e0d82b (release-pack) | Unchanged in this task. Design contract: "v1 proposal pending owner approval" |
| `public/favicon.svg`, `public/icons/hp-192.png`, `hp-512.png` | `1ac6bc3`, `09b6b77`, `4109792` | d4f8ad5 | Unchanged |
| Colour/type tokens `src/styles/global.css :root` (black/gold) | — | — | Unchanged; new guard test: every `var(--x)` is declared |
| Header responsive rules ≤900 / ≤560 / ≤420 px | — | 14cc946 (preview) + 77e2387 | One-row header; spacing subset added to stay inside 320px |
| `BRAND_PRODUCT_DELTA_01.md` (repo root) | `345c7e4` | 14cc946 | Brand review log, status CANDIDATE/REVIEW, BRAND READY: NOT YET |
| Brand candidate "featured evidence object" (phone 9e7109f) | 4 blobs | — | **HOLD**, preserved (`preserved/brand_delta_9e7109f.patch`, branch `source/phone-brand-delta-9e7109f`) |
| 420px identity size reductions (`.hp-mark` 32px, `.brand b` 12px) | — | — | **HOLD**, visual decision |

Not found in any HPAnalytic source (git, phone HPA trees, Drive package): teaser, "Animatrix" asset, logo source files beyond `Logo.astro`. "Caravaggio / Leonardo / Tesla" exists only as written direction in `docs/HP_FOOTBALL_DESIGN_CONTRACT_V1.md` and `docs/HP_SITE_RESEARCH_2026-10-04.md`. Phone `~/YELL_BRAND_LAB` is a different brand (YELL by SportsBase) — out of scope, untouched.

## 2. Tactical / visual graphics

| Asset | Used on built pages | Claim boundary |
|---|---|---|
| `TacticalCanvas.astro` (HP / 2D-01) | home, visual-lab | "ŞEMATİK AÇIKLAMA · tracking verisi değildir" (rendered) |
| `TacticalSequence.astro`, `KnowledgePath.astro`, `KnowledgeRelations.astro`, `ArticleEvidenceBlock.astro`, `EvidenceInterpretation.astro`, `IntentDiscovery.astro` | none (parked) | from legacy_wip via preview; typed in 81ab4ff |
| `public/visuals/event-data/{evidence-surfaces,measurement-chain,analyst-shadow}.svg` | article `event-only-boundary` | conceptual, labelled |
| `public/visuals/launch-series-01/{baski-baglamlari,kamera-kanit-siniri,karsi-pres-bes-saniye}.svg` | none (articles not admitted) | tied to Launch Series inbox items |

## 3. Editorial content

| Item | State | Public? |
|---|---|---|
| `content/articles/event-only-boundary.md` | PUBLISHED, HUMAN_APPROVED, sourceClaimsValidated=true, 3 sourceRefs REFERENCE_ONLY | **Yes** (only public article) |
| `content/articles/{futbol-nedir,position-role,production-consequence}.md` | no editorial_status / approval fields | No (fail-closed) |
| `editorial/inbox/article--09f39215f996.json` "Kamera bize neyi göstermiyor?" | ARTICLE_REVIEW_READY, publish_allowed=false | No |
| `editorial/inbox/article--28ac3467e7c2.json` "“Baskı altında” ne demek?" | same | No |
| `editorial/inbox/article--715d74e99a1c.json` "Beş saniyede topu geri kazanmak…" | same | No |
| `editorial/qa/council/*`, `editorial/qa/psychology/*`, `editorial/governance/HP_EDITORIAL_COUNCIL_100.md` | QA records | No |
| `docs/editorial-candidates/{futbol-nedir-v2,position-role-v2,production-consequence-v2,relative-age-effect}-CANDIDATE.md` (from phone) | CANDIDATE / REVIEW_REQUIRED / PUBLICATION=BLOCKED | No (docs only; verified not built as routes) |
| Phone `HPANALYTIC_LOCAL_STATE/editorial/inbox/*.json` (2: shots/xG, claim withdrawal) | ARTICLE_REVIEW_READY, publish_allowed=false | No; **not imported** (HOLD) |
| legacy_wip `relations:` frontmatter on 4 articles | editorial linking decision | **HOLD**, not merged |

## 4. Rights and claims

- No new image, text, data or third-party asset was added.
- `relative-age-effect-CANDIDATE.md` cites CIES 2021 figures with an explicit claim ceiling; it is a document, not published content.
- Match Centre provider scope: football-data.org codes PL, PD, SA, BL1, FL1, CL. Süper Lig is **not** covered; UI shows only covered labels.
