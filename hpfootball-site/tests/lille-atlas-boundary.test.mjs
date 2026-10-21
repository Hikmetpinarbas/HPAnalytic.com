import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../src/pages/mac/lille-galatasaray-2026-10-21.astro',import.meta.url),'utf8');
test('atlas uses inclusive end boundary, consistent with published within-35 counts',()=>{
 assert.match(src,/function indexOf\(v,bounds\)/);
 assert.match(src,/v<=bounds\[i\+1\]/);
 assert.doesNotMatch(src,/v<bounds\[i\+1\]/);
});
