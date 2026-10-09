# OPEN_BLOCKERS — HPWEB-UNIFIED-TREE-20261009-001

Candidate `77e2387`. None of these is a code defect that blocks the candidate's tests; each needs a person or a permission.

| # | Blocker | Type | Owner | Needed to close |
|---|---|---|---|---|
| B1 | Canonical domain: candidate uses `https://hpanalytic.com`; phone preview set `https://www.hpanalytic.com` (only evidence: operator note "Canlı site: https://www.hpanalytic.com/") | Owner / SEO decision | Hikmet | Confirm canonical host and redirect direction; then one-line change in `astro.config.mjs` |
| B2 | Candidate not pushed; container is ephemeral | Permission | Hikmet / coordinator | Explicit OK to push `integration/hpanalytic-unified-20261009` (+ `source/*`), or transfer the delivered bundle |
| B3 | GitHub Linux Acceptance not run on this SHA | Permission (dispatch 403 earlier) | Hikmet / Manus | Run `linux-qa.sh` in Cloud Shell or open a PR to trigger CI |
| B4 | Live site checks (www/apex, headers, deployed Worker) | Network | Manus / Cloud Shell | Run QA list in HANDOFF §4 against production after any deploy |
| B5 | Brand candidate 9e7109f (featured evidence object) and 420px identity sizes | Brand decision | Hikmet | Physical review; then cherry-pick `source/phone-brand-delta-9e7109f` or reject |
| B6 | legacy_wip `relations:` frontmatter on 4 articles | Editorial decision | Hikmet | Approve knowledge-relation links per article |
| B7 | Only 1 public article; Analysis/Scouting/Culture/Research/Visual Lab hidden; Launch Series (3 inbox items) and 2 phone inbox items not admitted | Editorial | Hikmet | Human approval + source validation per item |
| B8 | Home discovery copy "Yayımlanmış analizden kaynaklara…" while no analysis is public (links themselves are gated) | Editorial copy | Hikmet | Reword or keep until first analysis |
| B9 | Match Centre real data (token in CI, refresh strategy, Süper Lig source) | Product / data | Hikmet | Decide provider and refresh model |
| B10 | `hpanalytic-build-handoff` (PR #10) artifact handoff and PR #7 deploy-workflow variant | Deployment process | Coordinator | Decide if artifact handoff is wanted; otherwise close PR #10 |
| B11 | P3: 3 article SVGs without width/height/loading; build warnings `collection research/visuals does not exist` | Low | Engineering | Optional follow-up |
| B12 | Phone `~/.cache/hpanalytic-brand-delta-01` holds unique commit 9e7109f outside git remote | Preservation risk | Hikmet | Keep cache or push branch; content already preserved here |

Stop conditions reviewed: none triggered (source identity verified, CC-01 tree matched, no dirty tree overwritten, editorial conflicts parked as HOLD rather than decided, no production command run).
