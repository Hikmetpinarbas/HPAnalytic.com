import test from 'node:test'; import assert from 'node:assert/strict'; import {readFileSync} from 'node:fs';
for(const id of ['launch-series-01-kamera','launch-series-01-baski-altinda','launch-series-01-counterpress']){
 test(id+' has bounded council repair review',()=>{
  const x=JSON.parse(readFileSync(new URL('../editorial/qa/council/'+id+'.council-review.json',import.meta.url)));
  assert.equal(x.status,'REPAIR'); assert.equal(x.truth_authority,false); assert.equal(x.human_approved,false);
  assert.ok(x.ordinary_reader?.verdict); assert.ok(x.eureka?.verdict); assert.ok(x.repair_actions.length>=4);
 });
}
