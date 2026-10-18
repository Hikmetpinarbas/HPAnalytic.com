# HPAnalytic Editorial Intelligence Studio — V1

| Field | Value |
|---|---|
| Title | HPAnalytic Editorial Intelligence Studio, first iteration (P0–P7 + Foundry bridge) |
| Version | 1.0 |
| Date | 2026-10-06 |
| Route | `/studio/editorial` (private, local-only) |
| Status | ACCEPTED_LOCAL_NO_DEPLOY candidate. Not deployed. No Cloudflare change. |
| Keywords | editorial pipeline, publication gate, source traceability, claim discipline, Content Foundry, HP language |
| Claim ceiling | SOURCE-READ + TESTED. Every behaviour below is covered by `tests/studio-*.test.mjs` or was exercised against a running dev server. Editorial quality of engine output is **not** evaluated: no API credentials existed in the build session. |

## 0. Abstract

The Studio turns an idea, a URL, a file or a Content Foundry seed into a READY publication candidate: classify → source map → claim/evidence map → structure → draft → headlines → red team → publication gate. An engine (Claude API) can do the labour. It cannot verify a source, cannot pass the human checks in the gate, cannot approve, cannot publish. Approved work leaves the Studio only as a `draft: true` Markdown package in a local outbox.

## 1. P0 — discovery (what already existed, and what the Studio does with it)

| Existing system | Where | Owner / authority | Studio decision |
|---|---|---|---|
| HPAnalytic site (Astro 5, Cloudflare) | this repo, branch `hpanalytic-design` (PR #2) | site operator | Studio built on top of it. Public routes untouched except the draft filter (§5). |
| Content Foundry queue (`CFQ-*`; increment 14 records base_queue_count=121, so 121+ items) | phone: `~/HIKMET_FOOTBALL_SYSTEM/70_RESEARCH/CONTENT_FOUNDRY_QUEUE/QUEUE_*.json` | Content Factory / Research Foundry specialist; promotion gate + preflight + routing + scoring in `TERMUX_HUB/11_AI_ORCHESTRATION/foundry_support/*.py` | **Read-only bridge.** Studio reads the queue, lists `article_seed` / `research_topic` items as candidates, imports one on request. It never writes to the queue and never re-scores it (the Foundry ledger itself records that `value_score` is too coarse to rank; the Studio does not paper over that). |
| HP Content Control (`/control/content`) | phone: `HPA_SITE_DEV/packet01-isolated` (not in git) | HPA analysis outputs → site admission | **Not duplicated.** Content Control governs HPA analysis artefacts (postmatch, player analysis) and their site admission. The Studio governs editorial pieces born from ideas, URLs, files and Foundry seeds. Both end at a human approval; neither publishes. When Content Control is committed, its `evaluateAdmission` and the Studio gate should be compared and one admission vocabulary chosen. |
| Route/content inventory V1 | phone: `packet01-isolated/docs/HPANALYTIC_ROUTE_CONTENT_INVENTORY_V1.json` | site evolution queue | Used for destinations: `/blog` collection is MISSING, canonical `/visual` is MISSING. Studio keeps BLOG/VISUAL packages in the outbox and says so in the UI. |
| Operations ledger | Google Docs "HPANALYTIC.COM — ANA OPERASYON DEFTERİ" | Hikmet | Studio decisions appended there. Studio also writes a machine log (`ledger.jsonl`). |
| Drive / Dropbox editorial inbox | — | — | **Not found** (Drive and Dropbox searched). Not built in V1 (P8). |

## 2. Architecture

```
            ┌──────────── PUBLIC SITE (astro build → Cloudflare) ─────────────┐
            │  src/pages/**  ←  getCollection(..., isPublic)  ←  src/content   │
            └──────────────────────────────────────────────────────────────────┘
                                         ▲  human PR only
                                         │
  HP_STUDIO=1 astro dev (127.0.0.1)      │
  ┌──────────────────────────────────────┴──────────────────────────────────┐
  │ /studio/editorial            src/studio/pages/*.astro (injected route)  │
  │   actions.mjs ── model.mjs (state machine) ── gate.mjs (§30 gate)       │
  │        │            engine.mjs (Claude API | operator brief) ─ prompts  │
  │        │            intake.mjs (idea · URL · file · Foundry, read-only) │
  │        └── store.mjs → $HP_EDITORIAL_ROOT (default ~/HPA_EDITORIAL_STUDIO)
  │                 topics/*.json · ledger.jsonl · failure-memory.json      │
  │                 suggestions.json · intake-files/*.pdf · outbox/**.md    │
  └──────────────────────────────────────────────────────────────────────────┘
```

### Privacy boundary (§37)

1. **Routes exist only with `HP_STUDIO=1`.** `src/studio/integration.mjs` injects them in dev; `astro build` with the flag set throws. Studio pages live outside `src/pages`, so a normal build never sees them. CI greps `dist/` for Studio strings.
2. **Data lives outside the repo** (`HP_EDITORIAL_ROOT`). Drafts, corpus extracts, PDFs and notes never enter git, the bundle or page source.
3. **Loopback + same-origin POST only** (`guard.mjs`). The dev script binds `127.0.0.1`. A cross-site form post from another tab gets 404.
4. **noindex, no-referrer, no public navigation link.** The Studio layout does not read public collections.
5. **Server-rendered forms, zero client JS.** Nothing internal is shipped to a browser bundle.

## 3. Data model (P1)

`HP_EDITORIAL_TOPIC_V1`, one JSON file per topic: `intake` (kind, raw, url, file, Foundry item + its claim ceiling, extracted text, warnings), `card` (§9 topic card), `destination` (§10 layer + derivatives), `research` (core question, thesis, sources, institution notes, match examples, data needed, open questions), `claims` (§23 map), `outline` (§24 writing prerequisites), `draft`, `headlines` (+ safety test), `red_team`, `score` (§29), `attestations` (human checks), `public_meta`, `export`, `history`.

State machine (§11): `IDEA → DISCOVERED → RESEARCHING → SOURCE_READY → EVIDENCE_READY → OUTLINE → DRAFTING → DRAFT → RED_TEAM → EDITORIAL_REVIEW → READY → APPROVED → PUBLISHED`, plus `HOLD` (returns to where it was parked) and `REJECTED` (terminal, needs a failure reason). Back-edges exist where re-work is real (new research after review, redraft after red team).

Hard rules in code, each tested:

- `APPROVED` and `PUBLISHED` are **human-only** targets.
- `READY` requires a passing gate.
- `PUBLISHED` requires a public `hpanalytic.com` URL. The Studio never publishes; PUBLISHED records that a human already did.
- Engine-found sources are always `verified: false`. Only a human verifies.

## 4. Publication gate (§30) — what each check actually computes

| Check | Fails when |
|---|---|
| SOURCE_TRACEABILITY | no draft; no sources; a source has no URL/internal ref; no claim map; a claim has no source, cites a missing source, or cites an **unverified** source; human "sources checked" missing |
| CLAIM_DISCIPLINE | a claim has no evidence or UNKNOWN confidence; red team not run, or run on an older draft version; red team FAIL on DATA_TO_CAUSATION or SMALL_SAMPLE |
| COUNTEREVIDENCE | no COUNTER source and not every claim carries counterevidence; outline has no counterargument |
| COPYRIGHT_SAFETY | any 12-word folded shingle shared between the draft and the intake text or a source excerpt; red team FAIL on RETELLING |
| HP_LANGUAGE | cliché lexicon hit (TR+EN); red team FAIL on AI_CLICHE; human "voice checked" missing (reset by every new draft) |
| ORIGINAL_VALUE | no HP angle; ORIGINALITY not scored or below 6; red team FAIL on HP_VALUE |
| HEADLINE_HONESTY | no selected headline; headline safety test run on an older draft; article does not answer it; stronger than evidence; misleading; red team FAIL on HEADLINE_VS_TEXT |

Defaults fail closed: missing safety booleans are read as unsafe.

**2026-10-15:** four more checks (TOPIC_CARD, CLAIM_LEDGER, SOURCE_INDEPENDENCE, CRITICAL_REVIEW) and a bound human-approval record were added — see `docs/operations/EDITORIAL_MVP_CONTRACTS_V0_1.md`.

## 5. Public-site change: draft filter

`draft: z.boolean().default(false)` added to `articles`, `research`, `visuals`. Every public `getCollection()` call passes `isPublic` (`src/lib/public-content.mjs`); a test asserts this for every call site.

**Measured limit:** a `draft: true` file placed in `src/content` is not rendered, listed, searched or counted, **but its text is still embedded in the server-side content data layer of the worker bundle** (verified with a probe build). Therefore: drafts stay in the Studio outbox until approved; `draft: true` is a second line of defence, not the privacy boundary.

## 6. Engine

- Model `claude-opus-5-5`, adaptive thinking, effort per step (classify/headlines medium, others high), streaming, server-side refusal fallback (`fallbacks: "default"`).
- Non-web steps use strict JSON-schema structured output. Research and KONU BUL use `web_search` / `web_fetch` server tools (sources must be real URLs; urlless sources are discarded) and return a JSON block validated by the same `applyStep`.
- **Operator path**: with no credentials, every step shows a copy-ready brief (system role + HP language seed + task + JSON schema). The pasted answer goes through the same validation. This is how the Studio works today in an environment without an API key.
- Credentials: `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`/`ANTHROPIC_PROFILE`, or an `ant auth login` profile. `HP_STUDIO_ENGINE=off` forces the operator path.

### HP language (§3)

`HP_LANGUAGE_SEED v0` is written from Hikmet's stated working preferences and the published HPAnalytic articles. It is **not** corpus-derived, and the UI says so. When `$HP_EDITORIAL_ROOT/profile/HP_LANGUAGE_PROFILE.json` exists it is appended to every prompt and takes precedence. Building that profile from Drive/Dropbox is open work.

## 7. Acceptance (§41)

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | Open the Studio | PASS | `npm run studio` → `/studio/editorial` 200 |
| 2 | Drop an idea or URL | PASS (idea, URL, file, Foundry) | e2e test; live dev server. Live URL fetch from inside the cloud sandbox is blocked by its egress proxy (`x-proxy-error: no rule allows host`); the extractor itself is tested. Not an issue on Termux (no proxy). |
| 3 | Topic classified | PASS (operator path) / UNTESTED (engine path) | engine path needs credentials |
| 4 | Research/sources created | PASS (operator path) / UNTESTED (engine) | same |
| 5 | Draft produced | PASS (operator path + human editor) / UNTESTED (engine) | same |
| 6 | Sources visible | PASS | source map grouped by §22 role, verified/unverified marks |
| 7 | Headline alternatives visible | PASS | A–E table with safety test |
| 8 | Draft can reach READY | PASS | gate blocks until human checks; e2e test |
| 9 | Public layer known | PASS | destination + target collection on topic and package |
| 10 | Not published | PASS | no publish code path exists; package `draft: true` in outbox |

## 8. Not built in V1 (with reason)

| Item | Why not now |
|---|---|
| P8 Drive/Dropbox inbox watcher | No editorial inbox folder exists yet; watcher needs a credential and schedule decision. |
| P10 academic automation beyond web search | Scholar connectors are available to the operator but not to a local server; decide whether the engine should get an MCP connector. |
| P11 social derivatives | Destination/derivative fields exist; generation waits until one article passes READY with the engine. |
| HP_LANGUAGE_PROFILE from corpus | Needs a deliberate corpus selection (which scripts/articles are "strong HP"). |
| DOCX parsing | No dependency added for one format; PDF/MD/TXT work. |

## 9. Risks

- **Engine quality is unmeasured.** Next step must be a real run on 2–3 topics and a red-team of the engine's own output.
- **Long synchronous requests.** An engine step blocks the page for minutes. Acceptable locally; a job queue is the fix if it hurts.
- **Cliché lexicon is a floor, not a voice model.** Passing it says nothing positive about HP voice; the human voice check is the real control.
- **Two admission vocabularies** (Content Control vs Studio gate) until Content Control is committed and compared.

## 10. How to run (Termux or desktop)

```bash
cd hpfootball-site
npm install
# optional: export ANTHROPIC_API_KEY=…   (or: ant auth login)
# optional: export HP_EDITORIAL_ROOT=~/HPA_EDITORIAL_STUDIO
# optional: export HP_FOUNDRY_QUEUE_DIR=~/HIKMET_FOOTBALL_SYSTEM/70_RESEARCH/CONTENT_FOUNDRY_QUEUE
npm run studio        # → http://127.0.0.1:4321/studio/editorial
```

## 11. Related work

`docs/HPANALYTIC_DONOR_REVERSE_ENGINEERING_2026-10-06.md`, `docs/HP_FOOTBALL_DESIGN_CONTRACT_V1.md`, Content Foundry living ledger (Drive), HPANALYTIC.COM ana operasyon defteri (Drive).
