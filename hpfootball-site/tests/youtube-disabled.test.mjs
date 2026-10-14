import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FEATURES } from '../src/lib/feature-flags.mjs';

const source = readFileSync(new URL('../src/pages/api/youtube.json.ts', import.meta.url), 'utf8');

test('YouTube feed is switched off for the P0 launch', () => {
  assert.equal(FEATURES.youtubeFeed, false);
  assert.ok(Object.isFrozen(FEATURES), 'feature flags must not be mutable at runtime');
});

test('disabled endpoint answers before reading the secret or calling YouTube', () => {
  const gate = source.indexOf('if (!FEATURES.youtubeFeed)');
  assert.ok(gate > -1, 'feature gate missing');
  assert.ok(gate < source.indexOf('env.YOUTUBE_API_KEY'), 'gate must run before the secret is read');
  assert.ok(gate < source.indexOf('await fetch('), 'gate must run before any upstream call');
});

test('disabled endpoint is a non-cacheable, non-indexed 404 JSON response', () => {
  const block = source.slice(source.indexOf('if (!FEATURES.youtubeFeed)'), source.indexOf('env.YOUTUBE_API_KEY'));
  assert.match(block, /status:'disabled'/);
  assert.match(block, /status:404/);
  assert.match(block, /'cache-control':'no-store'/);
  assert.match(block, /'x-robots-tag':'noindex, nofollow'/);
});
