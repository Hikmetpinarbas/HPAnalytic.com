# Canonical repository and worktree governance

Status: CANDIDATE — prepared in isolated integration preview on 2026-10-09. Not E08 accepted.

- **Canonical remote:** private `Hikmetpinarbas/HPAnalytic.com`.
- **Canonical phone source:** `~/HPA_SITE_DEV/HP-PROJELERI`; currently dirty. Do not overwrite.
- **Integration preview:** `~/HPA_SITE_DEV/WORKTREE_RECONCILIATION_20261009/integration-preview`; detached baseline `9ecb9126d8684bd42865eb8c334c24d0618be204` with uncommitted integration candidate.
- **Preservation:** `~/HPA_SITE_DEV/WORKTREE_RECONCILIATION_20261009/` contains the 13-tree manifest, original status/patch/untracked archives, hash matrix, isolated integration candidate, QA logs and source tarball.
- **Production workflow:** `.github/workflows/hpanalytic-production-deploy.yml` contains a deployment action; do not invoke it for QA. The presence of a branch guard is not human approval.
- **Linux acceptance workflow:** `.github/workflows/hp-football-linux-acceptance.yml` includes tests, Astro diagnostics, build, Chromium browser QA, private-studio leak scan and Cloudflare dry run. Historical success on baseline commit does not verify the current candidate.
- **Authority:** site product/editorial operator retains acceptance and publishing decisions; E08 independent QA has veto; OMBUDSMAN provides shared Termux/Linux capability, not publication authority.
- **Global production WIP:** 1. `AUTOPUBLISH=OFF`; `HUMAN_APPROVED=false`.

## Safe adoption sequence

1. Snapshot and SHA-verify exact source and its original worktree state.
2. Resolve overlapping source paths by semantics and evidence, not timestamp.
3. Run unit, schema, build, real browser/mobile, security/rights and private-bundle checks on the exact candidate in supported Linux.
4. Obtain E08 decision and record any rejected paths.
5. Apply accepted candidate to the single canonical tree with collision checks and reversible backup; never silently discard existing dirty files.
6. Verify exact resulting commit and tests; only then mark consolidation ACCEPTED.
7. Archive old worktrees only after ownership/branch/link checks and separate authorization. Keep restoration recipe and manifests.

## Recovery

Stop on SHA mismatch, concurrent edits, failed tests or unverified permissions. Preserve originals and restore only from a verified snapshot after approval. Never run `git reset --hard`, `git clean -fd` or bulk worktree deletion as a shortcut.
