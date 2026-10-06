import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
const home=readFileSync(new URL('../src/pages/index.astro',import.meta.url),'utf8');const css=readFileSync(new URL('../src/styles/global.css',import.meta.url),'utf8');
test('research spotlight is honest and deep-links to research',()=>{assert.match(home,/class="research-spotlight"/);assert.match(home,/ARAŞTIRMA(<br\/>| )MASASI/);assert.match(home,/href="\/research"/);assert.doesNotMatch(home,/fake research/i)});
test('research spotlight communicates method rather than fabricated publication',()=>{for(const x of ['SORU','KANIT','KARŞI-KANIT','SINIR'])assert.match(home,new RegExp(x));});
test('research spotlight has editorial desktop and mobile hierarchy',()=>{assert.match(css,/\.research-spotlight\{/);assert.match(css,/\.research-method\{/);assert.match(css,/@media\(max-width:560px\)[\s\S]*\.research-spotlight/);});
