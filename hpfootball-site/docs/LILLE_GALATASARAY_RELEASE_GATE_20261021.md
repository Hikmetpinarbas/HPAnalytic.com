# Lille–Galatasaray — Yayın adayı kontrol kapısı
Tarih: 2026-10-21. Kapsam: `hpfootball-site/src/pages/mac/lille-galatasaray-2026-10-21.astro`.
Çalışma dalı: `editorial/lille-galatasaray-evidence-20261021`.
**Karar: HOLD — production deployment/merge için onay ve kalan testler gerekli.**

## İki paralel iş hattı
- **A / PUBLISH** — Yazı, kaynak, SEO, grafik görünümü, mobil/masaüstü test, yayın provası ve geri dönüş adımları. Öncelik 1.
- **B / ENGINE** — Sürümlemeli analitik veri sözleşmesi, grafik token'ları, Python hazırlıkları ve motor tasarımı. A hattının mevcut hover, touch, carousel, senaryo, saha ve devre etkileşimini değiştirmeyecek; değişiklik olursa aynı PR'de regresyon testi zorunlu.
- Bu iki iş, her yürütme oturumunda birlikte izlenebilir; bu belge kendi başına arka planda otomatik görev çalıştırmaz.

## Doğrulanmış kanıt
- Astro maç sayfası var; SVG saha ve senaryo; olay atlası, üç uzunluk bölgesi ve beş enlem koridoru mevcut.
- `public/js/hp-match-charts.js` grafik motoru mevcut.
- `tests/lille-evidence-editorial-guard.test.mjs` ve `tests/hpa-unified-analytics.test.mjs` kaynak bazlı kontrolleri içeriyor.
- `src/lib/hpa-analytics-contract.mjs`, `src/styles/hpa-chart-tokens.css`, `docs/HPA_UNIFIED_GRAPHICS_ARCHITECTURE_V1.md` ayrı bir mimariyi tanımlıyor; sayfanın tüm grafiklerine **entegre değil**.
- Bu kontrol oturumunda GitHub commit status sorgusu boş liste döndürdü; CI başarılı kabul edilemez.

## Ön yayın kapıları (kanıt olmadan PASS değil)
1. **EDITORIAL — UNKNOWN:** Maç kimliği, tarih, özne ve kaynakların son el kontrolü; Fransa ve Avrupa basını alıntılarının doğruluğu; ölçümlerin farklı maçlara ait oluşunun açık kalması.
2. **DATA — PARTIAL:** Kaynak maç ID, koordinat yönü, 3×5 grid. Dakika damgası bulunmayan olayları 15 dakikalık bantlara uydurmamak.
3. **UNIT / REGRESSION — PARTIAL:** Kaynak düzeyinde sınırlı kontroller geçti; tam `npm test` ve `npm run build` sonucuna ihtiyaç var.
4. **BROWSER — UNKNOWN:** Mobil/masaüstü gerçek render, görünürlük, hover, touch/swipe, klavye, responsive ve bağlantıların doğrulanması.
5. **SEO — UNKNOWN:** Canonical URL, OG, tarih, kapak görseli, sosyal kart ve kırık bağlantı kontrolü.
6. **PREVIEW — UNKNOWN:** Üretim dışı önizleme adresi veya gerçek ekran görüntüleri; kullanıcı onayı.
7. **RELEASE — HOLD:** Onay gelmeden production merge, publish, domain değişimi yok.

## Önizleme ve test komutları
```sh
cd hpfootball-site
npm ci
npm test
npm run build
npm run dev -- --host 127.0.0.1
```
Tarayıcıdan taslak rotası: `/mac/lille-galatasaray-2026-10-21/`. `npm run dev` canlı üretime yayın değildir.

## Geri dönüş ve yayına çıkış
- Önce git commit SHA ve yayınlanan sürüm referansını kaydet.
- Gerçek önizlemeyi incele; kullanıcının açık yayın onayını al.
- Yalnızca doğrulanmış aday commit yayınlanmalı.
- Hata olursa eski üretim commit/snapshot'a geri dön; olay verilerini silme, diğer projelerin branch'lerini birleştirme.

## Anlık NEXT
Önce güvenilir CI/build çıktısı ve gerçek tarayıcı önizlemesi, ardından kaynak/SEO imzası. B hattının geliştirmesi A yayın kapılarını bloke etmemeli.
