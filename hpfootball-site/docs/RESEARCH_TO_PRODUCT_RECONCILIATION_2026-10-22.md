# HPAnalytic — Research-to-Product Reconciliation (22 October 2026)

**Status:** Independent read-only audit of current connected GitHub and selected Google Drive sources; documentation-only proposal. **Not a completed OpenCode session audit, visual QA pass, deployment, or production acceptance.**

## Scope and source authority

- Repository: `Hikmetpinarbas/HPAnalytic.com`, target branch `site-hp-standard-v2`.
- GitHub PRs #81, #83, #84, #85, #87, #89, #93 were queried on 22 October 2026. The first six were **open draft / unmerged**; #93 **merged**.
- Recent GitHub commit search returned `c82fb48`, `5c8312d`, `18385dc`, `453abdd`, `4d174be`, `dcb60fe`, `c776100`. A commit being present in search does not independently prove current production behavior.
- Drive documents read: `HPAnalytic_Birlesik_Strateji_ve_Teknik_Yol_Haritasi_2026-10-22.md`; `HPAnalytic_Uygulama_Koordinasyon_Kaydi_20261022.md`; `HPAnalytic — Tepeden Tırnağa Site Tasarım Analizi`; `HPAnalytic — Görsel Temsil Dili Sözleşmesi`.
- Remote Desktop Commander reported device online, but OpenCode `http://127.0.0.1:4096/session` was unavailable during this audit. **Its last session output and complete research archives remain UNKNOWN.**
- Earlier Drive report states that 60-repository survey was not a source-by-source deep audit; do not relabel it as one.

## Consolidated workstream ledger

| Area | Verified artifact or inspected evidence | Actual state | Required acceptance |
| --- | --- | --- | --- |
| Editorial / external benchmarks | PR #83; strategic Drive report | Documentation, draft | Per-claim source, verified code when technical, comparison to current site |
| General GitHub/GitLab survey | Consolidated Drive strategy (20 sectors / 60 repos) | Partial-depth research inventory | Real implementation, dependency, licence, mobile-render and maintenance evidence before transferring claims |
| Football open data & analytics | Strategic report references StatsBomb, SkillCorner, socceraction, mplsoccer | Architecture/reference research; full canonical XML+CSV engine **unverified** | Real schema read, event-ID/proximity dedup, clock/coordinate tests, provenance and cross-source reconciliation |
| Mathematics and explanatory metrics | Multi-scale/event-chain research directions | Formulations and candidates, **not validated empirical discoveries** | Operational definitions, baselines, uncertainty, multiple-comparison control, held-out evaluation for predictive claims |
| Visual scene language | Drive Visual Representation Contract; PR #89 | Technical design and tool documentation | One real-data visual, 390px and 1440px browser screenshots, semantic legends, visible geometry |
| Layered pitch | PR #84 | Open draft, data/control foundation | Actual SportsBase binding, synchronized controls, source IDs, browser QA |
| Competition-aware palettes | PR #81 | Open draft | Confirm no conflict with shipped pages; club colours and accessibility regression |
| Editorial carousel | PR #87 | Open draft | Real collection binding, touch, keyboard, reduced motion, empty state QA |
| Reader-first article UI | PR #85 | Open draft | Preserve the latest user removal of reader-facing internal QA boxes; internal evidence governance remains in metadata; do not blindly follow stale tests |
| Match publication | PR #93 merged; commits `dcb60fe`, `4d174be`, `453abdd` | Production-facing code features exist; acceptance not independently checked | Page/browser screenshots and actual editorial-data correspondence |
| Design system and accessibility | Drive site audit dated 19 Oct | Historical measurements: 122 hardcoded hex tokens outside root, 24 manual Georgia references, text contrast down to 2.59:1 | Re-measure **current** code; never present historical figures as current |
| CI and operational reliability | Commits `18385dc`, `c82fb48` | **High-priority integrity question:** messages indicate retired tests excluded and Astro diagnostics bypassed | Inspect diffs and workflow effective commands; restore checks safely via test-first separate PR; inspect failing root causes before changing gates |
| OpenCode and coordinated agents | Drive coordination file and earlier accepted HTTP task | Latest work **UNKNOWN** (service unavailable during this audit) | Session messages, actual changed files, git SHA, test results |
| SportsBase governance / phone workspace | Drive strategy and coordination documents | Manifest and dedup requirements documented; complete physical audit unverified | Read-only inventory and SHA manifest, same-match identity rules, no phone deletion before independent verification |
| Publishing / website operations | User-approved reader-first experience, Astro/Cloudflare references | No verified release health from this audit | CI test, Astro check, build, mobile+desktop browser, sign-off before merge/deploy |

## Resolved documentary conflicts

1. **Old coordination note is stale.** It treats the former PR #85 test failure as a reason to reintroduce public evidence/disclosure surfaces. User's later decision is to **remove reader-facing internal QA panels** while retaining internal source integrity. Never resurrect removed UI to pass outdated tests; update relevant behavioral tests instead.
2. **Documentation-only research is not mastery.** PR #89 cites APIs; it does not demonstrate expert D3/mplsoccer/Pixi animation execution.
3. **Event coordinates do not equal tracking.** No exact simultaneous off-ball positions, enforced press mechanism, or second-ball labels without actual source semantics. Do not use this as an excuse to skip observable reaction/sequence analysis.
4. **CI pass does not imply browser acceptance.** Commit titles about bypassed checks need investigation; do not declare release health from green status alone.
5. **Authorship cannot be inferred from Git history.** Commits `dcb60fe` and `453abdd` mention Claude co-authorship; do not attribute all work to OpenCode.
6. **Historical design audits are not real-time measurements.** Re-run checks on the current branch before claiming unresolved hardcoded colours or contrast values.

## Exact next verified work, in dependency order

### Gate 0 — Protect release integrity
- Diff commits `18385dc` and `c82fb48`; list tests excluded and diagnostics bypassed with effective GitHub Actions commands.
- Reproduce any underlying failure with a failing test, then fix without removing intended quality gates; do not modify production or default branch until independently reviewed.
- Acceptance: inspectable red→green run, Astro typecheck + build, relevant browser snapshots, and no skipped tests added.

### Gate 1 — Source data contract
- Sample **one real match** from SportsBase without moving/removing files.
- Publish source manifest (`path/hash/provider/period/clock/axis/team/event fields`) and match-specific event reconciliation report.
- Acceptance: trace every derived datum back to source records; collisions preserved; no fabricated tracking.

### Gate 2 — Mathematical discovery through data, not formula lists
- Select 3 concrete football questions that cannot be answered from ordinary totals.
- Derive metrics from real chains (loss→opponent threat, recovery→next productive action, temporal break across goal/substitution), and compare appropriate baselines; use further methods only when they add value.
- Acceptance: computed inputs, denominators, sample sizes, uncertainty, negative results, alternative hypotheses.

### Gate 3 — One usable graphic
- Build one linked match micro/mezo/macro view from Gate 1 data, not a catalogue of decorative visualizations.
- Acceptance: synchronized 390px / 1440px view, contrast/label checks, event IDs and interactions, no off-ball invention.

### Gate 4 — Editorial and deployment
- Translate verified findings into reader-facing narrative without internal debug panels, then independently review article against source and render.
- No merge, automatic publication, Drive replacement or phone deletion without explicit user authorization.

## Evidence links

- PRs: https://github.com/Hikmetpinarbas/HPAnalytic.com/pull/81 , /83 , /84 , /85 , /87 , /89 , /93
- Commit bypass: https://github.com/Hikmetpinarbas/HPAnalytic.com/commit/c82fb4872b6f497182206612df8fce3a5c157416
- Commit excluded tests: https://github.com/Hikmetpinarbas/HPAnalytic.com/commit/18385dc8422bd64122190bf0fd8141efbb9353b0
- New league distribution visual: https://github.com/Hikmetpinarbas/HPAnalytic.com/commit/453abddf03b84cf274964a2da6f6ca8bac7606b9
- Match article components: https://github.com/Hikmetpinarbas/HPAnalytic.com/commit/dcb60fe65cf256bd843451d67be8ae2b6cd4fcc6
- Strategy: https://drive.google.com/file/d/1rRscJ-QPKVa_wr0lGcUzFWIm6QDNfzYH/view
- Old coordination note (historical, **not normative**): https://drive.google.com/file/d/1reVpv6qwpmQcQC-TYMY57giIQpmMD8iS/view
- Design audit (19 Oct): https://docs.google.com/document/d/1MePyUC1NmbXyJ23sdA1UZ3JUZIYtC3DUe9XSRETvY3Y/edit
- Visual language: https://docs.google.com/document/d/1OpdJX3gQa-wo7o2XT4TbhF5eSz1ZGBkq-WKXXhio6cI/edit

**Audit constraints:** No OpenCode direct session proof, no full SportsBase content schema read, no runtime/browser QA or actual released-site analysis in this pass. This document is a reconciled evidence register and corrective order, not a claim that the data, mathematics or UI has been fully implemented.
