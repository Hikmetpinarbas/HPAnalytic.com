// P0 audit probe: overflow, contrast, nav, ids, images. Read-only against a running preview.
// Usage (needs a running build, e.g. `npx astro preview`): HP_QA_BASE_URL=http://127.0.0.1:4321 node docs/audits/p0-repro/p0-responsive.browser.mjs qa-artifacts/p0
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.HP_QA_BASE_URL || 'http://127.0.0.1:4321';
const out = process.argv[2] || './out';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const PAGES = ['/', '/articles/event-only-boundary/', '/analysis/', '/visual-lab/', '/about/', '/archive/', '/search?q=gorur', '/scouting/'];
const WIDTHS = [320, 375, 430, 1440];
const report = {};

const probe = () => {
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const bgOf = (el) => { const stack = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break; } } let bg = { r: 255, g: 255, b: 255, a: 1 }; for (const c of stack.reverse()) bg = blend(c, bg); return bg; };
  const low = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const cs = getComputedStyle(el); const rect = el.getBoundingClientRect();
    if (cs.visibility === 'hidden' || cs.display === 'none' || rect.width === 0 || +cs.opacity === 0) continue;
    if (el.closest('[hidden],[aria-hidden="true"],.skip-link')) continue;
    const fg0 = parse(cs.color); if (!fg0) continue; const bg = bgOf(el); const fg = blend(fg0, bg);
    const L1 = lum(fg), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(cs.fontSize); const bold = +cs.fontWeight >= 700; const large = size >= 24 || (bold && size >= 18.66);
    const need = large ? 3 : 4.5;
    if (ratio < need) low.push({ sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''), text: el.textContent.trim().slice(0, 40), color: cs.color, ratio: +ratio.toFixed(2), need });
  }
  const ids = {}; for (const el of document.querySelectorAll('[id]')) ids[el.id] = (ids[el.id] || 0) + 1;
  const dupIds = Object.entries(ids).filter(([, n]) => n > 1).map(([k]) => k);
  const imgs = [...document.images].map((i) => ({ src: i.getAttribute('src'), alt: i.getAttribute('alt'), w: i.getAttribute('width'), h: i.getAttribute('height') }));
  const wide = [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > innerWidth + 1 && getComputedStyle(e).position !== 'fixed' && !e.closest('[hidden]')).slice(0, 5).map((e) => e.tagName.toLowerCase() + '.' + String(e.className).trim().split(/\s+/)[0]);
  const smallTargets = [...document.querySelectorAll('a,button,summary,input')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 24 || r.width < 24) && !e.closest('.prose,[hidden]'); }).slice(0, 6).map((e) => `${e.tagName.toLowerCase()}:${(e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 20)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`);
  return { overflow: document.documentElement.scrollWidth - innerWidth, wide, low: low.slice(0, 40), lowCount: low.length, dupIds, imgs, smallTargets, h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim().slice(0, 40)), canonical: document.querySelector('link[rel=canonical]')?.href, robots: document.querySelector('meta[name=robots]')?.content ?? null, navItems: [...document.querySelectorAll('.desktop-nav a')].map((a) => a.textContent.trim()) };
};

for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = []; page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); }); page.on('pageerror', (e) => errors.push(e.message));
  for (const p of PAGES) {
    const res = await page.goto(base + p, { waitUntil: 'networkidle' });
    const r = await page.evaluate(probe);
    r.status = res.status(); r.errors = [...errors]; errors.length = 0;
    report[`${width} ${p}`] = r;
    await page.screenshot({ path: `${out}/${width}${p.replace(/[\/?=]+/g, '_')}.png`, fullPage: width !== 1440 ? false : false });
  }
  if (width <= 430) {
    await page.goto(base + '/', { waitUntil: 'networkidle' });
    const t = page.locator('.mobile-nav-trigger');
    const nav = { triggerVisible: await t.isVisible() };
    if (nav.triggerVisible) {
      await t.click(); nav.openAfterClick = await t.getAttribute('aria-expanded'); nav.panelLinks = await page.locator('#mobile-nav-panel a').allTextContents();
      await page.screenshot({ path: `${out}/${width}_menu_open.png` });
      await page.keyboard.press('Escape'); nav.afterEscape = await t.getAttribute('aria-expanded'); nav.focusAfterEscape = await page.evaluate(() => document.activeElement?.className);
      await t.click(); await page.mouse.click(5, 880); nav.afterOutside = await t.getAttribute('aria-expanded');
      await t.click(); await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); nav.afterTabOut = await t.getAttribute('aria-expanded');
    }
    report[`${width} mobile-nav`] = nav;
  }
  await ctx.close();
}
// No-JS mobile: is navigation still reachable?
const nojs = await browser.newContext({ viewport: { width: 375, height: 900 }, javaScriptEnabled: false });
const np = await nojs.newPage(); await np.goto(base + '/', { waitUntil: 'load' });
report['375 nojs'] = { desktopNavVisible: await np.locator('.desktop-nav').isVisible(), trigger: await np.locator('.mobile-nav-trigger').isVisible(), overflow: await np.evaluate(() => document.documentElement.scrollWidth - innerWidth) };
await np.screenshot({ path: `${out}/375_nojs.png` });
await browser.close();
await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 1).slice(0, 200));
