---
title: "3-1'in içindeki asıl maç: Galatasaray 10 kişi kaldı, sonra yeniden üretti"
description: "Galatasaray–Kasımpaşa maçını provider olay verisiyle yeniden okuma: 12-3 isabetli şut, 22-6 başarılı ceza sahası pası ve kırmızı kart sonrası değişen skor akışı."
date: 2026-10-10
section: analysis
evidenceClass: DIRECT
claimCeiling: EVENT_OBSERVABLE_AND_SEQUENCE_INTERPRETATION
featured: true
articleKind: MATCH_ANALYSIS
author: "Hikmet Pınarbaş"
language: tr
topics:
  - "Galatasaray"
  - "Kasımpaşa"
  - "Maç analizi"
  - "Provider verisi"
editorial_status: CANDIDATE
qualityStatus: PROVIDER_VERIFIED
sourceClaimsValidated: true
counterevidence:
  - "Olay verisi takım şekli, topsuz koşular ve oyuncu niyetini tek başına göstermez."
  - "Kırmızı kart ile sonraki gol arasında zaman sırası vardır; bu, tek başına nedensellik kanıtı değildir."
  - "Aynı aksiyonun farklı facet etiketleri ayrı futbol aksiyonları gibi toplanmamalıdır."
---

Skor 3-1. Ama maçın analitik hikâyesi skordan daha ilginç.

Provider'ın tam maç olay dosyası **2.995 satır** içeriyor. Bu veri Galatasaray'ın yalnızca daha fazla bitiriş üretmediğini; ceza sahasına pasla erişimde de belirgin bir hacim farkı kurduğunu gösteriyor. Aynı dosyada Galatasaray adına **12**, Kasımpaşa adına **3** “shots on target” kaydı; başarılı ceza sahası paslarında ise **22'ye 6** fark var.

Bu iki sayı tek başına “Galatasaray neden kazandı?” sorusunu çözmez. Fakat oyunun hangi tarafında üstünlüğün tekrar tekrar üretildiğini gösteren güçlü bir başlangıçtır.

## Maçın kırıldığı yer skor tabelası değil

İlk golün provider kaydı 2682. saniyede geliyor: **Abdülkerim Bardakcı**. Aynı olay kümesinde “goal”, “shot on target” ve duran top hücumuna katılım etiketleri birlikte bulunuyor. Burada önemli metodolojik ayrım şu: bunlar üç ayrı pozisyon değil, aynı aksiyonun farklı veri yüzeyleri.

İkinci yarıda maç başka bir rejime geçiyor.

Provider kaydına göre **Lucas Torreira 4091. saniyede kırmızı kart görüyor**. Yaklaşık 325 saniye sonra, 4416. saniyede **Jesurun Rak-Sakyi** Kasımpaşa adına skoru eşitliyor.

Bu sıra bize şunu söyleme hakkı verir: Galatasaray sayısal eksilmeyi yaşadı ve ardından skor eşitlendi.

Ama “kırmızı kart golü yarattı” diyemeyiz. Bunun için Kasımpaşa'nın o bölümdeki yerleşimini, Galatasaray'ın savunma şeklini, oyuncular arası mesafeleri ve gol sekansını video/tracking ile doğrulamak gerekir.

## Asıl sinyal: 10 kişiyle maçın sonunu yeniden ele geçirmek

Eşitlikten sonra skor uzun süre 1-1 kalıyor. Galatasaray'ın ikinci ve üçüncü golleri provider zaman çizelgesinin çok geç bölümünde geliyor:

- **Barış Alper Yılmaz — 5723. saniye**
- **Mario Lemina — 6084. saniye**

Bu iki golün önemi yalnızca skoru 3-1'e taşıması değil. Galatasaray kırmızı karttan sonra avantajını kaybedip eşitliği gördüğü bir maçta, son bölümde yeniden sonuç üretmeyi başardı.

Lemina'nın gol kaydında aynı sekans içinde **başarılı dripling**, **final-third başarılı dripling**, **chance** ve **goal** etiketleri bulunuyor. Yine bunları dört ayrı aksiyon gibi saymamak gerekir. Fakat sekansın top taşıma → şut/gol sonucuna bağlandığını olay yüzeyinde görebiliyoruz.

## 12-3 ve 22-6 ne anlatıyor?

**12-3 isabetli şut farkı**, bitiriş hacminin Galatasaray lehine olduğunu gösteriyor.

**22-6 başarılı ceza sahası pası farkı** ise yalnızca şut anına değil, ceza sahasına erişimin bir bölümüne bakmamızı sağlıyor. Bu, “25 şut attı, demek ki iyi oynadı” türü yüzeysel okumadan daha değerlidir: üretimin bir önceki katmanını da sorgular.

Yine de sınır açık.

Başarılı ceza sahası pası bize pasın gerçekleştiğini söyler. Savunma hattını hangi koşunun açtığını, alıcının ne kadar baskı altında olduğunu veya pasın neden mümkün hale geldiğini tek başına söylemez.

## Provider geldiğinde ne değişti?

Maçtan hemen sonra kullanılan geçici veri bize hızlı bir fotoğraf verdi. Provider olay dosyası geldiğinde ise olay seviyesine indik.

Ve ilk önemli düzeltme burada ortaya çıktı: geçici zaman çizelgesindeki yaklaşık dakikalarla provider'ın olay zamanları bire bir aynı değildi. Bu yüzden nihai analizde **provider zaman çizelgesini esas alıyorum**.

Bu ayrım HPAnalytic'in çalışma biçiminin merkezinde:

**Hızlı veri ilk hipotezi kurar. Provider veri doğrular veya düzeltir. Video mekanizmayı sınar. Hüküm en son gelir.**

## Son hüküm

Galatasaray'ın 3-1'i yalnızca “daha çok şut atan takım kazandı” maçı değil.

Provider olay verisi üç ayrı katmanı destekliyor:

**1. Üretim üstünlüğü:** 12-3 isabetli şut.

**2. Ceza sahasına erişim üstünlüğü:** başarılı ceza sahası paslarında 22-6.

**3. Oyun durumu direnci:** kırmızı kart sonrası eşitliği görmesine rağmen son bölümde iki gol daha üretmesi.

Buna karşılık provider olay verisinin tek başına kanıtlamadığı şeyler de var: kolektif takım şekli, topsuz koşu mekanizması, presin bütün geometrisi ve oyuncu niyeti.

Futbol analizinde sayıların değeri, ne kadar çok olduklarında değil; **hangi cümleyi kurmaya yettiklerini bildiğimizde** ortaya çıkıyor.

*Hikmet Pınarbaş*
