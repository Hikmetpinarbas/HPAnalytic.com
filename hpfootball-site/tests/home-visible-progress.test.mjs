import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home=readFileSync(new URL('../src/pages/index.astro', import.meta.url),'utf8');
const layout=readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url),'utf8');
const css=readFileSync(new URL('../src/styles/global.css', import.meta.url),'utf8');
const logo=readFileSync(new URL('../src/components/Logo.astro', import.meta.url),'utf8');

test('homepage above fold carries identity, discovery action and real featured analysis',()=>{
  assert.match(home,/HPANALYTIC/);
  assert.match(readFileSync(new URL('../src/components/HeroCartography.astro', import.meta.url),'utf8'),/HİKMET PINARBAŞ/);
  assert.match(readFileSync(new URL("../src/components/HeroCartography.astro",import.meta.url),"utf8"),/href="\/visual-lab" class="action-primary"/);
  assert.match(home,/featuredStory/);
  assert.match(home,/class="featured-analysis"/);
  assert.match(home,/\/articles\/\$\{featuredStory\.id\}/);
});
test('global header exposes HPAnalytic product identity without duplicating navigation truth',()=>{
  assert.match(layout,/<Logo\s*\/>/);
  assert.match(logo,/hp-wordmark__name/);
  assert.match(layout,/<EditorialHeader navigation=\{editorialNavigation\}/);
});
test('above-fold system has explicit responsive hero and featured transition',()=>{
  assert.match(css,/\.hero-actions\{/);
  assert.match(css,/\.featured-analysis\{/);
  assert.match(css,/@media\(max-width:900px\)[\s\S]*\.hero\{/);
});
