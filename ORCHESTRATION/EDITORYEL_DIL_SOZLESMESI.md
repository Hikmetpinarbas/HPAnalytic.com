# HPAnalytic — Editöryel Dil Sözleşmesi (v1)

**Tarih:** 2026-11-05 · **Durum:** Aktif

## TEMEL İLKE
**"Skoru değil, mekanizmayı okuyoruz."**
Her cümle bir veri iddiası taşır. Her iddia bir görselle desteklenir.
Süsleme yok, kanıt var.

## SES TONU
- **Sakin otorite.** Bağırmıyoruz, gösteriyoruz.
- **Analist gözü.** "Kazanır" değil, "şu mekanizma kazandırır" deriz.
- **Kısa cümle.** Bir cümle bir fikir. Nokta koy, geç.
- **Sayı, hikâyeyi taşır.** "Çok koştu" değil, "11.2 km koştu".
- **Aktif fiil.** "Atıldı" değil, "attı". "Yenildi" değil, "kaybetti".

## YAPI (her maç yazısı)
1. **Kanca (50 kelime):** İki takımın sayısal zıtlığı. Okuyucuyu 5 saniyede yakala.
2. **Ana tez (150 kelime):** Maçın tek bir mekanizması. Bir cümlelik iddia, veriyle kanıt.
3. **Saha (200 kelime):** Pas ağı görselini anlat. Düğümler, hatlar, akışlar.
4. **Kanıt (150 kelime):** xG, geçiş sayıları, koridor yüzdeleri. Görselle çapraz.
5. **Kapanış (50 kelime):** "Maçın sorusu şudur: ..." Tek bir soru bırak.

## GÖRSEL-METİN BAĞI
- Metin "pas ağı" diyorsa, sağda pas ağı olmalı.
- Metin "18/18" diyorsa, grafikte 18. sıra vurgulanmalı.
- Metin "sol kanat %44" diyorsa, sahanın sol tarafı renkli olmalı.
- Her başlığın altında bir grafik. Her grafiğin altında bir cümle.

## YASAKLAR
- "Muhteşem", "harika", "inanılmaz" gibi sıfatlar → yerine sayı.
- "Futbolun doğası gereği..." gibi klişeler → yasak.
- "Bakalım ne olacak" gibi belirsizlik → yerine senaryo.
- "Bir yandan... diğer yandan..." → kaldır, tek şey söyle.

## DİL KİMLİĞİ
- Türkçe, sade, editöryel.
- Teknik terim parantez içinde bir kez açıklanır: "xG (gol beklentisi)".
- Yabancı isimler Türkçe okunuşa göre: "Leweling", "Osimhen".
- Sayı formatı: 18/18, %44, 1.52 (nokta ondalık).

## GÖRSEL DİL EŞLEŞMESİ
- **Arka plan:** `#08090B` (gece siyahı)
- **Vurgu:** `#B4FF39` (neon yeşil) — veri, kanıt
- **Kontrast:** `#FF6B35` (turuncu) — uyarı, zaaf, dikkat
- **Tipografi:** JetBrains Mono (veri), Newsreader (başlık/alıntı)

## ÖRNEK CÜMLE
❌ "Stuttgart defansif geçişte çok kötüydü, Galatasaray bunu cezalandırdı."
✅ "Stuttgart defansif geçişte 18/18. Galatasaray hücumda 1/18. Birinin dibi, diğerinin zirvesi. Maçın mekanizması bu iki sayı arasında."
