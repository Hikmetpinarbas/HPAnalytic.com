# HANDOFF_TO_COORDINATOR — HPWEB-UNIFIED-TREE-20261009-001

TO: ChatGPT HPAnalytic Main Coordinator · FROM: Claude Code (cloud session) · DATE: 2026-10-09
STATUS: **REVIEW_REQUIRED** — one reproducible, tested integration candidate; not released.
AUTOPUBLISH=OFF · HUMAN_APPROVED=false · no push · no merge · no deploy.

## 1. Identity

| Item | Value |
|---|---|
| Repository | Hikmetpinarbas/HPAnalytic.com |
| Branch (local) | `integration/hpanalytic-unified-20261009` |
| Code commit (QA subject) | `77e2387896da24621dde5eea13836eb87f83f550` (tree `b0d8fda4…`) |
| Branch head | evidence-only commit on top of `77e2387` (adds `hpfootball-site/docs/unified-20261009/**` only) |
| Base | `59b9b85` (remote) → `14ca0d1` (CC-01, bit-exact from Drive) |
| Production | `ddb0ed7` (untouched) |
| Worktree | cloud container `/root/HPA_SITE_DEV/UNIFIED_20261009` (ephemeral) |

## 2. What the candidate contains

- Everything in production, release-pack-01, P0 repair and CC-01.
- The phone `integration-preview` work (58 files, verified): Hikmet spotlight, discovery directory, evidence/knowledge components, brand mobile hierarchy, editorial candidate docs, governance files (README, CONTRIBUTING, SECURITY, PR template, .editorconfig, .gitattributes, .nvmrc), repo-health/observer scripts and their tests.
- brand_css undefined-CSS-variable guard test.
- Three integration fixes: Linux-safe repo-health, typed parked components, 320px header overflow.

## 3. Decisions taken (evidence-based) vs. left open

Taken: keep `resolveNextQuestion` over the duplicate `safeNextQuestion`; gate discovery links by the navigation rule; keep CC-01 Match Centre/CTA; keep production canonical host.
Open (HOLD): www vs apex (B1), brand candidate 9e7109f (B5), article relations (B6), editorial admissions (B7), discovery copy (B8). See `OPEN_BLOCKERS.md`.

## 4. Independent QA (Cloud Shell / Manus)

```bash
git clone -b integration/hpanalytic-unified-20261009 hpanalytic-unified-20261009.bundle hpa && cd hpa
git log --oneline -1 77e2387                         # must exist
git diff --stat 77e2387 HEAD                         # docs/unified-20261009 only
cd hpfootball-site && npm ci && npm test && npm run check && npm run build
npx --yes wrangler@4.146.0 deploy --dry-run --config dist/server/wrangler.json   # bindings: ASSETS
bash ../../linux-qa.sh "$PWD"                         # expect: == PASS (no deploy performed)
```
Then browser: 320/375/430 px no horizontal scroll; menu opens/closes; `/api/youtube.json` 503; `/control/content` 404.

## 5. Release readiness

**REVIEW_REQUIRED.** Code checks PASS on the exact candidate; release needs B1–B4 (domain decision, push/CI, live checks) and an explicit human approval. Editorial HOLD items do not block a code release because they are not included.

## 6. Short card (for OMBUDSMAN)

```
TASK: HPWEB-UNIFIED-TREE-20261009-001 — unified source candidate
SHA: integration/hpanalytic-unified-20261009 code 77e2387 (base 59b9b85 → CC-01 14ca0d1 bit-exact)
MERGED: phone integration-preview 58/58 verified + 3 integration fixes; legacy/brand/editorial extras on HOLD
QA: npm ci/ls/test 292/292/check 0/build/wrangler dry-run all exit 0; Chromium 28 views 0 issues
LIMITS: not pushed, no CI run, live site unreachable; www-vs-apex undecided
NEXT: owner decides B1/B2; Manus runs linux-qa.sh from bundle; HUMAN_APPROVED=false
```
