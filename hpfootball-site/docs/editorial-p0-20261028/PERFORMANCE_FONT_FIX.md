# Measured font-chain fix

CI 40719120708 correctly failed: paired medians Vosse 98 → 78, simulated LCP 1.805 → 3.978 s. The after trace requests eight external font files, despite a Georgia LCP heading. The blocking Google Fonts stylesheet and font dependency chain dominate simulated rendering.

BaseLayout now offers systemFonts, default false. Only the portrait route opts in; other routes retain identical HTML font links. Article display/body use Georgia and interface fallbacks. No tracking, package, brand, color, calculation, or source-data change. The shell preservation assertion reconstructs and hashes the original shell after removing precisely this optional branch.

First re-measurement: portrait 100, LCP 1.352 s, CLS 0. Derby fell 99 → 96 despite observed rendering improving; the shared change is reverted on Derby (its original font loading remains). Paired budgets remain unchanged; a new run is required before release.

Second run 40723833811: Derby Google stylesheet had an observed 3.548 s response on one sample; other corrected runs simulated LCP ~2.74 s. Keeping external fonts is not robust. Both approved routes now use system fonts, and the unchanged classic data/runtime files load in explicit data-before-runtime order only as charts approach within 600 px. Reserved chart space and a readable loading/failure note retain context. All calculations and source bytes are unchanged. New browser and paired gates are required; no failed run is discarded.
