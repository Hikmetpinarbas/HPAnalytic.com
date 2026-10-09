import test from 'node:test';import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';
const c=await readFile(new URL('../src/components/ArticleEvidenceBlock.astro',import.meta.url),'utf8').catch(()=> '');
test('evidence block follows HPAnalytic argument chain',()=>{for(const x of ['CLAIM','EVIDENCE','COUNTEREVIDENCE','NEXT QUESTION'])assert.match(c,new RegExp(x));});
test('evidence block composes pitch sequence and interpretation rather than duplicating them',()=>{assert.match(c,/TacticalCanvas/);assert.match(c,/TacticalSequence/);assert.match(c,/EvidenceInterpretation/);});
test('evidence block requires authored source and claim boundary surfaces',()=>{assert.match(c,/sourceLabel/);assert.match(c,/claimClass/);assert.match(c,/boundary/);assert.match(c,/counterevidence/);});
test('evidence block never fabricates a visual fallback',()=>{assert.doesNotMatch(c,/Math\.random|placeholder|fake|mock/i);assert.match(c,/visualType/);});
