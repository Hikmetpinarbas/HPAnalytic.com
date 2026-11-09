# HPANALYTIC — CODEX MASTER DIRECTIVE / COMPLETE DESIGN TRANSFORMATION
Date: 2026-10-28 | Owner: Hikmet Pınarbaş | Status: AUTHORISED FOR RESEARCH, DESIGN, IMPLEMENTATION AND LOCAL QA; NOT FOR PUBLICATION OR DEPLOYMENT

## MISSION
Rebuild the visual architecture of the ENTIRE existing HPAnalytic website, not merely the derby article, as a coherent, original, world-class editorial/analytical product. Preserve and migrate all relevant working functionality, URLs, SEO assets, data lineage, analytics and accessibility. Do not deploy, publish, alter production, or push to protected branches without explicit separate owner approval. Do not blindly discard existing code or contracts: inventory, archive, map dependencies, replace with versioned and tested specifications. Produce finished tested staging implementation, not wireframes or aspirational plans.

## FIRST: READ THE ACTUAL SYSTEM (NO ASSUMPTIONS)
1. Determine actual live repo root and current branch through inspection; confirm git status, package manager, framework, CI, routes, content types, CMS/deployment wiring and data/visualisation contracts. Do not guess. Preserve a clean rollback point without changing production.
2. Review relevant OpenCode sessions and recent HTML, including /home/userland/HP_WORKSPACE/DERBY_GS_FB_20261026/visual_release_candidate/HPAnalytic_Derbi_Interactive_Atlas.html and brand_assets_v3. Survey existing site components, old themes, design assets, type scales, style contracts, design systems, editorial pages, women's corner, analytical reports and mobile flows.
3. Compare the uploaded HPAnalytic SOURCE ATLAS LOSC Lille vs Galatasaray screenshot (supplied in the ChatGPT task) as the **visual-quality FLOOR, not a final template**: near-black canvas, precise 105x68 pitch frames, high information density, balanced grid, amber/blue restrained team accents, strict scale legends, detailed provenance and technical clarity. Improve its flaws (overlapping text labels, weak visual hierarchy, illegible microcopy, insufficient responsive fit).
4. Check real available Edd Webster and Khrishna/Krishna repositories before adopting any code. Explicitly identify exact repo, commit/license, figures and chart idioms; reuse only legally compatible code/assets with notices. Avoid false repo attribution. Study https://github.com/eddwebster/Pass-Flow and Edd Webster's broader visualization work; search the existing device filesystem for Khrishna repository rather than invent an identity.
5. Reverse engineer the public **behaviour and information architecture**, not copy proprietary source, identity or protected assets, of https://skillcorner.com/sports/football and https://www.driblab.com/ . SkillCorner ideas: high-quality tracking/data storytelling, multimodal visualization; Driblab ideas: scouting hierarchy, exploration workflow, filtering, concise proof-led dashboards. Do not claim to have their proprietary tracking data or algorithms.

## CREATIVE NON-NEGOTIABLES
The site's established Caravaggio × Leonardo da Vinci × Nikola Tesla DESIGN FOUNDATION remains fixed in spirit, but is converted into explicit governed tokens and reusable systems:
- Caravaggio: chiaroscuro, intentional visual drama, image lighting, monumental contrast, selective spotlighting.
- Leonardo: anatomical/technical drawing, disciplined geometry, notebook-like detail, editorial balance, intelligent annotation.
- Tesla: fine luminous tracery, restrained electric-blue data accents, scientific elegance, motion dynamics and responsive systems.
- Keep black/charcoal, amber/gold and cool-blue data distinction; introduce a distinct feminine-inviting editorial sub-brand without stereotypes or gender-essentialist assumptions. Respect actual diverse women audiences, not speculative psychological exploitation. Female readers/contributors must receive a genuinely welcoming, prominent top-level navigable editorial space with their own voices, strong editorial framing, and good content access. Design for interest, autonomy, trust and editorial representation.
- Existing HPAnalytic SOURCE ATLAS uploaded image is minimum quality floor. No generic Bootstrap dashboard, meaningless neon, inaccurate heatmap, empty gradients, AI-generated text instead of data, or fake award claims.
- Gestalt design principles: proximity, similarity, common region, figure/ground, continuity, closure, visual hierarchy, cognitive load. Apply measurably in composition, microinteractions, reading flow, not pseudo-psychotherapy or manipulative dark patterns.
- A genuinely elegant responsive visual identity: desktop wide, tablet, Android mobile first, low-end mobile / low-motion adaptations. Define typography, spacing, grid, pitch coordinate transforms, data palettes, card ratios, animation tokens, editorial graphic specifications and component contracts.

## SCOPE — THE WHOLE SITE
A. Navigation: progressive disclosure, moving menus, sticky reading nav, keyboard and touch accessible mega nav, breadcrumb, search, topic hubs, women's editorial section, latest/series and research archive.
B. Editorial content: hero, hover/touch image carousels, animated article section transitions, timeline storytelling, rich but restrained illustrations, scroll-driven highlights when safe, short paragraph rhythm, embedded analytics cards, citations and author/source blocks.
C. Analysis/stats: shot maps, xT grids ONLY IF VALID DATA, passing maps only if recipient verified, pitch diagrams, ball recoveries, role comparisons, player profiles, research dashboards, interactive filters. Never infer absent pass targets/possession IDs.
D. Media: editorial photography rights, responsive images/AVIF/WebP, poster frames, video and animations with user controls, image credit.
E. Dedicated women's editorial area: naming/navigational fit, inviting visual tone, contributor-driven first-person stories, scientific/culture/sport profiles, feminist-respectful representation; do NOT conflate women with pink UI or manipulative psychological levers.
F. Growth: credible SEO, crawlable SSR/SSG, canonical, schema.org Article/NewsArticle when appropriate, OG/Twitter metadata, CWV, image search, internal links, social-ready share cards designed for Turkish football conversation without inflammatory bait.
G. New governance: maintainable ADR, design tokens, component inventory, data provenance, schema verification, contributor editorial agreement, graphic acceptance, visual QA and SEO acceptance; do not unilaterally delete legally important contracts.

## DERBY FEATURE: FLAGSHIP DEMONSTRATION
Article: 'Galatasaray Derbiyi Şutlarda Değil, Şutlardan Önce Kazandı' | Galatasaray 2–1 Fenerbahçe | 2026-10-26.
Locate the approved full text as provided by owner; do NOT invent an article or silently rewrite. If source file unavailable, report exact blocker and use clearly labeled placeholders for page integration. The original article is not an invitation to change editorial conclusions.
Actual data:
 /home/userland/HPAnalytic/ENGINE_V1/runs/gs-fb-derby-20261026/
 /home/userland/HP_WORKSPACE/DERBY_GS_FB_20261026/
 Visuals /visual_release_candidate/editorial_v2, /brand_assets_v3
 Specific source JSON: final_acceptance, analysis_band_acceptance, goal_mechanisms, goal_mechanism_windows, verified_turnovers, shot_reconciliation, shot_pattern_evidence, mechanism_analysis_report, source_capability_audit.
 Claims: Galatasaray 20 vs Fenerbahçe 4 shots, xG 2.71 vs 0.67 sourced from provider workbook, 51 vs 10 box actions. Player-located shot data only 20 of 24; 4 GS attempts have unlocated coordinates. Verify.
 28 verified mirrored turnover pairs / 18 GS and 10 FB windows are sample not total possessions. Pass recipients unverified; never draw invented causal pass arrows or team trajectories. Use source-labelled timeline observations and source notes.
 Design: premier cinematic hero and poster, shareable Turkish 4:5 carousel, 16:9 desktop hover carousel (on mobile swipe), goal chronology storytelling for three goals, subtle motion, accessible longform reading. Keep statistics visible but not a lifeless dashboard.
 Produce responsive 1920x1080, 1200x630 OG, 1080x1350 Instagram, 1080x1920 Story, 1600x900 X and unique article hero assets. Original content/graphic design; preserve source license.
 Provocative but factual Turkish message 'DERBİ 2–1 BİTTİ. OYUN 2–1 DEĞİLDİ.' and '20–4 ŞUT • 51–10 CEZA SAHASI AKSİYONU'; no deceptive/statistically unsound graphics.

## DEVELOPMENT EXECUTION
Use independent specialisms (or subagents) for: reverse engineering/product research; senior visual art direction; motion/UX; front-end architecture; back-end and data contracts; football tactical analysis; football statistician; mathematics/statistical QA; Gestalt/cognitive ergonomics; women audience and inclusion research (no clinical therapy claims); technical SEO; accessibility; QA/security/performance.
Work in ordered stages:
0. Baseline forensic audit and exact repo inventory, branch/commit, last deployed version, existing visuals, constraints and risk list. Save existing screenshots and contract snapshots.
1. Reverse engineering dossier: SkillCorner, Driblab, Edd Webster and confirmed Khrishna, with legally reusable behaviours, references and feature map.
2. A TRUE site-wide visual language and design-system token spec; three viable design directions maintaining Caravaggio/Leonardo/Tesla foundation; choose strongest against user constraints, preserve brand essence.
3. Working implementation in local isolated branch/worktree only; migrate all site pages/components with design cohesion and suitable controlled route rollout; reusable code; real interactive hover, carousel, dropdown, animation states.
4. Implement flagship derby page and the women-focused editorial hub as first polished vertical slices, then all remaining site sections.
5. Tests FIRST for changed logic (unit, integration, E2E); screenshot diffs across breakpoints; keyboard navigation; WCAG 2.2 AA accessibility; reduced motion; color contrast; performance Core Web Vitals (LCP, CLS, INP), metadata structured data, no regression of site navigation or analytics.
6. Visual audit on actual mobile and desktop; clearly enumerate broken flows and fix before calling any page 'done'.
7. Produce complete local candidate, asset index, readme, evidence register, before/after visual comparison, independent QA report, rollback plan and a release request for the owner.

## STRICT RELEASE GATE
Never deploy to live website, DNS, publishing CMS, production CDN or public preview with publication implications without explicit, separate approval by Hikmet Pınarbaş. Changes should be confined to safe local isolated worktree/branch. No destructive deletes or overwrite of source research/engine. Do not consider tests passing to be owner approval. Current ENGINE_V1 has engine_ready true but publication_ready false; these are distinct from UI readiness.

## MEASURED ACCEPTANCE
Site-wide route inventory preserved or migration redirects proven. 0 known critical accessibility defects; usable keyboard-only navigation and touch carousel; responsive width 360/390/768/1280/1600; reduced motion works. Real charts with stated denominators and accurate provenance; no unsupported analytics. Meaningful original editorial art; discoverable women's hub; share asset legibility at phone size; SEO metadata + rich-results validity; local build/tests passing, screenshots reviewed. Design is professional and distinctive; no unverifiable 'award-winning' guarantee. Evidence-backed assessment, no arbitrary completion percentage.

FIRST MESSAGE BACK: Return inspected repo roots, checked OpenCode sessions, existing design and assets, actual Edd/Khrishna paths, design-system baseline, risk register, worktree path and concrete first implementation deliverables. Do not spend all execution on planning. Start safe local production code following audit.
