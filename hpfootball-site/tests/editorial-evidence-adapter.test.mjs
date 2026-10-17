import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {adaptPresentationViewModel,adaptMechanismCard,canRenderEditorialEvidence} from '../src/lib/editorial-evidence-adapter.mjs';

test('editorial adapter consumes governed presentation contracts only',async()=>{
  const source=await readFile(new URL('../src/lib/editorial-evidence-adapter.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(source,/readFile|HPFA.*path|inferClaim|upgradeConfidence|scoreClaim/i);
  assert.match(source,/PRESENTATION_VIEW_MODEL/);
  assert.match(source,/SAFE_MECHANISM_CARD/);
});
test('presentation view keeps mechanism evidence counterevidence context confidence and ceiling distinct',()=>{
  const out=adaptPresentationViewModel({match_context:'Maç',observed_mechanism:'M',evidence:['E'],counterevidence:['K'],confidence_level:'BOUNDED',claim_ceiling:'C',provenance:'HPFA_EXPORT'});
  assert.deepEqual([out.mechanism,out.evidence[0],out.counterevidence[0],out.context,out.confidence,out.claim_ceiling],['M','E','K','Maç','BOUNDED','C']);
  assert.equal(canRenderEditorialEvidence(out),true);
});
test('missing evidence or claim ceiling fails closed',()=>{
  assert.equal(canRenderEditorialEvidence(adaptMechanismCard({mechanism:'M',provenance:'HPFA_EXPORT'})),false);
});
