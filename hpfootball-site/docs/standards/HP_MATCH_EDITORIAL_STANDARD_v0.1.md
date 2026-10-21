# HPAnalytic — Maç Önü / Maç Sonu Yayın Standardı

**Sürüm:** 0.1 — ÇALIŞMA TASLAĞI / ASGARİ TABAN  
**Durum:** Geliştirilecek; nihai biçim, üst kalite veya otomatik yayın izni DEĞİLDİR.  
**Kaynak referans:** Fenerbahçe–Slavia Prag maç önü makalesi (yapısal örnek), OpenCode araştırma ve editoryal/grafik fabrikası raporları, Lille–Galatasaray çalışmasındaki hata kayıtları.  
**Esas:** Fenerbahçe sayfası örnek alınır, kusursuz/nihai standart sayılmaz. Kopyalama yok; kaynak eleştirisi ve özgün gelişim şart.

## 1. Editoryal amaç
Yayın maç istatistiği gösterisi değil; futbol sorusuna cevap veren, mekanizmayı veriye bağlayan, rakip etkisini hesaba katan özgün analizdir. Okuyucunun öğrendiği, yeni bir futbol ilişkisi olmalı.

## 2. Yedi ortak unsur
1. **Merkezî futbol sorusu:** Savunulabilir taktik gerilim ve tek ana tez.
2. **Kaynak dosyası:** Maç, takım, turnuva, tarih, veri sağlayıcısı, veri tipi, örneklem, kapsama ve doğrulama durumu.
3. **Mekanizma analizi:** Toplu/topsuz fazlar, pas seçenekleri, ikinci aksiyon, geçiş, maç ve skor koşulları; event-only verinin sınırları.
4. **İstatistiksel kanıt:** Kaynak alanı ve payda tanımlı ölçüler, rakip ve skor durumu bağlamı.
5. **Karşı hipotez:** Rakip gücü, alternatif yorum, gözlenemeyen nedenler, örneklem riski.
6. **Görsel anlatı:** Grafiği ancak yeni ve gerekli bir ilişkiyi gösterebiliyorsa seç; aynı iddiayı tekrarlayan görselleri çıkar.
7. **Editoryal sonuç:** Asıl soruya gerekçeli cevap; kanıtın izin vermediği kesinliği verme.

## 3. Maç türleri arasındaki zorunlu fark
| Maç önü (PREMATCH) | Maç sonu (POSTMATCH) |
|---|---|
| Önceki maçlardan karşılıklı hipotez oluşturur; olayların gerçekleşeceğini iddia etmez. | Oynanmış maçın sekanslarından mekanizma inceler; skordan geriye neden uydurmaz. |
| Rakibin stratejik yanıtını ve farklı maç koşullarını belirtir. | Başlangıç planı, oyuncu/rol değişimi, oyun evreleri ve rakibin uyarlamasını karşılaştırır. |
| Sınanabilir maç içi göstergeler üretir. | Önceden tanımlanmış beklentileri gözlenenlerle karşılaştırır; başarısız hipotezleri saklamaz. |
| Öngörü varsa veri ve belirsizlik sınırlarını açık yazar. | Sonucu xG ve şut toplamına indirgemez; fırsat yaratma/yeme mekanizmalarını araştırır. |

## 4. Fenerbahçe–Slavia kaynak örneği
- Makale: `hpfootball-site/src/pages/mac/fenerbahce-slavia-prag-2026-10-20.astro`
- Sayfa konfigürasyonu: `hpfootball-site/tools/match-charts/fbcfg.json`
- Grafik üretim rehberi: `hpfootball-site/tools/match-charts/README.md`
- Yayın kaydı: `hpfootball-site/src/data/match-previews.mjs`
- Mevcut sayfada taktik açılış: ilk pres hattı geçildikten sonraki aksiyon.
- Mevcut sayfa örnekleri: farklı maçların mekânsal olaylarını tek hipotezde karşılaştırma, fırsatın sonucu ile sürecini ayırma, maçta sınanabilecek göstergeler.
- **Sınır:** Hangi bölümlerin Claude tarafından üretildiği ayrıca commit/PR geçmişinden doğrulanmadan atfedilemez. Sayfanın her iddiası otomatik onaylı değildir.

## 5. Veri ve iddia sözleşmesi
Her önemli iddiaya ID, kaynak dosyası ve alanı, dönüşüm formülü, tarih, ölçü birimi, payda, örneklem, karşı kanıt, yorum sınıfı ve doğrulama durumu kaydet.
Durumlar: PASS / REVIEW / BLOCKED / UNKNOWN. Eksik veri **UNKNOWN**; uydurulmuş değer **yasak**.
Gözlem / türetim / proxy / model / hipotez etiketleri kaynak yetkinliğini aşamaz.
Tek maçtan kalıcı takım yeteneği çıkarmak yasak.
Event-only veriden oyuncu hızı, gerçek baskı şiddeti, takım kompaktlığı veya topsuz saha şekli ölçülmüş gibi sunulamaz.
OpenCode `Claim Ledger`, `Source Independence`, `Critical Review`, `Human Approval` mekanizmalarıyla uyumlu şekilde geliştirilecek.

## 6. Saha ve zaman sözleşmesi
- Saha: **105 × 68 m**; X=0…105, Y=0…68. Yön/origin veri sağlayıcısına göre açıkça doğrulanmalı.
- Uzunluk bölgeleri (kullanıcı görünümü): **1. Bölge 0–35 m; 2. Bölge 36–70 m; 3. Bölge 71–105 m.** Teknik sürekli koordinatlarda sınır eşikleri 35 ve 70 m; yuvarlatma ve sınır atama açıklanmalı.
- Zaman: **0–15, 16–30, 31–45, 46–60, 61–75, 76–90+ dakika**; uzatmalar ayrı veri semantiğine göre işlenmeli.
- Metre ve dakika farklı eksenlerdir. Alan koordinatı zaman dilimi diye etiketlenemez.
- Olaylarda zaman alanı güvenilir değilse zaman filtresi yayımlanmaz.

## 7. Görsel ve arayüz sözleşmesi
- Floodlight / HPAnalytic çatı kimliği; Avrupa maçında Türk kulübü odak renkleri. GS için bordo–altın, FB için sarı–lacivert; rakip serileri kontrast nötr ton ve ilave şekil/çizgi kodu kullanır.
- Grafik metnin ilgili iddiasının yanına yerleşir; makale sonuna sekizli tekrar galerisi yığılmaz.
- Filtreler kompakt **aşağı açılır menüler** olarak çalışır; varsayılan **Tamamı**, seçince güncellenir. Grafiğin dikey konumu değişmez. Kullanım klavye, dokunma ve odak görünümüyle erişilebilir olur.
- Tek tip tipografi ölçeği, tek ikon ailesi, anlamlı hover/focus, isteğe bağlı kısa animasyon ve reduced-motion desteği.
- Carousel yalnız anlatıya hizmet ettiğinde; otomatik zorunlu scroll veya ekran taşması yok.
- Anlamsız sıfır etiketleri ve uzun grafik-altı açıklama kaldırılır; sıfır **anlamlı kanıt** ise gizlenmez.
- Kaynak, yöntem ve sınırlamalar ayrık açılır bölümde; veri güvenini etkileyen kısa kritik uyarı figürün yanında kalır.

## 8. Kabul kapıları
1. **Research QA:** Kaynak, örneklem ve veri şeması denetlendi.
2. **Analytical QA:** Önemli her iddianın kaynak–formül–karşı hipotez kaydı var.
3. **Editorial QA:** Gerçek futbol mekanizması var; grafikleri kaldırınca da metin analitik olarak anlamlı.
4. **Visual QA:** 320 / 375 / 390 / 1440 px gerçek ekran görüntüsüyle hiyerarşi, kontrast, çakışma, yazı büyüklüğü ve estetik kontrolü.
5. **Interaction QA:** Dropdown açma/seçme/kapama, carousel, hover, klavye, grafik filtrelerinin işlevi; yatay taşma yok.
6. **Release QA:** Build/test/görsel kabul başarılı; içerik ve yayın için açık editoryal onay. **CI green tek başına tasarım onayı değildir.**

## 9. Beceriler ve araştırma borcu
Geliştirilecek beceriler: SportsBase veri normalizasyonu; event sekans analizi; rakip-bağlam duyarlı istatistik; Python mplsoccer/matplotlib; D3/Observable Plot; SVG/astro bileşenleri; tasarım tokenları/ikon/hover/carousel; responsive editorial layout; Playwright görsel regresyon.
Araştırma ile üretim birbirine bağlanacak: referans → kural → gerçek bileşen → gözle doğrulama. Sadece referans listesi üretmek yeterli değil.

## 10. Açık tasarım kararları / v0.2 gelişim kuyruğu
- Fenerbahçe–Slavia / Lille–Galatasaray sayfalarının bölüm, veri, görsel ve mobil karşılaştırması.
- Claude çalışmasının kesin katkısını repo geçmişiyle ayırmak; emin olunmayan kısmı UNKNOWN.
- Makale ritmi, grafik yoğunluğu, özgün analitik model, tipografik hiyerarşi için yeni deneyler.
- OpenCode tasarım/araştırma dosyalarının bağlayıcı HPViz, Editorial, Interaction ve Brand Assets sözleşmelerine dönüştürülmesi.
- Değerlendirme paneline kullanıcı tarafından ileride yapılacak eklemeler açık. **v0.1 nihai kalite çıtası değildir.**

## 11. Değişiklik yönetimi
Bu belge v0.1 başlangıç standardıdır; kullanıcı tarafından geliştirilmeye açıktır.
Standart değişiklikleri PR ile versiyonlanır; mevcut makalelere geriye dönük uygulama ayrıca incelenir.
Bu belge tek başına canlı yayımlama yetkisi vermez; repo ve production koduna otomatik değişiklik yapılmaz.
