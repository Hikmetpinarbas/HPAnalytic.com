# HPANALYTIC — VİZYON VE SÜRDÜRÜLEBİLİRLİK SÖZLEŞMESİ

## 1. Temel Amaç
Futbol analitiğini, sadece metin ve statik grafiklerle değil; **veri gazeteciliği** seviyesinde, **hareketli, katmanlı ve etkileşimli** animasyonlarla anlatmak. Ödül hedefi: En iyi veri görselleştirme / spor analitiği dalında.

## 2. Görsel Dil ve Tasarım Kuralları
- **Renk Paleti:** Arka plan `#08090B`, Ofansif vurgular `#B4FF39` (Neon Yeşil), Defansif vurgular `#FF6B35` (Turuncu).
- **Oyuncu İkonları:** Yuvarlak, sade, yüksek kontrastlı.
- **Altyazılar:** Kayan, anlaşılır. Ofansif için neon yeşil, defansif için turuncu.
- **İz Efekti:** Oyuncular konum değiştirirken arkalarında kesik çizgili izler bırakmalı. Silinme efekti uzaktan yakına doğru olmalı.

## 3. Animasyon Prensipleri
- **Formasyon -> Defansif -> Ofansif:** Oyuncular önce formasyonda görünür. Ardından ağır ağır defansif ortalama konumlarına kayar (turuncu iz). Sonra ofansif ortalama konumlarına kayar (neon yeşil iz).
- **Pas Animasyonu:** En sık tekrarlanan, tehlike yaratan ve gole giden pas örgüleri topun hareketiyle canlandırılır.
- **Isı Haritası:** Zaman içinde (1. yarı, 2. yarı, tüm maç) akan bir ısı haritası.
- **Sekmeler:** Tümü, 1. Yarı, 2. Yarı.
- **Takım Seçimi:** Ev sahibi / Deplasman ayrı ayrı gösterilir.
- **Oyuncu Değişiklikleri:** Sağ üstte "Değişiklikler" butonu. Oyuna girenlerin verisi sahaya yansır, çıkanlar silinir.

## 4. Sürdürülebilirlik
Her yeni özellik, `src/js/viz/` altına modüler bir JS dosyası olarak eklenir. Veri hattı `scripts/process_match_data.py` ile yönetilir. Eski ve yeni tüm fikirler burada belgelenir.
