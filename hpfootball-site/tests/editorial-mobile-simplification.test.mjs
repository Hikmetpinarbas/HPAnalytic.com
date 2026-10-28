import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
const page=readFileSync(new URL('../src/pages/mac/galatasaray-fenerbahce-2026-10-26-mac-sonu.astro',import.meta.url),'utf8');
test('derby does not interrupt analysis with unexplained 11-1 parchment card',()=>{
 assert.doesNotMatch(page,/continuity-paper|<p>11–1<\/p>/);
});
test('derby tools use compact inline controls on mobile instead of oversized buttons',()=>{
 assert.match(page,/\.continuity-share\s*\{[^}]*gap:\s*8px/);
 assert.match(page,/\.continuity-share a,\.continuity-share button\s*\{[^}]*padding:\s*6px 10px/);
 assert.match(page,/@media\(max-width:600px\)\{\.continuity-share/);
});
