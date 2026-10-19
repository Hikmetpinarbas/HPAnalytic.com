# PR verification — LiveMatchFigure

Scope: `src/components/figures/LiveMatchFigure.astro` and the homepage hero import/mount in `src/pages/index.astro` only. Other dirty working-tree edits must not enter this PR.

- Verify SVG `viewBox="0 0 1050 680"` (105 × 68 m, 10 units/m) and exactly 12 independently identified SVG `<g>` layers, L01–L12.
- Verify data-driven actors and links, line endpoint truncation, node occlusion shields, a maximum of one gold focus point, and no invented tracking or match event data.
- Verify introductory animation is one-shot (no loop), uses only `transform`/`opacity`, respects `prefers-reduced-motion`, and is performance-tested on representative mobile hardware.
- Run `npm run check`, `npm run build`, and appropriate repository tests in GitHub CI or Jules/cloud runner **not on the Android/Termux phone**. Report exact commit, test logs, SVG output, accessibility and render findings.
- Current status: source integration only; no Astro check/build or mobile rendering acceptance completed. Do not merge or deploy without cloud validation.
