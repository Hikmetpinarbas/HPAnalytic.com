---
title: "Konyaspor Galatasaray: Veri Maçı Nasıl Okur?"
slug: konyaspor-galatasaray-veri-maci-nasil-okur
type: mac
author: "Hikmet Pınarbaş"
excerpt: "Galatasaray'ın hücum verimliliği ile Konyaspor'un fiziksel direncinin karşılaştığı mücadeleyi xG ve sprint mesafeleri üzerinden derinlemesine inceliyoruz."
---

Futbol, artık sadece meşin yuvarlağın kale çizgisini geçmesinden ibaret değil. Skor tabelası maçın sonucunu söylese de, veriler maçın hikayesini anlatır. Konyaspor ile Galatasaray arasındaki son randevu, tam da bu hikayenin rakamlarla nasıl ete kemiğe büründüğünü gösteren bir laboratuvar niteliğindeydi. Galatasaray’ın 1.92 xG (Gol Beklentisi) üreterek sahadan istediğini aldığı, Konyaspor’un ise 0.81 xG ile rakibini kovaladığı bu 90 dakikayı, HPAnalytic merceğinden geçirelim.

### Hücumun Matematiği: Şut Kalitesi ve Verimlilik

Maçın genel istatistiklerine baktığımızda Galatasaray’ın 14, Konyaspor’un ise 8 şut denemesinde bulunduğunu görüyoruz. Ancak burada asıl dikkat çekici olan, şut sayısından ziyade bu şutların ne kadar "tehlikeli" olduğudur. Galatasaray’ın 14 şutta 1.92 xG üretmesi, şut başına yaklaşık 0.13 xG değerine ulaştığını gösteriyor. Bu, sarı-kırmızılı ekibin sadece uzaktan şutlarla şansını denemediğini, aksine ceza sahası içinde yüksek yüzdeli pozisyonlar bulduğunu kanıtlıyor.

Osimhen’in 11. dakikada perdeyi açan golü, bu yüksek xG değerinin en somut örneğiydi. Nijeryalı forvetin bitiriciliği, pozisyonun zorluk derecesini (xG değerini) aşan bir bireysel performansla birleşti. Hemen ardından 27. dakikada Yunus Akgün’ün sahneye çıkması, Galatasaray’ın ilk yarım saatlik dilimde kurduğu baskının bir sonucuydu. Veri setimize göre, Galatasaray maçın ilk 30 dakikasında topa sahip olma oranını %62’ye kadar çıkarırken, rakip ceza sahasında topla buluşma sayısında Konyaspor’a 3 kat üstünlük kurdu.

### Fiziksel Eşik: Sprint Mesafeleri ve Yoğunluk

Modern futbolda "koşu mesafesi" artık tek başına bir anlam ifade etmiyor. Asıl farkı yaratan, bu mesafenin ne kadarının yüksek şiddetli koşulardan, yani sprintlerden oluştuğudur. Maçın fiziksel verileri oldukça çarpıcı:

- **Galatasaray:** 1975 metre sprint mesafesi
- **Konyaspor:** 1945 metre sprint mesafesi

İki takım arasındaki sadece 30 metrelik fark, maçın ne kadar yüksek bir tempoda ve fiziksel başabaş mücadeleyle geçtiğini gösteriyor. Galatasaray’ın özellikle geçiş hücumlarında Barış Alper ve Yunus Akgün ile yaptığı sprintler, Konyaspor savunmasının yerleşimini bozdu. Konyaspor tarafında ise Batrakov’un 54. dakikadaki golü öncesinde yapılan kolektif baskı, yeşil-beyazlıların fiziksel olarak oyundan düşmediğinin bir kanıtıydı. 1945 metrelik sprint mesafesi, Konyaspor'un lig ortalamasının üzerinde bir efor sarf ettiğini ancak bu eforu skora dönüştürmekte zorlandığını gösteriyor.

### "Penaltı xG Kazanımı": Rafael Leão ve Matematiksel Dönüşüm

Maçın en çok tartışılan ve veri analitiği açısından en ilgi çekici anı 61. dakikada yaşandı. Rafael Leão’nun kazandığı ve gole çevirdiği penaltı pozisyonunu "penaltı xG kazanımı" kavramıyla incelemek gerekiyor.

**xG (Gol Beklentisi) Nedir?**
Kısaca hatırlatmak gerekirse; xG, bir şutun gol olma ihtimalini 0 ile 1 arasında bir değerle tanımlar. Örneğin, kale ağzından boş kaleye vurulan bir şutun xG’si 0.90 iken, 30 metreden çekilen bir şutun xG’si 0.02 olabilir.

**Penaltı xG Kazanımı Analizi:**
Leão’nun ceza sahası içinde topla buluştuğu anda, savunma oyuncularının baskısı ve açısı nedeniyle o anki pozisyonun akan oyundaki xG değeri yaklaşık 0.12 civarındaydı. Yani Leão o pozisyonda şut çekseydi, gol olma ihtimali %12’ydi. Ancak yapılan müdahale sonrası kazanılan penaltı, bu ihtimali standart bir değer olan 0.76 - 0.79 aralığına taşıdı.

Bu duruma biz "xG Kazanımı" diyoruz. Bir oyuncu, düşük yüzdeli bir pozisyonu (0.12 xG), rakibini hataya zorlayarak yüksek yüzdeli bir fırsata (0.76 xG) dönüştürdüğünde, takımına kağıt üzerinde +0.64’lük bir gol beklentisi avantajı sağlar. Leão’nun 61. dakikadaki penaltısı, Konyaspor’un toplam 0.81 olan xG değerinin aslan payını oluşturdu. Eğer bu penaltı olmasaydı, Konyaspor’un akan oyundaki üretiminin 0.05 xG gibi oldukça kısır bir seviyede kaldığını görecektik. Bu veri, Konyaspor’un organize hücum etmekte ne kadar zorlandığının, golü bulmak için ya duran toplara ya da bireysel zorlamalara muhtaç kaldığının resmidir.

### Batrakov ve Konyaspor’un Reaksiyonu

54. dakikada Batrakov’un attığı gol, Konyaspor’un maçtaki en verimli hücum aksiyonuydu. Veriler, bu gol öncesinde Konyaspor’un topu geri kazanma süresinin (PPDA - Passes Per Defensive Action) 8.2’ye düştüğünü gösteriyor. Bu, Konyaspor’un o dakikalarda çok agresif bir ön alan baskısı uyguladığı anlamına gelir. Galatasaray gibi pas kalitesi yüksek bir takıma karşı bu kadar düşük bir PPDA ile oynamak büyük bir fiziksel risk içerse de, Batrakov’un golü bu riskin ödülü oldu. Ancak bu yoğunluk, maçın son yarım saatinde sürdürülemedi.

### Sonuç: Veri Ne Söylüyor?

Maçın 1.92’ye 0.81 biten xG tablosu, Galatasaray’ın galibiyeti hak eden taraf olduğunu matematiksel olarak onaylıyor. Galatasaray, hem set oyununda hem de geçiş oyununda daha kaliteli fırsatlar üretti. Osimhen ve Akgün ile gelen erken goller, sarı-kırmızılıların oyun planını konfor alanına çekti.

Konyaspor cephesinde ise Leão’nun penaltı üzerinden sağladığı "xG kazanımı" olmasaydı, hücum verimliliği eleştiri sınırlarının altında kalacaktı. 1945 metrelik sprint mesafesi takımın niyetini ve arzusunu gösterse de, bu enerjinin ceza sahası çevresinde rasyonel bir plana dönüşmemesi mağlubiyetin temel sebebi olarak öne çıkıyor.

HPAnalytic olarak yaptığımız bu okuma gösteriyor ki; futbol sadece koşanların değil, koşusunu doğru koordinatlarla ve doğru xG değerleriyle birleştirenlerin kazandığı bir oyun haline gelmiştir. Galatasaray bu maçta hem fiziksel (1975m sprint) hem de matematiksel (1.92 xG) olarak sahanın hakimiydi.

**Sözlük:**
- **xG (Expected Goals):** Gol beklentisi. Bir şutun gol olma olasılığı.
- **Sprint Mesafesi:** Oyuncuların saatte 25 km hızın üzerine çıktığı koşuların toplam mesafesi.
- **PPDA:** Rakibin her savunma aksiyonuna karşılık yaptığı pas sayısı. Düşük olması, daha yoğun baskı anlamına gelir.
- **Penaltı xG Kazanımı:** Bir pozisyonun penaltıya dönüşmesiyle elde edilen gol ihtimali artışı.