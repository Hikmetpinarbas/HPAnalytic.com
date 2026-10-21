import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../src/pages/mac/lille-galatasaray-2026-10-21.astro',import.meta.url),'utf8');
test('atlas uses inclusive end boundary, consistent with published within-35 counts',()=>{
 assert.match(src,/function indexOf\(v,bounds\)/);
 assert.match(src,/v<=bounds\[i\+1\]/);
 assert.doesNotMatch(src,/v<bounds\[i\+1\]/);
});

test('real 26 Lille and 19 Arsenal events agree with inclusive-35 editorial counting',()=>{
 const match=src.match(/const EV\\s*=\\s*(\\{[^\\n]+\\});/);
 assert.ok(match,'event records present');
 const events=JSON.parse(match[1]);
 assert.equal(events.lil_loss.length,26);
 assert.equal(events.ars_rec.length,19);
 assert.equal(events.lil_loss.filter(([x])=>x<35).length,14);
 assert.equal(events.ars_rec.filter(([x])=>x>70).length,11);
});
