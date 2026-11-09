# RAMS Park’ta İki Zıt Doktrin: Galatasaray’ın Boğucu Ön Alan Presine Karşı Fenerbahçe’nin Cerrahi Geçiş Verimliliği

**Yazar:** HPAnalytic Senior Football Editorial Board & Data Engineering Unit  
**Tarih:** 26 Ekim 2026 — Saat: 21.30  
**Stadyum:** RAMS Park, İstanbul  
**Turnuva:** Trendyol Süper Lig — 9. Hafta  
**Veri Kaynağı:** SportsBase Verified Repository (Google Drive / UserLAnd Staging)  

---

### Spot
*Galatasaray ligin en agresif ön alan presi (PPDA 5.04) ve en yüksek şut hacmiyle (161 şut) sahayı daraltmaya hazırlanırken; Fenerbahçe şut başına 0.17 xG kalitesi ve ligin zirvesindeki kontratak dönüşüm oranıyla (%28) sarı-kırmızılı savunmanın arkasındaki boşlukları hedefliyor. Bir yanda 92 kendi yarı saha top kaybıyla risk alan bir yapı, diğer yanda bu kayıpları cezalandıracak Victor Osimhen–Gabriel Sara ekseni.*

---

## 1. Giriş: Sezon Kesiti ve Derbi Bağlamı

2026/27 Süper Lig sezonunun ilk 8 haftalık kesiti geride kalırken, 26 Ekim 2026 akşamı RAMS Park'ta oynanacak Galatasaray–Fenerbahçe derbisi, klasik bir ezeli rekabet mücadelesinin ötesinde; iki radikal biçimde farklılaşmış futbol doktrininin taktiksel hesaplaşmasına sahne olacaktır. 

SportsBase veri tabanından 21 Ekim 2026 tarihi itibarıyla çekilen ve 19 Süper Lig takımının tüm performans göstergelerini içeren veri setleri, iki takımın da lig medyanının fersah fersah üzerinde yer aldığını ancak bu başarıya tamamen taban tabana zıt oyun mekanizmalarıyla ulaştığını göstermektedir. 

Fenerbahçe, ligin en yüksek gol beklentisi (22.30 xG) ile tam 22 gol üreterek neredeyse 1.00 kusursuzluğunda bir bitiricilik katsayısı yakalamış durumdadır. Buna karşılık Galatasaray, kalesinde ligin en düşük gol beklentisini görmesine (8.67 OxG) ve rakip kaleye tam 161 şut göndermesine karşın, bu fırsatları skora dönüştürmekte zorlanmış (17 gol, 19.94 xG, 0.85 xG dönüşüm oranı) ve üretimini hacim üzerinden inşa eden bir profil çizmiştir.

Hafta arasında oynanan Avrupa karşılaşmaları ise derbinin psikolojik ve fiziksel parametrelerini yeniden şekillendirmiştir. Fenerbahçe'nin Slavia Prag karşısındaki dengeli oyunu ile Galatasaray'ın Lille deplasmanındaki yüksek yoğunluklu sınavı, her iki teknik heyetin de bu derbiye rotasyonel reflekslerle değil, ana omurgalarının fiziksel sınırlarını zorlayarak çıkacağını kanıtlamaktadır.

---

## 2. Oyun Kimlikleri ve Yapısal Ayrışma

![Lig Medyanına Göre Dumbbell Karşılaştırması](charts/HPA_DERBI_DUMBBELL_LIG_MEDYANI.png)

Yukarıdaki Dumbbell analizinde görüldüğü üzere, lig medyanı (Medyan xG: 11.27, Medyan Gol: 11.60) baz alındığında her iki takım da Türkiye standartlarının çok üzerinde bir hücum tavanına sahiptir. Ancak takımların topa sahip olma ve savunma kurguları belirgin biçimde ayrışır:

### Galatasaray: Ön Alanda Boğucu Ritim ve Hacim Baskısı
Galatasaray'ın oyun felsefesi, rakip sahaya yerleşme ve topun kaybedildiği anda uygulanan şok pres üzerine kuruludur. 
- **Topa Sahip Olma:** %58.46 (Ligin zirvesi)
- **PPDA (Passes Per Defensive Action):** **5.04**. Bu metrik, rakip takımların Galatasaray'ın savunma müdahalesiyle karşılaşmadan önce kendi yarı sahalarında ortalama yalnızca 5 pas yapabildiğini gösterir. Lig medyanının (6.80) çok altında olan bu rakam, sarı-kırmızılıların ligin en reaktif ve agresif ön alan baskısını uyguladığını kanıtlar.
- **Yüksek Pres Başarısı:** Ön alanda uygulanan baskıların **%58.33**'ü top kazanımıyla veya rakibi hataya zorlayarak sonuçlanmıştır.

### Fenerbahçe: Yüksek Pas Kalitesi ve Cerrahi Karşı Hücum
Fenerbahçe ise topa sahip olduğunda daha kontrollü (%54.10 topla oynama, %86.97 pas isabeti) ancak asıl ölümcül darbeyi geçiş anlarında vuran bir profile sahiptir.
- **Kilit Pas Hacmi:** Tam **142 kilit pas** (Galatasaray: 78). Bu devasa fark, Fenerbahçe'nin hücumlarının rastgele ortalar veya uzaktan şutlar yerine, savunma dengesini bozan doğrudan arayışlarla şekillendiğini doğrular.
- **Kontratak Verimliliği:** Fenerbahçe ligde 114 kontratak geliştirmiş ve bunların **32'sini şutla bitirmiştir (%28.0 şuta dönüşüm oranı)**. Lig medyanı olan 19.2 şutluk kontra veriminin neredeyse iki katına ulaşan bu rakam, sarı-lacivertlileri ligin açık ara en tehlikeli geçiş takımı yapmaktadır.

---

## 3. Mekânsal Hücum Analizi: Şut Merkeziliği ve Tehdit Üretimi

Harsh Krishna'nın *Shot Centrality* metodolojisi Alanyaspor ve Gençlerbirliği maçlarının ayrık olay verilerine uygulandığında, iki takımın ceza sahası etkinliğine dair çarpıcı sonuçlar ortaya çıkmaktadır:

![Shot Centrality ve Ceza Sahası Yayılımı](charts/HPA_DERBI_SHOT_CENTRALITY.png)

### Şut Başına Kalite Paradoksu
- **Fenerbahçe:** 135 şutta 22.30 xG üretmiş, **şut başına 0.17 xG** değerine ulaşmıştır. Fenerbahçe'nin şutları kale çizgisi merkezine ($X=105, Y=34$) daha dar bir açıyla ve ceza sahası merkez havuzundan gelmektedir. 
- **Galatasaray:** 161 şutta 19.94 xG üretmiş, **şut başına 0.12 xG**'de kalmıştır. Galatasaray hücumları ceza sahasına daha fazla pas sokmasına karşın (321'e karşı 271 pas), kalabalık ceza sahalarında açılan şut pencerelerinin kalitesi düşmekte; bu da sarı-kırmızılıları daha düşük değerli şut denemelerine itmektedir.

![xG Birikim Trendi](charts/HPA_DERBI_XG_RACE_TREND.png)

xG Race trendinde görüldüğü üzere Fenerbahçe, maçların ilk bölümlerinde düşük hacimli kalsa bile dakikalar ilerledikçe ani dikey sıçramalarla (0.40+ xG değerinde büyük fırsatlar) skora gitmekte; Galatasaray ise zamana yayılan düzenli ancak küçük adımlarla xG biriktirmektedir.

---

## 4. Taktiksel Çatışma: Kimin Zaafı Kimin Avantajı?

![Taktiksel Radar Karşılaştırması](charts/HPA_DERBI_RADAR_KARSILASTIRMA_2026.png)

Bu derbinin kaderini belirleyecek ana taktiksel denklemler şu şekilde özetlenebilir:

### Denklem 1: Galatasaray Presi vs Fenerbahçe'nin Kendi Yarı Saha Kayıpları
Fenerbahçe'nin bu sezonki en büyük yapısal zaafı, kendi yarı alanında yaptığı **92 top kaybıdır** (Galatasaray'da bu sayı 75). Savunmadan çıkarken yapılan bu kayıplar, ligdeki zayıf rakiplere karşı telafi edilebilmiş olsa da, ligin en yüksek pres başarı oranına (%58.33) ve en düşük PPDA değerine (5.04) sahip Galatasaray karşısında telafisi imkansız sonuçlar doğurabilir. 

*Taktik Hipotez:* Şayet Galatasaray, Lucas Torreira ve Gabriel Sara liderliğinde ilk bölge presini maçın başında kurabilirse, Fenerbahçe savunmasını kendi ceza sahası önünde hataya zorlayarak maçın ilk 20 dakikasında net şut pozisyonları yakalayacaktır.

### Denklem 2: Galatasaray'ın Savunma Arkası Boşlukları vs Fenerbahçe Kontratakları
Galatasaray'ın blok halinde rakip yarı sahaya yerleşmesi (516 pozisyonel hücum, 89 şut), beklerin (özellikle Ismail Jakobs ve hücuma katılan kanatlar) arkasında geniş koridorlar bırakmaktadır. 
Fenerbahçe'nin 142 kilit pas üreten karar vericileri (İrfan Can Kahveci, Kerem Aktürkoğlu, Mason Greenwood), bu boşluklara ligin en yüksek geçiş hızına sahip forveti Vedat Muriqi ve kanat koşucularını kaçırma potansiyeline sahiptir.

*Taktik Hipotez:* Galatasaray presi ilk hatta kırıldığı anda, Fenerbahçe 3-4 paslık dikey sekanslarla Davinson Sánchez ve Abdülkerim Bardakcı'yı eksik yakalayabilir.

---

## 5. Bireysel Eşleşmeler ve Oyuncu Rolleri

| Oyuncu & Rol | Sezon İstatistiği | Derbideki Kritik Görevi |
|---|---|---|
| **Victor Osimhen (GS - Santrafor)** | 6 Gol, 3 Asist, 6.29 xG, 38 Şut (438 Dk) | Rakip stoperleri fiziksel temasla yıpratmak, ceza sahası içi hava toplarını indirmek. |
| **Vedat Muriqi (FB - Santrafor)** | 7 Gol, 5.35 xG, 20 Şut (436 Dk) | Kusursuz ceza sahası bitiriciliği. Fırsat başına %35 gol yüzdesiyle ligin en formda bitiricisi. |
| **Gabriel Sara (GS - Merkez Orta Saha)** | 2 Gol, 2 Asist, 12 Kilit Pas, 22 Şut | İkinci bölge pas dağıtımı, ceza sahası dışı şut tehdidi ve pres tetikleyicisi. |
| **Mason Greenwood (FB - Kanat Forvet)** | 4 Gol, 2 Asist, 5.57 xG, 18 Kilit Pas | Kanattan içeri kat ederek şut ve kilit pas üretimi; geçiş hücumlarının ana motoru. |
| **İrfan Can Kahveci (FB - Ofansif Oyun Kurucu)**| 2 Gol, 3 Asist, 16 Kilit Pas | Pres kıran ilk anahtar pasları atacak vizyon merkezi. |
| **Abdülkerim Bardakcı (GS - Sol Stoper)** | 2 Gol, 1.20 xG, %53.26 Hava Topu | Duran toplarda ligin en tehlikeli hücum stoperi; geriden oyun kurma rolü. |

---

## 6. Hakem Faktörü: Atilla Karaoğlan’ın Disiplin Sicili

![Hakem Disiplin Profili](charts/HPA_DERBI_HAKEM_DISIPLINI_2026.png)

Derbinin atanmış hakemi Atilla Karaoğlan'ın doğrulanmış 91 maçlık kariyer sicili, bu derbinin akışkan bir tempodan ziyade sık sık duran bir taktik savaşa dönüşeceğini göstermektedir:
- **Yönettiği 11 Fenerbahçe Maçı:** Maç başı **28.64 faul**, **6.18 kart**.
- **Yönettiği 12 Galatasaray Maçı:** Maç başı **25.92 faul**, **6.08 kart**.
- **Derbi Tarafları Ortalaması:** **27.22 faul** ve **6.13 sarı/kırmızı kart**.
- **Tarihsel Referans:** 21 Eylül 2024'te Kadıköy'de oynanan Fenerbahçe 1:3 Galatasaray derbisini yöneten Karaoğlan, o maçta tam **36 faul** çalmış ve **9 sarı kart** göstermiştir.

*Analitik Etki:* Bu kadar yüksek faul frekansı, Galatasaray'ın pres temposunu kırabilecek bir unsur olduğu gibi, Fenerbahçe'nin de geçiş hücumlarını faulle kesilme riskiyle karşı karşıya bırakacaktır. Maçın kaderi doğrudan duran toplara taşınabilir.

---

## 7. Sonuç: Derbiyi Belirleyecek Üç Temel Mekanizma

1. **İlk Bölgedeki Top Kaybı Oranı:**  
   Fenerbahçe kendi yarı alanındaki top kayıplarını lig ortalaması olan 11.5 seviyesinin altına çekemezse, Galatasaray'ın Osimhen ve Sara ile bulacağı erken gol derbinin tüm taktiksel dengesini bozar.
2. **Kontratakların Şuta Dönüşüm Hassasiyeti:**  
   Fenerbahçe'nin ligde yakaladığı %28'lik kontra-şut dönüşüm oranı RAMS Park'ta da işlerse, sarı-lacivertliler topla daha az oynadığı bir senaryoda bile yüksek kaliteli (0.20+ xG) 3-4 net fırsat bulacaktır.
3. **Duran Top ve İkinci Top Hakimiyeti:**  
   Atilla Karaoğlan'ın ortalama 27 faullük yönetiminde kazanılacak serbest vuruşlar ve kornerlerde (GS sezon boyu 60, FB 50 korner kazandı), Galatasaray'ın hava topu hacmi (291 hava mücadelesi) ile Fenerbahçe'nin savunma direnci maçın skorunu belirleyecektir.
