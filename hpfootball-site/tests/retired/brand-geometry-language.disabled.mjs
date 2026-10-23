import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const css=await readFile(new URL('../src/styles/global.css',import.meta.url),'utf8');
test('HP visual grammar has named evidence geometry tokens',()=>{
  for(const token of ['--hp-axis','--hp-diagonal','--hp-evidence-glow','--hp-context-blue','--hp-risk-red']) assert.match(css,new RegExp(token));
});
test('brand geometry is structural rather than decorative card styling',()=>{
  assert.match(css,/\.hp-geometry-frame/);
  assert.match(css,/linear-gradient\(135deg/);
  assert.match(css,/var\(--hp-axis\)/);
});
