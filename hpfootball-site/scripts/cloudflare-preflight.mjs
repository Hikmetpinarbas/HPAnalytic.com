#!/usr/bin/env node
// Non-network, non-deploy validation; usable on Termux and Linux.
import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = p => readFileSync(p, 'utf8');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const config = read('astro.config.mjs');
const wrangler = JSON.parse(read('wrangler.jsonc').replace(/^\s*\/\/.*$/gm, ''));
assert.equal(pkg.dependencies['@astrojs/cloudflare'] !== undefined, true, 'Cloudflare adapter missing');
assert.equal(lock.packages[''].dependencies['@astrojs/cloudflare'], pkg.dependencies['@astrojs/cloudflare'], 'Cloudflare lock mismatch');
assert.match(config, /adapter\s*:\s*cloudflare\s*\(/, 'Astro Cloudflare adapter missing');
assert.equal(wrangler.main, '@astrojs/cloudflare/entrypoints/server');
assert.ok(wrangler.compatibility_flags.includes('nodejs_compat'));
assert.ok(existsSync('public/social-card.png'), 'OG social card missing');
assert.ok(existsSync('public/favicon.svg'), 'favicon missing');
assert.ok(existsSync('public/manifest.webmanifest'), 'PWA manifest missing');
const workflow=read('docs/operations/CLOUDFLARE_CANDIDATE_WORKFLOW_REFERENCE.yml');
assert.match(workflow,/runs-on: ubuntu-24\.04/);
assert.match(workflow,/npm run build/);
assert.doesNotMatch(workflow,/wrangler deploy|wrangler-action|pages deploy/);
console.log('CLOUDFLARE_PREFLIGHT_PASS (candidate configuration only; root GitHub Linux workflow required)');
