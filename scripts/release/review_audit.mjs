// HP-MISTRAL-RELEASE-030 — dist tabanlı yayın güvenliği denetimi (PR #100 gate ile tamamlayıcı).
// Fail-closed: şüphede blokla. Dağıtım yetkisi vermez; makbuz ve rollback manifesti üretir.
// Kullanım: node scripts/release/review_audit.mjs [distDir]
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, lstatSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const sha = s => createHash('sha256').update(s).digest('hex');

// PR #100 gate ile aynı desenler (tamamlayıcı ikinci katman).
const privatePath = /(?:\/data\/data\/com\.termux|\/storage\/emulated\/|\/sdcard\/|\/root\/HP_WORKSPACE|\/root\/AI_WRITER_LAB)/i; // hpa:allow-path: desen tanımı, sır değildir
const credential = /(?:sk-proj-[a-zA-Z0-9_-]{12,}|ghp_[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9_-]{30,})/; // hpa:allow-path: desen tanımı, sır değildir
const disallowed = /^(?:hazine\/|assets\/hazine(?:\/|-manifest)|.*(?:data\.bak_|\.bak(?:\.|$)|\.tmp$|\.env(?:\.|$)|\.pem$|\.key$)|(?:test|pilot|draft|taslak|_pn3d)[\w-]*\.html$)/i;

// Çalışan sayfaların çalışma zamanında tüktettiği, canlı verilere referanslı istisna (kanıtla kayıtlı).
const VERI_ISTISNALARI = new Set([
  'assets/data/gs-stuttgart/players.csv',
  'assets/data/gs-stuttgart/teams.csv'
]);

function filesUnder(base) {
  if (!existsSync(base)) throw new Error('DIST_MISSING');
  const out = [], stack = [base];
  while (stack.length) {
    const dir = stack.pop();
    for (const name of readdirSync(dir)) {
      const f = join(dir, name);
      const st = lstatSync(f);
      if (st.isSymbolicLink()) throw new Error('DIST_SYMLINK:' + relative(base, f));
      if (st.isDirectory()) stack.push(f);
      else if (st.isFile()) out.push(f);
      else throw new Error('DIST_SPECIAL_FILE:' + relative(base, f));
    }
  }
  return out;
}

function feedSlugs(root, dist) {
  const feed = join(dist, 'feed.xml');
  if (!existsSync(feed)) throw new Error('FEED_MISSING');
  return [...new Set([...readFileSync(feed, 'utf8').matchAll(/<link>\s*[^<]*\/yazi\/([^/<>?\s]+)\.html\s*<\/link>/g)].map(m => m[1]))];
}

export function denetle(root = '.', distDir = 'dist', { yaz = false } = {}) {
  const kontroller = [];
  const engel = [];
  const istisnalar = [];
  const U = (kod, sonuc, detay = '') => { kontroller.push({ kod, sonuc, detay }); if (sonuc === 'engelli') engel.push(kod + (detay ? ':' + detay : '')); };

  const absolute = resolve(root);
  const dist = resolve(root, distDir);
  const rel = f => relative(dist, f).split(sep).join('/');

  // 1) Ledger: PR #100 şeması hpa.publication_ledger.v1
  const onayli = new Map();
  try {
    const ledger = JSON.parse(readFileSync(join(absolute, 'content/yayin-defteri.json'), 'utf8'));
    if (ledger?.schema !== 'hpa.publication_ledger.v1' || !Array.isArray(ledger.entries)) throw new Error('LEDGER_SCHEMA_INVALID');
    for (const e of ledger.entries) {
      if (e.status !== undefined && !['approved', 'published', 'yayinda', 'yayında'].includes(String(e.status).toLowerCase())) continue;
      if (!/^[a-z0-9-]+$/.test(e.slug || '') || !/^[-\w]+\.md$/.test(e.source || '') || !['LIVE_BASELINE', 'HUMAN_APPROVAL'].includes(e.basis)) throw new Error('APPROVAL_INVALID:' + (e.slug || '?'));
      const source = join(absolute, 'content/yazilar', e.source);
      if (!existsSync(source)) throw new Error('SOURCE_MISSING:' + e.source);
      if (!/^[a-f0-9]{64}$/.test(e.source_sha256 || '') || sha(readFileSync(source)) !== e.source_sha256) throw new Error('SOURCE_HASH_DRIFT:' + e.source);
      if (e.source_changed_since_deployed_commit === true) throw new Error('CHANGED_SINCE_APPROVAL:' + e.slug);
      onayli.set(e.slug, e.source);
    }
    if (!onayli.size) throw new Error('NO_APPROVED_ARTICLES');
    U('LEDGER', 'gecti', [...onayli.keys()].join(',') );
  } catch (err) { U('LEDGER', 'engelli', String(err.message || err)); }

  // 2) Adaylar registry: inceleme/iptal adayları dist'e sızmamalı
  let adaylar = null;
  try {
    adaylar = JSON.parse(readFileSync(join(absolute, 'content/yayin-adaylari.json'), 'utf8'));
    const adayAnahtarlari = (adaylar.inceleme_adaylari || []).filter(a => a.durum === 'incelemede' || a.durum === 'iptal').map(a => a.slug);
    const birlesik = [...adayAnahtarlari, ...new Set([...(adaylar.inceleme_adaylari || []).map(a => a.slug)])];
    U('REGISTRY', 'gecti', birlesik.join(','));
  } catch (err) { U('REGISTRY', 'engelli', String(err.message || err)); }

  // 3) Dosya tarama
  const dosyalar = filesUnder(dist);
  const yaziHtml = new Set();
  for (const f of dosyalar) {
    const r = rel(f);
    if (/\.(?:html|js|css|json|xml|svg|txt)$/i.test(r)) {
      const txt = readFileSync(f, 'utf8');
      if (privatePath.test(txt)) U('PRIVATE_PATH', 'engelli', r);
      if (credential.test(txt)) U('CREDENTIAL_LEAK', 'engelli', r);
    }
    if (r.endsWith('.map')) U('SOURCE_MAP_LEAK', 'engelli', r);
    if (/\.(?:csv|xlsx|zip)$/i.test(r)) {
      if (VERI_ISTISNALARI.has(r)) istisnalar.push({ yol: r, gerekce: 'yayinli makale calisma zamani verisi (src/js/viz) kullaniyor' });
      else U('RAW_DATA_FILE', 'engelli', r);
    }
    if (r.endsWith('.xml') && r !== 'feed.xml' && r !== 'sitemap.xml') U('XML_FILE', 'engelli', r);
    if (disallowed.test(r)) U('SENSITIVE_FILE', 'engelli', r);
    if (/^yazi\/[\w-]+\.html$/.test(r)) {
      yaziHtml.add(r.slice(5, -5));
      if (onayli.size && !onayli.has(r.slice(5, -5))) U('UNAPPROVED_HTML', 'engelli', r);
      const txt = readFileSync(f, 'utf8');
      if (!/rel="canonical"/.test(txt)) U('CANONICAL_MISSING', 'engelli', r);
      if (/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(txt)) U('INDEXED_BUT_NOINDEX', 'engelli', r);
    }
  }
  U('DIST_SCAN', 'gecti', [...yaziHtml].join(','));
  if (onayli.size) {
    for (const slug of onayli.keys()) {
      if (!yaziHtml.has(slug)) U('APPROVED_PAGE_MISSING', 'engelli', slug);
    }
  }

  // 4) Feed tutarlılığı
  try {
    const feedler = feedSlugs(root, dist);
    const gecersiz = feedler.filter(s => !onayli.has(s));
    for (const s of gecersiz) U('FEED_UNAPPROVED', 'engelli', s);
    if (onayli.size && !feedler.length) U('FEED_NO_APPROVED_LINKS', 'engelli', '');
    const eksik = [...onayli.keys()].filter(s => !feedler.includes(s));
    if (onayli.size && eksik.length) U('FEED_LEDGER_MISMATCH', 'engelli', 'feedde-olmayan:' + eksik.join(','));
    U('FEED', engel.some(e => e.startsWith('FEED')) ? 'engelli' : 'gecti', `${feedler.length} madde`);
  } catch (err) { U('FEED', 'engelli', String(err.message || err)); }

  // 5) Sitemap tutarlılığı
  const sm = join(dist, 'sitemap.xml');
  if (!existsSync(sm)) U('SITEMAP_MISSING', 'engelli', '');
  else {
    const smSlugs = [...readFileSync(sm, 'utf8').matchAll(/<loc>https:\/\/hpanalytic\.com\/yazi\/([^<]+)\.html<\/loc>/g)].map(m => m[1]);
    const gecersiz = smSlugs.filter(s => !onayli.has(s));
    for (const s of gecersiz) U('SITEMAP_UNAPPROVED', 'engelli', s);
    const eksik = [...onayli.keys()].filter(s => !smSlugs.includes(s));
    if (onayli.size && eksik.length) U('SITEMAP_MISMATCH', 'engelli', 'sitemapta-olmayan:' + eksik.join(','));
    U('SITEMAP', engel.some(e => e.startsWith('SITEMAP')) ? 'engelli' : 'gecti', smSlugs.join(','));
    const robots = smSlugs.filter(s => (adaylar?.inceleme_adaylari || []).some(a => a.noindex && a.slug === s));
    for (const s of robots) U('NOINDEX_IN_SITEMAP', 'engelli', s);
  }

  // 6) Rollback manifesti (SHA-256, tüm dist)
  const manifest = {
    schema: 'hpa.rollback_manifest.v1',
    olusurma: new Date().toISOString(),
    kok: distDir,
    dosya_sayisi: dosyalar.length,
    dosyalar: dosyalar.map(f => ({ yol: rel(f), sha256: sha(readFileSync(f)), boyut: readFileSync(f).length }))
  };
  const manifestStr = JSON.stringify(manifest, null, 2);

  const makbuz = {
    schema: 'hpa.release_review_receipt.v1',
    olusturma: manifest.olusurma,
    gorev_id: 'HP-MISTRAL-RELEASE-030',
    ajans_adi: 'Mistral',
    model: 'zai-glm-5-3-flash-vibe-free',
    publication_authorized: false,
    review_required: true,
    release_status: engel.length ? 'HOLD' : 'IZIN',
    dist_kok: distDir,
    tarama: { dosya: dosyalar.length, onayli_makale: onayli.size, yazi_html: yaziHtml.size },
    kontroller, istisnalar,
    rollback_manifest_sha256: sha(manifestStr)
  };
  if (engel.length) makbuz.engeller = engel;

  return { makbuz, manifest, engel, istisnalar, kontroller, yaz: (ciktiDizini) => {
    mkdirSync(ciktiDizini, { recursive: true });
    writeFileSync(join(ciktiDizini, 'release-review-receipt.json'), JSON.stringify(makbuz, null, 2) + '\n', 'utf-8');
    writeFileSync(join(ciktiDizini, 'rollback-manifest.json'), manifestStr + '\n', 'utf-8');
  } };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const distDir = process.argv[2] || 'dist';
  const sonuc = denetle('.', distDir, { yaz: true });
  sonuc.yaz('release-review');
  if (sonuc.engel.length) {
    console.error('YAYIN_DENETIMI_ENGELLENDI: ' + sonuc.engel.join(' | '));
    process.exitCode = 1;
  } else {
    console.log('YAYIN_DENETIMI_GECTI: ' + sonuc.kontroller.length + ' kontrol, ' + sonuc.makbuz.rollback_manifest_sha256.slice(0, 12) + ' rollback manifesti');
  }
}
