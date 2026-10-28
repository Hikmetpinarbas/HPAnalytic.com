import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {existsSync} from 'node:fs';
const file=p=>new URL('../'+p,import.meta.url);
const read=p=>requireRead(p);
import {readFileSync} from 'node:fs';
function requireRead(p){return readFileSync(file(p),'utf8')}
test('both articles use dedicated social cards with valid 1200x630 PNG',()=>{
 const d=read('src/pages/mac/galatasaray-fenerbahce-2026-10-26-mac-sonu.astro');
 const v=read('src/pages/portraits/vosse-de-boode.astro');
 assert.match(d,/image="\/editorial\/20261028\/derby-og\.png"/);
 assert.match(v,/image="\/editorial\/20261028\/vosse-og\.png"/);
 for(const name of ['derby','vosse']){
   const p=file('public/editorial/20261028/'+name+'-og.png'); assert.ok(existsSync(p));
   const b=readFileSync(p);assert.equal(b.readUInt32BE(16),1200);assert.equal(b.readUInt32BE(20),630);
 }
});
test('publication contract permits only documented phone photo set; shell guard stays',()=>{
 const scope=JSON.parse(read('docs/release-two-articles-20261028/release-scope.json'));
 assert.equal(scope.photosShipped,true);
 assert.deepEqual(scope.vosseApprovedPhotoPaths.sort(),['/editorial/20261028/vosse-person-portrait.webp','/editorial/20261028/vosse-phone/vosse-ajax-reference.jpg']);
});
