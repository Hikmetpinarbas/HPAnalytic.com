import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('home page does not simultaneously render carousel and reading desk for identical articles',()=>{
 const s=readFileSync(new URL('../src/pages/index.astro',import.meta.url),'utf8');
 assert.match(s,/const displayReadingDesk=/);
 assert.match(s,/<EditorialCarousel items=\{displayReadingDesk \? \[\] : readingDesk\}\/>/);
 assert.match(s,/\{displayReadingDesk && <section class="reading-desk"/);
});
