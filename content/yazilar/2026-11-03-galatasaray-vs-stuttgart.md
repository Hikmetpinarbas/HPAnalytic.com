---
title: "Galatasaray Stuttgart’ı Nasıl Yendi? Topa Değil, Tehlikenin Yönüne Hükmetmek"
date: "2026-11-03"
author: "Hikmet Pınarbaş"
cover: "assets/covers/2026-11-03-galatasaray-vs-stuttgart.png"
---

Bir futbol maçında üstünlüğü belirleyen şey, topun hangi takımda daha uzun süre kaldığı mıdır? Yoksa topun rakip savunma için ne kadar büyük bir probleme dönüştüğü mü? Galatasaray’ın Stuttgart karşısında aldığı 2-0’lık galibiyet, bu iki sorunun neden birbirinden ayrılması gerektiğini gösteriyor.

:::image /assets/images/gs-stuttgart/dashboard.png | Maç Dashboard'u | Pas, şut, xG özeti
:::

Skor rahat bir galibiyeti anlatıyor. Fakat maçın sayısal yapısı, iki takım arasındaki farkın skor kadar büyük olmadığını gösteriyor. Galatasaray topa yüzde 51,4 oranında sahip olurken Stuttgart yüzde 48,6'da kaldı. Şut sayısında Stuttgart'ın yediye altılık üstünlüğü vardı. Buna karşılık üretilen pozisyonların beklenen gol değeri Galatasaray lehineydi.

Buradaki mesele, hangi takımın daha fazla hücum ettiği değil. Hücumların hangi koşullarda tehlikeye dönüştüğü.

## 1. Altı Şutla İki Gol: Hücumun Hacmi Değil, Tehdidin Niteliği

Futbolda hücum üstünlüğü çoğu zaman sayılar üzerinden tarif edilir. Daha fazla şut atan, daha çok topa sahip olan veya rakip ceza sahasına daha sık giren takımın oyunu yönettiği düşünülür. Oysa bu göstergeler farklı şeyleri ölçer. Bir takımın topa sahip olması, rakibin savunma organizasyonunu bozduğu anlamına gelmez.

:::image /assets/images/gs-stuttgart/stats_bar.png | 131 Metrik Karşılaştırması | Galatasaray vs VfB Stuttgart
:::

Galatasaray altı, Stuttgart yedi şut çekti. Ancak Galatasaray'ın beklenen gol toplamı 1,74'e, Stuttgart'ınki 1,38'e ulaştı. Başka bir ifadeyle Galatasaray, daha az şutla daha yüksek toplam gol beklentisi oluşturdu.

Şut başına beklenen gol değerinde de fark görülüyor. Galatasaray'ın ortalaması yaklaşık 0,29, Stuttgart'ın ise 0,20. Bu, Galatasaray'ın şutlarının ortalama olarak daha yüksek gol olasılığı taşıdığını gösteriyor.

Fakat asıl ayrım burada başlamıyor.

Beklenen tehdit, yani xT, topun farklı saha bölgelerine taşınmasının gelecekteki gol üretme potansiyelini değerlendirmeye çalışır. Galatasaray'ın 1,88'lik toplamına karşı Stuttgart'ın 1,01'de kalması, kullanılan model kapsamında Galatasaray'ın daha yüksek tehdit değeri biriktirdiğini ortaya koyuyor.

:::image /assets/images/gs-stuttgart/xt_grid_heatmap.png | xT Izgarası | Hücre başına tehdit
:::

Bu iki ölçümü birlikte düşünmek gerekiyor.

Beklenen gol, şutun oluştuğu andaki gol olasılığına odaklanır. Beklenen tehdit ise şuttan önce topun bulunduğu ve taşındığı bölgelerin hücum değerine ilişkin başka bir pencere açar.

Galatasaray her iki ölçümde de öndeydi.

Bu eşleşme, galibiyeti yalnızca bitiricilik başarısına bağlamayı güçleştiriyor. Çünkü Galatasaray, kaleye yönelen son eylemden önceki hücum değerinde de avantaj üretti.

Yine de toplam xT değeri bize bu avantajın hangi oyuncu, hangi koridor veya hangi pas bağlantısıyla oluşturulduğunu söylemiyor. Bunun için olayların konumları ve sıraları gerekiyor.

Bir kanat oyuncusunun içeri kat etmesiyle merkezde açılan boşluk, aynı koridorda yapılan sıradan bir pasla eşdeğer değildir. İki hareket de topu ileri taşıyabilir; ancak rakip savunmanın dengesine etkileri farklı olabilir.

Galatasaray'ın sayıları, bu farkı araştırmamız gerektiğini söylüyor. Savunma hattının gerçekten hangi hareketle bozulduğunu ise yalnızca toplam istatistiklerden çıkaramayız.

Ortaya çıkan temel sonuç şu: Galatasaray daha fazla şut üretmedi; ürettiği şutlara daha yüksek gol ihtimali taşıyan koşullar eşlik etti.

## 2. Geçiş Asimetrisi: Aynı Oyunda İki Farklı Tehdit

Geçiş hücumları çoğu zaman hızlı koşularla açıklanır. Bir takım topu kazanır, rakip kaleye yönelir ve savunma yerleşmeden fırsat arar.

Fakat hız, geçişin yalnızca görünen tarafıdır.

Asıl önemli olan, topun kazanıldığı anda iki takımın saha üzerindeki dağılımıdır. Hücum edecek oyuncular hangi pas açılarına sahiptir? Rakip savunmacılar hangi bölgelere yönelmek zorundadır? Topun ileri taşınması, rakibin geriye koşmasını mı gerektirir, yoksa yerleşmiş bir savunmanın karşısında mı gerçekleşir?

Geçişi tehlikeli yapan, yalnızca topun ilerleme sürati değil; rakibin aynı anda çözmek zorunda olduğu problemlerin sayısıdır.

:::visual [pass-network] | Pas Ağı | Daire büyüdükçe pas sayısı artar. Çizgi kalınlaştıkça bağlantı güçlenir.
:::

Galatasaray-Stuttgart karşılaşmasında kontratak sayıları bu açıdan dikkat çekiyor. Galatasaray 19, Stuttgart 14 kontratak kaydetti.

İki takım da geçiş hücumu üretmişti. Ancak Galatasaray'ın beş kontrataklık üstünlüğü, bu hücum biçimine daha sık başvurduğunu veya veri sağlayıcısının tanımına göre daha fazla geçiş sekansı oluşturduğunu gösteriyor.

Bu sayıyı doğrudan beş ilave gol fırsatı olarak okumak yanlış olur. Bir kontratak, rakip ceza sahasına ulaşmadan bitebilir. Hatta rakip savunma tarafından kolaylıkla karşılanabilir.

Dolayısıyla geçiş sayısıyla geçiş kalitesi aynı kavram değildir.

Burada Galatasaray'ın lehine olan ikinci göstergeyi hatırlamak gerekiyor: Beklenen tehdit toplamı Stuttgart'ın oldukça üzerindeydi.

Ancak kritik bir sınır var. Bu tehdidin ne kadarının kontrataklardan, ne kadarının yerleşik hücumlardan üretildiğini bilmiyoruz. İki toplamın aynı anda yüksek olması, aralarında doğrudan nedensellik kurmak için yeterli değil.

Yine de maçın hücum yapısı hakkında önemli bir soru sorabiliriz: Galatasaray geçişleri daha sık üreterek mi avantaj kazandı, yoksa diğer hücum biçimlerinde de rakibinden daha etkili miydi?

Bu ayrımı yapabilmek için top kazanma bölgelerinin, geçiş başlangıçlarının ve hücumların bittiği noktaların eşleştirilmesi gerekiyor.

Örneğin rakip yarı sahada kazanılan bir top ile kendi ceza sahası çevresinde kazanılan top aynı geçiş problemini yaratmaz. İlkinde savunmaya hazırlanmak için gereken mesafe kısalabilir; ikincisinde daha uzun bir ilerleme zorunlu hale gelir.

Benzer biçimde merkez koridordan başlayan geçişle çizgi üzerinden ilerleyen geçişin savunma oyuncularına yüklediği kararlar farklıdır.

Galatasaray'ın kontratak üstünlüğü bu mekanizmaların hangisiyle oluştuğunu kanıtlamıyor. Fakat oyunun yalnızca durağan top sahipliği üzerinden okunamayacağını açıkça gösteriyor.

Geçiş hücumunda mesele kaç kez koşulduğu değil; her koşunun rakip savunmaya hangi kararı verdirdiğidir.

## 3. İki Golün Arkasındaki Mesele: Sonuç ile Süreci Ayırmak

İki farklı maç düşünelim.

Birincisinde bir takım rakibine neredeyse hiç fırsat vermeden kazanır. İkincisinde ise rakip de önemli gol pozisyonları bulur ama bunları değerlendiremez.

İki karşılaşma aynı skorla bitebilir. Buna rağmen kazanan takımların savunma ve hücum performansları eşdeğer değildir.

Galatasaray'ın Stuttgart karşısındaki galibiyetini değerlendirirken bu ayrımı korumak gerekiyor.

:::image /assets/images/gs-stuttgart/shotmap.png | Şut Haritası | Shot map
:::

Stuttgart'ın yedi şutla kayda değer bir beklenen gol toplamına ulaşması, Galatasaray'ın rakip hücumları bütünüyle etkisizleştirdiği iddiasını desteklemiyor. Stuttgart da gol olasılığı taşıyan fırsatlar üretti.

Buna karşılık Galatasaray, daha yüksek beklenen gol değerine ulaşıp iki gol kaydetti.

Toplam beklenen goller arasındaki fark yalnızca 0,36'ydı. Gerçek skor farkı ise iki gol.

Bu ayrım bize maç sonucunun pozisyon üretimindeki farktan daha büyük gerçekleştiğini söylüyor.

Galatasaray hücumda daha yüksek gol beklentisi oluştururken savunmada rakibine sıfır fırsat vermedi. Dolayısıyla 2-0'ı doğrudan kusursuz savunma organizasyonunun kanıtı olarak görmek doğru olmaz.

Beklenen gol değeri, belirli bir karşılaşmada mutlaka atılması gereken gol sayısı değildir. Pozisyonların tarihsel ve istatistiksel özelliklerinden hareketle üretilmiş bir olasılık tahminidir.

Bu nedenle Stuttgart'ın gol atamaması, bütün hücum kararlarının yanlış olduğu anlamına gelmez. Galatasaray'ın iki gol atması da bütün hücum kararlarının doğru olduğunu kanıtlamaz.

Maçın asıl analitik değeri burada yatıyor.

Galatasaray hem şut kalitesi hem de toplam beklenen tehdit bakımından avantaj elde etti. Fakat Stuttgart'ın ürettiği fırsatlar, galibiyetin savunma yönünden ayrıca incelenmesini gerekli kılıyor.

Gollerin gerçekleşme biçimini ve kritik savunma müdahalelerini bilmeden, sonucun hangi bireysel eylemlerle güvence altına alındığını kesinleştiremeyiz.

Skor üstünlüğü kesin. Sürecin bütün ayrıntılarında üstünlük ise ayrıca ispatlanması gereken bir iddia.

---

Galatasaray, Stuttgart karşısında topa sahip olma oranında sınırlı bir üstünlük kurmasına rağmen şut kalitesinde ve beklenen tehdit üretiminde daha belirgin bir avantaj elde etti. Daha az şut çekti, daha yüksek gol beklentisi oluşturdu ve maçı iki farklı bitirdi.

Ama bu karşılaşmanın bıraktığı en önemli ders, iki golün kendisi değil. Aynı skorun arkasında farklı üretim mekanizmaları bulunabileceği gerçeği.

Futbolun kalitesi yalnızca topun kimde olduğuyla açıklanamaz. Topun hangi koşullarda kazanıldığı, hangi alanlara taşındığı ve rakibi hangi savunma kararlarına zorladığı da incelenmelidir.

Galatasaray'ın galibiyeti, bu soruları sormak için güçlü bir başlangıç noktası sunuyor.

Çünkü oyunu anlamak, skoru açıklayan bir hikâye bulmak değil; o skoru mümkün kılan ilişkileri ortaya çıkarmaktır.
