import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const logo=readFileSync(new URL('../src/components/Logo.astro',import.meta.url),'utf8');
test('Renaissance sigil retains stable DOM contracts and geometry',()=>{
  assert.match(logo,/data-testid="brand-logo"/);
  assert.match(logo,/data-testid="brand-logo-sigil"/);
  assert.match(logo,/viewBox="0 0 100 100"/);
  assert.match(logo,/M 50 4 A 46 46/);
  assert.match(logo,/M 18 50 Q 50 18/);
  assert.match(logo,/aria-hidden="true"/);
});
test('wordmark is exact case-sensitive italic Analytic with accessible subtitle',()=>{
  assert.match(logo,/hp-wordmark__name/);
  assert.match(logo,/font-style:italic/);
  assert.match(logo,/>Analytic<\/span>/);
  assert.match(logo,/EVIDENCE LAB · SPATIOTEMPORAL INTELLIGENCE/);
  assert.doesNotMatch(logo,/text-transform\s*:/);
});
