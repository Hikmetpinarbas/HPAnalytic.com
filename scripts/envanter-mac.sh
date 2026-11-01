#!/bin/bash
MATCH_DIR="/sdcard/HPAnalytic/data/raw/SB_ARCHIVE/matches"
CSV_DIR="/sdcard/HPAnalytic/data/raw/sportsbase"

echo "=== SB_ARCHIVE MAÇ KLASÖRLERİ (organize) ==="
for d in "$MATCH_DIR"/*/; do
  [ -d "$d" ] || continue
  name=$(basename "$d")
  [[ "$name" == _* ]] && continue
  xlsx=$(find "$d" -maxdepth 1 -name "*.xlsx" 2>/dev/null | wc -l)
  [[ "$xlsx" -gt 0 ]] && echo "  ✓ $name  ($xlsx xlsx)"
done

echo ""
echo "=== HAM CSV KAYNAKLARI (sportsbase) ==="
for d in "$CSV_DIR"/*/; do
  [ -d "$d" ] || continue
  name=$(basename "$d")
  csv=$(find "$d" -maxdepth 2 -name "*.csv" 2>/dev/null | wc -l)
  [[ "$csv" -gt 0 ]] && echo "  ✓ $name  ($csv csv)"
done
