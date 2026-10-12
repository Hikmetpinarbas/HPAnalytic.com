import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const layout=readFileSync(new URL('../src/layouts/BaseLayout.astro',import.meta.url),'utf8');
test('header search has explicit accessible name in Turkish',()=>{
  assert.match(layout,/<a class="icon-link" href=\{searchLink\.href\}[^>]*aria-label="Ara"/);
});
test('header search icon is decorative',()=>{
  assert.match(layout,/<svg viewBox="0 0 20 20" aria-hidden="true"/);
});
