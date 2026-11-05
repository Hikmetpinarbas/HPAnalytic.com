import os, csv

MACLAR = {
    "konya-gs-2026-10-30": "/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175305",
    "gs-fb-2026-10-26":    "/sdcard/HPAnalytic/data/raw/sportsbase/match-2026-10",
    "lille-gs-2026-10-21": "/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175306",
}

for slug, base in MACLAR.items():
    print(f"\n{'='*60}")
    print(f"MAÇ: {slug}")
    print(f"Klasör: {base}")
    print('='*60)

    if not os.path.exists(base):
        print("  ✗ Klasör YOK"); continue

    stats = os.path.join(base, "stats")
    if not os.path.exists(stats):
        print("  ✗ stats/ YOK"); continue

    for f in sorted(os.listdir(stats)):
        p = os.path.join(stats, f)
        if not os.path.isfile(p): continue
        sz = os.path.getsize(p) // 1024

        # CSV ise ilk 3 satırı göster
        if f.endswith('.csv'):
            try:
                with open(p, encoding='utf-8', errors='replace') as fp:
                    first = fp.readline()
                    delim = ';' if ';' in first else ','
                    header = first.strip().split(delim)
                    fp.seek(0)
                    rows = []
                    reader = csv.DictReader(fp, delimiter=delim)
                    for i, r in enumerate(reader):
                        if i >= 2: break
                        rows.append(r)
                    print(f"\n  CSV: {f} ({sz}KB, delim='{delim}')")
                    print(f"    sütunlar ({len(header)}): {header[:12]}")
                    if rows:
                        print(f"    örnek 1: {dict(list(rows[0].items())[:6])}")
            except Exception as e:
                print(f"\n  CSV: {f} — HATA: {e}")

        # XLSX ise sadece varlık
        elif f.endswith('.xlsx'):
            print(f"\n  XLSX: {f} ({sz}KB)")

        # XML ise etiket sayısı
        elif f.endswith('.xml'):
            try:
                with open(p, encoding='utf-8', errors='replace') as fp:
                    head = fp.read(3000)
                import re
                tags = list(dict.fromkeys(re.findall(r'<([a-zA-Z_][\w.-]+)', head)))
                print(f"\n  XML: {f} ({sz}KB) — etiketler: {tags[:8]}")
            except Exception as e:
                print(f"\n  XML: {f} — HATA: {e}")

print("\n" + "="*60)
print("ÖZET: Hangi maçın CSV'sinde pos_x/pos_y var?")
print("="*60)
for slug, base in MACLAR.items():
    stats = os.path.join(base, "stats")
    if not os.path.exists(stats): continue
    for f in os.listdir(stats):
        if not f.endswith('.csv'): continue
        p = os.path.join(stats, f)
        with open(p, encoding='utf-8', errors='replace') as fp:
            first = fp.readline()
            delim = ';' if ';' in first else ','
            cols = first.strip().split(delim)
        if 'pos_x' in cols:
            print(f"  ✓ {slug}: {f}")

print("\nBITTI")
