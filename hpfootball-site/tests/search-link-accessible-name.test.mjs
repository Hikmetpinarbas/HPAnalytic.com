import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
test('search link retains its text as accessible name on mobile', () => {
  assert.match(layout, /<a class="icon-link"[^>]*>\s*<svg[^>]*aria-hidden="true"[^>]*>[\s\S]*?<span class="icon-link-text">ARA<\/span>/);
  assert.doesNotMatch(css, /\.icon-link\s+\.icon-link-text\s*\{\s*display:\s*none\s*;/);
  assert.match(css, /@media\s*\(max-width:\s*420px\)[\s\S]*?\.icon-link\s+\.icon-link-text\s*\{[^}]*position:\s*absolute;[^}]*clip:/);
});
test('accessible name is not overridden with a mismatched aria-label', () => {
  const opening = layout.match(/<a class="icon-link"[^>]*href=\{searchLink\.href\}[^>]*>/)?.[0];
  assert.ok(opening);
  assert.doesNotMatch(opening, /aria-label=/);
});
