import test from 'node:test'; import assert from 'node:assert/strict'; import {readFileSync} from 'node:fs';
const home=readFileSync(new URL('../src/pages/index.astro',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/styles/global.css',import.meta.url),'utf8');
test('latest work is a real analysis projection with deep links',()=>{assert.match(home,/latestAnalysis/);assert.match(home,/class="latest-work"/);assert.match(home,/SON ANALİZLER/);assert.match(home,/href="\/analysis"/);assert.match(home,/['"]\/articles\/['"]\+a\.id/)});
test('latest work has dominant-first editorial hierarchy and mobile collapse',()=>{assert.match(css,/\.latest-work\{/);assert.match(css,/\.latest-lead\{/);assert.match(css,/\.latest-list\{/);assert.match(css,/@media\(max-width:560px\)[\s\S]*\.latest-work/);});
