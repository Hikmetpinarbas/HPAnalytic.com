import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const hash=p=>createHash('sha256').update(readFileSync(new URL('../'+p,import.meta.url))).digest('hex');
const scope=JSON.parse(read('docs/release-two-articles-20261028/release-scope.json'));
test('approved release preserves the deployed source dataset',()=>{
 const parse=s=>{const m=s.match(/window\.__DATA__\s*=\s*(\{[\s\S]*?\})\s*;?\s*(?:<\/script>|$)/);assert.ok(m);return JSON.parse(m[1]);};
 assert.deepEqual(parse(read('src/components/preserved-derby/source-data.js.txt')),parse(read('docs/release-two-articles-20261028/legacy-public-derby.html')));
 assert.equal(hash('src/components/preserved-derby/source-data.js.txt'),scope.dataSha256);
});
test('KDE and pitch calculations remain byte-identical',()=>{
 const old=read('docs/release-two-articles-20261028/legacy-public-derby.html'),now=read('src/components/preserved-derby/chart-runtime.js.txt');
 const cut=(s,a,b)=>{const i=s.indexOf(a);assert.ok(i>=0);const j=s.indexOf(b,i+a.length);assert.ok(j>i);return s.slice(i,j);};
 for(const [a,b]of [['function kdeField(','function kdeRender('],['function kdeRender(','function kdeLoop('],['function pitch(','/* ===== cover:']])assert.equal(cut(now,a,b),cut(old,a,b));
});
test('existing site shell, colors and active brand remain untouched',()=>{for(const [file,expected]of Object.entries(scope.unchangedShellFingerprints)){if(file==='src/layouts/BaseLayout.astro'){const baseline=read(file).replace(/\n\{systemFonts && <style is:inline>body\{[^}]+\}<\/style>\}/,'').replace('  systemFonts?: boolean;\n','').replace('  systemFonts = false,\n','').replace('{!systemFonts && <>\n','').replace('\n</>}\n<meta name="application-name"','\n<meta name="application-name"');assert.equal(createHash('sha256').update(baseline).digest('hex'),expected,file+' (only optional font loading may differ)');assert.ok(read(file).includes('systemFonts = false'));}else assert.equal(hash(file),expected,file);};assert.equal(scope.siteRedesignShipped,false);assert.equal(scope.logoChanged,false);});
test('only the publisher-selected Vosse photo files are shipped with attribution',()=>{
 assert.equal(scope.photosShipped,true);
 assert.equal(existsSync(new URL('../public/vosse',import.meta.url)),false);
 const page=read('src/pages/portraits/vosse-de-boode.astro');
 for(const path of scope.vosseApprovedPhotoPaths){assert.ok(existsSync(new URL('../public'+path,import.meta.url)),path);assert.ok(page.includes(path),path);}
 assert.match(page,/Lars van den Brink/);
 assert.match(page,/Training Ground Guru/);
 assert.doesNotMatch(page,/ajax-\d+\.webp/);
});
test('only approved editorial pages become indexable and discoverable',()=>{
 for(const file of ['src/pages/mac/galatasaray-fenerbahce-2026-10-26-mac-sonu.astro','src/pages/portraits/vosse-de-boode.astro'])assert.doesNotMatch(read(file),/noindex=\{true\}/);
 const map=read('src/pages/sitemap-0.xml.ts');for(const route of scope.allowedPages)assert.ok(map.includes(route.replace(/\/$/,'')));
 const body=JSON.parse(read('src/components/vosse/article.json'));assert.equal(body.sources.length,14);assert.deepEqual(body.sources,JSON.parse(read('docs/editorial-p0-20261028/vosse-before.json')).sources);assert.ok(body.blocks.flatMap(b=>b.paragraphs).some(p=>p.includes('3 Nisan 2025')));assert.ok(read('src/pages/portraits/vosse-de-boode.astro').includes('13 Mayıs 2025'));
});
