# HPAnalytic — international architecture benchmark / Claude Code handoff
Status: CANDIDATE, read-only architecture contract; no release authorization.
Source repo: release-pack-01-candidate; observed HEAD 9ecb912 (2026-10-10).
Working tree is DIRTY; preserve every tracked and untracked change.

## Reference patterns (not assets to copy)
- Opta Analyst: data-led editorial narratives and contextual visual explanations. https://theanalyst.com/articles/introducing-the-analyst-data-driven-sports-storytelling
- The Athletic / MetaLab: editorial discovery, navigation clarity, team/league paths. https://www.metalab.com/work/the-athletic
- FBref: findability, player comparisons, transparent definitions/denominators; current advanced scouting reports discontinued. https://fbref.com/en/about/scouting-reports-explained

## Existing route to reference-pattern mapping
- / and /analysis: Opta Analyst editorial thesis, featured analysis, mechanism and counterevidence; visible author, source and limits.
- /articles/[...id]: premium readable article, anchored evidence/claims, mobile 320/375/430, 200% zoom, keyboard.
- /scouting: FBref-like discovery/comparison principles ONLY when licensed, provenance-bound data exists; never fabricate percentile/data.
- /research: methods, source registries, uncertainty and reproducible research.
- /culture: editorial essays; maintain distinct non-metric voice.
- /archive and /search: searchable cross-category index; no duplicate content truth.
- /visual-lab: visual evidence demonstrations, explicit schematic-vs-tracking boundary.
- /about: analyst identity and editorial independence.

## Claude Code: isolated repository housekeeping assignment
1. FIRST inspect branch, HEAD, git status and all uncommitted paths. Do not reset, clean, stash, checkout or overwrite existing work.
2. Create an ISOLATED git worktree from an explicitly verified clean commit (not the dirty current directory). If a second worktree exists, inspect before reusing it.
3. Audit repository tree, branch ancestry, duplicate/obsolete files, tests, routes, imports, content collections, build configuration, security and provenance. Produce a KEEP / MERGE-CANDIDATE / ARCHIVE-CANDIDATE / HOLD manifest with exact paths and evidence.
4. Repair only independently reproduced low-risk failures in the isolated worktree, test-first with regression tests; no destructive cleanup, branch deletion, merge, force-push or dependency upgrades without review.
5. Run existing test suite, Astro check and supported build. Separate Android workerd/Satteri limitations from actual product failures; no false production PASS.
6. Return exact commit SHA, diff, tests, remaining blockers and rollback. No merge, deploy, publication or paid API usage.
7. Do not alter HPFA/HPA football truth, article claims, image rights, brand assets or current dirty tree. No automatic release.

## Parallel ownership
Claude Code (once actually available): repo structure, technical debt and isolated TDD repair only.
ChatGPT: international site architecture, editorial/UX/visual acceptance and integration decisions.
Human: final release/publication approval. AUTOPUBLISH=OFF; HUMAN_APPROVED=false.

## Acceptance
- Every proposed change traces to an existing route and documented user need.
- Current dirty tree remains byte-for-byte untouched by Claude work.
- International examples are design principles, not copied UI, media or proprietary data.
- No external agent ACK or execution is claimed until independently observed.
