import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const home=readFileSync(new URL('../src/pages/index.astro',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/styles/global.css',import.meta.url),'utf8');
test('reading desk only uses approved public articles and does not invent daily stories',()=>{
 assert.match(home,/const readingDesk=articles\.filter/);
 assert.match(home,/const displayReadingDesk=readingDesk.length===1/);
 assert.match(home,/readingDesk\.map/);
 assert.match(home,/href=\{`\/articles\/\$\{item\.id\}`\}/);
 assert.doesNotMatch(home,/BUGÜNÜN ÜÇ GÖZLEMİ/);
});
test('reading desk is responsive and accessible',()=>{
 assert.match(home,/aria-labelledby="reading-desk-title"/);
 assert.match(css,/\.reading-desk-grid/);
 assert.match(css,/@media\(max-width:700px\)\{\.reading-desk-grid/);
});
