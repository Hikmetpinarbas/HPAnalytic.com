# HP MOBILE APP SUCCESSOR CONTRACT V1

STATUS: DEVELOPMENT / CUTOVER GUARD
AUTHORITY: HPA ANA OPERATÖR / SYSTEM COMMANDER
PRODUCT: HP Football Intelligence

## 1. Current installed mobile truth

Current Android WebAPK package:

`org.chromium.webapk.a1a3ff2d964ac72c2_v2`

Verified application label:

`HP Football Intelligence`

Verified runtime host:

`com.android.chrome`

Verified start URL and scope:

`https://hp-football-intelligence-nxrqic.v2.appdeploy.ai/`

Verified current display mode:

`standalone`

The existing WebAPK remains the active mobile fallback until the Astro successor passes cutover acceptance.

## 2. Candidate successor

Candidate source:

`Hikmetpinarbas/HP-PROJELERI`

Branch:

`site-hp-standard-v2`

Candidate canonical site origin:

`https://hpfootball.pages.dev/`

PWA identity:

- name: HP Football Intelligence
- short name: HP Football
- start URL: /
- scope: /
- display: standalone
- theme/background: #050505
- language: tr
- install icons: 192x192 and 512x512 with maskable coverage

## 3. Absolute cutover rule

DO NOT uninstall or replace the AppDeploy WebAPK merely because:

- responsive CSS works,
- a manifest exists,
- unit tests pass,
- a branch builds,
- a preview URL loads.

Cutover requires real installed-app acceptance on Android.

## 4. Required mobile acceptance

The Astro successor must pass all of these on the deployed HTTPS origin:

1. Browser recognizes the manifest without manifest errors.
2. App can be installed to the Android home screen.
3. Installed app launches in standalone mode.
4. Launch opens the intended HP Football origin, not AppDeploy.
5. Manifest start URL and scope remain inside the canonical HP domain.
6. Current content-driven navigation is preserved:
   empty surfaces stay hidden.
7. Mobile navigation remains usable without hover.
8. Back navigation is deterministic.
9. Internal links remain inside the app scope when appropriate.
10. External links do not silently impersonate internal HP routes.
11. Deep links to published article routes open successfully.
12. Text does not clip at narrow viewport widths.
13. Primary controls remain touch-operable and keyboard/focus safe where applicable.
14. Theme/status-bar presentation remains legible.
15. API/source failure states fail closed; no fake live state appears.
16. App update behavior is verified after a manifest/site revision.
17. Existing AppDeploy WebAPK remains recoverable until acceptance is complete.

## 5. Offline / service worker rule

Current successor foundation does NOT claim offline capability.

No service worker is admitted yet.

Reason:
HP Football contains current editorial and data-backed surfaces. A careless cache-first service worker can display stale analysis, stale API state or stale epistemic labels.

Service worker admission requires its own contract covering:

- cacheable static assets,
- non-cacheable live/API routes,
- version invalidation,
- stale-content labeling,
- offline fallback language,
- update activation,
- recovery from a bad worker.

Until then:

ONLINE-DEPENDENT PWA IS ACCEPTABLE.
FALSE OFFLINE CONFIDENCE IS NOT.

## 6. Migration sequence

1. Keep current AppDeploy WebAPK installed.
2. Deploy Astro candidate to accepted HTTPS origin.
3. Validate manifest and installability.
4. Install Astro PWA as a second app.
5. Run full mobile acceptance.
6. Verify at least one update cycle.
7. Only then decide AppDeploy WebAPK retirement.

## 7. Authority boundary

This contract authorizes no uninstall, merge or production cutover by itself.

Required before cutover:

- Linux/Cloudflare production-equivalent build PASS
- deployed-origin acceptance
- Android installed-app acceptance
- main operator cutover decision
