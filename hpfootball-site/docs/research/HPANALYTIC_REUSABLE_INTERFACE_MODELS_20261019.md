# HPAnalytic — Reference-derived reusable interface models
Date: 2026-10-19. Status: RESEARCH + ORIGINAL IMPLEMENTATION BLUEPRINT, not implemented UI.
Design authority: accepted Google Stitch; dual palettes; original user-accepted logo.
Do not clone other sites' assets/brand identities or proprietary app code.

## Models selected for original HPAnalytic implementation
| ID | Component | Evidence/inspiration | Original HPAnalytic behavior | Data and safety gate | Priority |
| M01 | Editorial Dispatch | FT visual journalism + Guardian interactives | Stitch-led asymmetrical hero, article index, reading rhythm, 2.5D restrained light | Published + human-approved + source-validated only | P0 |
| M02 | Evidence Carousel | Guardian modular stories + existing EditorialCarousel | Horizontal scroll snapping, clear previous/next, touch/keyboard, single/zero items | Existing site-editorial-status gate; no synthetic entries | P0 |
| M03 | Visual Vocabulary Router | FT Visual Vocabulary | Choose football visual by analytical question: distribution, spatial, comparison, change, relationship and flow; reject invalid chart-claim pairings | Metric/denominator/source/claim ceiling before render | P1 |
| M04 | Match Event Explorer | SkillCorner Dynamic Events Explorer (architecture only) | Match, event type and temporal filters; pitch view + event timeline + tabular counterpart | event-only coordinates, never inferred tracking/off-ball | P1 |
| M05 | Scouting Comparison Desk | Driblab XY player scouting/filtering | Two or three players, role/population/league/minutes controls, distribution + percentile detail, explanation | Comparable source, competition, denominator, samples | P1 |
| M06 | Evidence-to-Clip Bridge | Hudl StatsBomb analytics-video linkage | Analytical finding anchored to available licensed footage and exact event time, with screenshot rights | media rights and event anchor required, otherwise text-only | P1 |
| M07 | Research Cabinet | Oculi Mundi digital collection | Editorial collection facets, guided trails, glossary, context, provenance | Published research and auditable bibliography | P2 |
| M08 | Decision Lens | Twelve: event value framing | Question -> observed action -> model estimate -> opposing explanation -> analyst conclusion | Model output explicitly distinct from measurement | P1 |
| M09 | Football Mechanism Simulator | Bartosz Ciechanowski interactive explainers | Scrubbable schematic geometry showing pass lanes or timing as *clearly labeled hypothetical scene* | No synthetic scene masquerading as match fact | P2 |
| M10 | Adaptive Scene Surface | Premium Layered Visual Standard V1; contemporary WebGL practice | Three.js gradient mesh + DirectionalLight, aligned SVG middle and CSS composite foreground; GSAP parallax; fallback | reduced motion, WebGL failure, AA contrast, no on-chart invented values | P1 |

## Interface contracts
M01: HTML landmarks, verified article sources, responsive content priority; motion cannot delay reading.
M02: render no empty control surfaces; focusable nav controls; boundary buttons disabled or semantically nonactionable at edges; verify scroll position after responsive changes.
M03: recommend chart via semantics not spectacle; produce reasoning for selection and disallow missing observation type.
M04: stable event IDs, source XY coordinate normalization, no automatic tracking overlays.
M05: show population definition, sample size, minutes, date window and percentile calculation source.
M06: never embed unlicensed videos or external provider logos.
M07: bibliographic source identity and publication permissions preserved.
M08: clear threshold and claim ceiling for derived/event-value model.
M09: hypothetical/model diagrams labeled permanently, including exports.
M10: progressive enhancement, no intrusive perpetual background GPU loops, reduced motion static state and smartphone thermal checks.

## Original visual directions
- Botanical editorial surfaces: porcelain/paper/ink/forest; sage/gold are accents, not small-print foreground text.
- Night intelligence surfaces: night/ivory with amber, copper and electric blue for functional accents, not a second unrelated site.
- Spatial choreography: information grouping by proximity, gaze continuity between typography and graphics, layered figure-ground, synchronized common-fate motion.
- Photography/graphics: source-led editorial figure with explicit rights and alt text, never stock substitution for an actual player's appearance.
- All art direction starts from accepted Stitch exports. The design candidates in this report do not replace those.

## Primary research sources
SkillCorner interactive viz: https://skillcorner.github.io/opendata/viz_tools/
SkillCorner football: https://www.skillcorner.com/sports/football
Driblab XY: https://www.driblab.com/driblab-xy
Hudl StatsBomb: https://www.hudl.com/products/statsbomb/platform
Twelve analytics: https://analytics.twelve.football/analytics
Guardian interactives: https://www.theguardian.com/interactive
FT chart vocabulary: https://github.com/Financial-Times/chart-doctor
FT MIT chart template sources: https://github.com/ft-interactive/visual-vocabulary-templates
Oculi Mundi: https://oculi-mundi.com/about/about-oculi-mundi

## License note
Financial Times visual-vocabulary-templates source states MIT code license; it expressly excludes FT content and branding. Check individual file dependencies and license notice before adaptation. All model IDs and HPAnalytic implementations must be original and clearly distinguishable.

## Next operator action
Implement M01/M02 in existing isolated P0 branch after checking concurrent agents' changed_paths. Do not duplicate live Jules carousel changes. No merge/push/deploy without user approval.
