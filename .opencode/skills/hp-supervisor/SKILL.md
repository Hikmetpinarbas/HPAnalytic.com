---
name: hp-supervisor
description: HPAnalytic OpenCode super-skill orchestrator for high-quality prematch/postmatch publication, chart engineering, design systems and QA. Load first for cross-disciplinary editorial or visualization work.
compatibility: opencode
metadata:
  opencode/slash: "true"
---
# HPAnalytic SuperSkills — Orchestration v0.1
Read the currently proposed `hpfootball-site/docs/standards/HP_MATCH_EDITORIAL_STANDARD_v0.1.md` if present; otherwise use the PR #74 proposal as non-final reference. This is an evolving minimum floor, not a claim of premium quality.

## Mandatory sequence
1. Establish the football question and desired outcome; inspect the actual repository and data files, do not substitute invented samples.
2. Load `hp-football-analysis` for data meaning, epistemic boundaries and prematch/postmatch distinction.
3. Load `hp-editorial-storytelling` for evidence-led writing and information architecture.
4. Load `hp-viz-engineering` for real graphics, pitch metrics, menus and responsive motion.
5. Load `hp-visual-qa` to independently reject poor output before user review.
6. Report evidence, actual test outputs, risks and unpublished status truthfully.

## Source-of-truth order
Original SportsBase match data + recorded provider definitions > validated calculations > independent context > published visual > prose claim. If mismatch, mark CONFLICT and stop the affected claim. Do not imply tracking from event data.

## Production safeguards
WIP=1; design/research prototype before broad rollout. No deletion, external publishing, merging, production deployment, paid API calls or account messages without explicit user approval. Passing CI means build correctness, not editorial or aesthetic success. A draft must NOT be represented as user-approved.

## Explicit failure gates
Reject: metre/minute confusion, false coordinate direction, unsupported causal pressure claims, duplicate chart galleries, unreadable mobile labels, huge control chips, unverified numerical statements, invented pitch points or zero-value clutter.
