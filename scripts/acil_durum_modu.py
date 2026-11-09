"""
ACİL DURUM MODU (Live Emergency Mode)
Yayın sırasında veri eksikse veya yeni maç verisi anında işlenemiyorsa kullanılır.
Son geçerli veriyi alır, üzerine 'Acil Durum' bayrağı ekler.
"""
import json, shutil, os
from pathlib import Path
from datetime import datetime

URETIM = "/storage/emulated/0/HPAnaliz/SportsBase/URETIM/mac_analizleri"
PUBLIC_DATA = "/data/data/com.termux/files/home/hpanalytic-repo/public/assets/data/gs-stuttgart/pass_network_v2.json"

def acil_durum_baslat():
    if not os.path.exists(PUBLIC_DATA):
        print("❌ HATA: Varsayılan bir veri bulunamadı. Önce en az bir maç işlenmeli.")
        return
        
    with open(PUBLIC_DATA, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    # Acil durum bayraklarını ekle
    data["meta"] = data.get("meta", {})
    data["meta"]["emergency_mode"] = True
    data["meta"]["emergency_reason"] = "Canlı yayın esnasında veri bekleniyor..."
    data["meta"]["emergency_time"] = datetime.now().strftime("%H:%M:%S")
    
    with open(PUBLIC_DATA, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print("🚨 ACİL DURUM MODU AKTİF!")
    print("Frontend'e 'Veri Güncelleniyor' bayrağı gönderildi.")
    print("Analizler son geçerli maç verisiyle (sınırlı) devam ediyor.")

if __name__ == "__main__":
    acil_durum_baslat()
