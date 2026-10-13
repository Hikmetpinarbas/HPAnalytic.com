# RELEASE CANDIDATE — `release/go-20261014` (LOCAL ACCEPTANCE)
Date: 2026-10-12 · Status: **LOCAL_CANDIDATE** · Pushed: **NO** · Deployed: **NO** · HUMAN_APPROVED=false · AUTOPUBLISH=OFF

## 1. Kapsam (yalnızca istenen dört öğe)
| Öğe | Dosya | Not |
|---|---|---|
| `/control` middleware düzeltmesi | `src/middleware.ts` (yeni) | `process` içermez; `/control` ve alt yollarını `next()` öncesi 404 + `X-Robots-Tag: noindex` ile kapatır |
| YouTube env düzeltmesi | `src/pages/api/youtube.json.ts` (değişti) | `(locals as any).runtime?.env` yerine `import { env } from 'cloudflare:workers'` (adapter'ın kendi kullanımıyla aynı) |
| P0 regresyon testi | `tests/p0-control-gate.test.mjs` (yeni) | Middleware'in 404 + pathname kapısını doğrular |
| Cloudflare tip yapılandırması | `src/env.d.ts` (yeni) | `cloudflare:workers` modülü için minimal ambient tip; yalnız bu sürümün okuduğu binding'ler |

Kapsam genişletmesi yok; yeni bağımlılık eklenmedi; `package.json`/`package-lock.json` değişmedi.

## 2. Taban ve izolasyon
- **Base:** `ed314c4` (`review/hpanalytic-release-20261011`; PR #22 head, CI SUCCESS).
- **İzole worktree:** `/root/WT_GO_20261014` (branch `release/go-20261014`). `node_modules` yalnız salt-okunur symlink; kurulum yapılmadı.
- **Orijinal kirli çalışma ağacı dokunulmadı** (telefon `HP-PROJELERI` çalışma ağacı değişmedi).

## 3. Doğrulama (Node 24.21.0)
| Komut | Sonuç |
|---|---|
| `npm run check` (astro check) | **0 error / 0 warning** (96 hint). `cloudflare:workers ts(2307)` çözüldü |
| `npm test` | **248 / 248 pass**, 0 fail, 0 skip |
| `node --test tests/p0-control-gate.test.mjs` | PASS |
| `npm run build` | Cihazda koşulamadı: workerd/TCMalloc PRoot duvarı (ürün hatası değil). Build host = CI `ubuntu-latest` |
| `npx wrangler types` | Cihazda tamamlanamadı (aynı TCMalloc duvarı, runtime type üretimi) → `src/env.d.ts` ile elle karşılandı |

## 4. Güvenlik ve çakışma denetimi
- **PR #16 (JSON-LD XSS):** Tabanda **mevcut** — `src/lib/json-ld.mjs` + `[...id].astro` `serializeJsonLd` + `tests/json-ld-safety.test.mjs`. Eksik güvenlik düzeltmesi **yok**.
- **PR #22:** Bu adayın tabanı; CI SUCCESS. Çakışma yok.
- **PR #25 (FAIL):** Kırılma nedeni push edilmiş middleware'deki `process` + eksik `@types/node`. Bu adayda **temiz middleware** kullanıldı; kırık sürüm dahil edilmedi → çakışma çözülü.
- **PR #24 (138 dosya):** Otomatik kabul **edilmedi**; bu adayın kapsamına alınmadı. Çakışma notu: PR #24 tabanı `api/youtube.json.ts`'i **eski** sürümle taşır ve `src/middleware.ts` **içermez** → bu adayın iki fix'i PR #24 başına ayrıca uygulanmadan prod'a gitmemeli; aksi halde `/control` 500'ü ve `/api/youtube.json` 500'ü canlıda kalır.

## 5. Bilinçli olarak yapılmayanlar (ayrı onay gerekir)
push · merge · production deploy · içerik/PR yayını. Kabul raporu yalnız yereldir.

## 6. Tek aday
- **Branch:** `release/go-20261014` (bu commit) · base `ed314c4`
- Delta: 1 dosya değişti + 3 yeni dosya + bu rapor. Geri alma: branch'i kullanmamak / `git branch -D release/go-20261014`.
