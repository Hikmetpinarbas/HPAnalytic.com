# 07 — Son kalite raporu

## Sonuç ve sürüm bağı

**İzole prototip kabul kapısı başarılı.** Test edilen kod: `6c72574f4c0a4fd78e7cc04e4e3e1a540ca1a340`. Dal: `codex/interaction-prototype-20261029`; başlangıç `ef0b47db116e49618461dd9e26b3bb9384edf095`. Sonraki teslim commit'i yalnızca belge/kanıt günceller; bu rapordaki testler yukarıdaki kod commit'ine bağlıdır.

GitHub Actions: https://github.com/Hikmetpinarbas/HPAnalytic.com/actions/runs/40862642758 — **success**, job123409456428. Kaynak sayısal kanıt `acceptance-evidence.json`. Production deploy yok; mevcut ana uygulama, yayımlanmış makaleler, veri kayıtları ve grafik motorları değiştirilmedi. Prototip Astro'nun public/ dizinine veya üretim rotalarına eklenmedi.

## Testler

| Kapı | Sonuç |
|---|---|
| Mevcut repository testleri |394toplam;378başarılı;0başarısız;16önceden atlanan eski görsel test|
| Yeni durum sözleşmeleri |8/8başarılı; filtre AND/OR,7boyut, URL round-trip, whitelist/uzun sorgu, Türkçe arama, seçki, HTML escaping, kayıt seçimi|
| Birleşik yerel koşu |402toplam;386başarılı;0başarısız;16atlanan|
| Astro check |283dosya;0hata;0uyarı|
| Ana uygulama production build |Başarılı. Eski boş research/visuals koleksiyonları için build bildirimleri sürüyor; check'in0uyarı sonucu ile karıştırılmamalı|
| Saf Node prototip build ve deterministic git diff |Başarılı;4HTML ekranı tekrar üretildi, değişiklik yok|
| Gerçek Chromium işlev/layout kapısı |**78başarılı;0başarısız**|
| axe taramaları |30tarama;0raporlanan ihlal. WCAG2A/AA,2.1A/AA,2.2AA etiketleri; tam erişilebilirlik sertifikası değil|
| Console/runtime/resource hataları |Altı genişlikte0|

Genişlikler360/390/768/1024/1440/1920. Dört ekran×6=24temel viewport kontrolü; buna9akış×6=54işlev kontrolü eklenir.30axe taraması24sayfa+6command dialog durumudur;78işlev kontrolüne yeniden eklenerek toplam şişirilmez.

Doğrulanan akışlar: hover/click-sabit mega menü, Escape/dış tıklama/focus dönüşü, mobil accordion ve dokunma, command gruplama/sonuçsuz/↑↓/native focus trap, carousel Home/End/sınırlar/mouse drag/CDP native touch events, hover kartı/önizleme/kalıcı seçki, URL AND/OR/history/reload/clear/grid-list/boş sonuç, sticky bölüm seçimi/ilerleme/native details, SVG hücre klavye/threshold/tablo/zoom/pan/reset/CSV ve SVG indirme/geniş dialog, sekans/hız/zaman/adım/oyuncu vurgusu ve reduced motion. Reduced motion'da play disabled; scrub ve step çalışır; aktif CSS animasyonu0.

## Üçer mobil Lighthouse koşusunun medyanı

Yerel CI sunucusunda yeni prototip ölçümü; canlı site veya saha Core Web Vitals verisi değildir. Her sayfa üç kez, toplam12koşu. Eşikler performance>=90, accessibility>=95, CLS<=.1; hiçbir eşik gevşetilmedi.

| Ekran | Performans | Erişilebilirlik | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|
| Ana sayfa |100|100|1433ms|0|0ms|
| Makale |100|100|1432ms|0|0ms|
| Araştırma arşivi |100|100|1428ms|0|0ms|
| Etkileşimli analiz |100|100|1505ms|0|0ms|

Analiz sayfasının tekil koşuları100/99/100; medyan100'dür. Bütün tekil koşular100'müş gibi raporlanmaz. Önceki29sayfa dönüşümünün veya eski production makalelerinin puanları bu tabloya taşınmadı.

## Ekran görüntüleri ve önizleme

Gezilebilir, test edilen statik kaynak: https://raw.githack.com/Hikmetpinarbas/HPAnalytic.com/6c72574f4c0a4fd78e7cc04e4e3e1a540ca1a340/hpfootball-site/prototype/index.html . İlk açılışta hizmetin “Open the page” ara ekranı olabilir. Dört ekran ve mobil menü buradan incelenir. Production adresi değildir.

CI'da33tam PNG görüntü:4ekran×6genişlik,3mobil menü ve6command durumu. Buna390ve1440px'de iki gerçek JPEG viewport görüntüsü eklenir. Teslim çalışma alanında bu ikisi `prototype/qa/preview-390.jpg` ve `preview-1440.jpg` olarak CI kaydından byte-byte çözüldü; yeniden çizilmiş görsel değildir. Ham ölçümler, tüm PNG'ler ve Lighthouse JSON çıktıları mevcut Actions kanıtında: https://github.com/Hikmetpinarbas/HPAnalytic.com/actions/runs/40862642758/artifacts/12892262173 . Kullanıcıya yeni ZIP paketi üretilmedi; doğrudan gezilebilir önizleme ve ayrı görüntüler sunulur.

Önceki bağımsız Browser Use geçişi `6afd198d-ef19-49ff-94b5-9048bf1bd7cf`: ilk0c8a0a2sürümünde sayfa/CSS/JS, masaüstü menü/Escape/arama,390px Analiz accordion ve taşma kontrol edildi; engelleyici görsel hata gözlenmedi. Bu geçiş sonCI'ın yerine kullanılmadı. Uzaktaki `outputs/` yolları yerel dosya bağlantısıymış gibi sunulmuyor.

## Başarısız koşular ve düzeltmeler

| Commit / CI | Sonuç ve gerçek neden |
|---|---|
|0c8a0a2 /40860582696|27/78başarılı;51başarısız. Axe inline script yüklemesi sıkıCSP'ye takıldı; testte menünün örttüğü başlığa tıklama ve media-change tamamlanmadan assertion vardı. Başarılı gibi raporlanmadı|
|a99faac /40861588004|70/78başarılı;8başarısız. Test-only axe aynı kaynaklı intercepted script ile, CSP gevşetilmeden çalıştırıldı. Bütün işlevler geçti; archiveARIA ve desteklenmeyen screenshotWebP kaldı|
|fb03cda /40862025772|72/78başarılı;6başarısız. JPEG kanıtı düzeldi. Ayrıntılıaxeçıktısı gerçek hatayı `.archive-grid` üzerindeki `aria-pressed=true` olarak belirledi. Önceki active-filter-group rol eklemesi bu ana nedeni çözmemişti|
|6c72574 /40862642758|78/78başarılı;0başarısız. `button[data-view]` seçicisi yalnızca gerçek görünüm düğmelerini güncelliyor.30axe ve12Lighthouse koşusu başarılı|

Ek gerçek kod iyileştirmeleri: yerel seçki bildirimleri native `selectionchange` ile çakışmayacak biçimde namespace edildi; Escape bekleyen hover timer'ını iptal ediyor. Assertion veya performans eşiği kaldırılmadı.

## Boyutlar, kontrast ve çalışma alanı sınırı

HTML: index35147, archive38606, article25505, analysis23615byte. Runtime kaynak toplamı98386byte; modüllerin ayrı gzip toplamı32949byte. Bunlar network transfer metriği değildir. Route-specific chart/filters dinamik yüklenir. Üretim runtime'a0yeni npm bağımlılığı eklendi; browser/axe/Lighthouse yalnızca izole QA araçlarıdır.

Token kontrast hesabı: ink/paper12.52:1; muted/paper5.56:1; muted/surface6.07:1; white/teal11.57:1; ink/lime11.35:1; rust/paper5.51:1. Gerçek DOM'daki otomatik kontrast kontrolü ayrıca30axe taramasında çalıştı.

Yerel sunucu `listen EPERM 127.0.0.1:8099` nedeniyle açılamadı; terminal proxy bağlantısı başarısız ve yerel Chromium sandbox sınırına takıldı. Bu yüzden yerel browser/build başarısı uydurulmadı. Gerçek production build, browser ve Lighthouse kanıtı GitHub runner'ından alındı. Çalışma alanı git checkout değil, kaynak snapshot'ıdır; ayrı uzak dal API ile korumalı ref güncellemeleri kullanılarak ilerletildi.

## Açık sınırlar ve değerlendirme sonrası kapsam

Gerçek iOS/Android donanımı, Safari/Firefox, NVDA/VoiceOver, ekran büyütme ve yüksek kontrast modu test edilmedi. Gerçek düşük donanımdaFPS/frame pacing ölçülmedi. Chromium touch emülasyonu gerçek cihaz testi diye sunulmaz. Referans araştırmasının test edilmeyen mekanizmaları REFERENCE_RESEARCH.md'de açıkça işaretli; ek grafikli makale geçişleri de kaynaklarıyla kayıtlıdır.

Bu, kullanıcı değerlendirmesine hazır bağımsız prototiptir;29sayfanın yeni sisteme production entegrasyonu değildir. Gerçek içerik/entity indeksi ve SSR adapter'ları, bütün makale şablonlarının taşınması, gerçek cihaz/ekran okuyucu kabulü ve lisanslı Vosse fotoğrafları sonraki aşamalardır. Dokuz tarihsel arşiv makalesi ve ayrı Conte karşılaştırması bu tasarım testleriyle editoryal olarak doğrulanmış sayılmaz. Hiçbiri bu prototipe doğrulanmış içerik diye alınmadı. Genel tasarım, yeni logo veya iki makale bu oturumda canlıya gönderilmedi.
