import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const page = read('src/pages/mac/besiktas-crystal-palace-2026-10-22.astro');
const original = read('public/match-surfaces/besiktas-crystal-palace-interactive.html');

test('published Beşiktaş article embeds its interactive editorial surface, not just static figures', () => {
  assert.match(page, /id="hpa-interactive-frame"/);
  assert.match(page, /src="\/match-surfaces\/besiktas-crystal-palace-interactive\.html"/);
  assert.match(page, /ResizeObserver/);
  assert.match(page, /Etkileşimli maç yüzeyini ayrı sayfada aç/);
  assert.match(page, /01-sut-donusum\.svg/);
  assert.match(page, /04-catisma\.svg/);
});

test('original interactive surface retains five views and actual event-driven filters', () => {
  for (const view of ['pitch', 'pattern', 'bars', 'radar', 'pizza']) {
    assert.match(original, new RegExp(`data-view="${view}"`));
  }
  for (const layer of ['events', 'density', 'zones', 'network']) {
    assert.match(original, new RegExp(`data-layer="${layer}"`));
  }
  assert.match(original, /id="teamRail"/);
  assert.match(original, /id="kindRail"/);
  assert.match(original, /id="outRail"/);
  assert.match(original, /id="momentum"/);
  assert.match(original, /const DATA=/);
  assert.match(original, /heroCanvas/);
  assert.ok(original.length > 150000, 'full supplied dataset must not be replaced by a mock');
});
