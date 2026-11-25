// HP-MISTRAL-RELEASE-030 — review_audit.mjs unit testleri (sentetik dist fixture).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { denetle } from '../scripts/release/review_audit.mjs';

const sha256 = t => createHash('sha256').update(t).digest('hex');
const MD = '# Ornek\n\nGovde icerigi.\n';
const LEDGER = {
  schema: 'hpa.publication_ledger.v1',
  entries: [{ slug: 'ormek-yazi', source: 'ormek-yazi.md', source_sha256: sha256(MD), basis: 'LIVE_BASELINE', status: 'published' }]
};
const SAYFA = `<!doctype html><html><head><link rel="canonical" href="https://hpanalytic.com/yazi/ormek-yazi.html"/><title>t</title></head><body>x</body></html>`;

function ortamKur(dist) {
  const kok = mkdtempSync(join(tmpdir(), 'hpa-audit-'));
  mkdirSync(join(kok, 'content/yazilar'), { recursive: true });
  writeFileSync(join(kok, 'content/yazilar/ormek-yazi.md'), MD);
  writeFileSync(join(kok, 'content/yayin-defteri.json'), JSON.stringify(LEDGER));
  writeFileSync(join(kok, 'content/yayin-adaylari.json'), JSON.stringify({ schema: 'hpa.yayin_adaylari.v1', inceleme_adaylari: [] }));
  const d = join(kok, 'dist');
  for (const [yol, icerik] of dist) {
    const hedef = join(d, yol);
    mkdirSync(join(hedef, '..'), { recursive: true });
    writeFileSync(hedef, icerik);
  }
  return kok;
}
function temizDist(ek = []) {
  return [
    ['yazi/ormek-yazi.html', SAYFA],
    ['feed.xml', `<?xml version="1.0"?><rss><channel><item><link>https://hpanalytic.com/yazi/ormek-yazi.html</link></item></channel></rss>`],
    ['sitemap.xml', `<?xml version="1.0"?><urlset><url><loc>https://hpanalytic.com/yazi/ormek-yazi.html</loc></url></urlset>`],
    ...ek
  ];
}

test('temiz dist: denetim gecer, makbuz kilitleri dogru', () => {
  const kok = ortamKur(temizDist());
  const { makbuz, engel } = denetle(kok);
  assert.equal(engel.length, 0);
  assert.equal(makbuz.publication_authorized, false);
  assert.equal(makbuz.review_required, true);
  assert.equal(makbuz.release_status, 'IZIN');
  assert.equal(makbuz.tarama.onayli_makale, 1);
  assert.match(makbuz.rollback_manifest_sha256, /^[a-f0-9]{64}$/);
  rmSync(kok, { recursive: true, force: true });
});

test('onaylanmamis yazi html engellenir (UNAPPROVED_HTML)', () => {
  const kok = ortamKur(temizDist([['yazi/izinsiz.html', SAYFA.replace('ormek-yazi', 'izinsiz')]]));
  const { engel } = denetle(kok);
  assert.ok(engel.some(e => e.startsWith('UNAPPROVED_HTML')));
  rmSync(kok, { recursive: true, force: true });
});

test('.bak dosyasi ve hazine yolu engellenir (SENSITIVE_FILE)', () => {
  const kok = ortamKur(temizDist([
    ['yazi/ormek-yazi.html.bak.1', 'x'],
    ['hazine/veri_beyni/a.csv', 'a,b']
  ]));
  const { engel } = denetle(kok);
  assert.ok(engel.some(e => e.startsWith('SENSITIVE_FILE')));
  rmSync(kok, { recursive: true, force: true });
});

test('istisna disi ham CSV engellenir, istisnali CSV kayda gecer', () => {
  const kok = ortamKur(temizDist([
    ['assets/data/gs-stuttgart/players.csv', 'a,b'],
    ['assets/data/yeni-mac/players.csv', 'a,b']
  ]));
  const { engel, istisnalar } = denetle(kok);
  assert.ok(engel.some(e => e.startsWith('RAW_DATA_FILE')));
  assert.ok(istisnalar.some(i => i.yol === 'assets/data/gs-stuttgart/players.csv'));
  rmSync(kok, { recursive: true, force: true });
});

test('source map sizintisi engellenir (SOURCE_MAP_LEAK)', () => {
  const kok = ortamKur(temizDist([['assets/js/bundle.js.map', '{}']]));
  const { engel } = denetle(kok);
  assert.ok(engel.some(e => e.startsWith('SOURCE_MAP_LEAK')));
  rmSync(kok, { recursive: true, force: true });
});

test('feed ledger ile tutarsizsa engellenir (FEED_UNAPPROVED / MISMATCH)', () => {
  const kok = ortamKur(temizDist([['feed.xml', `<rss><channel><item><link>https://hpanalytic.com/yazi/ormek-yazi.html</link></item><item><link>https://hpanalytic.com/yazi/baskasi.html</link></item></channel></rss>`]]));
  const { engel } = denetle(kok);
  assert.ok(engel.some(e => e.startsWith('FEED_UNAPPROVED')));
  rmSync(kok, { recursive: true, force: true });
});

test('sitemap eksikse SITEMAP_MISSING', () => {
  const kok = ortamKur(temizDist().filter(([y]) => y !== 'sitemap.xml'));
  const { engel } = denetle(kok);
  assert.ok(engel.some(e => e.startsWith('SITEMAP_MISSING')));
  rmSync(kok, { recursive: true, force: true });
});

test('canonical etiketi olmayan sayfa engellenir (CANONICAL_MISSING)', () => {
  const kok = ortamKur(temizDist([['yazi/ormek-yazi.html', '<!doctype html><html><head><title>t</title></head><body>x</body></html>']]));
  const { engel } = denetle(kok);
  assert.ok(engel.some(e => e.startsWith('CANONICAL_MISSING')));
  rmSync(kok, { recursive: true, force: true });
});

test('kaynak md hash\'i kayarsa SOURCE_HASH_DRIFT', () => {
  const kok = ortamKur(temizDist());
  writeFileSync(join(kok, 'content/yazilar/ormek-yazi.md'), MD + 'ek-satir\n');
  const { engel } = denetle(kok);
  assert.ok(engel.some(e => e.includes('SOURCE_HASH_DRIFT')));
  rmSync(kok, { recursive: true, force: true });
});

test('gizli bilgi sizintisi engellenir (CREDENTIAL_LEAK)', () => {
  const kok = ortamKur(temizDist([['assets/js/app.js', 'const k="sk-proj-abc123def456ghi789";']])); // hpa:allow-path: test fixture, gerçek sır değildir
  const { engel } = denetle(kok);
  assert.ok(engel.some(e => e.startsWith('CREDENTIAL_LEAK')));
  rmSync(kok, { recursive: true, force: true });
});

test('noindex aday sitemap\'a girmemeli (NOINDEX_IN_SITEMAP)', async () => {
  const kok = ortamKur(temizDist());
  const aday = { schema: 'hpa.yayin_adaylari.v1', inceleme_adaylari: [{ slug: 'ormek-yazi', durum: 'incelemede', noindex: true }] };
  writeFileSync(join(kok, 'content/yayin-adaylari.json'), JSON.stringify(aday));
  const { engel } = denetle(kok);
  assert.ok(engel.some(e => e.startsWith('NOINDEX_IN_SITEMAP')));
  rmSync(kok, { recursive: true, force: true });
});
