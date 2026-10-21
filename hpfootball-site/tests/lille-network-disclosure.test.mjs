import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const script=readFileSync(new URL('../public/js/hp-match-charts.js',import.meta.url),'utf8');
const page=readFileSync(new URL('../src/pages/mac/lille-galatasaray-2026-10-21.astro',import.meta.url),'utf8');
test('network keeps unverified links hidden until user elects to inspect estimated topology',()=>{
 assert.match(script,/var showEstimated = false/);
 assert.match(script,/hpc-network-toggle/);
 assert.match(script,/aria-pressed/);
 assert.match(script,/showEstimated &&/);
 assert.match(script,/Tahmini bağlantıları göster/);
 assert.match(script,/Tahmini bağlantıları gizle/);
});
test('network has no claim of verified receivers',()=>{
 assert.match(page,/doğrulanmış pas alıcısı bulunmadığı/);
 assert.doesNotMatch(page,/204 isabetli pasının 156/);
});
