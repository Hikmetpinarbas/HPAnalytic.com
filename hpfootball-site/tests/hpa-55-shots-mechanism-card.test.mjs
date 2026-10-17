import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { adaptMechanismCard, canRenderEditorialEvidence } from '../src/lib/editorial-evidence-adapter.mjs';
const raw=JSON.parse(await readFile(new URL('../editorial/qa/55-shots-2-goals.mechanism-card.json',import.meta.url),'utf8'));
test('55 shots / 2 goals remains a bounded HPA candidate while exercising the public mechanism surface',()=>{
  assert.equal(raw.status,'HPA_EXPORT_CANDIDATE');
  assert.match(raw.provenance,/Not HUMAN_APPROVED/);
  assert.match(raw.claim_ceiling,/kalıcı hüküm kuramaz/);
  const model=adaptMechanismCard(raw);
  assert.equal(canRenderEditorialEvidence(model),true);
  assert.equal(model.evidence.length,2);
  assert.ok(model.counterevidence.length>=2);
});
