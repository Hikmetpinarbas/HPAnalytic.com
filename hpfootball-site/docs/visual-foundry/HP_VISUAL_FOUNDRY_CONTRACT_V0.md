# HP VISUAL FOUNDRY — V0 DESIGN/ENGINEERING CONTRACT

Status: PROPOSAL / REVIEW ONLY. Not an approved identity. No public deployment.

## Purpose
One recognizable Hikmet Pinarbas visual grammar for logo, editorial figures, statistical charts, tables, pitch illustrations, UI, social formats and 2D/2.5D/motion outputs. The rejected existing HP line-break monogram MUST NOT be used as a design reference, seed or example in new candidates. Existing production files remain unchanged until explicit acceptance.

## Shared source of truth
A scene manifest (JSON), semantic design tokens, source-linked data, SVG geometry, and optional motion timeline. SVG/HTML/Canvas/video are render targets, not separate visual identities. Editable originals are retained; PNG and MP4 are exports only.

## Mandatory layers
00 provenance/evidence; 01 composition/background; 02 structural geometry; 03 data marks/football entities; 04 connections/motion paths; 05 annotation/claims; 06 typography; 07 brand/identity; 08 material/light/depth; 09 interaction/accessibility; 10 timeline/camera.

Each visible object must have a stable object_id, layer_id, style token references, z_order, visibility, and optional source_id, note_id, interaction_id, animation_track. Statistical marks MUST include units and source lineage. Synthetic examples MUST be labeled synthetic. No invented tracking coordinates or precision.

## Visual grammar to design and test (not yet approved)
- A recognizably original compositional grid and framing system, not a generic template.
- Stable typographic scale and number formatting across charts, tables and video.
- Reusable stroke, arrowhead, connection, emphasis and annotation grammar.
- Semantic color roles for observation, hypothesis, contrast, risk and selected state; not decoration-only color.
- Responsive mobile-safe labels, keyboard/touch interactions, reduced-motion alternatives.
- Monochrome and print-safe variants; contrast and legibility tests.
- No green as a core brand color; exact palette awaits visual review.

## Production cells and current tools
Identity: Paper.js + opentype.js + SVG/SVGO; new original logo requires human approval.
Data: pandas/NumPy + Matplotlib/Plotly/D3/Observable Plot; evidence-aware interaction.
Football: mplsoccer + svgwrite + vector overlays.
Editorial: SVG layer compositor + typography + templates.
Interface: Astro + TypeScript + CSS tokens + accessible components.
Motion: SVG/CSS/FFmpeg; Blender/Three.js/Motion Canvas only after installation and environment checks.

## Acceptance gates
1. Three materially distinct ORIGINAL visual identity directions, no rejected monogram.
2. One canonical layered scene exports article SVG, social PNG and 6s video with consistent object IDs.
3. Click/tap on chart entity reveals verified value, unit, provenance and editorial note; keyboard support.
4. A chart, a table, a pitch illustration and an article cover pass a side-by-side coherence review without displaying a logo.
5. Responsive and monochrome/print tests; no source-data changes in rendering.
6. HUMAN_APPROVED explicitly recorded before brand replacement or release. No auto-publish, merge or paid service.

## First vertical slice
Create an entirely new non-public visual grammar study with three candidate directions, then produce one shared scene in chart, table, tactical diagram and editorial cover. Validate recognition without logo before animation. Never claim a brand is complete from a single mockup.
