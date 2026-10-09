# HPAnalytic — Brand/Product Delta 01
Date: 2026-10-08. Status: CANDIDATE / REVIEW. Publication: OFF.

## Baseline protection
- ACCEPTED RELEASE BASELINE: 9ecb9126d8684bd42865eb8c334c24d0618be204.
- Baseline branch release-pack-01-candidate was not modified.
- Candidate isolated in git worktree/branch brand-product-delta-01.
- Explicit HOLD tests/home-hikmet-spotlight.test.mjs untouched.
- No deployment, no publication, no HUMAN_APPROVED.

## Evidence inspected
- Current physical repo HEAD and source: homepage, Logo, BaseLayout, global CSS.
- Approved, currently public article: event-only-boundary.md (qualityStatus HUMAN_APPROVED, sourceClaimsValidated true, sourceRefs reference-only).
- Existing visual asset evidence-surfaces.svg, explicitly labeled conceptual and NOT actual match coordinates.
- Existing physical Chrome baseline screenshots hpa-final-mobile.png and hpa-final-wide.png. The candidate physical screenshot was attempted but screen capture returned black (device screen asleep); candidate physical visual acceptance remains PENDING.
- Candidate generated HTML: 12-page QA static build PASS; homepage contains featured evidence object and explicit conceptual disclaimer.
- Regression after candidate: 237/237 PASS (baseline 235 + two focused tests), excluding explicit HOLD.

## Section-by-section new value vs repetition
- Hero: clear football thesis and brand; mobile first viewport is mostly text and buttons, while actual football/evidence visual appears later. Brand/product delta OPEN.
- Featured analysis: real admitted article, source/claim boundaries. Before candidate lacked visible evidence object; candidate reuses existing approved conceptual visual with explicit 'GERÇEK MAÇ VERİSİ DEĞİL'. Delta improved; physical candidate review pending.
- Match Centre: actual fail-closed feed; when unavailable, large empty state risks competing with evidence. Keep integrity; prioritize product behavior based on real data readiness. Delta OPEN.
- Evidence Bridge: transparent claim-discipline, but abstract method overlaps Research and Principles. Preserve, consider progressive disclosure only after actual corpus/object admission.
- Research: useful question/counterevidence method and real /research link; overlaps Evidence Bridge; no public research objects admitted. Keep but do not fabricate.
- Scouting: distinct role/context/transferability decision framework and real /scouting link; no admitted player case. Keep, later anchor in real corpus.
- Principles: restates hero signature and evidence discipline; candidate for lower visual prominence, not deletion.

## Visual grammar physical/source assessment
- HP monogram: diagonal break + white/amber identity present; master geometry not reopened. Identity acceptance not fully closed by technical tests.
- Header/navigation: mobile search and MENU are distinct; landscape/tablet screenshot shows header wrapping to two rows. Responsive refinement OPEN.
- Background/light: controlled black/amber; no neon/dashboard. Source geometry may be more decorative than explanatory above fold; OPEN.
- Type: large editorial serif headline legible on baseline screenshot but consumes mobile first viewport; OPEN.
- Buttons: primary and secondary clear and >=44px, but occupy substantial mobile height; OPEN.
- Mobile compression: no observed baseline clipping, yet football evidence object is below first fold; OPEN.
- Cool blue relation / red breach rules preserved in candidate.

## Candidate change
- Added a featured evidence figure ONLY when the admitted featured article is event-only-boundary.
- Reused existing source asset; no new rights or data assumptions.
- Caption explicitly marks conceptual schema, not real match data.
- Changed abstract sidebar explanation to a concrete football question for that article only.
- CSS responsive and readable; font size >=12px.
- No new route, product surface, fake tracking, or claim escalation.

## Acceptance
- Source/claim/rights boundary: PASS (existing admitted asset; no new data).
- Generated QA build: PASS 12 pages.
- Baseline regression: PASS 237/237 including two new tests.
- Physical candidate mobile/desktop/200%: PENDING (screen asleep/black capture).
- BRAND READY: NOT YET.
- EDITORIAL CORPUS READY: NOT ASSESSED in this WIP.
- DATA/API READY: NOT ASSESSED in this WIP.
- RELEASE READY: baseline only; candidate not admitted.

## Next bounded action
- When physical Chrome is available without disturbing user: capture candidate mobile, landscape, 200% and compare to baseline. If figure fails legibility/hierarchy, REPAIR or REJECT candidate.
- Then address mobile first-screen compression and header wrap as one evidence-driven visual delta; rerun all 235 baseline tests.
- Do not merge candidate into baseline or deploy without higher-stage acceptance.

## Candidate delta 02 — 2026-10-08 03:18 TRT
- Reinspected exact physical source: baseline branch still at 9ecb912; candidate branch isolated at 9e7109f before this change.
- New bounded change: JS-enabled <=900px header retains a single row while no-JS fallback retains wrapped visible navigation; brand can shrink, action controls remain operable.
- Mobile <=560px first-contact whitespace reduced without removing thesis, pitch diagram, admitted featured article, Research, or Scouting. This is a visual hierarchy candidate, not a new capability or football claim.
- Test-first: two new focused tests failed before CSS repair, then passed 2/2.
- Governed regression excluding HOLD: PASS 239/239, 0 failed (235 baseline + four candidate tests).
- Isolated static QA build from candidate source: PASS 12 generated HTML pages; featured evidence object and mobile CSS physically present in generated output.
- Device wakefulness observed Dozing; no screen wake was attempted, to avoid disturbing the user overnight. Physical candidate mobile/wide/200% visual acceptance remains PENDING. Browser acceptance cannot be inferred from static tests.
- No merge, deploy, publication, HUMAN_APPROVED or baseline mutation. Candidate remains REVIEW; BRAND READY remains NOT YET.
- Next physical check: 375px mobile first screen, wide header, 200% text, menu/search tap targets, conceptual evidence figure legibility. Reject/repair if header collides or evidence is too low.

## Candidate 02 independent recheck — 2026-10-08 04:10 TRT
- Fresh candidate and baseline worktrees checked: candidate 9e7109f plus staged responsive CSS; accepted baseline 9ecb912 unchanged; HOLD untouched.
- Fresh governed regression excluding HOLD: 239/239 PASS, zero failures. Evidence log: ~/.cache/hpanalytic-brand-03-tests.log.
- Header source: search and mobile disclosure separate; JS header nowrap, no-JS navigation wraps. At 320px and 200% text, collision cannot be ruled out from source tests; visual acceptance OPEN.
- Mobile hero: spacing reduced without removing football thesis, TacticalCanvas, admitted evidence object, Research or Scouting. Actual first-fold visibility UNKNOWN until physical screen check.
- Section value: featured evidence object = NEW; Evidence Bridge = method but abstract; Research = useful yet partly repeats bridge; Scouting = distinct role/transferability lens; Principles = repeat risk. Preserve all pending editorial corpus admission; do not prune blindly.
- Visual acceptance: logo/monogram, nav, darkness/amber, cool-blue relation, red breach rule, geometric field, type and buttons present in source. Their separate HPAnalytic identity acceptance is PENDING, not implied by tests.
- Device was Dozing; no screen wake, density, or rotation mutation. Physical mobile, wide, 200% remain PENDING.
- Status CANDIDATE/REVIEW. BRAND READY NOT YET. No merge, deploy, publication, HUMAN_APPROVED.

## Candidate 04 — 2026-10-08, fresh Termux + Firefox review
- Remote Desktop Commander: Android Termux online; local isolated candidate exact HEAD 9e7109fa59d58399125e585c3fc411c9489359a7, working tree modified; release-pack-01-candidate remains identical to accepted 9ecb9126d8684bd42865eb8c334c24d0618be204 by GitHub compare.
- Verified Evidence Bridge source defect: var(--display), var(--mono) are undefined; replaced with existing var(--font-serif), var(--font-mono) only in candidate. Added tests/brand-evidence-typography.test.mjs; RED before fix, GREEN after fix.
- Firefox headless rendered 320px, 375px and 1440px using last candidate HTML build + current CSS in isolated QA snapshot. This is NOT a fresh full candidate build and NOT on-screen Chrome acceptance.
- Visual finding: HPANALYTIC wordmark broke at 320px/375px. Fixed actual Logo.astro selectors .hp-mark and .brand b with <=420px CSS, preserving search and MENU controls. At 320px latest screenshot, wordmark now one line and controls do not visibly collide.
- Test-first mobile header check added. First 11px attempt failed existing design-tokens minimum 12px contract (240/241); rejected. Repaired to 12px with reduced letter spacing. Fresh governed regression: 241/241 PASS, 0 FAIL, explicit HOLD home-hikmet-spotlight excluded. Log ~/.cache/hpanalytic-brand-07-tests.log.
- Build attempt blocked by missing candidate node_modules; shared Astro executable had missing Android native binding or unresolved tsconfig. No fresh production build PASS. No dependency reinstall or baseline mutation.
- Evidence object remains below mobile first viewport; conceptual TacticalCanvas is not admitted match tracking. Research/Evidence repetition still review-only; Scouting preserved. 200% text and on-screen Android Chrome interaction not physically accepted.
- Candidate CSS/test files modified only in isolated worktree; no commit, merge, deployment, publication or HUMAN_APPROVED. AUTOPUBLISH=OFF. Status CANDIDATE / REVIEW / HOLD.
- Next WIP: restore safe isolated build using known-good dependencies without altering accepted baseline, then physical mobile/desktop/200% acceptance. Reject or repair if exact build contradicts QA preview.
