# HPANALYTIC — OPERATOR YOL HARİTASI (GO hedefi: 2026-10-14 12:00 TRT)
Created: 2026-10-12 · Owner: Hikmet (Publisher/GO) · Builder: opencode · AUTOPUBLISH=OFF (yalnız adım 4'te Hikmet aktif olarak açar)

## 1. Kanıta dayalı durum (tartışmasız)
| Konu | Gerçek (ölçüldü) |
|---|---|
| Deploy pipeline | **Çalışıyor.** `site-hp-standard-v2`'ye push = GitHub Actions → build + test + `wrangler deploy`. 8/8 yeşil production deploy (6-7 Ekim). `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` secrets mevcut |
| PR #24 (`qa/hpanalytic-acceptance-20261012` → `site-hp-standard-v2`) | **MERGEABLE + CI SUCCESS.** 138 dosya, 3295 satır: reading-desk, scouting uzmanları, search düzeltmesi, JSON-LD güvenlik, launch series testler/görseller. Tek GitHub merge = yeni site kapsamı yayında |
| Eksik 3 dosya (yalnız çalışma ağacında, hiçbir PR'da yok) | `src/middleware.ts` (/control 404), `src/pages/api/youtube.json.ts` (cloudflare:workers fix), `tests/p0-control-gate.test.mjs` |
| `astro check` açık hatası | `Cannot find module 'cloudflare:workers'` → `npx wrangler types` ile üretilen `worker-configuration.d.ts` + tsconfig gerekiyor (yeni bağımlılık yok) |
| PR #25 (kırık) | Orta push'taki eski middleware `process` kullanıyordu, `@types/node` yok → CI FAIL ×2. Yerel sürüm temiz (7 satır, `process` yok); PR kapatılacak |
| İçerik | Canlıda 4 makale; **yeni yayınlanmış tek makale yok**. Tanıtım gövdesi burada zayıf (içerik değil, engel değil — adım 3) |
| 12+ handoff dokümanı | Geçmiş; operatör koordinasyonu bundan sonra YALNIZCA bu dosya + repo (commit/PR/URL) |

## 2. Hedef kapsamı (kıyamet koruması)
Site "açılma" aşamasına geçmek için gereken tek şey: **PR #24 + 2 dosya fix'i yayında.** İçerik/teaser buna paralel yürür, açılışı engellemez.

## 3. Adımlar (sahip / tarih / kabul ≤ 1 satır)

| # | Görev | Sahip | Kabul (definition of done) |
|---|---|---|---|
| 1 | `release/go-20261014` dalı aç (qa-acceptance üzerine): temiz middleware + youtube fix + p0 testi ekle; `npx wrangler types` → commit `worker-configuration.d.ts`, tsconfig'e ekle | opencode (10-13 sabah) | `npm run check` 0 hata, `npm test` yeşil, CI build yeşil |
| 2 | PR #25'i kapat (içinde kırık middleware var); adım 1'i PR #24 dalına birleştir, CI'yi tekrar yeşille | opencode | PR #24 stack green + "Ready for human merge" yorumu |
| 3 | İçerik: mevcut 4 makalenin tanıtım pasajları + 1 flagman makale (Rizespor-Fenerbahçe adayı üzerinden) `docs/launch/publish-queue/`e hazır; OG/sosyal kart onay dosyası | Editor + Hikmet (10-13 akşam) | `docs/launch/publish-queue/` min 3 makale, kanonik + og:title/desc doğru |
| 4 | **Hikmet GO:** 12:00 TRT'de PR #24'ü merge → otomatik production deploy | **Hikmet (tek yetkili, tek buton)** | 10 dk içinde canlı doğrulama: `/` 200, `/control/*` 404, `/api/youtube.json` 503, diğer rotalar 200 |
| 5 | Tanıtım: `public/social-card.png` + og:image onayı, 1. paylaşım tarihi; teaser (P2) ayrı, lisanslı görsel şartıyla | Hikmet | İlk paylaşım URL'si canlı |

## 4. Kesme kuralı (kıyameti kırmak için)
- **10-14 12:00'da GO yoksa → RELAXED GO:** yalnız adım 1 + adım 4 (teknik paket) otomatik yayınlanır; içerik ve teaser iptal değil, sonraki günlere devreder. **Site açılışı içerikle bekletilemez.**
- 10-16 sonrası: tanıtım başlar; ölçüm (post zamanları, kaynak kanal) ilk 14 günlük veriyle belirlenir. "En iyi post saati" araştırması yapılmaz.

## 5. Operatör disiplini (bundan sonra)
1. Strateji/plan/handoff dokümanı üretmek **yasak**; tek çıktı = commit / PR / CI run / canlı URL / artefakt.
2. Her görev sonunda: `ACTION + EVIDENCE (URL/hash/status)`. ACK iddiası yalnız gözlenebilir kayıtla.
3. Deploy/görsel/lisans/ödenek engeli = Hikmet; onun dışında hiçbir şey akışı durduramaz.
4. Telefonda build denemesi YOK (workerd/TCMalloc duvarı); builders = CI (Linux x86_64).
5. Node daima `/opt/hpanalytic-node24/bin`.

## 6. Referans kanıtları
- PR #22, #23, #24, #25 · `gh run list -w "HPAnalytic Production Deploy"` (8 yeşil) · `gh secret list`
- MISSION_20_EXECUTION_20261012.md (P1/P2/P3 bu yol haritasından sonra sıraya alınır)