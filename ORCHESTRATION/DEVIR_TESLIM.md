# HPAnalytic — Görev Devir Teslim

**Tarih:** 2026-11-04 · **Devreden:** Claude (başarısız animasyon)
**Devralan:** Yeni ajan (opencode / Claude / insan geliştirici)

## 1. PROJE ÖZET
- **Repo:** `~/hpanalytic-repo` (git: github.com/Hikmetpinarbas/HPAnalytic.com)
- **Build:** `npm run build` (Vite) → `dist/`
- **Deploy:** GitHub Actions → `push main`
- **Site:** hpanalytic.com

## 2. YAZILAR — DURUM

### Yayında (temiz)
16 yazı. `content/yazilar/*.md` → build → `public/yazi/*.html` → `dist/yazi/*.html`

### Arşive alınan (2026-11-04)
`_arsiv/2026-11-04/` altında:
- `konyaspor-galatasaray-veri-maci-nasil-okur.md`
- `mac-konyaspor-galatasaray-2026-10-30.md`
- `mac-kon-gal-30-10-2026.md`
- `konya-gs-v2.html`
- `public_data/konya-gs/` (9 JSON)

**Not:** Bunlar silinmedi, arşivde. Sezon analizi olarak geri gelebilir.

### Maç yazıları (kalan 6)
- `mac-besiktas-crystal-palace-2026-10-22`
- `mac-fenerbahce-slavia-prag-2026-10-20`
- `mac-galatasaray-fenerbahce-2026-10-26` (derbi)
- `mac-lille-galatasaray-2026-10-21`
- `mac-stuttgart-galatasaray-2026-11-03`
- `mac-kon-gal-30-10-2026` (arşivden sonra tekrar düzenlenebilir)

## 3. ANİMASYON — NEDEN BAŞARISIZ OLDU

### Denenenler
1. Statik SVG'ler → oyuncular köşeye yığıldı
2. CSS transform → `translate(var(--dx))` çalışmadı
3. Inline JS motor → koordinatlar saha dışına taştı
4. Rol bazlı sınırlama → kaleci de hareket etti
5. Kaleci sabitleme → hâlâ saha boyu çizgiler
6. Heatmap motoru → "spagetti" görünüm

### Gerçek sebep
**CSV `pos_x` değerleri "aksiyon koordinatı", "oyuncu dizilişi" değil.**
- Konya sağda çok aksiyon → avg_x sağa kayıyor
- GS solda çok aksiyon → avg_x sola kayıyor
- Gerçek diziliş koordinatları **veride yok**

### Çözüm
**Formasyon koordinatlarını elle tanımla** (`public_data/formations/*.json`).
Aksiyon koordinatları sadece overlay (heatmap, ok, yoğunluk) için kullanılır;
oyuncu yerleşimi için **kullanılmaz**.

## 4. YAPILACAKLAR (öncelik sırası)

- [ ] `public_data/formations/konya.json` — 4-2-3-1, 11 oyuncu, id + role + x/y
- [ ] `public_data/formations/galatasaray.json` — 4-3-3, 11 oyuncu
- [ ] `src/pitch/render.js` — formasyon tabanlı yerleşim + aksiyon overlay katmanı
- [ ] `konya-gs` yazısı yeniden yayına (animasyon çalışınca)
- [ ] Kalan 6 maç yazısı

## 5. RİSKLER
- CSV şeması değişirse `formations/*.json` id eşleşmesi bozulur → `player_id` doğrula
- Kaleci koordinatı **asla** aksiyon verisinden türetilmemeli
- Her animasyonda `x ∈ [2, 98]`, `y ∈ [5, 95]` clamp uygula

