// HP-MISTRAL-RELEASE-030 — dist tabanlı yayın güvenliği denetimi (PR #100 gate ile tamamlayıcı).
// HP-W1-SITE-001 — ham JSON + source map sızıntı denetimi, canonical hedef denetimi ve tek
// açık RELEASE_READY makbuzu eklendi; denetim gerçek deploy kapısının (deploy.yml build işi)
// zorunlu fail-closed adımıdır. Yayın yetkisi yine yalnızca insan onayıdır.
// Kullanım: node scripts/release/review_audit.mjs [distDir]
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, lstatSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, relative, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const sha = s => createHash('sha256').update(s).digest('hex');

// HP-URGENT-SITE-FINAL-047 K4 — çalışma/taslak/inceleme dosyaları kamusal dist'e giremez.
const CALISMA_DOSYA_DESEN = /(?:^|[\\/._-])(?:working|draft|taslak|temp|tmp|_pn3d|review[-_]only)(?:[._-]|$)/i;

// PR #100 gate ile aynı desenler (tamamlayıcı ikinci katman).
const privatePath = /(?:\/data\/data\/com\.termux|\/storage\/emulated\/|\/sdcard\/|\/root\/HP_WORKSPACE|\/root\/AI_WRITER_LAB)/i; // hpa:allow-path: desen tanımı, sır değildir
const credential = /(?:sk-proj-[a-zA-Z0-9_-]{12,}|ghp_[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9_-]{30,})/; // hpa:allow-path: desen tanımı, sır değildir
const disallowed = /^(?:hazine\/|assets\/hazine(?:\/|-manifest)|.*(?:data\.bak_|\.bak(?:\.|$)|\.tmp$|\.env(?:\.|$)|\.pem$|\.key$)|(?:test|pilot|draft|taslak|_pn3d)[\w-]*\.html$)/i;

// HP-W1-SITE-001 — ham CSV/XLSX/ZIP artık hiçbir istisna kabul etmez: players.csv/teams.csv
// kamusal alandan kaldırıldı; ham kaynaklar deploy EDİLMEYEN content/kaynak-veri ağacında.

// dist'teki .json sözleşmesi: her dosya ya `hpa.*` şeması taşır ya da aşağıdaki gerekçeli
// görünüm-verisi izin listesindedir; dışındaki her .json ham veri sayılır (RAW_JSON_FILE).
const JSON_IZIN_ONEKLERI = new Map([
  ['assets/data/gs-stuttgart/', 'yayımlı makale çalışma zamanı türetilmiş viz verisi (src/js/viz)'],
  ['assets/data/lille-gs/', 'mac-lille-galatasaray-2026-10-21 çalışma zamanı türetilmiş viz verisi'],
  ['assets/data/gs-fb/', 'mac-galatasaray-fenerbahce-2026-10-26 türetilmiş özet paketi'],
  ['assets/data/fdorg/', 'statik lig tablosu/golcü anlık görünümü (çalışma zamanı çekim yok)'],
  ['assets/data/fitness/', 'oyuncu/takım fitness türetilmiş görünümü'],
  ['assets/data/crystal-palace/', 'mac-besiktas-crystal-palace-2026-10-22 pitch-layer meta verisi']
]);
const JSON_IZINLI = new Set([
  'search-index.json',
  'assets/data/advanced_metrics.json', 'assets/data/articles.json', 'assets/data/carriers_rising.json',
  'assets/data/marquee_texts.json', 'assets/data/matches.json', 'assets/data/pass_network.json',
  'assets/data/players.json', 'assets/data/radar_data.json', 'assets/data/rankings.json',
  'assets/data/shot_map.json', 'assets/data/shot_map_derbi.json', 'assets/data/sl_advanced.json',
  'assets/data/sl_rankings.json', 'assets/data/sl_standouts.json', 'assets/data/sl_team_rankings.json',
  'assets/data/sl_teams.json', 'assets/data/standouts.json', 'assets/data/team_highlights.json',
  'assets/data/teams.json'
]);

function jsonIzinGerekcesi(yol) {
  if (JSON_IZINLI.has(yol)) return 'derleme/çalışma zamanı türetilmiş görünüm verisi (ham olay verisi değil)';
  for (const [onek, gerekce] of JSON_IZIN_ONEKLERI) if (yol.startsWith(onek)) return gerekce;
  return null;
}

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

export function denetle(root = '.', distDir = 'dist', opts = {}) {
  const { yaz = false } = opts;

  // HP-URGENT-SITE-FINAL-047 K2 — makbuz gerçek CI bağlama (commit/CI run/artefakt) bağlıdır.
  const commitSha = opts.commitSha
    ?? process.env.GITHUB_SHA
    ?? (() => { try { return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch { return null; } })();
  const runId = String(opts.runId ?? process.env.GITHUB_RUN_ID ?? 'local');

  const kontroller = [];
  const engel = [];
  const istisnalar = [];
  const U = (kod, sonuc, detay = '') => { kontroller.push({ kod, sonuc, detay }); if (sonuc === 'engelli') engel.push(kod + (detay ? ':' + detay : '')); };

  const absolute = resolve(root);
  const dist = resolve(root, distDir);
  const rel = f => relative(dist, f).split(sep).join('/');

  // 1) Ledger: PR #100 şeması hpa.publication_ledger.v1 — tur:'uyumluluk' girdileri (HP-URGENT-SITE-FINAL-047 K3)
  //    canlı baseline rotasını korur; canonical hedefi ledger girdisinden zorunlu kılınır.
  const onayli = new Map();
  const uyumluluk = new Map();
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
      if (e.tur === 'uyumluluk') {
        if (!/^https:\/\/hpanalytic\.com\/yazi\/[\w-]+\.html$/.test(e.canonical || '')) throw new Error('UYUMLULUK_CANONICAL:' + e.slug);
        uyumluluk.set(e.slug, e.canonical);
      }
      onayli.set(e.slug, e.source);
    }
    for (const [slug, hedef] of uyumluluk) {
      const hedefSlug = hedef.replace(/^https:\/\/hpanalytic\.com\/yazi\//, '').replace(/\.html$/, '');
      if (hedefSlug !== slug && !onayli.has(hedefSlug)) throw new Error('UYUMLULUK_TARGET_UNAPPROVED:' + slug + '->' + hedefSlug);
    }
    if (!onayli.size) throw new Error('NO_APPROVED_ARTICLES');
    U('LEDGER', 'gecti', [...onayli.keys()].join(','));
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
    if (CALISMA_DOSYA_DESEN.test(r)) U('WORKING_FILE', 'engelli', r);
    if (/\.(?:html|js|css|json|xml|svg|txt)$/i.test(r)) {
      const txt = readFileSync(f, 'utf8');
      if (privatePath.test(txt)) U('PRIVATE_PATH', 'engelli', r);
      if (credential.test(txt)) U('CREDENTIAL_LEAK', 'engelli', r);
    }
    if (/\.(?:csv|xlsx|zip)$/i.test(r)) U('RAW_DATA_FILE', 'engelli', r);
    if (r.endsWith('.xml') && r !== 'feed.xml' && r !== 'sitemap.xml') U('XML_FILE', 'engelli', r);
    if (disallowed.test(r)) U('SENSITIVE_FILE', 'engelli', r);
    if (/^yazi\/[\w-]+\.html$/.test(r)) {
      const slugHtml = r.slice(5, -5);
      yaziHtml.add(slugHtml);
      if (onayli.size && !onayli.has(slugHtml)) U('UNAPPROVED_HTML', 'engelli', r);
      const txt = readFileSync(f, 'utf8');
      const canon = txt.match(/<link\s+rel="canonical"\s+href="([^"]+)"/);
      const beklenen = uyumluluk.get(slugHtml);
      if (!canon) U('CANONICAL_MISSING', 'engelli', r);
      else if (beklenen) {
        if (canon[1] !== beklenen) U('CANONICAL_TARGET', 'engelli', r + ' -> ' + canon[1]);
      }
      else if (canon[1] !== 'https://hpanalytic.com/yazi/' + slugHtml + '.html') U('CANONICAL_TARGET', 'engelli', r + ' -> ' + canon[1]);
      const noindexli = /<meta\s+name="robots"\s+content="[^"]*noindex/i.test(txt);
      // Kendine bagli uyumluluk sayfasi (onayli makale yerine yer tutan) dizine eklenmemeli; noindex zorunlu.
      const ozUyumluluk = beklenen && canon && canon[1] === 'https://hpanalytic.com/yazi/' + slugHtml + '.html';
      if (ozUyumluluk && !noindexli) U('UYUMLULUK_NOINDEX_MISSING', 'engelli', r);
      else if (!beklenen && noindexli) U('INDEXED_BUT_NOINDEX', 'engelli', r);
    }

    // HP-W1-SITE-001 — ham JSON sözleşmesi: hpa.* şeması ya da gerekçeli izin yoksa engelle.
    if (/\.json$/i.test(r)) {
      const jtxt = readFileSync(f, 'utf8');
      let semali = false;
      try { const v = JSON.parse(jtxt); semali = typeof v?.schema === 'string' && v.schema.startsWith('hpa.'); } catch { semali = false; }
      if (!semali) {
        const gerekce = jsonIzinGerekcesi(r);
        if (!gerekce) U('RAW_JSON_FILE', 'engelli', r);
        else istisnalar.push({ yol: r, gerekce, tespit: 'hpa.* semasiz; izin listesi' });
      }
    }

    // HP-W1-SITE-001 — source map sızıntısı: hem .map dosyası hem sourceMappingURL referansı.
    if (/\.map$/i.test(r)) U('SOURCE_MAP_LEAK', 'engelli', r);
    if (/\.(?:js|css|html)$/i.test(r)) {
      const jtxt = readFileSync(f, 'utf8');
      if (/sourceMappingURL/.test(jtxt)) U('SOURCE_MAP_REF', 'engelli', r);
    }

    // HP-W1-SITE-001 — assets/data yalnızca makine verisi (.json/.svg) içerir;
    // paketlenmiş .html/.md/.csv vb. sayfa veya ham dosya sızıntısı engellenir.
    if (r.startsWith('assets/data/') && /\.(?:html|md|markdown|csv|xlsx|zip|xml)$/i.test(r)) U('DATA_DIR_FILE', 'engelli', r);
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
    const eksik = [...onayli.keys()].filter(s => !uyumluluk.has(s) && !feedler.includes(s));
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
    const eksik = [...onayli.keys()].filter(s => !uyumluluk.has(s) && !smSlugs.includes(s));
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
  // HP-URGENT-SITE-FINAL-047 K2 — zaman damgasından bağımsız deterministik dist damgası:
  // deploy sırasında gerçek dist'ten yeniden hesaplanabilir (eski makbuz/tamper tespiti).
  // Sıralama verify_release_ready.mjs ile birebir aynıdır (yol esaslı artan).
  const distDosyaDamgasi = sha(JSON.stringify(
    manifest.dosyalar.slice().sort((a, b) => (a.yol < b.yol ? -1 : a.yol > b.yol ? 1 : 0))
  ));

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
    tarama: { dosya: dosyalar.length, onayli_makale: onayli.size - uyumluluk.size, yazi_html: yaziHtml.size },
    kontroller, istisnalar,
    build_commit_sha: commitSha,
    ci_run_id: runId,
    dist_manifest_sha256: distDosyaDamgasi,
    artifakt: { release_ready: `release-ready-${runId}`, dist_sha256: `dist-sha256-${runId}` },
    rollback_manifest_sha256: sha(manifestStr)
  };
  if (engel.length) makbuz.engeller = engel;

  // HP-W1-SITE-001 — tek ve açık RELEASE_READY makbuzu (insan onayı olmadan deploy yok).
  const ready = {
    schema: 'hpa.release_ready.v1',
    olusturma: manifest.olusurma,
    ajans_adi: 'Mistral',
    model: 'zai-glm-5-3-flash-vibe-free',
    gorev_id: 'HP-W1-SITE-001',
    release_status: engel.length ? 'BLOKE' : 'RELEASE_READY',
    onay_durumu: engel.length ? 'INSAN_ONAYI_BEKLIYOR' : 'INSAN_ONAYI_BEKLIYOR',
    publication_authorized: false,
    human_approval_required: true,
    engeller: engel,
    istisnalar,
    tarama: makbuz.tarama,
    kontrol_sayisi: kontroller.length,
    build_commit_sha: commitSha,
    ci_run_id: runId,
    dist_manifest_sha256: distDosyaDamgasi,
    artifakt: makbuz.artifakt,
    rollback_manifest_sha256: sha(manifestStr)
  };

  return { makbuz, ready, manifest, engel, istisnalar, kontroller, yaz: (ciktiDizini) => {
    mkdirSync(ciktiDizini, { recursive: true });
    writeFileSync(join(ciktiDizini, 'release-review-receipt.json'), JSON.stringify(makbuz, null, 2) + '\n', 'utf-8');
    writeFileSync(join(ciktiDizini, 'RELEASE_READY.json'), JSON.stringify(ready, null, 2) + '\n', 'utf-8');
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
