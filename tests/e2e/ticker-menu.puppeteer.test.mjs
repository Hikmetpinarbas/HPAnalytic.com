// Gerçek Chromium (Puppeteer) E2E regresyonu — canlı bülten + menü paneli.
// Kapsam: DOM init, fallback, geçerli feed, süresi dolmuş feed, klavye
// erişilebilirliği (klon odağı), reduced-motion, favicon, menü odak/Escape,
// 390 / 768 / 1440 px görünümler.
// Çalıştırma: npm run build && npm run test:e2e
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import puppeteer from 'puppeteer';

const PORT = 4173;
const BASE = `http://127.0.0.1:${PORT}`;
const VIEWPORTS = [
  { name: 'mobil-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'masaustu-1440', width: 1440, height: 900 }
];

const results = [];
let failures = 0;
function record(vp, name, passed, detail = '') {
  results.push(`${passed ? 'PASS' : 'FAIL'} [${vp}] ${name}${detail ? ` — ${detail}` : ''}`);
  if (!passed) failures++;
  console.log(`${passed ? '  OK ' : '  FAIL'} [${vp}] ${name}${detail ? ` — ${detail}` : ''}`);
}

const LIVE_FEED = {
  schema: 'hpa.live_ticker.v1',
  available: true,
  publication_authorized: true,
  fetched_at: new Date().toISOString(),
  ttl_minutes: 30,
  items: [
    { text: 'Lille 2-4 Galatasaray: 3 farklı gol yolu', kaynak: 'HPAnalytic maç raporu', tarih: '2026-11-05', dogrulama: 'dogrulanmis', href: '/yazi/mac-lille-galatasaray-2026-10-21.html' },
    { text: 'Beşiktaş 2-2 Crystal Palace: son 15 metre', kaynak: 'HPAnalytic maç raporu', tarih: '2026-11-04', dogrulama: 'proxy' }
  ]
};
const EXPIRED_FEED = {
  ...LIVE_FEED,
  fetched_at: '2026-11-01T00:00:00Z'
};

async function startPreview() {
  const child = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(BASE + '/');
      if (res.ok) return child;
    } catch {}
    await sleep(500);
  }
  child.kill();
  throw new Error('vite preview başlatılamadı');
}

async function newPage(browser, { tickerJson, reducedMotion = false } = {}) {
  const page = await browser.newPage();
  page.setDefaultTimeout(12000);
  const badResponses = [];
  page.on('response', (res) => {
    if (res.status() >= 400) badResponses.push(`${res.status()} ${res.url()}`);
  });
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const url = req.url();
    if (tickerJson && url.includes('/assets/data/live-ticker.json')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(tickerJson)
      });
      return;
    }
    req.continue();
  });
  if (reducedMotion) {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  }
  return { page, badResponses };
}

async function openHome(page, width, height) {
  await page.setViewport({ width, height });
  await page.goto(BASE + '/', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('.marquee-section', { timeout: 15000 });
  await page.waitForFunction(() => {
    const s = document.querySelector('.marquee-section');
    return s && (s.dataset.state === 'live' || s.dataset.state === 'fallback');
  }, { timeout: 15000 });
  // Preloader katmanı tıklamaları yutmasın: tamamen kalkmasını bekle
  await page.waitForFunction(() => {
    const pre = document.getElementById('preloader');
    return !pre || pre.style.display === 'none' || !pre.isConnected;
  }, { timeout: 15000 }).catch(() => {});
  await sleep(300);
}

async function runSuite(browser) {
  for (const vp of VIEWPORTS) {
    const { name, width, height } = vp;

    // 1) DOM init + fallback (dist seed fail-closed)
    {
      const { page } = await newPage(browser);
      await openHome(page, width, height);
      const state = await page.$eval('.marquee-section', (s) => s.dataset.state);
      const trackText = await page.$eval('.marquee-track', (t) => t.textContent);
      record(name, 'DOM init: ticker bölümü oluşur ve state kazanır', state === 'fallback' || state === 'live', `state=${state}`);
      record(name, 'fallback: nötr yetenek şeridi görünür, uydurma skor yok', state === 'fallback' && trackText.includes('sayı uydurulmaz'), trackText.slice(0, 60));
      const fakeScore = await page.$eval('.marquee-track', (t) => /\d+\s*-\s*\d+/.test(t.textContent));
      record(name, 'fallback: eşleşme skoru gösterilmez', !fakeScore);
      await page.close();
    }

    // 2) Geçerli feed: canlı render + klavye + klon odağı
    {
      const { page } = await newPage(browser, { tickerJson: LIVE_FEED });
      await openHome(page, width, height);
      const state = await page.$eval('.marquee-section', (s) => s.dataset.state);
      const itemCount = await page.$$eval('.ticker-group:not([aria-hidden="true"]) .ticker-item', (els) => els.length);
      record(name, 'geçerli feed: state=live ve maddeler render edilir', state === 'live' && itemCount === 2, `items=${itemCount}`);
      const verifLabel = await page.$eval('.ticker-group:not([aria-hidden="true"]) .ticker-verif', (el) => el.textContent);
      const metaText = await page.$eval('.ticker-group:not([aria-hidden="true"]) .ticker-meta', (el) => el.textContent);
      record(name, 'geçerli feed: doğrulama rozeti + kaynak · tarih meta', verifLabel === 'Doğrulanmış' && /\d{2}\.\d{2}\.\d{4}/.test(metaText), `${verifLabel} / ${metaText}`);

      // Klon odaklanabilirliği: aria-hidden klon içindeki <a> klavye odağı alamaz
      const cloneFocusable = await page.evaluate(() => {
        const clone = document.querySelector('.marquee-track .ticker-group[aria-hidden="true"]');
        if (!clone) return { exists: false };
        const links = [...clone.querySelectorAll('a')];
        return {
          exists: true,
          inert: clone.inert === true,
          tabIndexAll: links.length > 0 && links.every((a) => a.tabIndex === -1)
        };
      });
      record(name, 'klavye: klon aria-hidden + inert', cloneFocusable.exists && cloneFocusable.inert);
      record(name, 'klavye: klon linkleri tabIndex=-1', cloneFocusable.tabIndexAll);

      // Sekme sırası: ilk odaklanılabilir ticker linki klonda olmamalı
      const tabSkipsClone = await page.evaluate(() => {
        const first = document.querySelector('.marquee-track .ticker-group:not([aria-hidden="true"]) a');
        if (!first) return true;
        first.focus();
        return document.activeElement === first && !document.querySelector('.marquee-track .ticker-group[aria-hidden="true"]').contains(document.activeElement);
      });
      record(name, 'klavye: sekme sırası klonu atlar', tabSkipsClone);

      // href yerel yol olmalı
      const hrefs = await page.$$eval('.ticker-group:not([aria-hidden="true"]) a.ticker-item', (as) => as.map((a) => a.getAttribute('href')));
      record(name, 'güvenlik: ticker linkleri yalnızca yerel yol', hrefs.every((h) => h.startsWith('/') && !h.startsWith('//')), hrefs.join(', '));
      await page.close();
    }

    // 3) Süresi dolmuş feed → fallback
    {
      const { page } = await newPage(browser, { tickerJson: EXPIRED_FEED });
      await openHome(page, width, height);
      const state = await page.$eval('.marquee-section', (s) => s.dataset.state);
      record(name, 'süresi dolmuş feed: fail-closed, nötr şeride döner', state === 'fallback', `state=${state}`);
      await page.close();
    }

    // 4) Şema uyuşmazlığı → fallback
    {
      const { page } = await newPage(browser, { tickerJson: { ...LIVE_FEED, schema: 'baska.v9' } });
      await openHome(page, width, height);
      const state = await page.$eval('.marquee-section', (s) => s.dataset.state);
      record(name, 'şema uyuşmazlığı: fail-closed', state === 'fallback', `state=${state}`);
      await page.close();
    }

    // 5) Reduced motion
    {
      const { page } = await newPage(browser, { tickerJson: LIVE_FEED, reducedMotion: true });
      await openHome(page, width, height);
      const rm = await page.evaluate(() => {
        const track = document.querySelector('.marquee-track');
        const groups = document.querySelectorAll('.marquee-track .ticker-group').length;
        const cs = getComputedStyle(track);
        return { anim: cs.animationName, groups };
      });
      record(name, 'reduced-motion: animasyon kapalı', rm.anim === 'none', `animation=${rm.anim}`);
      record(name, 'reduced-motion: klon render edilmez', rm.groups === 1, `groups=${rm.groups}`);
      await page.close();
    }

    // 6) Favicon + kaynak 404 taraması
    {
      const { page, badResponses } = await newPage(browser);
      await openHome(page, width, height);
      record(name, 'favicon: 404 yok (favicon.svg çözülür)', !badResponses.some((r) => r.includes('favicon')), badResponses.filter((r) => r.includes('favicon')).join(', '));
      record(name, 'ağ: sayfa kaynaklarında 4xx/5xx yok', badResponses.length === 0, badResponses.slice(0, 3).join(', '));
      await page.close();
    }

    // 7) Menü paneli: odak yönetimi + Escape + aria senkronu
    {
      const { page, badResponses } = await newPage(browser);
      await openHome(page, width, height);
      await page.waitForSelector('.index-btn', { timeout: 15000 });
      await page.click('.index-btn');
      await page.waitForSelector('#site-index:not([hidden])', { timeout: 5000 });
      const focusInPanel = await page.waitForFunction(() => {
        const panel = document.getElementById('site-index');
        return panel && panel.contains(document.activeElement);
      }, { timeout: 5000 }).then(() => true).catch(async () => {
        const diag = await page.evaluate(() => ({
          active: document.activeElement ? document.activeElement.tagName + '.' + document.activeElement.className : 'none',
          hidden: document.getElementById('site-index')?.hidden
        }));
        record(name, 'menü: odak tanılama', false, JSON.stringify(diag));
        return false;
      });
      record(name, 'menü: açılınca odak panele girer', focusInPanel === true);
      const expanded = await page.$eval('.index-btn', (b) => b.getAttribute('aria-expanded'));
      record(name, 'menü: düğme aria-expanded=true', expanded === 'true');

      // Odak tuzağı: Tab son panel linkinde kalır
      const trapWorks = await page.evaluate(() => {
        const panel = document.getElementById('site-index');
        const links = [...panel.querySelectorAll('a[href]')];
        const last = links[links.length - 1];
        last.focus();
        return document.activeElement === last;
      });
      await page.keyboard.press('Tab');
      const trappedToFirst = await page.evaluate(() => {
        const panel = document.getElementById('site-index');
        const links = [...panel.querySelectorAll('a[href]')];
        return document.activeElement === links[0];
      });
      record(name, 'menü: odak tuzağı Tab ile panelde kalır', trapWorks && trappedToFirst);

      // Escape kapatır + odak geri döner + aria senkron
      await page.keyboard.press('Escape');
      await sleep(100);
      const afterEsc = await page.evaluate(() => ({
        hidden: document.getElementById('site-index').hidden,
        expanded: document.querySelector('.index-btn').getAttribute('aria-expanded'),
        openCls: document.querySelector('.index-btn').classList.contains('is-open'),
        focusOnBtn: document.activeElement === document.querySelector('.index-btn')
      }));
      record(name, 'menü: Escape paneli kapatır', afterEsc.hidden === true);
      record(name, 'menü: Escape sonrası aria-expanded=false ve is-open kalkar', afterEsc.expanded === 'false' && !afterEsc.openCls);
      record(name, 'menü: odak tetikleyici düğmeye döner', afterEsc.focusOnBtn);

      // Panelden link gezmek yayın akışını bozmaz; kalan 4xx yok
      record(name, 'menü: panel etkileşiminde 4xx/5xx yok', badResponses.length === 0, badResponses.slice(0, 3).join(', '));
      await page.close();
    }

    // 8) Düzen: yatay taşma yok (responsive doğrulama)
    {
      const { page } = await newPage(browser);
      await openHome(page, width, height);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      record(name, `düzen: ${width}px'te yatay taşma yok`, overflow <= 1, `overflow=${overflow}px`);
      if (width === 390) {
        const metaHidden = await page.$eval('.ticker-meta', (el) => getComputedStyle(el).display === 'none').catch(() => true);
        record(name, 'mobil 390: ticker meta gizli', metaHidden);
      }
      await page.close();
    }
  }
}

// Genel gözcü: suite her koşulda 8 dakikada sonlanmalı (CI'da askıda kalmasın)
setTimeout(() => {
  console.error('E2E GÖZCÜ: 8 dk sınırı aşıldı — suite sonlandırıldı');
  console.log(`\nE2E: ${results.length - failures}/${results.length} GEÇTİ, ${failures} BAŞARISIZ (_timeout_)`);
  process.exit(2);
}, 8 * 60 * 1000).unref?.();

const server = await startPreview();
try {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  try {
    await runSuite(browser);
  } finally {
    await browser.close();
  }
} finally {
  server.kill('SIGKILL');
}

console.log(`\nE2E: ${results.length - failures}/${results.length} GEÇTİ, ${failures} BAŞARISIZ`);
if (failures > 0) process.exit(1);
