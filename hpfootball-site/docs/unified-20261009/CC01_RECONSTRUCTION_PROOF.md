# CC01_RECONSTRUCTION_PROOF — HPWEB-UNIFIED-TREE-20261009-001

Result: **PASS — bit-exact.** The Drive package reproduces the reported CC-01 commits, not only the tree.

| Step | Evidence |
|---|---|
| Patch source | Drive folder `1rOXIuwI-fZdI2ThHm6oDsrqffOVnjGyA`, file `CC01_14ca0d1_on_59b9b85.mbox` (id `1r_64xs-q03VWx7kkXpvJDzhSknkNXmPF`), downloaded via Drive API |
| Patch sha256 | `b8163ef39475a650cf13b11b1b7903bb9f9b33e40a935ccc64aeca0671457fd8` = expected |
| Base | disposable detached worktree at `59b9b851d46aff8776eaa6a56c43009225ab957d` (= `origin/ccr-35db03bc-gb996o`) |
| Apply | `git am --committer-date-is-author-date` → 5/5 patches applied, no fuzz |
| Tree (any committer) | reconstructed `32075cea2734061351aaf2c09c66b0d53754f018` = reported `14ca0d1^{tree}` `32075cea…`; `git diff --quiet 14ca0d1 HEAD` exit 0 |
| Commit SHAs (committer `Claude <noreply@anthropic.com>`, dates from patch) | `51a9cce 7b81343 fb43097 481afab 14ca0d1` — identical to the reported series |

Commands (reproducible in Cloud Shell):
```bash
git worktree add --detach /tmp/cc01 59b9b851d46aff8776eaa6a56c43009225ab957d
cd /tmp/cc01 && sha256sum CC01_14ca0d1_on_59b9b85.mbox
GIT_COMMITTER_NAME=Claude GIT_COMMITTER_EMAIL=noreply@anthropic.com \
  git am --committer-date-is-author-date CC01_14ca0d1_on_59b9b85.mbox
git rev-parse HEAD   # 14ca0d1db39ebe41390618896daa2968434c4e5c
```

Nothing was pushed. The integration branch starts at this exact object.

## Related transport proofs in this task

| Object | Proof |
|---|---|
| Phone integration-preview delta | 126 438 bytes, sha256 `00f398b1…6ddd` equal on phone and in cloud; after `git apply` on 9ecb912, 58/58 file blobs equal to phone `git hash-object` |
| Phone brand_delta commit 9e7109f | 4/4 file blobs equal; commit SHA **not** equal (rebuilt `4ee6ddd`), most likely committer date differs. Content equivalence only. |
