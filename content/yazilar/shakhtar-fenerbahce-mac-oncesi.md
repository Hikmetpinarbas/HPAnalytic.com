---
status: "review"
noindex: "true"
title: "Shakhtar Donetsk \u2014 Fenerbahçe: Maç Öncesi İnceleme İskeleti"
date: ""
type: "mac"
author: "Hikmet Pınarbaş"
excerpt: "Maç öncesi analitik iskelet; maç verisi ve ön metrikler onaylı kaynaktan gelmeden hiçbir alan doldurulmaz."
---

# Shakhtar Donetsk — Fenerbahçe: Maç Öncesi İnceleme İskeleti

> Bu sayfa **yayın adayıdır**; tamamı yerine oturmamış bir araştırma notudur.
> Yayın yalnızca `content/yayin-defteri.json` defterine HUMAN_APPROVAL basis'iyle
> girdikten sonra mümkündür. Eksik alanlar boş bırakılır, uydurulmaz.

## 1. Fixtür Kimliği

- Yarış: Shakhtar Donetsk — Fenerbahçe (.hp. kaynak: `public/assets/data/yaklasan-karsilasmalar.json`, `hpa.yaklasan_karsilasmalar.v1`)
- Tarih: **doğrulanmamış** (`tarih_dogrulanmis: false`). Tarih, onaylı kaynaktan
  doğrulanmadan başlığa veya gövdeye yazılmaz.

## 2. Veri Durumu (Bilinçli Boşluklar)

| Veri Bloğu | Durum | Bağlanacağı Nokta |
| --- | --- | --- |
| Maç olay verisi (event tracking) | YOK | `content/kaynak-veri/shakhtar-fenerbahce/` |
| Türetilmiş viz JSON'ları | YOK | `public/assets/data/shakhtar-fenerbahce/` (yalnız `hpa.*` şemalı) |
| Maç görselleri | YOK | `public/assets/images/shakhtar-fenerbahce/` |
| Sezon karşılaştırma profil | YOK | bulk/SEASON aggregation (`sl_teams.json` sözleşmesi benzeri) |

`content/kaynak-veri/shakhtar-fenerbahce/OKUBENI.md` ağaç sözleşmesi hazırdır;
ham CSV/XLSX/ZIP bu ağaçtan deploy edilmez ve çalışma zamanı fetch etmez (HP-W1-SITE-001).

## 3. Entegrasyon Bağlama Noktaları (Paket Geldiğinde)

- Makale: `content/yazilar/<final-slug>.md` (bu iskelet yeniden adlandırılır)
- Viz bağlama: `:::visual` blokları, `src/js/viz` mevcut öz-dataUrl deseni
  (`VIZ_STANDART_SOZLESMESI.md` geçerli; `pass-network.working.v8.js` dondurulmuş standart)
- Galeri kartları: mevcut `related-grid` / viz-embed sistemi; yeni tasarım sistemi yazılmaz

## 4. Kabul Zinciri (Yayın Kapısı)

1. İnsan onayı: ledger'a HUMAN_APPROVAL + source_sha256
2. `npm run build` — canonical `https://hpanalytic.com/yazi/<slug>.html`
3. `node scripts/release-security-gate.mjs dist` — SENSITIVE_FILE: 0
4. `node scripts/release/review_audit.mjs dist`
5. `deploy.yml` workflow_dispatch + `release_approved=true` (tek deploy kapısı)
