import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const home = await readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8');

test('home renders the match centre only through its gated view', () => {
  assert.match(home, /\{matchView\.visible\s*&&\s*<section class="match-centre"/);
  assert.match(home, /VERİ ZAMANI · \{matchView\.dataTime\}/);
  assert.match(home, /matchView\.coveredLabels\.map/);
});

test('home does not promise data it cannot deliver', () => {
  assert.doesNotMatch(home, /KAYNAK KULLANILAMIYOR|otomatik görünecek|FOOTBALL_SCOPE\.labels/);
  assert.doesNotMatch(home, /\+ Türkiye/);
});
