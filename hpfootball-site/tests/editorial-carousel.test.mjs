import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/components/EditorialCarousel.astro',import.meta.url),'utf8');
test('editorial carousel preserves link semantics and input-safe labels',()=>{assert.match(source,/aria-label="Önceki içerikler"/);assert.match(source,/aria-label="Sonraki içerikler"/);assert.match(source,/href=\{item.href\}/);assert.match(source,/<a /)});
test('uses native mobile scroll and reduced motion',()=>{assert.match(source,/scroll-snap-type:\s*x mandatory/);assert.match(source,/prefers-reduced-motion/);assert.doesNotMatch(source,/setInterval|autoplay/);});
test('contains focusable interactive controls and explicit unique instance identity',()=>{assert.match(source,/type="button"/);assert.match(source,/data-carousel-track/);assert.match(source,/data-carousel-prev/);assert.match(source,/data-carousel-next/);});
