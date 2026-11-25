# REPO TRANSFER PLAN — HP-REPO-TRANSFER-MISTRAL-001

**Amaç:** Telefondaki (Termux/Userland) doğrulanmış üretim modüllerinin `Hikmetpinarbas/HPAnalytic.com` reposuna kontrollü aktarımı için **yalnızca hazırlık**. Bu plan herhangi bir modülü bugün repoya taşımaz.

**Kapsam dışı (bu görevde yapılmayacak):** Hot cluster verisinin kopyalanması, token/anahtar aktarımı, yeni build sistemi, yeni matematik motoru, deploy.

**Referans güvenlik bağlamı:** PR #100 (`fix/manual-pages-release-gate-20261123`) — release security gate, fail-closed yayın kapısı. Transfer politikası bu yaklaşımın gerisinde kalmalıdır: raw CSV/XML girişi repoya girmez, sadece türetilmiş ve onaylı çıktılar girer.

---

## 1. Mevcut eşdeğer klasör envanteri

| Telefondaki modül | Repoda mevcut eşdeğer | Durum |
|---|---|---|
| Bilimsel veri boru hattı | `hpa-pipeline-v3/` (ingest, reconcile, derive, export), `pipeline/` (eski nesil: core, derive, insight, lille-gs) | İki paralel nesil var; v3 hedef alınmalı, `pipeline/` birleştirme kararı sonraya bırakılır |
| Matematiksel model motorları | `hpa-pipeline-v3/derive/` (pressure, four_phases, radar), `pipeline/derive/` (xt, xg_flow), `pipeline/core/model.py` | Mevcut; ek motörler ayrı alt klasörle gelir |
| Görsel fabrika | `scripts/build_viz_bundle.py`, `src/visuals/`, `src/charts/`, `ORCHESTRATION/GORSEL_KATALOG.md`, `ORCHESTRATION/VIZ_STANDART_SOZLESMESI.md` | Mevcut; önerilen hedef `src/visual_factory/` yerine **yok** — mevcut `scripts/` + `src/visuals/` genişletilmeli, yeni üst düzey klasör açılmamalı |
| Editoryal motor | `scripts/build-yazi.mjs`, `content/yazilar/`, `ORCHESTRATION/EDITORYEL_DIL_SOZLESMESI.md` | Mevcut ve build hattına bağlı (`npm run build`) |
| Merkezi üretim koordinatörü | `ORCHESTRATION/` (agents.json, SITE_KOORDINATOR_TALIMAT.md, sözleşme dosyaları) | Mevcut; koordinatör manifestosu buraya eklenir |
| Testler ve veri sözleşmeleri | `tests/`, `test/`, `hpa-pipeline-v3/tests/`, `docs/VERI-SOZLESMESI.{md,json}`, `docs/LILLE-GS-SCHEMA.json` | Mevcut; modül testleri `hpa-pipeline-v3/tests/` kalıbını izler |

**Kural:** Repo üst düzey klasör yapısı **genişletilmez**. Gelen modüller mevcut eşdeğerlerin altına alt klasör olarak girer. Bu, `docs/VERI-KAYNAK-KURALI.md` ve PR #100 gate kurallarıyla uyumludur.

## 2. Önerilen hedef yollar

| Taşınan artefakt | Hedef yol |
|---|---|
| Telefondaki boru hattı kodu (v3 doğrulanmış) | `hpa-pipeline-v3/<stage>/` — mevcut aşama klasörlerinin içine, dosya adı çakışması yoksa ek dosya olarak |
| Yeni türetme/modül kodu | `hpa-pipeline-v3/derive/<modul>.py` |
| Modül birim testleri | `hpa-pipeline-v3/tests/test_<modul>.py` (mevcut `test_load.py`, `test_reconcile.py` kalıbı) |
| Veri sözleşmeleri | `docs/VERI-SOZLESMESI-<mac veya modul>.json` (mevcut schema kalıbı `docs/LILLE-GS-SCHEMA.json`) |
| Koordinatör manifesto/iş tanımları | `ORCHESTRATION/agents.json` güncellemesi + `ORCHESTRATION/<MODUL>_SOZLESMESI.md` |
| Görsel fabrika build scriptleri | `scripts/<modul>.py` (mevcut adlandırma: `build_*`) |
| Yol yapılandırması | Yeni tek dosya: `hpa-pipeline-v3/paths.py` (env tabanlı; bkz. §4) |

Önerilen term hedef commit başına tek modül: her modül ayrı PR ile gelir, allowlist kontrolü PR'da çalışır.

## 3. Allowlist / denylist

Makine-kontrol edilebilir sürüm: `REPO_TRANSFER_ALLOWLIST.json` (bu dalda). Özet:

- **Allow:** kaynak kod (`.py`, `.mjs`, `.sh` — Termux-yol-temiz), testler, veri sözleşme JSON/Markdown'ları, dokümantasyon, mevcut build hattına bağlı olan her şey.
- **Deny (asla repoya girmez):** ham maç verisi (CSV/XML/XLSX), `.env*`, token/anahtar içeren her dosya, `__pycache__/`, `.vite/`, `node_modules/`, video (`*.mp4/mkv/mov/webm`), büyük binary, `*.bak*`, taslak klasörler (`content/_yeni_yazilar*`, `content/yazilar.bak`), cache, debug/scratch scriptleri (`debug_*.py`, `probe*.py`, `workaround.py`), hot cluster çalışma dizinleri (`pipeline/input/`, `pipeline/output/` gibi üretim çıktı yolları).
- **Needs review (belirsiz):** görseller (`*.png/*.svg/*.jpg` — kaynağı belgelenmişse izinli, telefondan generate edilen ham çıktıysa deny), `public_data/` (sadece siteye yayınlanan son çıktılar), büyük JSON parçaları (>512 KB).

`.gitignore` önerisi (transfer PR'larında eklenmeli, bu görevde eklenmiyor): `*_hot_cluster/`, `*.mp4`, `*.mkv`, `*.bak*`, `debug_*.py`, `probe*.py`, `workaround.py`, `pipeline/input/`, `pipeline/output/` — mevcut `.gitignore` yalnızca 11 satırdır ve bu desenleri kapsamaz.

## 4. Termux mutlak yollar → taşınabilir yapılandırma planı

**Tespit:** Repoda Termux mutlak yolları en az 30+ dosyada var (ör. `hpa-pipeline-v3/reconcile/run_reconcile.py:58` → `Path('/data/data/com.termux/files/home/pipeline/input')`; `docs/00-ENVIRONMENT.md` ve `docs/VERI-SOZLESMESI.md` doğrudan Termux yolları içeriyor).

**Plan (transfer sırasında uygulanacak, tek düzenlem):**

1. Tek giriş noktası: `hpa-pipeline-v3/paths.py` — `HPA_DATA_ROOT` (varsayılan: repo kökü/<relative data dir>), `os.environ["HPA_X"]` üzerinden override edilebilir `Path` sabitleri.
2. `run_reconcile.py` gibi dosyalardaki sabit `Path('/data/data/com.termux/...')` ifadeleri `paths.<NAME>` çağrısına dönüşür.
3. Shell scriptlerinde `TERMUX_PREFIX`/`$HOME` bağımlılıkları `${HPA_DATA_ROOT:-./public_data}` biçimine çevrilir.
4. Dokümanlardaki mutlak Termux yolları örnek olarak kalır ama kod bunları okumaz; `docs/00-ENVIRONMENT.md`'ye "portable config" bölümü eklenir.
5. Doğrulama: `grep -rI '/data/data/com.termux' hpa-pipeline-v3/ scripts/` → 0 sonuç (docs hariç); testler both envs (Termux + sandbox) ile geçer.

## 5. Modül başına transfer ön koşulları

Her modül için PR açılmadan **önce** sağlanmalı:

| Modül | Ön koşullar |
|---|---|
| Bilimsel veri boru hattı | Ham veri repoda değil; sadece kod + sözleşme. `paths.py` portability düzenlemesi tamamlanmış. `hpa-pipeline-v3/tests/` yeşil. v3 ↔ eski `pipeline/` birleştirme kararı belgelenmiş. |
| Matematiksel model motorları | Her metrik için tanım + formül referansı `ORCHESTRATION/GRAFIK_FORMUL_SOZLESMESI.md` ile tutarlı. Deterministik fixture'lı test. Hesaplama mantığı repoda değiştirilmiyor, sadece ekleniyor. |
| Görsel fabrika | Üretilen görsellerin kaynağı `ORCHESTRATION/GORSEL_KATALOG.md`'de izlenebilir. Scriptler `HPA_DATA_ROOT`'a bağlı. `*.bak*`, ara çıktılar temizlenmiş. |
| Editoryal motor | `npm run build` repoda bozulmadan geçer. Taslak içerikler (`content/_yeni_yazilar*`) **hariç**. PR #100 editorial-SHA gate ile uyumlu. |
| Merkezi üretim koordinatörü | `ORCHESTRATION/agents.json` diff'i review edilebilir ve tek commit. Koordinatörün çağırdığı yol sabitleri `paths.py`'ye taşınmış. |
| Testler ve veri sözleşmeleri | Sözleşmeler mevcut `docs/VERI-SOZLESMESI.json` şemasıyla uyumlu. Testler CI'da çalışabilir (Node/pytest). Sözleşmede referans edilen ham veri repoya konmaz, sadece şema + checksum notu. |

### Ortak gate (her transfer PR'ı için)
1. `REPO_TRANSFER_ALLOWLIST.json` desenleriyle otomatik kontrol (PR check).
2. Termux mutlak yolu taraması → 0 sonuç (kod).
3. Secret taramısı (`GEMINI_API_KEY` vb. — `hpa-pipeline-v3/README.md` masked olsa bile anahtar değeri geçmemeli).
4. Testler yeşil; `npm run build` bozulmamış.
5. Tek modül ; tek PR; main'e direkt push yok (PR #100 disiplini).
