# PASS NETWORK — ÇALIŞAN SÜRÜM SÖZLEŞMESİ

**Tarih:** 2026-11-05 · **Sürüm:** v7 · **Durum:** ✅ Canlı, hipnotik, korunacak

## Dosyalar (yedekler)
- `src/js/viz/pass-network.js` — ANA DOSYA
- `src/js/viz/pass-network.working.v7.js` — YEDEK (bozulursa buradan dön)
- `public/assets/data/gs-stuttgart/pass_network_v2.json` — VERİ
- `public/assets/data/gs-stuttgart/pass_network_v2.working.json` — YEDEK

## Çalışan Özellikler (SİLİNMEZ)
1. ✅ 11 oyuncu (GK dahil) + Değişenler toggle (5 sub)
2. ✅ Y ekseni TV standardı (sağ kanat alt, sol kanat üst)
3. ✅ Radyal etiket yerleşimi (dışa doğru açılır)
4. ✅ Force collide (node çakışma önleme)
5. ✅ Pas çizgileri çizim animasyonu (dashoffset)
6. ✅ Tıklama → seçim + ego highlight (diğerleri %12 opacity)
7. ✅ **Tıklama → çizgiler boyunca beyaz top akışı** (hipnotik)
8. ✅ Tıklama → alt partner bandı (bar grafiği + sayı)
9. ✅ Boş alana tıklayınca seçim temizlenir
10. ✅ Takım toggle (GS/Stuttgart) → seçim sıfırlanır
11. ✅ Hücum oku (altta GS, üstte Stuttgart, aktif olan parlak)
12. ✅ Marquee: somut pas sayıları
13. ✅ GK kare şekli, saha kenarında izole

## Değişenler Sistemi
- Dakikadan çıkarım: `sub_minutes + subbed_out_minutes ≈ 97`
- Pozisyon grubu eşleşmesi (CB, FB, CM, AM, FW, GK)
- Override: `substitutions.json` varsa onu kullanır (API için)

## Yasal Metrikler
- **correlation_pct** = `(2*w + 1) / (src_passes + dst_passes + 2) * 100` (Laplace smoothing)
- **weight** = ham pas sayısı (iki oyuncu arası)
- **passes** = oyuncunun toplam pas sayısı (xlsx'ten)

## Kırılma Noktaları (dokunma!)
- `flipY()` fonksiyonu — yön için
- Force simulation `strength(0.8).iterations(5)` — daha güçlü = saha dışı, daha zayıf = çakışma
- Radyal etiket mantığı (`horiz` kontrolü)
- `animateFlows()` — `requestAnimationFrame` ile akış

## Sıradaki (bu dosyaya dokunmadan)
- Kaleci uzun top viz (ayrı modül: `gk-distribution.js`)
- Isı haritası (ayrı modül: `heatmap.js`)
- Taktik harita (mevcut: `tactical-map.js`, iyileştirilecek)
- **Data Lab** — hepsini tek sayfada sekmeli toplama
