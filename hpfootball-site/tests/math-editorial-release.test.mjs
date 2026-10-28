import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('mathematics essay is source backed, published and discoverable',()=>{
 const body=read('src/content/articles/matematik-yalan-soylemeyi-bilmez.md');
 assert.match(body,/editorial_status: PUBLISHED/);assert.match(body,/qualityStatus: HUMAN_APPROVED/);
 for(const name of ['John W. Tukey','George E. P. Box','Charles Goodhart','International abstract'])assert.ok(body.includes(name),name);
 assert.match(read('src/pages/sitemap-0.xml.ts'),/articles/);
 assert.match(read('public/robots.txt'),/Sitemap: https:\/\/www.hpanalytic.com\/sitemap-0.xml/);
});
test('covers and social metadata remain attached to published essays',()=>{
 const route=read('src/pages/articles/[...id].astro');
 assert.match(route,/featureImage/);assert.match(route,/image=\{socialImage\}/);
 assert.match(route,/article-feature-art/);
 for(const ext of ['svg','png'])assert.ok(existsSync(new URL('../public/editorial/metriklerin-dili/matematik-yalan-soylemeyi-bilmez.'+ext,import.meta.url)));
});
