import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('M01 pitch footer is readable on paper with bounded caption position',()=>{
const s=readFileSync(new URL('../src/styles/stitch-editorial.css',import.meta.url),'utf8');
assert.match(s,/\.hero-field \.hp-pitch__disclaimer\{[^}]*background:var\(--hpa-sheet\)/);
assert.match(s,/\.hero-field \.hp-pitch__disclaimer\{[^}]*color:var\(--hpa-ink\)/);
assert.match(s,/\.hero-field \.hp-pitch__caption\{[^}]*background:var\(--hpa-sheet\)/);
});
