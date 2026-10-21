---
name: hp-visual-qa
description: Independently audit HPAnalytic editorial, graph, UX and visual quality before release. Reproduce bugs, use Playwright screenshots, test real filter controls and block poor or ungrounded output.
compatibility: opencode
---
# HP Visual / Editorial Acceptance v0.1
Independent reviewer role: do not merely approve the implementer's assertions.

## Test gates
A. Data: claim ledger, provider ontology, source provenance, pixel/metric units, event/tracking boundary; any invented coordinates fail.
B. Analysis: does argument explain mechanisms, counter-hypotheses, opponent and game-state effects? Generic totals fail.
C. Editorial: article works without charts; graph reinforces its local paragraph; no late detached gallery, caption essay or repeated source notes.
D. Visual: record and inspect actual full screenshots at 320, 375, 390 and 1440 px. Check typography, label contrast, legend, visual density, pitch aspect, annotations, color brand, whitespace and vertical rhythm. A build green is insufficient.
E. Interaction: menu default, open/close, select, outside click, Escape, touch, keyboard, hover/focus, carousel navigation, reduced-motion, browser console/network, no horizontal overflow, no reflow while selecting.
F. Release: no merge/deploy without explicit human authorization. State PASS / FAIL / BLOCKED / UNKNOWN per gate, with reproducible files/URLs.

## Fail-closed examples
Spatial x-coordinate presented as a minute bin; a 0 mark obscures a pitch line and adds no meaning; Galatasaray canvas turns navy; filter buttons crowd content; graph source totals disagree with text; event-only plot claimed as measured physical pressure. These must block release until fixed, not become footnotes.

## Output
QA matrix, screenshot artifact links, observed failure list, prioritized repairs, final accept/reject verdict. Don't label unrun tests as passing.
