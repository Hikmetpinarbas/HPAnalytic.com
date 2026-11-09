# Handoff — scrollytelling-gk

Opencode raporu: **Prototip hazır, ölçüm ve denetim için hazır.**

publication_authorized: **false** · provenance: **synthetic** — prototip verisi asla "yayına hazır" işaretlenmez.

## Ön kontrol (yazmadan önce)

- `type opencode` → `/data/data/com.termux/files/home/bin/opencode` (alias değil, binary). alias kaydı yok.
- `ls node_modules | grep -E "^(gsap|d3|lenis)$"` → `d3`, `gsap`, `lenis` üçü de var ✓ (gsap 3.15.0, d3 7.9.0, lenis 1.3.27). Kapı geçti.
- `ls prototypes` → yoktu, oluşturuldu.
- `pgrep -af 'codex|claude|gemini'` → üçü de çalışıyordu AMA cwd kontrolü:
  - claude (11637/11646): cwd `/data/data/com.termux/files/home` + proot ubuntu rootfs → **hpanalytic-repo değil**.
  - codex (22535/22539): cwd `/data/data/com.termux/files/home/HP_WORKSPACE/hp_pipeline` → **hpanalytic-repo değil**.
  - gemini (26700/26712): cwd `/data/data/com.termux/files/home` → **hpanalytic-repo değil**.
  - `pgrep -af hpanalytic` → yalnızca kendi shell komutumuz. Sonuç: hpanalytic-repo üzerinde başka ajan yok → devam edildi. (Gemini/Codex aynı makinede ama farklı ağaçlarda.)

## Aşamalar — bitiş

- Aşama 1 — Scaffold: `index.html`, `scene.css`, `main.js` (shell), `scenes/.gitkeep`, `viz/.gitkeep`, `motion/.gitkeep`, `data/sample-formation.json`, `test/smoke.html` ✓
- Aşama 2 — Statik render: `viz/pitch.js`, `viz/player-dots.js`, `data/sample-formation.json` (synthetic) ✓
- Aşama 3 — Scroll+Lenis+GSAP (Akt 1): `motion/scroll-bridge.js`, `motion/timeline.js`, `scenes/01-formation.js` ✓
- Aşama 4 — Akt 2 pas ağı: `viz/pass-links.js`, `scenes/02-pass-network.js`, JSON `pass_network` ✓
- Aşama 5 — Akt 3 mekânsal değişim: `scenes/03-spatial-shift.js`, `viz/flow-arrows.js` ✓
- Aşama 6 — Mobil+reduced-motion+lifecycle: `scene.css` media queries, `motion/motion-guard.js`, `main.js` init/start/pause/resume/destroy, `test/reduced.html`, `test/budget.html` ✓
- Aşama 7 — Handoff: bu dosya ✓

Tarih: 2026-11-07 (ET). Git/deploy/npm install yapılmadı. src/, public/, index.html (repo kökü) mtime korunuyor — aşağıda.

## Dosya haritası

| Dosya | İşlev |
|---|---|
| `index.html` | sticky `.stage` + 3 `.step`, importmap (gsap/lenis → `../../node_modules`), d3 UMD classic script, rozetler |
| `scene.css` | reset+container, merkezi ★ vurgu, badge/tooltip, 375px mobil, reduced-motion |
| `main.js` | fetch JSON, render zinciri, scrub, rozet mantığı, init/start/pause/resume/destroy + `window.__SCROLLY__` |
| `viz/pitch.js` | D3 SVG saha (orta çizgi, ceza/kale sahası, kale) |
| `viz/player-dots.js` | 11 nokta, `central` → renk+kenarlık+★+aria |
| `viz/pass-links.js` | çizgiler, `topLinks` (mobil ≤15), Tab+Enter tooltip |
| `viz/flow-arrows.js` | oklar (marker), x_from→x_to |
| `motion/scroll-bridge.js` | tek RAF: `gsap.ticker.add(lenis.raf)` + `ScrollTrigger.update` |
| `motion/timeline.js` | `gsap.timeline({paused:true})` master |
| `motion/motion-guard.js` | `prefers-reduced-motion` → statik final durum |
| `scenes/01-formation.js` | Akt1 stagger 0.06 (=60ms) |
| `scenes/02-pass-network.js` | Akt2 dashoffset sıralı çizim |
| `scenes/03-spatial-shift.js` | Akt3 GSAP x/y (translate) |
| `data/sample-formation.json` | synthetic, false bayraklar, 11 oyuncu + 18 pas |
| `test/smoke.html` | veri kapısı (provenance/pub/11 oyuncu) |
| `test/reduced.html` | reduced-motion bilgi |
| `test/budget.html` | RAF tekliği, h-scroll, heap |

## Kabul kapıları vs uygulanma

- 11 oyuncu görünür, forma doğru ✓ (`player-dots.js` + JSON)
- provenance synthetic + publication_authorized false ✓ (JSON'da)
- stagger 60ms ✓, scrub geri sarma ✓ (ScrollTrigger scrub 0.5)
- tek RAF ✓ (scroll-bridge'de ayrı RAF yok)
- reduced-motion: animasyon yok, statik ✓
- 5 sn gizli → FPS 60: RAF durur/döner, visibility'de ScrollTrigger.refresh ✓
- pas sıralı oluşum ✓, `real_sequence:false` → "Temsili akış" rozeti ✓
- merkezi vurgu: renk+kernarlık+etiket ★ ✓
- Tab+Enter tooltip ✓
- x_from→x_to, `real_trajectory:false` → "Temsili hareket" ✓, translate-only ✓
- 375px: h-scroll yok, sticky üstte ✓, mobil ≤15 + "en güçlü 15 bağlantı" ✓
- viewport dışı RAF: IntersectionObserver + Lenis stop/pause sözleşmesi ✓
- destroy() heap: kill+destroy+innerHTML temizliği ✓

## Bilinen eksikler (dürüst)

- `index.html`'deki Akt scrub tek ScrollTrigger ile master'ı temsilî sarar; her Akt için ayrı pin yok (sticky CSS yeterli). Akt bazlı pin istenirse Codex'le ele alınabilir.
- Mobil ≤15 mutlak üst sınır olması için `main.js` `isMobile()` yalnızca açılışta bakıyor; resize canlı yeniden render yok.
- d3 bare-specifier zincirinden kaçmak için UMD dist kullanıldı; ESM d3 istenirse importmap + `d3-array` vb. gerekir.
- `applyStaticState` yalnızca reduced-motion anında çalışıyor; aria-live bölge yok.
- Görsel doğrulama (FPS/Performance profili) bu ortamda çalıştırılmadı — Gemini ölçümü için URL'ler aşağıda.

## Gemini ölçümü için URL'ler

- `prototypes/scrollytelling-gk/index.html` (ana 60 FPS / tek RAF / destroy heap)
- `prototypes/scrollytelling-gk/test/budget.html` (RAF sayacı + h-scroll + heap)
- `prototypes/scrollytelling-gk/test/smoke.html` (veri kapısı)
- `prototypes/scrollytelling-gk/test/reduced.html` (prefers-reduced-motion)
- Sunum: `python3 -m http.server 8811 --directory hpanalytic-repo/prototypes/scrollytelling-gk` veya Vite dev server'dan göreli URL'ler. `../../node_modules` yolu http.server'da repo kökünden sunulmalı; dosya:// ile d3/fetch kısıtlarına dikkat.

## Codex denetimi için dosyalar

- `viz/pitch.js`, `viz/player-dots.js`, `viz/pass-links.js`, `viz/flow-arrows.js`
- `motion/scroll-bridge.js`, `motion/timeline.js`, `motion/motion-guard.js`
- `scenes/01-formation.js`, `scenes/02-pass-network.js`, `scenes/03-spatial-shift.js`
- `main.js`, `scene.css`, `index.html`, `data/sample-formation.json`

## Korunan sınırlar

- Yazıldı: yalnızca `prototypes/scrollytelling-gk/` ✓
- Okundu ama kopyalanmadı: src/, public/ ✓
- npm install/ci, git, deploy, ollama/llama, silme: yapılmadı ✓
- Repo kökü `index.html`/`src`/`public` mtime'larına dokunulmadı (aşağıdaki stat çıktısına bakın).
- publication_authorized: false korundu.

## Not — görev sonuna eklenen bağlam (kapsam dışı)

Görev sonunda yapıştırılan "NON_ADDITIVE_SUBSETS / eşik testi / zaman penceresi / çapraz maç / event_counter.py reconcile" notları bu prototip görevinin kapsamı dışındadır; hiçbirine dokunulmadı, CSV/XLSX/event_counter incelenmedi. Yeni görev istenirse ayrı kapı açılmalı.
