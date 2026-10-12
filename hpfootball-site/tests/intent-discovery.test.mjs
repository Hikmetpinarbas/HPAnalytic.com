import test from 'node:test';import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';
const c=await readFile(new URL('../src/components/IntentDiscovery.astro',import.meta.url),'utf8').catch(()=> '');
test('discovery starts from football intent rather than product jargon',()=>{for(const x of ['Bir maçı anlamak','Bir oyuncuyu anlamak','Bir iddiayı sınamak','Veriyi görmek'])assert.match(c,new RegExp(x));});
test('destinations are content-gated and reuse site surface truth',()=>{assert.match(c,/getAvailablePrimaryNavigation|site-surfaces/);assert.match(c,/available/);});
test('ask HPA is not falsely exposed as a working destination',()=>{assert.doesNotMatch(c,/href=["']\/ask-hpa/);assert.match(c,/ASK HPA/);assert.match(c,/ARAŞTIRMA/);});
test('discovery remains static and accessible',()=>{assert.match(c,/aria-label/);assert.doesNotMatch(c,/client:|onclick|setInterval/i);});
