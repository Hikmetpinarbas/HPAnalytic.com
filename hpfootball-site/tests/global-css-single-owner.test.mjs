import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../src/styles/global.css',import.meta.url),'utf8');
test('public product shell CSS has one canonical owner block',()=>{
  assert.equal((css.match(/\/\* HPAnalytic public product shell — identity \+ motion \*\//g)||[]).length,1);
});
test('article share control inherits product typography, tokens and a 44px target at every viewport',()=>{
  const rule=css.match(/\.article-share-button\{([^}]*)\}/)?.[1] ?? '';
  assert.doesNotMatch(rule,/Arial|#[0-9a-f]{3,8}/i);
  assert.match(rule,/font:[^;]*var\(--font-sans\)/);
  assert.match(rule,/min-height:44px/);
  assert.match(rule,/border:[^;]*var\(--gold/);
});
