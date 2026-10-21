import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const layout=readFileSync(new URL('../src/layouts/BaseLayout.astro',import.meta.url),'utf8');
const header=readFileSync(new URL('../src/components/EditorialHeader.astro',import.meta.url),'utf8');
test('header search has explicit accessible name in Turkish',()=>{
  assert.match(header,/<button[^>]+aria-label="Site içi ara"[^>]*data-search-open/);
});
test('header search icon is decorative',()=>{
  assert.match(header,/<svg[^>]*aria-hidden="true"/);
});
