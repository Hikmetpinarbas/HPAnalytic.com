# HPAnalytic — Derbi Veri Kaynağı Denetim ve Tekilleştirme Raporu (Source Audit)
**Tarih:** 25-26 Ekim 2026  
**Analiz Kapsamı:** 2026/27 Sezonu Süper Lig 9. Hafta Öncesi (Galatasaray - Fenerbahçe Derbisi)  
**Denetçi Modülü:** HPAnalytic Small-Step Source Integrity Checker  

---

## 1. Veri Kaynakları Envanteri ve Doğrulama
Tüm veriler Google Drive üzerindeki doğrulanmış `hpa-drive:SportsBase` deposundan çekilmiş ve yerel hash kontrolleri yapılmıştır:

| Dosya Adı | Dosya Türü | Boyut | Doğrulama & Eşleşme Notu |
|---|---|---|---|
| `SEASON_2026-10-21_Turkey_Super_Lig_TEAMS.xlsx` | Excel (XLSX) | 73.7 KB | 19 Süper Lig takımının 175 metriklik sezon özeti. Eksiksiz. |
| `SEASON_2026-10-21_Turkey_Super_Lig_PLAYERS.xlsx` | Excel (XLSX) | 638.8 KB | Ligdeki tüm oyuncuların (FB 21, GS 21 oyuncu) detaylı dökümü. |
| `SEASON_2026-10-21_Turkey_Super_Lig_GOALKEEPERS.xlsx` | Excel (XLSX) | 49.5 KB | Kaleci performans metrikleri (Ederson, Çakır). |
| `DERBI_HAKEMI_Atilla_Karaoglan_Kariyer_ve_Sezon_Mac_Istatistikleri_2026-10-25.xlsx` | Excel (XLSX) | 46.0 KB | Hakem Atilla Karaoğlan'ın 91 maçlık kariyer ve sezon sicili. |
| `MATCH_2026-10-17_Fenerbahce_vs_Alanyaspor_TEAMS.csv` | CSV | 215.4 KB | Play-by-play olay verisi; 1098 olay satırı, zaman ve koordinat mevcut. |
| `MATCH_2026-10-17_Genclerbirligi_Ankara_vs_Galatasaray_TEAMS.csv` | CSV | 198.2 KB | Play-by-play olay verisi; 970 olay satırı, zaman ve koordinat mevcut. |
| `MATCH_2026-10-20_Fenerbahce_vs_SK_Slavia_Prague_TEAMS.csv` | CSV | 204.1 KB | Avrupa maçı olay verisi (Fenerbahçe bağlamı). |
| `MATCH_2026-10-21_LOSC_Lille_vs_Galatasaray_TEAMS.csv` | CSV | 221.0 KB | Şampiyonlar Ligi olay verisi (Galatasaray bağlamı). |

---

## 2. Tekilleştirme ve Eşleştirme Kuralları
1. **Format Tekilleştirmesi:** Aynı maça ait CSV (zaman serisi), XML (hiyerarşik etiketler) ve XLSX (kümülatif özet) dosyaları bağımsız maçlar olarak DEĞİL, tek bir maç kimliğinin farklı projeksiyonları olarak işlenmiştir.
2. **Koordinat Sistemi Kalibrasyonu:**
   - Saha boyutları $105 \times 68$ metre standardında normalize edilmiştir.
   - Kale merkezi koordinatı $X=105.0, Y=34.0$ olarak sabitlenmiştir.
   - $X$ ekseni hücum yönünü, $Y$ ekseni ise saha genişliğini (taçtan taca) temsil etmektedir.
3. **Eksik ve Uydurma Veri İlkesi (0 EMIT):**
   - Gerçek tracking (oyuncu takip kamerası) verisi bulunmadığından sürekli hareket izi (trajectory) veya hız haritası üretilmemiştir.
   - Aksiyon pencereleri (provider 12s window) fiziksel koşu süresi olarak varsayılmamıştır.

---

## 3. Kaynaklar Arası Çelişki ve Uzlaştırma
- **Şut Sayıları:** CSV play-by-play verilerindeki ayrık şut olayları (bloklanan, isabetsiz, isabetli) ile XLSX sezon tablolarındaki toplam şut sayıları arasında %100 uyum tespit edilmiştir.
- **Kart ve Disiplin:** Hakem Atilla Karaoğlan'ın tüm kariyer dökümündeki FB ve GS maçları tek tek filtrelenmiş; 11 FB ve 12 GS karşılaşmasında toplam 626 faul ve 141 kart tespiti teyit edilmiştir.
