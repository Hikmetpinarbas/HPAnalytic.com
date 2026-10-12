import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveKnowledgeRelations } from '../src/lib/knowledge-relations.mjs';

const current={id:'a',data:{relations:{mechanisms:['role'],teams:[],roles:['fullback'],researchLines:['event-boundary']}}};
const candidates=[
 {id:'b',data:{title:'B',relations:{mechanisms:['role'],teams:[],roles:[],researchLines:[]}}},
 {id:'c',data:{title:'C',relations:{mechanisms:[],teams:[],roles:['fullback'],researchLines:[]}}},
 {id:'d',data:{title:'D',relations:{mechanisms:[],teams:['x'],roles:[],researchLines:[]}}},
];
test('returns only explicit shared authored axes',()=>{
 const out=resolveKnowledgeRelations(current,candidates);
 assert.equal(out.length,2);
 assert.deepEqual(out.map(x=>x.reason),['AYNI MEKANİZMA','AYNI ROL']);
});
test('never relates an article to itself',()=>{
 assert.equal(resolveKnowledgeRelations(current,[current]).length,0);
});
test('component exposes relation reason rather than recommendation language',async()=>{
 const s=await import('node:fs/promises').then(fs=>fs.readFile(new URL('../src/components/KnowledgeRelations.astro',import.meta.url),'utf8'));
 assert.match(s,/NEDEN BAĞLANTILI/);
 assert.doesNotMatch(s,/önerilen|recommended|personalized/i);
});
test('article schema supports authored relation axes',async()=>{
 const s=await import('node:fs/promises').then(fs=>fs.readFile(new URL('../src/content.config.ts',import.meta.url),'utf8'));
 for(const key of ['mechanisms','teams','roles','researchLines']) assert.match(s,new RegExp(key));
});
