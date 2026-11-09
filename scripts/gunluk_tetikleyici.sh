#!/data/data/com.termux/files/usr/bin/bash
REPO="/data/data/com.termux/files/home/hpanalytic-repo"
cd "$REPO"

echo "--- 1. Aşama: Tarama ve Tasnif ---"
python3 scripts/gunluk_tarama.py

echo "--- 2. Aşama: Tüm Maçlar İçin Üretim (ETL) ---"
python3 scripts/uretim_bandi.py

echo "--- 3. Aşama: Siteyi Derleme ---"
npm run build

echo "🎉 Tüm işlemler tamamlandı."
