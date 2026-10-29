# 04 — Görsel sistem ve yaratıcı yönler

Yeni prototip mevcut palette, logo veya şablonu zorunlu kabul etmez. Eski site dosyaları aynen kalır. Üç yön aşağıdaki tasarım hipotezleridir; üçünün de ayrı çalışan site olarak geliştirildiği iddia edilmiyor.

| Alan | Editorial Immersive | Interactive Minimal | Experimental Digital |
|---|---|---|---|
| Tipografi | 80–108px yayın başlığı, 20px serif okuma, veri için mono | 48–72px sans başlık, 18px metin, küçük ve düzenli metadata | 96–140px asimetrik başlık, güçlü ölçek farkları |
| Renk | Kâğıt, mürekkep, petrol yeşili; sınırlı sıcak vurgu | Açık gri/beyaz, koyu mürekkep, tek eylem rengi | Koyu zemin, asit yeşil, soğuk mavi; yüksek kontrast |
| Grid | 12 sütun; lead 5/7; metin 66ch | 12 sütun, araç paneli 3/9; kontrollü veri yoğunluğu | Asimetrik 4/8, tam genişlik kesintiler |
| Boşluk | 8px ritim; bölüm arası 64–96 | 4/8px ritim; 16–48px araç ve panel araları | İçeriğe göre 24–120px; dikkatli boşluk gerilimi |
| Kart | Görsel öncelikli kapak, serif başlık, ince kural | Düz yüzey, net seçili durum, metadata hizası | Büyük tipografik görsel ve alternatif ölçek |
| Menü | Yayın bölümleri + öne çıkan dosya | Arama önceliği, açık disclosure, küçük araçlar | Tam ekran keşif; yön kaybı riski |
| Hover | Kapakta hafif geometri, bilgi önizlemesi | Renk/çizgi/focus ile net geri bildirim | Daha belirgin yer değiştirme ve kompozisyon |
| Hareket | 180–240ms durum açılışı; autoplay yok | 100–180ms mikro tepki, native kaydırma | 300–600ms sahne geçişi; daha yüksek bakım |
| Mobil | Tek lead, tek sütun okuma, kompakt TOC | Details/checkbox/native dialog; erişilebilir kontroller | Tam ekran bölümler; düşük cihaz maliyeti dikkat ister |

## Birleşik öneri ve uygulanan yön

Editorial Immersive'in tipografik ve editoryal hiyerarşisi + Interactive Minimal'ın kontrol ve focus disiplini. Experimental Digital'dan yalnızca kendi SVG kapaklarımızın büyük tipografi/alan ilişkisi alındı. Sürekli WebGL, scroll hijack veya otomatik carousel yok. Amaç başlığı okumayı, içerik bulmayı ve grafiği anlamayı kolaylaştırmak.

## Gerçek token'lar

Kaynak `prototype/src/tokens.css`.

- Kâğıt `#f3f0e8`, yüzey `#fcfaf5`, mürekkep `#172e32`, ikincil metin `#526361`.
- Petrol `#163e40`, limon `#dfed9b`, sıcak vurgu/focus `#a63e2d`, veri mavisi `#305c74`.
- Çizgi `#c8ccc3`: metin rengi olarak kullanılmaz. Etkileşim bilgisi yalnızca renkle aktarılmaz; açık/kapalı, seçili, disabled ve canlı metin durumları bulunur.
- UI Arial/Helvetica; editoryal Georgia/Times; veri Courier New. Harici font isteği ve font lisansı bağımlılığı yok. Gerçek üretim tipografisi görsel değerlendirme sonrası seçilebilir.
- Boşluk: 4/8/12/16/24/32/48/64/96px. İçerik sınırı 1440px; okuma 66ch. Ortak breakpoint 520/800/1100/1600; QA 360/390/768/1024/1440/1920. Grafik, viewport değil kapsayıcı genişliğine uyar.
- Kenarlar düz; yuvarlatma yalnızca nokta/oyuncu sembolünde. Kapaklar özgün dekoratif SVG; gerçek fotoğraf veya olay kanıtı gibi sunulmaz. Vosse gerçek fotoğrafı bu prototipte çözülmedi.
- Animasyon 160/240ms, cubic-bezier(.2,.7,.3,1). Opacity/transform; temel gezinme native scroll. Reduced motion tüm transition/animation'ı kapatır ve saha autoplay yerine adımlamayı korur.
- Ana düğmeler ve form kontrol satırları en az44px; üstteki ikincil Seçkim bağlantısı 28px. Grafik hücreleri görsel yoğunluk nedeniyle daha küçük olabilir, klavye ve tablo eşdeğeri vardır. Tooltip bilgiye tek erişim yolu değildir.

## Teknik tercihler ve paket maliyeti

| Yaklaşım | Karar/gerekçe | Runtime paket maliyeti |
|---|---|---|
| CSS transition/animation | Menü ve önizleme, reduced motion ile | 0 npm bağımlılığı; gerçek CSS byte sayısı QA'da |
| Web Animations API | CSS yeterli, ek soyutlama gerekmedi | 0, kullanılmadı |
| Motion / GSAP | İhtiyaç yok; karmaşık timeline yok | Eklenmedi, 0 gönderilen byte |
| Radix UI / React Aria | Mevcut Astro'ya React hydration eklememek; native dialog/details | Eklenmedi |
| Embla | Native scroll-snap + küçük controller ihtiyacı karşılıyor | Eklenmedi |
| D3 | 96 sentetik hücre için gereksiz; gerçek motorlar korunuyor | Eklenmedi |
| SVG | Kapak, chart hücre/olay görünümü, dışa aktarım | Yerleşik; ölçüm dosya bazlı |
| Canvas | Mevcut üretim grafikleri korunur; yeni demo için gerekmedi | Yeni bağımlılık yok |
| WebGL | Bu içerik ve donanım hedefi için gerekçe yok | Eklenmedi |
| Playwright / axe / Lighthouse | Yalnızca QA ortamında mevcut kilitli araç paketi | Üretim runtime'a gönderilmez |

Bu kararlar ana Astro uygulamasının yeniden yazımı değildir. Prototip build'i saf Node ile semantik HTML üretir; rota başına ağır filtre/chart modülü dinamik yüklenir. Statik HTML'de başlıklar, metin ve linkler mevcuttur. Arama/filtre/oynatma JS gerektirir; no-JS mesajı ve temel rota linkleri vardır. İzole prototip noindex'tir, production SEO'su değiştirilmez.
