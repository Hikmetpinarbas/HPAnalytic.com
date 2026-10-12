# HPAnalytic.com — repository entrypoint

Private Astro + Cloudflare website. The runnable package is in `hpfootball-site/`; do not move it solely to imitate a monorepo.

## Local checks

Use Node 22 on a supported Linux machine:

```sh
cd hpfootball-site
npm ci --no-audit --no-fund
npm test
npm run check
npm run build
npm run repo:health
```

Cloudflare `workerd` is not supported on Android ARM64 Termux. Local Termux unit tests are useful but cannot replace Linux CI or browser QA. The CI workflow at `.github/workflows/hp-football-linux-acceptance.yml` is the non-deployment acceptance gate.

## Authority and safety

The website repository is the source for code, tests and version history. The canonical Google Drive operations ledger holds task, evidence, decision and handoff records. See `docs/REPOSITORY_GOVERNANCE.md` before touching dirty worktrees. No deployment or publication without explicit authorization and E08 review. The deployment workflow is **not** a general QA runner.

## Structure

- `hpfootball-site/src/`: Astro pages, components, styles, content schemas and runtime logic.
- `hpfootball-site/tests/`: source/contract tests; browser tests run through the Linux acceptance workflow.
- `hpfootball-site/scripts/`: stage/publish utilities and reproducible checks.
- `hpfootball-site/editorial/`: editorial inputs and review metadata; not automatically public.
- `hpfootball-site/docs/`: product, design, evidence and operations references.
- `.github/workflows/`: isolated acceptance and separately guarded production deployment.

See `CONTRIBUTING.md` for the change process.
