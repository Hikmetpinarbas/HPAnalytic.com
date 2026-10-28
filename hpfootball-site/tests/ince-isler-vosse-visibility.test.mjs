import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Ince Isler has a public section, sitemap and header/mobile route',()=>{
 assert.match(read('src/pages/ince-isler.astro'),/İnce İşler/);
 assert.match(read('src/lib/site-menu.mjs'),/href: '\/ince-isler'/);
 assert.match(read('src/pages/sitemap-0.xml.ts'),/'\/ince-isler'/);
});
test('Vosse prominently appears on homepage and links back to series',()=>{
 assert.match(read('src/pages/index.astro'),/ince-isler-vosse-feature/);
 assert.match(read('src/pages/index.astro'),/\/portraits\/vosse-de-boode\//);
 assert.match(read('src/pages/portraits/vosse-de-boode.astro'),/href="\/ince-isler"/);
});
test('Vosse ending explains her contribution without replacing historical record',()=>{
 const j=JSON.parse(read('src/components/vosse/article.json'));
 const last=j.blocks.at(-1).paragraphs.join(' ');
 assert.match(last,/Vosse de Boode/);
 assert.match(last,/araştırmacı/);
 assert.match(last,/antrenör/);
 assert.match(last,/oyuncu/);
 assert.ok(last.length>700);
});
