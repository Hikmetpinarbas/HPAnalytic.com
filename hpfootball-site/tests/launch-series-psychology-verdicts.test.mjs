import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluatePsychologyGate } from '../src/lib/editorial-psychology-gate.mjs';

const ids=['launch-series-01-kamera','launch-series-01-baski-altinda','launch-series-01-counterpress'];
for(const id of ids){
  test(`${id} has an auditable psychology/cognitive-safety PASS candidate`,()=>{
    const review=JSON.parse(readFileSync(new URL(`../editorial/qa/psychology/${id}.psychology.json`,import.meta.url),'utf8'));
    assert.equal(review.article_id,id);
    assert.equal(review.authority,'CANDIDATE_REVIEW');
    const gate=evaluatePsychologyGate(review);
    assert.equal(gate.allowed,true);
    assert.equal(gate.status,'PASS');
    assert.match(review.limits.join(' '),/not football-truth validation/i);
    assert.match(review.limits.join(' '),/does not grant HUMAN_APPROVED/i);
  });
}
