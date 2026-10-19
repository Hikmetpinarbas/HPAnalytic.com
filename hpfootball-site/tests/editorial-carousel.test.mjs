import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('carousel is wired to admitted editorial entries, supports controls and reduced motion',()=>{
 const home=fs.readFileSync('src/pages/index.astro','utf8');
 const component=fs.readFileSync('src/components/EditorialCarousel.astro','utf8');
 const css=fs.readFileSync('src/styles/stitch-editorial.css','utf8');
 assert.match(home,/isPublicEditorialItem\(entry\.data\)/);
 assert.match(home,/<EditorialCarousel items=/);
 assert.match(component,/aria-label="Önceki içerik"/);
 assert.match(component,/aria-label="Sonraki içerik"/);
 assert.match(component,/scrollTo/);
 assert.match(component,/item\.data\.claimCeiling/);
 assert.match(css,/scroll-snap-type:x mandatory/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
