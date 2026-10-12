import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePsychologyGate } from '../src/lib/editorial-psychology-gate.mjs';

const passReview={
  status:'PASS',
  dimensions:{
    observation_intention_boundary:'PASS',
    evidence_perception_boundary:'PASS',
    autonomy_safety:'PASS',
    cognitive_integrity:'PASS',
    visual_truth_boundary:'PASS',
  },
  reviewer_scope:'EDITORIAL_PSYCHOLOGY_COGNITIVE_SAFETY',
  rationale:['Observation is not promoted to intention.'],
};

test('psychology gate passes only a complete explicit PASS review',()=>{
  const result=evaluatePsychologyGate(passReview);
  assert.equal(result.allowed,true);
  assert.equal(result.status,'PASS');
  assert.deepEqual(result.reasons,[]);
});

test('psychology gate fails closed when review is absent',()=>{
  const result=evaluatePsychologyGate();
  assert.equal(result.allowed,false);
  assert.ok(result.reasons.includes('PSYCHOLOGY_REVIEW_REQUIRED'));
});

test('psychology gate holds when any cognitive-safety dimension is not PASS',()=>{
  const review=structuredClone(passReview);
  review.dimensions.autonomy_safety='HOLD';
  const result=evaluatePsychologyGate(review);
  assert.equal(result.allowed,false);
  assert.equal(result.status,'HOLD');
  assert.ok(result.reasons.includes('AUTONOMY_SAFETY_NOT_PASSED'));
});

test('psychology gate does not accept a bare status without auditable dimensions',()=>{
  const result=evaluatePsychologyGate({status:'PASS'});
  assert.equal(result.allowed,false);
  assert.ok(result.reasons.includes('PSYCHOLOGY_REVIEW_INCOMPLETE'));
});

test('psychology review can be attached without changing football claim authority', async()=>{
  const { applyPsychologyReview }=await import('../src/lib/editorial-psychology-gate.mjs');
  const item={source_system:'HP_CONTENT_INTELLIGENCE',claim_ceiling:'BOUNDED',article_meta:{truth_authority:false}};
  const next=applyPsychologyReview(item,passReview);
  assert.equal(next.article_meta.psychology_status,'PASS');
  assert.equal(next.article_meta.truth_authority,false);
  assert.equal(next.claim_ceiling,'BOUNDED');
});
