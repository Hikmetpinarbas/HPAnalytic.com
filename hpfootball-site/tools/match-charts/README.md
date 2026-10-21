# Match-page chart pipeline (HPAnalytic)

Run from this folder, with SportsBase files in ../../../data (see calc.py paths).

1. `port.py` — turns a standalone HTML match preview into src/pages/mac/<slug>.astro (CSS prefixed .mp).
2. `calc.py` — events CSV -> momentum (final-third on-ball action difference, 3-min bins) + proxy ball-circulation network (no receiver in data: first team-mate touch within 5 s; never draw arrows).
3. `calc2.py` — UCL player table -> per-90 percentile radar vs same position group (>= 90 min).
4. Team radar: percentiles from the 36-team aggregate (see gscfg/fbcfg "team" json).
5. `patch_page.py page.astro cfg.json` — inserts the four chart sections, data JSON, readability CSS, collapsible sources.
6. Runtime: public/js/hp-match-charts.js (no dependencies). Register the page in src/data/match-previews.mjs with status:'published' only after editorial approval.

Evidence rules (HPA-LOZA): label every figure OBSERVED/DERIVED/MODEL/PROXY; colour never carries meaning alone (team B dashed + square markers); no pass arrows without a verified receiver.
