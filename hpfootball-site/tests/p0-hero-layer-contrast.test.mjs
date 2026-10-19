import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('hero schematic legend and labels retain readable foreground and safe frame bounds',()=>{
 const css=readFileSync(new URL('../src/styles/stitch-editorial.css',import.meta.url),'utf8');
 assert.match(css,/\.hero-field\s*\{[^}]*overflow:hidden/);
 assert.match(css,/\.hero-field \.field-caption\s*\{[^}]*bottom:12px/);
 assert.match(css,/\.hero-field \.hp-pitch__caption b\s*\{[^}]*color:var\(--hpa-ink\)/);
 assert.match(css,/\.hero-field \.hp-pitch__caption small\s*\{[^}]*color:#4A534D/);
});
