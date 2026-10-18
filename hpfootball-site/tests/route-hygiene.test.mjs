import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

test('articles index and reading-list redirect to the archive instead of 404', () => {
  assert.match(read('src/pages/articles/index.astro'), /Astro\.redirect\('\/archive', 301\)/);
  assert.match(read('src/pages/reading-list.astro'), /Astro\.redirect\('\/archive', 301\)/);
});

test('robots and sitemap fallbacks use the www canonical host from astro.config', () => {
  for (const p of ['src/pages/robots.txt.ts', 'src/pages/sitemap-index.xml.ts', 'src/pages/sitemap-0.xml.ts']) {
    assert.match(read(p), /https:\/\/www\.hpanalytic\.com/);
    assert.doesNotMatch(read(p), /new URL\('https:\/\/hpanalytic\.com'\)/);
  }
  assert.match(read('astro.config.mjs'), /site:'https:\/\/www\.hpanalytic\.com'/);
});
