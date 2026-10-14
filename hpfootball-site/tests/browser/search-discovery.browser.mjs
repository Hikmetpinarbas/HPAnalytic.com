// SSR search & intent-discovery browser QA. Needs a running build (astro preview).
// Usage: HP_QA_BASE_URL=http://127.0.0.1:4321 node tests/browser/search-discovery.browser.mjs [outDir]
// Content-dependent: assumes the current public corpus (one admitted article, event-only-boundary).
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const base = process.env.HP_QA_BASE_URL || 'http://127.0.0.1:4321', out = process.argv[2] || 'qa-artifacts/search'; await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const log = (ok, name, info = '') => console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`);
let failures = 0;
async function check(name, fn) { try { const info = await fn(); log(true, name, info); } catch (e) { failures++; log(false, name, e.message.replace(/\s+/g,' ').slice(0,300)); } }
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
const errors = []; page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('dialog', d => { errors.push('DIALOG ' + d.message()); d.dismiss(); });
const go = async (q) => { const r = await page.goto(base + q, { waitUntil: 'networkidle' }); return r.status(); };
const cards = () => page.locator('.card-grid > li').count();
const status = () => page.locator('.search-status').textContent().catch(() => null);
const cardIds = () => page.locator('.card-grid .card-title a').evaluateAll(as => as.map(a => a.getAttribute('href')));

await check('empty /search shows only intents that have public articles', async () => {
  assert.equal(await go('/search'), 200);
  const labels = await page.locator('.hp-intent li small').allTextContents();
  assert.deepEqual(labels, ['MAÇ', 'ARAŞTIRMA']);
  assert.equal(await cards(), 0); assert.equal(await status(), null);
  return labels.join(', ');
});
await check('whitespace-only query: no results, no status, discovery shown', async () => {
  await go('/search?q=%20%20%0A'); assert.equal(await cards(), 0);
  assert.equal(await page.locator('.hp-intent').count(), 1); return 'ok';
});
await check('one-letter query asks for a longer term', async () => {
  await go('/search?q=a'); assert.equal(await status(), 'En az iki harfli bir terim girin.'); return 'ok';
});
await check('ASCII query finds Turkish text', async () => {
  await go('/search?q=gorur'); assert.deepEqual(await cardIds(), ['/articles/event-only-boundary']); return await status();
});
await check('Turkish upper-case dotted İ query folds', async () => {
  await go('/search?q=' + encodeURIComponent('İZLEME VERİSİ')); assert.deepEqual(await cardIds(), ['/articles/event-only-boundary']); return await status();
});
for (const w of ['Production', 'fonksiyonu', 'rest-defence', 'ilerleme', 'Skorun']) {
  await check(`unpublished article not found: "${w}"`, async () => { await go('/search?q=' + encodeURIComponent(w)); assert.equal(await cards(), 0); return await status(); });
}
await check('intent=arastirma browses its public articles', async () => {
  await go('/search?intent=arastirma'); assert.deepEqual(await cardIds(), ['/articles/event-only-boundary']);
  assert.equal(await page.locator('.hp-intent-filter a[aria-current="page"]').textContent(), 'ARAŞTIRMA'); return await status();
});
await check('intent without public articles (oyuncu) is ignored, not echoed', async () => {
  await go('/search?intent=oyuncu'); assert.equal(await cards(), 0); assert.equal(await page.locator('.hp-intent').count(), 1);
  assert.doesNotMatch(await page.content(), /value="oyuncu"/); return 'discovery shown';
});
await check('unknown/hostile intent is ignored', async () => {
  await go('/search?intent=%3Cscript%3Ealert(1)%3C%2Fscript%3E'); assert.doesNotMatch(await page.content(), /<script>alert\(1\)/); return 'ok';
});
await check('query + intent keeps intent through the form', async () => {
  await go('/search?intent=arastirma'); await page.fill('#q', 'veri'); await page.press('#q', 'Enter'); await page.waitForLoadState('networkidle');
  const u = new URL(page.url()); assert.equal(u.searchParams.get('intent'), 'arastirma'); assert.equal(u.searchParams.get('q'), 'veri');
  return u.search;
});
await check('XSS payload in q is escaped as text', async () => {
  await go('/search?q=' + encodeURIComponent('"><img src=x onerror=alert(1)><script>alert(2)</script>'));
  assert.equal(await page.locator('img[src="x"]').count(), 0);
  assert.equal(await page.locator('#q').inputValue(), '"><img src=x onerror=alert(1)><script>alert(2)</script>');
  const hrefs = await page.locator('.hp-intent-filter a').evaluateAll(as => as.map(a => a.getAttribute('href')));
  for (const h of hrefs) assert.match(h, /^\/search(\?[^"<>\s]*)?$/);
  return `${hrefs.length} filter links safe`;
});
await check('CRLF / control chars are stripped from q', async () => {
  await go('/search?q=veri%0D%0ASet-Cookie%3A%20x'); assert.equal(await page.locator('#q').inputValue(), 'veri Set-Cookie: x'); return 'ok';
});
await check('overlong q is bounded to 120 chars', async () => {
  await go('/search?q=' + 'ş'.repeat(400)); assert.equal((await page.locator('#q').inputValue()).length, 120); return 'ok';
});
await check('hostile page numbers clamp without errors', async () => {
  for (const p of ['999', '-1', 'abc', '1e9']) { assert.equal(await go(`/search?q=veri&page=${p}`), 200); assert.ok(await cards() <= 20); }
  return 'ok';
});
await check('search pages are noindex', async () => {
  await go('/search?q=veri'); assert.equal(await page.locator('meta[name="robots"][content="noindex"]').count(), 1);
  await go('/search?intent=mac'); assert.equal(await page.locator('meta[name="robots"][content="noindex"]').count(), 1);
  return 'ok';
});
await check('keyboard: Tab reaches every intent link with a visible outline', async () => {
  await go('/search'); const n = await page.locator('.hp-intent a').count(); let seen = 0;
  for (let i = 0; i < 40 && seen < n; i++) {
    await page.keyboard.press('Tab');
    const f = await page.evaluate(() => { const el = document.activeElement; const s = getComputedStyle(el); return { intent: !!el.closest('.hp-intent'), outline: s.outlineStyle, w: s.outlineWidth }; });
    if (f.intent) { seen++; assert.notEqual(f.outline, 'none'); }
  }
  assert.equal(seen, n); const target = await page.evaluate(() => document.activeElement.getAttribute('href'));
  await Promise.all([page.waitForURL(u => u.search.includes('intent=')), page.keyboard.press('Enter')]);
  assert.equal(new URL(page.url()).pathname + new URL(page.url()).search, target); return `${n} links, Enter → ${target}`;
});
for (const w of [320, 375, 430, 1440]) {
  for (const [name, q] of [['discovery', '/search'], ['intent', '/search?intent=arastirma'], ['query', '/search?q=veri&intent=arastirma']]) {
    await check(`layout ${name} @${w}: no overflow, targets ≥44px`, async () => {
      await page.setViewportSize({ width: w, height: w > 1000 ? 1000 : 812 }); await go(q);
      const m = await page.evaluate(() => ({ over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        small: [...document.querySelectorAll('.hp-intent a,.hp-intent-filter a,.search-pagination a')].filter(a => a.getBoundingClientRect().height < 44).length }));
      assert.equal(m.over, 0); assert.equal(m.small, 0);
      await page.screenshot({ path: `${out}/${name}-${w}.png`, fullPage: true }); return 'ok';
    });
  }
}
await check('200% text @375: no overflow on discovery and filtered results', async () => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const q of ['/search', '/search?q=veri&intent=arastirma']) {
    await go(q); await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0);
  }
  await page.screenshot({ path: `${out}/text200-375.png`, fullPage: true }); return 'ok';
});
await check('no console errors or dialogs across the run', async () => { assert.deepEqual(errors, []); return 'ok'; });
await browser.close();
console.log(failures ? `SEARCH_QA_FAIL (${failures})` : 'SEARCH_QA_PASS');
process.exit(failures ? 1 : 0);
