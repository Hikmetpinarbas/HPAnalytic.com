import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (p) => readFile(new URL(p, import.meta.url), 'utf8');

test('empty section copy speaks to readers, not to the editorial rulebook', async () => {
  const listing = await read('../src/components/SectionListing.astro');
  assert.match(listing, /Bu bölümde henüz yayımlanmış yazı yok\./);
  assert.doesNotMatch(listing, /Boş yüzey|navigasyonda gösterilmez/);
});

test('an empty culture page is noindex', async () => {
  const culture = await read('../src/pages/culture.astro');
  assert.match(culture, /noindex=\{!hasItems\}/);
});
