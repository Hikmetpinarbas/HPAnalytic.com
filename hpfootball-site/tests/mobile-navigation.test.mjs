import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { nextMobileMenuState } from '../src/lib/mobile-nav-state.mjs';

const layoutUrl = new URL('../src/layouts/BaseLayout.astro', import.meta.url);
const componentUrl = new URL('../src/components/MobileNavigation.astro', import.meta.url);
const cssUrl = new URL('../src/styles/global.css', import.meta.url);
const source = (url) => readFile(url, 'utf8');
const squash = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('desktop and mobile share one computed navigation truth', async () => {
  const layout = await source(layoutUrl);
  const component = await source(componentUrl);
  assert.equal((layout.match(/buildVisibleNavigation\(/g) || []).length, 1);
  assert.match(layout, /<MobileNavigation navigation=\{/);
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
  assert.match(component, /aria-current=\{item\.current\}/);
});

test('mobile state reducer toggles and closes on every way of leaving the menu', () => {
  assert.equal(nextMobileMenuState(false, 'trigger'), true);
  assert.equal(nextMobileMenuState(true, 'trigger'), false);
  for (const event of ['escape', 'navigate', 'outside', 'focusout', 'desktop']) {
    assert.equal(nextMobileMenuState(true, event), false, event);
  }
  assert.equal(nextMobileMenuState(true, 'unknown'), true);
});

test('mobile interaction closes on link, outside pointer, focus leaving and desktop resize', async () => {
  const component = await source(componentUrl);
  assert.match(component, /event\.target\.closest\('a'\)/);
  assert.match(component, /event\.key !== 'Escape'/);
  assert.match(component, /trigger\.focus\(\)/);
  assert.match(component, /addEventListener\('pointerdown'/);
  assert.match(component, /addEventListener\('focusout'/);
  assert.match(component, /dispatch\('desktop'\)/);
});

test('navigation is progressively enhanced: usable without JavaScript', async () => {
  const layout = await source(layoutUrl);
  const css = squash(await source(cssUrl));
  assert.match(layout, /<html lang="tr" class="no-js">/);
  assert.match(layout, /classList\.replace\('no-js','js'\)/);
  // The panel swap only happens once JS has run; otherwise the inline nav stays visible.
  assert.match(css, /@media \(max-width: 900px\) \{ \.js \.desktop-nav \{ display: none; \} \.js \.mobile-navigation \{ display: block; \}/);
  assert.match(css, /\.mobile-navigation \{ display: none;/);
});

test('mobile presentation is operable and respects reduced motion', async () => {
  const css = squash(await source(cssUrl));
  assert.match(css, /--tap: 44px/);
  assert.match(css, /\.mobile-nav-trigger \{[^}]*min-height: var\(--tap\)/);
  assert.match(css, /\.mobile-nav-panel a \{[^}]*min-height: 48px/);
  assert.match(css, /:focus-visible \{ outline: 3px solid var\(--focus\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test('skip link targets the main landmark', async () => {
  const layout = await source(layoutUrl);
  assert.match(layout, /<a class="skip-link" href="#main-content">/);
  assert.match(layout, /<main id="main-content" tabindex="-1">/);
});
