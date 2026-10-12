import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { canonicalPath, SERVER_RENDERED_PUBLIC_ROUTES } from '../src/lib/canonical-path.mjs';

const root = new URL('..', import.meta.url).pathname;
const read = (p) => readFileSync(join(root, p), 'utf8');

test('canonical paths: prerendered routes end in "/", server routes and root do not change', () => {
  assert.equal(canonicalPath('/'), '/');
  assert.equal(canonicalPath(''), '/');
  assert.equal(canonicalPath('/about'), '/about/');
  assert.equal(canonicalPath('/about/'), '/about/');
  assert.equal(canonicalPath('/articles/event-only-boundary'), '/articles/event-only-boundary/');
  assert.equal(canonicalPath('/search'), '/search');
  assert.equal(canonicalPath('/search/'), '/search');
});

test('server-rendered public routes list matches the pages that opt out of prerendering', () => {
  const pagesDir = join(root, 'src/pages');
  const serverRoutes = [];
  for (const file of readdirSync(pagesDir, { recursive: true })) {
    if (!String(file).endsWith('.astro')) continue;
    const route = '/' + relative(pagesDir, join(pagesDir, String(file))).replace(/\.astro$/, '').replace(/(^|\/)index$/, '');
    if (/^\/(api|control|studio)\b/.test(route)) continue; // private or non-page routes are not in the sitemap
    const source = readFileSync(join(pagesDir, String(file)), 'utf8');
    if (!/export const prerender\s*=\s*true/.test(source)) serverRoutes.push(route.replace(/\/$/, '') || '/');
  }
  assert.deepEqual(serverRoutes.sort(), [...SERVER_RENDERED_PUBLIC_ROUTES].sort());
});

test('Astro keeps the directory output format the trailing-slash rule depends on', () => {
  const config = read('astro.config.mjs');
  assert.doesNotMatch(config, /trailingSlash\s*:/);
  assert.doesNotMatch(config, /format\s*:\s*['"]file['"]/);
});

test('sitemap emits every URL through canonicalPath', () => {
  const sitemap = read('src/pages/sitemap-0.xml.ts');
  const urlBuilders = sitemap.match(/new URL\([^)]*\)/g) ?? [];
  const pageUrls = urlBuilders.filter((call) => !call.includes("'https://hpanalytic.com'"));
  assert.ok(pageUrls.length >= 2);
  for (const call of pageUrls) assert.match(call, /^new URL\(canonicalPath\(/, call);
});

// Build-output proof (runs whenever dist/ exists, e.g. after `npm run build`):
// each sitemap URL resolves to a file that is served without a redirect and
// equals the canonical URL printed by that page.
const sitemapFile = join(root, 'dist/client/sitemap-0.xml');
test('built sitemap URLs equal page canonicals and need no 307', { skip: !existsSync(sitemapFile) && 'dist/ not built' }, () => {
  const locs = [...readFileSync(sitemapFile, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]));
  assert.ok(locs.length > 0);
  for (const url of locs) {
    if (SERVER_RENDERED_PUBLIC_ROUTES.includes(url.pathname)) continue;
    assert.ok(url.pathname.endsWith('/'), `${url.href} would 307 to ${url.href}/`);
    const html = join(root, 'dist/client', url.pathname, 'index.html');
    assert.ok(existsSync(html), `${url.href} has no ${relative(root, html)}`);
    const canonical = readFileSync(html, 'utf8').match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert.equal(canonical, url.href, `sitemap ${url.href} != canonical ${canonical}`);
  }
});
