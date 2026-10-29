# 07 — Prototip kalite raporu

## Test kapsamı ve sürüm

İlk prototip kod commit'i: `0c8a0a258991605bd6672e2d52f377bf06779f64`. Dal `codex/interaction-prototype-20261029`; production deploy yok. Ana Astro sayfaları, makaleler, yayın verileri ve mevcut grafik motorları değiştirilmedi.

İlk CI: https://github.com/Hikmetpinarbas/HPAnalytic.com/actions/runs/40860582696 . Bu rapor CI sonuçlarıyla tamamlanacaktır; aşağıdaki bekleyen testler başarılı gibi okunmamalıdır.

## Yerel ölçümler

- Mevcut paket: `node --test --test-isolation=none tests/*.test.mjs` → 394 test; **378 geçti, 0 başarısız, 16 eski test atlandı**.
- Yeni durum sözleşmeleri: `node --test --test-isolation=none prototype/tests/state.test.mjs` → **8 geçti, 0 başarısız**. Çoklu filtre AND/OR, yedi boyut, URL round-trip, whitelist/uzun sorgu sınırı, Türkçe katlama, seçki, HTML escaping, kayıt seçimi.
- Saf Node statik prototip build başarılı; dört semantik HTML ekranı üretildi. Bu, Astro production build ile karıştırılmamalı.
- Yerel Astro bağımlılığı yok. Yerel sunucu `listen EPERM 127.0.0.1:8099` nedeniyle açılamadı; terminal proxy bağlantısı da başarısız. Yerel Chromium denemesi kullanıcı veri dizini/sandbox sınırına takıldı. Yerel tarayıcı sonucu raporlanmıyor.
- İlk HTML boyutları: index35147; archive38593; article25505; analysis23615 byte. Runtime kaynak toplamı98325 byte; modüllerin ayrı ayrı gzip toplamı32939 byte. Bunlar transfer veya Core Web Vitals ölçümü değildir; dinamik modüller her rotada indirilmez.
- Token metin kontrastı formül hesabı: ink/paper12.52:1, muted/paper5.56:1, muted/surface6.07:1, white/teal11.57:1, ink/lime11.35:1, rust/paper5.51:1. Bu değerler tüm hover/focus/örtüşme durumlarının tarayıcı denetimi değildir.

## Gerçek tarayıcı önizleme geçişi

https://raw.githack.com/Hikmetpinarbas/HPAnalytic.com/0c8a0a258991605bd6672e2d52f377bf06779f64/hpfootball-site/prototype/index.html

Bağımsız Browser Use çalışması `6afd198d-ef19-49ff-94b5-9048bf1bd7cf`: sayfa/CSS/JS yüklemesi doğrulandı; console/runtime/resource hatası gözlenmedi; desktop1440 menü-hover/click/Escape ve search; mobile390 Analiz accordion doğrulandı. Engelleyici görsel hata veya mobil yatay taşma gözlenmedi. Servisin ilk “Open the page” ara ekranı tasarımın parçası değildir. Bu kısa geçiş altı genişlikli bütün işlev testi yerine geçmez.

Servis çıktılarındaki `outputs/hpanalytic-home-desktop-1440.png` ve `outputs/hpanalytic-home-mobile-390.png` uzaktaki tarayıcı çalışma alanı yollarıdır; yerel dosya bağlantısı gibi sunulmaz. CI ekran görüntüleri aşağıdaki kapsamla ayrıca üretilir.

## Otomasyon sözleşmesi

`prototype/tests/browser.mjs`:360/390/768/1024/1440/1920 ×4ekran =24temel sayfa kontrolü. Ek akışlar: pinned menu, mobil native touch, focus/Escape/dış kapanış, command sonuçları/↑↓/native trap, carousel sınırları/native touch/mouse drag, kart önizleme ve kalıcı seçki, URL multiselect/history/clear/grid-list/empty, sticky section progress/details, SVG hücre keyboard/threshold/table/zoom/pan/export/expanded modal, playback speed/step/time/sequence/player/reduced motion, console/resource hataları.

Axe WCAG2A/AA,2.1A/AA,2.2AA etiketleri; dört ekran ve command dialog durumları. Sıfır axe ihlali tam WCAG sertifikası değildir. Lighthouse üçer mobil koşu; dört ekran; performance>=90, accessibility>=95, CLS<=.1. Eşik gevşetme yok.

## Açık sınırlar

Gerçek iOS/Android donanımı, Safari/Firefox, NVDA/VoiceOver, ekran büyütme ve yüksek kontrast modu henüz test edilmedi. Gerçek düşük donanımda FPS/frame pacing ölçülmedi. Referansların bütün makale/grafik etkileşimleri doğrulanmadı; araştırma dosyası bunları açıkça işaretler. Gerçek içerik indeksi/SSR entegrasyonu, fotoğraf lisansları ve tüm29sayfanın yeni sisteme geçirilmesi bu prototipin sonraki üretim aşamasıdır. Dokuz tarihsel arşiv makalesi ve ayrı Conte karşılaştırması bu testlerle editoryal olarak doğrulanmış sayılmaz.
