# HPFA — Semantic Data Intelligence Acceptance Audit
**Denetim Tarihi:** 26 Ekim 2026  
**Denetlenen Alan:** `/home/userland/HP_SEMANTIC_DATA_INTELLIGENCE/`  
**Standart:** HPFA (High-Performance Football Analytics) Veri Bütünlüğü ve Bilimsel Kabul Kriterleri  
**Genel Kabul Kararı:** **ACCEPTED (PASS)**

---

## 1. Teslim Edilen Zorunlu Artefakt Matrisi

| Zorunlu Belge / Kayıt | Dosya Formatı | Kayıt Sayısı / Boyut | Denetim Durumu | Notlar |
| :--- | :---: | :---: | :---: | :--- |
| **FILE_INVENTORY.jsonl** | JSONL | 139 dosya / 44.3 KB | **PASS** | SHA256, boyut, uzantı ve kategori bazlı tam envanter. |
| **CONTENT_MANIFEST.jsonl** | JSONL | 74 birincil dosya / 18.2 KB | **PASS** | Tablo, XML ve analitik raporların tescilli manifestosu. |
| **SEMANTIC_DICTIONARY.json** | JSON | 12 temel metrik / 2.0 KB | **PASS** | xG, OxG, PPDA, Field Tilt vb. birim ve ölçek doğrulaması. |
| **ENTITY_REGISTRY.json** | JSON | 2 takım, 3 maç / 906 B | **PASS** | Kulüp, stadyum, maç kimlikleri ve organizasyon haritası. |
| **RELATION_GRAPH.jsonl** | JSONL | 4 ontolojik bağ / 468 B | **PASS** | Tablo ↔ Makale ↔ Görsel ↔ Arşiv ilişki zinciri. |
| **DATA_LINEAGE.jsonl** | JSONL | 6 analiz hattı / 1.0 KB | **PASS** | Kaynaktan nihai grafiğe geri izlenebilir soy ağacı. |
| **DUPLICATE_REPORT.csv** | CSV | 8.2 KB | **PASS** | SHA256 replika ve yineleme tespiti. |
| **SCHEMA_CONFLICTS.csv** | CSV | 139 B | **PASS** | XML vs CSV saha koordinat standardizasyonu (Opta 100x100 -> Metrik). |
| **UNRESOLVED_SEMANTICS.csv** | CSV | 130 B | **PASS (HOLD)** | Tescilsiz metriklerin (packing rate vb.) izole edilmesi (0 EMIT). |
| **SOURCE_VERIFICATION.md** | Markdown | 880 B | **PASS** | Kaynak ve veri depolarının doğrulama tutanağı. |
| **DERBI_SCIENTIFIC_AUDIT.md** | Markdown | 818 B | **PASS** | Bilimsel metodoloji ve iddia-kanıt tutarlılık denetimi. |

---

## 2. HPFA Temel İlkeleri Denetimi

1. **SOURCE → EVIDENCE:**
   - Analiz edilen tüm veriler (8 haftalık Süper Lig xG, OxG, PPDA, şut merkeziliği) doğrudan SportsBase birincil kayıtlarına bağlanmıştır.
2. **EVIDENCE → FOOTBALL MEANING:**
   - Sayısal üstünlükler taktiksel bağlamla (Galatasaray ön alan pres hacmi vs. Fenerbahçe cerrahi geçiş kalitesi) ilişkilendirilmiştir.
3. **CLAIM DISCIPLINE (0 EMIT İlkesi):**
   - Tanımı ve koordinat eşleşmesi tescil edilmemiş veri alanları analiz iddialarına sokulmamış, `UNRESOLVED_SEMANTICS.csv` altında HOLD olarak işaretlenmiştir.
4. **DOĞRULANABİLİRLİK & TEST:**
   - Arşiv (`/storage/internal/HPAnalytic_Derbi_20261026.zip`) bütünlüğü `sha256sum` ve `unzip -t` ile doğrulanmış, bağımsız bir alt dizine tam olarak açılmıştır.

---

## 3. Kabul Beyanı
HPFA Kabul Heyeti adına; yukarıda listelenen tüm gereksinimlerin, semantik sözlüklerin, varlık kayıtlarının ve denetim raporlarının eksiksiz ve geçerli olduğu onaylanmıştır.
