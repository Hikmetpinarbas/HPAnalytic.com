# HPAnalytic / Lille–Galatasaray — Visualization Rebuild Contract (2026-10-21)

Status: DESIGN_RESEARCH / NOT ACCEPTED FOR PRODUCTION. This document does not certify underlying player identities or event accuracy.

## Objective
Rebuild, not reskin, the match-analysis graphics. The publication must offer defensible analytical conclusions alongside high-fidelity, layered responsive visualization. Each graphic has one research question, a data contract, an interaction model, an interpretive paragraph, and a falsification/limitation statement.

## Visual grammar
- Team identity: foreign teams white #F6F7FA; Turkish teams their own club color (Galatasaray #FFD24D), dark warm burgundy article field. Use gold ONLY for selected state or editorial emphasis, never an arbitrary dataset category.
- 3-tier composition: editorial narrative layer; analytical geometry layer; inspectable evidence layer. Optional depth through translucency, subtle camera shading and spatial hierarchy, NOT decorative 3-D axes that distort measurement.
- Controls: compact segmented chips, 36–40px visual height with accessible 44px target, grouping by metric/time/zone; contextual flyout, not giant stacked buttons.
- Readability: independently usable phone viewport 320px; hover always has touch and keyboard equivalent; focus visible; reduced-motion fallback; screenshots/video check of selected and unselected states.
- Source labels: one unobtrusive methodology expander PER chart (data, units, denominator, date, alternatives); editorial explanations prominently visible. Do not repeat 'TÜRETİLMİŞ', 'MODEL', 'TAHMİNİ' paragraphs as primary visual content.

## Rebuild decisions
| Current component | Decision | Replacement | Why |
| --- | --- | --- | --- |
| Shots on rectangular schematic pitch | REPLACE | Dual-panel high-fidelity shot atlas: proportional shot location marks; goal/block/miss glyph shapes; xG-scaled point size ONLY when event-level xG exists; compact outcome rail; mirrored attack direction | Honest depiction of events; no fake event-level xG |
| 36-team metric scatter | REBUILD | Sortable percentile/rank ladder with 36-team distribution density and median reference, hover exact rank and tied values | Makes comparison and ordinal scale intelligible |
| 8-axis radars | DE-EMPHASIZE | Head-to-head aligned percentile dot plots with uncertainty/support band; radar secondary tab only | Easier to read positional and small-sample differences |
| Estimated pass network | REMOVE from lead | Evidence laboratory with explicit temporal heuristic and confidence; no directed pass edges | Receiver ID absent; inferred topology must not pose as observed |
| 3x5 corridor scene | REBUILD | Layered tactical board with selectable event heat cells, event footprints, hypothesis storyboard and source match selector | Events ≠ player tracking; the old schematic should not imply a real sequence |
| 'Pulse' time difference | REWORK | Normalized 3-min attacking-event ribbon with opponent context and separate goal markers, NEVER possession or pressure indicator | Scope matches available on-ball event counts |
| Massive feature controls | REPLACE | Mobile scrolling segmented controls, compact select for secondary dimensions and one visible active-filter summary | Controls should not bury the pitch on mobile |
| Data ticker | KEEP as supplementary | Condensed numeric summary below lead; no duplicated explanation in every chart | Evidence should support story rather than replace it |

## Data truth gates (block release on violations)
1. Identify exact source dataset per match, coordinate system, attack direction, period, event subtype and filtering denominator.
2. Never label coordinate intervals 0–35/35–70/70–105 as minute intervals. These are schematic field thirds only. Minute bins require valid event timestamps.
3. No fabricated xG, off-ball runs, pressure contour, passing receivers, automated tracking or shot trajectories.
4. Reconcile Lille 27 official losses vs 26 plotted events with separate completeness badges; never quietly change denominator.
5. Audit ALL named player identities and cited fixtures against original records/official lineup before release. A plausible name is not evidence.
6. 36-team tied ranks must be visibly tied, and every metric direction ('high better', 'low better') consistent.
7. Editorial assertions distinguish observation, inference, mechanism and live-match falsification.

## First complete editorial module (priority)
**Question**: Under what conditions can Galatasaray turn Lille's first-phase turnovers into high-value attacks?
- Lead: Lille vs Arsenal: 14 of 26 mappable defensive-third losses, 26/27 provenance discrepancy.
- Counterweight: Galatasaray vs Barcelona: 1 of 8 opposition-half recoveries in attacking third. Different opponents: comparison NOT causal effect.
- Tactical alternatives: first-pass trap, wing isolation, press bypass.
- Three synchronized views: shot atlas (only events with locations), possession phase ribbon (only timestamps verified), field-third origin density (existing event XY).
- Storyboard subtitles use conditional voice: 'olursa', 'gerektirir', 'kanıtlamaz'.
- A referee for evidence quality can hide each unsupported layer.

## Acceptance
- Design review with 320/390/1440px actual screenshots, interaction video/click test for each filter, no horizontal overflow and reduced-motion.
- Editorial reviewer signs off conclusions and names. Data-owner provides source CSV/XML/XLSX manifest with observed_at and coverage.
- Must be reviewed before production; current PR #68 is an interim readability fix, NOT a visual-rebuild acceptance.

## Grounded technical references
- SkillCorner tracking viewer with Voronoi/pitch control and synchronized tracking: https://skillcorner.github.io/opendata/viz_tools/ — tracking features require tracking data.
- mplsoccer pitch-gallery patterns: https://mplsoccer.readthedocs.io/en/latest/gallery/pitch_plots/index.html — shots, zone density, passes, pitch plots.
- mplsoccer plotting overview: https://mplsoccer.readthedocs.io/en/latest/index.html — scatter/hexbins/heatmaps/radar.
- Datawrapper keyboard and screenreader chart explorer: https://www.datawrapper.de/academy/how-we-make-sure-our-charts-maps-and-tables-are-accessible
