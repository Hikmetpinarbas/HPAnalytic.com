import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAdmission } from '../src/lib/site-admission.mjs';

const base={
 id:'x',title:'x',body:'x',content_type:'ARTICLE_METHOD',source_system:'HP_CONTENT_INTELLIGENCE',
 claim_readiness:'EDITORIAL_CLAIM_OUTPUT_READY',truth_status:'EDITORIAL_CLAIM_OUTPUT_READY',
 freshness:'PASS',currentness:'CURRENT',rights_status:'OWNED',warnings:[],provenance:'x',
 article_meta:{psychology_status:'UNKNOWN'}
};

test('content-intelligence article admission fails closed without psychology PASS',()=>{
 const r=evaluateAdmission(base,{human_approval:'HUMAN_APPROVED'});
 assert.equal(r.allowed,false);
 assert.ok(r.reasons.includes('PSYCHOLOGY_GATE_REQUIRED'));
});

test('content-intelligence article may pass psychology gate only with explicit PASS',()=>{
 const r=evaluateAdmission({...base,article_meta:{psychology_status:'PASS'}},{human_approval:'HUMAN_APPROVED'});
 assert.equal(r.allowed,true);
});
