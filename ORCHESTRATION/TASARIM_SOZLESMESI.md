# HPANALYTIC — TASARIM VE GÖRSEL DİL SÖZLEŞMESİ

## 1. Temel Felsefe
Görseller, metnin yerini almaz; **metni derinleştiren, somutlaştıran** yardımcı unsurlardır. Site bir "veri panosu" değil, bir **"taktiksel düşünce atölyesi"**dir. Her görsel, bir cümlenin altını çizmeli, bir soruyu yanıtlamalıdır.

## 2. Tipografi ve Estetik
- **Başlıklar:** `Newsreader` (serif) veya `Hanken Grotesk` (sans-serif). Edebi ve ciddi.
- **Metin:** `JetBrains Mono` veya `Hanken Grotesk`. Okunabilir, teknik.
- **Renk Paleti:**
  - Arka plan: `#08090B` (çok koyu, neredeyse siyah)
  - Ana Metin: `#F4F2EC` (kırık beyaz)
  - Vurgu 1 (Ofansif/Neon): `#B4FF39`
  - Vurgu 2 (Defansif/Turuncu): `#FF6B35`
  - Saha Çizgileri: `#2E271C` (koyu altın/kahve)
- **Saha:** Gerçekçi değil, **şematik ve estetik**. Çizgiler ince, renkler site paletiyle uyumlu.

## 3. Animasyon Prensipleri (Vizyonun Kodlanmış Hali)
- **Formasyon -> Defansif -> Ofansif Geçişi:**
  - Oyuncular formasyonda başlar.
  - Defansif ortalama konumlarına **ağır ağır** kayarlar. Arkalarında **turuncu, kesikli** iz bırakırlar. İzler uzaktan yakına doğru silinir.
  - Ardından ofansif ortalama konumlarına kayarlar. Arkalarında **neon yeşil, kesikli** iz bırakırlar. Aynı silinme efekti.
- **Pas Ağı:** Topun oyuncudan oyuncuya akışı. Sadece statik oklar değil.
- **Isı Haritası:** Zaman içinde akan, takımın sahayı hangi bölgede daha çok kullandığını gösteren renk geçişleri.
- **Altyazılar:** Ofansif için neon yeşil, defansif için turuncu. Anlaşılır, kısa, vurucu.

## 4. Oyuncu İkonları
- Basit daireler değil, **takım renginde, hafif parlayan, estetik** ikonlar.
- Üzerine gelindiğinde (hover/tap) oyuncunun **xG, xA, pas isabeti, ikili mücadele** gibi kritik metrikleri şık bir kartta görünmeli.
- İsimler saha içinde değil, sadece hover kartında veya kenar çubuğunda gösterilmeli.

## 5. Arayüz Yerleşimi
- **Sekmeler:** "Tüm Maç", "İlk Yarı", "İkinci Yarı". Sitenin genel sekme diline uygun.
- **Takım Seçimi:** Ev sahibi / Deplasman. İkisi aynı anda gösterilmez.
- **Değişiklikler:** Sağ üstte, tıklanabilir. Oyuna girenlerin verisi sahaya yansır, çıkanlar silinir.
