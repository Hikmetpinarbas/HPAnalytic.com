import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const css=readFileSync(new URL('src/styles/global.css',root),'utf8');
const layout=readFileSync(new URL('src/layouts/BaseLayout.astro',root),'utf8');
test('motion observer runs only on intersecting sections and unobserves them',()=>{
 assert.match(layout,/IntersectionObserver/);
 assert.match(layout,/if \(!entry\.isIntersecting\) continue/);
 assert.match(layout,/self\.unobserve\(entry\.target\)/);
});
test('motion disabled with reduced-motion preferences',()=>{
 assert.match(layout,/prefers-reduced-motion: reduce/);
 assert.match(css,/\.hp-motion-observed, \.hero-field \.tactical \{ animation: none !important/);
});
test('animated content remains visible without JavaScript',()=>{
 assert.doesNotMatch(css,/\.hp-motion-observed\s*\{[^}]*visibility\s*:\s*hidden/);
 assert.doesNotMatch(css,/\.hp-motion-observed\s*\{[^}]*display\s*:\s*none/);
});
