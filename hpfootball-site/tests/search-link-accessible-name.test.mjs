import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const layoutUrl = new URL('../src/layouts/BaseLayout.astro', import.meta.url);
const cssUrl = new URL('../src/styles/global.css', import.meta.url);
const source = (url) => readFile(url, 'utf8');

const headerSearchLink = (layout) => {
  const match = layout.match(/<a class="icon-link"[^>]*>/);
  assert.ok(match, 'header search link must exist');
  return match[0];
};

test('header search link keeps an accessible name when its visible text is hidden on mobile', async () => {
  const css = (await source(cssUrl)).replace(/\s+/g, ' ');
  // The visible text is removed from the accessibility tree at narrow widths.
  assert.match(css, /\.icon-link \.icon-link-text \{ display: none; \}/);
  const link = headerSearchLink(await source(layoutUrl));
  assert.match(link, /aria-label="Ara"/);
});

test('header search icon stays decorative so it never competes with the link name', async () => {
  const layout = await source(layoutUrl);
  assert.match(layout, /<a class="icon-link"[^>]*>\s*<svg[^>]*aria-hidden="true"[^>]*focusable="false"/);
});
