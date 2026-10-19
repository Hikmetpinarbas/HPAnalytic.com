import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('Linux browser QA exercises carousel navigation and checks movement when multiple cards overflow',()=>{
const script=readFileSync(new URL('../scripts/release-browser-qa.mjs',import.meta.url),'utf8');
assert.match(script,/data-editorial-carousel/);
assert.match(script,/data-carousel-next/);
assert.match(script,/scrollLeft/);
assert.match(script,/CAROUSEL_BROWSER_QA/);
});
