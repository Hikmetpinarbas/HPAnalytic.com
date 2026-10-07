import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const s03=readFileSync(new URL('../editorial/inbox/article--715d74e99a1c.json',import.meta.url),'utf8');
test('counterpress launch candidate does not use HRC shot-endpoint as its main source',()=>{
  assert.doesNotMatch(s03,/HPA HRC shot-endpoint capital/i);
  assert.match(s03,/evidence-boundary contracts \+ existing short-recovery\/counterpress methodology capital/i);
  assert.match(s03,/SHORT_RECOVERY_OUTCOME_AND_OPERATIONAL_WINDOW_ONLY_NOT_COUNTERPRESS_MECHANISM_OR_QUALITY/);
});
