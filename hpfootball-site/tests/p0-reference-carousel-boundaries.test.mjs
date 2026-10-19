import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('M02 Evidence Carousel exposes truthful previous/next boundary state',()=>{
 const src=readFileSync(new URL('../src/components/EditorialCarousel.astro',import.meta.url),'utf8');
 assert.match(src,/const updateControls = \(\) =>/);
 assert.match(src,/previous\.disabled=atStart/);
 assert.match(src,/next\.disabled=atEnd/);
 assert.match(src,/track\.addEventListener\('scroll',\s*updateControls/);
 assert.match(src,/new ResizeObserver\(updateControls\)/);
});
