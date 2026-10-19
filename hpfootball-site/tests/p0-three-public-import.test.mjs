import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('Three module uses Vite-managed source import instead of public asset import',()=>{
 const s=readFileSync(new URL('../src/scripts/editorial-depth-runtime.js',import.meta.url),'utf8');
 assert.match(s,/import\('\.\/vendor\/three\.module\.js'\)/);
});
