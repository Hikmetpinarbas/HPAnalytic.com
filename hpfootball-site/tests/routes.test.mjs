import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
const pagesDir=new URL('../src/pages/',import.meta.url);
const read=(name)=>readFile(new URL(name,pagesDir),'utf8');
test('article prerenders',async()=>{const src=await read('articles/[...id].astro');assert.match(src,/getStaticPaths/);assert.match(src,/export const prerender = true;/)});
test('public content routes prerender',async()=>{const pages=(await readdir(pagesDir)).filter(x=>x.endsWith('.astro'));for(const name of pages){const src=await read(name);if(name==='search.astro')assert.match(src,/export const prerender = false;/);else assert.match(src,/export const prerender = true;/,name)}});
test('search works as GET without JS',async()=>{const src=await read('search.astro');assert.match(src,/<form[^>]*action="\/search"[^>]*method="get"[^>]*role="search"/);assert.match(src,/<label class="visually-hidden" for="q">/);assert.match(src,/<input id="q" name="q" type="search"/)});
test('article declares structured data without unwanted claim box',async()=>{const src=await read('articles/[...id].astro');assert.match(src,/application\/ld\+json/);assert.doesNotMatch(src,/class="claim-boundary"/)});
