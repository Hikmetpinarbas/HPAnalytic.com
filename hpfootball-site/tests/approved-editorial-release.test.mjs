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
// The owner authorized a general design candidate after the two-article release.
// Keep that release's scope record immutable; test its deployment boundary, logo and palette.
test('design candidate preserves the approved brand and cannot auto-deploy to production',()=>{
 for(const [file,expected] of Object.entries(scope.unchangedShellFingerprints)) {
  if(file.includes('Logo.astro')) assert.equal(hash(file),expected,file);
 }
 const css=read('src/styles/global.css');
 for(const token of ['--bg: #08090B','--amber: #F2A33A','--context: #6E9BF0','--ink: #F2EEE6']) assert.ok(css.includes(token),token);
 const deploy=read('../.github/workflows/hpanalytic-production-deploy.yml');
 assert.match(deploy,/workflow_dispatch:/);
 assert.match(deploy,/inputs.confirm_production_deploy == true/);
 assert.doesNotMatch(deploy,/on:\s*\n\s*push:/);
 assert.equal(scope.siteRedesignShipped,false);
 assert.equal(scope.logoChanged,false);
});
test('unlicensed Vosse photographs are not shipped',()=>{
 assert.equal(scope.photosShipped,false);assert.equal(existsSync(new URL('../public/vosse',import.meta.url)),false);
 assert.doesNotMatch(read('src/pages/portraits/vosse-de-boode.astro'),/portrait[^"]*\.(?:jpg|webp)|ajax-\d+\.webp/);
});
test('only approved editorial pages become indexable and discoverable',()=>{
 for(const file of ['src/pages/mac/galatasaray-fenerbahce-2026-10-26-mac-sonu.astro','src/pages/portraits/vosse-de-boode.astro'])assert.doesNotMatch(read(file),/noindex=\{true\}/);
 const map=read('src/pages/sitemap-0.xml.ts');for(const route of scope.allowedPages)assert.ok(map.includes(route.replace(/\/$/,'')));
 const body=JSON.parse(read('src/components/vosse/article.json'));assert.equal(body.sources.length,14);assert.deepEqual(body.sources,JSON.parse(read('docs/editorial-p0-20261028/vosse-before.json')).sources);assert.ok(body.blocks.flatMap(b=>b.paragraphs).some(p=>p.includes('3 Nisan 2025')));assert.ok(read('src/pages/portraits/vosse-de-boode.astro').includes('13 Mayıs 2025'));
});
