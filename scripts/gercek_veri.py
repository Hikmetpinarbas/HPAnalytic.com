import os, csv, json, glob, re

BASE = "/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175305"
print("=== KLASÖR YAPISI ===")
for root, dirs, files in os.walk(BASE):
    if ".git" in root: continue
    print(f"\n{root.replace(BASE,'.')}/")
    for f in files:
        p = os.path.join(root, f)
        sz = os.path.getsize(p) // 1024
        print(f"  {f}  ({sz} KB)")

print("\n\n=== CSV SÜTUNLARI ===")
for f in glob.glob(f"{BASE}/**/*.csv", recursive=True):
    print(f"\n--- {os.path.basename(f)} ---")
    try:
        with open(f, encoding='utf-8', errors='replace') as fp:
            r = csv.reader(fp)
            header = next(r)
            print(f"{len(header)} sütun")
            print(", ".join(header[:30]))
            row = next(r, None)
            if row:
                print("Örnek satır:")
                for h, v in list(zip(header, row))[:15]:
                    print(f"  {h} = {v}")
    except Exception as e:
        print(f"  HATA: {e}")

print("\n\n=== XML YAPISI ===")
for f in glob.glob(f"{BASE}/**/*.xml", recursive=True)[:3]:
    print(f"\n--- {os.path.basename(f)} ---")
    with open(f, encoding='utf-8', errors='replace') as fp:
        head = fp.read(2000)
        # tag isimlerini çıkar
        tags = list(dict.fromkeys(re.findall(r'<([a-zA-Z_][\w.-]+)', head)))
        print("Etiketler:", ", ".join(tags[:20]))
        print("İlk 500 char:", head[:500].replace("\n"," "))

print("\n\n=== XLSX SÜTUNLARI (sheet adları) ===")
for f in glob.glob(f"{BASE}/**/*.xlsx", recursive=True)[:3]:
    print(f"\n--- {os.path.basename(f)} ---")
    try:
        import zipfile, xml.etree.ElementTree as ET
        with zipfile.ZipFile(f) as z:
            if 'xl/sharedStrings.xml' in z.namelist():
                print(f"  sharedStrings mevcut, dosya boyutu: {os.path.getsize(f)//1024}KB")
            if 'xl/workbook.xml' in z.namelist():
                wb = z.read('xl/workbook.xml').decode('utf-8')
                sheets = re.findall(r'<sheet[^>]+name="([^"]+)"', wb)
                print(f"  Sheetler: {sheets}")
    except Exception as e:
        print(f"  HATA: {e}")

print("\n\n=== KOORDİNAT SÜTUNU VAR MI? ===")
for f in glob.glob(f"{BASE}/**/*.csv", recursive=True):
    with open(f, encoding='utf-8', errors='replace') as fp:
        r = csv.reader(fp)
        header = next(r)
        coords = [h for h in header if any(k in h.lower() for k in ['x', 'y', 'pos', 'coord', 'start', 'end'])]
        if coords:
            print(f"\n{os.path.basename(f)} -> koordinat adayları: {coords}")

print("\nBITTI")
