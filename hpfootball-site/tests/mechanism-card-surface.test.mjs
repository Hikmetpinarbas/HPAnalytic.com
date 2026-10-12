import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const component=await readFile(new URL('../src/components/MechanismCard.astro',import.meta.url),'utf8').catch(()=> '');
const article=await readFile(new URL('../src/pages/articles/[...id].astro',import.meta.url),'utf8');
const schema=await readFile(new URL('../src/content.config.ts',import.meta.url),'utf8');
const css=await readFile(new URL('../src/styles/global.css',import.meta.url),'utf8');

test('Mechanism Card exposes the full bounded editorial sequence',()=>{
  for(const label of ['MEKANİZMA','KANIT','KARŞI KANIT','BAĞLAM','GÜVEN SEVİYESİ','İDDİA SINIRI','GÖRSEL AÇIKLAMA']) assert.match(component,new RegExp(label));
  assert.match(component,/canRenderEditorialEvidence/);
  assert.match(component,/adaptMechanismCard/);
});
test('article schema and article surface accept governed mechanism cards',()=>{
  assert.match(schema,/mechanismCard/);
  assert.match(article,/MechanismCard/);
  assert.match(article,/a\.data\.mechanismCard/);
});
test('mechanism card has responsive and evidence-boundary styling',()=>{
  assert.match(css,/\.mechanism-card/);
  assert.match(css,/\.mechanism-card__ceiling/);
  assert.match(css,/@media\(max-width:700px\)/);
});
