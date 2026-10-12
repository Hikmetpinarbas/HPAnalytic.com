# SOURCE_TREE_INVENTORY — HPWEB-UNIFIED-TREE-20261009-001

Candidate: `integration/hpanalytic-unified-20261009` @ `77e2387896da24621dde5eea13836eb87f83f550`
Inventory taken: 2026-10-09 (cloud container + Termux phone via Desktop Commander, read-only).
Nothing below was modified, moved or deleted on the phone.

## A. Git sources in `Hikmetpinarbas/HPAnalytic.com` (cloud clone, fetched incl. `refs/pull/*`)

| Source | SHA | Role | Disposition |
|---|---|---|---|
| `site-hp-standard-v2` | `ddb0ed7470f3e13fe937d9f2791f8dd603620e8b` | Production (auto-deploys) | Ancestor of candidate; untouched |
| `release-pack-01-candidate` | `9ecb9126d8684bd42865eb8c334c24d0618be204` | Earlier release candidate | Ancestor of candidate |
| `ccr-35db03bc-gb996o` (remote) | `59b9b851d46aff8776eaa6a56c43009225ab957d` | Verified integration base (P0) | Ancestor of candidate |
| `ccr-88842542-k09nnx` | `fe3bfca03db66d3c1fad23927d3fd2ac4eb8ce17` | Search-link a11y | Incorporated (cherry-picked as 2cccfd4/4f14929) |
| `hpanalytic-build-handoff` / PR #10 | `9c04521c96880255ac1bf4b452e11bbd709eff43` | dist artifact handoff | Superseded / HOLD (deploy mechanism) |
| PR #2–#9 heads | fd6379a, 22b0f87, 96ec388, 6003f7a, 4af9933, 88ee469, 246e71c, 4cad606 | Closed PRs | All Superseded/Incorporated (see matrix) |
| CC-01 local line | `14ca0d1db39ebe41390618896daa2968434c4e5c` | Site completion candidate | Reconstructed bit-exactly from Drive; base of integration branch |

## B. Phone sources (Termux, `/data/data/com.termux/files/home`)

| Path | HEAD | Dirty | Status fingerprint / sha256 | Disposition |
|---|---|---|---|---|
| `HPA_SITE_DEV/HP-PROJELERI` | 9ecb912 (`release-pack-01-candidate`) | 10 M + 16 ?? | status sha256 `c38e02bb…` (= reconciliation `canonical.status`, unchanged) | Already incorporated via integration-preview |
| `HPA_SITE_DEV/WORKTREE_RECONCILIATION_20261009/integration-preview` | 9ecb912 (detached) | 12 M + 46 ?? | status sha256 `63372158…`; delta sha256 `00f398b1…` (126 438 B) | Snapshot `14cc946`, 58/58 blobs verified, merged |
| `HPA_SITE_DEV/hpanalytic-artifact-pr` | 9c04521 | clean | — | = build-handoff (git) |
| `HPA_SITE_DEV/hpanalytic-final` | 4af9933 | clean | — | = PR #6 head (git) |
| `HPA_SITE_DEV/hpanalytic-unified` | ce65d16 | clean | — | in cloud repo; Superseded |
| `HPA_SITE_DEV/hpanalytic-unified-candidate` | 9a568f7 | clean | — | in cloud repo; Superseded |
| `HPA_SITE_DEV/repo-closure-clean` | 246e71c | clean | — | = PR #8 head |
| `~/.hp_site_wip` (legacy_wip) | 1c762a6 | 22 | `legacy_wip.patch` sha256 `f8b9ddfc…` | New components incorporated (via preview); article `relations:` HOLD; rest Superseded |
| `~/.cache/hpanalytic-brand-delta-01` | 9e7109f (not on GitHub) | 4 | commit content preserved (4/4 blobs) | HOLD (brand REVIEW); spacing subset used |
| `~/.cache/hpanalytic-brand-css-candidate-20261008` | 9ecb912 | 3 | `brand_css.patch` `2073e8e4…` | CSS fix incorporated; design-token guard test added |
| `~/hpa-search-a11y-fp6dZT/repo` | 9ecb912 | 2 | `a11y.patch` `b9869a69…` | Incorporated (= fe3bfca fix) |
| `~/.hio_repo_migration` | d56c83c (HP-PROJELERI repo) | 92 | `hio_migration.patch` `c12265cd…` | Out of scope (HIO Analytics project) |
| `~/HPA_SITE_COMMANDER_SNAPSHOT` | 683f3f6 | clean | — | ancestor of candidate |
| `HPA_SITE_DEV/HPANALYTIC_LOCAL_STATE` | — | — | inbox jsons `aacf21aa…`, `910a810b…` | HOLD (publish_allowed=false) |
| `HPA_SITE_DEV/article-pilot-01`, `acceptance-content-control-35f69ef`, `deploy_artifact`, `HP_FOOTBALL_PACKET_01_EXACT(.tar.gz)`, `.hpa_merge_tmp` | — | — | — | Historical / build output; Superseded |
| `WORKTREE_RECONCILIATION_20261009/*.patch, *.tar.gz, *.json` | — | — | sha256 list in §D below | Preserved in place |

## C. Drive

| Item | Value |
|---|---|
| Folder | https://drive.google.com/drive/folders/1rOXIuwI-fZdI2ThHm6oDsrqffOVnjGyA |
| `CC01_14ca0d1_on_59b9b85.mbox` | sha256 `b8163ef39475a650cf13b11b1b7903bb9f9b33e40a935ccc64aeca0671457fd8` (verified on read-back) |

## D. Phone reconciliation artefact fingerprints (sha256, abbreviated to 16 hex)

```
integration-preview-linux-source-v2-20261009.tar.gz  d075c9905f06cdcd
integration-preview-source-manifest-v2.json          fc5e0262a45cb826
integration-preview-v4.patch                         efa60e873b761033
canonical.patch                                      a6a57e64243d5df0
canonical.untracked.tar.gz                           a12ac54c87675372
legacy_wip.patch                                     f8b9ddfc0f5159f9
legacy_wip.untracked.tar.gz                          3511630c406e0e03
brand_delta.patch / .staged.patch                    33ee2c991a01e971 / 56b39b892924dc51
brand_css.patch                                      2073e8e4e0a729b8
a11y.patch                                           b9869a691c745258
hio_migration.patch                                  c12265cd1760f5a6
manifest.json / content-delta-matrix.json            f3b8db117c231294 / 15c341c3e9c4ea8d
overlap-hashes.json                                  3f9ebc629f524158
```
Full 64-hex values: phone command `sha256sum *` in `WORKTREE_RECONCILIATION_20261009` (output captured in this session).

## E. Preservation statement

- No `git reset`, `git clean`, forced checkout, stash, push or deletion was run on any phone tree.
- Phone commands were read-only (`git status`, `git diff`, `git hash-object`, `sha256sum`, `cat`, `find`).
- At-risk source in `~/.cache` (commit 9e7109f, not on GitHub) is preserved in this package.
