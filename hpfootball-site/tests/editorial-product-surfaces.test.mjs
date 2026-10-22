import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {displaySeries,seriesDescription} from '../src/lib/editorial-series.mjs';

test('content schema retains governed visual evidence and data fields',async()=>{
 const config=await readFile(new URL('../src/content.config.ts',import.meta.url),'utf8');
 for(const field of ['series','visualAssets','dataInsights','claim_supported','rights_status','question','interpretation','limit'])
  assert.match(config,new RegExp(field));
});
test('analysis series use Turkish labels',()=>{
 assert.equal(displaySeries('METRIC_EXPLAINER'),'Metrik ne anlatır?');
 assert.match(seriesDescription('MECHANISM_EXPLAINER'),/mekanizma/i);
 assert.equal(displaySeries('MATCH_ANALYSIS'),'Maç analizi');
});
test('reader-first surface supports licensed visuals without extra data note cards',async()=>{
 const route=await readFile(new URL('../src/pages/articles/[...id].astro',import.meta.url),'utf8');
 assert.match(route,/visualAssets/);
 assert.match(route,/rights_status/);
 assert.match(route,/GÖRSEL KANIT/);
 assert.doesNotMatch(route,/VERİ NOTU|article-data-notes/);
});
test('analysis page exposes series taxonomy',async()=>{
 const page=await readFile(new URL('../src/pages/analysis.astro',import.meta.url),'utf8');
 assert.match(page,/editorialSeries/);
 assert.match(page,/series-index/);
});
