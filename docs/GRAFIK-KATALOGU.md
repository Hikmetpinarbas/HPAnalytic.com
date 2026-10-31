# HPAnalytic Grafik Kataloğu v1

**Amaç:** Her grafik bir soruyu yanıtlar. Katalogda yoksa üretilmez; önce "tek soru" cümlesi yazılır.

**Veri kaynakları:** SportsBase CSV/XML (olay, koordinat, zaman) + XLSX (131 oyuncu sütunu, 175 takım sütunu, xG ailesi)

**Kanıt etiketleri (her grafiğin altında):** KAYIT · TÜREV · VEKİL · MODEL · HİPOTEZ

---

## A. MEKÂN (konum bazlı, 11 grafik)

| # | Grafik | Soru | Veri | Zorluk |
|---|---|---|---|---|
| A1 | **Shot map** | Şutlar nereden, hangi tipte? | pos_x, pos_y, action=Shots/Goals | ✓ hazır |
| A2 | **Pass map** | Paslar nereden nereye? | Passes accurate + pos | Kolay |
| A3 | **Isı haritası** | Hangi bölgeye dokunuyor? | Tüm pos_x, pos_y | Kolay |
| A4 | **Koridor dağılımı** | 5 dilimde aksiyon yoğunluğu? | pos_y → 5 bucket | ✓ hazır |
| A5 | **Bölge dağılımı** | 3 bölgede aksiyon? | pos_x → 3 bucket | ✓ hazır |
| A6 | **xThreat grid** | Hangi top alanı daha değerli? | pos_x, pos_y + Karstens modeli | Orta |
| A7 | **Receptive map** | Pas nerede alınıyor? | Uncontested passes received | Kolay |
| A8 | **Defansif eylem haritası** | Nerede müdahale? | Tackles, Interceptions | Kolay |
| A9 | **Aerial duel haritası** | Hava topları nerede? | Aerial challenges won/lost | Kolay |
| A10 | **Top kaybı haritası** | Nerede kaybediyor? | Ball losses + pos | Kolay |
| A11 | **Top kazanım haritası** | Nerede kazanıyor? | Ball recoveries + pos | Kolay |

## B. ZAMAN (seans/sekans, 8 grafik)

| # | Grafik | Soru | Veri | Zorluk |
|---|---|---|---|---|
| B1 | **Maçın nabzı** | Dakika bazlı aksiyon yoğunluğu? | start + action | ✓ hazır |
| B2 | **xG flow** | Kümülatif xG nasıl birikti? | Şut zamanı + xG | Orta |
| B3 | **15dk bloklar** | Süre bloklarında ne değişti? | start → bucket | ✓ hazır |
| B4 | **Gol zincirleri** | Gol öncesi 10sn ne oldu? | start sıralı + filtre | ✓ hazır |
| B5 | **Faz geçişleri** | Defans→hücum ne kadar sürdü? | start, end + action | Zor |
| B6 | **Sekans uzunluğu** | Top kaç aksiyonda kaybedildi? | Top kaybı olana kadar | Orta |
| B7 | **Kart timeline** | Kartlar ne zaman, nerede? | YC + start + pos | Kolay |
| B8 | **Oyuncu değişikliği timeline** | Sub etkisi ne oldu? | Substitutes in/out | Kolay |

## C. AĞ (bağlantı, 4 grafik)

| # | Grafik | Soru | Veri | Zorluk |
|---|---|---|---|---|
| C1 | **Pass network** | Pas ağı hangi oyuncudan geçiyor? | Passes + 5sn pencere | ✓ hazır |
| C2 | **Progressive pass ağı** | Top ileriye nereden taşınıyor? | Progressive passes accurate | Kolay |
| C3 | **Oyuncu merkeziliği** | Kim ağın merkezinde? | Network centrality | Orta |
| C4 | **Koridor ağı** | Kanatlar arası bağlantı nasıl? | Pass + corridor | Orta |

## D. KARŞILAŞTIRMA (2 takım/oyuncu, 6 grafik)

| # | Grafik | Soru | Veri | Zorluk |
|---|---|---|---|---|
| D1 | **Stil sonarı (radar)** | Hangi boyutlarda ayrışıyor? | 8-9 bileşik metrik | Kolay |
| D2 | **Kanal/kenar karşılaştırma** | Saha neresinde buluşuyor? | Left/center/right attacks | Kolay |
| D3 | **xG vs gerçek gol** | Beklenenle gerçek ne kadar örtüşüyor? | xG, Goals | Kolay |
| D4 | **PPDA vs top kazanımı** | Pres verimli mi? | PPDA, ball recoveries | Orta |
| D5 | **Set-piece vs açık oyun** | Nereden üretiyor? | Set-piece + positional + counter | Kolay |
| D6 | **Oyuncu yan yana** | 2 oyuncu hangi metrikte ayrışıyor? | 131 sütun, percentile | ✓ hazır |

## E. DAĞILIM (bubble/bar/scatter, 6 grafik)

| # | Grafik | Soru | Veri | Zorluk |
|---|---|---|---|---|
| E1 | **Oyuncu katkı sıralaması** | Kim ne kadar katkı? | composite, finishing delta | ✓ hazır |
| E2 | **Şut tipi dağılımı** | Hangi tip şut? | Goal/On/Off/Blocked | Kolay |
| E3 | **Pas tipi dağılımı** | Kısa/orta/uzun? | Short/Long/Super long | Kolay |
| E4 | **Koridor × bölge matrix** | 15 hücrede aksiyon? | pos_x × pos_y | Orta |
| E5 | **PPDA timeline** | Pres ne zaman yoğunlaştı? | Team pressing + start | Orta |
| E6 | **xG birikimli bar** | Hangi maçta xG fazla? | xG per match | Kolay |

## F. WAFFLE/PİKSEL (dağılım görseli, 3 grafik)

| # | Grafik | Soru | Veri | Zorluk |
|---|---|---|---|---|
| F1 | **Gol yolları waffle** | Gol hangi mekanizmayla girdi? | 6 gol × tip | ✓ hazır |
| F2 | **Şut waffle** | 17 şutun dağılımı? | tip × takım | Kolay |
| F3 | **Kanal waffle** | Hangi kanal ne kadar? | Kanat aksiyonları | Kolay |

## G. SİMÜLASYON (model, 3 grafik)

| # | Grafik | Soru | Veri | Zorluk |
|---|---|---|---|---|
| G1 | **Maç simülasyonu** | Skor olasılıkları? | xG, OxG + Poisson | Zor |
| G2 | **Beklenen puan** | Maç sonu beklenen puan? | Skellam dağılımı | Zor |
| G3 | **Sezon projeksiyonu** | Sezon sonu nerede? | Tüm maç xG | Zor |

## H. HEATMAP/MATRIX (3 grafik)

| # | Grafik | Soru | Veri | Zorluk |
|---|---|---|---|---|
| H1 | **Oyuncu × aksiyon matrix** | Hangi oyuncu hangi aksiyonu yapıyor? | Player × action sayımı | Orta |
| H2 | **Pas matrix (who→who)** | Kim kime pas atıyor? | Pass network adjacency | Orta |
| H3 | **Koridor × zaman matrix** | Kanat ne zaman aktif? | corridor × time bucket | Orta |

## I. FLOW/SANKEY (akış, 3 grafik)

| # | Grafik | Soru | Veri | Zorluk |
|---|---|---|---|---|
| I1 | **Top akışı** | Savunma→orta→hücum→şut? | Zone transitions | Orta |
| I2 | **Hücum türü akışı** | Pos→counter→set-piece→gol? | Attack type + outcome | Orta |
| I3 | **Pas ağı flow** | Hangi oyuncular arası akış? | Pass network | Kolay |

## J. TIMELINE (3 grafik)

| # | Grafik | Soru | Veri | Zorluk |
|---|---|---|---|---|
| J1 | **Olay timeline** | Kronolojik olay sırası? | Tüm action + start | Kolay |
| J2 | **Gol timeline** | 6 gol ne zaman? | Goals + start | Kolay |
| J3 | **Momentum timeline** | Hangi dakikalar kimin? | Aksiyon yoğunluğu karşılaştırma | Orta |

---

## K. ÖZEL (editorial ihtiyaç)

| # | Grafik | Soru | Veri | Zorluk |
|---|---|---|---|---|
| K1 | **Dört gol, dört mekanizma** (kart, SVG) | Aynı maç, farklı yollar | Gol zincirleri | ✓ hazır |
| K2 | **Aynı 122 kayıp** (karşılaştırma) | Aynı sayı, farklı konum | Kendi yarı kayıp | Kolay |
| K3 | **Saha 3×5 ızgarası** | 15 hücrede tokalaşma | pos_x × pos_y heatmap | Orta |

---

## MVP önceliği — bu gece

**Yazıya hazır (ihtiyaç var):**
- A1 Shot map ✓
- A4 Koridor ✓
- A5 Bölge ✓
- B1 Maçın nabzı ✓
- B3 15dk bloklar ✓
- B4 Gol zincirleri ✓
- C1 Pass network ✓

**Yazıya gerekli (sıradaki):**
- B2 **xG flow** — Lille yazısı için kritik
- D3 **xG vs gerçek gol** — bir cümle kurtarır
- A2 **Pass map** — mekân hikâyesi
- E4 **Koridor × bölge matrix** — 15 hücre

**Katalogda var, şimdilik yok:**
- G1-G3 simülasyon (model ağır)
- I1-I3 flow (Sankey kütüphanesi)
- H2 pass matrix (NxN)
