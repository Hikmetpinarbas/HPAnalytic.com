import os, csv, re

REPO = os.path.expanduser("~/hpanalytic-repo")
YZ_DIR = os.path.join(REPO, "content", "yazilar")
CSV_PATH = "/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175305/stats/Konyaspor 0-4 Galatasaray 30.10.2026, Full match.csv"

print("=== 1. SİTEDEKİ MEVCUT YAZILAR ===")
md_files = sorted([f for f in os.listdir(YZ_DIR) if f.endswith('.md') and not f.startswith('_')])
for f in md_files:
    # Başlığı çek
    with open(os.path.join(YZ_DIR, f), encoding='utf-8') as fp:
        content = fp.read(300)
    t = re.search(r'title:\s*["\']?(.*?)["\']?\n', content)
    title = t.group(1) if t else f.replace('.md', '')
    print(f"  - {f}")
    print(f"    Başlık: {title}")

print("\n=== 2. KONYA-GS GERÇEK VERİ ANALİZİ (CSV'den) ===")
stats = {
    'Konyaspor': {'pass': 0, 'pass_acc': 0, 'shots': 0, 'goals': 0},
    'Galatasaray': {'pass': 0, 'pass_acc': 0, 'shots': 0, 'goals': 0}
}

if os.path.exists(CSV_PATH):
    with open(CSV_PATH, encoding='utf-8', errors='replace') as f:
        r = csv.DictReader(f, delimiter=';')
        for row in r:
            team_raw = row.get('team', '')
            if 'Konyaspor' in team_raw: team = 'Konyaspor'
            elif 'Galatasaray' in team_raw: team = 'Galatasaray'
            else: continue
            
            action = row.get('action', '')
            
            if action == 'Passes accurate': stats[team]['pass_acc'] += 1
            if 'Passes' in action: stats[team]['pass'] += 1
            if action in ['Shots on target', 'Shots off target', 'Shots on post / bar', 'Blocked shots', 'Goals']:
                stats[team]['shots'] += 1
            if action == 'Goals': stats[team]['goals'] += 1

    print("\n  [TAKIM İSTATİSTİKLERİ]")
    for t, s in stats.items():
        print(f"  {t}:")
        print(f"    Toplam Pas: {s['pass']} (İsabetli: {s['pass_acc']})")
        print(f"    Şut: {s['shots']}")
        print(f"    Gol: {s['goals']}")
else:
    print("  ✗ CSV dosyası bulunamadı!")

print("\n=== 3. XLSX'TEKİ DOĞRULANMIŞ VERİLER (Önceki notlarımızdan) ===")
print("  xG: Galatasaray 1.92 | Konyaspor 0.81")
print("  Sprint: Galatasaray 1975m | Konyaspor 1945m")
print("  Goller: Osimhen 11', Akgün 27', Batrakov 54', Leão 61' (P)")

print("\nBITTI")
