# 03 — Etkileşim kütüphanesi

Kaynak: `prototype/src/card-ui.mjs`, `ui.mjs`, `client/*`. Sözleşmeler bağımsız Astro bileşenlerine taşınabilir; bu prototipte mevcut motorlar veya makaleler değiştirilmez.

| Bileşen | Durumlar ve davranış | Klavye / mobil / hata |
|---|---|---|
| MegaMenu | kapalı, hover-geçici, click-sabit; 100ms açılış niyeti, 180ms leave toleransı; tek panel açık; kategori/alt kategori/öne çıkan dosya | ArrowDown ilk link; üst başlıklar Left/Right; Tab doğal sıra; Escape/dış tıklama/focusout kapanır. Mobil dialog içinde aynı veriyle details |
| HoverCard | kapalı, hover/focus önizleme, click-sabit; kapak/başlık/açıklama/tür/süre; preview bağımsız link; save ayrı düğme | Hover şart değil; mobil Önizleme tıkla. Escape kapatır; focus görünür. Uydurma mini grafik eklenmedi |
| StoryRail | başlangıç/ara/son; native snap, mouse drag, touch swipe; önce/sonra, sayı/progress; autoplay yok | Track Left/Right/Home/End; kartların doğal Tab sırası. Sınırdaki düğme disabled; reduced motion anlık scroll |
| CommandPalette | native modal, boş sorguda kategoriler, filtreli sonuç, sonuçsuz; gerçek linkler | Ctrl/⌘K; input auto-focus, ↑↓, Enter; Escape ve close; native focus trap ve çağırana dönüş. Makale/takım/oyuncu/teknik ekip/araştırma/konu/arşiv demo indeksi |
| FacetedArchive | yedi boyut; aynı boyutta OR, boyutlar arası AND; aktif çip, clear, arama, grid/list; tekrar eden URL params | Native checkbox/fieldset/label; back/forward/reload; sonuç sayısı live. Geçersiz URL filtreleri whitelist ile atılır. Boş sonuçta clear |
| Selection | ekle/çıkar, aynı cihazda kalıcı | aria-pressed; depolama exception görünür toast, uygulama çökmez. Hesaplar arası senkron iddiası yok |
| ReadingNav | sticky bölüm listesi, aktif bölüm, okuma yüzdesi | Gerçek hash link; mobil kompakt details; scroll hijack yok; rAF ile bir ölçüm/tick |
| EditorialPanel | native details; kaynak/metodoloji/ek açıklama/ilişkili okuma | Enter/Space ve native açık durum; kapalı içerik focus sırasına girmez |
| ChartWorkbench | alan/olay/tablo; hücre tooltip+status; threshold, perspektif; zoom/pan/reset; geniş dialog; SVG/CSV | Hücre arrow/Home/End/Enter; tablo eşdeğeri. Görünüm desteklemiyorsa zoom/export disabled. Geniş dialog Escape/focus dönüşü |
| RecordPlayback | duraklat/oynat, hız .5/1/2, zaman, önce/sonra, sekans, oyuncu vurgusu | Yalnızca kayıt seçimi; interpolasyon yok. Reduced motion play disabled, scrub/step çalışır. Tab gizlenince/doküman terk edilince durur |

## Veri sözleşmeleri

Kart: id/title/description/type/topic/league/teams/season/author/date/minutes/cover. Takım ve kişi isimleri açıkça demo; dokuz doğrulanmamış arşiv makalesi indekse alınmadı. Search mevcut `normalizeText` Türkçe mantığının prototip kopyasını kullanır. Kaynak dosyanın production sürümü değişmez.

Saha: sentetik96 hücre ve2×3 olay. Hücreler `demoCells`; sekanslar `sequences`, olaylar yalnızca t/x/y/player/action. Hücum/savunma yalnızca gösterim yönünü değiştirir; hesaplanmış gerçek futbol metriği üretmez. Oyuncu filtresi eksik veri üretmez; ilgili kayıtları vurgular. Her kontrol gerçekten veri/görünüm etkisi yapar. CSV mevcut eşik üzerindeki hücreleri dışa aktarır; SVG yalnızca desteklenen grafik görünümünde bulunur.

## Erişilebilirlik sınırı

WCAG2.2 AA hedef; native dialog/details, görünür focus, semantik headings/nav/figure, live sonuç, min44px kontrol, reduced motion. Otomatik axe taraması tam AA sertifikası değildir. Gerçek ekran okuyucu, gerçek iOS/Android cihaz ve Firefox/Safari ayrıca kontrol edilmeli. Test edilenler ve test edilemeyenler QA_REPORT.md'de ayrılır.
