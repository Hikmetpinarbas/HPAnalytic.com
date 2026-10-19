import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('visual assets are network-first and never served stale from an unbounded cache',()=>{
const source=readFileSync('public/sw.js','utf8');
assert.match(source,/url\.pathname\.startsWith\('\/visuals\/'\)/);
assert.match(source,/fetch\(request,\s*\{cache:\s*'no-store'\}\)/);
assert.match(source,/new Response\('Görsel çevrimdışı kullanılamıyor'/);
});
