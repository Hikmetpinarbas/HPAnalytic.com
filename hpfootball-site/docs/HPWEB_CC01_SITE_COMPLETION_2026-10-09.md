---
title: HPWEB CC-01 — HPAnalytic Site Completion (candidate)
version: 1.0
date: 2026-10-09
status: CANDIDATE — not approved for release
branch: ccr-35db03bc-gb996o (local commits, NOT pushed)
base: 59b9b85 (pushed P0 repair candidate) ← release-pack-01-candidate 9ecb912 ← production ddb0ed7
constraints: no deploy, no merge, no push, no deletion, no new design system, 0 TRY
---

# HPWEB CC-01 — Site Completion (candidate)

## 1. Source of truth

| Item | Value |
|---|---|
| Repo | `Hikmetpinarbas/HPAnalytic.com`, site in `hpfootball-site/` (Astro 7 + @astrojs/cloudflare 14) |
| Production | `site-hp-standard-v2` @ `ddb0ed7` (auto-deploys on push) |
| Last pushed candidate | `ccr-35db03bc-gb996o` @ `59b9b85` (P0 repair, see `HPWEB_P0_RELEASE_REPAIR_2026-10-09.md`) |
| This candidate | `ccr-35db03bc-gb996o` local head (commit carrying this file); fix series `51a9cce..481afab` |
| Other branches | `release-pack-01-candidate` 9ecb912 and `ccr-88842542-k09nnx` fe3bfca are fully contained; `hpanalytic-build-handoff` (PR #10) is a build artefact, 7 behind production, not used |
| Worktrees / dirty / stash | one worktree, clean, no stash — nothing to preserve beyond git |
| Phone source `~/HPA_SITE_DEV/HP-PROJELERI` | UNKNOWN — not reachable from the cloud session |

## 2. Audit scope and method

Production build served with `astro preview`; Playwright (Chromium) at 390 and 1366 px over
every page reachable from the header, footer and sitemap: HTTP status, `h1` count, horizontal
overflow, broken images, missing `alt`, unnamed controls, console errors; mobile menu opened
and closed with Escape; fold screenshots of every page. Components read: `Logo.astro`,
`BaseLayout.astro` (header, nav, footer), `MobileNavigation.astro`, `index.astro`,
`SectionListing.astro`, `football-data.mjs`, `site-surfaces.mjs`, sitemap.

### Design reference comparison (black/gold)
- **The black/gold reference images were not available in this session or in the repo.**
  A pixel-level comparison was therefore NOT done.
- What was compared: the shipped token system against the design contract. Palette is
  already black/gold (`--bg #050505`, `--gold #c89545`, `--gold-2 #f0c977`, focus gold),
  serif display + sans labels, no `text-transform` (contract A1). Screenshots show a
  consistent dark/gold hero, header and article surfaces.
- `Logo.astro` mark (frame + vector + break stroke) is the contract's "v1 proposal pending
  owner approval". **Not redrawn, not modified.** Owner approval remains open.

## 3. Findings

| # | Area | Finding | Severity | Action |
|---|---|---|---|---|
| 1 | Match Centre | Prerendered at build; CI never sets `HPA_FOOTBALL_DATA_TOKEN`, so production always showed "KAYNAK KULLANILAMIYOR" + "fikstür burada otomatik görünecek" (false: data only changes on rebuild) | P1 | Fixed (`51a9cce`) |
| 2 | Match Centre | Scope strip/copy claimed Süper Lig / "Türkiye"; provider codes are PL, PD, SA, BL1, FL1, CL only | P1 (claim > evidence) | Fixed (`51a9cce`) |
| 3 | Match Centre | No data time shown although rows are a build snapshot; raw English statuses (`TIMED`) | P2 | Fixed (`51a9cce`) |
| 4 | Discovery | Sitemap advertised `/analysis /research /scouting /culture /visual-lab` while navigation hides them (no admitted content) | P2 | Fixed (`7b81343`) |
| 5 | Empty states | Public copy printed the internal rule "Boş yüzey navigasyonda gösterilmez"; empty `/culture` indexable | P2 | Fixed (`fb43097`) |
| 6 | Home | Primary CTA "ANALİZLERİ KEŞFET" → `/analysis` with zero analysis articles | P2 | Fixed (`481afab`) |
| 7 | Navigation | Only one public article (`event-only-boundary`, section `method`) → header shows only HİKMET (+ARA); mobile menu HİKMET, ARŞİV | — | Correct per contract §3; **content gap, not a code bug** |
| 8 | Mobile nav | Button has `aria-expanded`/`aria-controls`, Escape closes, works without JS (contract) | — | OK |
| 9 | Articles / charts | Article SVG figures have alt text; no overflow at 390 px; source links inside closed `<details>` are named once opened | — | OK |
| 10 | Research / Scouting / Visual Lab | Method/approach pages with real copy; not linked from nav while empty of content objects | — | OK; mixed English labels (`FOOTBALL CULTURE`, `TACTICAL BOARD`, `Federation, club, provider…`) left: editorial voice decision |
| 11 | Build | `collection "research"/"visuals" does not exist` warning on every page | P3 | Open (harmless; define empty collections or drop the queries) |

## 4. Changes in this candidate

| Commit | Change | Files |
|---|---|---|
| `51a9cce` | Match Centre: hidden unless source READY; shows data time; covered competitions only; Turkish statuses | `src/lib/football-data.mjs`, `src/pages/index.astro`, tests |
| `7b81343` | Sitemap built from the navigation gating functions | `src/pages/sitemap-0.xml.ts`, test |
| `fb43097` | Reader-facing empty state; empty culture page `noindex` | `SectionListing.astro`, `culture.astro`, test |
| `481afab` | Home analysis CTA gated on a published analysis; featured story becomes primary | `src/pages/index.astro`, test |

No article content, frontmatter, source, rights, claim ceiling, logo, token or CSS was changed.
All changes are additive gating/copy; each commit reverts independently.

## 5. Test results

| Check | Result |
|---|---|
| `npm test` | **253 / 253 pass** (P0 candidate 245) |
| `npm run check` | 0 errors, 0 warnings |
| `npm run build` | complete |
| Studio / control leak greps | clean |
| `wrangler@4.146.0 deploy --dry-run` | pass, bindings `ASSETS` only, 701.5 KiB |
| Playwright crawl 390/1366 | all public pages 200, 1 `h1`, no overflow, no console errors |
| `linux-qa.sh` on a clean clone from the bundle @ `481afab` | **PASS** |
| `linux-qa.sh` on `59b9b85` (negative control) | **FAIL** as expected ("match centre shown without source") |

## 6. Open blockers (need a person, not code)

1. **Content:** one public article. Analysis / Scouting / Culture / Research / Visual Lab
   stay hidden until admitted content exists (`position-role` and `production-consequence`
   are `analysis` but not admitted).
2. **Design reference:** share the black/gold reference files into the repo (e.g.
   `docs/design-reference/`) to allow a real comparison; logo v1 needs owner approval.
3. **Match Centre data:** a real fixture list needs (a) `HPA_FOOTBALL_DATA_TOKEN` as a
   GitHub Actions secret passed to the build step, and (b) a scheduled rebuild or a
   server-rendered/client fetch — otherwise rows go stale between deploys. Süper Lig needs
   a second source; football-data.org codes do not cover it.
4. **Release:** candidate commits are local only (push forbidden by CC-01). Push of
   `ccr-35db03bc-gb996o` and any merge into `site-hp-standard-v2` (= deploy) are human
   decisions.
5. **Live site:** `hpanalytic.com` is not reachable from the cloud session; live checks
   belong to Manus / Cloud Shell.

## 7. Linux QA package (Cloud Shell)

Package `cc01-linux-qa/`:
- `hpanalytic-cc01.bundle` — git bundle: production, release-pack candidate, this branch
- `patches/` — `git format-patch` of the commits on top of `59b9b85`
- `linux-qa.sh` — read-only QA (never deploys)

```bash
git clone -b ccr-35db03bc-gb996o hpanalytic-cc01.bundle hpanalytic
cd hpanalytic && git log --oneline -1          # expect the head named in the hand-off
bash ../linux-qa.sh "$PWD/hpfootball-site" <head-sha>
# or, on an existing checkout of 59b9b85:
git am ../patches/*.patch
```
Requirements: Node ≥ 22, npm, network to the npm registry. No secrets needed.

## 8. Rollback plan

- Nothing is deployed or pushed; production `ddb0ed7` and remote branch `59b9b85` are untouched.
- Reject one change: `git revert <sha>` (each commit is independent).
- Reject the whole candidate without deleting anything: keep working from `59b9b85`
  (`git switch -c <new-branch> 59b9b85`); these commits remain in the bundle and patches.
- If later merged and deployed: `git revert` the merge on `site-hp-standard-v2`; the
  existing workflow redeploys the previous state. No data, KV or secret is created by
  this candidate.
