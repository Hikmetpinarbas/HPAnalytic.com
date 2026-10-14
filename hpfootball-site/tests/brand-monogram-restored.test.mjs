import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// P0 closure (2026-10-15): the serif candidate (8f753cc) was rejected for launch because its
// path contains no "P" bowl and, drawn with the site's stroke rule, reads as "IHI" at 24 px.
// The published LINE-BREAK HP monogram (served in the live header) is the canonical mark.
const logo = readFileSync(new URL('../src/components/Logo.astro', import.meta.url), 'utf8');
const PUBLISHED_FRAME = 'M7 7v38M7 26h17M24 7v38M32 7v38M32 7h7c8 0 8 15 0 15h-7';
const PUBLISHED_BREAK = 'M13 38 42 14';
const REJECTED_CANDIDATE_FRAME = 'M9 8H28V12H25V23H34V12H31V8H48V12H44V40H48V44H31V40H34V28H25V40H28V44H9V40H13V12H9Z';

test('logo uses the published LINE-BREAK HP frame and break paths', () => {
  assert.ok(logo.includes(`class="hp-frame" d="${PUBLISHED_FRAME}"`), 'published HP frame path missing');
  assert.ok(logo.includes(`class="hp-break" d="${PUBLISHED_BREAK}"`), 'published break path missing');
});

test('logo frame keeps the P bowl so the mark reads as HP', () => {
  assert.match(logo, /class="hp-frame" d="[^"]*h7c8 0 8 15 0 15h-7/);
});

test('rejected serif candidate is not shipped', () => {
  assert.ok(!logo.includes(REJECTED_CANDIDATE_FRAME), 'rejected 8f753cc candidate path is present');
  assert.doesNotMatch(logo, /d="M20 36L39 17"/);
});
