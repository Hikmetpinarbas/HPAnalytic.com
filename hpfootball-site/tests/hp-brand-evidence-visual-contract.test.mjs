import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('canonical HP monogram retains line-break geometry and editorial identity',()=>{
 const s=read('src/components/Logo.astro');
 assert.match(s,/viewBox="0 0 52 52"/);
 assert.match(s,/class="hp-break" d="M13 38 42 14"/);
 assert.match(s,/EVIDENCE MADE VISIBLE/);
});
test('hero uses the existing tactical canvas and the canonical entry headline',()=>{
 const s=read('src/pages/index.astro');
 assert.match(s,/<TacticalCanvas\s*\/>/);
 assert.match(s,/OYUNU<br\s*\/>/);
 assert.match(s,/SONUÇTAN/);
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
