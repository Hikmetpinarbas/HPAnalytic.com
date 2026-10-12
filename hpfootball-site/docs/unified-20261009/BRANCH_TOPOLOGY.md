# BRANCH_TOPOLOGY — HPWEB-UNIFIED-TREE-20261009-001

```
site-hp-standard-v2 (PRODUCTION, auto-deploy)  ddb0ed7
  └─ release-pack-01-candidate                  9ecb912  (+27)
       ├─ ccr-35db03bc-gb996o (remote base)     59b9b85  (+P0: e82e750 7f15fe6 a382b04 2cccfd4 4f14929 92912f1 59b9b85)
       │    └─ CC-01 (rebuilt from Drive mbox)  14ca0d1  (51a9cce 7b81343 fb43097 481afab 14ca0d1)
       │         └─ integration/hpanalytic-unified-20261009
       │              ├─ 7bd24e9  Merge phone integration-preview  ◄── source/phone-integration-preview-20261009 (14cc946 on 9ecb912)
       │              ├─ 81ab4ff  Type legacy_wip components for astro check
       │              ├─ 77e2387  Keep the one-row mobile header inside 320px   ◄── QA SUBJECT (code)
       │              └─ (next)   Evidence package (docs/unified-20261009 only)
       └─ source/phone-brand-delta-9e7109f      4ee6ddd  (content = phone 9e7109f, 4/4 blobs; NOT merged, HOLD)

ccr-88842542-k09nnx  fe3bfca  (on ddb0ed7; content cherry-picked into 59b9b85 line)
hpanalytic-build-handoff / PR #10  9c04521  (1 ahead / 7 behind production; not merged)
```

## Branches created in this task (local only, none pushed)

| Branch | Head | Purpose |
|---|---|---|
| `integration/hpanalytic-unified-20261009` | evidence commit on `77e2387` | Unified candidate |
| `source/phone-integration-preview-20261009` | `14cc946140d686f22e99ac636e6f93a38cdc02a9` | Provenance snapshot of phone tree |
| `source/phone-brand-delta-9e7109f` | `4ee6dddb55778293128eedf08c9eeab0f3a98bc2` | Preserved brand candidate (HOLD) |

Worktree: `~/HPA_SITE_DEV/UNIFIED_20261009` (cloud container path `/root/HPA_SITE_DEV/UNIFIED_20261009`).
Note: this is the **cloud** container's home, not the phone. The container is ephemeral; see ROLLBACK_PLAN / HANDOFF for transfer.

## Ancestry facts (verified with `git merge-base --is-ancestor`)

- ddb0ed7 ⊂ 9ecb912 ⊂ 59b9b85 ⊂ 14ca0d1 ⊂ 77e2387
- 1c762a6 (legacy_wip base) and 683f3f6 (commander snapshot) are ancestors of the candidate.
- 9e7109f and d56c83c are not in the HPAnalytic.com repository.
