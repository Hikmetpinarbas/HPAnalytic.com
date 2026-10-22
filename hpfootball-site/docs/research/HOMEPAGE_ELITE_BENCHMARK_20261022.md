# HPAnalytic | Ana sayfa uluslararası benchmark v1 | 22 Ekim 2026

## Kapsam ve güven sınırı
İki ayrı kanıt türü: (1) doğrudan HPAnalytic `src/pages/index.astro` ve canlı site okuması; (2) rakiplerin kamuya açık resmî sayfalarının 22.10.2026 incelemesi. Bu belge bir görsel tarayıcı/screenshot karşılaştırması **değildir**. Rakip şirketlerin yazılım araçları, Figma/D3/Adobe kullanımına ilişkin kanıt yoksa ileri sürülmez.

## HPAnalytic güncel ana sayfa — kanıt
- H1 `Oyunu sonuçtan önce oku`: güçlü editoryal tez.
- Sıralama: `#premier-feature` Galatasaray–Lille hero -> `home-hero` ikinci hero -> `feature-band` Fenerbahçe–Slavia -> mekanizma kütüphanesi. Birden çok birincil tanıtım bölümü; kullanıcı için tek ana aksiyon belirsizliği riski.
- İlk maç tarihleri 20–21 Ekim 2026; 'Bu haftanın dosyası' dili ile sürdürülebilir yayın güncelliği ayrı değerlendirilmelidir.
- Görselde çok geniş dekoratif animasyon `hpa-premier__stars`, `home-hero__canvas` mevcut. İlk ekranda veri kaynaklı taktik diyagram yok; dekoratif hareket yerine kanıt bağlantılı saha grafiği düşünülmeli.
- Lig/Avrupa tema kuralı PR #81 üzerinde; `hpa-premier` yerel hard-coded kulüp renkleri barındırıyor; tek tasarım sistemi ilkesini ihlal etme riski.
- Çalışan bileşenler ve mevcut hiyerarşi korunacak; live deployment yok.

## Referans atlası — link ve aktarılabilir özellik
| Kaynak | Doğrudan kaynaktan gözlenen özellik | HPAnalytic'e öneri |
| --- | --- | --- |
| SkillCorner | tracking + oyun hareketi açıklaması | tracking kanıtı yoksa benzer veri iddia etmeden SVG mekanizma açıklamaları: https://skillcorner.com/ |
| Hudl StatsBomb | event + 360 bağlam + video entegre araçlar | oyun sahası içinde etkileşimli, kaynağı belli chart/video clip bağlantısı: https://www.hudl.com/products/statsbomb/platform |
| SciSports | scouting, filtreleme, profil kıyasları | kaynak doğruluğu şartıyla scout karşılaştırma kartları: https://www.scisports.com/scouting/ |
| Twelve | örnek soru ile ürün açılışı, hikâyeler | araştırma-sorusu arama/keşif başlangıcı: https://twelve.football/ |
| Opta Analyst | karmaşık modeli editoryal açıklamaya dönüştürme | 'soru → kanıt → mekanizma → sonuç' grafik dizisi: https://www.statsperform.com/about/opta-analyst/ |
| Breaking The Lines | oyun merkezi ve article/entity ilişkileri | takım–oyuncu–maç–makale bilgi grafı: https://docs.breakingthelines.com/platform |
| Spielverlagerung | derin taktik yazılar | görsel taktik kavram açıklamaları: https://spielverlagerung.de/ |
| Total Football Analysis | formasyon ve taktik kategori dizinleri | konu/oyun evresi filtreleri: https://totalfootballanalysis.com/ |
| The Mastermind | erişilebilir taktik eğitim metinleri | popülerleşebilir taktik mini-ders serisi: https://themastermindsite.com/about/ |
| Sky Sports Football | başlık yoğun haber ve analiz ayrımı | ana sayfada seçkin editoryal kart hiyerarşisi: https://www.skysports.com/football |
| ABC Sport (Australia) | Analysis & Opinion ve In-depth dizinleri | haber–analiz ayrımı ve okuma yolculuğu: https://www.abc.net.au/news/sport |
| Tactics Journal | toplulukta referans verilen yayınlar listesi | geniş referans takibi: https://tacticsjournal.com/recommended/ |
| The Guardian × Opta Analyst | yayın serisi tanıtımı | yinelenebilir, etiketlenmiş analitik seri: https://www.theguardian.com/football/series/opta-analyst |

## Kullanıcının verdiği ayrıca izlenecek kaynaklar
Tifo Football, Football Meta, CBC Sports, CBS Sports (kullanıcı 'CBC' demiş; 'CBS' onun yerine varsayılmaz), Football Made Simple, The Athletic, Between The Posts, Cano Football, Ultimo Uomo; tek tek görsel/uygulama denetimi sonraki faz. Kapsam dışı veya erişilemez olduğu zaman açıkça işaretle.

## Öncelikli backlog ve kabul kriterleri
**P0**: birincil hero kararı: tek net vaat+aksiyon, önemli yayın değiştirilebilir seçkide; erişilebilir ana başlık hiyerarşisi korunur. Yayın zamanı ve 'bu hafta' etiketleri otomatik gerçeklik testi. Statik dekoratif animasyon ilk içerikli grafikle rekabet etmemeli.
**P1**: 'İnceleme yolu' — Maç Önü / Maç Sonu / Taktik Kavramlar / Scouting / Yazı Dizileri: kullanıcı 1–2 tıklamada ilgili içeriğe ulaşır; 360/390/768/1280 test.
**P1**: `EvidenceFigure` yüzeyi: kaynak + kapsam + gözlenebilir kısıt; SVG erişilebilir ad ve açıklama, klavye/touch, progressive enhancement, reduced motion, fallback.
**P1**: 2 palet kuralını ana sayfanın özel `hpa-premier` bloğuyla tutarlı hâle getirme (Avrupa: kulüp; lig: Floodlight).
**P2**: taktik soru keşfi / bağlantılı futbol varlıkları / kitaplık / filtreleme: veri modeli ve haklar uygunsa.

## Güvenlik ve yayın
Mevcut canlı sayfayı habersiz değiştirme. Kanıtsız tracking veya doğrulanmamış xG grafiği üretme. Yalnızca izole branch/PR ve test+görsel QA; CMS varsayımlarını kontrol et. Kaynak sitelerin görsel/kodlarını kopyalama.
