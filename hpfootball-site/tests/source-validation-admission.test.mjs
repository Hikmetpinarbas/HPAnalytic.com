import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateAdmission} from '../src/lib/site-admission.mjs';

function item(validated){
 return {
  id:'x',title:'x',body:'x',content_type:'ARTICLE_METHOD',source_system:'HP_CONTENT_INTELLIGENCE',
  claim_readiness:'EDITORIAL_CLAIM_OUTPUT_READY',truth_status:'EDITORIAL_CLAIM_OUTPUT_READY',
  freshness:'PASS',currentness:'CURRENT',rights_status:'OWNED',provenance:'p',warnings:[],
  article_meta:{psychology_status:'PASS',source_claims_validated:validated},
  visual_required:false
 };
}

test('content-intelligence article fails closed until source claims are validated',()=>{
 const blocked=evaluateAdmission(item(false),{human_approval:'HUMAN_APPROVED'});
 assert.equal(blocked.allowed,false);
 assert.ok(blocked.reasons.includes('SOURCE_CLAIMS_VALIDATION_REQUIRED'));
 const allowed=evaluateAdmission(item(true),{human_approval:'HUMAN_APPROVED'});
 assert.equal(allowed.allowed,true);
});
