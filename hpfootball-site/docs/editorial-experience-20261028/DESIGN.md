# HPAnalytic editorial experience — 28 October 2026

Implementation authority: the owner requested a complete design takeover and explicitly asked for execution without repeated approval questions. This is a development candidate; general-site production deployment remains outside the existing two-article release authorization.

## Direction

A football publication with the reading hierarchy of a newspaper and the explanatory depth of an interactive data essay. Keep the original Astro application, charcoal ground, amber focus, cool blue context, off-white type, source records, publication filters and calculation engines. Use the existing approved logo. No invented tracking sequences or unlicensed portraits.

The chosen approach combines a content-led editorial front, native horizontal story rails, geometric typographic covers and progressive detail inside articles. A full-screen motion showcase would compete with reading and mobile performance; a uniform dashboard grid would flatten story importance. The chosen combination puts the latest admitted match investigation first and leaves the existing admission registry in control.

## Twenty pilots

The patterns below are adaptation targets, not assertions of exact inspected CSS or verified animation timing. Source captures do not establish hover, touch or keyboard behavior. No reference's code, proprietary fonts or photography is copied.

| Pilot | Source | HPAnalytic adaptation target | Retrieval in this session |
|---|---|---|---|
| SkillCorner | https://skillcorner.com/us | Clear product navigation; field geometry; meaningful motion | Page text and branding retrieved |
| Driblab | https://www.driblab.com/ | Numbered navigation, strong display typography, product-story grouping | Text, branding and screenshot URL retrieved; screenshot pixels not inspected |
| The Pudding | https://pudding.cool/ | Visual essays, story-specific covers and explanatory scrolling | Text and branding retrieved; scrolling behavior unverified |
| The Athletic | https://www.nytimes.com/athletic/ | Headline hierarchy, match and author context | Fetch blocked; reference supplied by owner |
| Total Football Analysis | https://totalfootballanalysis.com/ | Football-specific taxonomy and analysis discovery | Text and branding retrieved |
| Financial Times | https://www.ft.com/ | Dense but ordered editorial index; clear section hierarchy | Text and branding retrieved |
| The Times | https://www.thetimes.com/ | Restrained masthead and legible editorial reading | Text and branding retrieved |
| NYT Upshot | https://www.nytimes.com/section/upshot | A question followed by an evidence-led explanation | Fetch blocked; adaptation proposed |
| Reuters Graphics | https://www.reuters.com/graphics/ | Chart and explanatory caption as a single reading unit | Text and branding retrieved on retry; motion unverified |
| Guardian Football | https://www.theguardian.com/football | Distinct lead story and compact secondary reading | Text and branding retrieved on retry; motion unverified |
| Bloomberg Graphics | https://www.bloomberg.com/graphics | Narrative sections and disciplined chart annotations | Text and branding retrieved on retry; motion unverified |
| Our World in Data | https://ourworldindata.org/ | Visible sources and context near the visualization | Text and branding retrieved on retry; motion unverified |
| The Economist | https://www.economist.com/ | Quiet typography and concise cover-led collections | Retrieval failed; adaptation proposed |
| Opta Analyst | https://theanalyst.com/ | Football data stories and useful match discovery | Text and branding retrieved on retry; motion unverified |
| Hudl StatsBomb | https://statsbomb.com/ | Precise field diagrams and analytical detail | Text and branding retrieved on retry; motion unverified |
| Twenty First Group | https://www.twentyfirstgroup.com/ | Research authority and clear decision framing | Text and branding retrieved on retry; motion unverified |
| American Soccer Analysis | https://www.americansocceranalysis.com/ | Independent research identity and accessible archive | Text and branding retrieved |
| Observable | https://observablehq.com/ | Direct manipulation and legible chart controls | Text and branding retrieved on retry; motion unverified |
| Awwwards | https://www.awwwards.com/ | Intentional hover and navigation transitions | Text and branding retrieved on retry; motion unverified |
| Pentagram | https://www.pentagram.com/ | Project-cover composition and varied editorial scale | Text and branding retrieved |

## Components and behavior

- One editorial opening replaces the competing carousel, brand hero and repeated match feature.
- The curated premier registry continues to select and order public stories. The data and draft gates are unchanged.
- Story carousel: native touch scroll and snap, previous/next, roving tab selection with arrows/Home/End, offscreen panels inert after enhancement, reduced-motion support and no automatic advance. No-JS visitors retain native scrolling and all story links.
- Covers: self-contained decorative SVG, category, actual title and signature. Covers are not match evidence and are hidden from assistive technology; the visible headline supplies the accessible link name. No third-party image requests.
- Covers carry across the article library, monograph rail and analysis collections. Existing per-article figures stay in place.
- Navigation keeps disclosure semantics, existing Escape/outside-close behavior and fallback links; visual treatment adds restrained amber rules and spacious mobile rows.
- Hover transforms apply only to fine pointers. Keyboard focus has its own visible treatment. Minimum text size remains 12px and interaction targets 44px.
- Shared shell CSS remains in global.css. Cover and discovery CSS is imported by EditorialCover so article readers do not download unused homepage rules.

## Acceptance

Validate the full repository tests and Astro diagnostics, production build, eight viewport widths, native scrolling, carousel keyboard and touch gestures, desktop and mobile navigation, contrast and focus. Keep existing two-article production-browser and paired Lighthouse gates without changing their thresholds. Screenshots and browser reports are evidence, not substitutes for the actual production build.

Local environment constraints observed: no UserLAnd workspace, terminal proxy unreachable, Astro dependencies absent, and Chromium blocked by sandbox socket permissions. Remote GitHub Actions must supply the full-build and actual-browser evidence. Do not report this candidate as complete until that evidence exists.

Unfinished scope: reference sites blocked or queued out still need visual inspection; photo rights for Vosse remain unresolved; article-specific scrollytelling and all-page final acceptance require further work. The nine historical archive articles and the Conte–Mendilibar–İsmail Kartal article are not validated by this design work.

## Recovery after first CI

The first candidate passed tests, Astro diagnostics, production build and the two articles at eight widths, but failed the unchanged paired mobile gate: Derby median 97 versus baseline 100 (LCP 2101 ms versus 1501 ms). The previous development source had already measured 98 on a faster runner. The recovery splits cover/discovery CSS from shared reader CSS and narrows original chart prefetch from 600 to 200 pixels; this must be measured again. No Lighthouse threshold changes.

The full Linux gate also discovered obsolete agent viewport metadata in the existing 1.4 MB static derby preview. Removing that metadata fixes the source of the signature failure. Twelve embedded WOFF2 fonts are extracted byte for byte into content-addressed files, reducing HTML by 599775 bytes. A regression test reverses the transformation and checks the exact original Git blob SHA, covering every other byte of HTML, data and calculation code.
