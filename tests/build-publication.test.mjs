import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const root = process.cwd();
const read = (p) => readFileSync(p, 'utf8');
const slug = 'galatasaray-stuttgart-xg-paradoksu';
test('build script generates article HTML for Stuttgart', () => {
  assert.match(read('package.json'), /node scripts\/build-yazi\.mjs/);
  assert.ok(existsSync(`dist/yazi/${slug}.html`));
  assert.match(read(`dist/yazi/${slug}.html`), /xG paradoksu/);
});
test('compiled homepage contains live Stuttgart article link', () => {
  assert.match(read('dist/index.html'), new RegExp(`/yazi/${slug}\\.html`));
});
test('homepage recent articles are built from Markdown', () => {
  assert.match(read('dist/index.html'), /HPA_LATEST_START/);
  assert.match(read('dist/index.html'), /HPA_LATEST_END/);
});
