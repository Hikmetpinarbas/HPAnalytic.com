# HP FOOTBALL — DESIGN CONTRACT V1

STATUS: DEVELOPMENT CONTRACT
AUTHORITY: HP FOOTBALL PRODUCT / HİKMET PINARBAŞ
IMPLEMENTATION STATUS: LOCAL DEVELOPMENT ONLY — NOT MERGED / NOT DEPLOYED

## 1. Product identity

HP Football is an independent football intelligence product, not a generic dashboard, SaaS template, fan site, or personal-blog skin.

Public experience must be quiet, high-resolution, evidence-aware and football-first.

Core design direction:
- Caravaggio: controlled darkness, hierarchy through light, dramatic focus without visual noise.
- Leonardo da Vinci: explanatory geometry, layered observation, proportion, mechanism and annotated intelligence.
- Tesla: systems, energy flow, precision, technical elegance and invisible machinery behind simple output.

These references define design intent, not literal historical imitation.

## 2. Non-negotiable product rules

- FOOTBALL FIRST.
- EVIDENCE BEFORE CONFIDENCE.
- MECHANISM BEFORE METRIC.
- CONTEXT BEFORE VERDICT.
- ONE VISUAL = ONE FOOTBALL MESSAGE.
- VISUAL CLAIM CEILING <= TEXT CLAIM CEILING.
- EMPTY SURFACE = HIDDEN SURFACE.
- NO GENERIC SaaS/DASHBOARD AESTHETIC.
- NO DECORATIVE DATA VISUALIZATION.
- NO AUTO-PUBLISH.
- NO VISUAL OR UI COMPONENT MAY CREATE TRUTH AUTHORITY.

## 3. Surface gating

Navigation and product affordances are evidence/content-driven.

A surface is visible only when it has real usable content or a working capability:
- Analysis: visible when at least one analysis article exists.
- Scouting: visible when at least one scouting article exists.
- Research: visible when at least one research object exists.
- Visual Lab: visible when at least one admitted visual object exists.
- Culture: visible when at least one culture article exists.
- Hikmet/About: always visible.

A route may exist internally before activation, but it must not be advertised as a clickable public option until it can satisfy user intent.

No "coming soon" surface should occupy primary navigation.

## 4. Screen families

### Editorial
Article, Journal, Research, Culture.

### Intelligence
Player, Team, Match, Metric, Compare.

### Interactive
Search, Ask HP, Data Lab.

The families share design tokens and epistemic language, but not identical layouts.

## 5. Interaction hierarchy

Primary action labels use football/task language:
- READ ANALYSIS
- COMPARE PLAYERS
- ASK HP
- VIEW EVIDENCE
- OPEN VISUAL
- EXPLAIN METRIC
- SEE CLUB vs NT
- EXPLORE MECHANISM

Avoid generic "Learn more" when a precise football action exists.

## 6. Epistemic visual language

Observed, inferred, candidate and unknown must never look identical.

Default semantic distinction:
- observed: solid
- candidate/hypothesis: dashed
- unknown/uncertain: dotted or reduced emphasis
- falsifier/counterevidence: explicit separate signal

Arrow != causality.
Zone != occupation.
Average location != team shape.
Event density != dominance.
Event link != physical trajectory.

## 7. Typography and density

Editorial reading and analytical labels have different jobs.

Current preferred direction:
- body/editorial: high-readability serif family
- headings/labels/UI: disciplined sans family
- technical/code identifiers: monospace only where functionally necessary

Avoid tiny low-contrast copy.
Avoid dense card walls.
Use whitespace and hierarchy to reveal complexity progressively.

## 8. Motion

Motion must explain state, hierarchy or mechanism.

- respect prefers-reduced-motion
- no decorative perpetual motion
- no cinematic delay before content
- interaction feedback must remain semantically correct if animation is cancelled

## 9. Mobile

Mobile is a first-class product surface.

- touch targets remain operable
- text reflows without clipping
- chips/tags wrap or disclose
- dense tables progressively disclose
- primary football task remains reachable without hover
- desktop-only navigation patterns require a mobile equivalent

## 10. Donor doctrine

Donors provide capabilities, not identity.

- Ant Design / MUI: mature behavior and accessibility patterns
- Ant Design Mobile: mobile ergonomics
- Symfony UX: progressive enhancement
- assistant-ui: conversational interaction patterns
- DataTables / Tabulator: dense data interaction
- OpenSearch / Dremio: search and exploration concepts
- vue-data-ui: visualization vocabulary
- globe.gl: geography only when geography explains football context
- GanLab / css-doodle: explanatory or generative visual mechanisms
- Kubernetes / Flutter / Babel: information architecture and documentation governance
- Greene Lab / Uberspace Lab: research/citation workflow
- UI UX Pro Max / DESIGN.md corpora: critique and QA references

No donor becomes HP visual authority.

## 11. Forbidden patterns

- generic purple/blue AI gradient identity
- neon esports styling
- luxury-fashion imitation
- decorative glassmorphism as default
- football-ball/shield/star cliché branding
- empty cards or navigation options
- fake realtime states
- fabricated tracking visuals
- metric walls without football question
- visual certainty above source certainty

## 12. Activation rule

A new public component or surface must pass:
1. FOOTBALL VALUE
2. READABILITY
3. ALIGNMENT
4. EPISTEMIC BOUNDARY
5. REDUNDANCY
6. DENSITY
7. CONSISTENCY
8. MOBILE OPERABILITY
9. ACCESSIBILITY
10. EMPTY-SURFACE CHECK

Failure on truth boundary or empty-surface check blocks public activation.

## 13. Amendment A1 — HPAnalytic identity (2026-10-06, development)

STATUS: DEVELOPMENT AMENDMENT. Not deployed. Sections 1–12 remain in force.

- Public product name: **HPAnalytic** (target domain hpanalytic.com). Descriptor: "Football Intelligence by Hikmet Pınarbaş".
- Mark: frame (observation boundary), vector to a node on the upper third (relation → decision point), inherited HP red tick. No ball, shield or star (§11). The mark is a v1 proposal pending owner approval.
- Tokens live on `:root` in `src/styles/global.css`. The type scale is generated (`src/lib/fluid-type.mjs`) and tested, not hand-tuned.
- Minimum text size: 12px. All text tokens ≥ 4.5:1 on every background token. Focus ≥ 3:1. Enforced by `tests/design-tokens.test.mjs`.
- No CSS `text-transform`. Under `lang="tr"` it produces "ANALYSİS". Labels are authored in final case.
- Evidence classes map to distinct strokes (§6): DIRECT solid, DERIVED double, PROXY dashed, EDITORIAL dotted (`src/lib/evidence.mjs`).
- Navigation must work without JavaScript (progressive enhancement). Archive and Search are corpus capabilities and are hidden while the corpus is empty.
- Content routes are prerendered. Only search and API routes run on the server.
- Donor extraction record: `docs/HPANALYTIC_DONOR_REVERSE_ENGINEERING_2026-10-06.md`.
