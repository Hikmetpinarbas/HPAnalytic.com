"""
TAM VERİ ÇIKARICI (Resilient Extractor)
Eksik dosya olsa bile ÇÖKMEZ. Elindeki maksimum veriyi çıkarır.
Eksikleri raporlar.
"""
import csv, json, os, xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime

MACLAR = "/storage/emulated/0/HPAnaliz/SportsBase/maclar"
URETIM = "/storage/emulated/0/HPAnaliz/SportsBase/URETIM/tam_veri"
RAPOR = "/storage/emulated/0/HPAnaliz/SportsBase/URETIM/EKSIK_RAPOR.txt"

def detect_delimiter(filepath):
    with open(filepath, encoding="utf-8", errors="ignore") as f:
        header = f.readline()
    return ";" if header.count(";") > header.count(",") else ","

def extract_csv(filepath):
    delim = detect_delimiter(filepath)
    with open(filepath, encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f, delimiter=delim)
        return {"columns": reader.fieldnames, "rows": list(reader)}

def extract_xml(filepath):
    tree = ET.parse(filepath)
    root = tree.getroot()
    elements = []
    for elem in root.iter():
        if elem is root: continue
        entry = {"__tag": elem.tag}
        entry.update(elem.attrib)
        text = (elem.text or "").strip()
        if text: entry["__text"] = text
        elements.append(entry)
    return {"root_tag": root.tag, "elements": elements}

def classify_files(match_dir):
    files = {}
    for f in Path(match_dir).iterdir():
        if not f.is_file(): continue
        name, ext = f.name.upper(), f.suffix.lower()
        if ext not in (".csv", ".xml"): continue
        
        if "GOALKEEPER" in name: key = "goalkeepers"
        elif "PLAYER" in name: key = "players"
        elif "TEAM" in name: key = "teams"
        else: key = "other"
        
        files.setdefault(key, {})[ext.lstrip(".")] = f
    return files

def process_match(match_dir):
    match_dir = Path(match_dir)
    result = {
        "match_id": match_dir.name,
        "extracted_at": datetime.now().isoformat(),
        "data": {},
        "warnings": []
    }
    
    files = classify_files(match_dir)
    if not files:
        result["warnings"].append("Klasörde hiç CSV/XML bulunamadı.")
        return result

    # KRİTİK vs OPSİYONEL ayrımı
    KRITIK = {("players", "csv"), ("players", "xml"), ("teams", "csv")}
    
    for category, filetypes in files.items():
        result["data"][category] = {}
        for missing_ext in ("csv", "xml"):
            if missing_ext not in filetypes:
                is_critical = (category, missing_ext) in KRITIK
                tag = "KRİTİK" if is_critical else "opsiyonel"
                result["warnings"].append(f"Eksik [{tag}]: {category.upper()}__{missing_ext.upper()}")
        
        for ext_type, fpath in filetypes.items():
            try:
                if ext_type == "csv":
                    result["data"][category]["csv"] = extract_csv(fpath)
                else:
                    result["data"][category]["xml"] = extract_xml(fpath)
            except Exception as e:
                result["warnings"].append(f"Hata ({category}.{ext_type}): {str(e)}")
                
    return result

def main():
    match_dirs = sorted(Path(MACLAR).glob("MATCH_*"))
    Path(URETIM).mkdir(parents=True, exist_ok=True)
    print(f"📦 Toplam {len(match_dirs)} maç klasörü bulundu.\n")
    
    eksik_raporu = []
    
    for d in match_dirs:
        if not d.is_dir(): continue
        print(f"⚙️  {d.name}")
        data = process_match(d)
        
        out_file = Path(URETIM) / f"{d.name}.json"
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=1)
            
        if data["warnings"]:
            print(f"  ⚠️  Kısmi Veri: {len(data['warnings'])} uyarı")
            eksik_raporu.append(f"[{d.name}] -> {', '.join(data['warnings'])}")
        else:
            print(f"  ✅ Tam Veri")
            
    with open(RAPOR, "w", encoding="utf-8") as f:
        if eksik_raporu:
            f.write("=== EKSİK DOSYA RAPORU ===\n\n" + "\n".join(eksik_raporu))
        else:
            f.write("Tüm maç dosyaları eksiksiz.")
            
    print(f"\n📁 Rapor kaydedildi: {RAPOR}")

if __name__ == "__main__":
    main()
