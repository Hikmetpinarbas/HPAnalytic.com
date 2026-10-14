# Claude Code — E02 Mobile/Desktop QA Assignment
Status: READY_FOR_CLAUDE; not executed or accepted.
Scope: HPAnalytic.com canonical local candidate only.
Working directory: ~/HPA_SITE_DEV/HP-PROJELERI/hpfootball-site
1. Read git status, HEAD and existing release QA scripts. Preserve every dirty/untracked file, especially tests/home-hikmet-spotlight.test.mjs (HOLD).
2. Inspect real browser at 320, 375, 420, 430, 1440 px; verify header search, mobile nav, focus/keyboard, 200% zoom, reduced motion and article evidence line wrapping.
3. Use existing Firefox/Chromium capability; do not install paid services or change global phone settings. Avoid repeated Android UI/screenshot loops.
4. For confirmed defects, add focused regression test and make minimal source repair in isolated candidate. Do not redesign logo or editorial system in this assignment.
5. Run governed test suite excluding explicit HOLD, Astro check and production-compatible build only where runtime supports it. Report environment blocks as blocks, never PASS.
6. Return concise changed-files list, exact git HEAD, dirty status, browser evidence paths, test counts, defects remaining, and rollback instructions.
GUARDS: AUTOPUBLISH=OFF; HUMAN_APPROVED required for launch and articles. No push, merge, deploy, queue consumption, secret reading, or destructive git operations. No fabricated screenshot or test evidence.
