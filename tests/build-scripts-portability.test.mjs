// HP-W1-SITE-001 — ham veri pipeline taranabilirlik regresyonu.
// Cihaz yolu cozumlemeleri kalici olarak --src/--out CLI parametrelerine tasinmali;
// hpa:allow-path imleci bu uc script'te bir cozum olarak kabul edilmez.
// Desenler check_transfer_pr.py'den (tek dogruluk kaynagi) cikarilir; bu dosyada tekrarlanmaz.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const kok = join(dirname(fileURLToPath(import.meta.url)), '..');

function cihazYoluDesenleri() {
  const kaynak = readFileSync(join(kok, 'scripts/transfer/check_transfer_pr.py'), 'utf8');
  const blok = kaynak.split('CIHAZ_YOLU_ORMUNTULERI = (')[1].split(')')[0];
  const desenler = Array.from(blok.matchAll(/"([^"]+)"/g), m => m[1]);
  assert.ok(desenler.length >= 3, 'cihaz yolu desenleri cikarilamadi');
  return desenler;
}

const CIHAZ_YOLU_ORMUNTULERI = cihazYoluDesenleri();
const SCRIPTLER = [
  'scripts/build_gk_data.py',
  'scripts/build_pass_network.py',
  'scripts/trace_event.py',
];

for (const yol of SCRIPTLER) {
  const metin = readFileSync(join(kok, yol), 'utf8');
  const satirlar = metin.split('\n');

  test(`${yol}: cihaz yolu cozumlemesi yok (clamp yok, --src ile cozulur)`, () => {
    for (let i = 0; i < satirlar.length; i++) {
      for (const desen of CIHAZ_YOLU_ORMUNTULERI) {
        assert.ok(!satirlar[i].includes(desen), `${yol}:${i + 1} cihaz yolu iceriyor: ${desen}`);
      }
    }
  });

  test(`${yol}: hpa:allow-path imleci kullanilmamis`, () => {
    for (let i = 0; i < satirlar.length; i++) {
      assert.ok(!satirlar[i].includes('hpa:allow-path'), `${yol}:${i + 1} clamp imleci tasıyor`);
    }
  });

  test(`${yol}: --src parametresi bulunuyor`, () => {
    assert.ok(satirlar.some(s => s.includes("'--src'") || s.includes('"--src"')), `${yol} --src desteklemiyor`);
  });
}
