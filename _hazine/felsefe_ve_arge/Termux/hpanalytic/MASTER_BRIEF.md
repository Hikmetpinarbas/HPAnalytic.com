# HPAnalytic — Topyekûn Görev Föyü (Master Brief)

Bu föy, HPAnalytic projesinde çalışan tüm yapay zeka ajanları (ChatGPT, Claude, OpenCode) için ortak bilgi kaynağıdır.

## Projenin Amacı
HPAnalytic; skoru değil, skoru yaratan mekanizmayı okuyan, veri odaklı, sinematik bir futbol analiz platformudur.

## Sistem Mimarisi (Manifesto)
- **Oda A (Site):** `~/hpanalytic/` (Termux içinde). Frontend, Vite, HTML, CSS, JS.
- **Oda B (Pipeline):** `/sdcard/HPAnalytic/` (Android depolama). Python veri işleme.
- **Köprü:** Pipeline JSON üretir, Site bunu okur.
- **Çalışma Kuralı:** Herkes sadece kendi odasında çalışır. Birbirinin dosyalarını ezmez.

## Tasarım Dili (Design System)
- **Tema:** Siber-Taktiksel, Karanlık (Dark mode).
- **Renkler:** Arka plan `#0a0a0c`, Neon Yeşil `#B4FF39`, Turuncu `#FF6B35`, Beyaz `#ffffff`.
- **Fontlar:** Playfair Display (Başlıklar), Inter (Metin), JetBrains Mono (Kod/Veri).
- **Efektler:** Matrix yağmuru, Glitch (bozulma), neon ışımalar.

## Hikmet DNA'sı (İçerik Kuralları)
- Epistemik sıralama: DOĞRULUK → KANIT → BAĞLAM → MEKANİZMA → KARŞI KANIT → KARAR DEĞERİ.
- Cümleler kısa (ort. 12 kelime). Vurucu ol.
- Her paragrafta "X değil, Y" karşıtlığı kullan.
- Metaforlar spor dışından olsun (çöl, makine, laboratuvar).
- "Gözlem" ve "tahmin" kelimelerini KULLANMA. Yerine "Olasılık", "model çıktısı" kullan.
- Her iddiaya sınır cümlesi ekle: "Yanlışsam ne görmeliyim?"

## Mevcut Durum ve Eksikler
- Site canlıda (`hpanalytic.com`) ama kaynak kodları (`src/`) kayıp. Sıfırdan temiz bir şekilde inşa ediliyor.
- Menülerin içi boş. (Analiz, Süper Lig, Top 5, Avrupa, Kadınlar, Data Lab)
- Hazırda bekleyen çok sayıda `.md` yazısı var ama sayfalara entegre edilmemiş.
