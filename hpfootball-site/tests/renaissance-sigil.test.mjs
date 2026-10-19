import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const logo=readFileSync(new URL('../src/components/Logo.astro',import.meta.url),'utf8');
test('HPA sigil retains stable DOM contracts and monogram geometry',()=>{
  assert.match(logo,/data-testid="brand-logo"/);
  assert.match(logo,/data-testid="brand-logo-sigil"/);
  assert.match(logo,/viewBox="0 0 100 100"/);
  assert.match(logo,/M 52 26 C 72 26/);
  assert.match(logo,/x1="52" y1="50" x2="76" y2="74"/);
  assert.match(logo,/aria-hidden="true"/);
});
test('wordmark is exact case-sensitive italic Analytic with accessible subtitle',()=>{
  assert.match(logo,/hp-wordmark__name/);
  assert.match(logo,/font-style:italic/);
  assert.match(logo,/>Analytic<\/span>/);
  assert.match(logo,/HIKMET PINARBAŞ FOOTBALL LAB/);
  assert.doesNotMatch(logo,/text-transform\s*:/);
});
