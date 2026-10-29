# 05 — Dosya bazlı uygulama planı

## Sıra ve kapsam

1. Denetim ve uzak HEAD doğrulaması: tamamlandı. Yeni uzak dal doğrulanmış önceki commit'ten oluşturuldu. Mevcut kaynağa dokunmadan önce başlangıç testleri çalıştırıldı.
2. Yirmi referans: tarayıcı ile gerçek davranış denemeleri. Erişim engelleri ve denenmeyen durumlar ayrı kayıt; her mekanizma için uyarlama kararı.
3. Üç görsel yön ve birleşik sistem: DESIGN_SYSTEM.md. Yeni palette eski palette zorunluluğu yok.
4. Bağımsız statik prototip: `prototype/src/` modüllerinden `prototype/{index,article,archive,analysis}.html`; mevcut Astro/Worker derlemesine eklenmez. Node build/server; üçüncü taraf runtime bağımlılığı yok. Gerçek makalelerin demo içerikle değiştirilmesi yok.
5. `prototype/src/ui.mjs`: ortak header, footer, kapak, kart, menü, rail, accordion, arama dialog, sayfa şablonları. `data.mjs` açık demo kayıtları/varlıklar. `state.mjs`: URL filtreleme/Türkçe arama/sekans seçimi gibi saf mantık. `client/`: menu, palette, rail, filters, reading, chart ve playback lifecycle'ları. Token/CSS ortak.
6. `prototype/tests/`: Node durum testleri ve Playwright kullanıcı akışları. Altı genişlik, dokunma, klavye/focus, modal kapanışı, reduced motion, overflow ve konsol. Accessibility/contrast otomatik kontrol ile manuel gözlem ayrı rapor.
7. Ayrı GitHub Actions: yalnızca test/build; deployment adımı yok. İncelenebilir izole statik önizleme. Önizleme sonrası tasarım revizyonu; production entegrasyonu bu teslimin parçası değil.

## Bağımlılıklar ve maliyet

Üretim runtime: 0 ek npm paket. Yerleşik dialog/details/scroll-snap/SVG/IntersectionObserver ve CSS transitions kullanılacak. Mevcut Türkçe arama yardımcı dosyası prototip build aşamasında kopyalanacak. Playwright ve axe yalnızca CI araçları; uygulamaya gönderilmez. Ölçülmemiş sıkıştırılmış paket sayıları uydurulmaz; build dosya byte ölçümleri QA raporunda.

## Riskler

Proxy ve yerel browser sandbox kısıtları yerel kurulum/testi engelleyebilir. Bu durumda gerçek tarayıcı kanıtı GitHub Actions veya izole tarayıcıdan alınır; çalışmayan testi başarılı göstermemek zorunlu. Ham GitHub önizleme hizmeti erişilebilirliği doğrulanmalı. Yeni interaction prototipi yayın entegrasyonu değildir. Gerçek veri olmadığı sürece oyuncu hareketleri ve filtre meta bilgileri yalnızca açık etiketli demo veridir. Tasarım kararları geliştirilebilir; mevcut çalışma kopyasına reset/merge/force push yok.
