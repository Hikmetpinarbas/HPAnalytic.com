---
name: hp-viz-engineering
description: Implement publication-grade HPViz charts, spatial football pitches, responsive chart UI, dropdown menus, interaction, hover and carousel using verified data and the club-aware Floodlight brand.
compatibility: opencode
---
# HPViz Engineering v0.1
## Technology
Choose by task: `mplsoccer`/Matplotlib for validated football pitch static assets; D3/Observable Plot for specialized browser SVG interactions; Astro/TypeScript for integration; resvg/Sharp for static exports; Playwright for browser evidence. Different libraries are not a quality claim. Avoid synthetic events on live published charts.

## Data and coordinates
105×68 m pitch. Region labels 0–35, 36–70, 71–105 **metres**. Time filter 0–15, 16–30, 31–45, 46–60, 61–75, 76–90+ **minutes** only if event clocks are reliable. Confirm attacking direction and data source coordinate frame. Never change orientation solely to match intended tactical story.

## Identity
Load `hpfootball-site/src/styles/global.css` and existing Floodlight tokens first. European-match page skin follows the playing Turkish club: Galatasaray burgundy/gold, Fenerbahçe yellow/navy. Opponent series use neutral contrast and shape/line secondary encoding. One consistent icon family, typography scale, legend vocabulary, unit notation and focus treatment.

## Responsive interaction
Use anchored down-opening menus for metric, team, event, phase, zone and corridor filters. Default to 'Tamamı' where applicable; preserve current general view until changed. Overlay must not shift the chart, trap focus or overflow viewport; support touch, keyboard, escape/outside close. Avoid giant chips. Hover has keyboard/tap equivalent. Carousel must convey actual sequence/comparison, not fill space. No autoplay forcing scroll; respect reduced motion. Only render meaningful zeros; keep readable typography.

## Deliverables
Real source-backed JSON/CSV links, standalone chart semantic contract, responsive SVG or canvas, working controls, accessibility/QA artifacts. Never claim designed visuals were verified only because unit tests pass.
