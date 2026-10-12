# QA_RESULTS — HPWEB-UNIFIED-TREE-20261009-001

Subject: commit `77e2387896da24621dde5eea13836eb87f83f550`, tree `b0d8fda4b0d634323becad03d9e9b0e556575d98`,
clean detached worktree (0 dirty lines). Environment: Linux x86_64 (cloud container), Node v22.22.0, npm 10.9.4,
`package-lock.json` sha256 `94d98097…0f60`. `HPA_FOOTBALL_DATA_TOKEN` and `HP_STUDIO` unset (production-equivalent).
Run: 2026-10-09T14:56Z. Logs: `qa/` (exit codes in `qa/exit-codes.txt`).

| # | Check | Command | Exit | Result |
|---|---|---|---|---|
| 01 | Dependency integrity | `npm ci --no-audit --no-fund` | 0 | 310 packages from lockfile |
| 02 | Dependency tree | `npm ls --all` | 0 | no missing/invalid |
| 03 | Unit tests | `npm test` | 0 | **292 / 292 pass** |
| 04 | Astro diagnostics | `npm run check` | 0 | 0 errors, 0 warnings |
| 05 | Production build | `npm run build` | 0 | complete |
| 06 | Worker config | `wrangler@4.146.0 deploy --dry-run` | 0 | 700.44 KiB; binding `ASSETS` only |
| 07 | Private surface leak | grep Studio/control strings in `dist/` | — | 0 matches |
| 09 | Browser (Chromium, Playwright) | `qa-browser.mjs` on `astro preview` | — | 7 pages × 320/375/430/1366 = 28 views, **0 issues** |
| 10 | Images | size + `<img>` attribute audit | 0 | all ≤7 KB; 3 article SVGs lack width/height/loading (P3) |
| 11 | Secrets | regex scan of tracked files + `dist/` | 0 | no matches; no `.env` tracked |
| 12 | Editorial provenance | frontmatter + dist scan | 0 | 1 public article (HUMAN_APPROVED, 3 refs); candidates/inbox not public |

## Browser details (09)

Per view: HTTP status, single `h1`, horizontal overflow, broken images, `alt`, unnamed controls (outside closed `<details>`), header tap targets ≥44px, console errors, failed requests.

- Pages: `/`, `/about`, `/search`, `/archive`, `/articles/event-only-boundary`, `/research`, `/scouting`.
- Mobile menu (320/375/430): opens (`aria-expanded=true`), items HİKMET, ARŞİV, Escape closes and returns focus to the trigger.
- Search: `veri` → 1 result, `olay` → 1, `zzzznomatch` → 0; query pages `noindex`.
- API/claim boundaries: `/api/youtube.json` 503 (not configured, fail-closed), `/control/content` 404, `/articles/position-role` 404 (not admitted), sitemap 200, robots 200; Match Centre hidden without a source.
- External links (3, in closed source drawer): statsbomb blogarchive PDF, skillcorner, st-andrews — **not fetched** (egress blocked in this container) → UNVERIFIED.
- Screenshots: 31 PNG (28 views + 3 menu-open), sha256 list `qa/screenshots.sha256`; files in the delivered archive, not committed.

## Regression found and fixed during QA

| Found on | Defect | Fix | Re-test |
|---|---|---|---|
| 7bd24e9 | `astro check` 7 errors (untyped legacy_wip components) | 81ab4ff Props types | 0 errors |
| 81ab4ff | 5px horizontal overflow at 320px on every page (MENU trigger; header nowrap from preview without brand spacing) — absent on 14ca0d1 | 77e2387 spacing subset of brand_delta | 0 overflow at 320/375/430 |
| merge | `repo-health` test FAIL on Linux (`node_modules` must be absent/symlink) | 7bd24e9 check git-ignore instead | PASS |

## Not verified here (do not read as PASS)

- Live `hpanalytic.com` / `www.hpanalytic.com` (egress blocked).
- GitHub Actions Linux Acceptance on this commit (not pushed).
- Physical Android Chrome, 200% text zoom, landscape, screen reader.
- Automated contrast/axe audit (no axe in environment; colour-token contrast is covered by existing `design-tokens.test.mjs`).
- Termux/aarch64 build (Android native bindings) — not a Linux production signal either way.
