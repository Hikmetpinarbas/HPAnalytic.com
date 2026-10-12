# HPAnalytic build environment diagnosis — 2026-10-08
Status: PHYSICAL_EVIDENCE / environment HOLD, not product defect.

## Observed
- Termux Android arm64; `node_modules/astro/bin/astro.mjs` exists and prints Astro v7.3.6.
- `npm run build` returned `astro: not found` under current PATH/script execution.
- Direct `node node_modules/astro/bin/astro.mjs build` loads Astro but fails at `node_modules/workerd/lib/main.js` with `Unsupported platform: android arm64 LE`.
- `proot-distro list` confirms installed `ubuntu`; `proot-distro login ubuntu -- bash -lc 'uname -m; node -v'` yields `aarch64`, Node v18.19.1. Astro 7 requires a newer Node runtime; do not assume Ubuntu build works without validation.
- 235 existing tests passed in Termux, excluding untracked HOLD `tests/home-hikmet-spotlight.test.mjs`.

## Decision
Do not modify Cloudflare adapter or site configuration to hide Android-only incompatibility. No destructive dependency reinstall or deployment. Build in supported Linux runtime with compatible Node and workerd package; first check existing CI/build host. Browser/mobile QA only after successful build/preview. Test PASS is not build PASS.

## Recovery
Site tracked files untouched by diagnosis. Log is in `$HOME/hpanalytic-build-direct.log`; restore no files. If a future supported build fails, capture exact runtime, lockfile, adapter, and stack trace before deciding product failure.
