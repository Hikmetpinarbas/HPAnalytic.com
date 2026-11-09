#!/bin/bash
# HPAnalytic - Veri Senkronizasyon ve Arşivleme Botu
# Kullanım: bash scripts/hpa_veri_senkronize.sh

DOWNLOAD="/sdcard/Download"
BASE_DIR="/sdcard/HPAnaliz/SportsBase"
LIG_DIR="$BASE_DIR/ligler"
ARSIV_DIR="$LIG_DIR/_eski_arsiv"

echo "📦 Veri senkronizasyonu başlıyor..."
mkdir -p "$LIG_DIR/super_lig" "$LIG_DIR/sampiyonlar_ligi" "$ARSIV_DIR"

# 1. Yeni İndirilenleri Taşı (Süper Lig)
for f in "$DOWNLOAD"/*"Süper Lig"*.xlsx; do
  [ -e "$f" ] || continue
  fname=$(basename "$f")
  if [ -f "$LIG_DIR/super_lig/$fname" ]; then
    mv "$LIG_DIR/super_lig/$fname" "$ARSIV_DIR/${fname%.xlsx}_$(date +%s).xlsx"
  fi
  mv "$f" "$LIG_DIR/super_lig/"
  echo "  -> Taşındı: $fname (Süper Lig)"
done

# 2. Yeni İndirilenleri Taşı (Şampiyonlar Ligi)
for f in "$DOWNLOAD"/*"Champions League"*.xlsx; do
  [ -e "$f" ] || continue
  fname=$(basename "$f")
  if [ -f "$LIG_DIR/sampiyonlar_ligi/$fname" ]; then
    mv "$LIG_DIR/sampiyonlar_ligi/$fname" "$ARSIV_DIR/${fname%.xlsx}_$(date +%s).xlsx"
  fi
  mv "$f" "$LIG_DIR/sampiyonlar_ligi/"
  echo "  -> Taşındı: $fname (Şampiyonlar Ligi)"
done

# 3. Takım Bazlı Dosyalar (Fenerbahçe, Galatasaray vb.)
mkdir -p "$BASE_DIR/takimlar"
for f in "$DOWNLOAD"/*"Fenerbahce"*.xlsx "$DOWNLOAD"/*"Galatasaray"*.xlsx; do
  [ -e "$f" ] || continue
  fname=$(basename "$f")
  mv "$f" "$BASE_DIR/takimlar/"
  echo "  -> Taşındı: $fname (Takım Verisi)"
done

# 4. Arşiv Temizliği (30 günden eski arşivleri sil, disk şişmesin)
find "$ARSIV_DIR" -name "*.xlsx" -mtime +30 -delete

echo "✅ Senkronizasyon başarıyla tamamlandı. Tüm güncel veriler yerinde."
