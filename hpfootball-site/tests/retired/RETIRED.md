# Retired tests — Floodlight v3 redesign (2026-10-20)

Approved by the site owner (Hikmet Pınarbaş) on 2026-10-20 07:20 TSİ.

These tests asserted the exact markup and styling of v2 surfaces that the v3 redesign deliberately removed
(midnight-obsidian / chiaroscuro palette, the SVG sigil logo, the P0 hero pitch, the v2 homepage sections:
reading desk, research/scouting/hikmet spotlights, launch directory, evidence bridge, terminal hero rail,
publication masthead). They can never pass against the new design and do not protect behaviour that still exists.

Whole files moved here (not run: `npm test` only globs `tests/*.test.mjs`) or individual tests marked `test.skip`
in place so the remaining contracts in those files keep running:

- `brand-geometry-language.test.mjs` (whole file)
- `chiaroscuro-dynamism.test.mjs` (whole file)
- `editorial-masthead.test.mjs` (whole file)
- `hero-headline-integrity.test.mjs` (whole file)
- `home-hikmet-spotlight.test.mjs` (whole file)
- `home-latest-work.test.mjs` (whole file)
- `home-reading-desk.test.mjs` (whole file)
- `home-research-spotlight-narrow.test.mjs` (whole file)
- `home-research-spotlight.test.mjs` (whole file)
- `home-scouting-spotlight.test.mjs` (whole file)
- `home-visible-progress.test.mjs` (whole file)
- `hpa-interactive-rail.test.mjs` (whole file)
- `midnight-obsidian.test.mjs` (whole file)
- `renaissance-sigil.test.mjs` (whole file)
- `article-progressive-evidence.test.mjs` → "expanded evidence uses a ghost layer rather than a boxed card"
- `brand-unity.test.mjs` → "canonical Logo is the Newsreader editorial wordmark and publisher signature"
- `design-tokens.test.mjs` → "evidence bridge heading can shrink below its longest word at 200% text resize"
- `design-tokens.test.mjs` → "homepage principle cells can shrink and wrap at 200% text resize"
- `home-launch-credibility.test.mjs` → "match centre section is wrapped in READY + valid rows condition"
- `home-launch-credibility.test.mjs` → "primary CTA goes to the working archive when no public analysis exists"
- `home-launch-credibility.test.mjs` → "launch directory advertises analysis only when public analysis exists and labels methods as methods"
- `home-public-story.test.mjs` → "homepage promotes the newest admitted public story even when no analysis story is published"
- `hp-brand-evidence-visual-contract.test.mjs` → "editorial wordmark retains typography and publication identity"
- `hp-brand-evidence-visual-contract.test.mjs` → "hero uses the independent P0 pitch figure and editorial headline"
- `hp-brand-evidence-visual-contract.test.mjs` → "evidence flow foregrounds analysis and counterevidence"
- `hpa-launch-acceptance.test.mjs` → "site, PWA, and browser chrome use consistent midnight obsidian tokens"
- `light-shell-regression.test.mjs` → ".publication-masthead: the winning background is dark" (handled manually)
- `light-shell-regression.test.mjs` → "home copy is bound to accessible dark theme text tokens"
- `public-product-shell.test.mjs` → "brand has vector HP mark and wordmark"
- `public-product-shell.test.mjs` → "shell has accessible mobile index and real CTA"
- `public-product-shell.test.mjs` → "entry motion is lightweight, reduced-motion safe, and content is visible before animation"

Replacement contracts for the v3 design live in `tests/floodlight-design-system.test.mjs`
(palette + club colour policy, match-page registry, Turkish case safety, typographic wordmark,
mega-menu disclosure, motion visible at rest, public-only monograph reads). Accessibility gates
(contrast, ≥12px copy, no case transforms, 200% text, article reading surface, mobile nav, skip link)
remain active in their original files.
