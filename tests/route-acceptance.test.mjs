// HP-URGENT-SITE-FINAL-047 K3 + K4 — rota kabul listesi ve çalışma dosyası sızıntısı
// negatif testleri. Build sonrası çalıştırılır (dist mevcut olmalı).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdirSync, writeFileSync, mkdtempSync, rmSync, readdirSync, lstatSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const kok = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(kok, 'dist');
const sha = t => createHash('sha256').update(t).digest('hex');

// HP-URGENT-SITE-FINAL-047 K3 — Copilot'un bildirdiği canlı (HTTP 200) ama adaydan kaybolan
// iki makale rotası: uyumluluk sayfası + doğru canonical hedefi ile korunur (deploy baseline fd1c639).
const UYUMLULUK = [
  { yol: 'yazi/2026-11-03-galatasaray-vs-stuttgart-llm.html', canonical: 'https://hpanalytic.com/yazi/2026-11-03-galatasaray-vs-stuttgart.html' },
  { yol: 'yazi/2026-11-04-fenerbahce-vs-liverpool-fc.html', canonical: 'https://hpanalytic.com/yazi/2026-11-04-fenerbahce-vs-liverpool-fc.html' },
];

// HP-URGENT-SITE-FINAL-047 K4 — kamusal distte çalışma/taslak/inceleme dosyası yasak.
const CALISMA_DESEN = /(?:^|[._-])(?:working|draft|taslak|temp|tmp|_pn3d|review[-_]only)(?:[._-]|$)/i;

function distDosyalari(base) {
  const out = [];
  const stack = [base];
  while (stack.length) {
    const dir = stack.pop();
    for (const name of readdirSync(dir)) {
      const f = join(dir, name);
      if (lstatSync(f).isDirectory()) stack.push(f);
      else out.push(f);
    }
  }
  return out;
}

test('K3: canlı baseline iki makale rotası korunur ve doğru canonical hedefini taşır', () => {
  for (const u of UYUMLULUK) {
    const f = join(dist, u.yol);
    assert.ok(existsSync(f), 'ROTA_KAYIP:' + u.yol);
    const txt = readFileSync(f, 'utf8');
    const m = txt.match(/<link\s+rel="canonical"\s+href="([^"]+)"/);
    assert.ok(m, 'CANONICAL_YOK:' + u.yol);
    assert.equal(m[1], u.canonical, 'CANONICAL_YANLIS:' + u.yol);
  }
});

// HP-MISTRAL-RELEASE-CLOSURE-085 — fenerbahce-vs-liverpool-fc uyumluluk sayfası onaysız tam metni
// taşımaz; 200 rotası yalnızca tarafsız uyumluluk açıklaması + noindex ile kalır.
test('K3: fenerbahce-vs-liverpool-fc uyumluluk sayfası tarafsız özet + noindex ile korunur', () => {
  const yol = join(dist, 'yazi/2026-11-04-fenerbahce-vs-liverpool-fc.html');
  assert.ok(existsSync(yol), 'ROTA_KAYIP');
  const txt = readFileSync(yol, 'utf8');
  assert.match(txt, /<meta\s+name="robots"\s+content="[^"]*noindex/i, 'NOINDEX_YOK');
  assert.match(txt, /<link\s+rel="canonical"\s+href="https:\/\/hpanalytic\.com\/yazi\/2026-11-04-fenerbahce-vs-liverpool-fc\.html"/, 'CANONICAL_YOK');
  assert.ok(txt.length < 4000, 'SAYFA_YENIDEN_SISDI:' + txt.length);
  const paragraflar = [...txt.matchAll(/<p[\s>]/g)].length;
  assert.ok(paragraflar <= 5, 'PARAGRAF_SINIRI:' + paragraflar);
  for (const iz of ['<table', 'Skor ve Sonuç', '<h2', 'xG', 'Pas Ağı', 'Kaleci']) {
    assert.ok(!txt.includes(iz), 'MAÇ_VERI_SIZDI:' + iz);
  }
});

test('K3: uyumluluk sayfası sitemap dışında kalır', () => {
  const sm = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
  assert.ok(!sm.includes('2026-11-04-fenerbahce-vs-liverpool-fc'), 'SITEMAPTE_UYUMLULUK');
});

test('K3: canlı baseline eşdeğer yayımlı makale rotası da dağıtımda bulunur', () => {
  assert.ok(existsSync(join(dist, 'yazi/2026-11-03-galatasaray-vs-stuttgart.html')), 'HEDEF_MAKALE_YOK');
});

test('K3: kırık 5 seri/top-5 rotasına iç navigasyon bağlantısı kalmaz', () => {
  const index = readFileSync(join(dist, 'index.html'), 'utf8');
  const kirik = [...index.matchAll(/(?:href|url)\s*[=:]\s*["'](\/(?:seri\/[\w-]+|top-5))["']/g)]
    .map(m => m[1]);
  assert.deepEqual(kirik, [], 'KIRIK_NAV_KALDI:' + kirik.join(','));
});

test('K3: komut paleti yalnızca dağıtımda var olan rota adreslerini listeler', () => {
  const srcler = ['src/js/command-palette.js', 'src/js/visuals-init.js'].filter(f => existsSync(join(kok, f)));
  assert.ok(srcler.length >= 1, 'PALET_KAYNAK_YOK');
  for (const f of srcler) {
    const txt = readFileSync(join(kok, f), 'utf8');
    const urls = [...txt.matchAll(/url:\s*['"]\/([^'"]+)['"]/g)].map(m => m[1]);
    for (const u of urls) {
      assert.ok(!u.startsWith('seri/') && !u.startsWith('top-5'), 'KIRIK_PALET_ROTA:' + f + ':' + u);
      const hedef = join(dist, u.endsWith('.xml') ? u : (u + (u.startsWith('yazi/') ? '' : '/index.html')));
      assert.ok(existsSync(join(dist, u)) || existsSync(hedef), 'PALET_ROTA_404:' + u);
    }
  }
});

test('K4: dağıtımda pass_network_v2.working.json bulunmaz', () => {
  assert.ok(!existsSync(join(dist, 'assets/data/gs-stuttgart/pass_network_v2.working.json')), 'WORKING_JSON_DISTTE');
});

test('K4: dağıtımda hiçbir working/draft/temp/review-only dosya adı geçmez', () => {
  const sizzan = distDosyalari(dist).map(f => f.slice(dist.length + 1)).filter(n => CALISMA_DESEN.test(n));
  assert.deepEqual(sizzan, [], 'CALISMA_DOSYASI_DISTTE:' + sizzan.join(','));
});

test('K4: yayımlı pas ağı görseli bozulmaz (pass_network_v2.json dağıtımda ve dolu)', () => {
  const yayimli = join(dist, 'assets/data/gs-stuttgart/pass_network_v2.json');
  assert.ok(existsSync(yayimli), 'YAYIMLI_VIZ_YOK');
  const v = JSON.parse(readFileSync(yayimli, 'utf8'));
  assert.equal(typeof v, 'object');
  assert.ok(v && Object.keys(v).length > 0, 'YAYIMLI_VIZ_BOS');
});

test('K4 negatif: kapilar working/draft/temp/review-only dosyasini distte engeller', async () => {
  {
    const { denetle: denetleFn } = await import('../scripts/release/review_audit.mjs');
    const { auditRelease } = await import('../scripts/release-security-gate.mjs');

    for (const calismaAdi of ['pass_network_v2.working.json', 'taslak-rapor.json', 'icerik.temp.json', 'kontrol-review-only.txt']) {
      const ortam = mkdtempSync(join(tmpdir(), 'hpa-calisma-'));
      try {
        const d = join(ortam, 'dist');
        mkdirSync(join(d, 'yazi'), { recursive: true });
        mkdirSync(join(d, 'assets/data'), { recursive: true });
        const md = '# Ornek\n\nGovde icerigi.\n';
        mkdirSync(join(ortam, 'content/yazilar'), { recursive: true });
        writeFileSync(join(ortam, 'content/yazilar/ormek-yazi.md'), md);
        writeFileSync(join(ortam, 'content/yayin-defteri.json'), JSON.stringify({
          schema: 'hpa.publication_ledger.v1',
          entries: [{ slug: 'ormek-yazi', source: 'ormek-yazi.md', source_sha256: sha(md), basis: 'LIVE_BASELINE', status: 'published' }]
        }));
        writeFileSync(join(d, 'yazi/ormek-yazi.html'),
          '<!doctype html><html><head><link rel="canonical" href="https://hpanalytic.com/yazi/ormek-yazi.html"/><title>t</title></head><body>x</body></html>');
        writeFileSync(join(d, 'feed.xml'), '<?xml version="1.0"?><rss><channel><item><link>https://hpanalytic.com/yazi/ormek-yazi.html</link></item></channel></rss>');
        writeFileSync(join(d, 'sitemap.xml'), '<?xml version="1.0"?><urlset><url><loc>https://hpanalytic.com/yazi/ormek-yazi.html</loc></url></urlset>');
        writeFileSync(join(d, 'assets/data/' + calismaAdi), '{}');

        assert.throws(() => auditRelease(ortam, 'dist'), /WORKING_FILE|SENSITIVE_FILE/, 'KAPI_CALISMA_DOSYASINA_IZIN_VERDI:' + calismaAdi);
        const sonuc = denetleFn(ortam, 'dist');
        assert.ok(sonuc.engel.some(e => e.startsWith('WORKING_FILE')), 'AUDIT_CALISMA_DOSYASINA_IZIN_VERDI:' + calismaAdi);
      } finally {
        rmSync(ortam, { recursive: true, force: true });
      }
    }
  }
});
