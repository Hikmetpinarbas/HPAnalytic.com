// P0 Astro integration audit — reproductions against the built site.
// Requires `npm run build` first (reads dist/client). Each test asserts the
// CORRECT contract, so it FAILS while the defect exists.
// Run from hpfootball-site/:  node --test docs/audits/p0-repro/p0-build.repro.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const dist = new URL('../../../dist/client/', import.meta.url);
const html = (route) => readFileSync(new URL(route.replace(/^\//, '') + 'index.html', dist), 'utf8');
const built = existsSync(new URL('index.html', dist));
const opts = { skip: built ? false : 'run `npm run build` first' };

test('F06 a public surface with no admitted content is noindex (EMPTY SURFACE = HIDDEN SURFACE)', opts, () => {
  for (const route of ['/analysis/', '/culture/', '/visual-lab/']) {
    const page = html(route);
    const hasArticle = /href="\/articles\/[a-z0-9-]+\/?"/.test(page.split('<main')[1] ?? '');
    const noindex = /<meta name="robots" content="noindex/.test(page);
    assert.ok(hasArticle || noindex, `${route} is indexable but lists no admitted article`);
  }
});

test('F07 desktop and mobile primary navigation expose the same destinations', opts, () => {
  const page = html('/');
  const hrefs = (block) => [...(block ?? '').matchAll(/href="([^"]+)"/g)].map((m) => m[1]).sort();
  const desktop = hrefs(page.match(/<nav class="desktop-nav"[\s\S]*?<\/nav>/)?.[0]);
  const mobile = hrefs(page.match(/<nav id="mobile-nav-panel"[\s\S]*?<\/nav>/)?.[0]);
  assert.deepEqual(desktop, mobile);
});

test('F09 internal links point at canonical URLs (no 307 hop per click)', opts, () => {
  const page = html('/');
  const internal = [...page.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1])
    .filter((h) => !/\.[a-z0-9]+$/i.test(h) && h !== '/' && h !== '/search');
  const nonCanonical = [...new Set(internal.filter((h) => !h.endsWith('/')))];
  assert.deepEqual(nonCanonical, [], 'prerendered routes are canonical with a trailing slash');
});

test('F10 the 404 page does not declare a canonical URL', opts, () => {
  const page = readFileSync(new URL('404.html', dist), 'utf8');
  assert.doesNotMatch(page, /rel="canonical"/);
});

test('F11 every article image reserves its box (width/height) to avoid layout shift', opts, () => {
  const dir = new URL('articles/', dist);
  for (const id of readdirSync(dir).filter((d) => !d.endsWith('.html'))) {
    const page = readFileSync(new URL(`${id}/index.html`, dir), 'utf8');
    for (const img of page.match(/<img\b[^>]*>/g) ?? []) {
      assert.match(img, /\bwidth="\d+"[^>]*\bheight="\d+"|\bheight="\d+"[^>]*\bwidth="\d+"/, `${id}: ${img.slice(0, 90)}`);
    }
  }
});
