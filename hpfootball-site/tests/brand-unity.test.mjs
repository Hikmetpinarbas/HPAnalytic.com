import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const layout = await readFile(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
const logo = await readFile(new URL('../src/components/Logo.astro', import.meta.url), 'utf8');

test('header and footer use the same canonical Logo component', () => {
  assert.equal((layout.match(/<Logo\b/g) || []).length, 2);
  assert.doesNotMatch(layout, /class="hp-mark"/);
});

test('canonical Logo is the LINE-BREAK HP monogram and publisher signature', () => {
  assert.match(logo, /class="hp-mark"/);
  assert.match(logo, /class="hp-frame"/);
  assert.match(logo, /class="hp-break"/);
  assert.match(logo, /hp-wordmark__name/);
  assert.match(logo, /HİKMET PINARBAŞ · EVIDENCE MADE VISIBLE\./);
});
