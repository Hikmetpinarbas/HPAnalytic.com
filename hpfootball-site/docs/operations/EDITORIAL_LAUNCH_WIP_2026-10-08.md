# Launch Editorial Corpus — WIP 01 / 2026-10-08
Status: CANDIDATE; no publication or deployment authorized.

## Verified physical inputs
- Existing Editorial Studio V1 at `docs/HPANALYTIC_EDITORIAL_STUDIO_V1.md`; private `/studio/editorial` is an existing candidate, not a missing feature. REUSE/REPAIR before new implementation.
- Four article files in `src/content/articles`; three short conceptual articles require depth review. `event-only-boundary.md` has PUBLISHED and HUMAN_APPROVED metadata, but live state was not checked in this session.
- Existing article stage CLI and intake contracts; never invoke `article:publish` without Hikmet's explicit approval.
- Untracked `tests/home-hikmet-spotlight.test.mjs` is untouched/HOLD.

## Current work product
- `docs/editorial-candidates/futbol-nedir-v2-CANDIDATE.md` full editorial candidate, not in public content route.
- `docs/operations/EDITORIAL_COMMAND_STUDIO_CANDIDATE.md` operational routing/automation/succession contract.

## Specialists as bounded inputs, not independent WIPs
Research: FIFA/UEFA/CIES reserve provenance and shortlist. Discovery: data/video grounded shortlist. Visual: concept diagram with no invented data. Independent QA: evidence/rights/claim/readability verdict. Web: staging/SEO/mobile only after editorial admission.

## Next one action
Run candidate editorial review (claim ceiling, HP voice, counterargument, language, rights), then user editorial approval; only after that stage using existing private studio. Do not change production content or deploy.

## Automation preparation
For each accepted item: artifact + versioned recipe + source/evidence manifest + deterministic test + recovery. External model outputs are CANDIDATE. Drive decision-changing delta must be written and read back before canonical claim.

## Update — 2026-10-08 / second authorized phone session
- Two additional narrative candidates produced: `docs/editorial-candidates/position-role-v2-CANDIDATE.md` and `docs/editorial-candidates/production-consequence-v2-CANDIDATE.md`.
- Total three nonpublic article candidates; conceptual/hypothetical examples are explicitly labeled, no fabricated match data.
- Existing private Studio V1 discovered; no competing implementation created.
- Publication remains OFF; candidate drafts must be reviewed by independent QA and Hikmet before site integration.

## Update — supported build investigation
- Confirmed Android `workerd` unsupported platform; Astro executable itself exists. Ubuntu proot present but Node 18.19.1 is not an assumed Astro 7 build solution.
- `docs/operations/BUILD_ENVIRONMENT_DIAGNOSIS_2026-10-08.md` records reproducible failure and recovery.
- `docs/operations/EDITORIAL_QA_CANDIDATES_2026-10-08.md` is coordinator pre-QA, not independent L4 verdict.
- Next WIP: use supported build/QA host and source-rights admission; do not redevelop existing Studio.
