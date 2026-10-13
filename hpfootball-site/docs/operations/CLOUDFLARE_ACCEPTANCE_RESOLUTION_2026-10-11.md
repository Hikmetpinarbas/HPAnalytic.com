# Cloudflare build resolution — 2026-10-11

## Verified
- Local Termux tests: 247/247 pass; `node scripts/cloudflare-preflight.mjs`: PASS.
- Termux Android `workerd` is unsupported; Ubuntu PRoot workerd memory mapping fails. These are runtime limitations, not proven site defects.
- Authoritative repository `Hikmetpinarbas/HPAnalytic.com` contains `.github/workflows/hp-football-linux-acceptance.yml` at the repository root. It runs `hpfootball-site` on Ubuntu with Node 22, `npm ci`, tests, Astro check, production build, private Studio exclusion and `wrangler deploy --dry-run`.
- GitHub Actions run 38044301554 on 2026-10-10 concluded SUCCESS including production build, browser QA and Cloudflare dry run. That run validates its own PR commit, **not** this phone's uncommitted 2026-10-11 working tree.

## Safe continuation
1. Preserve 25 current candidate working-tree changes; do not overwrite, force checkout, or discard.
2. Do not commit, push, open PR, merge or deploy without HUMAN_APPROVED.
3. Once approved, submit the complete candidate under root `hpfootball-site/` through a review branch and run the **existing root Linux acceptance workflow**; do not treat the nested candidate `.github/workflows/` as a runnable GitHub Actions workflow.
4. Require green checks and reviewed visual QA before production deployment; keep AUTOPUBLISH OFF.

## Decision
Use the existing verified GitHub Linux runner; no more heavy phone/PRoot builds. Local candidate remains REVIEW_REQUIRED pending Linux run.
