# HPAnalytic — Kaynak Doğrulama ve Veri Denetim Raporu

**Tarih:** 26 Ekim 2026  
**Durum:** VERIFIED / PASS  

## 1. Veri Kaynakları ve Depolar
- **SportsBase Library:** `~/HP_WORKSPACE/SPORTSBASE_LIBRARY/` (Katalog, maç XML/CSV paketleri ve turnuva arşivleri doğrulandı).
- **Derbi Teslimat Alanı:** `~/HP_WORKSPACE/DERBI_DELIVERY_20261026/` (Matematiksel metrikler, kanıt defteri, makale ve grafikler tam ve eksiksiz).
- **Dahili Depolama Paketi:** `/storage/internal/HPAnalytic_Derbi_20261026.zip` (SHA256: `6a5095902f3e672886e187ba8b3806f7d4829f3e2ca6366de3470a2d729d3659` — Sağlam ve test edildi).

## 2. Tekilleştirme ve Eşleştirme
- Aynı maçların farklı formatları (CSV / XML) içerik hash'i ve maç kimliği üzerinden tekilleştirildi.
- Çift sayım yapılmamıştır; lig verileri 8 haftalık resmi Opta/SportsBase kayıtları ile sınırlıdır.
