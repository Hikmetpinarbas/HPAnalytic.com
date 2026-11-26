# Yayın Defteri — Kabul Envanteri

- Kaynak: `content/yazilar/*.md` → build: `dist/yazi/<slug>.html`
- Üretim: 2026-11-26T15:57:04.883Z (build çıktısından; veri uydurulmaz)
- Kabul kuralı (build-yazi.mjs sözleşmesi): title + geçerli slug + dist çıktısı.
- Tarih kuralı: frontmatter `date` YYYY-MM-DD ise makale ana sayfa "Son Analizler" (HPA_LATEST) akışına girer; eksikse sayfa yayınlanır ama akışa giremez — ticker besleme adaptörü de yalnızca tarihli makaleyi kullanır.
- Veri paketi sütunu: `public/assets/data/<slug>/` varlığı (bilgi amaçlı; paketi olmayan makaleler reddedilmez).

| # | Başlık | Tür | Tarih | Slug | dist HTML | Veri paketi | Akış | Durum |
|---|---|---|---|---|---|---|---|---|
| 1 | Konya 0-4 Galatasaray: Aynı Pas, Farklı Skor | mac | eksik | mac-kon-gal-30-10-2026 | var | — | YOK (tarih eksik) | KABUL |
| 2 | 0.59'dan 2 gol: Batrakov'un gecesi | articles | 2026-11-05 | gs-stuttgart-batrakov-059 | var | — | var | KABUL |
| 3 | Maç Raporu: Liverpool FC vs Fenerbahce | articles | 2026-11-04 | 2026-11-04-fenerbahce-vs-liverpool-fc | var | — | var | KABUL |
| 4 | Fenerbahçe - Liverpool: Maç Analizi | articles | 2026-11-04 | 2026-11-04-fenerbahce-vs-liverpool | var | — | var | KABUL |
| 5 | Galatasaray vs Stuttgart: Geçiş Koridorlarının Haritası | mac | 2026-11-03 | galatasaray-stuttgart-gecis-haritasi | var | — | var | KABUL |
| 6 | Galatasaray Stuttgart’ı Nasıl Yendi? Topa Değil, Tehlikenin Yönüne Hükmetmek | articles | 2026-11-03 | 2026-11-03-galatasaray-vs-stuttgart | var | — | var | KABUL |
| 7 | Galatasaray 2-0 Stuttgart: xG Paradoksu | articles | 2026-11-03 | 2026-11-03-galatasaray-vs-vfb-stuttgart | var | — | var | KABUL |
| 8 | Galatasaray 2-0 Stuttgart: xG Paradoksu | articles | 2026-11-03 | galatasaray-stuttgart-xg-paradoksu | var | var | var | KABUL |
| 9 | Matematik yalan söylemeyi bilmez | articles | 2026-11-03 | articles-matematik-yalan-soylemeyi-bilmez | var | — | var | KABUL |
| 10 | 2002 Dünya Kupası: Şans mı, Mekanizma mı? | articles | 2026-11-02 | 2002-dunya-kupasi-sans-mi-mekanizma-mi | var | — | var | KABUL |
| 11 | Ev Sahibi vs Deplasman: Pipeline Veri Analizi | mac | 2026-10-26 | mac-gs-fb-2026-10-26 | var | — | var | KABUL |
| 12 | Avrupa: Şampiyonlar Ligi'nde Taktiksel Evrim | articles | 2024-05-24 | avrupa-sampiyonlar-liginde-taktiksel-evrim | var | — | var | KABUL |
| 13 | Leicester City: Verinin İsyanı | articles | 2024-05-24 | leicester-city-verinin-isyani | var | — | var | KABUL |
| 14 | Valeriy Lobanovskyi: Bir Takımın Zekâsını Tasarlamak | articles | 2024-05-22 | articles-valeriy-lobanovskyi-takimin-zekasini-tasarlamak | var | — | var | KABUL |
| 15 | Süper Lig: Türk Futbolunun Veri Devrimi | articles | 2024-05-22 | super-lig-turk-futbolunun-veri-devrimi | var | — | var | KABUL |
| 16 | Vosse de Boode: Bilimin Sahayla Buluştuğu Yer | portraits | 2024-04-03 | portraits-vosse-de-boode | var | — | var | KABUL |
| 17 | Kadınlar Futbolu: Anatomik ve Taktiksel Evrim | articles | 2023-10-27 | kadinlar-futbolun-anatomik-ve-taktiksel-evrimi | var | — | var | KABUL |
| 18 | Filenin Sultanları: Anatomi ve Mekanizma | articles | 2023-09-04 | filenin-sultanlari-anatomi-ve-mekanizma | var | — | var | KABUL |
| 19 | Siyah Beyaz Direniş, Londra Esintisi: Beşiktaş - Crystal Palace Analizi | mac | eksik | mac-besiktas-crystal-palace-2026-10-22 | var | — | YOK (tarih eksik) | KABUL |
| 20 | Kadıköy’de Disiplin ve Kaosun Çarpışması: Fenerbahçe - Slavia Prag Analizi | mac | eksik | mac-fenerbahce-slavia-prag-2026-10-20 | var | — | YOK (tarih eksik) | KABUL |
| 21 | Galatasaray 2-1 Fenerbahçe: 20 Şut, 2 Gol — Kanıt ve Sınırları | mac | eksik | mac-galatasaray-fenerbahce-2026-10-26 | var | — | YOK (tarih eksik) | KABUL |
| 22 | Kuzey Fransa'da Verimlilik Dersi: Galatasaray'ın Taktiksel Olgunluğu | mac | eksik | mac-lille-galatasaray-2026-10-21 | var | — | YOK (tarih eksik) | KABUL |

Toplam: 22 kaynak dosya → 22 kabul (5 tanesi tarih eksikliğiyle derleme akışı dışı), 0 red.

## Aksiyon önerisi

- Tarih eksikliği olan maç dosyalarına frontmatter `date` (YYYY-MM-DD) eklendiğinde hem ana sayfa akışına girer hem ticker beslemesine otomatik düşer.
- Bu envanter statik bir anlık görüntüdür; yeniden üretim için build sonrası `node scripts/make-acceptance-inventory.mjs` çalıştırılmalıdır.
