import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('editorial depth includes accessible layered geometric component',()=>{
 const component=fs.readFileSync('src/components/EditorialDepthScene.astro','utf8');
 const css=fs.readFileSync('src/styles/editorial-depth-scene.css','utf8');
 const home=fs.readFileSync('src/pages/index.astro','utf8');
 assert.match(home,/<EditorialDepthScene\s*\/>/);
 assert.match(component,/<svg/);
 assert.match(component,/aria-hidden="true"/);
 assert.match(css,/backdrop-filter:\s*blur\(8px\)/);
 assert.match(css,/mix-blend-mode:\s*overlay/);
 assert.match(css,/prefers-reduced-motion:\s*reduce/);
});
