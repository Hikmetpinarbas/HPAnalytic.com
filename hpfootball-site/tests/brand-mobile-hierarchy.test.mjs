import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const home = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');

test('mobile header stays on one row with JS while no-JS navigation can wrap', () => {
  assert.match(css, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.js \.site-header\s*\{\s*flex-wrap:\s*nowrap;/);
  assert.match(css, /html:not\(\.js\) \.site-header\s*\{\s*flex-wrap:\s*wrap;/);
  assert.match(css, /\.site-header\s*>\s*\.brand\s*\{\s*flex-shrink:\s*1;/);
});

test('mobile first screen compresses whitespace without removing football or admitted evidence', () => {
  assert.match(css, /@media\s*\(max-width:\s*560px\)[\s\S]*?\.hero-entry\s*\{\s*padding:\s*32px 20px 42px;/);
  assert.match(css, /\.hero-entry \.hero-actions\s*\{\s*margin-top:\s*22px;/);
  assert.match(home, /<TacticalCanvas\s*\/>/);
  assert.match(home, /\{featuredStory && <section class="featured-analysis"/);
  assert.match(home, /<EvidenceBadge evidenceClass=\{featuredStory\.data\.evidenceClass\}/);
  assert.match(home, /class="research-spotlight"/);
  assert.match(home, /class="scouting-spotlight"/);
});

test('small mobile header preserves the HPAnalytic wordmark without reducing tap targets', () => {
  assert.match(css, /@media\s*\(max-width:\s*420px\)[\s\S]*?\.brand b\s*\{[^}]*white-space:\s*nowrap;/);
  assert.match(css, /@media\s*\(max-width:\s*420px\)[\s\S]*?\.site-header\s*\{[^}]*padding-inline:\s*12px;/);
  assert.match(css, /@media\s*\(max-width:\s*420px\)[\s\S]*?\.mobile-nav-trigger\s*\{[^}]*min-width:\s*76px;/);
  assert.match(css, /\.mobile-nav-trigger\s*\{[^}]*min-height:\s*var\(--tap\);/);
});

test('one-row header at 320px keeps controls inside the viewport without shrinking the identity', () => {
  const narrow = css.match(/@media \(max-width: 420px\) \{\n  \.brand b \{ white-space: nowrap; \}[\s\S]*?\n\}/)?.[0] ?? '';
  assert.match(narrow, /\.header-actions \{ gap: 6px; \}/);
  assert.match(narrow, /\.mobile-nav-trigger \{ padding-inline: 9px; gap: 8px; \}/);
  assert.doesNotMatch(narrow, /\.hp-mark|font-size/);
});
