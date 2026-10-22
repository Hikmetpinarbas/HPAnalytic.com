import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const route=readFileSync(new URL('../src/pages/articles/[...id].astro',import.meta.url),'utf8');

test('reader-first page prioritizes article over removed QA panels',()=>{
  assert.match(route,/<div class="prose" id="article-body"><Content\/>/);
  assert.doesNotMatch(route,/article-counterevidence|claim-boundary|article-source-validation/);
  assert.match(route,/article-sources/);
  assert.ok(route.indexOf('id="article-body"')<route.indexOf('article-sources'));
});
