# HPANALYTIC / LILLE–GALATASARAY — VISUAL BRIEF

Status: editorial engineering contract. n=2 UEFA games per team. All figures responsive SVG, keyboard focus and touch fallback, reduced motion, source access. Event maps use CSV/XML event positions only.

## G01
- graphic_id: G01
- editorial_section: Baskı ve savunma geçişi
- football_question: Lille ve Galatasaray topu hangi bölgede kaybediyor?
- evidence_source: SportsBase UEFA XLSX; Arsenal–Lille ve Barcelona–GS player CSV/XML
- required_data: match_id,team,half,start,pos_x,pos_y,action=Lost balls
- metric_definition: own_half_share=own_half_losses/all_losses
- analytical_claim: Lille %33.6 (41/122), GS %18.0 (22/122)
- counterevidence: Lille Arsenal etkisi 27 own-half; Betis 14
- uncertainty: n=2/team, coordinates from actual CSV
- claim_ceiling: Observed distribution only; no press geometry
- interaction_requirements: SVG pitch point toggles by team/match/half; selectable bins
- intended_reader_insight: Location asymmetry
- acceptance_criteria: Points trace to CSV ID; source x/y; no fabricated point
- readiness: EVENT_JOIN_PENDING

## G02
- graphic_id: G02
- editorial_section: Savunma→hücum geçişi
- football_question: Kazançlar kayıpları izliyor mu?
- evidence_source: Matched team/player CSV XML
- required_data: event_id,half,relative_seconds,team,action,pos_x,pos_y
- metric_definition: temporal candidate link <= predefined window; audit collisions
- analytical_claim: Event transitions may identify opportunities
- counterevidence: Simultaneous labels and separate possession events
- uncertainty: Timing/sequence unresolved until join audit
- claim_ceiling: Candidates not actual pressing interceptions
- interaction_requirements: Time slider, show only validated links
- intended_reader_insight: Recovery-to-consequence distinction
- acceptance_criteria: Provide positive/negative matched examples and join audit
- readiness: EVENT_JOIN_PENDING

## G03
- graphic_id: G03
- editorial_section: Karşılıklı eşleşme
- football_question: Her takım rakibin kayıp örüntüsünü zorlayabilir mi?
- evidence_source: Four UCL matches + coordinate events
- required_data: team/match/loss/recovery/shot mapped
- metric_definition: symmetric offence-defence matchup, no causal model
- analytical_claim: Two-sided hypothesis
- counterevidence: Arsenal and Barcelona opposition effects
- uncertainty: N small, unmatched contexts
- claim_ceiling: Question matrix, no inferred tracking
- interaction_requirements: swap focal teams, contextual event filters
- intended_reader_insight: Two distinct mechanisms
- acceptance_criteria: Both teams represented with balanced evidence
- readiness: EVENT_JOIN_PENDING

## G04
- graphic_id: G04
- editorial_section: Hücum ve savunma
- football_question: Kim ne kadar xG üretiyor ve veriyor?
- evidence_source: SportsBase 19.10 UCL Match stats
- required_data: xG,OxG, team,match
- metric_definition: net_xG=xG-OxG
- analytical_claim: Lille 1.28/3.57/-2.29; GS 1.87/3.88/-2.01
- counterevidence: Opposition schedules differ
- uncertainty: 2 games/team
- claim_ceiling: Descriptive xG only
- interaction_requirements: paired diverging dot plot, opponent filter
- intended_reader_insight: Net chance quality imbalance
- acceptance_criteria: Arithmetic recomputed; labels n=2
- readiness: AGGREGATE_READY

## G05
- graphic_id: G05
- editorial_section: Yerleşik savunma
- football_question: PPDA ile kazanım birlikte nasıl değişiyor?
- evidence_source: SportsBase UEFA match statistics
- required_data: PPDA,ball_recoveries,match,team
- metric_definition: x=PPDA; y=recoveries; match series
- analytical_claim: Lille PPDA mean 14.73 / recoveries 42.5; GS 8.09 / 40.5
- counterevidence: Different opponents and provider semantics
- uncertainty: Two-game arithmetic PPDA mean
- claim_ceiling: PPDA not tracking-derived press coordination
- interaction_requirements: 4 match dots hover, compare toggle
- intended_reader_insight: Different defensive action rates
- acceptance_criteria: Explain axes and no causal trendline
- readiness: AGGREGATE_READY

## G06
- graphic_id: G06
- editorial_section: Yerleşik hücum
- football_question: Şut fırsatlarının ortalama kalitesi nasıl ayrışıyor?
- evidence_source: SportsBase UEFA XLSX
- required_data: xG,Shots,team,match
- metric_definition: xG_per_shot=xG/shots
- analytical_claim: Lille 0.128; GS 0.156
- counterevidence: Small shots n=10/12
- uncertainty: No inferential superiority
- claim_ceiling: Shot-level average, not shot location
- interaction_requirements: dumbbell + raw numbers
- intended_reader_insight: Chance quality per observed shot
- acceptance_criteria: Exact denominators shown
- readiness: AGGREGATE_READY

## G07
- graphic_id: G07
- editorial_section: Çok maçlı karşılaştırma
- football_question: Hangi rakipte hangi fark belirginleşiyor?
- evidence_source: SportsBase 19.10 UCL match stats
- required_data: Betis,Arsenal,Sporting,Barcelona; Shots,xG,OxG,PPDA,ownhalf_loss
- metric_definition: Rows per match, no sum of overlapping sheets
- analytical_claim: LIL Betis 6/1.06/1.56/11.62/14; Arsenal 4/.22/2.01/17.84/27; GS Sporting 9/1.55/1.32/5.10/7; Barcelona 3/.32/2.56/11.08/15
- counterevidence: Different score situations
- uncertainty: Four observations
- claim_ceiling: Descriptive only
- interaction_requirements: sortable matrix with raw values
- intended_reader_insight: Opponent conditioning visible
- acceptance_criteria: All five dimensions verified against XLSX
- readiness: AGGREGATE_READY

## G08
- graphic_id: G08
- editorial_section: Editoryal özet
- football_question: İki takımlı ana mekanizma ne?
- evidence_source: G01 G04 G05 G06 certified outputs
- required_data: 122/122 losses; own half 41/22; xG 1.28/1.87; xGA 3.57/3.88
- metric_definition: Derived arithmetic and evidence registry
- analytical_claim: Identical losses unequal geography
- counterevidence: 2 games/opponents differing
- uncertainty: uncalibrated comparison
- claim_ceiling: Not a predictive score model
- interaction_requirements: linked figure selections, citation disclosure
- intended_reader_insight: Claim-evidence-counterclaim in one view
- acceptance_criteria: All data and source version match
- readiness: AGGREGATE_READY

## QA gates
- Do not double count CSV and XML instances.
- Preserve source_id, event_id, timestamp and coordinate reference for each point.
- No tracking, player movement, true pass recipient or pressing synchrony invented.
- Fail closed on unverified x/y orientation; identify origin and team direction.
- Ship only after build, runtime checks and mobile regression.
