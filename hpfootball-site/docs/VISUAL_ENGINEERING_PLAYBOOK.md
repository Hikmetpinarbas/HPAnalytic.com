# HPAnalytic Visual Engineering Playbook — 2026-10-22
Status: RESEARCH-VERIFIED API NOTES / NOT PRODUCTION-VERIFIED
Scope: rendering literacy, composition, football geometry, animation, runtime safety. This is an instruction manual for human/AI operators, NOT permission to install packages, deploy, or override approved editorial design.

## Authority and non-negotiables
1. User intent overrides legacy snapshot tests, old panels, and generic "blog" conventions. Never restore removed reader-facing QA, provenance-warning, claim-ceiling, or diagnostic boxes without explicit user request.
2. Use existing Astro + native SVG and minimal JS by default. A football data provider's public sample is not license to copy its proprietary UI or to fabricate tracking.
3. Source data must be differentiated as event XY / freeze-frame / continuous tracking / schematic. NEVER silently promote one to another.
4. Read source/provider coordinate orientation, units, timebase, and license before plotting. Internal canonical pitch is 105m×68m. If origin, direction, or pitch dimensions are unknown, stop mapping and mark unverified.
5. An attractive output that misrepresents the underlying football data is a failure. A correct output that is illegible or visually crude is also a failure.
6. No phone package installation, video render, or headless Chromium by default. Build/render/test in CI or remote environments. No merge, deployment, or unrelated repo edits.

## Source audited baseline (at writing time)
- Astro: `hpfootball-site/package.json` scripts `npm test` => `node --test tests/*.test.mjs`, `npm run check` => `astro check`, `npm run build` => `astro build`. Dependencies: Astro 7, @astrojs/cloudflare. No D3/PixiJS/ECharts/Motion dependence currently proved from package.json; do NOT claim installed.
- PR #84 `src/lib/layered-pitch.mjs`: PITCH={length:105,width:68}, `projectPoint`, `normalizeEvent`, `focusOpacity`, `selectEvents`.
- PR #84 `src/components/LayeredPitch.astro`: actual SVG pitch and data-bearing players/actions with selection controls. Component is not proof of data integration or browser aesthetic acceptance.

## Renderer choice — language, API, purpose, constraints
| Engine | Language | Verified usage surface | Use for | Do NOT use for |
|---|---|---|---|---|
| Native SVG | SVG/CSS/JS | viewBox, path, circle, text, g, event listener, aria | pitch geometry, accessible low-density overlays | raw huge point clouds and excessive SVG filters |
| D3 | JS/TS | d3-scale, d3-shape, d3-selection, d3-transition | field transforms, path/scale primitives, interaction | magical auto-design; design must be specified |
| mplsoccer | Python/Matplotlib | Pitch, VerticalPitch, draw, arrows, lines, heatmap | high-fidelity static pitch export from verified data | pretending publication SVG is live tracking |
| Matplotlib | Python | Figure/Axes, savefig(format='svg'|'png') | reproducible print/graphic asset creation | client-side mobile animation |
| ECharts | JS/TS | echarts.init(container,null,{renderer:'svg'|'canvas'}), setOption, resize, dispose | comparative analytical charts, zoom/tooltips | all pitch geometry or numerous global chart instances |
| PixiJS v8 | JS/TS | new Application(); await app.init(); app.stage; app.stop(); app.destroy() | dense 2D moving event layers with lifecycle | default UI for 22 static players |
| Motion | JS/TS | animate(), inView() callback and cleanup | restrained entrance and state transitions | gratuitous looping animations |
| GSAP | JS | gsap.timeline(), ScrollTrigger with cleanup | narratively controlled complex sequence | scrolljacking and uncontrolled pinning on mobile |
| Scrollama / IntersectionObserver | JS | enter/exit callbacks / observer.observe/disconnect | article-to-scene argument progression | repeated readers having navigation taken over |
| Embla | JS | EmblaCarousel(container, options), destroy() | swipeable media stories | replacing an already validated existing carousel without need |
| Three.js | JS/TS/WebGL | Scene, Camera, Renderer, Mesh, requestAnimationFrame, dispose | explicit 3D tactical-camera cases | default site landing animation / forced GPU |
| Remotion | React/TS | video composition + external render | offline video publishing | Android runtime |
| Sharp / resvg | Node/Rust | image optimization/rasterization | build-side exports | interactive canvas in browser |
| Playwright | JS/TS | page, screenshot, browser console | screenshot+interaction QA in CI | running Chromium persistently on phone |

## API references — source-backed and exact
- mplsoccer: https://mplsoccer.readthedocs.io/en/latest/ — `from mplsoccer import Pitch; pitch=Pitch(...); fig,ax=pitch.draw()`. Multiple pitch types and coordinate standardization supported. Always set source pitch convention before mapping.
- ECharts: https://echarts.apache.org/handbook/en/best-practices/canvas-vs-svg/ — `echarts.init(dom,null,{renderer:'svg'})` or `'canvas'`. Docs note SVG memory benefit on low-end Android, Canvas for large element counts (~>1k illustrative threshold, NOT a universal cutoff).
- PixiJS v8: https://pixijs.com/ and https://github.com/pixijs/pixijs/blob/dev/src/app/__docs__/app.md — `new Application(); await app.init(options)` then app.canvas/stage. Destroy stage and GPU textures when removed. v7 constructors and renderer assumptions are not interchangeable with v8.
- Motion: https://motion.dev/docs/inview — `inView(target, (element)=>{ const a=animate(element,...); return ()=>a.stop(); })`. `inView` built on IntersectionObserver; stop observation on teardown.
- Astro: https://docs.astro.build/en/reference/directives-reference/#clientvisible — hydration directives apply to framework components, not generic .astro components. Use explicit browser scripts or framework island where warranted.
- D3 API: https://d3js.org/ and https://d3js.org/d3-scale ; https://d3js.org/d3-shape — separate shape construction from DOM selection/state.

## The visual drawing contract — every layer
1. Story question and claim: one football mechanism per primary graphic. Choose visual grammar (sequence / network / occupancy / distribution / pressure / shot quality).
2. Data binding: source ID, provider, event ID, period, clock, coordinate units, orientation, method, missingness, license. No invented player positions.
3. Geometry: normalized canonical [0,105]×[0,68]. Map to viewBox using affine transforms; clip layers inside touch-safe pitch viewport; retain stroke widths consistent with visual density.
4. Mark grammar: lines encode relationships and direction; area encodes region (not a precise zone if estimated); color means team/action; opacity encodes selected-vs-context; size encodes numerical quantity ONLY if legend and scaling are truthful.
5. Composition: pitch clearly visible before embellishment; allocate caption and legend outside playing field; maintain safe margins; guarantee text contrast. Label collision needs an explicit policy (prioritize selected, abbreviate, or open detail on interaction).
6. Movement: stagger only if it conveys time or causal sequence. Prefer transition durations ~180–450ms as an initial design hypothesis to be measured, not an API requirement. Remove or reduce on prefers-reduced-motion; stop when offscreen.
7. Mobile: touch >=44px when practical, no hover-only content, preserve aspect ratio; no font smaller than legible device-tested threshold, no continuously active unseen WebGL. Loading a scene must not block article scroll.
8. Accessibility: title/description/legend, keyboard-accessible filters, focus visible, semantic textual alternative for numerical claims.
9. Visual QA: compare 360,390,768,1280 widths; capture dark/light as applicable; check clipping, label overlap, tooltip edges, empty layers, extreme values, first paint, JS errors, GPU cleanup.
10. Editorial QA: no public diagnostic/excuse/QA badges or "we cannot do X" boxes. Internal uncertainties stay in data governance, not as noisy reader-facing panels. When factual material cannot be substantiated, DO NOT publish unsupported claim.

## Concrete implementation examples (non-install, templates only)

### Native SVG scene, strict source
```html
<svg viewBox="0 0 105 68" role="img" aria-label="Match actions">
  <rect width="105" height="68" fill="#143c30"/>
  <path d="M0 0H105V68H0Z M52.5 0V68 M0 13.84H16.5V54.16H0 M105 13.84H88.5V54.16H105" fill="none" stroke="#d3e8d6" stroke-width=".24"/>
  <g data-family="events"><!-- render only source-grounded events here --></g>
</svg>
```
Never represent schematic lines as measured position data.

### D3 scale boundary
```js
import { scaleLinear } from 'd3-scale';
const x = scaleLinear().domain([0, 105]).range([0, viewWidth]);
const y = scaleLinear().domain([0, 68]).range([0, viewHeight]);
```
This is insufficient if source origin/team attack direction differs; normalize upstream.

### ECharts lifecycle
```js
const chart = echarts.init(el, null, {renderer: 'svg'});
chart.setOption(options);
const resize = () => chart.resize();
window.addEventListener('resize', resize);
// on teardown:
window.removeEventListener('resize', resize);
chart.dispose();
```

### PixiJS v8 lifecycle (ONLY if profiling justifies)
```js
const app = new Application();
await app.init({ width: 800, height: 520, autoStart: false, preference: 'webgl' });
host.appendChild(app.canvas);
// render source-grounded shapes; start only while visible
app.start();
// on exit, app.stop(); on disposal:
app.destroy({removeView:true}, {children:true, texture:true, textureSource:true});
```

## Training exercises: measurable rather than claims of mastery
- EX-01 Pitch geometry: render standard penalty boxes/circle/midline; verify 105×68 orientation and 1:1 coordinate mapping in unit tests. Evidence: real SVG screenshot at 360 and 1280.
- EX-02 Pass network: connect only real event start/end pairs; compare opacity/focus effects, label overlap. Evidence: source event IDs + image diffs.
- EX-03 Density: same dataset in SVG vs Canvas renderer; collect heap/GPU/interaction stats on Android. Evidence: profiler logs.
- EX-04 Scrollytelling: 4-state paragraph-to-scene narrative with manual override and reduced-motion. Evidence: mobile interaction recording, no scroll blocking.
- EX-05 Export: one data-bound pitch graphic exported via Python/mplsoccer and browser SVG; compare geography/legends and repeatability.
- EX-06 QA: Playwright mobile screenshots, no console errors, accessible filters, empty data, destroy cleanup.
None of these exercises are claimed complete merely because written here.

## Operator protocol
1. BEFORE adding a dependency: demonstrate limitation of current platform; link official API docs; check package license/bundle impact/compatibility.
2. BEFORE diagram: write representation spec: source data type, units, orientation, visual encodings, interaction states, responsive fallbacks, visual reference.
3. Develop in isolated PR branch, tests RED before logic change, then GREEN, build and browser screenshots. Never rewrite base site or revert intentional removals to satisfy outdated tests.
4. Evidence report per component: screenshot, real event IDs, sample input format, render costs, tests and known limits. No success claim without screenshots and user-visible evaluation.
5. Distinguish: RESEARCHED / API-READ / SOURCE-INSPECTED / EXECUTED / VISUALLY-ACCEPTED. Only mark what evidence supports.

## Learning status (honest)
Source docs checked: mplsoccer, ECharts, PixiJS, Motion, Astro, D3. Actual repo code inspected: HPAnalytic layered-pitch component and math. Other named libraries remain candidates awaiting direct source/tests. No claim of full proficiency for all libraries, no installation or production deployment.
