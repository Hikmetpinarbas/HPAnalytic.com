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
