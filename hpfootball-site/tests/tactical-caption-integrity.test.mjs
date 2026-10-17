import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const css=await readFile(new URL('../src/styles/global.css',import.meta.url),'utf8');
test('tactical semantic boundary owns a full row instead of clipping beside evidence columns',()=>{
  assert.match(css,/\.hp-pitch__caption\s*\{[^}]*grid-template-columns:\s*repeat\(3,minmax\(0,1fr\)\)/s);
  assert.match(css,/\.hp-pitch__caption em\s*\{[^}]*grid-column:\s*1\/-1/s);
});
