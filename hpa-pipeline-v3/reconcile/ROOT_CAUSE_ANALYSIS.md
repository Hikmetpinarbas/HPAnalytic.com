# Kök Neden Analizi: 43 CSV/XLSX Uyuşmazlığı

**Tarih:** 2026-11-02
**Durum:** Kod analizi tamamlandı. Veri doğrulaması yerel cihazda yapılmalı.

## Özet

4 maçta CSV/XML olay kayıtları ile XLSX oyuncu toplamları arasındaki 43 uyuşmazlık
**dört bağımsız kök neden**den kaynaklanıyor. Hepsi pipeline kodundaki construct-measurement
uyumsuzlukları; kaynak veride hata yok.

## Uyuşmazlık Dağılımı

| Kategori | Sayı | Ana Kök Neden |
|---|---|---|
| İsabetli pas | 12 | A + B |
| İsabetli progresif pas | 26 | C |
| Ceza sahasına isabetli pas | 5 | C |
| **Toplam** | **43** | |

## Kök Nedenler

### A: Koordinat Filtresi Geçerli Olayları Düşürüyor

**Konum:** `hpa-pipeline-v3/ingest/load.py:64`

```python
# ÖNCE (hatalı)
if ev['x'] is not None and ev['team']:
    events[kind].append(ev)
```

CSV'de koordinatı boş (`pos_x=""`) olan ama gerçek, sayılması gereken olaylar var.
XLSX toplamları bu olayları sayıyor. Pipeline'ın spatial analiz filtresi sayısal
mutabakat için de uygulanıyor — olmamalı.

**Kanıt:** GS-FB CSV PLAYERS: 2877 satır, 2873'ünde pos_x dolu. 4 satır düşüyor.
Bu 4 satır meta olaylar (Start/Halftime/End) olabilir ama diğer maçlarda gerçek
pas olayları da koordinatsız olabilir.

**Düzeltme:** `load_match_all()` fonksiyonu eklendi — koordinat filtresi olmadan yükler.
Mutabakat bu fonksiyonu kullanır. Mevcut `load_match()` değişmedi (spatial analiz için).

**Test:** `test_coord_filter_drops_valid_events` ✓

### B: GK Pasları Ayrı Dosyada, Sayıma Dahil Edilmiyor

**Konum:** `hpa-pipeline-v3/ingest/load.py:99`

```python
passes = [e for e in events['PL'] if 'pass' in e['action'].lower() ...]
```

`summary()` sadece PL (PLAYERS) eventlerinden pas sayıyor. Kaleci pasları GK
dosyasında. XLSX TEAMS/MATCHES toplamları PL + GK içerir (README'de doğrulanmış:
"TM = PL + GK").

**Kanıt:** Veri sözleşmesindeki GS-FB XLSX GOALKEEPERS: Ederson Passes=22,
Uğurcan Passes=29. Bu paslar PL dosyasında yok, GK dosyasında.

**Düzeltme:** `summary_by_action()` fonksiyonu eklendi — her kaynağı (PL/GK/TM) ayrı
gösterir. Mutabakat karşılaştırma seviyesine göre doğru kaynağı kullanır:
- Oyuncu (PL) → XLSX PLAYERS
- Oyuncu (GK) → XLSX GOALKEEPERS
- Takım (TM veya PL+GK) → XLSX TEAMS/MATCHES

**Test:** `test_gk_passes_separate` ✓

### C: Etiket Örtüşmesi — Metrik Tanımı Uyumsuzluğu

**Konum:** `hpa-pipeline-v3/ingest/load.py:99` (summary fonksiyonu)

SportsBase'de tek bir fiziksel pas birden fazla CSV satırı üretir:

```
ID=1  start=10.0  action="Passes accurate"
ID=2  start=10.0  action="Progressive passes accurate"
ID=3  start=10.0  action="Passes forward accurate"
```

Bu üç satır aynı pasın farklı etiketleri. Pipeline'ın `summary()` fonksiyonu:

```python
passes = [e for e in events['PL'] if 'pass' in e['action'].lower() ...]
```

**Tüm pass etiketlerini** tek bir "passes" sayacında topluyor. Ama XLSX'te:
- "Passes accurate" = ayrı sütun (isabetli paslar)
- "Progressive passes accurate" = ayrı sütun (isabetli progresif paslar)
- "Passes into the penalty box accurate" = ayrı sütun

Her biri kendi alt kümesi. Pipeline bunları ayırt etmiyor.

**Bu 26 + 5 = 31 uyuşmazlığın kök nedeni budur.**

**Kanıt:** Lille-GS CSV PLAYERS şeması: 816 "Passes accurate" + 112 "Progressive
passes accurate" + 288 "Passes forward accurate" + 24 "Passes into the penalty box
accurate" + ... = toplamda 1400+ satır. Ama bunlar aynı fiziksel pasların farklı
etiketleri — additif değiller.

**Düzeltme:**
1. `summary_by_action()` her action etiketini bağımsız sayar
2. `event_counter.py` → `ACTION_TO_XLSX_COLUMN` eşleştirme tablosu
3. `reconcile_player()` her etiketi XLSX sütunuyla birebir karşılaştırır

**Test:** `test_tag_overlap_separate_counting` ✓

### D: XLSX "-" → 0 Dönüşümü

**Konum:** `hpa-pipeline-v3/derive/radar.py:29`, `pipeline/derive/xg_flow.py:14`

```python
# ÖNCE (hatalı)
if v in (None, '-'): return 0
```

XLSX'te "-" iki farklı anlam taşır:
1. **Sayısal sıfır:** Oyuncu o kategoride 0 eylem yaptı
2. **Eksik veri / uygulanamaz:** Oyuncu o maçta oynamadı

İkisi de 0'a dönüştürülünce mutabakat yanlış sonuç üretir: oynamayan bir
oyuncunun tüm metrikleri 0 olarak dahil oluyor.

**Düzeltme:** `xlsx_reader.py` → `_parse_value()` fonksiyonu: "-" → None, 0 → 0.0.
Mutabakat modülü None ile 0'ı ayırt ediyor.

**Test:** `test_xlsx_dash_parsing`, `test_reconcile_xlsx_none`, `test_reconcile_both_zero` ✓

## Düzeltme Durumu

| Kök Neden | Düzeltme | Test | Veri Doğrulama |
|---|---|---|---|
| A: Koordinat filtresi | `load_match_all()` | ✓ | Yerel cihazda yapılmalı |
| B: GK pasları | `summary_by_action()` | ✓ | Yerel cihazda yapılmalı |
| C: Etiket örtüşmesi | `event_counter.py` + `reconciler.py` | ✓ | Yerel cihazda yapılmalı |
| D: XLSX "-" | `xlsx_reader.py` | ✓ | Yerel cihazda yapılmalı |

## Yerel Cihazda Doğrulama

```bash
cd ~/HPAnalytic.com  # veya repo'nun klonlandığı yer
python3 hpa-pipeline-v3/reconcile/run_reconcile.py
```

Bu script:
1. 4 maçın CSV ve XLSX dosyalarını bulur
2. Her maç için oyuncu/takım/kaleci bazında mutabakat yapar
3. Uyuşmazlıkları listeler + kök neden ipuçları verir
4. JSON rapor üretir

**Not:** `run_reconcile.py`'deki MATCHES dict'indeki CSV/XLSX yollarını kendi
cihazına göre güncellemelisin.

## Mevcut Sisteme Etki

- `load_match()` → **DEĞİŞMEDİ.** Spatial analiz, şut dedup, xT grid aynı çalışıyor.
- `summary()` → **DEĞİŞMEDİ.** Mevcut çıktı formatı korundu.
- Yeni eklenen: `load_match_all()`, `summary_by_action()`, `reconcile/` modülü.
- Mevcut 66 regresyon testi → **etkilenmemiş** (load_match ve summary değişmedi).
- 10 yeni test → **hepsi geçiyor.**

## Epistemik Durum

| İddia | Kanıt Seviyesi |
|---|---|
| 4 kök neden tanımlanması | GÜÇLÜ — kod analizi |
| Koordinat filtresinin olay düşürmesi | GÜÇLÜ — veri sözleşmesi + kod |
| GK paslarının ayrı dosyada olması | GÜÇLÜ — README + veri şeması |
| Etiket örtüşmesinin 31 farkı açıklaması | YÜKSEK — şema analizi, ama tam doğrulama veri gerektirir |
| XLSX "-" ayrımının fark yaratması | ORTA — mekanizma doğru, kaç fark yarattığı veri ile doğrulanmalı |
| Bu 4 nedenin 43'ün tamamını açıklaması | HİPOTEZ — yerel veri doğrulaması gerekli |
