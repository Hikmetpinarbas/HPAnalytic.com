import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (name) => readFile(new URL('../src/pages/' + name, import.meta.url), 'utf8');

test('sitemap index points to canonical child sitemap', async () => {
  const src = await read('sitemap-index.xml.ts');
  assert.match(src, /sitemap-0\.xml/);
  assert.match(src, /sitemapindex/);
});

test('public sitemap uses fail-closed editorial admission for articles', async () => {
  const src = await read('sitemap-0.xml.ts');
  assert.match(src, /isPublicEditorialItem/);
  assert.match(src, /getCollection\('articles', isPublic\)/);
  assert.doesNotMatch(src, /control\/content/);
});

test('robots advertises sitemap and blocks control surface', async () => {
  const src = await read('robots.txt.ts');
  assert.match(src, /sitemap-index\.xml/);
  assert.match(src, /Disallow: \/control\//);
});
