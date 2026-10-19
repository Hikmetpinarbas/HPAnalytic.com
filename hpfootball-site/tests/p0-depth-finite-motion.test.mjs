import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('depth scene is finite and wakes on user input, not perpetual rAF',()=>{
 const s=readFileSync(new URL('../src/scripts/editorial-depth-runtime.js',import.meta.url),'utf8');
 assert.doesNotMatch(s,/repeat:\s*-1/);
 assert.match(s,/const MOTION_WINDOW_MS\s*=/);
 assert.match(s,/function scheduleFrame\(/);
 assert.match(s,/element\.addEventListener\('pointermove',\s*onPointer/);
});
