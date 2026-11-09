import os, re, shutil, hashlib, openpyxl
from pathlib import Path

DOWNLOAD = Path("/sdcard/Download")
BASE = Path("/sdcard/HPAnaliz/SportsBase")
MACLAR = BASE / "maclar"
GENEL = BASE / "genel_sezon"

for d in [MACLAR, GENEL]:
    d.mkdir(parents=True, exist_ok=True)

def clean_name(name):
    # Sadece tarih formatı, "Full match" gibi kalıpları temizler, (1) (2) suffix'lerini KORUR
    return name.strip()

def file_hash(fp):
    h = hashlib.md5()
    with open(fp, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()

def classify_csv(fp):
    """Boyut + satır sayısı + header kombinasyonu ile ayırt et."""
    size = fp.stat().st_size
    with open(fp, 'r', encoding='utf-8', errors='ignore') as f:
        header = f.readline().lower()
        line_count = sum(1 for _ in f)
    has_team_col = 'team' in header
    # Sıralama önemli:
    if not has_team_col:
        return 'TEAMS'
    if line_count > 800 or size > 150_000:
        return 'PLAYERS'
    return 'GOALKEEPERS'

def classify_xlsx(fp):
    """Sheet adı veya dosya adından tipi çıkar."""
    try:
        wb = openpyxl.load_workbook(fp, read_only=True)
        sheet = ' '.join(wb.sheetnames).lower()
        if 'player' in sheet and 'goalkeep' not in sheet: return 'PLAYERS'
        if 'team' in sheet and 'player' not in sheet: return 'TEAMS'
        if 'goalkeep' in sheet: return 'GOALKEEPERS'
    except: pass
    return 'GOALKEEPERS'  # Kaleci XLSX genelde en küçük

def process_match_file(fp):
    name = fp.name
    date_m = re.search(r'(\d{2})\.(\d{2})\.(\d{4})', name)
    if not date_m: return
    d, m, y = date_m.groups()
    date_str = f"{y}_{m}_{d}"

    teams_m = re.search(r'^(.*?)\s+\d+-\d+\s+(.*?)(?:\s+\d|,|\.xml|\.csv|\.xlsx)', name)
    if not teams_m: return
    home = teams_m.group(1).strip().replace(' ', '_')
    away = teams_m.group(2).strip().replace(' ', '_').rstrip('.,')

    match_folder = MACLAR / f"MATCH_{date_str}_{home}_vs_{away}"
    match_folder.mkdir(exist_ok=True)

    ext = fp.suffix.lower()
    target = None
    if ext == '.csv':
        ftype = classify_csv(fp)
        target = match_folder / f"{ftype}__CSV.csv"
    elif ext == '.xml':
        # XML için boyut (kaleci XML küçük, Player büyük, Team orta)
        size = fp.stat().st_size
        if size > 1_500_000: ftype = 'PLAYERS'
        elif size > 500_000: ftype = 'TEAMS'
        else: ftype = 'GOALKEEPERS'
        target = match_folder / f"{ftype}__XML.xml"
    elif ext == '.xlsx':
        ftype = classify_xlsx(fp)
        target = match_folder / f"{ftype}__XLSX.xlsx"

    if not target: return
    # Hash kontrolü: Aynı içerikse atla, farklıysa suffix ekle
    if target.exists():
        if file_hash(fp) == file_hash(target):
            print(f"⏭️ ATLANDI (aynı içerik): {name}")
        else:
            i = 2
            while (target.parent / f"{target.stem}_v{i}{target.suffix}").exists():
                i += 1
            new_target = target.parent / f"{target.stem}_v{i}{target.suffix}"
            shutil.move(str(fp), str(new_target))
            print(f"⚠️ ÇAKIŞMA ÇÖZÜLDÜ: {name} → {new_target.name}")
    else:
        shutil.move(str(fp), str(target))
        print(f"✅ {name} → {target.parent.name}/{target.name}")

def process_season_file(fp):
    target = GENEL / fp.name
    if target.exists():
        if file_hash(fp) == file_hash(target):
            print(f"⏭️ ATLANDI (aynı): {fp.name}")
        else:
            i = 2
            while (GENEL / f"{fp.stem}_v{i}{fp.suffix}").exists():
                i += 1
            shutil.move(str(fp), str(GENEL / f"{fp.stem}_v{i}{fp.suffix}"))
            print(f"⚠️ SEZON FARKLI: {fp.name} → {fp.stem}_v{i}{fp.suffix}")
    else:
        shutil.move(str(fp), str(target))
        print(f"✅ SEZON: {fp.name}")

if __name__ == "__main__":
    print("🔍 Download taranıyor...\n")
    for f in DOWNLOAD.iterdir():
        if not f.is_file() or f.suffix.lower() not in ['.csv', '.xml', '.xlsx']: continue
        if 'Full match' in f.name:
            process_match_file(f)
        elif any(k in f.name.lower() for k in ['statistics', 'fitness']):
            process_season_file(f)
    print("\n✅ Bitti.")
