// HP-URGENT-SITE-FINAL-047 K5 — deploy otomatik yayın riski ve insan onay kilidi testleri.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const kok = join(dirname(fileURLToPath(import.meta.url)), '..');
const deploy = readFileSync(join(kok, '.github/workflows/deploy.yml'), 'utf8');

test('K5: deploy.yml push tetikleyicisi yoktur (birleşme auto-deploy başlatamaz)', () => {
  assert.ok(!/\bpush\s*:/.test(deploy), 'PUSH_TETIKLEYICI_KALDI');
});

test('K5: deploy yalnızca explicit release_approved=true manuel onayıyla çalışır', () => {
  assert.match(deploy, /workflow_dispatch\s*:/);
  assert.match(deploy, /release_approved\s*:/);
  assert.match(deploy, /default\s*:\s*false/);
  const ifler = [...deploy.matchAll(/if:\s*\$\{\{[^}]+\}\}/g)].map(m => m[0]);
  assert.ok(ifler.some(i => i.includes('inputs.release_approved == true')), 'ONAY_KAPISI_YOK');
  assert.ok(ifler.some(i => i.includes("refs/heads/main")), 'MAIN_KOSULU_YOK');
});

test('K5: deploy bertarafında üç bağımsız kapı zorunlu (güvenlik kapısı + review audit + makbuz doğrulama)', () => {
  assert.match(deploy, /release-security-gate\.mjs/);
  assert.match(deploy, /review_audit\.mjs/);
  assert.match(deploy, /verify_release_ready\.mjs/);
});

test('K5: yayından önce RELEASE_READY makbuzu dist manifestiyle bağlanır (yaln dosya varlığı değil)', () => {
  assert.match(deploy, /verify_release_ready\.mjs release-review\/RELEASE_READY\.json dist \$\{\{ github\.sha \}\}/);
  assert.match(deploy, /\$\{\{ github\.run_id \}\}/);
});

test('K5: deploy bertaraf izinleri yaln Pages ve gerekli kimlik taşır (otomatik yetki genişletme yok)', () => {
  assert.match(deploy, /pages:\s*write/);
  assert.match(deploy, /id-token:\s*write/);
  assert.match(deploy, /contents:\s*read/);
});
