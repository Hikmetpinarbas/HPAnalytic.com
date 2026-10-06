import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const pagesDir = new URL('../src/pages/', import.meta.url);
const read = (name) => readFile(new URL(name, pagesDir), 'utf8');

test('article route prerenders (regression: getStaticPaths was ignored under output:server → 500)', async () => {
  const page = await read('articles/[...id].astro');
  assert.match(page, /getStaticPaths/);
  assert.match(page, /export const prerender = true;/);
});

test('every content page prerenders; only search and API routes run on the server', async () => {
  const pages = (await readdir(pagesDir)).filter((f) => f.endsWith('.astro'));
  for (const name of pages) {
    const src = await read(name);
    if (name === 'search.astro') assert.match(src, /export const prerender = false;/);
    else assert.match(src, /export const prerender = true;/, name);
  }
});

test('search is a plain GET form with a labelled input (works without JS)', async () => {
  const page = await read('search.astro');
  assert.match(page, /<form[^>]*action="\/search"[^>]*method="get"[^>]*role="search"/);
  assert.match(page, /<label class="visually-hidden" for="q">/);
  assert.match(page, /<input id="q" name="q" type="search"/);
});

test('article pages declare structured data and a claim boundary', async () => {
  const page = await read('articles/[...id].astro');
  assert.match(page, /application\/ld\+json/);
  assert.match(page, /class="claim-boundary"/);
});
