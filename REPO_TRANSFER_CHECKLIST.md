# REPO TRANSFER CHECKLIST — HP-REPO-TRANSFER-MISTRAL-001

**Durum:** Hazırlık tamamlandı. Hiçbir üretim modülü bu dalda repoya taşınmadı.
**Bu dal:** `vibe/repo-transfer-prep-3b9c33` — yalnızca 3 hazırlık dosyası içerir.
**Yasak:** main'e push, merge, deploy. (PR #100 disiplini korunur.)

---

## A. Yapılan hazırlık (bu dalda)

- [x] Repo yapısı (`main`) incelendi: `hpa-pipeline-v3/`, `pipeline/`, `src/`, `scripts/`, `content/`, `ORCHESTRATION/`, `docs/`, `test(s)/`.
- [x] `.gitignore` (11 satır) ve `package.json` (Vite + esbuild, `npm run build` = build-yazi.mjs + vite) incelendi.
- [x] PR #100 incelendi: release security gate, fail-closed deploy, raw-CSV ve credential taraması. Transfer politikası buna hizalandı.
- [x] Mevcut eşdeğer klasörler eşleştirildi → `REPO_TRANSFER_PLAN.md` §1.
- [x] Hedef yollar önerildi → `REPO_TRANSFER_PLAN.md` §2.
- [x] Allowlist/denylist oluşturuldu → `REPO_TRANSFER_ALLOWLIST.json`.
- [x] Termux mutlak yol dönüşüm planı → `REPO_TRANSFER_PLAN.md` §4. Kanıt: `hpa-pipeline-v3/reconcile/run_reconcile.py:58` ve 30+ dosyada `/data/data/com.termux/...`.
- [x] Modül başına ön koşullar → `REPO_TRANSFER_PLAN.md` §5.

## B. Her transfer PR'ı için kontrol listesi (ilgili modül geldiğinde)

### 1. Kapsam
- [ ] Tek modül → tek PR. Birden fazla modül karıştırılmaz.
- [ ] Dosyalar sadece allowlist desenleriyle eşleşiyor (`REPO_TRANSFER_ALLOWLIST.json`).
- [ ] Denylist dosyası yok; `*.bak*`, `debug_*`, `probe*`, ham CSV/XML/XLSX, video, cache repoya girmedi.
- [ ] `must_not_contain` taraması temiz (secret, token, e-posta, Termux yolu kodda).

### 2. Termux portability
- [ ] Yeni kodda sabit `/data/data/com.termux/...` yolu yok; `hpa-pipeline-v3/paths.py` (veya mevcut config) kullanılıyor.
- [ ] `export HPA_DATA_ROOT=...` ile hem Termux hem sandbox'ta çalışıyor.
- [ ] Kontrol: `grep -rI '/data/data/com.termux' hpa-pipeline-v3/ scripts/` → yeni satır yok.

### 3. Test ve sözleşme
- [ ] Modülün birim testi repo test kalıbında (`hpa-pipeline-v3/tests/test_<modul>.py`) ve deterministik fixture kullanıyor (ham veri repoda değil).
- [ ] Veri sözleşmesi `docs/VERI-SOZLESMESI-*.json` şemasıyla uyumlu; türetilmiş checksum/index repoya giriyorsa PR'da gerekçelendirilmiş.
- [ ] Hesaplama mantığı değiştirilmedi; sadece ekleme var. Mevcut metrik tanımları sabit.

### 4. Build ve yayın
- [ ] `npm run build` bozulmadı (yazı hattı + vite).
- [ ] PR #100 gate'ine aykırı içerik yok (unapproved HTML, raw CSV, hidden dosya, credential imzası).
- [ ] Deploy yetkisi istenmedi; merge sadece owner kararı.

### 5. İnsan onayı
- [ ] Yazar (Hikmet) modülün "doğrulanmış üretim" statüsünü PR açıklamasında teyit etti.
- [ ] Araştırma notu/draft tamamlanmamış içerik olarak eklenmedi (`content/_yeni_yazilar*` repoda kalmıyor).

## C. Bilinen eksik / sonraki adımlar

- [ ] `.gitignore` genişletmesi (denylist desenleri repo tarafına) — ilk transfer PR'ında eklenecek (bu görevde kapsam dışı).
- [ ] `paths.py` modülü henüz repoda yok — ilk boru hattı transfer PR'ının parçası olacak.
- [ ] Allowlist otomatik kontrol scripti (PR check) — ilk transferden önce yazılmalı.
- [ ] Telefondaki modüllerin v3 ↔ eski `pipeline/` birleştirme kararı sahipte alınmadı.

---
*Referanslar: `REPO_TRANSFER_PLAN.md`, `REPO_TRANSFER_ALLOWLIST.json`, PR #100, `docs/VERI-SOZLESMESI.md`, `hpa-pipeline-v3/README.md`.*
