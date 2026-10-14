import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const component = await readFile(new URL('../src/components/TacticalCanvas.astro', import.meta.url), 'utf8');
const css = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');

test('HPAnalytic Pitch exposes the three-part visual grammar', () => {
  assert.match(component, /YAPI/);
  assert.match(component, /İLİŞKİ/);
  assert.match(component, /MEKANİZMA\?/);
  assert.match(component, /hp-pitch/);
});

test('schematic pitch is explicitly bounded from tracking evidence', () => {
  assert.match(component, /ŞEMATİK/);
  assert.match(component, /tracking verisi değildir/i);
});

test('pitch has accessible meaning instead of being hidden decoration', () => {
  assert.match(component, /role=["']img["']/);
  assert.match(component, /<title\b/);
  assert.match(component, /<desc\b/);
});

test('pitch remains static and reduced-motion safe', () => {
  assert.doesNotMatch(component, /client:/);
  assert.match(css, /\.hp-pitch/);
  assert.match(css, /prefers-reduced-motion/);
});
