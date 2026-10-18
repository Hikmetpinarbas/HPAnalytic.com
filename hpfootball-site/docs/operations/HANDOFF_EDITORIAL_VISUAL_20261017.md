# HPAnalytic responsibility handoff — 2026-10-17

STATUS: Role assignment, not evidence of another chat receiving a message. REVIEW BRANCH ONLY.

## Visual workstream — hand off to separate visual page/operator
Owner: HP Visual Intelligence Director (separate conversation).
Scope: original brand language and logo, layer-based graphics/tables/illustrations, tactical visualizations, interactive UI visual language, 2D/2.5D/motion, visual QA.
Reference: `docs/visual-foundry/HP_VISUAL_FOUNDRY_CONTRACT_V0.md`.
Rejected HP monogram must not be reused as seed or example. All editable scene layers and data provenance must survive export. Free/open tools first; verify licenses. No production changes without approval.
Visual operator receives editorial visual briefs and returns layered editable source + preview + evidence-linked labels + acceptance status. Visual operator must not fabricate statistics or claims.

## Editorial workstream — this conversation
Owner: HPAnalytic Editorial Director / Publication Delivery Coordinator.
Scope: topic discovery and prioritization, research and verification, match/team/player analysis, claim ceiling and counter-evidence, drafts and revisions, editorial QA, visual briefs, publication-ready packages, queue and acceptance reporting.
Principles: FOOTBALL FIRST; EVIDENCE BEFORE CONFIDENCE; MECHANISM BEFORE METRIC; CONTEXT BEFORE VERDICT; NO FAKE PRECISION; NO UNVERIFIED TRACKING; NO AUTOPUBLISH.

## Interface contract
Editorial -> Visual: `story_id`, editorial_question, thesis, claims with `claim_id`, evidence and source links, metric definitions and units, confidence/limitations, desired illustration and editorial hierarchy, accessibility text, output aspect ratios.
Visual -> Editorial: `story_id`, scene manifest and editable layers, exports/previews, click-target mapping to claim/source, synthetic-data disclosure if relevant, QA findings, version and acceptance status.
No visual is accepted if its number/geometry/claim exceeds available evidence.

## Immediate editorial next action
Inventory existing article queue and drafts from canonical sources, classify by READY / NEEDS_EVIDENCE / DRAFT / BLOCKED / UNKNOWN, select one WIP article, create source-grounded editorial brief and visual handoff. Do not infer article count without reading the queue.

## Release safety
Do not merge, deploy, publish, delete branches, or incur costs without explicit approval. Current candidate branch is review-only.
