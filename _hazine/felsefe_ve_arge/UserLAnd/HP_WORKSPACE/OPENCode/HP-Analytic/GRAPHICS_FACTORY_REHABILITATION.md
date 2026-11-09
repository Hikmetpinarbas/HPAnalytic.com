# GRAPHICS_FACTORY_REHABILITATION

**Tarih:** 2026-10-19 · **Rol:** HPAnalytic P0 — Katmanlı Grafik Fabrikası Rehabilitasyonu
**Kök:** `/home/userland/HP_WORKSPACE/OPENCode/HP-Analytic/output/graphics-factory-20261018`
**Durum:** `CANDIDATE` → çekirdek **REHABILITATE**, tek gerçek sahne **PROTOTİP + KISMİ BLOCKED**
**Yayın:** KAPALI (NO AUTOPUBLISH). Hiçbir kanonik dosya silinmedi/değiştirilmedi (tek istisna: aşağıda kayıtlı 1 güvenli düzeltme).

---

## 1. Görev ve sonuç özeti
Reddedilmiş eski sahnelerin yeni tasarıma sızmasını engelle; fabrikanın kaynak/koordinat/katman/
geometri/render omurgasını `KEEP / REHABILITATE / REJECT / QUARANTINE` olarak sınıflandır; mevcut
sözleşmelerin izin verdiği **tek gerçek veri katmanlı sahneyi** üret; kaynak yoksa uydurmadan `BLOCKED` bildir.

**Sonuç:** Motorun çekirdeği (`hpa-core`, `hpa-pitch`, `hpa-registry`, `hpa-editor`, `hpa-export`)
sağlam ve yeniden kullanılabilir. **Gerçek veriyle tek katmanlı sahne ÇALIŞIYOR** (render kanıtı var),
ancak fabrikanın kendi doğrulayıcısı gerçek veriyi reddediyor — **tek gerçek sözleşme boşluğu burada**.

---

## 2. Yöntem
1. Çalışma kökündeki tüm ağaçlar listelendi; iki fabrika tespit edildi (JS grafik fabrikası + Python `visual-foundry`).
2. Motor modülleri ve sözleşmeler satır satır okundu; gerçek veri kuralları (`DOSYA_REHBERI.md`, `METRICS.csv`, `CLAIM_LEDGER.csv`) okundu.
3. Reddedilmiş varlıklar sha256 ile donduruldu (non-destructive karantina).
4. Kanonik gerçek maç CSV'sinin sha256'sı doğrulanıp gerçek veriden sahne üretildi; motor **değiştirilmeden** çizildi.
5. Regresyon koşuldu; kanıtlar `evidence/` ve `regression_results.json`'a yazıldı.

> **İstenen "ÖNCE OKU" dokümanları bulunamadı (MISSING):** `HPANALYTIC_PREMIUM_LAYERED_VISUAL_STANDARD_V1.md`,
> `LEGACY_GRAPHICS_QUARANTINE_20261019.md`, `HPVIZ_SPEC.md`, `HPVIZ_LAYERED.md`,
> `HPVIZ_IMPLEMENTATION_ROADMAP.md`, `REUSE_MATRIX.md`, `GRAPHICS_EVOLUTION_REPORT_20261018.md`,
> `GRAPHICS_FACTORY_REHABILITATION_REPORT.md`. Bu adlar hiçbir konumda yok; rapor bunlara
> dayanamadı, mevcut sözleşmelerden (`SCHEMA.json`, `MANIFEST.json`, `AGENTS.md`, `DOSYA_REHBERI.md`) türetildi.

---

## 3. Teslimler
| Teslim | Yol |
|---|---|
| Bu rapor | `GRAPHICS_FACTORY_REHABILITATION.md` |
| Yeniden kullanım kararları | `REUSE_DECISIONS.json` |
| Tek gerçek sahne prototipi | `single_scene_prototype/` (scene, ledger, render.html, PNG, SVG, README) |
| Kanıtlar | `evidence/rehab-quarantine.json`, `evidence/rehab-prototype.png`, `evidence/rehab-prototype.svg`, `evidence/rehab-provenance_ledger.json` |
| Regresyon | `regression_results.json` |
| Karantina kaydı (fabrika içi) | `output/graphics-factory-20261018/scenes/QUARANTINE.json` |
| Karantina kapısı (opt-in) | `output/graphics-factory-20261018/engine/hpa-quarantine.js` |

---

## 4. Mimari eşleme (7 katman → mevcut motor)
| İstenen katman | Fabrikadaki karşılık | Durum |
|---|---|---|
| 1 Source/Evidence | `hpa-core.js` rozet + `sourceNote` + `data-evidence`; `hpa-adapter.js` | KEEP (adapter'da gerçek sağlayıcı boşluğu) |
| 2 Material/Background | `frame()` `surface` zemini; tema jetonları (`hpa-theme.js`) | KEEP |
| 3 Geometry | `hpa-pitch.js` kanonik IFAB 105×68 | KEEP |
| 4 Mathematical Data Field | `spatial.js` bölge/yoğunluk, `temporal.js`, `statistical.js` | KISMEN REHABILITATE |
| 5 Actors/Relations | `measure.js:pass-network` | REJECT (gerçek veride oyuncu uç noktası yok) |
| 6 Annotation/Spotlight/Counterevidence | `drawAttackArrow`, lejantlar, `warning` satırı, blok kanıt kısaltmaları | KEEP |
| 7 HUD/Typography/Provenance | `fig-title/claim/chip/source`, `hpa-composite.js` ray blokları, `damga` | KEEP (poster metinleri REHABILITATE) |

Motion ayrı zaman ekseni olarak `ui-premium.html` (Three.js + GSAP + CSS blur) tarafından karşılanır — ancak bu katman fabrika motorundan bağımsızdır ve veri figürüyle birleştirilmez.

---

## 5. Yeniden kullanım kararları (özet)
Tam gerekçe: `REUSE_DECISIONS.json`.

- **KEEP:** `hpa-core.js`, `hpa-pitch.js`, `hpa-registry.js`, `hpa-editor.js`, `hpa-export.js`, `statistical.js:distribution`, `statistical.js:slope-comparison`.
- **REHABILITATE:** `hpa-adapter.js` (Sova sağlayıcısı yok), `hpa-composite.js` (gerçek veri etiketleri), `hpa-theme.js` (tema onay çelişkisi), `spatial.js:pitch-zones` (lejant metni), `temporal.js` (action→phase eşlemesi), `measure.js:action-entropy`, `statistical.js:bootstrap-ci/uncertainty-fan`, `ui-premium.html`, kabul edilmiş Stitch kaynağı (palet çelişkisi).
- **REJECT (gerçek veri için):** `spatial.js:field-density` (yumuşatılmış model alanı = pres sanılır), `spatial.js:shots-model` (xG kaynakta yok), `measure.js:pass-network` (oyuncu uç noktası yok), `scene_v2_original.py` (elle xT ızgarası), `demo_20261018/*.svg` (Paint-benzeri Matplotlib).
- **QUARANTINE (donduruldu, silinmedi):** `scenes/scene-01..scene-13` — yeni stilin kaynağı değildir. Guard: `engine/hpa-quarantine.js` (`assertNotFrozen`).

---

## 6. Bulunan gerçek kusurlar / çelişkiler
1. **Gerçek veri kabul edilemiyor (KRİTİK):** `tests/scene_validate.py:52-53` koşulsuz `meta.synthetic === true` ister. Gerçek maç sahnesi bu kapıdan geçemez. Aşağıda §8.
2. **`hpa-composite.js:114` hardcoded `"ELLER?"`** — gerçek (non-synthetic) veride yer tutucu metin. **Düzeltildi** (bkz. §9).
3. **`hpa-composite.js` `dataContract`** hâlâ "tüm değerler SYNTHETIC" der; gerçek sahne için güncellenmeli.
4. **Tema çelişkisi:** `MANIFEST.json:97` "opulent-night ONAYLI … varsayılan" der; `hpa-theme.js:39` "ÖNAY BEKLER" der. Operatör kararı gerekir.
5. **Palet çelişkisi:** kabul edilmiş Stitch kaynağı koyu; onaylı fabrika paleti AYDINLIK (kâğıt `#F5F1E8`). Hangi yüzey kanonik — karar gerekir.
6. **`visual-foundry/output/premium-layered-graphic.html`:** satır 57 `AMBER` üçlüsü geçersiz (`158/251/255`), satır 138 `qry` iki kez çağrılıyor (biri `qrx` olmalı).
7. **Terim tutarsızlığı:** kaynak düzeyinde koordinat ızgara, motor düzeyinde "metre". Sahne, birimi kanıtlanmadıkça ızgara olarak etiketlenmeli.

---

## 7. Tek gerçek veri katmanlı sahne (prototip)
- **Kaynak:** `inbox/Aston Villa 6-0 Fenerbahce 14.10.2026, Full match.csv` — 3031 olay,
  sha256 `11081d00a136fe439d573ce7c0d1f1478ae8a70f28d5ae2bbf943faef516282b` (build sırasında doğrulandı).
- **Sahne:** `single_scene_prototype/scene-real-01.json` — `tactical-poster` kompoziti:
  - merkez `pitch-zones` = Aston Villa isabetli paslarının 3×6 bölge toplamı (TÜRETİLMİŞ), sola→sağa;
  - raylar: GÖZLEM (Villa: gol 6, isabetli şut 13, isabetsiz şut 3, isabetli pas 365; Maç toplamı: 6/18/5/794) + TÜRETİLMİŞ bölge payı (geri %25.5 · orta %48.8 · ileri %25.8).
- **Sözleşmeye uygunluk:** xG / ilerici pas / topsuz hareket / pres / niyet **ÜRETİLMEDİ**; ızgara birimi **metre varsayılmadı**; her metrik numerator/eligible-denominator/birim/kaynak-satır-ID/uncertainty/claim-ceiling ile kayıtlı (`provenance_ledger.json`).
- **Render:** motor değiştirilmeden çizildi → `prototype.png` (1440×900@2x), `prototype.svg` (gömülü CSS). `data-evidence="GÖZLEM"`, `data-synthetic="false"`, 18 bölge hücresi, `attack-arrow`, `pitch-border`, masthead + iki ray metni mevcut; `FAIL_CLOSED` yok.

---

## 8. BLOCKED — kaçış yok, dürüst sınır
**Gerçek veriyi fabrika sözleşmesine sokmak ŞU AN MÜMKÜN DEĞİL.** Tek, somut, kaçınılmaz engel:

```
FAIL scene-real-01.json: lab sahnesi SYNTHETIC=true ZORUNLU (demo hack verisi)
   → tests/scene_validate.py:52-53
```
Sahne motor tarafından sorunsuz çizilir (regresyon `prototype_render` **PASS**), ama fabrikanın
kendi doğrulayıcısı gerçek veriyi reddeder. Ayrıca `hpa-adapter.js`'de Sova maç-olay CSV'si için
sağlayıcı yok (mevcut `csv-generic` takım/aksiyon/olay-id taşımaz).

**Önerilen (onay bekleyen) düzeltme — minimal, geri dönüşsüz değil:**
1. `scene_validate.py`: `synthetic` denetimini koşullu yap → `synthetic === true` **veya** `evidenceClass ∈ {GÖZLEM, TÜRETİLMİŞ}` + `meta.provenanceTag` zorunlu. Sentetik davranış aynen korunur.
2. `hpa-adapter.js`: `sova-full-match` sağlayıcısı ekle (başlık doğrulanır, attackDirection yalnız normalizasyon kanıtıyla).
3. `hpa-composite.js`: `dataContract` metnini gerçek veri için güncelle.

Bunlar yapılmadan gerçek sahne **üretim hattına alınamaz** (yalnız prototip/önizleme kalır).

---

## 9. Yapılan tek motor değişikliği (kayıtlı, güvenli)
`output/graphics-factory-20261018/engine/hpa-composite.js:114`
```diff
- .textContent = scene.meta.synthetic ? "SYNTHETIC · seed 20261018" : "ELLER?";
+ .textContent = scene.meta.synthetic ? "SYNTHETIC · seed 20261018" : (scene.meta.provenanceTag || "GÖZLEM · gerçek kaynak");
```
Sentetik sahnelerin çıktısı **birebir aynı kalır** (13 sahne shası değişmedi, `scene_validate` 13/13 PASS).
Bu, gerçek veride yer tutucu metni provenance etiketiyle değiştiren en küçük düzeltmedir. Başka hiçbir motor dosyası değiştirilmedi.

---

## 10. Regresyon
`regression_results.json` — 5/5 PASS:
`scene_validate` (13/13) · `contrast_audit` (0 metin FAIL) · `engine_bundle_parse` · `prototype_render` (FAIL_CLOSED yok, masthead + 18 bölge + GÖZLEM rozeti) · `prototype_contract_gate` (beklenen red: gerçek veri kapısı).

---

## 11. Riskler
- Bildirilen sözleşme/doküman adlarının çoğu **yok** → kararlar mevcut sözleşmelerden türetildi; yeni standart gelirse hizalanmalı.
- Tema (koyu vs AYDINLIK) ve Stitch paleti **onaysız** karar bekliyor.
- Motor demeti, modül adı çakışması (`PITCH`) nedeniyle bir yeniden adlandırma gerektirir (bundle'da çözüldü; kaynak ESM etkilenmedi).
- `opulent-night` onay durumu belirsiz — yanlış varsayılan seçimi riski.

## 12. Yapmadıklarım (guardrail)
Silme yok · production'a bağlama yok · yayın/merge yok · uydurma sayı yok · tracking/xG/pres/niyet üretimi yok · gömülü kimlik bilgisi yok · yeni motor/oturum yok.

## 13. NEXT (WIP=1 önerisi)
**§8'deki 1. düzeltme (scene_validate koşullu synthetic kapısı)** operatör onayına sunulur. Onaylanırsa:
gerçek sahne fabrikanın kendi kapısından geçer ve `single_scene_prototype` → `scenes/` terfi ettirilebilir.
Onaya kadar prototip **PROTOTİP** kalır.

---
*Bu rapor bir çalışma/denetim kaydıdır; yayın onayı değildir. Kanonik değişiklik gerektiren maddeler insan onayı bekler.*
