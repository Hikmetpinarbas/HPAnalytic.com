import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root=resolve(import.meta.dirname,'..');
const page=readFileSync(resolve(root,'src/pages/mac/lille-galatasaray-2026-10-21.astro'),'utf8');
const charts=readFileSync(resolve(root,'public/js/hp-match-charts.js'),'utf8');

test('interactive map and scenarios remain first-class, not flattened images',()=>{
 for(const marker of ['id="hpa-evidence-atlas"','id="hpa-atlas-map"','function renderAtlas(','id="hpa-scenario-lab"','function renderScenario(','id="hpa-scenario-next"','id="hpa-zone-controls"','id="hpa-corridor-controls"','id="phase-controls"']){
   assert.ok(page.includes(marker),marker);
 }
 assert.match(page,/pointerenter/);
 assert.match(page,/touchstart/);
 assert.match(charts,/function network\(fig\)/);
});
test('contract does not replace interactive SVG with pre-rendered png',()=>{
 assert.doesNotMatch(page,/<img[^>]+hpa-atlas-map/);
 assert.doesNotMatch(page,/<img[^>]+hpa-scenario-svg/);
});
test('analytics contract and design tokens are separately versioned',()=>{
 const contract=readFileSync(resolve(root,'src/lib/hpa-analytics-contract.mjs'),'utf8');
 const tokens=readFileSync(resolve(root,'src/styles/hpa-chart-tokens.css'),'utf8');
 assert.match(contract,/export function validateAnalysisEnvelope/);
 assert.match(contract,/export function selectSpatialEvents/);
 assert.match(contract,/source_match_id/);
 assert.match(contract,/timestamp_precision/);
 assert.match(tokens,/--hpa-chart-ink/);
 assert.match(tokens,/--hpa-chart-focus/);
});
