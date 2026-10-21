---
title: "Cambaza Bak Metrikleri: xG!"
description: "TV'de gösterilen xG model sayıları gerçek değil varsayımlı tahminlerdir; her birinin göremediği alan farklıdır."
author: "Hikmet Pınarbaş"
category: "Epistemoloji & Model Mekaniği"
readingTime: "8 dk"
heroImage: "/images/monographs/cambaza-bak-metrikleri-xg-cover.png"
date: "2026-10-20"
draft: true
claimCeiling: "xG ve model metrikleri maçın sonucunu değil, geçmişin olasılık özetini gösterir; kararı insan verir."
evidenceLevel: "MODEL"
methodology: "Mekânsal Performans Çözümlemesi"
provenance: "HPAnalytic Monografi Boru Hattı / 2026-10-20"
sourceRefs:
  - { title: "Introducing Expected Threat (xT)", locator: "Karun Singh, 2019, karun.in" }
  - { title: "A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions", locator: "Fernández, Bornn, Cervone, 2021, Machine Learning 110(6), 1389–1427, doi:10.1007/s10994-021-05989-6" }
  - { title: "What is xG? How is it calculated?", locator: "Hudl StatsBomb, resmî açıklama" }
visualAssets:
  - { visual_id: "cambaza-bak-metrikleri-xg-cover", src: "/images/monographs/cambaza-bak-metrikleri-xg-cover.png", caption: "Tek bir şut konumunun karanlık sahada amber ışıkla aydınlatılması", rights_status: "HPAnalytic üretimi" }
---

### 1. Açılış: Ekrandaki Işıklar ve Sahadaki Gerçeklik

Dakika seksen dört. Ceza sahası yayının hemen dışından çekilen sert bir şut, kalecinin parmak uçlarından kornere çeliniyor. Tribün ayağa kalkıyor, spikerin ses tonu tepe noktasına ulaşıyor ve ekranın alt köşesinde o sihirli ibare beliriyor: **0.78 xG**. Televizyon başındaki milyonlar, bu sayının kaleye çekilen şutun mutlak bir “gol hak edişi” olduğunu düşünüyor. Peki o sayı, şutu atan oyuncunun o an omzunun üstünden bakan rakip stoperin nefesini, kalecinin görüş açısını kapatan kendi arkadaşının gölgesini ya da o topa vurmadan önce yapılan üç saniyelik hatalı pas tercihinin yarattığı stresi hesaba katabiliyor mu? Ekrandaki sayılar bize gerçekten ne anlatıyor, yoksa kalabalık stadyum gürültüsü içinde dikkati başka yöne çeken birer cambaz oyunundan mı ibaret?

Kanıt sınıfı: GÖZLENEN — Maç içi anlık beklenti gol (xG) verilerinin yayıncı kuruluş ekranlarındaki sunum biçimi ve tribün algısı.

---

### 2. Mekanizma: Cambazın Yürüdüğü İpe Değil, Cambazı Gösteren Adama Bak!

Futbol kamuoyu yıllardır yanlış yere odaklanmış durumda. xG (Beklenti Gol), xT (Beklenti Tehdit) ya da EPV gibi ekrandaki parıltılı metrikler, seyircinin ve hatta kulüplerin gözünü bağlayan ipin ta kendisidir. Biz sürekli o ipin ne kadar gergin olduğuna, şutun açısına ve yayıncının sunduğu istatistiksel ipin kalınlığına bakıyoruz. Oysa asıl mesele ipin kendisi değil; **o ipi oraya geren, sahadaki bütün illüzyonu yöneten, yani veriyi üreten ve sunan sistemin ta kendisidir.** 

Veri sağlayıcıların algoritmaları, kaçırılan fırsatların arkasındaki taktiksel zorlamaları, antrenörün kenardan yaptığı psikolojik hamleyi ya da oyuncunun o an yaşadığı zihinsel kırılmayı modelleyemez. xG modeli, şutun çekildiği koordinatı baz alarak size "bu pozisyon %30 goldü" der; fakat o şutun oraya hangi taktiksel manipülasyonla, rakibin hangi zaafı kaşınarak geldiğini söylemez. Ekrandaki sayılara bakıp oyunu okumaya çalışmak, illüzyoniste bakıp sihrin gerçek olduğuna inanmak gibidir. Cambazın yürüdüğü ipe odaklanmayı bırakıp, o sahneyi kuran ve sunan akla (cambazı gösteren adama) bakmadığınız sürece oyunu asla çözemezsiniz.

Kanıt sınıfı: MODEL — xG algoritmalarının geçmiş maç verilerinden türetilen olasılık matrislerine dayanması ve sistemik kör noktaları.

---

### 3. Ne Görüyoruz, Ne Göremiyoruz: Verinin Sınırı

Ekranlarda xG tablosu açıldığında gördüğümüz şey, iki takımın doksan dakika boyunca kaleye çektiği şutların toplam olasılık dökümüdür. Maç bittiğinde "0.45 xG ile oynayan takım nasıl 2 gol attı?" sorusu oradan doğar. Gördüğümüz kısım, istatistiksel bir ortalamanın skora yansıma biçimi; göremediğimiz kısım ise oyunun kalbi olan *topsuz alan üstünlüğü, baskı şiddeti ve kaleci manipülasyonudur*.

Bir takım, rakip ceza sahasına hiç giremeden uzaktan yirmi tane düşük değerli (0.03 xG) şut çekerek toplamda 0.60 xG üretebilir. Kağıt üzerinde bu, tehlikeli bir hücum performansı gibi görünür. Oysa sahada izlenen şey, çözülememiş bir savunma bloğuna karşı gösterilen çaresizlik ve panik reaksiyonudur. xG, şutun kalitesini ölçerken, o şutun *doğru tercihle mi yoksa mecburiyetten mi* doğduğunu ayırt edemez. Sinyal ile gürültü burada birbirine karışır.

Kanıt sınıfı: TÜRETİLMİŞ — xG toplamlarının oyun kalitesi ve takım organizasyonu yerine yalnızca şut hacmi/konum özetini yansıtması.

---

### 4. Karşı Kanıt: xG Bizi Neden Yanıltabilir?

Tezi en çok zayıflayan argüman, büyük veri setleriyle çalışan modern kulüplerin ve profesyonel analistlerin xG’yi artık tek başına değil, "Post-Shot xG" (şut çekildikten sonra kaleyi bulma değeri) ve "Possession Value" (EPV) gibi gelişmiş katmanlarla birlikte okuduğudur. Bu eleştiriye göre, xG modelleri geliştikçe kör noktaları azalmaktadır.

Ancak karşı argüman şu temel gerçeği değiştiremez: Hiçbir model, bir futbolcunun zihnindeki o anki kararı, takımın o dakikadaki mental kırılmasını ya da taktiksel blöfü tarayamaz. xG’ye tapan bir futbol aklı, yüksek skor üreten ancak oyun kontrolünü tamamen rakibe kaptırmış bir takımı "şanssız" ilan ederken, sahadaki gerçek egemenliği kaçırabilir. Metrik, karar vericinin yerine geçen bir akıl değil, sadece geçmişin istatistiksel aynasıdır. Bu aynaya bakarak geleceği yönetmeye kalkmak, körlemesine araba kullanmaya benzer.

Kanıt sınıfı: HİPOTEZ — Gelişmiş model katmanlarının (PSxG) dahi insan kararı ve anlık dinamikleri tam olarak modelleyememesi.

---

### 5. Sahada Nasıl Okunur: İzleyicinin Bakacağı 3 İşaret

Bir sonraki maçı izlerken ekranın sağ köşesindeki xG aldatmacasına kapılmamak için şu üç işarete odaklanın:

1. **Şutun Doğuş Koridoru:** Çekilen şut, organize bir ceza sahası içi paslaşmasından (merkez erişimi) mi yoksa kalabalık savunma arasında zorla denenen bireysel bir şuttan mı doğdu?
2. **Kaleci ve Blok Faktörü:** Şut anında kalecinin görüş açısı tamamen kapalı mıydı, yoksa savunma bloğu topun gidişatını yumuşattı mı? (Model bunu görmez, göz görür).
3. **Hacim ve Kalite Dengesi:** Takım düşük değerli çok sayıda şutla mı (şişirme xG) yoksa az ama yüksek kaliteli pozisyonlarla mı oynuyor?

Kanıt sınıfı: GÖZLENEN — Maç içi gözlem ve saha içi yerleşim dinamiklerinin okunması.

---

### 6. Sonuç

Futbol, ekrandaki sayılara indirgenemeyecek kadar akışkan ve insani bir mekaniktir. Veri sağlayıcılar, önümüzü aydınlatacak bir fener verirler elimize. Yolu uzun olana o fener yetmez, projektör gerekir; o da gözlemidir. Yolu kısa olan fenerle bir adım sonrasını görüyorsa tatmin olur. 

Cambazın yürüdüğü ipe ya da ellerindeki ışığa değil, o illüzyonu kuran adama ve sahanın karanlıkta kalan gerçek yüzüne bakmak zorundayız; çünkü iddia tavanı hiçbir zaman verinin ve gözlemin ötesine geçemez.

Kanıt sınıfı: GÖZLENEN — Analitik akıl yürütme ve epistemik sınır tespiti.

