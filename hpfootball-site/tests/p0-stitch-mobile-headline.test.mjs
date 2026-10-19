import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('mobile Stitch headline does not override editorial contract with previous oversized important rule',()=>{
const css=readFileSync(new URL('../src/styles/stitch-editorial.css',import.meta.url),'utf8');
assert.doesNotMatch(css,/\.hero h1\{font-size:clamp\(39px,11\.5vw,58px\)!important\}/);
assert.match(css,/@media\(max-width:767px\)\{[\s\S]*?\.hero h1\{font-size:clamp\(36px,9vw,44px\)!important\}/);
});
