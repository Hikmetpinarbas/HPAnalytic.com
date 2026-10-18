import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
test('sitemap canonicalizes prerendered public paths', () => {
  assert.match(read('../src/pages/sitemap-0.xml.ts'), /canonicalPath\(/);
});
test('layout canonicalizes prerendered public pages', () => {
  assert.match(read('../src/layouts/BaseLayout.astro'), /canonicalPath\(pathname\)/);
});
test('article structured data uses canonical prerendered path', () => {
  assert.match(read('../src/pages/articles/[...id].astro'), /canonicalPath\(Astro\.url\.pathname\)/);
});
