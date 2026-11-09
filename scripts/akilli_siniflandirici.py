import os
import sys
import shutil
import time
import re
from datetime import datetime

INBOX = "/storage/emulated/0/HPAnaliz/SportsBase/_inbox"
MACLAR = "/storage/emulated/0/HPAnaliz/SportsBase/maclar"
ARSIV = "/storage/emulated/0/HPAnaliz/SportsBase/_arsiv"
KARANTINA = "/storage/emulated/0/HPAnaliz/SportsBase/KARANTINA"

def dosya_oku_ve_analiz_et(filepath):
    """Dosya içeriğini okur, maç mı değil mi anlar ve takımları/tarihi çıkarır."""
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        # İlk 5000 karakteri oku (header ve maç bilgisi için yeterli)
        content = f.read(5000) 
    
    # Basit bir takım/tarih çıkarma mantığı (İçerikten)
    # Gerçek senaryoda bu kısım XML parse veya CSV satır okuma ile zenginleştirilir.
    
    # Örnek: "Galatasaray 2-0 VfB Stuttgart 03.11.2026"
    tarih_match = re.search(r'(\d{2})\.(\d{2})\.(\d{4})', content)
    tarih = tarih_match.group(0) if tarih_match else datetime.now().strftime("%d.%m.%Y")
    
    # Eğer içinde bilinen takım isimleri geçiyorsa
    if "Galatasaray" in content and "Stuttgart" in content:
        ev, dep = "Galatasaray", "VfB_Stuttgart"
    elif "Fenerbahce" in content and "Liverpool" in content:
        ev, dep = "Fenerbahce", "Liverpool"
    else:
        return None # Tanınamadı

    return {"ev": ev, "dep": dep, "tarih": tarih}

def main():
    if not os.path.exists(INBOX): return
    
    for filename in os.listdir(INBOX):
        filepath = os.path.join(INBOX, filename)
        if not os.path.isfile(filepath): continue
        
        # 1. Kriter: Dosya yarım mı iniyor? (Boyut kontrolü)
        size1 = os.path.getsize(filepath)
        time.sleep(1.5)
        size2 = os.path.getsize(filepath)
        if size1 != size2:
            print(f"⏳ {filename} hala iniyor, bekleniyor...")
            continue
        
        # 2. Kriter: İçerik Analizi
        print(f"🔎 İnceleniyor: {filename}")
        try:
            mac_bilgi = dosya_oku_ve_analiz_et(filepath)
        except Exception as e:
            mac_bilgi = None

        if mac_bilgi:
            # Tarihi YYYY_MM_DD formatına çevir
            d, m, y = mac_bilgi['tarih'].split('.')
            klasor_adi = f"MATCH_{y}_{m}_{d}_{mac_bilgi['ev']}_vs_{mac_bilgi['dep']}"
            hedef_klasor = os.path.join(MACLAR, klasor_adi)
            
            # Arşivleme: Eğer bu klasör zaten varsa, eskisini arşive at
            if os.path.exists(hedef_klasor):
                arsiv_klasor = os.path.join(ARSIV, f"{klasor_adi}_yedek_{int(time.time())}")
                shutil.move(hedef_klasor, arsiv_klasor)
                print(f"📦 Eski dosyalar arşive kaldırıldı: {klasor_adi} -> _arsiv")
            
            os.makedirs(hedef_klasor, exist_ok=True)
            
            # Dosyayı doğru formata çevirerek (isimlendirerek) taşı
            if filename.lower().endswith('.csv'):
                hedef_isim = "PLAYERS__CSV.csv" if "player" in content.lower() else filename
            elif filename.lower().endswith('.xml'):
                hedef_isim = "PLAYERS__XML.xml"
            else:
                hedef_isim = filename
                
            shutil.move(filepath, os.path.join(hedef_klasor, hedef_isim))
            print(f"✅ BAŞARILI: {filename} -> {klasor_adi}/{hedef_isim}")
            
        else:
            # Kriter 3: Tanınamadıysa KARANTİNA
            os.makedirs(KARANTINA, exist_ok=True)
            shutil.move(filepath, os.path.join(KARANTINA, filename))
            print(f"🚨 KARANTİNA: {filename} içeriği anlaşılamadı, silinmedi!")

if __name__ == "__main__":
    main()
