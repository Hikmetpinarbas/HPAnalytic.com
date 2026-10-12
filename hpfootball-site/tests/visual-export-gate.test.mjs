import test from 'node:test';import assert from 'node:assert/strict';import {assessVisualExport} from '../src/lib/visual-export-gate.mjs';
const clean={mimeType:'image/png',assetId:'hp-visual-001',rightsStatus:'ORIGINAL',rightsEvidence:'original asset manifest',visibleSignatureVerified:true,integratedBrandVerified:true,sourceHash:'a'.repeat(64),claimsChecked:true};
test('no unsigned or unlicensed export is admitted',()=>{const r=assessVisualExport({mimeType:'image/png'});assert.equal(r.status,'BLOCKED');assert.ok(r.failures.includes('VISIBLE_SIGNATURE_UNVERIFIED'));assert.ok(r.failures.includes('RIGHTS_UNVERIFIED'))});
test('compliant metadata reaches review but not automatic publication',()=>assert.equal(assessVisualExport(clean).status,'READY_FOR_HUMAN_REVIEW'));
test('synthetic scenes require disclosure',()=>assert.ok(assessVisualExport({...clean,containsSyntheticScene:true}).failures.includes('SYNTHETIC_DISCLOSURE_MISSING')));
test('no fake or missing source hash passes',()=>assert.ok(assessVisualExport({...clean,sourceHash:'fake'}).failures.includes('SOURCE_HASH_MISSING')));
