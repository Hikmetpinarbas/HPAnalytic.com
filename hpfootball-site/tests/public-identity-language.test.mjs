import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const about=readFileSync(new URL('../src/pages/about.astro', import.meta.url),'utf8');
const home=readFileSync(new URL('../src/pages/index.astro', import.meta.url),'utf8');
const layout=readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url),'utf8');
const publicCopy=`${about}\n${home}\n${layout}`;
test('public identity does not market artificial intelligence',()=>{
  assert.doesNotMatch(publicCopy,/yapay zek[aâ]|artificial intelligence|\bAI\b/i);
});
test('about identity leads with football analysis, evidence and context',()=>{
  assert.match(about,/Futbol analisti/);
  assert.match(about,/kanıt/i);
  assert.match(about,/bağlam/i);
});
