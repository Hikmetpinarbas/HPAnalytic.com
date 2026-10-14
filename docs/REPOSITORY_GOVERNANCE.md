# Repository and worktree governance

Updated: 2026-10-15 (consolidation). This file describes branch roles; it does not grant release approval.

## Branch roles

| Branch | Role |
|---|---|
| `site-hp-standard-v2` | **Production.** Every push deploys to hpanalytic.com. Changes arrive only by an approved merge. |
| `consolidation/canonical-20261015` | **Canonical integration line.** Contains all of `qa/integration-20261014`, `integration/parallel-consolidation-20261014` and every production-only commit. New work branches from here. |
| Other remote branches | Historical candidates. Kept for provenance; not a source of truth. Do not delete without an inventory and explicit approval. |

## Phone worktrees

- Canonical phone tree: `~/HPA_SITE_DEV/HPANALYTIC_CANONICAL`.
- Earlier trees under `~/HPA_SITE_DEV/` are preserved unchanged. Their full state (status, tracked and staged patches, untracked files and an all-refs git bundle per tree, SHA-256 listed) is in `~/HPA_SITE_DEV/CONSOLIDATION_20261015/snapshot/`.
- The consolidation record (inventory, comparison and decisions) is in `~/HPA_SITE_DEV/CONSOLIDATION_20261015/`.

## Rules

1. One canonical integration line and one production writer at a time.
2. Resolve overlapping changes by meaning and evidence, not by timestamp.
3. Run unit tests, Astro check, build, real browser/mobile QA, security, rights and private-bundle checks on the exact candidate in supported Linux.
4. Merge to production and deploy only after independent QA and Hikmet Pınarbaş's explicit approval. `AUTOPUBLISH=OFF`.
5. Archive old worktrees only after ownership checks and separate approval; keep the restoration recipe.

## Recovery

Stop on SHA mismatch, concurrent edits, failed tests or unclear permissions. Restore only from a verified snapshot. Never use `git reset --hard`, `git clean -fd` or bulk worktree deletion as a shortcut. To restore a tree's refs: `git clone <tree>/all-refs.bundle <dir>`; then apply `tracked.patch`, `staged.patch` and extract `untracked.tar.gz`.
