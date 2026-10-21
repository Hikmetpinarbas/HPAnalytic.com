import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const route=readFileSync(new URL('../src/pages/articles/[...id].astro',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/styles/global.css',import.meta.url),'utf8');

test('sources and counterevidence are progressive disclosure after the article body',()=>{
  assert.match(route,/<details class="article-disclosure article-counterevidence"/);
  assert.match(route,/<summary>Karşı kanıt ve sınırlar/);
  assert.match(route,/<details class="article-disclosure article-sources"/);
  assert.match(route,/<summary>Kaynakları incele/);
  assert.ok(route.indexOf('<div class="prose"><Content\/>') < route.indexOf('article-counterevidence'));
  assert.ok(route.indexOf('article-counterevidence') < route.indexOf('article-sources'));
});

test.skip('expanded evidence uses a ghost layer rather than a boxed card',()=>{
  assert.match(css,/\.article-disclosure\[open\]/);
  assert.match(css,/backdrop-filter:/);
  assert.match(css,/background:rgba\(/);
  assert.match(css,/\.article-evidence-note,.article-counterevidence,.article-sources\{padding:0;border-bottom:0\}/);
});
