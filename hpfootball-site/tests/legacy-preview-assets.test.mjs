import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const manifest=JSON.parse(read('docs/editorial-experience-20261028/legacy-preview-assets.json'));
const html=read('public/mac/galatasaray-fenerbahce-2026-10-26/index.html').toString();
test('legacy preview font assets retain the exact original font bytes',()=>{
 assert.equal(manifest.fonts.length,12);
 for(const font of manifest.fonts){const bytes=read(font.file);assert.equal(bytes.length,font.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),font.sha256);}
});
test('extracting fonts and obsolete viewport metadata preserves all other legacy preview bytes',()=>{
 const reconstructed=html.replace(/\/fonts\/legacy-preview\/([a-f0-9]+)\.woff2/g,(_,name)=>'data:font/woff2;base64,'+read('public/fonts/legacy-preview/'+name+'.woff2').toString('base64'))
 .replace('<style>@font-face{font-family:', '<meta name="claude:viewport-fit-sides" content="cover"><style>@font-face{font-family:');
 const bytes=Buffer.from(reconstructed);
 assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'),'13ac56dba6e0d7b21418b8165018c0e7ab846594');
 assert.equal(Buffer.byteLength(html),manifest.afterHtmlBytes);
 assert.ok(manifest.beforeHtmlBytes-manifest.afterHtmlBytes>590000);
});
test('legacy preview no longer embeds agent metadata or font payloads in its HTML',()=>{
 assert.doesNotMatch(html,/<meta[^>]+name=["']claude:/i);
 assert.doesNotMatch(html,/data:font\/woff2;base64,/);
 assert.match(html,/font-display:swap/);
});
