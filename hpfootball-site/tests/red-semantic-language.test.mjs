import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../src/styles/global.css',import.meta.url),'utf8');
test('brand line break and hero reveal do not teach red as a generic accent',()=>{
  assert.doesNotMatch(css,/\.hp-break\{[^}]*stroke:var\(--red\)/);
  assert.doesNotMatch(css,/\.hero-entry:before\{[^}]*var\(--red\)/);
});
test('tactical explanatory geometry reserves red for epistemic risk',()=>{
  assert.doesNotMatch(css,/\.hp-pitch__reveal-core\s*\{[^}]*215,45,39/);
  assert.doesNotMatch(css,/\.hp-pitch__force path:first-child\s*\{[^}]*var\(--red\)/);
  assert.doesNotMatch(css,/\.hp-pitch__player--key rect\s*\{[^}]*var\(--red\)/);
});
