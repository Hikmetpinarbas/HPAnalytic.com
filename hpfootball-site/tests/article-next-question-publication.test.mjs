import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Invariant from the phone integration-preview (2026-10-09): a next-question link may
// only point at an admitted public article. Unified candidate keeps the P0 implementation
// (resolveNextQuestion), so this test asserts the invariant against it.
test('article next-question links are restricted to admitted public articles',async()=>{
 const source=readFileSync(new URL('../src/pages/articles/[...id].astro',import.meta.url),'utf8');
 assert.match(source,/resolveNextQuestion\(a\.data\.nextQuestion,all\.map/);
 assert.doesNotMatch(source,/\{a\.data\.nextQuestion&&<aside/);
 const {resolveNextQuestion}=await import('../src/lib/next-question.mjs');
 assert.equal(resolveNextQuestion({question:'Q',href:'/articles/not-public'},['public']).href,null);
 assert.equal(resolveNextQuestion({question:'Q',href:'/articles/public'},['public']).href,'/articles/public');
});
