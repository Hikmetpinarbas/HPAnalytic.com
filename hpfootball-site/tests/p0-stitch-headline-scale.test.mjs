import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('M01 approved Stitch headline hierarchy bounds hero at 56px and section headers at 40px',()=>{
const css=readFileSync(new URL('../src/styles/stitch-editorial.css',import.meta.url),'utf8');
assert.match(css,/\.hero h1\{font-size:clamp\(36px,4\.6vw,56px\)/);
assert.match(css,/\.hpa-carousel-head h2[^\{]*\{font-size:clamp\(28px,3\.2vw,40px\)/);
});
