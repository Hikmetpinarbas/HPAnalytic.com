// HP-URGENT-SITE-FINAL-047 K2 — RELEASE_READY makbuzunun commit/CI-run/dist-manifesi/artefakt
// bağlama pozitif + negatif testleri (sentetik makbuz + dist fikstürü).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const kok = join(dirname(fileURLToPath(import.meta.url)), '..');
const sha = t => createHash('sha256').update(t).digest('hex');

const KOK_SAHTA = '<!doctype html><html><head><link rel="canonical" href="https://hpanalytic.com/yazi/ormek-yazi.html"/><title>t</title></head><body>x</body></html>';
const MD = '# Ornek\n\nGovde icerigi.\n';

function makbuzuYaz(ortam, sonuc) {
  mkdirSync(join(ortam, 'release-review'), { recursive: true });
  writeFileSync(join(ortam, 'release-review/RELEASE_READY.json'), JSON.stringify(sonuc.ready, null, 2));
  writeFileSync(join(ortam, 'release-review/rollback-manifest.json'), JSON.stringify(sonuc.manifest, null, 2) + '\n');
}

function ortamKur(distEk = {}) {
  const ortam = mkdtempSync(join(tmpdir(), 'hpa-ready-'));
  const d = join(ortam, 'dist');
  mkdirSync(join(d, 'yazi'), { recursive: true });
  mkdirSync(join(ortam, 'content/yazilar'), { recursive: true });
  writeFileSync(join(ortam, 'content/yazilar/ormek-yazi.md'), MD);
  writeFileSync(join(ortam, 'content/yayin-defteri.json'), JSON.stringify({
    schema: 'hpa.publication_ledger.v1',
    entries: [{ slug: 'ormek-yazi', source: 'ormek-yazi.md', source_sha256: sha(MD), basis: 'LIVE_BASELINE', status: 'published' }]
  }));
  writeFileSync(join(ortam, 'content/yayin-adaylari.json'), JSON.stringify({
    schema: 'hpa.yayin_adaylari.v1',
    inceleme_adaylari: []
  }));
  writeFileSync(join(d, 'yazi/ormek-yazi.html'), KOK_SAHTA);
  writeFileSync(join(d, 'feed.xml'), '<?xml version="1.0"?><rss><channel><item><link>https://hpanalytic.com/yazi/ormek-yazi.html</link></item></channel></rss>');
  writeFileSync(join(d, 'sitemap.xml'), '<?xml version="1.0"?><urlset><url><loc>https://hpanalytic.com/yazi/ormek-yazi.html</loc></url></urlset>');
  for (const [yol, icerik] of Object.entries(distEk)) {
    const hedef = join(d, yol);
    mkdirSync(join(hedef, '..'), { recursive: true });
    writeFileSync(hedef, icerik);
  }
  return ortam;
}

test('K2 pozitif: makbuz gerçek commit, CI run ve dist manifest damgasıyla doğrulanır', async () => {
  const ortam = ortamKur();
  try {
    const { denetle } = await import('../scripts/release/review_audit.mjs');
    const sonuc = denetle(ortam, 'dist', { commitSha: 'a'.repeat(40), runId: '777' });
    makbuzuYaz(ortam, sonuc);
    assert.equal(sonuc.engel.length, 0, sonuc.engel.join('|'));
    const ready = sonuc.ready;
    assert.equal(ready.build_commit_sha, 'a'.repeat(40));
    assert.equal(String(ready.ci_run_id), '777');
    assert.ok(/^[a-f0-9]{64}$/.test(ready.dist_manifest_sha256), 'DIST_MANIFEST_DAMGASI_YOK');
    assert.equal(ready.artifakt.release_ready, 'release-ready-777');

    const { dogrulaSatirBasi } = await import('../scripts/release/verify_release_ready.mjs');
    mkdirSync(join(ortam, 'release-review'), { recursive: true });
    writeFileSync(join(ortam, 'release-review/RELEASE_READY.json'), JSON.stringify(ready, null, 2));
    // dogrulaSatirBasi: dist manifestini ortam dist'ten yeniden hesaplar.
    const damga1 = (await import('../scripts/release/verify_release_ready.mjs')).distDosyaDamgasi(ortam, 'dist');
    assert.equal(ready.dist_manifest_sha256, damga1, 'DAMGA_REVIEW_AUDIT_FARKLI');
    dogrulaSatirBasi(ortam, 'dist', 'release-review/RELEASE_READY.json', 'a'.repeat(40), '777');
  } finally {
    rmSync(ortam, { recursive: true, force: true });
  }
});

test('K2 negatif: yanlış commit reddedilir', async () => {
  const ortam = ortamKur();
  try {
    const { denetle } = await import('../scripts/release/review_audit.mjs');
    const sonuc = denetle(ortam, 'dist', { commitSha: 'a'.repeat(40), runId: '777' });
    makbuzuYaz(ortam, sonuc);
    const { dogrulaSatirBasi } = await import('../scripts/release/verify_release_ready.mjs');
    assert.throws(
      () => dogrulaSatirBasi(ortam, 'dist', 'release-review/RELEASE_READY.json', 'b'.repeat(40), '777'),
      /COMMIT_UYUMSUZ/
    );
  } finally {
    rmSync(ortam, { recursive: true, force: true });
  }
});

test('K2 negatif: değiştirilmiş payload (dist bir bayt değişir) reddedilir', async () => {
  const ortam = ortamKur();
  try {
    const { denetle } = await import('../scripts/release/review_audit.mjs');
    const sonuc = denetle(ortam, 'dist', { commitSha: 'c'.repeat(40), runId: '777' });
    makbuzuYaz(ortam, sonuc);
    // Yayın sonrası payload'a sızdırılmış ek dosya:
    writeFileSync(join(ortam, 'dist/yazi/ormek-yazi.html'), KOK_SAHTA + '\n<!-- islenmis -->');
    const { dogrulaSatirBasi } = await import('../scripts/release/verify_release_ready.mjs');
    assert.throws(
      () => dogrulaSatirBasi(ortam, 'dist', 'release-review/RELEASE_READY.json', 'c'.repeat(40), '777'),
      /MANIFEST_UYUMSUZ/
    );
  } finally {
    rmSync(ortam, { recursive: true, force: true });
  }
});

test('K2 negatif: eski makbuz reddedilir', async () => {
  const ortam = ortamKur();
  try {
    const { denetle } = await import('../scripts/release/review_audit.mjs');
    const sonuc = denetle(ortam, 'dist', { commitSha: 'd'.repeat(40), runId: '777' });
    const eski = { ...sonuc.ready, olusturma: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString() };
    makbuzuYaz(ortam, sonuc);
    writeFileSync(join(ortam, 'release-review/RELEASE_READY.json'), JSON.stringify(eski, null, 2));
    const { dogrulaSatirBasi } = await import('../scripts/release/verify_release_ready.mjs');
    assert.throws(
      () => dogrulaSatirBasi(ortam, 'dist', 'release-review/RELEASE_READY.json', 'd'.repeat(40), '777'),
      /MAKBUZ_ESKI/
    );
  } finally {
    rmSync(ortam, { recursive: true, force: true });
  }
});

test('K2 negatif: uyumsuz CI run kimliği reddedilir', async () => {
  const ortam = ortamKur();
  try {
    const { denetle } = await import('../scripts/release/review_audit.mjs');
    const sonuc = denetle(ortam, 'dist', { commitSha: 'e'.repeat(40), runId: '777' });
    makbuzuYaz(ortam, sonuc);
    const { dogrulaSatirBasi } = await import('../scripts/release/verify_release_ready.mjs');
    assert.throws(
      () => dogrulaSatirBasi(ortam, 'dist', 'release-review/RELEASE_READY.json', 'e'.repeat(40), '888'),
      /CI_RUN_UYUMSUZ/
    );
  } finally {
    rmSync(ortam, { recursive: true, force: true });
  }
});

test('K2: RELEASE_READY insan onay kilidini taşır (publication_authorized=false)', async () => {
  const ortam = ortamKur();
  try {
    const { denetle } = await import('../scripts/release/review_audit.mjs');
    const sonuc = denetle(ortam, 'dist', { commitSha: 'f'.repeat(40), runId: '777' });
    assert.equal(sonuc.ready.publication_authorized, false);
    assert.equal(sonuc.ready.human_approval_required, true);
    assert.equal(sonuc.ready.release_status, 'RELEASE_READY');
  } finally {
    rmSync(ortam, { recursive: true, force: true });
  }
});
