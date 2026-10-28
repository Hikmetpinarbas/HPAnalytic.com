# Measured font-chain fix

CI 40719120708 correctly failed: paired medians Vosse 98 → 78, simulated LCP 1.805 → 3.978 s. The after trace requests eight external font files, despite a Georgia LCP heading. The blocking Google Fonts stylesheet and font dependency chain dominate simulated rendering.

BaseLayout now offers systemFonts, default false. Only the two approved article routes opt in; other routes retain identical HTML font links. Article display/body use Georgia and interface fallbacks. No tracking, package, brand, color, calculation, or source-data change. The shell preservation assertion reconstructs and hashes the original shell after removing precisely this optional branch.

Re-measurement pending; publication remains blocked until the unchanged paired budget passes.
