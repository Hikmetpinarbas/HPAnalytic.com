import test from 'node:test';
import assert from 'node:assert/strict';
import { buildKnowledgePath } from '../src/lib/knowledge-relations.mjs';

const a={id:'a',data:{relations:{mechanisms:['build-up'],teams:['Team A'],roles:['fullback'],researchLines:['event-boundary']}}};
const items=[
 {id:'b',data:{title:'B',description:'B desc',relations:{mechanisms:['build-up'],teams:[],roles:[],researchLines:[]}}},
 {id:'c',data:{title:'C',description:'C desc',relations:{mechanisms:[],teams:[],roles:['fullback'],researchLines:[]}}},
 {id:'d',data:{title:'D',description:'D desc',relations:{mechanisms:[],teams:[],roles:[],researchLines:['event-boundary']}}},
];
test('builds a multi-axis football discovery path with explicit reasons',()=>{
 const out=buildKnowledgePath(a,items);
 assert.deepEqual(out.map(x=>x.reason),['AYNI MEKANİZMA','AYNI ROL','AYNI ARAŞTIRMA HATTI']);
 assert.equal(new Set(out.map(x=>x.article.id)).size,out.length);
});
test('path never invents a relation when authored axes do not intersect',()=>{
 const out=buildKnowledgePath(a,[{id:'z',data:{relations:{mechanisms:['press'],teams:['Team Z'],roles:['striker'],researchLines:['other']}}}]);
 assert.deepEqual(out,[]);
});
test('knowledge path UI explains movement rather than recommendation',async()=>{
 const fs=await import('node:fs/promises');
 const s=await fs.readFile(new URL('../src/components/KnowledgePath.astro',import.meta.url),'utf8');
 assert.match(s,/FUTBOL BİLGİ AĞI/);
 assert.match(s,/BAĞLANTI NEDENİ/);
 assert.doesNotMatch(s,/recommended|önerilen|kişiselleştiril/i);
});
