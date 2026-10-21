# HPAnalytic — Unified Graphics Architecture v1

## Goal
Combine the reproducible analytical approach (StatsBomb benchmark), multidimensional match model (SkillCorner benchmark), interactive scouting experience (Driblab benchmark) and publishing-grade design templates (Opta benchmark). These are **product design references**, not claims that the vendors use these exact libraries.

## Flow
SportsBase raw exports → Python normalization and evidence audit → versioned `hpa.analytics.v1` JSON envelope → interactive Astro/SVG/JavaScript components → responsive publishing design tokens.

## Contract
`src/lib/hpa-analytics-contract.mjs` is a dependency-free selector/validator shared by browser and Node, with coordinate axes 0–105 × 0–68.

* Spatial dimensions: 3 independent x-axis length zones and 5 y-axis width corridors; 15 intersections.
* Time: full match / half supported in the current evidence series. 15-minute bins become available **only** for minute-precision events.
* Provenance: every event carries `source_match_id` so Arsenal–Lille and Galatasaray–Barcelona never silently become one fixture.
* `timestamp_precision`: minute / half / unknown; do not interpolate unsupported minutes.
* Event-specific uncertain pass receivers and tracking trajectories must remain disclosed or omitted.
* Separation: Python produces immutable, traceable analytical data. SVG/JavaScript owns hover, touch, carousel, tooltips, filters, selection and state; never replace it with flat PNG.

## Non-regression guard
`tests/hpa-unified-analytics.test.mjs` verifies graph interaction hooks, schema and tokens. Other existing tests protect editorial evidence and pitch geometry. This stage does **not** claim that all existing charts now share a global filter state or that the Astro build/browser visual acceptance passed.

## UI design
`src/styles/hpa-chart-tokens.css` defines background, grid, accessible focus and motion tokens for adoption by charts; an independent source-of-truth for consistent appearance. Existing chart CSS stays intact until component-by-component adoption is visually verified.

## Release criteria
1. Source event verification, coordinate directions and original match reference.
2. Node regression suite and Astro build.
3. Mobile / desktop screenshot and keyboard/touch hover checks.
4. Explicit editorial sign-off before merging or deploying production.
