# İki onaylı makale — yayın kaydı

Kullanıcı 28 Ekim 2026 tarihinde derbi ve Vosse için açık yayın yetkisi verdi. Diğer adaylar, yeni site kabuğu ve yeni logo bu yayına dahil değildir.

Temel: 4a352ec838280cfd425b9aa01e33f87a5f593fc9; önceki başarılı üretim GitHub run 40572558417. Geri alma Worker sürümü: 3d546256-a6fb-4234-bdc5-3f81ff040a22. Başarısız canlı kontrolde bu sürüm yeniden %100 dağıtılabilir; veritabanı göçü yoktur.

Derbi: mevcut URL korundu, altı özgün grafik. Veri dizisi temel commit ile yapısal olarak eşit; KDE ve saha hesabı bayt düzeyinde eşit. Yalnızca görünürlüğe göre ilk çizim ertelendi. Eski public HTML aynı URL'deki yeni Astro çıktısını örtüyordu; bu dosya burada arşivlendi.

Vosse: 34 paragraf, sekiz sahne, özgün araştırma/göz/kaleci bileşenleri. NRC/Ajax fotoğrafları lisansları doğrulanamadığı için kopyalanmadı veya yayımlama varlıklarına alınmadı. Özgün kavramsal SVG ve kaynaklı sayısal karşılaştırmalar kullanıldı. Nisan görev duyurusu ile Mayıs haberi ayrıldı.

Bilimsel eşleştirmeler: 11 kaleci / 12 hafta / 0,82 m/s / 523 W için DOI 10.1080/14763141.2022.2099966; 42 cm gerçek maç sonucu değil senaryo hesabıdır. 14 oyuncu / 220 deneme ve 886–488 / 627–513 ms için DOI 10.1177/1747954120943067; 190 oyuncu / 45 ilk burkulma için DOI 10.1177/0363546518808027. Ortak yazarlık ve örneklem sınırları makalede korunur.

Yerel release testleri: 363 geçti, 16 atlandı, 0 hata. Bunlar mevcut üretim temelinin testleridir; daha geniş tasarım dalındaki 375 başarılı test ayrı kapsamdır ve korunmaktadır. Astro check: 237 dosya, 0 hata, 0 uyarı. Build başarılı; önceki boş research/visuals koleksiyonu uyarıları sürüyor.

İki sayfa 360/390/768/1024/1440/1920 px'de gerçek Chromium ile kontrol edildi: taşma yok, tek H1/canonical, noindex yok, üçüncü taraf fotoğraf yok, JS hatası yok. KDE 42/24, play/pause, Vosse faz/gaze kontrolleri geçti. Axe taramalarında ihlal yok; incomplete kurallar raporda tutuldu, tam manuel WCAG sertifikası iddia edilmez. Kanıt: qa-artifacts/two-approved-articles/. GitHub hattında aynı iki makale kontrolü üretim çıktısına uygulanır.

Yerel Lighthouse derbi: 83 performans / 100 erişilebilirlik / 100 best practices / 100 SEO. LCP 3,3 sn; TBT 160 ms; CLS 0,034. Önceki 67 başlangıç değerinden iyileşti; 90 hedefi henüz bu yerel ölçümde karşılanmadı. Canlı CDN ölçümü ayrıca yapılmalıdır.

Bu dosya dağıtım başarı kanıtı değildir. Commit, GitHub run, Cloudflare deployment ve canlı sonuçlar dağıtım sonrasında ayrı doğrulanmalıdır.
