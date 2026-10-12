import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const article=readFileSync(new URL('../src/content/articles/event-only-boundary.md',import.meta.url),'utf8');
test('editorial illustration does not carry a defensive portrait disclaimer',()=>{
  assert.doesNotMatch(article,/temsili bir editoryal illüstrasyondur; gerçek kişi portresi değildir/i);
});
