#!/data/data/com.termux/files/usr/bin/bash

# Android tarayıcısı indirmeyi bitirdiğinde dosya genellikle buraya düşer:
DL_DIR="/storage/emulated/0/Download" 
INBOX="/storage/emulated/0/HPAnaliz/SportsBase/_inbox"
REPO="/data/data/com.termux/files/home/hpanalytic-repo"

echo "🚀 Akıllı İzleyici Başlatıldı. Dosyalar _inbox klasörüne çekiliyor..."

while true; do
    # Download klasöründe .csv veya .xml var mı?
    find "$DL_DIR" -maxdepth 1 -type f \( -iname "*.csv" -o -iname "*.xml" \) | while read file; do
        
        filename=$(basename "$file")
        echo "📥 Yakalandı: $filename. _inbox klasörüne aktarılıyor..."
        
        # Dosyayı _inbox'a kopyala (Orijinali Download'da kalabilir veya silebiliriz)
        cp "$file" "$INBOX/"
        
        # Download'daki orijinali sil (temizlik)
        rm "$file"
    done
    
    # _inbox'a yeni dosya düştüyse, sınıflandırıcıyı çalıştır
    if [ "$(ls -A "$INBOX")" ]; then
        cd "$REPO"
        python3 scripts/akilli_siniflandirici.py
        
        # Eğer sınıflandırma başarılıysa (yeni maç klasörü oluştuysa), üretim bandını çalıştır
        # Not: build_pass_network_v2.py şu an sadece belirli bir klasöre odaklı.
        # İleride buraya "en son işlenen klasörü bul ve işle" mantığı eklenebilir.
        # Şimdilik mevcut bildiğimiz maç için çalıştıralım:
        if [ -d "/storage/emulated/0/HPAnaliz/SportsBase/maclar/MATCH_2026_11_03_Galatasaray_vs_VfB_Stuttgart" ]; then
            echo "⚙️ Üretim bandı çalışıyor (JSON ve Grafikler)..."
            # Yeni veriyi işle
            python3 scripts/build_pass_network_v2.py
            # Siteyi güncelle
            npm run build
            echo "🎉 Site başarıyla güncellendi!"
        fi
    fi
    
    sleep 3 # 3 saniyede bir kontrol et
done
