import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('public layout removes tracking parameters from the visible URL', async () => {
  const source=await readFile(new URL('../src/layouts/BaseLayout.astro',import.meta.url),'utf8');
  assert.match(source,/utm_/);
  assert.match(source,/history\.replaceState/);
  assert.match(source,/fbclid/);
  assert.match(source,/gclid/);
});

test('article share uses canonical URL instead of current tracked URL', async () => {
  const source=await readFile(new URL('../src/pages/articles/[...id].astro',import.meta.url),'utf8');
  assert.match(source,/article-share/);
  assert.match(source,/data-share-url=\{canonicalArticle\}/);
  assert.match(source,/navigator\.share/);
  assert.doesNotMatch(source,/utm_source=chatgpt/i);
});
