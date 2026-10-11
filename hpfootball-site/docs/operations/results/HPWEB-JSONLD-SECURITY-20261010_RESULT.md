# HPWEB JSON-LD Security — Local Physical Result
Date: 2026-10-10 TRT; origin: GitHub PR #16 (OPEN/DRAFT; CI site-acceptance PASS).
Physical local observation: src/pages/articles/[...id].astro used unsafe JSON.stringify(jsonLd) inside application/ld+json set:html.
Applied locally: new src/lib/json-ld.mjs serializer escaping HTML-sensitive chars; existing article template imports serializeJsonLd and uses it for JSON-LD.
Test: hostile closing script payload inert after escaping and JSON.parse roundtrip equal; npm test 245/245 PASS.
Scope: local candidate only; no merge, push, deploy, or publication. Existing dirty tree preserved.
Pending: independent browser reproduction, full Linux build, PR branch comparison, formal review and HUMAN_APPROVED publication gate.
