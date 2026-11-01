#!/bin/bash
ROOT="/sdcard/HPAnalytic/data/raw"
OUT="docs/VERI-MANIFEST.md"

echo "# HPAnalytic — Veri Manifesti" > "$OUT"
echo "" >> "$OUT"
echo "Üretim: $(date '+%Y-%m-%d %H:%M')" >> "$OUT"
echo "" >> "$OUT"

# 1. MAÇLAR (tam CSV var mı?)
echo "## 1. Maç Dosyaları (CSV + XLSX)" >> "$OUT"
echo "" >> "$OUT"
echo "| Maç | CSV | XLSX | Durum |" >> "$OUT"
echo "|---|---|---|---|" >> "$OUT"
for d in "$ROOT/SB_ARCHIVE/matches"/*/; do
  [ -d "$d" ] || continue
  name=$(basename "$d")
  [[ "$name" == _* ]] && continue
  [[ "$name" == *HALVES ]] && continue
  csv=$(find "$d" -maxdepth 1 -name "*.csv" 2>/dev/null | wc -l)
  xlsx=$(find "$d" -maxdepth 1 -name "*.xlsx" 2>/dev/null | wc -l)
  [[ "$csv" -eq 0 && "$xlsx" -eq 0 ]] && continue
  if [[ "$csv" -ge 3 ]]; then durum="✅ HAZIR"
  elif [[ "$xlsx" -ge 2 ]]; then durum="🟡 XLSX OK"
  else durum="❌ EKSİK"; fi
  echo "| $name | $csv | $xlsx | $durum |" >> "$OUT"
done

# 2. TURNUVA / SEZON
echo "" >> "$OUT"
echo "## 2. Turnuva / Sezon Dosyaları" >> "$OUT"
echo "" >> "$OUT"
find "$ROOT/SB_ARCHIVE/tournament_stats" -name "SEASON_*.xlsx" 2>/dev/null | while read f; do
  echo "- $(basename "$f")" >> "$OUT"
done

# 3. FİTNESS
echo "" >> "$OUT"
echo "## 3. Fitness Dosyaları" >> "$OUT"
echo "" >> "$OUT"
find "$ROOT/SB_ARCHIVE/fitness" -name "*.xlsx" 2>/dev/null | while read f; do
  echo "- $(basename "$f")" >> "$OUT"
done

cat "$OUT"
