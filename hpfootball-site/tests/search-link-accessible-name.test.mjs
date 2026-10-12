import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildUtilityNavigation } from '../src/lib/site-surfaces.mjs';

const layoutUrl = new URL('../src/layouts/BaseLayout.astro', import.meta.url);
const cssUrl = new URL('../src/styles/global.css', import.meta.url);
const source = (url) => readFile(url, 'utf8');
const squash = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

const searchLinkMarkup = (layout) => {
  const match = layout.match(/<a class="icon-link"[^>]*>[\s\S]*?<\/a>/);
  assert.ok(match, 'header search link must exist');
  return match[0];
};

// WCAG 2.5.3 Label in Name: the accessible name must contain the visible label.
// An aria-label replaces the link's content as its name, so it must carry the
// visible text; without one, the name is the visible text itself.
const labelInName = ({ ariaLabel, visibleText }) => {
  const norm = (value) => value.toLocaleLowerCase('tr').replace(/\s+/g, ' ').trim();
  if (ariaLabel === undefined) return true;
  return norm(ariaLabel).includes(norm(visibleText));
};

const parseSearchLink = (markup) => ({
  ariaLabel: markup.match(/^<a[^>]*\saria-label="([^"]*)"/)?.[1],
  visibleText: markup.match(/<span class="icon-link-text">([^<]*)<\/span>/)?.[1],
});

test('label-in-name check rejects a name that drops the visible label', () => {
  assert.equal(labelInName({ ariaLabel: 'Ara', visibleText: 'SEARCH' }), false);
  assert.equal(labelInName({ ariaLabel: '', visibleText: 'SEARCH' }), false);
  assert.equal(labelInName({ ariaLabel: 'Search the archive', visibleText: 'SEARCH' }), true);
  assert.equal(labelInName({ ariaLabel: undefined, visibleText: 'SEARCH' }), true);
});

test('header search link name contains its visible label (WCAG 2.5.3)', async () => {
  const link = parseSearchLink(searchLinkMarkup(await source(layoutUrl)));
  assert.ok(link.visibleText, 'search link must carry visible text');
  assert.ok(labelInName(link), `accessible name ${JSON.stringify(link.ariaLabel)} must contain "${link.visibleText}"`);
});

test('header search visible label follows the utility navigation label', async () => {
  const link = parseSearchLink(searchLinkMarkup(await source(layoutUrl)));
  const search = buildUtilityNavigation({ articleCount: 1 }).find((item) => item.href === '/search');
  assert.equal(link.visibleText, search.label);
});

test('narrow viewports hide the search text visually but keep it as the accessible name', async () => {
  const css = squash(await source(cssUrl));
  const narrow = css.match(/@media \(max-width: 420px\) \{(.*?\}) \}/)?.[1] ?? '';
  const rule = narrow.match(/\.icon-link \.icon-link-text \{([^}]*)\}/)?.[1] ?? '';
  assert.ok(rule, 'narrow rule for the search text must exist');
  // display:none / visibility:hidden remove the text from the accessibility tree.
  assert.doesNotMatch(rule, /display: none|visibility: hidden/);
  assert.match(rule, /position: absolute/);
  assert.match(rule, /clip: rect\(0 0 0 0\)/);
  assert.doesNotMatch(css, /\.icon-link \.icon-link-text \{ display: none; \}/);
});

test('header search icon stays decorative so it never competes with the link name', async () => {
  const markup = searchLinkMarkup(await source(layoutUrl));
  assert.match(markup, /^<a class="icon-link"[^>]*>\s*<svg[^>]*aria-hidden="true"[^>]*focusable="false"/);
});
