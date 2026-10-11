# HPWEB Typography Fix — Physical Result
Date: 2026-10-10 TRT. Scope: local source only, no deploy.
File: src/styles/global.css.
Changed exactly one var(--display) to var(--font-serif) and one var(--mono) to var(--font-mono) in evidence-bridge section.
Before: --font-serif and --font-mono defined; --display and --mono undefined in this stylesheet.
After: 0 remaining var(--display)/var(--mono) references.
Validation: focused brand visual test 4/4 PASS; npm test 245/245 PASS; git porcelain file count 20 (same as before).
No push, merge, deployment or live changes. Human/physical browser QA remains OPEN.
