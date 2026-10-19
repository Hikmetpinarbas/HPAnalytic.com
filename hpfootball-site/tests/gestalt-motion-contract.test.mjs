import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('navigational motion follows grouping continuity and reduced-motion contract', () => {
 const css=readFileSync('src/styles/stitch-editorial.css','utf8');
 for (const rule of ['.nav-link::after','.nav-link:hover::after','.mobile-nav-panel:not([hidden])','.mobile-nav-panel a','@starting-style','prefers-reduced-motion:reduce','--motion-short','--motion-medium']) {
   assert.ok(css.includes(rule), 'Missing '+rule);
 }
});
