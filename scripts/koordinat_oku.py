import csv, os

CSV_PATH = "/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175305/stats/Konyaspor 0-4 Galatasaray 30.10.2026, Full match.csv"

print("=== GERÇEK CSV ANALİZİ (Noktalı Virgül ile) ===\n")
with open(CSV_PATH, encoding='utf-8', errors='replace') as f:
    r = csv.DictReader(f, delimiter=';')
    
    print(f"Sütunlar: {r.fieldnames}\n")
    
    teams = set()
    actions = {}
    players_or_teams = set()
    
    count = 0
    for row in r:
        count += 1
        # Takımları bul
        t = row.get('team', '').strip()
        if t: teams.add(t)
        
        # Eylemleri say
        a = row.get('action', '').strip()
        if a: actions[a] = actions.get(a, 0) + 1
        
        # Eğer action içinde oyuncu ismi varsa (genelde "Player Name: Pass" şeklindedir)
        # Veya team sütununda oyuncu ismi vardır
        
        if count <= 5:
            print(f"Örnek Satır {count}:")
            for k, v in row.items():
                if v: print(f"  {k} = {v}")
            print()

print(f"Toplam Satır: {count}")
print(f"Takımlar: {teams}")
print("\nEn Sık Gerçekleşen 10 Eylem:")
for a, c in sorted(actions.items(), key=lambda x: x[1], reverse=True)[:10]:
    print(f"  {c:4d} kez -> {a}")
    
print("\nNot: Oyuncu isimleri muhtemelen XML dosyasında 'Player' etiketi altında veya 'action' içinde.")
print("BITTI")
