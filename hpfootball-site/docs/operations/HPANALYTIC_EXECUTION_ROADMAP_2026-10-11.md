# HPAnalytic — execution roadmap (11 October 2026)

## Operating rules
- Preserve the current uncommitted candidate; do not overwrite, discard or reset.
- No commit/push/PR/merge/deploy without explicit HUMAN_APPROVED.
- No paid API calls, uncontrolled fan-out or secrets in logs. AUTOPUBLISH OFF.
- Keep the phone cool; heavy Cloudflare builds and browser QA run on the existing root GitHub Ubuntu acceptance workflow, not Android/PRoot.
- FOOTBALL FIRST. EVIDENCE BEFORE CONFIDENCE. MECHANISM BEFORE METRIC. CONTEXT BEFORE VERDICT.

## Gate 1 — Cloudflare acceptance (BLOCKED on review-branch approval)
1. Run local non-network preflight and 247+ unit tests.
2. Preserve a file-level candidate manifest, identify source-of-truth and compare with existing remote PRs.
3. On explicit approval, stage candidate in a separate review branch under root `hpfootball-site/`; run existing root `.github/workflows/hp-football-linux-acceptance.yml`.
4. Require Ubuntu `npm ci`, unit tests, `astro check`, Astro production build, browser/mobile QA, Studio isolation, Wrangler dry-run; review artifacts. No deployment.

## Gate 2 — Design and logo (LOCAL WORK ALLOWED)
- Audit monogram/wordmark alignment at mobile 375px and desktop 1440px; check small-size legibility and black/white contrast.
- Check navigation, keyboard focus, 200% text zoom, reduced motion and horizontal overflow with browser evidence after Gate 1.
- Keep visual language editorial and evidence-led; avoid football clichés and fabricated evidence.

## Gate 3 — Editorial factory (LOCAL WORK ALLOWED)
- Intake -> source provenance -> research -> draft -> fact/counterevidence check -> human review -> publish gate.
- Validate local-only Studio isolation and article stage/publish tests; reject unverified claims.
- No autonomous publication; explicit HUMAN_APPROVED required.

## Gate 4 — Teaser film pipeline (LOCAL DESIGN ALLOWED)
- Define 15s and 30s storyboard templates: mechanism, evidence, implication, HPAnalytic end card.
- Use approved/licensed media or original tactical animations; no fake match footage presented as evidence.
- Optimize phone usage: remote render when available; preserve lightweight exports.

## Gate 5 — Release (REQUIRES EXPLICIT APPROVAL)
- Consolidated QA dossier, accessibility checks, performance review, editorial sign-off, domain/Cloudflare secrets audit, rollback plan.
- Separate human approval for production deploy. AUTOPUBLISH remains OFF.

## Current evidence
- Candidate HEAD `9ecb912` and 24 uncommitted entries at roadmap creation.
- Existing GitHub Linux acceptance run `38044301554` passed on a different commit; candidate is NOT accepted yet.
- Local preflight previously passed; local tests 247/247 passed.
