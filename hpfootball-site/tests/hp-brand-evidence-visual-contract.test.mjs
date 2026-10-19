import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('editorial wordmark retains typography and publication identity',()=>{
 const s=read('src/components/Logo.astro');
 assert.match(s,/hp-wordmark__name/);
 assert.match(s,/Newsreader/);
 assert.match(s,/HIKMET PINARBAŞ FOOTBALL LAB/);
});
test('hero uses the independent P0 pitch figure and editorial headline',()=>{
 const s=read('src/pages/index.astro');
 assert.match(read('src/components/HeroCartography.astro'),/<HeroPitchFigure\s*\/>/);
 assert.match(read('src/components/HeroCartography.astro'),/Oyunu sonuçtan önce oku\./);
 assert.match(read('src/components/HeroPitchFigure.astro'),/@keyframes hp-p0-appear/);
});
test('tactical illustration remains accessible without repeated warning banner',()=>{
 const s=read('src/components/TacticalCanvas.astro');
 assert.match(s,/role="img" aria-labelledby=/);
 assert.doesNotMatch(s,/ŞEMATİK AÇIKLAMA · tracking/);
});
test('evidence flow foregrounds analysis and counterevidence',()=>{
 const s=read('src/pages/index.astro');
 assert.match(s,/KARŞI KANIT/);
 assert.match(s,/ANALİST YORUMU/);
});
