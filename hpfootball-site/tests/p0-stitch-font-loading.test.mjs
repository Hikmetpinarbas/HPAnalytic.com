import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('Stitch editorial fonts are actively loaded, not merely named in CSS',()=>{
 const layout=readFileSync(new URL('../src/layouts/BaseLayout.astro',import.meta.url),'utf8');
 assert.match(layout,/fonts\.googleapis\.com\/css2\?family=Inter/);
 assert.match(layout,/JetBrains\+Mono/);
 assert.match(layout,/Newsreader/);
 assert.match(layout,/fonts\.gstatic\.com/);
});
