import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {createDerbyMetrics} from '../src/lib/derby-composite-metrics.mjs';
const d=JSON.parse(readFileSync(new URL('../src/data/preserved-derby-data.json',import.meta.url)));
test('all metrics are reproducible from same team source-family',()=>{
 const x=createDerbyMetrics(d.team);
 assert.equal(x.GS.halfToFinalThird,29/71);
 assert.equal(x.FB.halfToFinalThird,15/41);
 assert.equal(x.GS.highRecoveryShare,11/47);
 assert.equal(x.FB.highRecoveryShare,1/31);
 assert.equal(x.GS.boxActionShare,51/789);
 assert.equal(x.FB.boxActionShare,10/589);
 assert.ok(x.GS.composite>x.FB.composite);
});
test('composite is bounded, rejects missing/invalid denominator and never invents causal transition',()=>{
 const x=createDerbyMetrics({GS:{...d.team.GS,'Entries to the opponent\'s half':0},FB:d.team.FB});
 assert.equal(x.GS.composite,null);
 assert.equal(x.GS.halfToFinalThird,null);
 assert.equal(x.GS.annotation,'Yetersiz kaynak');
});
