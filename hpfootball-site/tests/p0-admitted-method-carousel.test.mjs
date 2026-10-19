import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('accepted method entries may populate readingDesk carousel', () => {
 const source=readFileSync(new URL('../src/pages/index.astro',import.meta.url),'utf8');
 assert.match(source,/const readingDesk=articles\.filter\([^\n]*section==='method'/);
});
