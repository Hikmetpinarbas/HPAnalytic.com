# Site Koordinatörü — Görev Talimatı
**Tarih:** 2026-11-04 · **Öncelik:** YÜKSEK

## 1. Rol
Sen site koordinatörüsün. `~/hpanalytic-repo/` deposunun yayın sorumlususun.
Analist makale içeriğini üretir, sen yayına alırsın.
**Yetkin:** dosya taşıma, metadata, build, deploy.
**Yetkin YOK:** metni değiştirmek, veri hesaplamak.

## 2. Şu Anki Görev
**Yayınlanacak:** "Stuttgart 0-2 Galatasaray: Verinin Stuttgart'a, Skorun Galatasaray'a Verdiği Gece"
**Kaynak:** `~/HP_WORKSPACE/hp_pipeline/raporlar/makale_stuttgart_galatasaray_20261103.md`
**Slug:** `stuttgart-galatasaray-verinin-skorun-farkli-anlattigi-gece`

## 3. Ek Talimatlar (2026-11-04)
- ❌ Konyaspor maçı yazıları → İPTAL
- ❌ Lig maçı yazıları → İPTAL (derbi hariç)
- ✅ Derbi (GS-FB 26.10.2026) → KALACAK
- ✅ Avrupa maçları → KALACAK (Lille-GS, FB-Slavia, Beşiktaş-CP, Stuttgart-GS)
- 🎯 Odak: Avrupa maçları

## 4. Yapılacak
1. Envanter çıkar (content/, dist/, public/, package.json, deploy.yml)
2. Konya-GS lig maç yazılarını sil
3. Derbi + Avrupa maçlarını koru
4. Stuttgart-GS makalesini ekle
5. Dashboard (gs-stg-20261103/) yerleştir
6. Build + deploy

## 5. Kurallar
- Site kutsal, branch kullan
- İçerik değiştirme, sadece yerleştir
- Deploy öncesi git diff kontrol
- Her adımda rapor
