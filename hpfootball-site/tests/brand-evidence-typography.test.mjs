import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');

test('Evidence Bridge uses defined editorial typography tokens', () => {
  assert.match(css, /--font-serif\s*:/);
  assert.match(css, /--font-mono\s*:/);
  assert.match(css, /\.evidence-bridge__head h2\s*\{font-family:var\(--font-serif\)/);
  assert.match(css, /\.evidence-bridge__flow span\s*\{font-family:var\(--font-mono\)/);
  assert.doesNotMatch(css, /var\(--(?:display|mono)\)/);
});
