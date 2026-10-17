# Editorial MVP contracts — spec v0.1 mapping

| Field | Value |
|---|---|
| Version | 0.1 |
| Date | 2026-10-15 |
| Scope | Editorial Studio (`src/studio/**`), private and local-only |
| Status | CANDIDATE. Not deployed. Nothing published. |
| Claim ceiling | SOURCE-READ + TESTED. Every rule below has a test in `tests/studio-editorial-contracts.test.mjs` or `tests/studio-intake-privacy.test.mjs` (end to end). |

## 0. Input boundary

The task names "editorial spec v0.1" but the spec text was **not** in the request or in the repository. This
increment implements the five contracts the task lists by name (topic card, claim ledger, source independence,
critical review, human approval) on top of the existing Studio. When the v0.1 text arrives it has to be diffed
against §2; any rule there that is missing here is open work, not an implied pass.

## 1. Inventory: what already existed

| System | Where | What it governs | Touched? |
|---|---|---|---|
| Studio state machine | `src/studio/lib/model.mjs` | IDEA → … → READY → APPROVED → PUBLISHED, human-only APPROVED/PUBLISHED | Extended |
| Studio publication gate (§30) | `src/studio/lib/gate.mjs` | 7 checks before READY | Extended to 11 |
| Studio export | `src/studio/lib/export.mjs` | `draft: true` package to outbox, never `src/content` | Extended |
| Content intake contract | `src/lib/article-intake-contract.mjs` | HP Content Intelligence packets (claim registry, counterevidence, rights) | No |
| Site admission gate | `src/lib/site-admission.mjs`, `src/lib/article-pipeline.mjs` | `HUMAN_APPROVED`, psychology PASS, source-claims validation before writing to `src/content` | No — not bypassed, not modified |
| Psychology gate, Council 100 | `src/lib/editorial-psychology-gate.mjs`, `editorial/governance/` | Cognitive safety and craft review of articles | No |

## 2. Contract → implementation

| Contract | Rule (fails closed) | Code | Gate check |
|---|---|---|---|
| **Topic card** | title (not `(untitled)`), one line, why now, topic kind, evidence level ≠ UNKNOWN, core question, destination | `contracts.mjs#evaluateTopicCard`; human edit via `set_card` | `TOPIC_CARD` |
| **Claim ledger** | every claim has a unique `C<n>` id, an epistemic class (`FACT, DIRECT_OBSERVATION, DERIVED_OBSERVATION, PROXY, INFERENCE, MODEL_OUTPUT, INTERPRETATION, HYPOTHESIS`) and a status (`ACTIVE, DOWNGRADED, NARROWED, WITHDRAWN`); confidence ≤ class ceiling; every `[Sx]` in the draft backs a live claim; WITHDRAWN claims stay on record but leave all evidence checks | `contracts.mjs#evaluateClaimLedger`; human edit via `update_claim` | `CLAIM_LEDGER` |
| **Source independence** | every source a live claim cites has a stated origin (`independence_key`, or `derived_from` another source, which inherits the root's origin); cycles and dangling parents are errors; a HIGH claim needs ≥ 2 distinct origins among its **verified, supporting** sources | `contracts.mjs#evaluateSourceIndependence`; human edit via `set_source_origin`, `add_source` | `SOURCE_INDEPENDENCE` |
| **Critical review** | red team ran on the current draft; **every** red-team check answered (an absent check is not a pass); any FAIL blocks — no human override, fix and re-run; every WARN has a human disposition (`FIXED, ACCEPTED_WITH_NOTE, DISPUTED`) with a note, for *this* red-team run; a named human sign-off with a note on the current draft version | `contracts.mjs#evaluateCriticalReview`; `review_disposition`, `review_signoff` | `CRITICAL_REVIEW` |
| **Human approval** | APPROVED only from READY, by a named approver, with the gate passing at that moment; the record binds approver, time, draft version and a SHA-256 fingerprint of headline + standfirst + body + claim ledger; any change makes it stale; leaving APPROVED drops it; editing the draft in READY/APPROVED sends the topic back to EDITORIAL_REVIEW; PUBLISHED and the approved package require a valid approval and a still-passing gate | `approval.mjs`, `model.mjs#transition`, `export.mjs`, `actions.mjs` | transition + export |

Class ceilings (`CONFIDENCE_CEILING`): FACT / DIRECT_OBSERVATION / DERIVED_OBSERVATION → HIGH; PROXY / INFERENCE /
MODEL_OUTPUT / INTERPRETATION → MEDIUM; HYPOTHESIS → LOW. These are a v0.1 design decision, kept in one table so the
editor can change them; they are not derived from a source.

## 3. Holes this closes (each was reproducible before)

1. A red team with `findings: []` passed the gate (the old end-to-end test did exactly that).
2. FAIL on THESIS_PROVEN, MECHANISM, COUNTEREVIDENCE, SOURCE_QUALITY or JARGON did not block anything.
3. Two articles about the same study counted as two sources; nothing modelled origin.
4. An approved topic's draft could be edited and stay APPROVED; the package then carried text nobody approved.
5. APPROVED carried no approver name — only `actor: 'HUMAN'`.

## 4. Behaviour changes for existing Studio topics

Topics stored before this change (in `$HP_EDITORIAL_ROOT`) have claims without `id`, `claim_class` or `status` and
sources without an origin. They will fail `CLAIM_LEDGER` / `SOURCE_INDEPENDENCE` until re-run through the evidence
step or edited by a human. This is intended (fail closed); no automatic migration assigns classes or origins,
because that would be the engine asserting what only a human may assert.

## 5. Not done here

- The site admission path (`article-pipeline.mjs`) still takes `humanApproval: 'HUMAN_APPROVED'` as a bare string.
  Binding it to an approval record like the Studio's is the natural next step; it was left untouched because the
  task forbids bypassing or reshaping the existing publication gate without review.
- Live render of the Studio page was not verified: under the current Astro 7 + Cloudflare dev runtime the Studio
  guard returns 404 for every request, on the base commit as well as on this branch. `astro check` passes on the
  changed page.
