# HPAnalytic — Çalışma Sınırları Manifestosu

**Son güncelleme:** 2026-10-31

## Tek Çatı

Tüm HPAnalytic çalışması **`~/hpanalytic`** altında toplanır. Başka hiçbir dizinde çalışılmaz.

## İki Oda

### Oda A — Site (Frontend)
**Yol:** `~/hpanalytic/`

**Sorumlular:** Bu ajan, frontend geliştirici
**Ne yapılır:** `index.html`, `src/js/`, `src/css/`, `public/`, Vite build, Netlify deploy
**Ne yapılmaz:** `pipeline/` klasörüne dokunulmaz

### Oda B — Pipeline (Veri)
**Yol:** `/sdcard/HPAnalytic/`

**Sorumlular:** Hikmet operatörü
**Ne yapılır:** Ham CSV/XML/XLSX işleme, `build_package.py` ile JSON üretimi
**Ne yapılmaz:** `~/hpanalytic/src/` ve `index.html`'e dokunulmaz

## Köprü

Pipeline `*.json` üretir → siteye **kopyalanır** (`public/assets/data/packages/`). Site yazar değil, okur.

## Yasaklar

- `~/hpa-frontend/` (eski boş template) — **KULLANILMAZ, ARŞİV**
- `node_modules/` içine müdahale
- İki oda arasında doğrudan dosya paylaşımı (sadece paket kopyalama)

## Her Komut Öncesi

1. `pwd` — neredeyim?
2. Manifestoyu kontrol et — bu oda benim mi?
3. Yanlış odadaysam — `cd` ile doğru odaya geç

**Veri:** SportsBase
