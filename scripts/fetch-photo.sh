#!/data/data/com.termux/files/usr/bin/bash
# Kullanım: ./scripts/fetch-photo.sh <url> <slug>
URL="$1"
SLUG="$2"
if [ -z "$URL" ] || [ -z "$SLUG" ]; then
  echo "Kullanım: $0 <URL> <slug>"
  exit 1
fi
mkdir -p public/assets/images/sources
curl -sL -A "Mozilla/5.0" "$URL" -o "public/assets/images/sources/$SLUG.jpg"
if [ -s "public/assets/images/sources/$SLUG.jpg" ]; then
  SIZE=$(du -h "public/assets/images/sources/$SLUG.jpg" | cut -f1)
  echo "✓ $SLUG.jpg ($SIZE)"
  python3 scripts/multi-portrait.py "public/assets/images/sources/$SLUG.jpg" "$SLUG"
else
  echo "✗ İndirme başarısız"
fi
