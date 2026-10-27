# Maç Premier Tasarım Rehberi (v1)

Referans uygulama: `public/mac/galatasaray-fenerbahce-2026-10-26-mac-sonu/index.html`
Üst sözleşme: `docs/HP_FOOTBALL_DESIGN_CONTRACT_V1.md` (bu rehber onu görsel olarak somutlaştırır, değiştirmez).

## 1. İlke

Metin grafiğin üstüne binmez. Grafik okurun önünde durur, kaydırdıkça küçülür, şerit olur; metin altından akar. Grafik kanıttır, metin mekanizmadır; ikisi aynı alanı paylaşmaz.

## 2. Zemin ve renk (Caravaggio–Leonardo)

| Rol | Değer | Not |
|---|---|---|
| Zemin | `#0D0B09` + amber/umber radyal ışık | tek ışık kaynağı sağ üstte |
| Ev sahibi (Galatasaray) | `#E9DCBD` fildişi | |
| Konuk (Fenerbahçe) | `#5DAFAA` verdigris | kulüp renkleri çapraz atanmaz |
| Vurgu | `#D9A441` / altın `#F5B82E` | yalnız gol, seçili pencere, aktif adım |
| Kırmızı kart | `#B8433A` | başka yerde kullanılmaz |
| Isı haritası | magma (tek, nötr renk skalası) | takım rengi taşımaz; takım adı başlıkta kendi renginde |
| Saha çizgisi | slate `rgba(158,172,190,.55)` | ince, 1 px |

Kural: bir sayfada iki takım rengi + altın + magma. Başka renk yok.

## 3. Kaydırmalı anlatım (shrinking dock)

- `.scrolly > .sticky > figure.plate` + `.steps`.
- `.sticky` `position:sticky; top:0` ve yüksekliği JS ile tam boyuta sabitlenir (ölçüm: k=0). Böylece küçülme akışı kaydırmaz.
- `k = clamp(−scrolly.top / (full − strip), 0, 1)`; grafik `ctx.k` ile 30 adıma bölünüp yeniden çizilir.
- k arttıkça: grafik yüksekliği 430 → 88 px, eksen/etiketler solar (`fade = 1 − 4k`), başlık küçülür, alt başlık/okuma satırı/kaynak satırı CSS değişkeni `--k` ile sönümlenir.
- Adım metni düz fildişi, sol ince çizgi; aktif adım tam opak, diğerleri .34. Kart, kutu, gölge yok.
- IntersectionObserver bandı `-42% / -42%`; adım, grafiğin `win` durumunu belirler.
- `prefers-reduced-motion`: geçişler kapalı, animasyon otomatik başlamaz.

## 4. Grafik dili

| Plaka | Yöntem | Kanıt etiketi |
|---|---|---|
| Nabız | üç dakikalık çift yönlü çubuk, üst ev sahibi / alt konuk | TÜREV |
| Atlas | 12×8 hücre, magma, iki panelde ortak ölçek, kendi hücum yönü, halka = şut, yıldız = gol | KAYIT · TÜREV |
| Top kazanımı yoğunluğu | 8 m Gauss çekirdek yoğunluğu (KDE), zamanla birikir, halka = o anki olay, sayaç, kaydırıcı | KAYIT · TÜREV |
| Akış | ortalama yer değiştirme alanı, akış çizgileri (Pass-Flow yaklaşımı) | VEKİL |

Kurallar: ortak ölçek yoksa panel kıyaslanmaz; hücre sayısı görünür; yoğunluk tahmini kayıtta olmayan alan bilgisi eklemez ve bunu okuma satırında söyler; her plakanın alt satırında kanıt etiketi ve kaynak bulunur.

## 5. Atıflar

- Harsh Krishna: şut haritası ve saha çizim gelenekleri (ggshakeR, matplotlib).
- Edd Webster, Pass-Flow (MIT): hareket alanı ve akış çizgisi fikri.
- Kod kopyalanmadı; yöntemler HPAnalytic veri biçimine yeniden yazıldı.
- Veri: SportsBase. Marka işareti dosyası geldiğinde alt bilgiye eklenecek.

## 6. Kontrol listesi (her maç sayfası)

1. Metin hiçbir kırılımda grafiğin üstüne binmiyor (1366 ve 390 px).
2. Şerit hâlinde grafik okunur kalıyor (goller, şut işaretleri, kartlar).
3. Her görselin kanıt etiketi var; ortak ölçek ve hücre boyutu belirtilmiş.
4. İki takım rengi dışında renk yok; magma yalnız yoğunlukta.
5. Konsol hatası yok; `npm test` ve `npm run build` geçiyor.
6. Yasaklı sözcük ve onaylanmamış olay yok; her dakika-düzeyinde olay kayda dayanıyor.
