# HPANALYTIC — GRAFİK, FORMÜL VE ARAŞTIRMA SÖZLEŞMESİ

## 1. Referans Alınan Ödüllü Projeler ve Teknikleri
- **The Pudding:** Kaydırma güdümlü anlatılar, katmanlı açıklamalar (annotation layers).
- **NYT Sports:** 3D animasyon, makine öğrenmesi destekli hızlı görselleştirmeler.
- **Reuters Graphics:** Sakin paletler, keskin ve net açıklamalar.
- **BBC GEL:** Altyazı ve başlık standartları (37 karakter/satır, 160-180 kelime/dk).

## 2. Kullanılacak Matematiksel Formüller ve Metrikler
- **xG (Expected Goals):** Şutun gol olma olasılığı (konum, vücut parçası, oyun durumu).
- **xT (Expected Threat):** Topun bulunduğu bölgenin gol atma olasılığına katkısı (Markov modeli).
- **VAEP (Valuing Actions by Estimating Probabilities):** Eylemlerin skora etkisini ölçen model (Q(Si) = P(score) - P(concede)).
- **PPDA (Passes Allowed Per Defensive Action):** Baskı yoğunluğu metriği.
- **xGOT (Expected Goals on Target):** Şutun kaleye isabet ettiği yer dikkate alınarak hesaplanan xG.

## 3. Grafik Türleri ve D3.js/GSAP Uygulama Prensipleri
- **Pas Ağı:** RabonaJS/d3-soccer ile saha çizimi; oyuncular arası bağlantılar GSAP ile akan çizgiler olarak canlandırılacak.
- **Şut Haritası:** Her şut xG değerine göre boyutlandırılacak; hover/tap ile GSAP destekli bilgi kartı açılacak.
- **Hareketli Isı Haritası:** d3-soccer heatmap modülü; GSAP timeline ile 1. yarıdan 2. yarıya renk geçişi sağlanacak.
- **Momentum Grafiği:** PPDA benzeri metriklerle oluşturulacak; GSAP ile soldan sağa çizim animasyonu yapılacak.
- **Tüm Grafikler:** Sitenin `#08090B` arka planı, `#B4FF39` (neon) ve `#FF6B35` (turuncu) renk paletine sadık kalacak. Altyazılar bu renklerde ve akıcı olacak.

## 4. Sürdürülebilirlik
Her yeni grafik türü, `src/js/viz/` altında modüler bir dosya olarak geliştirilecek. Veri işleme adımları `scripts/` altında Python ile yapılacak. Tüm yeni formüller ve görsel kararlar bu sözleşmeye eklenecek.
