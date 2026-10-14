// P0 visual QA (2026-10-15): article page and open mobile menu at 320/375/430/1440 and 200% text,
// against the production build served by `astro preview` (Cloudflare workerd), not the dev server.
// Writes JPEG screenshots + p0-visual-qa.json to p0-visual-qa/. Fails on any broken gate.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.HP_QA_BASE_URL || 'http://127.0.0.1:4321';
const out = 'p0-visual-qa';
const ARTICLE = '/articles/event-only-boundary/';
const PUBLISHED_FRAME = 'M7 7v38M7 26h17M24 7v38M32 7v38M32 7h7c8 0 8 15 0 15h-7';
const PUBLISHED_BREAK = 'M13 38 42 14';
const VIEWPORTS = [
  { name: '320', width: 320, height: 812 },
  { name: '375', width: 375, height: 812 },
  { name: '430', width: 430, height: 932 },
  { name: '1440', width: 1440, height: 1000 },
];
const report = { base, generatedAt: new Date().toISOString(), checks: [] };
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });

async function open(viewport, route, { text200 = false } = {}) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  const response = await page.goto(new URL(route, base).toString(), { waitUntil: 'networkidle' });
  assert.ok(response && response.status() === 200, `${route} returned HTTP ${response?.status()}`);
  if (text200) await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  return { context, page, consoleErrors };
}

async function common(page, consoleErrors, label) {
  const m = await page.evaluate(() => {
    const frame = document.querySelector('.site-header .hp-frame')?.getAttribute('d');
    const brk = document.querySelector('.site-header .hp-break')?.getAttribute('d');
    return { frame, brk, scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth };
  });
  assert.equal(m.frame, PUBLISHED_FRAME, `${label}: header logo frame is not the published HP mark`);
  assert.equal(m.brk, PUBLISHED_BREAK, `${label}: header logo break is not the published HP mark`);
  assert.ok(m.scroll <= m.client + 1, `${label}: horizontal overflow ${m.scroll} > ${m.client}`);
  assert.deepEqual(consoleErrors, [], `${label}: console errors ${consoleErrors.join(' | ')}`);
  return { overflow: m.scroll - m.client };
}

async function linkStatus(href) {
  const r = await fetch(new URL(href, base), { redirect: 'follow' });
  return r.status;
}

for (const vp of VIEWPORTS) {
  for (const text200 of [false, true]) {
    const tag = `${vp.name}${text200 ? '-text200' : ''}`;

    // 1) Article page
    {
      const { context, page, consoleErrors } = await open(vp, ARTICLE, { text200 });
      const c = await common(page, consoleErrors, `article ${tag}`);
      const a = await page.evaluate(() => {
        const h1 = document.querySelector('main h1');
        const prose = document.querySelector('.prose');
        const r = prose?.getBoundingClientRect();
        return { h1: h1?.textContent?.trim(), proseWidth: r ? Math.round(r.width) : 0, proseRight: r ? Math.round(r.right) : 0, vw: innerWidth };
      });
      assert.ok(a.h1 && a.h1.length > 5, `article ${tag}: missing h1`);
      assert.ok(a.proseWidth > 0 && a.proseRight <= a.vw + 1, `article ${tag}: body text box outside viewport`);
      await page.screenshot({ path: `${out}/article-${tag}-top.jpg`, type: 'jpeg', quality: 72 });
      await page.screenshot({ path: `${out}/article-${tag}-full.jpg`, type: 'jpeg', quality: 60, fullPage: true });
      report.checks.push({ route: ARTICLE, viewport: tag, ...c, ...a, result: 'PASS' });
      await context.close();
    }

    // 2) Menu: open mobile menu below 901px, desktop nav at 1440
    {
      const { context, page, consoleErrors } = await open(vp, '/', { text200 });
      const c = await common(page, consoleErrors, `menu ${tag}`);
      let links;
      if (vp.width < 901) {
        const trigger = page.locator('.site-header .mobile-nav-trigger');
        await trigger.click();
        assert.equal(await trigger.getAttribute('aria-expanded'), 'true', `menu ${tag}: trigger did not open`);
        const panel = page.locator('#mobile-nav-panel');
        assert.ok(await panel.isVisible(), `menu ${tag}: panel not visible after open`);
        links = await panel.locator('a').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { href: e.getAttribute('href'), label: e.textContent.trim(), height: Math.round(r.height), right: Math.round(r.right) }; }));
        for (const l of links) {
          assert.ok(l.height >= 24, `menu ${tag}: ${l.href} tap target ${l.height}px < 24px (WCAG 2.5.8)`);
          assert.ok(l.right <= vp.width + 1, `menu ${tag}: ${l.href} outside viewport`);
        }
        await page.screenshot({ path: `${out}/menu-open-${tag}.jpg`, type: 'jpeg', quality: 72 });
        await page.keyboard.press('Escape');
        assert.equal(await trigger.getAttribute('aria-expanded'), 'false', `menu ${tag}: Escape did not close`);
        const focused = await page.evaluate(() => document.activeElement?.classList.contains('mobile-nav-trigger'));
        assert.ok(focused, `menu ${tag}: focus did not return to the menu button`);
      } else {
        links = await page.locator('.desktop-nav a').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { href: e.getAttribute('href'), label: e.textContent.trim(), height: Math.round(r.height), right: Math.round(r.right) }; }));
        await page.screenshot({ path: `${out}/menu-desktop-${tag}.jpg`, type: 'jpeg', quality: 72 });
      }
      for (const l of links) {
        const status = await linkStatus(l.href);
        assert.equal(status, 200, `menu ${tag}: ${l.href} returned ${status}`);
        l.status = status;
      }
      report.checks.push({ route: '/', surface: vp.width < 901 ? 'mobile-menu-open' : 'desktop-nav', viewport: tag, ...c, links, result: 'PASS' });
      await context.close();
    }
  }
}

// 3) YouTube feed is disabled in the production build
{
  const r = await fetch(new URL('/api/youtube.json', base));
  const body = await r.json().catch(() => ({}));
  assert.equal(r.status, 404, `youtube endpoint returned ${r.status}`);
  assert.equal(body.status, 'disabled');
  report.checks.push({ route: '/api/youtube.json', status: r.status, body, result: 'PASS' });
}

await browser.close();
await writeFile(`${out}/p0-visual-qa.json`, JSON.stringify(report, null, 2));
console.log(`P0_VISUAL_QA_PASS checks=${report.checks.length}`);
