import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const page=readFileSync(new URL('../src/pages/visual-lab.astro',import.meta.url),'utf8');
test('visual lab retains existing tactical component',()=>assert.match(page,/<TacticalCanvas\s*\/>/));
test('visual lab leads with football analysis, not warning copy',()=>{assert.match(page,/Oyunu gör/);assert.doesNotMatch(page,/sahte kesinlik|Kanıt sınırı:|kullanılamaz/)});
test('visual lab routes readers to analysis',()=>assert.match(page,/href="\/analysis"/));
