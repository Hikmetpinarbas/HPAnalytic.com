# ROLLBACK_PLAN — HPWEB-UNIFIED-TREE-20261009-001

State at hand-off: nothing pushed, nothing merged, nothing deployed. Production stays `ddb0ed7`.

## Levels

| Level | Situation | Action (non-destructive) |
|---|---|---|
| R0 | Reject one change in the candidate | `git revert <sha>` on the integration branch (`77e2387`, `81ab4ff` are independent; `7bd24e9` is a merge → `git revert -m 1 7bd24e9` drops the whole phone preview import) |
| R1 | Reject the phone preview import, keep CC-01 | New branch from `14ca0d1` (`git switch -c <name> 14ca0d1`); preview stays available at `source/phone-integration-preview-20261009` |
| R2 | Reject CC-01 too | New branch from `59b9b85` (pushed remote base) |
| R3 | Container lost before push | Re-create from the delivered `hpanalytic-unified-20261009.bundle` (`git clone -b integration/hpanalytic-unified-20261009 <bundle>`); or rebuild: `59b9b85` + Drive mbox (bit-exact 14ca0d1) + phone preview delta (sha256 `00f398b1…`, still on phone) |
| R4 | After a future approved merge + deploy | `git revert -m 1 <merge>` on `site-hp-standard-v2`; existing workflow redeploys the previous tree. No KV, data or secret is created by this candidate (bindings: ASSETS only) |

## What was not touched (so needs no rollback)

- Phone trees, `.cache`, reconciliation archives: read-only access only.
- Remote branches and PRs: no push, no comment, no close.
- Drive: read only in this task.
- Production workflow files: unchanged.

## Disposable worktrees created (cloud only, safe to remove later with `git worktree remove`)

`scratchpad/a1-disposable`, `a1-exact`, `src-preview`, `bd`, `qa`, `qa2`, `qa3` — not removed in this task (NO source deletion rule).
