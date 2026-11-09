# HPAnalytic.com — Claude Code handoff — 2026-10-16

## Mission and priority
ONLY HPAnalytic website V1 launch/release. Do not work on Studio, Colab, AI ads, phone cleanup or unrelated work. Continue from the existing work, not from scratch. User wants actual execution, short factual reports, no endless planning.

## Working copy and ownership
Termux authorized integration tree:
`~/HPA_SITE_DEV/operator-comms/state/release_candidate_1a9ecf9/hpfootball-site`
Base commit: `1a9ecf92b78d6d609ca4de3e82211495838252cd`.
**DIRTY, PRESERVE ALL CHANGES. NEVER reset, clean, checkout another branch, bulk-merge or overwrite.** Do not create another branch/worktree. Do not commit/push/merge/deploy without explicit user authorization. The old tree `~/HPA_SITE_DEV/HP-PROJELERI/hpfootball-site` has 47 dirty files; DO NOT TOUCH.

Current changed files:
- `src/components/Logo.astro`
- `src/components/MobileNavigation.astro`
- `src/pages/articles/[...id].astro`
- `src/styles/global.css`
- `tests/mobile-navigation.test.mjs`
- new `tests/a11y-defects.test.mjs`

PR #35 a11y changes selectively integrated from HEAD ef85dd9fe7a991afa8b64b0511fc5ff483ef1992. CSS mobile nav position/panel width, article source contrast and other contrast improvements integrated locally. All 311 node tests PASS (latest `~/hpa-final-consolidation-tests.log`), `git diff --check` PASS. PR #35 Linux Acceptance GitHub Actions run 38889056171 SUCCESS, but it did NOT include the local uncommitted CSS changes. PR #34 has 175 files and different base: DO NOT bulk merge.

## Verified runtime
`https://hpanalytic.com` and `https://www.hpanalytic.com` HTTP 200, and `/about`, `/analysis`, `/research`, `/scouting`, `/archive`, `/articles/event-only-boundary` HTTP 200. LIVE is an existing deployed version, not necessarily current candidate. Cloudflare hpfootball Worker v10 was deployed 2026-10-15; git SHA ↔ live version mapping not proven. No deployment authorized yet.

Termux `npm run check` / `npm run build` blocked by missing `astro` dependency in Termux node_modules, exit 127 (environment, not source failure). UserLAnd Ubuntu `/home/userland/hpa-release-1a9ecf9` has `node_modules/.bin/astro`, previous `npm run check` 163 files 0 errors/warnings, 108 hints, tests pass; production build previously crashed due proot/TCMalloc MmapAligned/EPIPE (environment). UserLAnd Ubuntu is an **older copy**, not yet synced with the uncommitted Termux changes. Do not mistake its build for candidate verification.

## Next actionable work in strict order
1. Preserve current Termux diff; make a lossless backup patch incl. untracked new test, or otherwise securely transfer only the six changed files to an isolated temporary Linux verification copy, NOT another git worktree/branch and NOT overwrite canonical changes.
2. Run full Astro check, node tests and production build in suitable Linux environment; if proot crashes, use GitHub Actions via authorized non-production verification path, with explicit approval for any commit/push.
3. Browser visual acceptance mobile 320/375/390 and desktop 1280/1440; keyboard nav, contrast, zoom 200%, screenshots, no regression.
4. Verify live Cloudflare domain route, release SHA/version mapping, and rollback readiness. Request explicit approval before production release.
5. Editorial: Pilot 01 READY_FOR_HUMAN_REVIEW, Pilot 02 REVIEW_REQUIRED N=2; no HUMAN_APPROVED/PUBLISHED status or auto-publishing. Do not publish questionable 83.6% cross claim or Ispirlidis 2025 numbers. EVENT LOCATION != TRACKING.

## Agent access
Claude Code v2.1.296 installed in UserLAnd but `claude auth status` currently `loggedIn:false`; user must authenticate before live execution. OpenCode service on UserLAnd 127.0.0.1:4096 responds 200 but no registered provider credentials. Do not claim an agent executed without evidence.

## Output contract
Report exact actions and commands, tests, observed SHA, blocked gates, NEXT single task. Do not claim production release or acceptance without evidence. `/nofluff`.
