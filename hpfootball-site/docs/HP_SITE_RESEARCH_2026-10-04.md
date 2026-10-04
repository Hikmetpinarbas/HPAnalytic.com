# HP Football Site — Research & Product Direction

## Chosen host repository
**Hikmetpinarbas/HP-PROJELERI**

Reason: it already contains the HP Football site source and is an umbrella repository. HPFA/HPA/YELL/HIO remain analysis authorities/donors; the site must not become a new football-truth engine.

## Private corpus translated into product rules
- Visual Intelligence: Caravaggio = focal hierarchy; Leonardo = geometry/proportion; Tesla = controlled relation/energy language.
- Density target: approximately 80% silence / 20% accent.
- Visual drama never upgrades claim capacity.
- DATA VISUAL != TACTICAL BOARD != FRAME EVIDENCE != INFERENCE.
- HPA/HPFA visual constitution: darkness=unknown/context, light=observed evidence, glow=candidate strength, broken geometry=conflict/missingness.
- Football cognitive core: observation → relation → mechanism → opponent interaction → context → counterevidence → uncertainty → claim discipline → analyst value.
- Voice/archive corpus: conversational output should preserve mechanism while avoiding methodology theatre.

## External research translated into implementation
1. **Astro + Cloudflare**: content-heavy site, low JS, typed content collections, Markdown/MDX archive.
2. **Cloudflare Workers/Pages**: static-first, API routes only where live data adds value.
3. **mplsoccer**: donor for pitch coordinate systems and chart families; web layer should receive renderer-neutral JSON/SVG rather than recreate football truth.
4. **socceraction xT/VAEP**: model outputs must be labelled as model outputs; do not present xT as direct observation.
5. **StatsBomb / SkillCorner open data**: useful development/acceptance corpora; source terms and observability levels must be preserved.
6. **SVG tactical board**: preferred 2D web primitive because it is responsive, exportable, lightweight and deterministic.
7. **Accessibility**: strong visible focus, semantic headings, keyboard-safe navigation, no meaning encoded only by glow/color.

## Product architecture
- Home: current intelligence + latest archive
- Analysis: postmatch-first analytical publishing
- Scouting: role/fit/risk
- Culture: Academy and long-form football thought
- About: professional identity and media authority
- API: server-side adapters, secrets in Cloudflare only

## Article contract
Each serious article should carry:
- evidenceClass
- claimCeiling
- source/provenance notes where publishable
- counterevidence / what would weaken the finding
- visual role
- publication status

## API decision
YouTube Data API v3 adapter is scaffolded at /api/youtube.json.
The key is **not committed**. Cloudflare secret name: YOUTUBE_API_KEY.
Channel id may be stored as YOUTUBE_CHANNEL_ID; public default is configured.
If no secret exists, endpoint fails closed with 503 rather than leaking or fabricating data.

## 2D system
- SVG first for web.
- JSON state + SVG renderer separation.
- pitch geometry, nodes, zones, arrows, uncertainty states.
- never infer pass receiver, off-ball position, true pitch control or player intent from insufficient event data.
- export path later: SVG → PNG/PDF/MP4 derivative.

## Research references
- Cloudflare Workers static assets / Astro framework docs
- Astro Content Collections
- W3C WCAG focus appearance
- mplsoccer pitch/formation/flow documentation
- socceraction xT documentation
- StatsBomb Open Data
- SkillCorner Open Data
- user Google Drive Visual Intelligence / Cognitive Core / HP Football Academy corpus
- user Dropbox HPFA Visual Constitution / Visual Claim Guard / longitudinal broadcast transcripts
