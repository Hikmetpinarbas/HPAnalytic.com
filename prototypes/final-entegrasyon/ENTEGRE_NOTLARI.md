# Nihai Makale + Galeri Entegrasyonu — Teslim Notu (HPANALYTIC FINAL INTEGRATION)

**Branş/PR:** `vibe/wave1-ticker-hierarchy-e49fa7` → PR #102 (HEAD 58159cc + bu teslim)
**Kapsam kuralı:** Yeni tasarım sistemi kurulmadı; mevcut kimlik ve makale/düzen sistemi korunarak yalnızca bağlama altyapısı üretildi. Merge/deploy yapılmadı.

## 1. Neler üretildi (izole, dist'e sızmaz)

| Dosya | Rol |
| --- | --- |
| `content/yazilar/shakhtar-fenerbahce-mac-oncesi.md` | Shakhtar — Fenerbahçe **maç öncesi inceleme iskeleti** (status: review, noindex). Veri blokları bilinçli boş; uydurma yok. |
| `content/yayin-adaylari.json` | Aday kayıt defterine `shakhtar-fenerbahce-mac-oncesi` girdisi eklendi (incelemede, noindex: true). |
| `content/kaynak-veri/shakhtar-fenerbahce/OKUBENI.md` | Ham kaynak ağaç sözleşmesi (deploy edilmez; gs-stuttgart OKUBENI sözleşmesinin aynısı). |
| `prototypes/final-entegrasyon/shakhtar-fenerbahce-mac-oncesi-PROTOTIP.html` | Nihai makale + galeri yerleşiminin statik prototipi (repo kökünde; vite build bu klasörü dist'e kopyalamaz). |

## 2. Antigravity / OpenCode teslimlerinin bugünkü bağlanma durumu

- **Antigravity** (`_hazine/.../BRAND_REPLACEMENT_P0_20261018/DESIGN_HANDOFF.md`):
  Tipografi zinciri (Newsreader başlık + mono metadata) ve koyu zemin kimliği
  mevcut sitede **zaten üretimedir** (makale şablonu `scripts/build-yazi.mjs`).
  Logo/lockup/social-card SVG adaylarının dosyaları bu repoda fiziksel olarak **mevcut
  değil** (yalnızca brif korunduğundan aktarılamadı).
- **OpenCode** (`_hazine/.../OPENCode/HP-Analytic/GRAPHICS_FACTORY_REHABILITATION.md`):
  listedeki graphics factory modülleri (`hpa-adapter.js`, `spatial.js`, `ui-premium.html` …)
  bu repoda bulunamadı; kabul edilmiş Stitch kaynak palet çelişkisi bu teslimde
  **çözülmedi** — kullanıcı kararı gerekir. Mevcut Stitch-türetilmiş makale düzeni
  (data-visual-body slot sistemi, `src/js/viz/*`) kanonik kaldı.

## 3. Nihai düzenin mevcut mimarideki bağlama noktaları (galeri dahil)

- Viz slotları: `<div data-visual-body="<tip>">` → `src/js/article-viz.js` →
  `VIZ_REGISTRY` (`pass-network`, `tactical-map`, `gk-distribution`, `xg-timeline`,
  `pitch-layers`). Yeni maç paketi bu desenle bağlanır; `pass-network.working.v8.js`
  dondurulmuş standarttır (`ORCHESTRATION/VIZ_STANDART_SOZLESMESI.md`).
- Galeri: mevcut `related-grid` kart deseni (prototipteki gibi). Yeni bileşen yok.

## 4. Nihai denetim kanıtları (58159cc + aday teslimi üzerinde)

- `npm run build` → 17 makale yeniden üretildi; aday dist'te **yok** (19 html =
  17 yayımlı + 2 uyumluluk sayfası), sitemap/feed 17 makale, aday yok.
- `node scripts/release-security-gate.mjs dist` → `SECURITY_REVIEW_PASS` (161 dosya).
- `node scripts/release/review_audit.mjs dist` → `YAYIN_DENETIMI_GECTI`.
- `node --test tests/*.test.mjs` → **66/66 pass**.
- Mobil/masaüstü: 19/19 makale sayfasında `viewport` meta; makale şablonunda
  12 `@media`/`min-width` kırılımı (grid→tek kolon, hero clamp tipografi).
- Animasyon bütün(lüg)ü: `article-viz.js` (159 KB) + `page-transition.js` +
  `gsap-micro.js` + `extras2.js` distte; `prefers-reduced-motion` koruması korunuyor;
  `src/js/viz` bu teslimde hiç değiştirilmedi.
- Kaynak doğruluğu: aday içinde hiçbir metrik/veri üretilmedi; fixtür tarihi
  "doğrulanmamış" işaretli; feed/sitemap yalnız ledger onaylı 17 makaleyi gösteriyor.

## 5. Açık kararlar (kullanıcı)

1. "Galatasaray–Aston Villa maç sonu": repoda bu isimde içerik yok. Elimdeki tek
   gerçek paket git 9761073'teki **Aston Villa — Fenerbahçe (2026-10-14)** maç
   (`content/yayin-adaylari.json` → `iptal_edilenler` notu da aynısını söylüyor).
   Bu paket entegrasyona esas alınacak mı?
2. "Living Weave": repoda iz yok. Tanım/brief beklenecek ya da kapsam dışı mı?

Bu ikisi yanıtlanmadan ikinci öncelik (maç sonu paketi) bağlanmaz; ilk öncelik
(Shakhtar — Fenerbahçe maç öncesi) yukarıdaki izole iskelet ve prototiple
paket-veri gelince anında bağlanacak durumda bekliyor.
