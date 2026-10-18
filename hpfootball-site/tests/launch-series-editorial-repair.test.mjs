import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const files=['article--09f39215f996.json','article--28ac3467e7c2.json','article--715d74e99a1c.json'];
const items=files.map(f=>JSON.parse(readFileSync(new URL('../editorial/inbox/'+f,import.meta.url),'utf8')).item);
test('launch series keeps publication and source-validation boundaries',()=>{
 for(const i of items){assert.equal(i.article_meta?.source_claims_validated,false);assert.match(i.body,/HUMAN_APPROVAL_REQUIRED/)}
});
test('pressure article uses ordinary Turkish and preserves label-to-mechanism reveal',()=>{
 const b=items.find(x=>x.id==='launch-series-01-baski-altinda').body;
 assert.match(b,/Aynı veri etiketi\. İki farklı futbol anı\./);
 assert.match(b,/ETİKET → GÖZLEM → MEKANİZMA\?/);
 assert.match(b,/aynı etiket, aynı futbol mekanizması değildir/i);
 assert.doesNotMatch(b,/annotation|operational definition/i);
});
test('camera and counterpress preserve their canonical memory traces',()=>{
 const k=items.find(x=>x.id==='launch-series-01-kamera').body;
 const c=items.find(x=>x.id==='launch-series-01-counterpress').body;
 assert.match(k,/kadrajın kenarı bazen yalnız görüntünün değil, \*\*iddianın da sınırıdır\.\*\*/i);
 assert.match(c,/\*\*Aynı sonuç, aynı mekanizma değildir\.\*\*/);
});
