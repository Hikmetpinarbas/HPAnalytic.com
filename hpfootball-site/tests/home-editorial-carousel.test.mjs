import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const page=readFileSync(new URL('../src/pages/index.astro',import.meta.url),'utf8');
test('homepage renders editorial carousel from public monograph collection',()=>{
 assert.match(page,/import EditorialCarousel from '..\/components\/EditorialCarousel\.astro'/);
 assert.match(page,/<EditorialCarousel\s+items=\{monographs\.map/);
 assert.match(page,/href: `\/monographs\/\$\{m\.id\}`/);
});
