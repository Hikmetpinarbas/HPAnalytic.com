import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {displaySeries,seriesDescription} from '../src/lib/editorial-series.mjs';

test('article schema supports series visual evidence and data insight surfaces', async()=>{
  const config=await readFile(new URL('../src/content.config.ts',import.meta.url),'utf8');
  for(const field of ['series','visualAssets','dataInsights','claim_supported','rights_status','question','interpretation','limit']){
    assert.match(config,new RegExp(field));
  }
});

test('analysis series use Turkish public labels and intent descriptions',()=>{
  assert.equal(displaySeries('METRIC_EXPLAINER'),'Metrik ne anlatır?');
  assert.match(seriesDescription('MECHANISM_EXPLAINER'),/mekanizma/i);
  assert.equal(displaySeries('MATCH_ANALYSIS'),'Maç analizi');
});

test('article route renders governed visual evidence and data insight when present',async()=>{
  const route=await readFile(new URL('../src/pages/articles/[...id].astro',import.meta.url),'utf8');
  for(const token of ['visualAssets','dataInsights','GÖRSEL KANIT','VERİ NOTU','claim_supported','interpretation','limit']){
    assert.match(route,new RegExp(token));
  }
  assert.match(route,/rights_status/);
  assert.match(route,/Yayın hakkı|Hak durumu/);
});

test('analysis page exposes content series rather than one flat chronological list',async()=>{
  const page=await readFile(new URL('../src/pages/analysis.astro',import.meta.url),'utf8');
  assert.match(page,/editorialSeries/);
  assert.match(page,/series-index/);
});
