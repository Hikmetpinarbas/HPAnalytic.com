// HP-URGENT-SITE-FINAL-047 K2 — RELEASE_READY makbuzunun commit, CI run, dist manifesti ve
// artifakta bağlanması. Deploy öncesi fail-closed doğrulama: yaln dosya varlığı veya makbuz metni
// yeterli değildir; dist manifesti gerçek dist içeriğinden yeniden hesaplanır.
//
// Kullanım:
//   node scripts/release/verify_release_ready.mjs <makbuzYolu> <distDir> <beklenenCommit> [beklenenRunId] [maxYasGun]
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, lstatSync, existsSync } from 'node:fs';
import { join, resolve, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const sha = s => createHash('sha256').update(s).digest('hex');
const RED = v => { throw new Error(v); };

// review_audit.mjs ile aynı deterministik damga: sıralı (yol, sha256, boyut) girdileri.
export function distDosyaDamgasi(root, distDir) {
  const dist = resolve(root, distDir);
  if (!existsSync(dist)) RED('DIST_MISSING');
  const out = [];
  const stack = [dist];
  while (stack.length) {
    const dir = stack.pop();
    for (const name of readdirSync(dir)) {
      const f = join(dir, name);
      const st = lstatSync(f);
      if (st.isSymbolicLink()) RED('DIST_SYMLINK');
      if (st.isDirectory()) stack.push(f);
      else if (st.isFile()) {
        const boyut = st.size;
        out.push({ yol: relative(dist, f).split(sep).join('/'), sha256: sha(readFileSync(f)), boyut });
      } else RED('DIST_SPECIAL_FILE');
    }
  }
  out.sort((a, b) => (a.yol < b.yol ? -1 : a.yol > b.yol ? 1 : 0));
  return sha(JSON.stringify(out));
}

export function dogrulaSatirBasi(root = '.', distDir = 'dist', makbuzYolu, beklenenCommit, beklenenRunId = null, agirliklar = {}) {
  const { maxAgeMs = 14 * 24 * 60 * 60 * 1000, simdi = new Date() } = agirliklar;
  const tamYol = resolve(root, makbuzYolu);
  if (!existsSync(tamYol)) RED('MAKBUZ_YOK:' + makbuzYolu);

  let makbuz;
  try { makbuz = JSON.parse(readFileSync(tamYol, 'utf8')); }
  catch { RED('MAKBUZ_OKUNAMADI'); }

  if (makbuz?.schema !== 'hpa.release_ready.v1') RED('MAKBUZ_SEMASI:' + makbuz?.schema);
  if (makbuz.release_status !== 'RELEASE_READY') RED('DEPLOY_BLOKE:' + makbuz.release_status);
  if (makbuz.publication_authorized !== false || makbuz.human_approval_required !== true) RED('ONAY_PROTOKOLU_IHLALI');
  if (Array.isArray(makbuz.engeller) && makbuz.engeller.length) RED('MAKBUZ_ENGELLER:' + makbuz.engeller.join('|'));

  // K2 — dist manifesti gerçek dist içeriğinden yeniden hesaplanır: değiştirilmiş payload,
  // eski makbuz ve manifest uyuşmazlığı burada yakalanır.
  if (!/^[a-f0-9]{64}$/.test(makbuz.dist_manifest_sha256 || '')) RED('DIST_MANIFEST_EKSIK');
  const guncelDamga = distDosyaDamgasi(root, distDir);
  if (guncelDamga !== makbuz.dist_manifest_sha256) {
    RED('MANIFEST_UYUMSUZ:dist=' + guncelDamga.slice(0, 12));
  }
  if (/^[a-f0-9]{64}$/.test(makbuz.rollback_manifest_sha256 || '') && makbuz.rollback_manifest_sha256 !== makbuz.dist_manifest_sha256) {
    const kayitliManifest = join(resolve(root, makbuzYolu), '..', 'rollback-manifest.json');
    let kayitli = null;
    try { kayitli = JSON.parse(readFileSync(kayitliManifest, 'utf8')); } catch { kayitli = null; }
    const kayitliDamga = kayitli ? sha(JSON.stringify((kayitli.dosyalar || []).slice().sort((a, b) => (a.yol < b.yol ? -1 : a.yol > b.yol ? 1 : 0)).map(d => ({ yol: d.yol, sha256: d.sha256, boyut: d.boyut })))) : null;
    if (kayitliDamga !== makbuz.dist_manifest_sha256) RED('MANIFEST_UYUMSUZ:dist=' + guncelDamga.slice(0, 12));
  }

  // K2 — kabul edilen commit ile yayımlanacak artefakt aynı olmalı.
  if (makbuz.build_commit_sha !== beklenenCommit) {
    RED('COMMIT_UYUMSUZ:makbuz=' + makbuz.build_commit_sha + ' beklenen=' + beklenenCommit);
  }
  if (beklenenRunId !== null && String(makbuz.ci_run_id) !== String(beklenenRunId)) {
    RED('CI_RUN_UYUMSUZ:makbuz=' + makbuz.ci_run_id + ' beklenen=' + beklenenRunId);
  }
  if (!makbuz.artifakt || makbuz.artifakt.release_ready !== `release-ready-${makbuz.ci_run_id}`) {
    RED('ARTIFAKT_KIMLIK_EKSIK');
  }

  // K2 — eski makbuz: olusturma yaşı sınırlıdır.
  if (makbuz.olusturma && Date.parse(makbuz.olusturma) &&
      (simdi.getTime() - Date.parse(makbuz.olusturma)) > maxAgeMs) {
    RED('MAKBUZ_ESKI:' + makbuz.olusturma);
  }
  return {
    commit: makbuz.build_commit_sha,
    runId: makbuz.ci_run_id,
    dist_manifest_sha256: makbuz.dist_manifest_sha256,
    artifakt: makbuz.artifakt
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [makbuzYolu, distDir, beklenenCommit, beklenenRunId, maxYas] = process.argv.slice(2);
  if (!makbuzYolu || !distDir || !beklenenCommit) {
    console.error('KULLANIM: verify_release_ready.mjs <makbuzYolu> <distDir> <beklenenCommit> [beklenenRunId] [maxYasGun]');
    process.exitCode = 1;
  } else {
    try {
      const sonuc = dogrulaSatirBasi('.', distDir, makbuzYolu, beklenenCommit, beklenenRunId ?? null,
        maxYas ? { maxAgeMs: Number(maxYas) * 24 * 60 * 60 * 1000 } : {});
      console.log('RELEASE_READY_DOGRULANDI: commit=' + sonuc.commit.slice(0, 12) + ' run=' + sonuc.runId + ' artefakt=' + sonuc.artifakt.release_ready);
    } catch (e) {
      console.error('RELEASE_READY_DOGRULAMA_HATASI:' + e.message);
      process.exitCode = 1;
    }
  }
}
