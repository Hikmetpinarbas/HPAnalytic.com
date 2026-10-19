import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const layout = await readFile(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
const logo = await readFile(new URL('../src/components/Logo.astro', import.meta.url), 'utf8');

test('header and footer use the same canonical Logo component', () => {
  assert.match(layout, /<EditorialHeader navigation=\{editorialNavigation\}/);
  assert.equal((layout.match(/<Logo\b/g) || []).length, 1);
  assert.doesNotMatch(layout, /class="hp-mark"/);
});

test('canonical Logo is the Newsreader editorial wordmark and publisher signature', () => {
  assert.match(logo, /Newsreader/);
  assert.match(logo, /IBM Plex Mono/);
  assert.match(logo, /hp-wordmark__name/);
  assert.match(logo, /EVIDENCE LAB · BOTANICAL INTELLIGENCE/);
});
