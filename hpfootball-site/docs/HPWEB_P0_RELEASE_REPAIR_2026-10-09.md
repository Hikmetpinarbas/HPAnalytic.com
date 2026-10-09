---
title: HPWEB — P0 Release Repair
version: 1.0
date: 2026-10-09
operator: Claude Code (cloud session)
branch: ccr-35db03bc-gb996o
base: release-pack-01-candidate @ 9ecb912
production: site-hp-standard-v2 @ ddb0ed7 (unchanged by this work)
autopublish: OFF
cost: 0 TRY (no paid API, no new dependency, no deploy)
---

# HPWEB — P0 Release Repair (2026-10-09)

## 1. Executive summary

Release Pack 01 (`release-pack-01-candidate`) was green in CI, but a browser crawl of
the production build found two server errors on public routes, one internal editorial
surface reachable on the public site, one broken link from a published article and one
unnamed control on mobile. All five are fixed on `ccr-35db03bc-gb996o` as six small
commits on top of the candidate. Tests 235 → 245, all passing; `astro check` 0 errors;
build and `wrangler deploy --dry-run` pass. **Nothing was deployed.** Production is still
`ddb0ed7`.

The branch is a release candidate for independent QA, not an approved release. Merging
into `site-hp-standard-v2` deploys automatically (see §6) and needs a human decision.

## 2. Starting state (verified, not assumed)

| Item | State on 2026-10-09 |
|---|---|
| Default / production branch | `site-hp-standard-v2` @ `ddb0ed7` — push triggers `HPAnalytic Production Deploy` |
| Last production deploy | run #12, `ddb0ed7`, success (2026-10-07) |
| Release candidate | `release-pack-01-candidate` @ `9ecb912`, +27 commits over production, Linux Acceptance run #40 **success** |
| Parallel line | `ccr-88842542-k09nnx` @ `fe3bfca`, +2 commits (header search a11y) on production base — **ported here** |
| Open PRs | #10 `hpanalytic-build-handoff` (1 ahead / 7 behind production, stale) |
| Working tree | clean; designated branch had no unique commits (equal to production) |
| Phone source `~/HPA_SITE_DEV/HP-PROJELERI` | **UNKNOWN** — not reachable from this cloud container; not inspected, not touched |

Single active line decision: the candidate already contains all production commits, so
the repair line is built on it rather than on production. `ccr-88842542-k09nnx` is
folded in so there is one line to QA.

## 3. Findings and fixes (priority order)

| # | Sev | Finding (evidence) | Root cause | Fix (commit) |
|---|---|---|---|---|
| 1 | P0 | `/control/content` → **500** (`TypeError: Invalid URL string`). Internal page: rights, truth, approval state; reads `/storage/emulated/0/...` and `~/PHONE_AUTOMATION` | Local-only editorial surface shipped as a public SSR route; `article-inbox.mjs` evaluates `new URL(import.meta.url)` at module load inside the Worker | Production answers **404** before any loader is evaluated; loaders are dynamic imports after the guard; dev view unchanged. Internal strings no longer present in `dist/`. (`e82e750`) |
| 2 | P0 | `/api/youtube.json` → **500** on every request (`Astro.locals.runtime.env has been removed in Astro v6`) | Endpoint written for the old adapter API | Read env from `cloudflare:workers`; **503** when key missing (contract in `IMPLEMENTATION_PACKETS_B2`), **502** when upstream unreachable. (`7f15fe6`) |
| 3 | P1 | Published `event-only-boundary` links "Sıradaki soru" to `/articles/position-role` → **404** | Target article is not admitted to the public site | `resolveNextQuestion()`: an article link renders only if the target article is public; the question text stays. **Article content not edited.** (`a382b04`) |
| 4 | P1 | Header search link has **no accessible name** at ≤420px | Visible label `display:none` | Ported from `ccr-88842542-k09nnx`: label visually hidden instead; name = visible text (`ARA`), WCAG 2.5.3. (`2cccfd4`, `4f14929`) |
| 5 | P2 | Generated `wrangler.json` binds `SESSION` KV + `IMAGES` though the code uses neither | `session:false` was passed to the adapter (ignored); default image service is `cloudflare-binding` | `session:false` moved to Astro config, `imageService:'passthrough'`. Worker now binds only `ASSETS`; upload 746.7 → 698.6 KiB. (`92912f1`) |

Each fix has a regression test that fails on the old code:
`control-surface-local-only`, `youtube-endpoint-contract`, `next-question` (+1 case),
`search-link-accessible-name`, `worker-bindings`.

### Checked and not a defect
- Article source links reported "unnamed" by the crawler: they sit inside a closed
  `<details>` (progressive disclosure, `ddb0ed7`); names are present once opened. False positive.
- `/sitemap-index.xml` 37px overflow at 390px: Chromium's XML viewer, not a site page.
- Build warnings `collection "research"/"visuals" does not exist or is empty`: pre-existing,
  non-blocking; left for a later pass (P3).

## 4. Verification evidence (local, Node 22.22.0, locked `npm ci`)

| Check | Result |
|---|---|
| `npm test` | **245 / 245 pass** (baseline 235) |
| `npm run check` | 0 errors, 0 warnings (hints only) |
| `npm run build` | Complete |
| Studio leak grep (CI step) | no match |
| Control leak grep (`HP CONTENT CONTROL`, `storage/emulated`) in `dist/` | no match |
| `wrangler@4.146.0 deploy --dry-run` | pass; bindings: `ASSETS` only |
| Playwright crawl, 390 + 1366 px, all internal links | all public pages 200, 1×`h1`, 0 horizontal overflow, 0 console errors; `/control/content` 404, `/api/youtube.json` 503 (intended) |

Not verified here: live `https://hpanalytic.com` (egress to the domain is blocked by this
container's network policy). Live checks belong to Manus QA.

## 5. Editorial boundary

- No article body, frontmatter, source, rights or claim-ceiling value was changed.
- Fix #3 is a rendering rule, not an editorial decision. **Open for Hikmet:** publish
  `position-role` (after source/rights/human approval) so the link returns, or keep the
  question without a link (current behaviour).
- The internal control surface is now unreachable in production; human approval
  remains the only path to admission. `AUTOPUBLISH=OFF` preserved.

## 6. Release path (human decision required)

`site-hp-standard-v2` auto-deploys on push. Recommended path:
1. Manus QA on `ccr-35db03bc-gb996o` @ the commit in §7 (or a PR into
   `release-pack-01-candidate` to run Linux Acceptance on it).
2. If QA passes, Hikmet opens/merges the PR into `site-hp-standard-v2` → existing
   workflow tests, builds and deploys. No manual Wrangler deploy.
3. Post-deploy: re-run the §7 live checks against production.

Rollback: revert the merge on `site-hp-standard-v2` (redeploys `ddb0ed7` state).
After fix #5, the old `SESSION` KV namespace stays in Cloudflare unbound; delete it only
by hand, if at all (no automated deletion).

PR #10 (`hpanalytic-build-handoff`) is stale (7 behind production) — recommend closing
it after review; not touched here.

## 7. Manus QA handoff

- Repo / branch: `Hikmetpinarbas/HPAnalytic.com` / `ccr-35db03bc-gb996o`
- Commit: see the head of the branch; the fix series is `e82e750..92912f1` plus this
  document's commit. Diff vs candidate: `git diff 9ecb912..HEAD`.
- Commands (in `hpfootball-site/`): `npm ci && npm test && npm run check && npm run build && npx --yes wrangler@4.146.0 deploy --dry-run --config dist/server/wrangler.json`
- Expected: 245 pass; 0 errors; build complete; dry-run bindings = `ASSETS` only.
- Browser checks (preview, then production after deploy):
  1. `/control/content` → 404 page, no internal text.
  2. `/api/youtube.json` → 503 JSON `not_configured` (or 200 if a key is configured in Cloudflare).
  3. `/articles/event-only-boundary/` → "Sıradaki soru" shows the question, **no** link.
  4. 320/375/420 px: header search link AX name = `ARA`.
  5. All nav pages 200, no horizontal scroll at 390 px, no console errors.
- Out of scope for this QA: editorial quality of Launch Series content.

## 8. Tool availability (0 TRY constraint)

| Tool | Status |
|---|---|
| Claude Code | available (cloud session, v2.1.295) — existing subscription |
| GitHub Actions (Linux Acceptance) | available via `workflow_dispatch`; existing quota |
| gcloud CLI | installed, **no credentials** in this container |
| Google Cloud Shell on your account | **UNKNOWN** — cannot be verified from here; it is a free Google service, but quota/account state needs a check on your side |
| Cloudflare | not accessed; deploy only through the existing workflow |

## 9. OMBUDSMAN task card (6 lines)

```
GÖREV: HPWEB P0 release repair — QA onayı ve yayın kararı
DAL/COMMIT: ccr-35db03bc-gb996o (baz release-pack-01-candidate@9ecb912), prod ddb0ed7 dokunulmadı
DÜZELTİLEN: /control/content public 500→404, /api/youtube.json 500→503, kırık makale linki, mobil arama adı, gereksiz KV/IMAGES binding
KANIT: 245/245 test, check 0 hata, build+wrangler dry-run OK, Playwright tarama temiz; belge docs/HPWEB_P0_RELEASE_REPAIR_2026-10-09.md
SINIR: deploy yok, AUTOPUBLISH=OFF, içerik metni değişmedi, 0 TRY; canlı site bu ortamdan doğrulanamadı
KARAR BEKLEYEN: Manus QA → Hikmet merge onayı; position-role yayımlansın mı?
```
