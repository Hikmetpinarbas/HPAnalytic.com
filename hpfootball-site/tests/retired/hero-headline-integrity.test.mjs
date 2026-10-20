import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const css=await readFile(new URL('../src/styles/global.css',import.meta.url),'utf8');
test('hero thesis keeps the emphasized word intact across release viewports',()=>{
  assert.match(css,/\.hero h1 em\s*\{[^}]*white-space:\s*nowrap/s);
});
