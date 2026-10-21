import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('../src/data/lille-premier-v2-observations.json',import.meta.url),'utf8'));
const page=readFileSync(new URL('../src/pages/lab/lille-galatasaray-premier-v2.astro',import.meta.url),'utf8');
test('four source-traced matches, no canonical claim',()=>{
 assert.equal(data.matches.length,4);
 assert.equal(data.status,'PROVISIONAL_CSV_ONLY');
 for(const m of data.matches){
  assert.match(m.source.drive_id,/^[A-Za-z0-9_-]+$/);
  assert.equal(m.pass_start_x_bins.reduce((s,b)=>s+b.count,0),m.counts['Passes accurate']);
  assert.equal(m.half_anchors_seconds.length,2);
  assert.ok(m.half_anchors_seconds.every(n=>Number.isFinite(n)));
 }
});
test('observed fixture row totals remain stable',()=>{
 assert.deepEqual(data.matches.map(m=>m.source.rows),[2957,3020,3113,3147]);
});
test('preview never claims tracking or fabricated receiver',()=>{
 assert.match(page,/CSV-only/);
 assert.match(page,/Veri sınırı/);
 assert.doesNotMatch(page,/kesin pres şiddeti|doğrulanmış pas alıcısı/);
});
test('preview mobile and accessible visual controls',()=>{
 assert.match(page,/aria-label="Takım ve maç karşılaştırma grafikleri"/);
 assert.match(page,/@media\s*\(max-width:\s*700px\)/);
 assert.match(page,/prefers-reduced-motion/);
});

test('all eight interactive sections and real event points are present',()=>{
 const points=JSON.parse(readFileSync(new URL('../src/data/lille-premier-v2-event-points.json',import.meta.url),'utf8'));
 const aggregate=JSON.parse(readFileSync(new URL('../src/data/lille-premier-v2-aggregates.json',import.meta.url),'utf8'));
 assert.equal(points.matches.length,2);
 assert.deepEqual(points.matches.map(m=>m.points.filter(p=>p.kind==='Lost balls'||p.kind==='Ball losses').length),[54,57]);
 assert.deepEqual(points.matches.map(m=>m.points.filter(p=>p.kind==='Ball recoveries').length),[36,30]);
 for(const m of points.matches){for(const p of m.points){assert.ok(p.x>=0&&p.x<=105&&p.y>=0&&p.y<=68);assert.ok(Number.isFinite(p.t));assert.ok(p.source_id)}}
 assert.equal(aggregate.teams.length,2);
 assert.equal(aggregate.fixtures.length,4);
 for(let i=1;i<=8;i++) assert.match(page,new RegExp('data-viz="'+i+'"'));
 assert.match(page,/data-team-filter/);
 assert.match(page,/noindex={true}/);
});
