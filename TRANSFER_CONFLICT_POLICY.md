# TRANSFER CONFLICT POLICY — HP-MISTRAL-REPO-026

**Kapsam:** Termux/Ubuntu/UserLAnd ortamlarından `Hikmetpinarbas/HPAnalytic.com` reposuna yapılacak modül transferlerinde isim çakışması, sürüm çatışması, bağımlılık eksikliği ve üzerine yazma risklerinin yönetimi.

**Fail-closed ilkesi:** Şüphe varsa transfer BLOKLANIR. Karar insan onayına kalır. Bu politika yayınlama yetkisi vermez; `publication_authorized=false`, `review_required=true` ve `release_status=HOLD` kilitleri transfer sürecince asla değiştirilmez.

---

## 1. Çakışma sınıfları ve varsayılan karar

| Sınıf | Tespit | Varsayılan karar |
|---|---|---|
| C1 — Dosya adı çakışması (hedefte aynı dosya var) | `REPO_TRANSFER_MANIFEST.*.json` → `cakisma.uzerine_yazilanlar` + `scripts/transfer/check_transfer_pr.py` diff taraması | **BLOK.** Üzerine yazma; ya yeni dosya adı ya açık insan onayı. Mevcut çalışan modül asla kaldırılmaz. |
| C2 — Sınıf/fonksiyon adı çakışması (içe aktarma yolu) | `validate_manifest.py` + Python içe aktarma dumanı testi | **BLOK.** Yeni modül ad alanına taşınır (ör. `derive/<modul>_v2.py`), eski davranış korunur. |
| C3 — Çift nesil paralellik (`hpa-pipeline-v3` ↔ `pipeline/`) | `REPO_MODULE_MAP.json` notları | **İzinli, belgelenmek şartıyla.** v3 hedef nesil; `pipeline/` eski nesil. Birleştirme kararı sahibinindir; transfer ikisini birleştirmeye kalkmaz. |
| C4 — Bağımlılık sürüm çatışması (pandas/openpyxl/d3/vite) | `DEPENDENCY_MATRIX.json` + `pip check` + `npm ls` | **needs-review.** Sürüm farkı repoda çalışan şeyle uyumluysa izinli; node tarafında her iki sürüm `package.json`'a tek girişle girer. |
| C5 — Eksik bağımlılık | manifest `bagimliliklar.eksik` + dışa aktarma dumanı | **BLOK.** Eksik liste boş bırakılamaz; giderilmeden birleştirilmez. |
| C6 — Veri sözleşmesi çatışması (yeni şema ↔ `docs/VERI-SOZLESMESI.json`) | şema doğrulama | **BLOK.** Yeni sözleşme ayrı dosya girer (`docs/VERI-SOZLESMESI-<modul>.json`); mevcut sözleşme değiştirilmez. |
| C7 — Görsel/makale kanıt çakışması (kaynaksız çıktı) | `ORCHESTRATION/GORSEL_KATALOG.md` izlenebilirlik | **BLOK.** Kaynağı izlenemeyen görsel/istatistik repoya girmez. |

## 2. Sürüm durumu

- Manifest `cakisma.surum` alanı modül sürümünü taşır; repodaki hedef aynı adla varsa `cakisma.isim_cakismasi=true` zorunludur.
- Aynı modülün ikinci transferi: yeni PR, yeni manifest; önceki manifest **silinebilir değil**, yeni sürüm manifest'inde `cakisma.uzerine_yazilanlar` içine önceki transfer kimliği yazılır.
- Termux tarafı (OpenCode Mobil Pro) sürüm ve taşınabilirlik düzenlemesini yürütür; repo tarafı kendi başına sürüm yükseltmez.

## 3. Yol ve ortam çatışmaları

- Kodda sabit `/data/data/com.termux/...`, `/storage/emulated/...`, `/sdcard/...` yolu **yasaktır**; istisna yalnızca dokümandaki örnek (`yol_duzenlemesi: dokuman-ornegi`) ve manifest'in `kaynak.orijinal_yol` alanı.
- Tüm yol çözümlemesi `hpa-pipeline-v3/paths.py` + `HPA_*` ortam değişkenleri üzerinden yapılır (bkz. `DEPENDENCY_MATRIX.json` → `portable_config`).
- Shell betiklerinde `TERMUX_PREFIX`/cihaza özgü ön ekler `${HPA_*:-varsayılan}` biçimine çevrilir.

## 4. Otomatik tespit yüzeyleri

| Kontrol | Araç |
|---|---|
| Diff tabanlı allow/deny, gizli bilgi, cihaz yolu, bozuk bağlantı | `scripts/transfer/check_transfer_pr.py` |
| Manifest şema + kurallar + SHA formatı | `scripts/transfer/validate_manifest.py` |
| Manifest üretimi + gerçek SHA-256 | `scripts/transfer/generate_transfer_manifest.py` |
| CI gate (PR'larda) | `.github/workflows/transfer-gate.yml` |

## 5. Kabul sırası (her transfer PR'ı)

1. `scripts/transfer/check_transfer_pr.py` yeşil (allowlist, denylist, gizli bilgi, cihaz yolu).
2. `scripts/transfer/validate_manifest.py REPO_TRANSFER_MANIFEST.<modul>.json` yeşil ve SHA-256 `--verify` eşleşir.
3. Modül testi + regresyon seti yeşil; `npm run build` bozulmamış.
4. `TRANSFER_ACCEPTANCE_REPORT.json` güncellenmiş; test kayıtları gerçek.
5. İnsan onayı (draft PR → ready-for-review kararın sahibinindir; merge ve canlı deploy yapılmaz).
