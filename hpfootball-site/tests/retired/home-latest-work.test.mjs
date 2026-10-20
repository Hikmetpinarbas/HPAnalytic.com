import test from 'node:test'; import assert from 'node:assert/strict'; import {readFileSync} from 'node:fs';
const home=readFileSync(new URL('../src/pages/index.astro',import.meta.url),'utf8');
test('homepage promotes one real admitted story instead of rendering empty latest-work scaffolding',()=>{
  assert.match(home,/featuredStory/);
  assert.match(home,/YENİ · KANIT NESNESİ/);
  assert.match(home,/YAZIYI VE KANITI AÇ/);
  assert.doesNotMatch(home,/Yeni analizler yayınlandığında burada görünecek/);
  assert.doesNotMatch(home,/class="latest-work"/);
});
