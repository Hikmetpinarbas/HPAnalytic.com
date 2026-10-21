import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const src = readFileSync(new URL('../src/pages/mac/lille-galatasaray-2026-10-21.astro', import.meta.url),'utf8');
test('shot ranking names the 12-shot tie and Lille 10',()=>{
 assert.match(src,/Bodø\/Glimt/);
 assert.match(src,/Lille 10/);
 assert.doesNotMatch(src,/Turnuvanın en az şut atan iki takımı/);
});
test('estimated networks do not advertise unreconciled linked totals',()=>{
 assert.doesNotMatch(src,/204 isabetli pasının 156.sı/);
 assert.doesNotMatch(src,/329.unun 266.sı/);
 assert.match(src,/pas alıcısı/);
});

test('spatial panel uses schematic units, not physical metres',()=>{
 const panel=src.split('id="match-mechanism-title"')[1].split('</section>')[0];
 assert.doesNotMatch(panel,/35 metreden/);
 assert.match(panel,/35 birim/);
});

test('match own-half losses use original 27 total and distinguish 26 mapped events',()=>{
 assert.match(src,/Arsenal deplasmanında kendi yarısında 27 top kaybetti/);
 assert.match(src,/Haritada gösterilen 26 olay/);
 assert.doesNotMatch(src,/kendi yarısında 26 kez kaybetti/);
});
test('pitch narrative does not confuse schematic units with metres or establish causality from isolated events',()=>{
 assert.doesNotMatch(src,/35 metreden/);
 assert.doesNotMatch(src,/0–35 m/);
 assert.doesNotMatch(src,/normalize edildiği.*%100 uyumuyla doğrulandı/);
 assert.doesNotMatch(src,/neredeyse hiç baskı yapmadı/);
 assert.doesNotMatch(src,/ilk iki üç pasta gittiği/);
});

test('pitch phase selector uses original three event series with keyboard buttons',()=>{
 assert.match(src,/id="phase-controls"/);
 assert.match(src,/data-phase="0"/);
 assert.match(src,/data-phase="1"/);
 assert.match(src,/data-phase="2"/);
 assert.match(src,/id="phase-metrics"/);
 assert.match(src,/EV\.lil_loss\.filter/);
 assert.match(src,/EV\.ars_rec\.filter/);
 assert.match(src,/EV\.gal_rec\.filter/);
 assert.match(src,/aria-live="polite"/);
});

test('press comparison bars reverse PPDA so longer indicates stronger pressure',()=>{
 assert.match(src,/const scale=v=>r\.k==='ppda'/);
 assert.match(src,/width:\$\{scale\(r\.v\)/);
 assert.match(src,/left:\$\{scale\(med\)/);
});

test('period selection never leaves whole-match readout attached to filtered pitch',()=>{
 assert.match(src,/let activeLayer='all'/);
 assert.match(src,/activePhase=0/);
 assert.match(src,/function updatePitchReadout\(/);
 assert.match(src,/setPhase\(Number\(btn\.dataset\.phase\)\)/);
 assert.match(src,/read\.textContent=/);
});

test('unreconciled linked totals are not embedded as factual metadata',()=>{
 const data=src.match(/<script type="application\/json" id="hpc-data" is:inline>([\s\S]*?)<\/script>/);
 assert.ok(data);
 const chart=JSON.parse(data[1]);
 assert.equal(chart.net.gs.linked,null);
 assert.equal(chart.net.lil.linked,null);
 assert.equal(chart.net.gs.passes,204);
 assert.equal(chart.net.lil.passes,329);
});

test('scenario lab offers three distinct match hypotheses and falsification cues',()=>{
 assert.match(src,/id="hpa-scenario-lab"/);
 for(const id of ['press','trap','release']) assert.match(src,new RegExp('data-scenario="'+id+'"'));
 assert.match(src,/id="hpa-scenario-svg"/);
 assert.match(src,/id="hpa-scenario-reading"/);
 assert.match(src,/function renderScenario\(/);
 assert.match(src,/aria-live="polite"/);
});
test('editorial spatial prose stays grammatically correct and in schematic units',()=>{
 assert.doesNotMatch(src,/içindedı/);
 assert.doesNotMatch(src,/35 m sınırı/);
});

test('scenario carousel has navigation, touch and keyboard-accessible hotspot affordances',()=>{
 assert.match(src,/id="hpa-scenario-prev"/);
 assert.match(src,/id="hpa-scenario-next"/);
 assert.match(src,/id="hpa-scenario-counter"/);
 assert.match(src,/id="hpa-scenario-tooltip"/);
 assert.match(src,/function nextScenario\(/);
 assert.match(src,/pointerenter/);
 assert.match(src,/touchstart/);
 assert.match(src,/prefers-reduced-motion:reduce/);
});

test('five tactical corridors run parallel to touchlines along full pitch length',()=>{
 assert.match(src,/id="hpa-corridor-controls"/);
 assert.match(src,/data-corridor="all"/);
 assert.match(src,/data-corridor="4"/);
 assert.match(src,/const corridorBounds=\[0,13\.6,27\.2,40\.8,54\.4,68\]/);
 assert.match(src,/width:105,height:y1-y0/);
 assert.match(src,/x1:0,x2:105/);
 assert.match(src,/function setCorridor\(/);
});

test('three pitch length zones and five corridors intersect independently',()=>{
 assert.match(src,/id="hpa-zone-controls"/);
 assert.match(src,/data-zone="all"/);
 assert.match(src,/data-zone="2"/);
 assert.match(src,/const zoneBounds=\[0,35,70,105\]/);
 assert.match(src,/let selectedZone='all'/);
 assert.match(src,/function setZone\(/);
 assert.match(src,/selectedZone!=='all'&&\(cx</);
 assert.match(src,/id="hpa-spatial-readout"/);
});

test('multidimensional evidence atlas separates three zones from five corridors and event halves',()=>{
 assert.match(src,/id="hpa-evidence-atlas"/);
 assert.match(src,/id="hpa-atlas-map"/);
 assert.match(src,/data-atlas-zone="2"/);
 assert.match(src,/data-atlas-corridor="4"/);
 assert.match(src,/data-atlas-phase="2"/);
 assert.match(src,/data-atlas-event="gal"/);
 assert.match(src,/const atlasZoneBounds=\[0,35,70,105\]/);
 assert.match(src,/const atlasCorridorBounds=\[0,13\.6,27\.2,40\.8,54\.4,68\]/);
 assert.match(src,/function renderAtlas\(/);
 assert.match(src,/id="hpa-atlas-count"/);
 assert.match(src,/olay dosyalarında dakika damgası olmadığından/);
});
