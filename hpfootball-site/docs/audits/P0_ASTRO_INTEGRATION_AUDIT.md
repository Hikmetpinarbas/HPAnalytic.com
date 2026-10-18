# P0 Astro Integration Audit — Stitch editoryal tasarımı × mevcut Astro uygulaması

| Alan | Değer |
|---|---|
| Sürüm / tarih | v1 · 2026-10-18 |
| Rol | HPAnalytic P0 — Senior Astro Architect & Integration Auditor |
| Denetlenen kod | `origin/release/approved-20261018` @ `4083c67` (production'a giden son onaylı commit; `site-hp-standard-v2` = `f1533e5` ile `src/` açısından aynı) |
| Raporun dalı | `ccr-f68724d5-m5c8th` (taban `3a3d755`, production'ın 2 commit gerisinde). F03–F06, F08 ve F09 bu tabanda da var. **F01 ve F02 yalnızca production'da var:** `756e25e` commit'indeki açık tema geçişi (`--bg #050505 → #f5f1e8`) koyu tema için yazılmış sabit renkleri açık zemine taşıdı. |
| Yöntem | Kaynak okuma · `npm test` · `astro check` · `astro build` · `astro preview` (workerd) · Playwright/Chromium ölçümü (320/375/430/1440, 8 rota, JS kapalı mod) · scratch worktree'de minimal düzeltme denemesi |
| Kod değişikliği | **Yok.** Bu daldaki tek değişiklik bu rapor ve `docs/audits/p0-repro/` altındaki tekrar üretilebilir testler. Deploy, merge ve push yapılmadı. |

> **Teknik PASS, görsel kabul değildir.** Bu rapordaki hiçbir PASS, Stitch kompozisyonunun görsel olarak doğru uygulandığı anlamına gelmez. O karşılaştırma bu oturumda **BLOCKED** (bkz. B1–B3).

---

## 0. Yönetici özeti

1. **Stitch entegrasyonu denetlenemedi, çünkü kaynak yok.** Ne Stitch export'u (ekranlar/HTML/tokenlar) ne de `HPANALYTIC_PREMIUM_LAYERED_VISUAL_STANDARD_V1.md` ve `LEGACY_GRAPHICS_QUARANTINE_20261019.md` bu repoda ya da 40+ remote dalın hiçbirinde bulunuyor. Görevde verilen `/home/userland/HP_WORKSPACE/...` yolu ve `hp/stitch-reuse-p0-20261018` dalı da bu ortamda yok. Stitch görev kartı (`HPWEB-STITCH-DESIGN-20261010-005`) `READY_FOR_HANDOFF_NOT_ACKED` durumunda, sonuç dosyası da yok. **Kabul edilmiş tasarım ile kod arasındaki fark bugün ölçülemez.**
2. **Mevcut site teknik olarak sağlam.** 362/362 test geçiyor, `astro check` 0 hata veriyor, build temiz. Yayın kabul filtresi 8 public okuma noktasının hepsinde tutarlı. Canonical ve sitemap birbiriyle uyumlu, `/control` kapalı. 4 genişlikte yatay taşma, konsol hatası ve yinelenen ID yok. Mobil menü erişilebilir, JS kapalıyken de navigasyon görünüyor.
3. **11 bulgu var ve her biri kırmızı dönen bir testle tekrar üretilebiliyor.** En kritik üçü:
   - **F03/F04 (Grafik Fabrikası):** Makale gövdesindeki görseller hak/provenance kapısından geçmeden yayımlanıyor. `assessVisualExport` hiçbir render veya build yolunda çağrılmıyor.
   - **F05:** Service worker, hash'siz `/visuals/*` dosyalarını cache-first ve süresiz servis ediyor. Bir grafik aynı yolda güncellenirse geri dönen okur eski grafiği görmeye devam eder.
   - **F01:** Makale sayfasında WCAG AA kontrast hatası var (2.4–3.3:1).
4. **Doğrulanmış minimal düzeltme:** 11 bulgudan 6'sının (F01, F02, F05, F06, F08, F10) düzeltmesi scratch ortamında denendi. Repro testleri yeşile döndü, mevcut 362 test bozulmadı, build temiz. Düzeltmeler **uygulanmadı**, `proposed-minimal-fixes.NOT_APPLIED.patch` olarak bırakıldı. Kalan 5 bulgu (F03, F04, F07, F09, F11) editoryal, bilgi mimarisi veya Foundry kararı gerektiriyor.

### Durum tablosu

| # | Bileşen | Ciddiyet | Repro | Durum |
|---|---|---|---|---|
| F01 | Makale meta / disclosure kontrastı | HIGH (a11y) | static | OPEN · fix scratch'te doğrulandı |
| F02 | Açık disclosure'da koyu panel | MEDIUM | static | OPEN · fix doğrulandı · görsel onay gerekli |
| F03 | Gövde içi görseller hak kapısını atlıyor | HIGH (hak/kanıt) | static | OPEN · NEEDS_DECISION (editoryal) |
| F04 | `visual-export-gate` hiçbir yolda çağrılmıyor | HIGH (Foundry) | static | OPEN · NEEDS_DECISION (manifest şeması) |
| F05 | SW hash'siz görselleri süresiz cache'liyor | HIGH (Foundry teslimi) | static | OPEN · fix doğrulandı |
| F06 | Boş yüzeyler indekslenebilir | MEDIUM (SEO/sözleşme) | build | OPEN · fix doğrulandı |
| F07 | Masaüstü/mobil menü paritesi | LOW–MEDIUM | build | OPEN · NEEDS_DECISION (IA) |
| F08 | `TacticalCanvas` sabit ID'ler | LATENT (carousel riski) | static | OPEN · fix doğrulandı |
| F09 | İç linkler canonical değil (her tık 307) | MEDIUM (perf/SEO) | build | OPEN · fix önerildi, denenmedi |
| F10 | 404'te canonical + noindex | LOW | build | OPEN · fix doğrulandı |
| F11 | Görsellerde width/height yok (CLS) | LOW–MEDIUM | build | OPEN |
| F12 | Ana menüde tek öğe; masthead olmayan bölümleri vaat ediyor | MEDIUM (IA) | browser probe | OPEN · NEEDS_DECISION |
| F13–F16 | Küçük bulgular (aşağıda) | LOW | — | OPEN |
| B1 | Stitch ↔ Astro kompozisyon farkı | — | — | **BLOCKED** (kaynak yok) |
| B2 | Carousel | — | — | **BLOCKED / NOT PRESENT** |
| B3 | Zorunlu standart belgeleri | — | — | **BLOCKED** (belgeler yok) |

---

## 1. Engeller (BLOCKED) — dürüst sınır

### B1 · Stitch kompozisyon farkı
- **Aranan:** Stitch ekranları, export HTML/CSS, tasarım tokenları ve rota–bileşen eşlemesi.
- **Bulunan:** Yalnızca `docs/operations/agent-tasks/HPWEB-STITCH-DESIGN-20261010-005.md` görev kartı var. Durumu `READY_FOR_HANDOFF_NOT_ACKED`, beklenen çıktı `docs/operations/results/HPWEB-STITCH-DESIGN-20261010-005_RESULT.md` hiçbir dalda yok. `design-botanical-editorial-*` dalı farklı bir iş: 171 dosyada 4.491 satır siliyor ve testleri kaldırıyor. Kabul edilmiş Stitch tasarımı olduğuna dair kanıt yok, bu yüzden referans alınmadı.
- **Açılması için gereken:** Stitch export'u (HTML veya PNG, 320/375/430/1440) ve "kabul edildi" kaydı repoya ya da bu oturuma eklenmeli. Gelince yapılacak fark analizi şablonu §4'te.

### B2 · Carousel
- **Bulgu:** Kodda carousel, slider veya scroll-snap bileşeni **yok** (`src/components/*` 11 bileşen; grep sonucu boş). Denetlenecek mevcut davranış bulunmuyor.
- **Stitch carousel içeriyorsa kabul kriterleri (sözleşme önerisi):** WAI-ARIA APG carousel deseni (`aria-roledescription="carousel"`, slide başına `group`). Otomatik oynatma yok; varsa duraklat düğmesi ve `prefers-reduced-motion` desteği. JS kapalıyken CSS scroll-snap ile kaydırılabilir liste. Slaytlar yalnızca yayın kabul filtresinden geçmiş içerikten üretilir (boş yüzey = gizli yüzey). Slayt içinde `TacticalCanvas` kullanılacaksa önce F08 düzeltilmeli.

### B3 · Zorunlu okuma belgeleri
`docs/standards/HPANALYTIC_PREMIUM_LAYERED_VISUAL_STANDARD_V1.md` ve `docs/visual-governance/LEGACY_GRAPHICS_QUARANTINE_20261019.md` hiçbir dalda yok. Quarantine belgesinin tarihi (2026-10-19) bu denetimin tarihinden (2026-10-18) bir gün sonra. Bunların yerine mevcut en yakın sözleşmeler kullanıldı: `HP_VISUAL_FOUNDRY_CONTRACT_V0.md`, `EDITORIAL_VISUAL_ADMISSION_20261017.md`, `HANDOFF_EDITORIAL_VISUAL_20261017.md`. **Bu belgelere dayanan karşılaştırmalar UNKNOWN sayılmalı.** Özellikle `public/visuals/launch-series-01/*.svg` dosyaları production'da herkese açık servis ediliyor ama hiçbir yayımlanmış sayfa bunlara bağlanmıyor. Bunların karantina kapsamında olup olmadığı belge gelmeden bilinemez.

---

## 2. Bulgular

Her bulgu şu alanlarla verildi: component | source | observed behavior | defect | evidence | risk | minimal fix | test | status. Repro dosyaları `hpfootball-site/` içinden çalıştırılır:
`node --test docs/audits/p0-repro/p0-static.repro.mjs` (build gerektirmez) · `npm run build && node --test docs/audits/p0-repro/p0-build.repro.mjs`.
Repro dosyaları `npm test` glob'unun (`tests/*.test.mjs`) **dışında** tutuldu, böylece CI düzeltme gelene kadar yeşil kalıyor. Bir düzeltme uygulandığında ilgili test `tests/` altına taşınmalı.

### F01 — Makale meta ve kanıt disclosure kontrastı
- **component:** makale sayfası. Konu çipleri (`.article-topics span`), "Karşı kanıt ve sınırlar" / "Kaynakları incele" özetleri (`.article-disclosure summary`) ve liste öğeleri.
- **source:** `src/styles/global.css:610` (`#978e81`), `:622` (`#a69d90`), `:627-628` (`#9e968a`), `:630` (`#a69d90`).
- **observed:** Renkler koyu temadan kalma sabit hex değerleri, açık zemin `--bg #f5f1e8` üzerinde duruyor.
- **defect:** WCAG 2.2 SC 1.4.3 (AA 4.5:1) ihlali. **Tema geçişi regresyonu:** `3a3d755` tabanında (`--bg #050505`) aynı renkler geçiyordu. `756e25e` ile production'a girdi. Mevcut `light-shell-regression.test.mjs` testi bunu yakalamıyor.
- **evidence:** Hesaplanan oranlar: topics 2.87:1, summary 2.37:1. Tarayıcıda ölçülen: topics 3.23, summary/li 2.68 (`.article-page` zemininde). Ölçüm 320, 375, 430 ve 1440 genişliklerinin hepsinde tekrarlandı.
- **risk:** Kanıt sınırı ve karşı kanıt metni, yani HPAnalytic'in epistemik sözleşmesinin görünen yüzü, en düşük okunurlukta kalıyor.
- **minimal fix:** Bu beş renk `var(--muted)` ile değiştirilir (4.72:1).
- **test:** `p0-static.repro.mjs › F01` (cascade'de son `color` değerini çözer ve kontrastı hesaplar).
- **status:** OPEN · fix scratch'te doğrulandı (repro yeşil, 362/362 test, build OK).

### F02 — Açık disclosure'da koyu temadan kalma panel
- **component:** `.article-disclosure[open] .disclosure-ghost`
- **source:** `global.css:626`, `background:rgba(12,10,7,.72)` + `backdrop-filter`
- **observed:** Açık temada açılan karşı kanıt paneli koyu-gri bir kutu oluyor. Kutudaki metin `#a69d90`, kontrastı ≈3.26:1.
- **defect:** Tema geçişinden kalan stil. Hem kontrast hatası hem tutarsız bir yüzey.
- **evidence:** Ölçülen `ghostBg rgba(12,10,7,0.72)` ve `liColor rgb(166,157,144)`. Ekran görüntüsü yalnızca scratch'te tutuldu.
- **risk:** Okunurluk düşüyor. Panel tasarım sistemine ait değilmiş gibi görünüyor.
- **minimal fix:** `background:var(--surface)` (F01 ile birlikte).
- **test:** `p0-static.repro.mjs › F02`
- **status:** OPEN · fix doğrulandı · **görsel onay gerekli** (panelin nasıl görüneceği tasarım kararı).

### F03 — Makale gövdesindeki görseller hak ve provenance kabulünü atlıyor (Grafik Fabrikası)
- **component:** makale render hattı (`[...id].astro` → `<Content/>`)
- **source:** `src/pages/articles/[...id].astro:130` yalnızca frontmatter'daki `visualAssets` alanını `rights_status` ile süzüyor. `src/content/articles/event-only-boundary.md:52,153,207` ise 3 SVG'yi markdown `![]()` sözdizimiyle doğrudan gömüyor.
- **observed:** Yayımlanmış tek makalede 3 görsel var. Hiçbirinde `visual_id`, `rights_status`, `truth_role` veya `claim_supported` kaydı yok, buna rağmen render ediliyorlar.
- **defect:** İki ayrı görsel giriş yolu var ve kabul kuralı yalnızca birine uygulanıyor. Foundry sözleşmesinin "her görünür nesne provenance taşır" kuralı gövde görsellerinde uygulanmıyor.
- **evidence:** `F03` hata mesajı: `event-only-boundary.md: /visuals/event-data/evidence-surfaces.svg rendered without a visualAssets rights record`.
- **risk:** Hak durumu doğrulanmamış veya sentetik bir görsel, insan onaylı bir makalenin içinde "kanıt" görünümüyle yayımlanabilir. Bugünkü görseller açıklayıcı/editoryal şemalar. Somut bir ihlal **gözlenmedi**, ama kapı yok.
- **minimal fix (karar gerekli):** (a) Bu 3 görsel için frontmatter'a `visualAssets` kaydı (`ORIGINAL`, `truth_role: EXPLANATORY`) eklenir ve F03 testi `tests/` altına taşınır. Bu editoryal bir kayıt ve **onay dışında otomatik eklenmedi**. Ya da (b) gövdeye yalnızca kayıtlı `visual_id` ile görsel eklemeye izin veren bir remark kuralı yazılır.
- **test:** `p0-static.repro.mjs › F03`
- **status:** OPEN · NEEDS_DECISION (editoryal sahip)

### F04 — `visual-export-gate` hiçbir yolda çağrılmıyor (Grafik Fabrikası)
- **component:** `src/lib/visual-export-gate.mjs`
- **source:** `assessVisualExport` yalnızca `tests/visual-export-gate.test.mjs` içinden çağrılıyor. `src/` ve `scripts/` altında kullanıcısı yok.
- **observed:** Kapı birim testi geçiyor ama hiçbir build veya render adımı onu çalıştırmıyor.
- **defect:** Kapı var ama hiçbir şeyi engellemiyor. Testin yeşil olması, kapının uygulandığı anlamına gelmiyor.
- **evidence:** `F04` hata mesajı: `assessVisualExport is only referenced by its own unit test`.
- **risk:** Grafik Fabrikası'ndan gelen bir PNG, SVG veya MP4, imza, hak kanıtı, kaynak hash'i veya iddia kontrolü olmadan `public/visuals/` klasörüne girip yayımlanabilir.
- **minimal fix (karar gerekli):** Foundry'nin scene manifest JSON'u tanımlanır (`assetId`, `mimeType`, `rightsStatus`, `rightsEvidence`, `sourceHash`, `claimsChecked`…). Sonra bir test, public içerikten referans verilen her `/visuals/**` dosyası için manifest kaydı ister ve kaydı `assessVisualExport` ile `READY_FOR_HUMAN_REVIEW` durumuna göre doğrular. Manifest şeması Foundry'nin (görsel iş akışı) kararı olduğu için **uydurulmadı**.
- **test:** `p0-static.repro.mjs › F04`
- **status:** OPEN · NEEDS_DECISION (Visual Foundry sahibi)

### F05 — Service worker hash'siz varlıkları süresiz cache-first servis ediyor
- **component:** `public/sw.js` (PWA)
- **source:** `sw.js:39-46`. Navigate olmayan her same-origin GET isteği önce cache'ten dönüyor. Sürüm kontrolü yok, `CACHE='hpanalytic-shell-v2'` sabit.
- **observed:** `/visuals/*.svg`, `/social-card.png`, `/favicon.svg` ve (etkinleştirildiğinde) `/api/youtube.json`, ilk yüklemeden sonra ağdan bir daha istenmiyor.
- **defect:** Yalnızca içerik-hash'li `/_astro/*` dosyaları cache-first için güvenli. Diğerleri bayatlıyor.
- **evidence:** Kod incelemesi ve `F05` testi.
- **risk:** **Grafik Fabrikası teslim yolunu doğrudan bozuyor.** Bir grafik düzeltmesi (yanlış sayı, hak geri çekme) aynı dosya adıyla yayımlanırsa, PWA'sı kurulu okur eski ve hatalı grafiği süresiz görür. Kanıt sözleşmesi açısından bu kritik bir risk.
- **minimal fix:** Cache-first dalının önüne `if (!url.pathname.startsWith('/_astro/')) return;` eklenir (3 satır). Mevcut kurulumlardaki eski girdileri temizlemek için `CACHE` adını `-v3` yapmak da önerilir (denemeye dahil edilmedi).
- **test:** `p0-static.repro.mjs › F05`
- **status:** OPEN · fix doğrulandı (PWA testleri `pwa-installability` ve `pwa-successor` yeşil).

### F06 — Boş yüzeyler public ve indekslenebilir
- **component:** `/analysis/`, `/culture/`, `/visual-lab/`
- **source:** `src/pages/analysis.astro` (boş durum mesajı yok), `culture.astro`, `visual-lab.astro`. Hiçbiri `noindex` vermiyor.
- **observed:** Bu üç sayfa menüde ve sitemap'te gizli, ama doğrudan URL ile 200 dönüyor ve indekslenebilir. `/analysis/` başlıktan sonra tamamen boş. `/visual-lab/` sayfası `/analysis` sayfasına link veriyor.
- **defect:** "EMPTY SURFACE = HIDDEN SURFACE" sözleşmesi yalnızca menü seviyesinde uygulanıyor.
- **evidence:** `F06` hata mesajı: `/analysis/ is indexable but lists no admitted article`. Önizleme: `/analysis/` → 200.
- **risk:** Arama motorunda zayıf (thin) sayfa olarak görünür. Okur, link takip ederek boş sayfaya düşer.
- **minimal fix:** Her sayfada kabul edilmiş içerik sayısı hesaplanır ve `noindex={empty}` geçilir (3 dosya, toplam ≈10 satır). Sayfalar silinmez, yalnızca indeksten çıkarılır.
- **test:** `p0-build.repro.mjs › F06`
- **status:** OPEN · fix doğrulandı.

### F07 — Masaüstü ve mobil menü aynı hedefleri göstermiyor
- **component:** `BaseLayout.astro:128` / `MobileNavigation.astro`
- **source:** Mobil menüye `[...navigation, archiveLink]`, masaüstü menüye yalnızca `navigation` veriliyor.
- **observed:** Mobil menüde HİKMET ve ARŞİV var. Masaüstünde yalnızca HİKMET (artı ARA ikonu) var, ARŞİV yalnızca footer'da.
- **defect:** Aynı site iki farklı bilgi mimarisi sunuyor.
- **evidence:** `F07` diff çıktısı (`/archive` yalnızca mobilde). Browser probe: `panelLinks ["HİKMET","ARŞİV"]`, `navItems ["HİKMET"]`.
- **risk:** Düşük-orta. Masaüstü okur arşive yalnızca footer'dan ulaşabiliyor. Stitch masthead'i başka bir menü öngörüyorsa bu fark büyür.
- **minimal fix (karar gerekli):** İki menüye aynı listeyi vermek. Arşivin masaüstünde görünmesi bir bilgi mimarisi kararı olduğu için uygulanmadı.
- **test:** `p0-build.repro.mjs › F07`
- **status:** OPEN · NEEDS_DECISION

### F08 — `TacticalCanvas` sabit SVG ID'leri (carousel ve tekrar kullanım riski)
- **component:** `src/components/TacticalCanvas.astro`
- **source:** `id="hp-pitch-title"`, `"hp-pitch-desc"`, `"reveal"`, `"force-arrow"`. CSS de bunlara bağımlı: `global.css:501` `fill:url(#reveal)`, `:503` `marker-end:url(#force-arrow)`.
- **observed:** Bugün sayfa başına tek örnek var, çakışma yok (probe: `dupIds` boş).
- **defect:** Bileşen aynı sayfada iki kez render edilirse (carousel, makale içi, Stitch hero varyantı) ID'ler çakışır. Bu durumda `aria-labelledby` yanlış başlığa bağlanır, gradient ve ok işaretleri ilk örneğe bağlanır.
- **evidence:** `F08` hata mesajı: `hard-coded ids collide when rendered twice: hp-pitch-title, hp-pitch-desc, reveal, force-arrow`.
- **risk:** LATENT. Carousel entegrasyonu ile aktif hale gelir.
- **minimal fix:** `idPrefix` prop'u eklenir (varsayılan `hp-pitch`). `fill` ve `marker-end` referansları CSS'ten SVG özniteliğine taşınır, yoksa ID'ler değişince CSS referansı kopar. **Bu tuzak denemede yakalandı.** Tarayıcıda `fill url(#hp-pitch-reveal)` ve `marker url(#hp-pitch-force-arrow)` çözüldüğü doğrulandı.
- **test:** `p0-static.repro.mjs › F08`
- **status:** OPEN · fix doğrulandı (pitch testleri yeşil).

### F09 — İç linkler canonical değil, her tıklama bir 307 yönlendirmesi üretiyor
- **component:** ana sayfa, makale, footer ve menü linkleri
- **source:** `index.astro` ve `[...id].astro` içinde `` `/articles/${id}` ``. `site-surfaces.mjs` href'leri `/about`, `/archive`, `/research`, `/scouting`.
- **observed:** Ana sayfadaki 7 benzersiz iç linkin 5'i 307 dönüyor (`/about` → `/about/` vb.). Canonical, sitemap ve JSON-LD ise doğru biçimde `/`.
- **defect:** Link biçimi canonical sözleşmesiyle (`canonical-path.mjs`) uyuşmuyor.
- **evidence:** `curl` ile 307 doğrulandı. Hata mesajı: `F09` → `['/about','/archive','/articles/event-only-boundary','/research','/scouting']`.
- **risk:** Her gezinmede fazladan bir round-trip (mobilde algılanır gecikme) ve crawler'lar için gereksiz yönlendirme.
- **minimal fix:** Link üreten noktalarda `canonicalPath()` kullanılır. **Bağlı değişiklik:** `[...id].astro:128` içindeki `nextQuestion` regex'i `^\/articles\/[a-z0-9-]+\/?$` olmalı ve `slice` sondaki `/` işaretini atmalı. Yoksa canonical link'e geçilince "sıradaki soru" kutusu sessizce kaybolur. Birden çok testin href biçimini sabitleme ihtimali nedeniyle **denenmedi**.
- **test:** `p0-build.repro.mjs › F09`
- **status:** OPEN · fix önerildi, doğrulanmadı.

### F10 — 404 sayfası hem `noindex` hem canonical veriyor
- **component:** `BaseLayout.astro:79`, `404.astro`
- **observed:** `404.html` içinde `<link rel="canonical" href=".../404/">` ve `noindex` birlikte bulunuyor.
- **defect:** Çelişkili sinyal, ayrıca var olmayan bir `/404/` URL'sine canonical veriliyor.
- **minimal fix:** `{!noindex && <link rel="canonical" …/>}`. Aynı değişiklik SSR `/search` sayfasını da kapsar, orada da tutarlı.
- **test:** `p0-build.repro.mjs › F10`
- **status:** OPEN · fix doğrulandı.

### F11 — Makale görsellerinde boyut bilgisi yok (CLS)
- **component:** markdown içindeki `<img>` (F03 ile aynı 3 görsel)
- **observed:** `width` ve `height` öznitelikleri `null`, `loading` da yok.
- **risk:** Layout shift (CLS), özellikle mobilde.
- **minimal fix:** F03(b) için önerilen kayıtlı görsel bileşeni `viewBox`'tan boyut türetir. Ara çözüm olarak markdown yerine `<img width height loading="lazy">` kullanılabilir.
- **test:** `p0-build.repro.mjs › F11`
- **status:** OPEN

### F12 — Ana menüde tek öğe; masthead olmayan bölümleri vaat ediyor
- **component:** `BaseLayout.astro:115` masthead + `site-surfaces.mjs` `SURFACES`
- **observed:** Yayımlanmış tek makalenin bölümü `method`, onun da kendi rotası yok. Bu yüzden masaüstü menüde yalnızca "HİKMET" görünüyor. Masthead ise sabit metinle "ANALİZ / ARAŞTIRMA / KÜLTÜR" yazıyor. `/research` ve `/scouting` yöntem sayfaları sitemap'te ve ana sayfa keşif bölümünde var, menüde yok. `sitemap-0.xml.ts:10` yorumundaki "always-visible method pages in navigation" iddiası koda göre yanlış.
- **defect:** Bilgi mimarisi, masthead metni ve sitemap üç farklı site tarifi veriyor.
- **evidence:** Browser probe `navItems: ["HİKMET"]` (320–1440). `sitemap-0.xml` içinde `/research/` ve `/scouting/` mevcut.
- **risk:** Okur yönelimi zayıf. Stitch editoryal tasarımı muhtemelen dolu bir bölüm menüsü varsayıyor (UNKNOWN, bkz. B1).
- **minimal fix (karar gerekli):** `research` ve `scouting` kalıcı yöntem sayfaları olarak `kind:'always'` yapılır, ya da sitemap yorumu düzeltilir. Masthead bölüm listesi `navigation`'dan türetilir.
- **test:** `p0-responsive.browser.mjs` raporunda `navItems` ve masthead metni karşılaştırması.
- **status:** OPEN · NEEDS_DECISION

### F13–F16 — Küçük bulgular
| # | Bileşen | Gözlem | Minimal öneri | Durum |
|---|---|---|---|---|
| F13 | `TacticalCanvas` oyuncu numaraları | 960 genişliğindeki viewBox'ta 12px yazı, 375 genişlikte ≈5px'e iniyor, okunmuyor. SVG `role="img"` + `desc` olduğu için a11y ihlali değil. Probe'un "3.24 kontrast" uyarısı **yanlış pozitifti** (SVG `fill` kullanıyor, gerçek oran >10:1). | Mobilde numaraları gizlemek veya ölçeklemek; görsel karar. | OPEN · görsel |
| F14 | Sayfa başlıkları ve dil | "Visual Lab", "Football Culture", "Research", 404'te "HOME" ve "404 · UNKNOWN": `lang="tr"` bir sitede İngilizce görünen metin. `culture.astro` `section` prop'unu geçmiyor, bu yüzden menüde `aria-current` oluşmuyor. | Editoryal metin düzeltmesi; `section="culture"`. | OPEN |
| F15 | JSON-LD `Article` | `image`, `dateModified` ve `publisher.logo` yok. | `social-card.png` + `date` ile tamamlanır. Logo, kimlik onayı beklediği için şimdilik dışarıda bırakılır. | OPEN |
| F16 | Build gürültüsü | `BaseLayout` her sayfada var olmayan `research` ve `visuals` koleksiyonlarını okuyor. Sayfa başına 2 `[WARN]` üretiyor ve gerçek uyarıları gömüyor. | Boş klasör + `.gitkeep`, ya da sayılar tek bir modülde bir kez hesaplanır. | OPEN |

---

## 3. Korunan sözleşmeler — teknik PASS (görsel kabul değildir)

| Sözleşme | Kanıt | Sonuç |
|---|---|---|
| Yayın kabul filtresi | 8 public `getCollection` noktasının hepsi `isPublic` ve `isPublicEditorialItem` (`PUBLISHED` ∧ `HUMAN_APPROVED` ∧ `sourceClaimsValidated`) kullanıyor. Kabul edilmemiş 3 makale 404 dönüyor (`/articles/position-role/` → 404). | PASS |
| Kabul edilmemiş makaleye "sıradaki soru" linki | `event-only-boundary` → `/articles/position-role` hedefi `safeNextQuestion` tarafından gizleniyor. | PASS (F09 düzeltmesinde regex'e dikkat) |
| Canonical / sitemap / robots | Mutlak `https://www.hpanalytic.com`, prerender rotalarda `/` ile bitiyor, `/search` sonda `/` olmadan. Sitemap girdileri canonical ile birebir aynı. `robots.txt` `/control/` için Disallow içeriyor. | PASS (istisnalar: F06, F10) |
| `/control` kapalı | Middleware 404 + `noindex`; SW `/control/` yolunu atlıyor. | PASS |
| Güvenlik başlıkları | Statik dosyalar için `_headers`, SSR için middleware; CSP birebir aynı. | PASS |
| Mobil menü (APG disclosure) | `aria-expanded` doğru; Escape menüyü kapatıp odağı tetikleyiciye geri veriyor; dışarı tıklama ve focus-out menüyü kapatıyor. JS kapalıyken masaüstü menü görünüyor, tetikleyici gizli. | PASS |
| Responsive | 320/375/430/1440 × 8 rota: yatay taşma 0, konsol hatası 0, yinelenen ID 0. | PASS (teknik) |
| Hareket | Tek seferlik `IntersectionObserver`, `prefers-reduced-motion` ile devre dışı kalıyor. | PASS |
| Test / tip / build | `npm test` 362/362, `astro check` 0 hata (106 hint), `astro build` OK. | PASS |
| Logo | Production hâlâ mevcut HP monogramını kullanıyor. Foundry V0'a göre bu, yeni adaylar için tohum olarak **yasak** ama "kabule kadar production dosyaları değişmez" kuralıyla tutarlı. Yeni logo üretilmedi. | Sözleşmeye uygun · kimlik kararı açık |

---

## 4. Stitch kaynağı geldiğinde yapılacak fark analizi (şablon)

Kaynak gelince her ekran şu tabloya işlenir. Bugünkü sütun §2 bulgularına dayanır:

| Stitch ekranı | Astro rotası | Mevcut bileşen(ler) | Bugünkü teknik durum | Fark (Stitch geldikten sonra) |
|---|---|---|---|---|
| Ana sayfa | `/` | hero + `TacticalCanvas`, reading-desk, featured, hikmet-spotlight, launch-directory, match-centre, evidence-bridge, research/scouting spotlight | Kabul filtresine bağlı; tek makale nedeniyle reading-desk gizli (section `method`) | UNKNOWN |
| Makale | `/articles/[id]/` | `EvidenceBadge`, `MechanismCard`, disclosure, `KnowledgeRelations`*, adjacent-nav | F01, F02, F03, F11 | UNKNOWN |
| Bölüm listeleri | `/analysis/`, `/culture/`, `/scouting/` | `SectionListing`, `ArticleCard` | F06, F12 | UNKNOWN |
| Arşiv / arama | `/archive/`, `/search` | `IntentDiscovery`, arama | PASS (teknik) | UNKNOWN |
| Mobil header / menü | tümü | `MobileNavigation`, `Logo`, `NavigationIcon` | F07, F12 | UNKNOWN |
| Carousel | — | yok | B2 | UNKNOWN |

\* `KnowledgeRelations` ve `KnowledgePath` bileşenleri var ama hiçbir sayfada import edilmiyor. Bu durum ayrıca karar gerektirebilir (bulgu olarak açılmadı; muhtemelen bilinçli bir askı).

Farklar her ekran için 4 genişlikte ölçülecek: tipografi ölçeği, grid, token renkleri (`--bg`, `--ink`, `--gold`, `--muted`), boşluklar, etkileşim durumları (focus, menü, arama), kontrast. `p0-responsive.browser.mjs` aynı rotaları bu genişliklerde ölçmek için hazır.

---

## 5. Önerilen uygulama sırası (onay sonrası, ayrı bir dalda)

1. **F05** (SW) + **F01/F02** (kontrast): düşük risk, yüksek etki, düzeltmeler doğrulanmış.
2. **F06/F10**: SEO hijyeni, düzeltmeler doğrulanmış.
3. **F08**: carousel veya Stitch entegrasyonundan **önce**, düzeltme doğrulanmış.
4. **F03/F04**: Visual Foundry manifest şeması kararlaştırıldıktan sonra. Grafik Fabrikası'nın public yayına bağlanmasının **ön koşulu**.
5. **F09, F07, F12**: bilgi mimarisi kararıyla birlikte.
6. **B1/B2**: Stitch export'u gelince §4 tablosu doldurulur.

`docs/audits/p0-repro/proposed-minimal-fixes.NOT_APPLIED.patch` F01, F02, F05, F06, F08 ve F10 düzeltmelerini içeriyor. Patch `release/approved-20261018` (`4083c67`) üzerine hazırlandı; `TacticalCanvas` farkı nedeniyle `3a3d755` tabanına doğrudan uygulanmaz. **Bu dalda uygulanmadı.**

## 6. Ekler
- `docs/audits/p0-repro/p0-static.repro.mjs`: F01–F05, F08 (build gerektirmez).
- `docs/audits/p0-repro/p0-build.repro.mjs`: F06, F07, F09, F10, F11 (`npm run build` gerekir).
- `docs/audits/p0-repro/p0-responsive.browser.mjs`: 4 genişlik × 8 rota; taşma, kontrast, ID, görsel boyutu, menü ve JS kapalı mod ölçümü (`playwright`; mevcut `tests/browser/` kalıbıyla aynı).
- `docs/audits/p0-repro/proposed-minimal-fixes.NOT_APPLIED.patch`: önerilen, doğrulanmış, uygulanmamış düzeltmeler.
- Ölçüm sonucu: denetlenen commit (`4083c67`) üzerinde 11/11 repro **kırmızı**. Bu dalın tabanında (`3a3d755`) F01 yeşil (koyu tema), diğer static repro'lar kırmızı. Patch scratch'te uygulandığında 6/11 yeşil, kalan 5'i karar bekliyor; `npm test` 362/362.
