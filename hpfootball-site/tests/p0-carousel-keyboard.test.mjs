import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('carousel handles left/right arrows without accidental double native scroll',()=>{
const s=readFileSync(new URL('../src/components/EditorialCarousel.astro',import.meta.url),'utf8');
assert.match(s,/track\.addEventListener\('keydown'/);
assert.match(s,/ArrowLeft/);
assert.match(s,/ArrowRight/);
assert.match(s,/event\.preventDefault\(\)/);
});
