import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('Three public asset dynamic import is exempt from bundler static resolution',()=>{
 const s=readFileSync(new URL('../src/scripts/editorial-depth-runtime.js',import.meta.url),'utf8');
 assert.match(s,/const threeModuleUrl\s*=\s*'\/vendor\/hp-depth\/three\.module\.js'/);
 assert.match(s,/import\(\/\* @vite-ignore \*\/ threeModuleUrl\)/);
});
