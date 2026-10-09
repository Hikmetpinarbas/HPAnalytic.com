import test from 'node:test';import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';
const c=await readFile(new URL('../src/components/EvidenceInterpretation.astro',import.meta.url),'utf8').catch(()=> '');
test('visual evidence must answer the four editorial questions',()=>{for(const x of ['NE GÖRÜYORUZ?','NEDEN OLUYOR?','NE ANLAMA GELİYOR?','KANIT SINIRI'])assert.match(c,new RegExp(x.replace('?','\\?')))});
test('interpretation is authored and claim bounded',()=>{assert.match(c,/observation/);assert.match(c,/mechanism/);assert.match(c,/meaning/);assert.match(c,/boundary/);assert.match(c,/claimClass/)});
test('component does not manufacture metrics or recommendations',()=>{assert.doesNotMatch(c,/Math\.random|score|recommend|client:/i)});
