# P0 öncelik matrisi ve dal adlandırma envanteri

| Alan | Değer |
|---|---|
| Sürüm / tarih | v1 · 2026-10-18 |
| Dayanak | `P0_ASTRO_INTEGRATION_AUDIT.md` (commit `d0011e7`, remote `origin/ccr-f68724d5-m5c8th` ile doğrulandı) |
| Durum | **READY_FOR_INTEGRATION_REVIEW** |
| Bu belgenin yapmadığı | Patch uygulamaz. Dal silmez, yeniden adlandırmaz, force-push yapmaz. Production, merge veya deploy işlemi içermez. Envanter salt okunurdur. |

---

## 1. İki ayrı kod durumu: karıştırılmamalı

| | Denetlenen durum | Entegrasyon çalışma durumu |
|---|---|---|
| Ref | `origin/release/approved-20261018` @ `4083c67` (production'a giden son onaylı commit) | UserLAnd yerel dalı `hp/stitch-reuse-p0-20261018` |
| Konum | GitHub remote; bu oturumda okundu, build edildi ve ölçüldü | Yalnızca kullanıcının UserLAnd ortamı (`/home/userland/HP_WORKSPACE/HPAnalytic/stitch-integration-p0-20261018/`) |
| Bu oturumdaki erişim | Tam | **Yok.** Dal GitHub'a push edilmemiş; yol bu konteynerde yok. |
| Bulguların geçerliliği | F01–F11 bu durumda ölçüldü (11/11 repro kırmızı) | **UNKNOWN.** UserLAnd dalı `4083c67`'den sonra ayrılmışsa ve Stitch veya carousel değişiklikleri içeriyorsa, bulguların bir kısmı orada düzelmiş, değişmiş ya da yenileri eklenmiş olabilir. |

**Kural:** Bu matristeki hiçbir PASS veya OPEN durumu UserLAnd dalına otomatik olarak aktarılamaz. Entegrasyon incelemesine başlarken iki komut çalıştırılmalı:

```
git merge-base hp/stitch-reuse-p0-20261018 4083c67
node --test docs/audits/p0-repro/p0-static.repro.mjs   # UserLAnd dalında
```

Ardından `npm run build && node --test docs/audits/p0-repro/p0-build.repro.mjs` çalıştırılır. Sonuç bu matrisin yanına ikinci bir sütun olarak yazılır.

Ek not: Bu raporun bulunduğu dal (`ccr-f68724d5-m5c8th`) `3a3d755` tabanından türedi. O tabanda koyu tema geçerli olduğu için F01 orada yeşil. Bu, üçüncü bir kod durumu olarak kayda geçer.

---

## 2. P0 bulgu öncelik matrisi (F01–F11, önem sırasına göre)

Ölçek: **P0** = birleştirme ve yayın engeli · **P1** = Stitch/carousel entegrasyonundan önce çözülmeli · **P2** = planlı hijyen.

| Sıra | Bulgu | Sınıf | Neden bu seviyede | Kanıt (repro) | Minimal fix durumu | Karar sahibi |
|---|---|---|---|---|---|---|
| 1 | **F03** Gövde görselleri hak/provenance kapısını atlıyor | **P0 · blokaj** | Hak durumu doğrulanmamış bir görsel, insan onaylı bir makalede kanıt görünümüyle yayımlanabiliyor. Kanıt sözleşmesinin doğrudan ihlali. | `p0-static › F03` kırmızı | Karar bekliyor (kayıt ekleme ya da remark kuralı) | Editoryal |
| 2 | **F04** `visual-export-gate` hiçbir yolda çağrılmıyor | **P0 · blokaj** | F03'ün yapısal kökü: Grafik Fabrikası çıktısını durduracak bir mekanizma yok. Birim testinin yeşil olması yanıltıcı. | `p0-static › F04` kırmızı | Karar bekliyor (Foundry manifest şeması) | Visual Foundry |
| 3 | **F05** SW hash'siz görselleri süresiz cache'liyor | **P0 · blokaj** | Düzeltilmiş veya hakkı geri çekilmiş bir grafik, PWA'sı kurulu okurda eski haliyle kalıyor. Geri çağırma (recall) yolu yok. | `p0-static › F05` kırmızı | Doğrulandı (3 satır; ek öneri: `CACHE` v3) | Teknik |
| 4 | **F01** Makale meta/disclosure kontrastı 2.4–3.3:1 | **P0 · blokaj** | Production'da WCAG AA ihlali; kanıt sınırı ve karşı kanıt metni en düşük okunurlukta. `756e25e`'den gelen bir regresyon. | `p0-static › F01` kırmızı | Doğrulandı (5 renk → `var(--muted)`) | Teknik |
| 5 | **F02** Açık disclosure'da koyu panel (≈3.26:1) | **P0 · blokaj** (F01 ile aynı kontrast kümesi) | Aynı kontrast ihlali, panel açıldığında da sürüyor. | `p0-static › F02` kırmızı | Doğrulandı · panel görünümü görsel onay ister | Teknik + görsel |
| 6 | **F08** `TacticalCanvas` sabit ID'ler | **P1** (carousel birleşirse P0) | Bugün çakışma yok. Carousel veya ikinci bir örnek eklenince `aria-labelledby`, gradient ve ok işaretleri yanlış örneğe bağlanır. | `p0-static › F08` kırmızı | Doğrulandı (CSS `url(#…)` referansları SVG özniteliğine taşınır) | Teknik |
| 7 | **F06** Boş yüzeyler indekslenebilir | **P1** | "Boş yüzey = gizli yüzey" sözleşmesi doğrudan URL'de kırılıyor; arama motorunda zayıf sayfa görünür. | `p0-build › F06` kırmızı | Doğrulandı | Teknik |
| 8 | **F09** İç linkler canonical değil (5/7 link 307) | **P1** | Her gezinmede fazladan bir istek. Düzeltmede `nextQuestion` regex'ine bağımlılık var. | `p0-build › F09` kırmızı | Önerildi, denenmedi | Teknik |
| 9 | **F11** Görsellerde width/height yok | **P2** | Layout shift (CLS). F03'ün kayıtlı görsel bileşeniyle birlikte çözülür. | `p0-build › F11` kırmızı | Açık | Teknik |
| 10 | **F07** Masaüstü/mobil menü paritesi | **P2** | ARŞİV yalnızca mobil menüde. Bilgi mimarisi kararı. | `p0-build › F07` kırmızı | Karar bekliyor | Ürün/IA |
| 11 | **F10** 404'te canonical + noindex | **P2** | Çelişkili sinyal, etkisi düşük. | `p0-build › F10` kırmızı | Doğrulandı | Teknik |

**P0 blokaj kümesi (kullanıcı tanımı):** görsel hak kontrolü (**F03 + F04**), service worker'dan gelen eski görseller (**F05**), kontrast (**F01 + F02**). Bu beş bulgu kapanmadan Stitch veya carousel entegrasyonu `release/*` hedefine birleştirilmemeli.

**Kapanma ölçütü:** İlgili repro test `docs/audits/p0-repro/` altından `tests/` altına taşınır ve `npm test` içinde yeşil kalır. Görsel onay gerektirenler (F02) ayrıca `HUMAN_APPROVED` kaydı alır. Teknik PASS, görsel kabul yerine geçmez.

**Patch durumu:** `proposed-minimal-fixes.NOT_APPLIED.patch` hiçbir dala uygulanmadı ve kendiliğinden uygulanmayacak. Patch `4083c67` üzerine hazırlandı, `3a3d755`'e doğrudan uygulanmaz. UserLAnd dalına uygulanabilirliği UNKNOWN.

---

## 3. Jules carousel çalışmasıyla olası çakışma alanları

**Gözlem:** GitHub'daki 36 dalın ve tüm PR head'lerinin hiçbirinde carousel, slider veya scroll-snap UI kodu yok. Bulunan tek eşleşme, sosyal medya türev etiketi `INSTAGRAM_CAROUSEL` (`content-control.mjs`, `studio/lib/model.mjs`). Jules'un carousel değişiklikleri remote'a ulaşmamış. Bu yüzden aşağıdaki liste **çıkarım**, gözlem değil. Çıkarımın dayanağı: carousel'in doğası gereği dokunacağı dosyalar ve Jules'un önceki dallarının değişiklik deseni.

Jules'un önceki dalları: `design-botanical-editorial-*` (`BaseLayout.astro`, `global.css`; 171 dosya, −4.491 satır, test silmeleri dahil), `fix-p0-audit-*` (20 değişen, 30 yeni dosya: `BaseLayout`, `MobileNavigation`, `[...id].astro`, `index.astro`, `content.config.ts`, `visual-export-gate.mjs` …).

| Alan | Dosya(lar) | Çakışma mekanizması | Bağlı bulgu | İnceleme kontrolü |
|---|---|---|---|---|
| Ana sayfa kompozisyonu | `src/pages/index.astro`, `src/lib/home-surfaces.mjs` | Carousel muhtemelen reading-desk/featured bölümlerinin yerine geçer. Tek yayımlanmış makaleyle "boş yüzey = gizli yüzey" kuralı tek slaytlı carousel'i gizlemeli. | F06 sözleşmesi | Slaytlar `isPublic` ∧ `isPublicEditorialItem` ile mi üretiliyor? 0 veya 1 öğede ne görünüyor? |
| Global stiller | `src/styles/global.css` (tek sahip; `global-css-single-owner.test.mjs`) | Aynı dosyada F01/F02 satırları (610–630), açık tema tokenları ve 4 ayrı `prefers-reduced-motion` bloğu var. Metin düzeyinde çakışma olasılığı yüksek. | F01, F02, F08 (`url(#reveal)` 501–503) | Carousel stilleri ayrı bir blokta mı? Sabit hex renk eklenmiş mi (light-shell regresyon riski)? |
| Layout ve hareket | `src/layouts/BaseLayout.astro` | Hareket gözlemcisinin seçici listesi (satır 144), menü, `noindex`/canonical. F10 düzeltmesi aynı dosyada. | F07, F10, F12 | Otomatik oynatma var mı? `prefers-reduced-motion` ve duraklatma destekleniyor mu? |
| Saha görseli | `src/components/TacticalCanvas.astro` | Slaytta tekrar kullanılırsa ID çakışması olur. | **F08** | F08 düzeltmesi carousel'den **önce** birleştirilmeli. |
| Carousel görselleri | `public/visuals/**`, `public/sw.js`, `content.config.ts` | Slayt görselleri `/visuals` altına sabit adla konursa SW onları süresiz tutar; frontmatter'a görsel alanı eklenirse hak kapısı devre dışı kalabilir. | **F03, F04, F05** | Her slayt görselinin `visualAssets` hak kaydı var mı? SW düzeltmesi önce mi? |
| CSP | `public/_headers`, `src/middleware.ts` | `script-src 'self' 'unsafe-inline'`: CDN'den yüklenen bir carousel kütüphanesi (Swiper vb.) production'da **engellenir**. | — | Bağımlılık npm ile mi paketleniyor? CSP değişikliği güvenlik incelemesi ister. |
| Testler | `tests/home-*.test.mjs` (≈10 dosya), `hpa-motion`, `light-shell-regression`, `mobile-navigation`, `tactical-caption-integrity` | Ana sayfa yapısını sabitleyen testler kırılır. Jules'un önceki deseni test silmekti. | — | **Kural:** Hiçbir test silinmemeli veya atlanmamalı. Değişen sözleşme gerekçesiyle güncellenmeli. Diff'te `tests/` silmeleri ayrıca gözden geçirilmeli. |
| Erişilebilirlik | yeni bileşen | Carousel APG deseni gerekiyor (`aria-roledescription`, slayt `group`, klavye, JS kapalıyken scroll-snap). | B2 kriterleri | `p0-responsive.browser.mjs` carousel sayfasında yeniden çalıştırılmalı (taşma 0, ID çakışması 0, kontrast). |

**Önerilen birleştirme sırası:** P0 kümesi (F01–F05) → F08 → Jules carousel → Stitch kompozisyonu. Bu sıra, carousel'in yeni bir bulguyu mevcut kusurların arkasına gizlemesini önler.

---

## 4. Dal adlandırma standardı (öneri)

### 4.1 Biçim

```
<tür>/<kapsam>-<konu>[-<yyyymmdd>]
```

| Tür | Kullanım | Tarih |
|---|---|---|
| `feature/` | Yeni yetenek veya bileşen | isteğe bağlı |
| `fix/` | Hata veya regresyon düzeltmesi | isteğe bağlı |
| `review/` | İnceleme veya denetim; kod değiştirmeyen belge dalları dahil | **zorunlu** |
| `qa/` | Kabul ve test kanıtı | **zorunlu** |
| `release/` | Yayın adayı veya onaylı yayın | **zorunlu** |
| `research/` | Keşif, prototip, tasarım denemesi; birleştirme hedefi değil | isteğe bağlı |
| `integration/` | Birden çok dalın birleştirildiği hazırlık dalı | **zorunlu** |

### 4.2 Kurallar
1. Küçük harf ve kebab-case. Türkçe karakter kullanılmaz (`ı→i`, `ş→s`). Toplam uzunluk 60 karakteri geçmez.
2. **Ajan, araç veya sağlayıcı adı kullanılmaz:** `ai`, `claude`, `ccr`, `jules`, `gemini`, `copilot`, `opencode`, `chatgpt`, `stitch`, `antigravity`, `cursor`, `bot` vb. Google Stitch bir tasarım aracı olduğu için bu kapsama girer; `hp/stitch-reuse-p0-20261018` adı da kurala uymaz. Aracın adı dalda değil, commit gövdesinde veya PR açıklamasında provenance olarak kayda geçer.
3. Rastgele kimlik veya oturum sonekleri kullanılmaz (`-612613195815946281`, `-m5c8th`).
4. Kapsam sabit bir sözlükten seçilir: `site`, `editorial`, `visual`, `studio`, `search`, `pwa`, `security`, `ci`, `content`.
5. Tarih, dalın açıldığı gündür ve ISO düz biçimde yazılır (`20261018`).
6. Kişi veya marka öneki (`hp/`) yerine tür öneki kullanılır. Sahiplik, dal adından değil commit yazarından okunur.

**Bilinen kısıt:** Bulut oturumları dal adını kendileri atıyor (`ccr-<id>`, bu rapordaki dal dahil). Bu dalları silmek veya yeniden adlandırmak yasak. Uygulanabilir yol şu: yeni işler standart adla açılır, mevcut adlar yalnızca bu envanterde eşlenir.

**Kapsam dışı türler:** Mevcut `ops/`, `docs/`, `design/`, `consolidation/`, `p0/` önekleri 7 türlük listede yok. Önerilen eşleme: `ops/` → `integration/` ya da `qa/`; `design/` → `research/`; `consolidation/` → `integration/`; `p0/` → `fix/` ya da `release/`. Belge dalları için ayrı bir `docs/` türü istenirse bu bir karar konusudur, burada eklenmedi.

---

## 5. Salt okunur dal envanteri (36 remote dal, 2026-10-18 itibarıyla)

Bu tablo **yalnızca bir eşlemedir**. Hiçbir dal silinmedi, yeniden adlandırılmadı veya force-push edilmedi.

| Mevcut dal | Son commit | Uyum | Sorun | Önerilen nötr ad (yalnız eşleme) |
|---|---|---|---|---|
| `ccr-f68724d5-m5c8th` | 2026-10-18 `d0011e7` | ✗ | ajan oturum öneki + rastgele kimlik | `review/site-p0-integration-audit-20261018` |
| `release/approved-20261018` | 2026-10-18 `4083c67` | ✓ | — | — |
| `site-hp-standard-v2` | 2026-10-18 `f1533e5` | ✗ | türsüz; varsayılan dal | `release/site-standard-v2` *(varsayılan dal; değiştirmek ayrı bir karar)* |
| `qa/consolidation-20261018` | 2026-10-18 `756e25e` | ✓ | — | — |
| `design-botanical-editorial-612613195815946281` | 2026-10-18 `a9389d3` | ✗ | türsüz + rastgele kimlik | `research/visual-botanical-theme-20261018` |
| `consolidation/site-candidate-20261017` | 2026-10-17 `3a3d755` | ~ | tür listede yok | `integration/site-candidate-20261017` |
| `hp/launch-fixes-20261016` | 2026-10-17 `0e0afb1` | ✗ | kişi/marka öneki | `fix/site-launch-20261016` |
| `fix-p0-audit-1919469555412111665` | 2026-10-16 `ef85dd9` | ✗ | `/` yok + rastgele kimlik | `fix/site-a11y-landmarks-20261016` |
| `ccr-578e5607-k088nh` | 2026-10-15 `92356b8` | ✗ | ajan öneki + kimlik | `feature/studio-editorial-contracts-20261015` |
| `release/safety-only-20261015` | 2026-10-15 `114b14d` | ✓ | — | — |
| `release/p0-accepted-20261015` | 2026-10-15 `63d3902` | ✓ | — | — |
| `p0/closure-20261015` | 2026-10-15 `e77e7f6` | ~ | tür listede yok | `fix/site-p0-closure-20261015` |
| `consolidation/canonical-20261015` | 2026-10-15 `1a9ecf9` | ~ | tür listede yok | `integration/site-canonical-20261015` |
| `integration/parallel-consolidation-20261014` | 2026-10-14 `7709f9c` | ✓ | — | — |
| `fix-control-and-api-16982957828486222985` | 2026-10-14 `407ccb7` | ✗ | `/` yok + rastgele kimlik | `fix/security-control-youtube-20261014` |
| `ops/claude-discovery-20261014` | 2026-10-14 `e2a208d` | ✗ | ajan adı + tür listede yok | `feature/search-intent-discovery-20261014` |
| `ops/userland-knowledge-20261014` | 2026-10-14 `221c440` | ~ | tür listede yok; `userland` ortam adı | `feature/editorial-knowledge-relations-20261014` |
| `design/monogram-identity-20261014` | 2026-10-14 `b8dd369` | ~ | tür listede yok | `research/visual-monogram-identity-20261014` |
| `ccr-d463f858-2jqa10` | 2026-10-14 `6019dd5` | ✗ | ajan öneki + kimlik | `qa/ci-visual-release-draft-20261014` |
| `qa/integration-20261014` | 2026-10-14 `6cb5ee7` | ✓ | — | — |
| `review/hpanalytic-release-20261011-439285348508613704` | 2026-10-13 `9d9b2d6` | ✗ | rastgele kimlik soneki | `review/ci-release-sha-verification-20261013` |
| `ops/cloud-drive-worker-20261013` | 2026-10-13 `758982d` | ~ | tür listede yok | `integration/ci-cloud-worker-20261013` |
| `release/go-20261014` | 2026-10-12 `e614c2f` | ✓ | — | — |
| `qa/hpanalytic-exact-20261012` | 2026-10-12 `09bc5ff` | ✓ | — | — |
| `qa/hpanalytic-acceptance-20261012` | 2026-10-12 `ef5efad` | ✓ | — | — |
| `feat/night-search-query-20261012` | 2026-10-12 `79e11d9` | ~ | `feat/` → `feature/` | `feature/search-query-20261012` |
| `ops/site-ci-isolated-20261012` | 2026-10-12 `562ee02` | ~ | tür listede yok | `integration/ci-site-isolated-20261012` |
| `review/hpanalytic-release-20261011` | 2026-10-11 `ed314c4` | ✓ | — | — |
| `fix/json-ld-script-escape` | 2026-10-10 `20d42f5` | ✓ | — | — |
| `jules-11492507885411553862-0f13094a` | 2026-10-09 `1a26e37` | ✗ | ajan adı + kimlik | `review/site-interface-regression-20261009` |
| `integration/hpanalytic-unified-20261009` | 2026-10-09 `2a21d04` | ✓ | — | — |
| `fix/sitemap-canonical-trailing-slash` | 2026-10-09 `b346036` | ✓ | — | — |
| `ccr-35db03bc-gb996o` | 2026-10-09 `59b9b85` | ✗ | ajan öneki + kimlik | `qa/site-p0-release-repair-20261009` |
| `ccr-88842542-k09nnx` | 2026-10-08 `fe3bfca` | ✗ | ajan öneki + kimlik | `fix/site-header-search-label-20261008` |
| `release-pack-01-candidate` | 2026-10-08 `9ecb912` | ✗ | `/` yok | `release/pack-01-candidate-20261008` |
| `hpanalytic-build-handoff` | 2026-10-06 `9c04521` | ✗ | türsüz | `release/site-build-handoff-20261006` |
| *(UserLAnd, remote'ta yok)* `hp/stitch-reuse-p0-20261018` | — | ✗ | kişi öneki + araç adı (`stitch`) | `integration/editorial-layout-p0-20261018` |

**Özet (36 remote dal):** 13 uyumlu (✓) · 8 kısmen uyumlu (~, tür listede yok) · 15 uyumsuz (✗). Uyumsuzların 7'si ajan veya araç adı ya da oturum öneki (`ccr-` ×5, `claude`, `jules`) taşıyor, 4'ü rastgele kimlik soneki içeriyor. Remote'ta olmayan UserLAnd dalı da uyumsuz (araç adı). Yeni dallar için bu standart uygulanabilir. Eski dalların yeniden adlandırılması ayrı ve açık bir onay gerektirir; adlandırma açık PR'ları (`pr/38`, `pr/39`, `pr/40` …) etkiler.

---

## 6. Son durum

**READY_FOR_INTEGRATION_REVIEW.**

- Denetim commit'i `d0011e7`, `origin/ccr-f68724d5-m5c8th` üzerinde doğrulandı. İçeriği: denetim raporu, 2 dosyada 11 regresyon testi, browser ölçüm betiği ve uygulanmamış patch.
- Patch uygulanmadı. Production, merge veya deploy işlemi yapılmadı. Dal silme, yeniden adlandırma veya force-push yapılmadı.
- İnceleme başlamadan önce gerekenler: UserLAnd dalının GitHub'a görünür olması (push veya patch paylaşımı), Stitch export'u ve kabul kaydı, F03/F04 için editoryal ve Foundry kararı.
