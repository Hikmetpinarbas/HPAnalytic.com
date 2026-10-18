import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const cssUrl = new URL('../src/styles/global.css', import.meta.url);
const pageUrl = new URL('../src/pages/articles/[...id].astro', import.meta.url);
const source = (url) => readFile(url, 'utf8');
const squash = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
// Innermost `selector { declarations }` pairs; media wrappers are skipped because their body contains braces.
const rules = (css) => [...squash(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({ selector: selector.trim(), body }));
const rulesFor = (css, selector) => rules(css).filter((rule) => rule.selector === selector);
const declares = (css, selector, pattern) => rulesFor(css, selector).some((rule) => pattern.test(rule.body));

test('article page renders standfirst and body inside the single article grid', async () => {
  const page = await source(pageUrl);
  assert.match(page, /<article class="article-page">/);
  assert.match(page, /<header class="article-head">[\s\S]*<p class="standfirst">\{a\.data\.description\}<\/p>/);
  assert.match(page, /<div class="prose" id="article-body"><Content\/><\/div>/);
  assert.match(page, /<\/article><\/BaseLayout>/);
});

test('article grid track is explicitly bounded so wide children cannot widen the reading axis', async () => {
  const css = await source(cssUrl);
  assert.ok(declares(css, '.article-page', /display: grid/), 'article page stays a grid');
  assert.ok(declares(css, '.article-page', /grid-template-columns: minmax\(0, 1fr\)/), 'single minmax(0,1fr) track replaces the implicit auto column');
  assert.ok(declares(css, '.article-page', /min-width: 0/));
  assert.ok(declares(css, ':where(.article-page) > *', /min-width: 0/), 'grid children may shrink below min-content');
  assert.ok(declares(css, ':where(.article-page) > *', /max-width: 100%/), 'grid children never exceed the track');
});

test('standfirst and body wrap long tokens within 320/375/390/430 viewports', async () => {
  const css = await source(cssUrl);
  assert.ok(declares(css, '.standfirst', /max-width: min\(46ch, 100%\)/));
  assert.ok(declares(css, '.standfirst', /overflow-wrap: anywhere/));
  assert.ok(declares(css, '.prose', /width: min\(var\(--measure\), 100%\)/));
  assert.ok(declares(css, '.prose', /overflow-wrap: anywhere/));
  assert.ok(declares(css, '.prose > *', /max-width: 100%/));
});

test('figures and embedded media are bounded to the article track', async () => {
  const css = await source(cssUrl);
  const media = ':is(figure, img, svg, video, picture, canvas, iframe)';
  assert.ok(declares(css, `.article-page ${media}`, /max-width: 100%/));
  assert.ok(declares(css, '.article-page :is(img, video)', /height: auto/));
  assert.ok(declares(css, '.prose figure', /margin-inline: 0/), 'default figure inline margins cannot push past the track');
});

test('clipping is not used to hide article or page overflow', async () => {
  const css = await source(cssUrl);
  const scoped = rules(css).filter(({ selector }) => /(^|[\s,>(])(html|body)\b|\.article-|\.prose|\.standfirst/.test(selector));
  for (const { selector, body } of scoped) {
    assert.doesNotMatch(body, /overflow(-x)?: (hidden|clip)/, `${selector} must not clip overflow`);
  }
});
