import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const qa=await readFile(new URL('../scripts/release-browser-qa.mjs',import.meta.url),'utf8').catch(()=> '');
test('release browser QA covers mobile desktop 200% text keyboard and reduced motion',()=>{
  assert.match(qa,/width:\s*375/);
  assert.match(qa,/width:\s*1440/);
  assert.match(qa,/fontSize\s*=\s*'200%'/);
  assert.match(qa,/keyboard\.press\('Tab'\)/);
  assert.match(qa,/reducedMotion:\s*'reduce'/);
  assert.match(qa,/scrollWidth/);
});
