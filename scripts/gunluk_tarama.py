import os
import shutil
import time
import re
from datetime import datetime

# Taranacak klasörler (Telefonun ortak alanları)
TARANACAK_YERLER = [
    "/storage/emulated/0/Download",
    "/storage/emulated/0/Documents",
    "/storage/emulated/0/HPAnaliz/SportsBase/_inbox"
]

ANA_DIZIN = "/storage/emulated/0/HPAnaliz/SportsBase"
MACLAR = os.path.join(ANA_DIZIN, "maclar")
ARSIV = os.path.join(ANA_DIZIN, "_arsiv")
KARANTINA = os.path.join(ANA_DIZIN, "KARANTINA")

def icerik_analiz_et(filepath):
    """İçeriğe bakarak maç mı değil mi anlar, takımları ve tarihi çıkarır."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read(10000) # İlk 10 bin karakteri oku
            
            # 1. KRİTER: Bu bir StatsBomb/Opta dosyası mı? (XML veya CSV yapısı)
            is_xml = "<SoccerDocument" in content or "<MatchData" in content
            is_csv = "PLAYER" in content.upper() or "TEAM" in content.upper() or "PASS" in content.upper()
            
            if not (is_xml or is_csv):
                return None # Maç dosyası değil, karantinaya!

            # 2. KRİTER: İçinden Takımları Bul
            if "Galatasaray" in content and "Stuttgart" in content:
                ev, dep = "Galatasaray", "VfB_Stuttgart"
            elif "Fenerbahce" in content and "Liverpool" in content:
                ev, dep = "Fenerbahce", "Liverpool"
            else:
                return None # Takımlar tanınamadı, karantinaya!

            # 3. KRİTER: Tarihi Bul (Dosya içinden veya dosya addından)
            tarih_match = re.search(r'(\d{2})[\._-](\d{2})[\._-](\d{4})', content)
            if tarih_match:
                d, m, y = tarih_match.groups()
            else:
                # Eğer içerikte tarih yoksa, dosyanın son değiştirilme tarihini kullan
                mtime = os.path.getmtime(filepath)
                dt = datetime.fromtimestamp(mtime)
                d, m, y = dt.strftime("%d"), dt.strftime("%m"), dt.strftime("%Y")

            return {"ev": ev, "dep": dep, "tarih": f"{y}_{m}_{d}"}
    except Exception as e:
        print(f"Hata: {e}")
        return None

def main():
    print(f"🚀 Tarama Başladı: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    islenen_dosya_sayisi = 0

    for dizin in TARANACAK_YERLER:
        if not os.path.exists(dizin): continue
        
        for filename in os.listdir(dizin):
            if not filename.lower().endswith(('.csv', '.xml', '.xlsx')): continue
            
            filepath = os.path.join(dizin, filename)
            if not os.path.isfile(filepath): continue
            
            # Dosya hala iniyor mu kontrolü (boyut değişimi)
            size1 = os.path.getsize(filepath)
            time.sleep(0.5)
            if size1 != os.path.getsize(filepath):
                print(f"⏳ Atlanıyor (hala iniyor): {filename}")
                continue

            mac_bilgi = icerik_analiz_et(filepath)

            if mac_bilgi:
                klasor_adi = f"MATCH_{mac_bilgi['tarih']}_{mac_bilgi['ev']}_vs_{mac_bilgi['dep']}"
                hedef_klasor = os.path.join(MACLAR, klasor_adi)
                
                # Eski veri varsa arşive kaldır
                if os.path.exists(hedef_klasor):
                    arsiv_klasor = os.path.join(ARSIV, f"{klasor_adi}_yedek_{int(time.time())}")
                    shutil.move(hedef_klasor, arsiv_klasor)
                    print(f"📦 Eski dosyalar arşive kaldırıldı: {klasor_adi}")
                
                os.makedirs(hedef_klasor, exist_ok=True)
                
                # Dosya tipine göre standart isim ver
                if filename.lower().endswith('.xml'):
                    hedef_isim = "PLAYERS__XML.xml"
                elif filename.lower().endswith('.csv'):
                    hedef_isim = "PLAYERS__CSV.csv"
                else:
                    hedef_isim = filename

                shutil.move(filepath, os.path.join(hedef_klasor, hedef_isim))
                print(f"✅ BAŞARILI: {filename} -> {klasor_adi}")
                islenen_dosya_sayisi += 1
            else:
                # Tanınamadıysa KARANTİNA (Silme yok!)
                os.makedirs(KARANTINA, exist_ok=True)
                shutil.move(filepath, os.path.join(KARANTINA, filename))
                print(f"🚨 KARANTİNA: {filename} (İçerik tanınamadı, güvenli bölgeye alındı)")

    print(f"🏁 Tarama Bitti. İşlenen: {islenen_dosya_sayisi} dosya.")

if __name__ == "__main__":
    main()
