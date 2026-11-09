# HPAnalytic Design Handoff & Specification Document
Mission: P0 Brand Identity System Replacement
Author: Senior Identity Designer & Design Systems Engineer (Antigravity)
Date: 2026-10-18
Status: CANDIDATES_PREPARED_FOR_USER_SELECTION (Isolation Enforced, No Production Modification)

---

## 1. Overview & Objective
Following the explicit user rejection of the previous broken-stroke mark (`Logo.astro`, path `M13 38 42 14`) and the uncalibrated dark social-card, this deliverable establishes two mathematically constructed, cohesive brand alternatives.

All generated assets are strictly contained within:
`/home/userland/HP_WORKSPACE/HP_MISSION_NOTES/BRAND_REPLACEMENT_P0_20261018/`

**Strict Isolation Note**:
- Production site (`cand/hpfootball-site`) was NOT touched.
- Default branch, GitHub CI, Cloudflare, and existing upstream prototype assets remain 100% unaltered.
- This handoff presents tangible prototypes for user decision.

---

## 2. Directory Manifest & Deliverables

| File Name | Format | Role & Content |
| :--- | :--- | :--- |
| **** | SVG (Layered, 1200x900) | Full visual comparison: Rejected Mark vs. Candidate A vs. Candidate B with flaw analysis and contrast data. |
| **** | HTML5 / CSS3 / SVG | Interactive side-by-side design preview including 320px mobile viewport, desktop header, color stages, and social cards. |
| **** | Markdown | Comprehensive evaluation matrix, pixel sharpness tests, WCAG contrast ratios, and recommendation. |
| **** | Markdown | Technical implementation specifications, tokens, and component migration guides (this document). |
| **** | SVG (24x24 viewBox) | Candidate A symbol in Warm Ivory (`#F2EBDD`) for dark platforms and deep forest grounds. |
| **** | SVG (24x24 viewBox) | Candidate A symbol in Ink Black (`#1A1712`) for porcelain and light editorial modes. |
| **** | SVG (24x24 viewBox) | Candidate B symbol in Warm Ivory + Copper accent for dark backgrounds. |
| **** | SVG (24x24 viewBox) | Candidate B symbol in Ink Black + Copper shadow for light backgrounds. |
| **** | SVG (280x56) | Candidate A Horizontal lockup (Symbol + Wordmark + Subtitle) for dark headers. |
| **** | SVG (280x56) | Candidate A Horizontal lockup for light editorial headers. |
| **** | SVG (280x56) | Candidate B Horizontal lockup for dark headers. |
| **** | SVG (280x56) | Candidate B Horizontal lockup for light editorial headers. |
| **** | SVG (32x32) | Calibrated Candidate A favicon with high optical aperture for crisp rendering at 16px/24px/32px. |
| **** | SVG (32x32) | Calibrated Candidate B favicon with optimized vector density. |
| **** | SVG (1200x630) | Candidate A OpenGraph / Twitter social card prototype with pitch line geometry and typography. |
| **** | SVG (1200x630) | Candidate B OpenGraph social card prototype with kinetic vector focal point. |

---

## 3. Brand Architecture & Token Integration

### Core Color Palette:
- **Night Canvas (Dark Platform)**: `#0B0F17`
- **Deep Forest Canvas**: `#0A1412`
- **Porcelain Light (Editorial Canvas)**: `#F8F6F0`
- **Warm Ivory (Primary Brand Mark)**: `#F2EBDD`
- **Ink Black (Light Surface Mark)**: `#1A1712`
- **Brand Copper Accent**: `#C97C3E` (Dark) / `#A35A22` (Light)
- **Zero Green Compliance**: Verified 0.0% green hue across all assets.

### Typography Hierarchy:
- **Headlines / Identity**: `Newsreader`, `Georgia`, `serif` (Editorial elegance)
- **Wordmark & System UI**: `Inter`, `system-ui`, `sans-serif` (600/400 weights)
- **Metadata & Provenance**: `DejaVu Sans Mono`, `JetBrains Mono`, `monospace`

---

## 4. Next Step: User Decision Gate
When the user chooses between **Candidate A (Meridian Compass)** and **Candidate B (Nexus Vector)**:
1. Copy the selected symbol and lockup into `src/components/Logo.astro`.
2. Update `public/favicon.svg` and generate corresponding PNG raster sizes.
3. Export the 1200x630 SVG social card to `public/social-card.png`.
4. Run regression visual tests across 320px mobile and 1440px desktop viewports before committing.
