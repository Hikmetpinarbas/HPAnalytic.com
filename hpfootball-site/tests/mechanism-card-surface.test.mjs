import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const component=await readFile(new URL('../src/components/MechanismCard.astro',import.meta.url),'utf8').catch(()=>'');
const article=await readFile(new URL('../src/pages/articles/[...id].astro',import.meta.url),'utf8');
const schema=await readFile(new URL('../src/content.config.ts',import.meta.url),'utf8');

test('legacy mechanism component retains evidence-bound structure for separate use',()=>{
 for(const label of ['MEKANİZMA','KANIT','KARŞI KANIT','BAĞLAM','GÜVEN SEVİYESİ','İDDİA SINIRI','GÖRSEL AÇIKLAMA'])
  assert.match(component,new RegExp(label));
 assert.match(component,/canRenderEditorialEvidence/);
 assert.match(component,/adaptMechanismCard/);
});
test('mechanism data remains in schema but unwanted reader card is not rendered',()=>{
 assert.match(schema,/mechanismCard/);
 assert.doesNotMatch(article,/<MechanismCard|import MechanismCard/);
});
