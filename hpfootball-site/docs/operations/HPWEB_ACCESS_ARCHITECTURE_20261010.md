# HPAnalytic — verified access paths and execution architecture
Date: 2026-10-10. Status: investigation/design; NOT a claim of agent authorization or flow execution.

## Ground truth from authorized Android / Termux inspection
- GitHub gh authenticated; local HPAnalytic repo exists with dirty tracked/untracked files. Do not reset/merge/deploy.
- Existing orchestration: TERMUX_HUB/11_AI_ORCHESTRATION/ai_dispatcher.py with agents registry, UI lease and queue; leave unchanged.
- Installed: Claude, Automate, Acode, Horus, Chrome, GitHub, Perplexity, Grok, Markor; tools gh/git/python/node/jq/ffmpeg/rclone.
- Existing Termux Widget: HPA.sh and tasks/08_OTOMASYON.sh. Added tasks/09_HPANALYTIC_GOREVLER.sh, hpweb_operator.py; local audits passed.
- No verified Automate .flo export found in shallow accessible storage scan; app internal flows not yet inspected. App installed != flow enabled.
- Existing agent registry includes Gemini and others; stored availability flags can be stale. Verify actual Android package before launching.

## Access route by tool (preferred -> fallback; gate)
1. Copilot cloud agent: GitHub.com issue assignee Copilot or Agents tab -> eligible paid Copilot plan and repo enablement -> agent PR; 404 for gh API assignee/copilot is inconclusive for UI entitlement. Read-only issue #18 is NOT an agent ACK. If unavailable use Claude isolated PR / manual GitHub review.
2. Jules: jules.google.com -> Google sign-in -> authorize GitHub App only for HPAnalytic.com -> select repository -> submit issue #17 task -> accept plan if requested -> capture task URL and result. GitHub issue alone does not launch Jules.
3. Stitch: stitch.withgoogle.com -> Google login -> new design project -> supply issue #19 content -> export approved frames/HTML/Figma as available -> review 320/375/430/1440 breakpoints. Do not assume public API or automatic GitHub sync.
4. Gemini: installed app package to be reverified, or gemini.google.com in Chrome -> sign in -> paste card #006 research component -> save response to canonical results. Do not treat generated match visuals as real evidence.
5. Flow: labs.google/fx/tools/flow in Chrome; check Google account entitlement, country, credits and rights -> use only authorized original visual assets, explicit generate action -> export to review-only staging. Browser desktop may work better than phone.
6. AI Studio: aistudio.google.com in Chrome -> sign in -> account eligibility and project -> prompt testing, optional API key only in secure secrets store; do not print keys or install unreviewed packages.
7. Antigravity: official Linux/macOS/Windows application/CLI on supported desktop Linux with glibc; Termux Android bionic is NOT a supported native Linux environment. Prefer remote supported host; no unverified curl-pipe-shell on phone.
8. Automate: inspect existing flows in app, find a safe event bridge to existing Termux dispatcher; trigger -> validated allowlisted task ID -> UI lease -> output file -> ACK/status. No background tap or autostart until flow is reviewed and one harmless end-to-end test passes.
9. Acode/Horus/Chrome: installed app launchers; use Acode for editing REVIEW copies, Horus for supervised screen navigation only, Chrome for authorized Google/GitHub pages. App presence != authenticated session or automation capability.

## Minimal execution contract
Task ID + canonical instructions + accessible URL/path + tool-specific launch + agent ACK + artifact/result location + verification + human release gate.
State machine: CARD_READY -> ACCESS_VERIFIED -> DISPATCHED -> ACKED -> RUNNING -> RESULT_RECEIVED -> VERIFIED -> HUMAN_APPROVAL_REQUIRED. Never skip states.
Parallelism: each agent separate branch/worktree or read-only artifact; no concurrent writes to dirty phone repo.
Secrets and safety: no passwords/tokens in task cards/logs; least-privilege GitHub repo authorization; no spending, merge, production deploy, asset licensing assumptions, or unattended browser confirmation.
Next gates: GitHub Copilot UI entitlement; Jules OAuth; Stitch session; Google service entitlements; Automate flow inspection; Antigravity supported host. Require user only for interactive sign-in/consent when actually encountered.
