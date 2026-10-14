# HPAnalytic.com

Source repository for [hpanalytic.com](https://www.hpanalytic.com): an Astro site served by a Cloudflare Worker. The runnable package lives in `hpfootball-site/`; do not move it solely to imitate a monorepo.

> HPANALYTIC = EVIDENCE MADE VISIBLE. Football first; evidence before confidence; mechanism before metric; context before verdict.

## Local checks

Use Node 22 (see `hpfootball-site/.nvmrc`) on a supported Linux machine:

```sh
cd hpfootball-site
npm ci --no-audit --no-fund
npm test
npm run check
npm run build
```

Cloudflare `workerd` does not run on Android ARM64 (Termux or proot). Phone unit tests are useful but do not replace Linux CI or real browser QA. `.github/workflows/hp-football-linux-acceptance.yml` is the non-deploying acceptance gate.

## Release safety

- A push to `site-hp-standard-v2` **deploys to production** through `.github/workflows/hpanalytic-production-deploy.yml`. Never push there for testing.
- Publication, merge to the production branch and deployment each need explicit approval from Hikmet Pınarbaş.
- An article is public only when it is `PUBLISHED`, `HUMAN_APPROVED` and `sourceClaimsValidated: true`.

See `docs/REPOSITORY_GOVERNANCE.md` for branch roles and `CONTRIBUTING.md` for the change process.

## Structure

- `hpfootball-site/src/`: Astro pages, components, styles, content schemas and runtime logic.
- `hpfootball-site/tests/`: source and contract tests; browser tests run in the Linux acceptance workflow.
- `hpfootball-site/scripts/`: staging, publishing and reproducible QA utilities.
- `hpfootball-site/docs/`: product, design, evidence and operations references.
- `.github/workflows/`: Linux acceptance, nightly QA and the guarded production deployment.
