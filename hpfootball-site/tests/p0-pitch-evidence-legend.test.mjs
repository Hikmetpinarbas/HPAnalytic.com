import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('hero pitch distinguishes schematic demonstration from actual observed football data',()=>{
const source=readFileSync(new URL('../src/components/TacticalCanvas.astro',import.meta.url),'utf8');
assert.match(source,/aria-label="Görsel kanıt statüsü"/);
assert.match(source,/Şematik çizim/);
assert.match(source,/Doğrulanmış maç olayı yok/);
assert.match(source,/Gerçek tracking verisi kullanılmadı/);
});
