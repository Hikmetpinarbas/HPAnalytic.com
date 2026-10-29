# 02 — Yirmi referansın davranış araştırması

29 Ekim 2026. Gerçek tarayıcı eylemleri: 1440 px masaüstü, 390 px mobil; hover, click/tap, Tab ve Escape. Ham araştırma çıktıları `research-browser-{1,2,3,4}.json` içinde. Bunlar kısa ve kamusal ana sayfa geçişleridir; tam ürün, makale veya WCAG denetimi değildir. Araştırma ekran görüntüleri servis çalışma alanında oluştu; `outputs/` yolları bu repository'de varmış gibi sunulmaz. Kaynak kod, font veya görsel kopyalanmadı.

**Kanıt sınıfları:** doğrulandı = eylem sonrası gözlenmiş durum; kısmi = kontrol görüldü fakat davranış teyit edilmedi; engelli = modal/erişim nedeniyle denenemedi. Klavye veya mobil hakkında aşağıda belirtilmeyen destek varsayılmamalı. Teknik uyarlama ve maliyetler bizim önerimizdir, kaynak sitenin altyapısı hakkında iddia değildir.

## 1. The Pudding — https://pudding.cool/

- **Gerçek mekanizma/eylem:** Popular tıklanınca aktif filtre Updating'den Popular'a geçti. İlk beş kartın anlık örneklemi değişmedi; sonuç kümesinin yenilendiği ileri sürülmüyor. Hover önizleme ve makale scrollytelling'i bu geçişte doğrulanmadı.
- **Masaüstü/mobil:** desktop filtre durumu doğrulandı; mobil kartlar tek sütuna dönüştü, All seçicisi görüldü. More denemesinde görünür drawer açılmadı.
- **Klavye/erişilebilirlik:** Escape ve dört Tab sonrası Updating odaktaydı; mobil seçicinin klavye değer değişimi doğrulanmadı.
- **İhtiyaç/uyarlama:** soru/konu ile keşif; URLSearchParams ile gerçek çoklu filtre, sonuç sayısı ve boş durum. Yeni sticky okuma anlatısı bağımsız tasarım önerimiz.
- **Maliyet:** düşük runtime, orta taksonomi bakımı; veri doğruluğu ve filtre testleri gerekli.

## 2. Bloomberg Graphics — https://www.bloomberg.com/graphics/

- **Mekanizma/eylem:** grafik içeriği ve listeler görüldü; “We've updated our terms” modalı menü denemelerini engelledi. Veri kartı hover davranışı teyit edilmedi.
- **Masaüstü/mobil:** her iki genişlikte modal kaldı; arkada mobil iki sütunlu liste görüldü. Bu gözlem başarılı mobil navigasyon anlamına gelmez.
- **Klavye:** Tab modal içindeki Bloomberg.com bağlantısına gitti; Escape kapatmadı. Tam focus trap testi yok.
- **İhtiyaç/uyarlama:** grafik/açıklama hiyerarşisi; semantik figure ve kaynak paneli. Modal davranışı model alınmıyor.
- **Maliyet:** düşük CSS maliyeti; yüksek editoryal bilgi sıralaması emeği.

## 3. Reuters Graphics — https://www.reuters.com/graphics/

- **Mekanizma/eylem:** desktop More tıklaması `aria-expanded=true` üretti. World kontrolünde görünür değişim yok. Katmanlı grafik veya scroll anlatısı denenmedi.
- **Masaüstü/mobil:** More desktop açıldı; mobil Menu denemesinde yeni bölüm listesi teyit edilmedi. Gevşek kontrol hedefi bir reklam interstitial'ına götürdü; geri dönüldü.
- **Klavye:** dört Tab LSEG bağlantısına ulaştı; Escape sonrası kapanış ayrıca ölçülmedi.
- **İhtiyaç/uyarlama:** gerçek disclosure durumu, açık buton adları; grafik ve açıklama birlikte. Sticky bölüm bağlantıları bağımsız öneri.
- **Maliyet:** düşük disclosure runtime; anlatı başına orta editoryal bakım.

## 4. The New York Times — https://www.nytimes.com/

- **Mekanizma/eylem:** U.S. disclosure click/Enter denendi; `aria-expanded=false` kaldı. Karusel okları test viewport'u dışındaydı. Uzun makale sticky davranışı denenmedi.
- **Masaüstü/mobil:** desktop masthead/section row; mobil kompakt hamburger/marka ve büyük lead görüldü. Section navigation denemesinde açık dialog teyit edilmedi.
- **Klavye:** Tab reklam iframe'ine ulaştı; Enter sonucu açık panel olmadı. Tam erişilebilirlik sonucu yok.
- **İhtiyaç/uyarlama:** tek güçlü başlık ve ikincil dosyalar; uzun okumada bölüm menüsü bizim ürün gereksinimimiz.
- **Maliyet:** düşük layout runtime; yüksek yazı düzenleme ve okuma testi emeği.

## 5. The Guardian Football — https://www.theguardian.com/football

- **Mekanizma/eylem:** Show more ve US edition desktop kontrolleri durum değiştirdi. Edition seçimi yapılmadı.
- **Masaüstü/mobil:** Football, Live scores, Tables, Fixtures, Results mobilde görünür kaldı; sürekli bağlam navigasyonu gözlendi. Desktop privacy paneli bırakıldı.
- **Klavye:** Europe edition odak aldı; bütün menü dolaşımı ve Escape kapanışı doğrulanmadı.
- **İhtiyaç/uyarlama:** analiz/araştırma içinde içerik bağlamını kaybetmemek; sticky bölüm nav ve kompakt mobil disclosure.
- **Maliyet:** düşük; aktif rota/bölüm senkronizasyonu için orta test bakımı.

## 6. Stripe — https://stripe.com/

- **Mekanizma/eylem:** Products üzerine gerçek hover çok sütunlu mega menü açtı; Escape kapattı.
- **Masaüstü/mobil:** desktop geniş gruplar; mobil menü tam ekran liste açtı, Escape sayfaya döndürdü.
- **Klavye:** Escape kapanışı ve ardından Tab'ın ana sayfa bağlantısına ilerlemesi gözlendi; tüm alt menü erişimi test edilmedi.
- **İhtiyaç/uyarlama:** bölüm/alt bölüm/öne çıkan dosya; hover-geçici ve click-sabit durumlarını açık state modelle ayırmak. Mobil native dialog + details.
- **Maliyet:** orta etkileşim/focus testi; CSS + küçük JS, üçüncü taraf kütüphane gerekmez.

## 7. Linear — https://linear.app/

- **Mekanizma/eylem:** Product tıklaması gruplu dropdown açtı; Escape kapattı. Giriş gerektiren uygulama filtreleri ve kayıtlı görünümler denenmedi.
- **Masaüstü/mobil:** desktop Product grupları; mobil System/Product/Resources gruplu tam ekran menü.
- **Klavye:** kapanış sonrası Tab Resources'a gitti. Uygulama panel/shortcut desteği varsayılmıyor.
- **İhtiyaç/uyarlama:** tutarlı bilgi grupları; arşiv grid/list ve yerel seçki bizim önerimiz.
- **Maliyet:** düşük menü verisi; orta URL durumu/yerel depolama testleri.

## 8. Raycast — https://www.raycast.com/

- **Mekanizma/eylem:** Download hover arka planı açıldı; disclosure açılmadı. Web sayfasında command palette bu geçişte görülmedi. Raycast uygulamasının davranışı web sitesi araştırması yerine kullanılamaz.
- **Masaüstü/mobil:** desktop hover doğrulandı; mobil hamburger denemesinde görünür değişim yok, güvenilir DOM hedefi bulunamadı.
- **Klavye:** Tab Store bağlantısına ulaştı; Escape görünür değişim üretmedi.
- **İhtiyaç/uyarlama:** command palette ürün gereksiniminden geliştirilir: native dialog, gruplu gerçek sonuçlar, Ctrl/⌘K, yön tuşları, focus dönüşü.
- **Maliyet:** orta arama indeksi ve focus bakım maliyeti; küçük istemci modülü, sunucu indeksi entegrasyonu sonraki aşama.

## 9. Apple — https://www.apple.com/

- **Mekanizma/eylem:** Mac hover disclosure açmadı; click `/mac/` adresine götürdü. Ürün scroll efektleri denenmedi.
- **Masaüstü/mobil:** mobil Menu tam ekran siyah bölüm listesi açtı; gözlenen durumda Escape kapatmadı.
- **Klavye:** Escape/Tab sonrası desktop Apple odaktaydı. Mobil kapanış desteği varsayılmıyor.
- **İhtiyaç/uyarlama:** tek amaçlı bölüm navigasyonu; bütün sayfayı ele geçiren scroll animasyonu alınmıyor. Bizde mobil Escape kapanışı zorunlu.
- **Maliyet:** düşük sticky CSS; scroll hikâyesi istenirse orta/yüksek bakım, şu prototipte gereksiz.

## 10. Framer — https://www.framer.com/

- **Mekanizma/eylem:** Platform hover çok sütunlu disclosure açtı; Escape kapattı. Component variants ürün editörü içinde denenmedi.
- **Masaüstü/mobil:** mobil hamburger navigasyon ve X kontrolü açtı; cookie bildirimi değiştirilmedi.
- **Klavye:** Escape sonrası Tab Framer bağlantısına gitti; tam WCAG testi değil.
- **İhtiyaç/uyarlama:** tutarlı hover/focus durumları; 160–240ms opacity/transform. Her karta ayrı animasyon motoru eklenmez.
- **Maliyet:** düşük CSS byte; orta durum/erişilebilirlik testi.

## 11. Airbnb — https://www.airbnb.com/

- **Mekanizma/eylem:** Main navigation menu account/help bağlantılarını açtı. Yatay kategori ve raf okları görüldü, oklar tıklanmadı. Arama/rezervasyon filtreleri denenmedi.
- **Masaüstü/mobil:** mobil yatay kategori kırpılması ve alt nav görüldü; cookie modalı görüşü kısıtladı.
- **Klavye:** Tab Help Center'a gitti; Escape cookie modalını kaldırmadı. Kategori klavye gezintisi doğrulanmadı.
- **İhtiyaç/uyarlama:** konu seçimleri ve aktif çipler; sonuç ve URL gerçekten değişmeli, boş sonuç açıklanmalı.
- **Maliyet:** düşük native checkbox, orta taksonomi ve AND/OR testleri.

## 12. Spotify — https://open.spotify.com/

- **Mekanizma/eylem:** Show all tıklaması `/section/0JQ5DB5E8N831KzFzsBBQ2` adresine geçti. Yatay kart rafı görüldü; oynatma/swipe denenmedi.
- **Masaüstü/mobil:** desktop library/sidebar ve raflar; mobil dar alanda desktop benzeri yan yana yapı ve signup bandı kaldı. Bu taşma davranışı alınmıyor.
- **Klavye:** Tab Show all'a odaklandı, Escape görünür etki üretmedi.
- **İhtiyaç/uyarlama:** okuma rafları, açık bütününü gör bağlantısı; native scroll-snap, sınır düğmeleri ve dokunma.
- **Maliyet:** düşük native kaydırma; orta drag/keyboard/sınır testleri. Autoplay yok.

## 13. Pentagram — https://www.pentagram.com/

- **Mekanizma/eylem:** mobil hamburger siyah tam ekran Work/About/News/Contact/Search/Archive menüsü açtı. Hero beklerken değişti; selector denemesinin sonucu diye raporlanmıyor.
- **Masaüstü/mobil:** büyük proje hero; mobil görsel devam etti ve selector iki satıra sardı. Privacy dialog kaldı.
- **Klavye:** Tab privacy kontrolüne ulaştı; Escape kapanışı teyit edilmedi.
- **İhtiyaç/uyarlama:** her dosyanın özgün kapak kompozisyonu; üçüncü taraf görüntü yok, kendi dekoratif SVG'miz. Otomatik hero rotasyonu alınmıyor.
- **Maliyet:** düşük SVG, dosya başına orta editoryal kapak emeği.

## 14. Are.na — https://www.are.na/

- **Mekanizma/eylem:** mobil search command menü açtı: arama, shortcuts, advanced search, tema ve sayfa bağlantıları. Girişli koleksiyon oluşturma/grid-list denenmedi.
- **Masaüstü/mobil:** büyük editoryal sayfa; mobil alt gezinme ve command yüzeyi doğrulandı.
- **Klavye:** başlangıç Tab açıklama ekleme kontrolüne gitti; arama açıldıktan sonra Escape gönderildi ama kapanış ayrıca teyit edilmedi.
- **İhtiyaç/uyarlama:** tek panelden arama ve gezinme; seçki yalnızca mevcut demo kayıtlarına dayanır. Depolama hatası görünür.
- **Maliyet:** orta istemci indeksi/focus; backend koleksiyon hesabı bu kapsamda yok.

## 15. Google Arts & Culture — https://artsandculture.google.com/

- **Mekanizma/eylem:** hamburger sol kategori drawer açtı. Zaman çizelgesi ve tematik eser etkileşimleri denenmedi.
- **Masaüstü/mobil:** mobil Art kartı büyüdü; Culture Weekly prompt kaldı. Drawer kategorileri gözlendi.
- **Klavye:** Tab Menu sonra Home'a geçti; Escape kapanışı teyit edilmedi.
- **İhtiyaç/uyarlama:** tematik keşif yolları ve ilişkili okumalar. Sahte tarihsel timeline üretmek yerine gerçek sekans seçimi.
- **Maliyet:** düşük bölüm verisi, orta ilişkili içerik editörlüğü.

## 16. Our World in Data — https://ourworldindata.org/

- **Mekanizma/eylem:** Browse by topic paneli açıldı, Escape kapattı. Doğrudan chart hover/tooltip/paylaşım denenmedi.
- **Masaüstü/mobil:** desktop konu grupları; mobil Toggle menu tam yükseklikli konu menüsü açtı. Cookie bandı altta kaldı.
- **Klavye:** Tab logo sonra Browse by topic; Escape sonrası aynı kontrol odaktaydı.
- **İhtiyaç/uyarlama:** konu taksonomisi, kaynağı görünür grafik ve tablo eşdeğeri. Grafik kontrollerimiz kullanıcı gereksiniminden gelir.
- **Maliyet:** düşük disclosure; orta tablo/CSV/SVG dışa aktarım ve eşdeğer bilgi testi.

## 17. Observable — https://observablehq.com/

- **Mekanizma/eylem:** generative canvas ve yoğun SVG/notebook içeriği görüldü; belirli chart slider'ı veya disclosure çalıştırılmadı.
- **Masaüstü/mobil:** mobil Explore/Get started kaldı, güvenilir menu kontrolü bulunamadı; hero dikey yığıldı.
- **Klavye:** Tab Explore, Pricing; Escape Pricing'de kaldı. Grafik klavye desteği hakkında sonuç yok.
- **İhtiyaç/uyarlama:** canlı parametre önerisi: sentetik eşik slider'ı gerçekten görünür hücre kümesini değiştirir, veri tablosu aynı filtreyi uygular.
- **Maliyet:** 96 SVG hücre için düşük; büyük veri olursa Canvas/D3 sonradan ölçüme göre değerlendirilmeli.

## 18. Financial Times — https://www.ft.com/

- **Mekanizma/eylem:** haber ve OPEN SIDE NAVIGATION MENU/SEARCH kontrolleri görüldü; consent overlay nedeniyle kullanılabilir hedef bulunamadı. Veri gazeteciliği grafik davranışı test edilmedi.
- **Masaüstü/mobil:** iki genişlikte de izin modalı kaldı; mobil ekranın çoğunu kapladı.
- **Klavye:** Tab iframe'lere girdi; Escape izin modalını kapatmadı. Menü/arama testi engelli.
- **İhtiyaç/uyarlama:** okunabilir editoryal yoğunluk; referansın etkileşimlerine ilişkin kanıt yok. Kâğıt/mürekkep yönümüz özgün öneridir, FT token kopyası değil.
- **Maliyet:** düşük CSS; orta tipografik/kontrast/okuma testi.

## 19. GitHub — https://github.com/

- **Mekanizma/eylem:** Products hover/click açık menüyü teyit etmedi. Bu ana sayfa geçişi repo ağaç navigasyonu/accordion testi değildir.
- **Masaüstü/mobil:** mobile menu denemesinde Copilot tanıtım durumu değişti; menü içeriği doğrulanmadı.
- **Klavye:** Tab skip link ve Homepage'e gitti; Escape Homepage odağını korudu.
- **İhtiyaç/uyarlama:** içerik hiyerarşisini native details ile göstermek bağımsız ürün kararıdır. Private repo/app davranışı varsayılmaz.
- **Maliyet:** düşük semantik HTML; orta başlık/hiyerarşi denetimi.

## 20. Awwwards — https://www.awwwards.com/

- **Mekanizma/eylem:** Search, Search by Inspiration panelini açtı; Escape kapattı. Nominee filtreleri ve özel mikro animasyonlar denenmedi.
- **Masaüstü/mobil:** mobil hamburger tıklaması görünür değişim yaratmadı; güvenilir erişilebilir etiket bulunamadı.
- **Klavye:** Tab Awwwards ve Directory; aramanın Escape kapanışı doğrulandı.
- **İhtiyaç/uyarlama:** keşif araması ve kontrollü açılış; hareket yalnızca durum değişimini açıklamak için.
- **Maliyet:** düşük opacity/transform; yüksek deneysel hareketten kaçınılarak bakım sınırlandırılır.

## Karar

Güvenilir biçimde gözlenen menü modelleri Stripe/Linear/Framer/OWID; kamuya açık command yüzeyi Are.na; filtre aktif durumu Pudding; rafın tamamına geçiş Spotify; mobil büyük tipografi/kapak sunumu Pentagram. Diğer istenen grafik/scroll/mikro etkileşim mekanizmalarının çoğu kısa ana sayfa geçişinde doğrulanmadı. Bunlar prototipin bağımsız gereksinimleridir; referansta mevcutmuş gibi sunulmaz. İleri araştırmada gerçek uzun makaleler ve grafikli sayfalar ayrıca incelenmeli.
