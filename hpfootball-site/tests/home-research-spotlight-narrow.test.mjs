import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const css=readFileSync(new URL('../src/styles/global.css',import.meta.url),'utf8');
// 320px QA: a fixed 52px "ARAŞTIRMA" heading was wider than the 280px content box and overflowed the page.
test('research spotlight heading scales down below 372px instead of overflowing',()=>{
  const mobile=css.match(/@media\(max-width:560px\)\{\.research-spotlight[^\n]*/)?.[0]??'';
  assert.match(mobile,/\.research-intro h2\{font-size:clamp\(40px,14vw,52px\)\}/);
  assert.doesNotMatch(mobile,/\.research-intro h2\{font-size:52px\}/);
});
