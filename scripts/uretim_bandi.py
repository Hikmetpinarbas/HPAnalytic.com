import os, glob, subprocess, shutil, sys

MACLAR = "/storage/emulated/0/HPAnaliz/SportsBase/maclar"
URETIM = "/storage/emulated/0/HPAnaliz/SportsBase/URETIM/mac_analizleri"
PUBLIC_DATA = "/data/data/com.termux/files/home/hpanalytic-repo/public/assets/data"

def dosya_isle(mac_klasoru):
    mac_adi = os.path.basename(mac_klasoru)
    out_json = os.path.join(URETIM, f"{mac_adi}.json")
    
    cmd = [sys.executable, "scripts/build_pass_network_v2.py", "--src", mac_klasoru, "--out", out_json]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"  ❌ HATA [{mac_adi}]:\n{result.stderr.strip()}")
        return None
    return out_json

def main():
    match_dirs = sorted(glob.glob(os.path.join(MACLAR, "MATCH_*")))
    print(f"📦 Toplam {len(match_dirs)} maç klasörü bulundu.\n")
    
    basarili, hatali, son_basarili_mac = 0, 0, None

    for d in match_dirs:
        if not os.path.isdir(d): continue
        print(f"⚙️  {os.path.basename(d)}")
        out = dosya_isle(d)
        if out:
            print(f"  ✅ Başarılı")
            basarili += 1
            son_basarili_mac = out
        else:
            hatali += 1

    if son_basarili_mac:
        hedef_gs = os.path.join(PUBLIC_DATA, "gs-stuttgart")
        os.makedirs(hedef_gs, exist_ok=True)
        shutil.copy(son_basarili_mac, os.path.join(hedef_gs, "pass_network_v2.json"))
        print(f"\n📤 Web için kopyalandı: {os.path.basename(son_basarili_mac)}")

    print(f"\n📊 Özet: {basarili} Başarılı, {hatali} Hatalı")
    if hatali > 0:
        sys.exit(1)

if __name__ == "__main__":
    main()
