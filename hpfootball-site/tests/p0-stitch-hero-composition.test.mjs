import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('approved 5:7 hero composition activates only on desktop and preserves mobile stack',()=>{
const css=readFileSync(new URL('../src/styles/stitch-editorial.css',import.meta.url),'utf8');
assert.match(css,/@media\(min-width:1024px\)\s*\{\s*\.hero\s*\{grid-template-columns:minmax\(0,5fr\) minmax\(0,7fr\)/);
assert.match(css,/@media\(max-width:767px\)/);
});
