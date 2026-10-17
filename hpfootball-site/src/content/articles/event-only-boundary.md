---
title: "Maç olay verisi ne görür, ne göremez?"
description: "Pas, şut ve top kazanımı bize oyunun bazı anlarını açıkça gösterir. Fakat topun dışında kalan alanı, takım şeklini ve niyeti aynı kesinlikle göstermez."
date: 2026-10-07
section: method
evidenceClass: DIRECT
claimCeiling: EVENT_OBSERVABLE_AND_METHOD_INTERPRETATION
featured: true
articleKind: EVIDENCE_REVIEW
series: EVIDENCE_REVIEW
author: "Hikmet Pınarbaş"
language: tr
topics:
  - "Maç analizi"
  - "Veri"
  - "Kanıt"
  - "İzleme verisi"
editorial_status: PUBLISHED
qualityStatus: HUMAN_APPROVED
sourceClaimsValidated: true
sourceRefs:
  - source_id: "STATSBOMB_360_METHOD"
    title: "StatsBomb 360 veri yapısı ve olay akışı açıklaması"
    locator: "https://blogarchive.statsbomb.com/uploads/2024/10/Match-Phases-In-Practice-Ghezzi-and-Sotudeh.pdf"
    rights: "REFERENCE_ONLY"
    claim_ceiling: "PROVIDER_METHODOLOGY"
  - source_id: "SKILLCORNER_XY"
    title: "SkillCorner XY izleme verisi metodoloji açıklaması"
    locator: "https://www.skillcorner.com/products/football/xy-tracking-data"
    rights: "REFERENCE_ONLY"
    claim_ceiling: "PROVIDER_SELF_DESCRIPTION"
  - source_id: "BOX_MODEL_DISCIPLINE"
    title: "George E. P. Box ve Norman R. Draper — Empirical Model-Building and Response Surfaces (1987), s. 424"
    locator: "https://mathshistory.st-andrews.ac.uk/Biographies/Box/quotations/"
    rights: "REFERENCE_ONLY"
    claim_ceiling: "VERIFIED_QUOTATION"
counterevidence:
  - "Olay verisinin sınırlı olması, değersiz olduğu anlamına gelmez. Doğru soruda pas, şut, top kazanımı ve benzeri kayıtlar güçlü ve ölçeklenebilir kanıt sağlar."
  - "İzleme verisi daha geniş bir mekânsal yüzey sunar; fakat tek başına oyuncunun niyetini, teknik direktörün talimatını veya bir hareketin nedenini kanıtlamaz."
  - "Yayın görüntüsünden türetilen izleme verisinde kamera dışındaki oyuncuların konumu modelleme veya kestirim içerebilir. Bu nedenle her koordinat aynı gözlem statüsünde değildir."
nextQuestion:
  question: "Bir oyuncunun bulunduğu yer ile takım içindeki işlevini nasıl ayırırız?"
  href: "/articles/position-role"
---

Bir futbol maçını veriden okumaya başladığımızda ilk hata genellikle çok erken gelir: **elimizde ne varsa, oyunun kendisi sanırız.**

Bir pas kaydı görürüz. Başlangıç ve bitiş noktası vardır. Oyuncunun kim olduğu, pasın sonucu ve zamanı bellidir. Ardından bu kaydın çevresine bir hikâye kurmaya başlarız: baskı vardı, alan açıldı, savunma bozuldu, oyuncu doğru kararı verdi.

Sorun tam burada başlar.

![Olay verisi, video ve izleme verisinin farklı gözlem kapasitelerini gösteren kavramsal şema](/visuals/event-data/evidence-surfaces.svg)

> **George E. P. Box:** “Bütün modeller yanlıştır; bazıları kullanışlıdır.”
>
> Box’ın istatistik için kurduğu bu kısa cümle, futbol analizine de iyi bir disiplin önerir: model gerçeğin kendisi değil, gerçeğe bakmak için seçtiğimiz araçtır.

Veri bize bazı şeyleri gerçekten gösterir. Bazı şeyleriyse yalnızca düşündürür. Bu ikisini ayırmadığımız anda analiz, kanıttan yoruma geçer; fakat okuyucuya hâlâ kanıt sunuyormuş gibi görünür.

## Olay kaydı, olayın çevresindeki bütün futbol değildir

Maç olay verisinin güçlü olduğu alan nettir. Kaydedilmiş bir pası, şutu, top sürmeyi, faulü veya top kazanımını inceleyebiliriz. Sağlayıcının tanımına ve veri kalitesine bağlı olarak olayın zamanı, sahadaki konumu, sonucu ve bazı nitelikleri de elimizde olabilir.

Bu küçümsenecek bir şey değildir. Aksine, modern futbol analizinin çok önemli bir bölümü bu kayıtlar sayesinde ölçeklenebilir hale gelir.

Fakat pasın kaydedilmiş olması, pas anındaki bütün oyunun kaydedilmiş olduğu anlamına gelmez.

Topu almayan oyuncu hangi koşuyu yaptı? Rakip savunmacı o koşuya nasıl tepki verdi? Pas kanalı gerçekten açık mıydı, yoksa topa sahip oyuncu başka bir seçeneği mi kaçırdı? Savunma çizgisi ne kadar kompakt kaldı? Uzak taraftaki oyuncu hangi alanı tuttu?

Bunların önemli bir kısmı standart olay kaydının dışında kalabilir.

Bu nedenle ilk ayrım basittir:

**Olay verisi, kaydedilmiş aksiyonu anlatır. Aksiyonun gerçekleştiği bütün mekânsal düzeni otomatik olarak anlatmaz.**

## Bir koordinat, izleme verisi değildir

Futbol verisinde en tehlikeli kısa yollardan biri budur.

Bir olayın saha üzerinde bir koordinatı bulunabilir. Bu, o anda topun veya aksiyonun nerede gerçekleştiğine ilişkin önemli bir bilgidir. Fakat tek bir olay koordinatından yirmi iki oyuncunun sürekli konumunu çıkaramayız.

İzleme verisi farklı bir ölçüm yüzeyidir. Oyuncuların ve topun zaman içinde değişen konumlarını daha yüksek sıklıkta takip etmeye çalışır. Bu yüzden takım boyu, oyuncular arası mesafe, koşu, alan kullanımı ve topsuz hareket gibi sorular için olay verisinden daha geniş bir gözlem alanı açabilir.

Ama burada da yeni bir hata yapmamak gerekir:

**İzleme verisi daha fazla konum bilgisi verir; futbolun bütün anlamını vermez.**

### Ölçek neden bağlam değildir?

Basit bir örnek düşünelim. **25 Hz** hızında çalışan varsayımsal bir izleme akışı, 90 dakikalık oyun süresinde tek bir oyuncu için yaklaşık **135.000 zaman örneği** üretir. 22 oyuncu için bu, uzatma sürelerini hesaba katmadan yaklaşık **2,97 milyon oyuncu-zaman gözlemi** demektir. Bu sayı gerçek bir maçın sağlayıcı istatistiği değil; örnekleme sıklığının ölçeğini göstermek için yapılan aritmetik bir örnektir.

| Kanıt yüzeyi | Güçlü olduğu soru | Tek başına kanıtlamadığı şey |
| --- | --- | --- |
| Olay verisi | Ne oldu, nerede oldu, sonucu neydi? | Bütün takım şekli ve topsuz ilişkiler |
| Video | Görünen oyuncular nasıl ilişkilendi? | Kamera dışındaki eksiksiz konumlar ve niyet |
| İzleme verisi | Oyuncular zaman içinde nerede ve nasıl hareket etti? | Taktik talimat, kararın nedeni ve oyuncunun zihinsel niyeti |
| Model çıktısı | Tanımlanmış probleme göre olasılık/değer nedir? | Gerçeğin kendisi veya mekanizmanın otomatik açıklaması |

Milyonlarca konum kaydı, gözlem çözünürlüğünü büyütür. Fakat “oyuncu neden oraya gitti?” sorusunun cevabı bu kayıtların içinde hazır halde bulunmaz.

Oyuncunun bir noktadan diğerine gitmiş olması gözlenebilir. Neden gittiği ise ayrı bir sorudur.

## Görmek ile açıklamak aynı şey değil

Bir oyuncunun öne çıktığını gördüğümüzde bunun bir baskı hareketi olduğunu düşünebiliriz. Yanındaki oyuncunun kapattığı açı, arkasındaki savunmanın konumu ve rakibin pas seçenekleri bu yorumu güçlendirebilir.

Yine de hareketin kendisi ile hareketin niyeti aynı kanıt sınıfında değildir.

Benzer biçimde bir takımın top kaybından sonra hızla daraldığını görebiliriz. Bu tekrar eden bir davranışsa mekanizma hakkında daha güçlü bir yorum kurabiliriz. Fakat tek bir görüntüden “takımın savunma prensibi budur” sonucuna atlamak başka bir şeydir.

Analistin işi yalnızca daha fazla veri toplamak değildir. **Hangi cümlenin hangi kanıtla kurulabileceğini bilmek de analizin parçasıdır.**

## Baskı sayısı, pres mekanizması değildir

Bir veri sağlayıcısının “baskı” olarak etiketlediği olaylar çok değerlidir. Oyuncunun rakibe ne sıklıkta müdahale etmeye çalıştığını, bu olayların nerede gerçekleştiğini veya sonrasında ne olduğunu incelemek için kullanılabilir.

Fakat kolektif pres bundan daha büyük bir problemdir.

Presi anlamak istediğimizde en azından tetikleyici, yaklaşma açısı, arkadaki koruma, yakın oyuncuların ilişkisi, rakibin kaçış seçenekleri ve hareketin sonucu gibi parçalar önem kazanır.

Bir “baskı” olayı bunlardan birini veya birkaçını yakalayabilir. Bütün mekanizmayı temsil ettiğini varsayamayız.

Bu ayrım küçük görünür ama sonuçları büyüktür. Çünkü sayı arttıkça insanın güveni de artma eğilimindedir. Oysa **ölçüm sayısının artması, ölçülen şeyin tanımını genişletmez.**

## Ortalama konum, takım şeklinin fotoğrafı değildir

Aynı problem ortalamalarda da karşımıza çıkar.

Bir oyuncunun ortalama konumu, maç boyunca bulunduğu noktaların özetidir. Faydalıdır. Rol değişimini, saha eğilimini veya iki oyuncu arasındaki genel yerleşim farkını araştırmak için başlangıç noktası olabilir.

Ama ortalama, zamanın içindeki farklı oyun durumlarını üst üste bindirir.

Takım öndeyken başka, gerideyken başka davranmış olabilir. Oyuncu ilk yarıda bir rolde, ikinci yarıda başka bir rolde oynamış olabilir. Topa sahipken geniş, topsuzken iç koridorda konumlanmış olabilir.

Bütün bunları tek bir noktaya sıkıştırdığımızda ortaya çıkan şekil gerçektir; fakat **gerçeğin tamamı değildir.**

Bu nedenle ortalama konumu “takımın sahadaki şekli” diye sunmak yerine, hangi zaman aralığının ve hangi oyun durumlarının bu ortalamayı oluşturduğunu sormak gerekir.

## Video da kusursuz hakikat değildir

Verinin sınırlarını anlatırken videoyu kusursuz bir karşılaştırma noktası gibi görmek de yanlış olur.

Yayın kamerası topu takip eder. Kadraj dışında kalan oyuncular görünmeyebilir. Kamera açısı mesafeyi yanıltabilir. Tekrar görüntüsü zaman akışını kesebilir. Bir oyuncunun beden yönünü görebiliriz ama ne gördüğünü kesin olarak bilemeyiz.

Video, olay verisinin göremediği birçok ilişkiyi açar. İzleme verisi de videonun manuel olarak takip edilmesi zor mekânsal örüntülerini ölçülebilir hale getirebilir.

Doğru yaklaşım bunları birbirinin rakibi yapmak değildir.

**Olay verisi başka, video başka, izleme verisi başka sorulara daha güçlü cevap verir.**

Asıl kalite, hangi soruda hangi kanıt yüzeyine ihtiyaç olduğunu doğru seçmekten gelir.

![Gözlemden iddiaya giderken varsayım katmanlarını gösteren açıklayıcı şema](/visuals/event-data/measurement-chain.svg)

## Model çıktısı da mekanizma değildir

Beklenen gol, tehdit değeri, aksiyon değeri veya benzeri modeller oyunu anlamak için güçlü araçlardır. Fakat her model belirli girdiler, tanımlar ve varsayımlar üzerine kurulur.

Modelin ürettiği sayı, doğrudan gözlenmiş bir futbol olayı değildir. Gözlemlerden türetilmiş bir değerlendirmedir.

Bu yüzden bir model “bu aksiyon değerlidir” dediğinde analistin ikinci sorusu başlamalıdır:

**Hangi tanıma göre, hangi girdilerle ve hangi futbol problemini ölçmek için?**

Modeli reddetmek gerekmiyor. Tam tersine, modeli doğru yere koymak gerekiyor.

## Analistin görevi boşlukları hayal gücüyle doldurmak değildir

İyi analiz her soruya cevap vermek zorunda değildir.

Bazen en doğru sonuç şudur:

**Bunu mevcut kanıtla bilmiyoruz.**

Bu cümle analizin zayıflığı değil, güvenilirliğidir.

Bir veri seti bize topun üzerindeki aksiyonları güçlü biçimde anlatıyorsa onu orada kullanırız. Mekânsal düzeni anlamak için video veya izleme verisine ihtiyaç varsa kanıt seviyesini yükseltiriz. Oyuncunun niyetine ilişkin doğrudan kanıtımız yoksa niyeti gerçek gibi yazmayız.

Futbol analizi daha fazla sayı üretme yarışı değildir.

Daha zor olan şudur: **hangi sayının hangi soruya cevap vermediğini bilmek.**

## Benim için mesele nerede başlıyor?

Bir analist olarak veriye itiraz etmiyorum; verinin **yetki alanını** tarif etmeye çalışıyorum. Çünkü sayı, doğru soruyla birleştiğinde oyunu berraklaştırır. Yanlış sorunun cevabı yapılınca ise yalnızca daha ikna edici bir yanılgı üretir.

Benim çalışma çizgim bu yüzden basit: önce kanıtı ayır, sonra mekanizmayı ara, en son hüküm kur. Bir grafiğin güzel görünmesi, bir metriğin gelişmiş olması veya bir veri setinin milyonlarca satır içermesi bu sırayı değiştirmemeli.

## Beş soruluk kontrol

Bir grafik, metrik veya maç verisi gördüğümde şu beş soruyu sormak yeterli bir başlangıç sağlar:

1. **Gerçekte ne ölçüldü?**
2. **Ne doğrudan gözlendi, ne sonradan türetildi?**
3. **Bu veri hangi futbol sorusunu cevaplayabilir?**
4. **Hangi önemli bilgi bu ölçüm yüzeyinin dışında kaldı?**
5. **Kurduğum cümle, elimdeki kanıttan daha güçlü mü?**

Son soru en önemlisi.

Çünkü futbol analizinde hata çoğu zaman verinin yanlış olmasından değil, **verinin taşıyabileceğinden daha büyük bir cümle kurmamızdan** doğar.

## Okura son not

Buraya kadar geldiyseniz artık yalnızca bir grafiğe bakmıyorsunuz; grafiğin **neyi görmediğini** de sorguluyorsunuz. İyi futbol okumasının önemli bir eşiği tam burada başlar. Veriyi küçümsemeden, ona gereğinden fazla yetki vermeden; oyunun karmaşıklığına saygı duyarak.

![Karanlıkta kanıt ışığına bakan analisti temsil eden editoryal illüstrasyon](/visuals/event-data/analyst-shadow.svg)

*Hikmet Pınarbaş*

