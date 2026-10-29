# 01 — Tasarım ve etkileşim denetimi

29 Ekim 2026. İnceleme temeli: `ef0b47db116e49618461dd9e26b3bb9384edf095`. Uzak ref aynı commit olarak doğrulandı. Önceki iki Actions işi başarılı; bunlar yeni prototipin testleri değildir. Başlangıçtaki `npm test`: 96 test dosyası başarılı, başarısız dosya yok. Node'un bu çıktısı tekil assertion sayısı değildir.

## Çalışma kopyası ve yetki

`/workspace/HPAnalytic/hpfootball-site` bir API kaynak kopyası; `.git` geçmişi ve UserLAnd ortamı burada yok. Git status/branch/HEAD/remote komutları bu nedenle başarısız. Yerel değişiklikler korunuyor. Yeni uzak dal: `codex/interaction-prototype-20261029`; doğrulanmış önceki HEAD'den ayrıldı. Canlı domain, deployment, yayın ve logo değiştirilmeyecek. Kaynak incelemesi tamamlandı; canlı masaüstü/mobil tarayıcı incelemesi ayrı kanıt olarak raporlanacak.

## Teknoloji ve içerik mimarisi

Astro ^7.3.6, @astrojs/cloudflare ^14.3.4, TypeScript ^5.9.2; server output, seçili statik sayfalar. Studio özel entegrasyonu ve public archive boundary build hook'u var. React, Motion, GSAP veya Embla ana package.json bağımlılığı değil. Araç QA paketleri ayrı. Tarayıcı ağı erişilemiyor: proxy:8080 bağlantısı başarısız. Yerel Astro bağımlılığı yok; bundan yeni Astro check/build başarısı çıkarılamaz.

Rotalar: `/`, `/analysis`, `/research`, `/scouting`, `/culture`, `/archive`, `/search`, `/reading-list`, `/visual-lab`, `/about`; `/articles/[...id]`, `/monographs/[slug]`; altı açık maç dosyası, `/portraits/vosse-de-boode`; sitemap/robots, YouTube API; `/control/content` ve Studio için özel sınırlar. İçerik: Astro koleksiyonları, public-content/site-editorial-status admission, premier-features ve match-previews kayıtları. Dokuz arşiv yazısı doğrulanmış içerik sayılmıyor.

## İncelenen bileşenler ve güçlü yönler

- `BaseLayout.astro`: tekil kanonik adresler, sosyal meta, SSR arama, içerik görünürlük denetimi, ortak footer. SEO ve içerik kabul sistemi korunmalı.
- `EditorialHeader.astro`: SITE_MENU kaynağı, gerçek disclosure düğmeleri, Escape/dış tıklama/focusout; ikonlar. `MobileNavigation.astro`: mobil disclosure ve scroll lock, Escape ile focus dönüşü.
- `EditorialFront.astro` / `editorial-carousel.ts`: kayıt kaynaklı seçki, native scroll-snap, roving tabs, klavye ve reduced motion; autoplay yok.
- `search.mjs`: Türkçe katlama, AND araması, puanlama, sorgu uzunluk sınırı, SSR sayfalama. Bu mantık prototip aramasında tekrar kullanılabilir.
- `GoalSequence.astro` / `goal-film.ts`: gerçek olay kayıtları, üç sekans, scrub/speed/step ve kaynak sınırı. `FlowSurface.astro` / `flow-surface.ts`: xT canvas, klavye hücre seçimi, erişilebilir değer tablosu. Mevcut hesaplar değiştirilmemeli.
- `OriginalRuntime.astro`: görünürlüğe yakın lazy mount. Vosse bileşenleri ayrı kariyer/araştırma/keeper panellerine bölünmüş.
- Native details ile metodoloji, kaynaklar ve olay dökümü; durum ve kaynak metni grafiğin yanında.

## Zayıf yönler / kaynakla doğrulanan riskler

1. `components/layout/EditorialHeader.astro` ve `components/EditorialHeader.astro` iki farklı uygulama; ayrıca farklı hero/rail bileşenleri var. Hepsi aynı anda kullanılıyor iddiası yok; dosya envanteri tekrar ediyor. Birleştirme öncesi route/import kapsamı test edilmeli.
2. Mega menü pointerenter ile açılıyor; click mevcut açık durumu tersliyor. Hover ile açık paneli tıklayınca kapanıyor; sabitlenmiş durum tanımlı değil. Pointerleave 160ms sonra her zaman kapatıyor. Hover intent/pinned ayrımı gerekiyor.
3. Mobil menü düz bağlantı listesi. Masaüstü alt kategori ve öne çıkan içerik mimarisi mobilde aynı değil.
4. CSS breakpoint'leri 480,520,560,600,650,700,759,760,780,800,820,860,900 ve 901 çevresine dağılmış. Bazıları makaleye özgü haklı ihtiyaç; ortak navigasyon sınırları tutarlılaştırılmalı.
5. global/editorial-continuity/editorial-p0/editorial-motion-v2/editorial-experience gibi birden fazla tasarım katmanı var. Route bazlı CSS ayrımı başlamış; yeni prototip tek scoped token sistemi kullanmalı.
6. Başlık/kapak/okuma/filtre durumları ortak sözleşmeye sahip değil. Kayıtlı seçki ve URL çoklu filtreleri prototipte açık bir durum modeli gerektiriyor.
7. Arama motoru güçlü; command palette takım/kişi/kavram gruplaması için ayrı varlık indeksi ve boş durumlar gerekiyor. Yayımlanmamış içerik aramaya sızmamalı.
8. Sürekli canvas animasyonları olan eski alternatif hero bileşenleri bulunuyor. Yeni prototipte sürekli dekoratif döngü yok.
9. Vosse fotoğraf kullanım hakları açık konu; çizim veya izinsiz fotoğrafla kapatılmamalı.

## Mobil ve masaüstü değerlendirme sınırı

Kaynak okuması hover/touch/klavye desteğinin niyetini gösterir; gerçek davranışı kanıtlamaz. Önceki sürümün 160 viewport kontrolü yeni prototipin kabulü değildir. Yeni prototip için 360/390/768/1024/1440/1920 ayrı tarayıcı testi, gerçek dokunma, focus ve overflow ölçümü planlandı. Canlı site gözlem sonuçları araştırma kanıtlarına eklenecek.

## İçe aktarma kapsamının ek doğrulaması

`rg` ile import kapsamı: TacticalCanvas visual-lab'de, TurnuvaHeader Fenerbahçe–Slavia ve Lille maç sonu sayfalarında kullanılıyor. Derby continuity+p0 katmanlarını birlikte alıyor; GoalSequence/FlowSurface motion-v2'yi alıyor. Alternatif SkillCornerTerminalHero/InteractiveHeroRail/HeroCartography ve layout/EditorialHeader için taranan Astro/MJS importlarında kullanım bulunmadı. Bu, silinmeleri için yeterli gerekçe değildir; kaynaklar korundu. Footer BaseLayout içinde tek ortak HTML bölümü, footer-grid ve içerik görünürlüğüne göre linkler içeriyor.
