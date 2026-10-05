import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { nextMobileMenuState } from '../src/lib/mobile-nav-state.mjs';

const layoutUrl = new URL('../src/layouts/BaseLayout.astro', import.meta.url);
const componentUrl = new URL('../src/components/MobileNavigation.astro', import.meta.url);
const cssUrl = new URL('../src/styles/global.css', import.meta.url);
const source = (url) => readFile(url, 'utf8');

test('desktop and mobile share one computed navigation truth', async () => {
  const layout = await source(layoutUrl);
  const component = await source(componentUrl);
  assert.equal((layout.match(/buildVisibleNavigation\(/g) || []).length, 1);
  assert.match(layout, /<MobileNavigation navigation=\{navigation\}/);
  assert.match(layout, /navigation\.map\(item=>/);
  assert.match(component, /navigation\.map/);
  assert.doesNotMatch(component, /href="\/(analysis|scouting|visual-lab|research|culture|about)"/);
});

test('mobile disclosure exposes accessible state and dynamic accessible name', async () => {
  const component = await source(componentUrl);
  assert.match(component, /aria-expanded="false"/);
  assert.match(component, /aria-controls="mobile-nav-panel"/);
  assert.match(component, /aria-label="Menüyü aç"/);
  assert.match(component, /trigger\.setAttribute\('aria-label', open \? 'Menüyü kapat' : 'Menüyü aç'\)/);
});

test('mobile state reducer closes on escape and navigation', () => {
  assert.equal(nextMobileMenuState(false, 'trigger'), true);
  assert.equal(nextMobileMenuState(true, 'trigger'), false);
  assert.equal(nextMobileMenuState(true, 'escape'), false);
  assert.equal(nextMobileMenuState(true, 'navigate'), false);
});

test('mobile interaction closes on nested link activation and restores focus after Escape', async () => {
  const component = await source(componentUrl);
  assert.match(component, /event\.target\.closest\('a'\)/);
  assert.match(component, /event\.key !== 'Escape'/);
  assert.match(component, /trigger\.focus\(\)/);
});

test('mobile presentation is operable at the breakpoint and respects reduced motion', async () => {
  const css = await source(cssUrl);
  assert.match(css, /\.mobile-nav-trigger\{[^}]*min-height:44px/);
  assert.match(css, /\.mobile-navigation\{display:none/);
  assert.match(css, /@media\(max-width:900px\)\{\.desktop-nav\{display:none\}\.mobile-navigation\{display:block\}/);
  assert.match(css, /\.mobile-nav-trigger:focus-visible,.mobile-nav-panel a:focus-visible\{outline:2px solid var\(--gold2\)/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
});
