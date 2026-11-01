#!/bin/bash
set -e
MATCH_DIR="$1"
TEAM="$2"
OUT_ID="$3"
if [[ -z "$MATCH_DIR" || -z "$TEAM" || -z "$OUT_ID" ]]; then
  echo "Kullanım: bash scripts/uret-mac.sh <csv_dir> <team> <output_id>"
  exit 1
fi
XLSX=$(find "$MATCH_DIR" -maxdepth 1 -iname "*PLAYERS*.xlsx" 2>/dev/null | head -1)
[[ -z "$XLSX" ]] && XLSX=$(find "$MATCH_DIR" -maxdepth 1 -iname "*.xlsx" 2>/dev/null | head -1)
OUT="public/assets/data/$OUT_ID/match_package.json"
mkdir -p "$(dirname "$OUT")"
echo "→ Klasör: $MATCH_DIR"
echo "→ XLSX: ${XLSX:-yok}"
echo "→ Takım: $TEAM"
echo "→ Çıktı: $OUT"
echo ""
python3 hpa-pipeline-v3/export/match_package.py "$MATCH_DIR" "$XLSX" "$TEAM" "$OUT"
echo ""
echo "✅ $OUT"
