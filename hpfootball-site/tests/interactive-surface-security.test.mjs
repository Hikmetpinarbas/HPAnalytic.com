import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('embedded original match surface has scoped framing and D3 permission',()=>{
 const headers=read('public/_headers');
 const section=headers.split('/match-surfaces/besiktas-crystal-palace-interactive.html')[1];
 assert.ok(section);
 assert.match(section,/! X-Frame-Options/);
 assert.match(section,/frame-ancestors 'self'/);
 assert.match(section,/script-src[^\n]*https:\/\/cdnjs.cloudflare.com/);
 assert.match(headers,/frame-ancestors 'none'/);
});
test('interactive zone layer follows filtered events instead of whole-match grid',()=>{
 const page=read('public/match-surfaces/besiktas-crystal-palace-interactive.html');
 const zone=page.split("if(S.layer==='zones')")[1]?.split("if(S.layer==='network')")[0];
 assert.ok(zone);
 assert.match(zone,/evs\.forEach/);
 assert.doesNotMatch(zone,/d\.grid/);
});
