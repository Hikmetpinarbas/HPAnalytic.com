import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
test('Astro src/pages owns the public root; no legacy root index shadows it',async()=>{
  await assert.rejects(()=>access(new URL('../index.html',import.meta.url)));
  const home=await readFile(new URL('../src/pages/index.astro',import.meta.url),'utf8');
  assert.match(home,/<EditorialFront \/>/);
  const front=await readFile(new URL('../src/components/EditorialFront.astro',import.meta.url),'utf8');
  assert.match(front,/id="front-title"/);
  assert.match(front,/HPANALYTIC|BAĞIMSIZ FUTBOL YAYINI/);
});
