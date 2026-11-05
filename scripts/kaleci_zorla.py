import os, csv, json, shutil, datetime
from collections import Counter

CSV_PLAYERS = "/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175305/stats/Konyaspor 0-4 Galatasaray 30.10.2026, Full match.csv"
CSV_GK = "/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175305/stats/Konyaspor 0-4 Galatasaray 30.10.2026, Full match (1).csv"
REPO = os.path.expanduser("~/hpanalytic-repo")
OUT_JSON = os.path.join(REPO, "public/assets/data/konya-gs/match_data.json")
P_HTML = os.path.join(REPO, "public/yazi/konya-gs-v2.html")

# === 1. PLAYERS CSV: kaleci var mı kontrol ===
print("=== 1. PLAYERS CSV KALECİ KONTROL ===")
kaleci_in_players = {"konya": [], "gs": []}
with open(CSV_PLAYERS, encoding='utf-8', errors='replace') as f:
    r = csv.DictReader(f, delimiter=';')
    for row in r:
        team_raw = row.get('team', '')
        if 'Konyaspor' in team_raw: tid = 'konya'
        elif 'Galatasaray' in team_raw: tid = 'gs'
        else: continue
        code = row.get('code', '')
        if ' - ' not in code: continue
        p_info, action = code.split(' - ', 1)
        parts = p_info.split('. ', 1)
        if len(parts) != 2: continue
        jersey = parts[0].strip()
        name = parts[1].split(' (')[0].strip()
        if jersey.isdigit() and int(jersey) in (1, 12, 13, 31):
            kaleci_in_players[tid].append((jersey, name, action))

for tid in ['konya', 'gs']:
    print(f"  {tid.upper()} kaleci adayları: {kaleci_in_players[tid][:3]}")

# === 2. GK CSV: kaleci listesi ===
print("\n=== 2. GK CSV KALECİLER ===")
goalkeepers = {"konya": None, "gs": None}
with open(CSV_GK, encoding='utf-8', errors='replace') as f:
    r = csv.DictReader(f, delimiter=';')
    for row in r:
        team_raw = row.get('team', '')
        if 'Konyaspor' in team_raw: tid = 'konya'
        elif 'Galatasaray' in team_raw: tid = 'gs'
        else: continue
        code = row.get('code', '')
        if ' - ' not in code: continue
        p_info, _ = code.split(' - ', 1)
        parts = p_info.split('. ', 1)
        if len(parts) != 2: continue
        jersey = parts[0].strip()
        name = parts[1].split(' (')[0].strip()
        if jersey.isdigit() and goalkeepers[tid] is None:
            goalkeepers[tid] = {"id": int(jersey), "name": name}
            print(f"  {tid.upper()}: #{jersey} {name}")

# === 3. TÜM VERİYİ TOPLA (hem players hem gk) ===
print("\n=== 3. VERİ TOPLAMA (players + gk) ===")
data = {"all": {"konya": {}, "gs": {}}, "1h": {"konya": {}, "gs": {}}, "2h": {"konya": {}, "gs": {}}}

# Players CSV
with open(CSV_PLAYERS, encoding='utf-8', errors='replace') as f:
    r = csv.DictReader(f, delimiter=';')
    for row in r:
        team_raw = row.get('team', '')
        if 'Konyaspor' in team_raw: tid = 'konya'
        elif 'Galatasaray' in team_raw: tid = 'gs'
        else: continue
        code = row.get('code', '')
        if ' - ' not in code: continue
        p_info, action = code.split(' - ', 1)
        parts = p_info.split('. ', 1)
        if len(parts) != 2: continue
        jersey = parts[0].strip()
        name = parts[1].split(' (')[0].strip()
        if not jersey.isdigit() or jersey == '0': continue
        try:
            x = float(row.get('pos_x', 0)); y = float(row.get('pos_y', 0))
        except: continue
        if x == 0 and y == 0: continue
        half = row.get('half', '1')
        for cat in ['all', '1h' if half == '1' else '2h']:
            td = data[cat][tid]
            if jersey not in td:
                td[jersey] = {"name": name, "points": [], "actions": []}
            td[jersey]["points"].append([round(x, 1), round(y, 1)])
            td[jersey]["actions"].append(action)

# GK CSV
with open(CSV_GK, encoding='utf-8', errors='replace') as f:
    r = csv.DictReader(f, delimiter=';')
    for row in r:
        team_raw = row.get('team', '')
        if 'Konyaspor' in team_raw: tid = 'konya'
        elif 'Galatasaray' in team_raw: tid = 'gs'
        else: continue
        code = row.get('code', '')
        if ' - ' not in code: continue
        p_info, action = code.split(' - ', 1)
        parts = p_info.split('. ', 1)
        if len(parts) != 2: continue
        jersey = parts[0].strip()
        name = parts[1].split(' (')[0].strip()
        if not jersey.isdigit() or jersey == '0': continue
        try:
            x = float(row.get('pos_x', 0)); y = float(row.get('pos_y', 0))
        except: continue
        if x == 0 and y == 0: continue
        half = row.get('half', '1')
        for cat in ['all', '1h' if half == '1' else '2h']:
            td = data[cat][tid]
            if jersey not in td:
                td[jersey] = {"name": name, "points": [], "actions": []}
            td[jersey]["points"].append([round(x, 1), round(y, 1)])
            td[jersey]["actions"].append(action)

# === 4. İLK 11: kaleci zorla + 10 saha oyuncusu ===
def build_xi(team_dict, gk_info):
    plist = []
    for j, p in team_dict.items():
        if len(p["points"]) < 3: continue
        xs = [pt[0] for pt in p["points"]]
        ys = [pt[1] for pt in p["points"]]
        plist.append({
            "id": int(j), "name": p["name"],
            "avg_x": round(sum(xs)/len(xs), 1),
            "avg_y": round(sum(ys)/len(ys), 1),
            "min_x": round(min(xs), 1), "max_x": round(max(xs), 1),
            "points": p["points"],
            "actions": [a for a,_ in Counter(p["actions"]).most_common(5)],
            "samples": len(p["points"])
        })
    
    # Kaleci (zorla)
    gk = None
    if gk_info:
        gk = next((p for p in plist if p["id"] == gk_info["id"]), None)
    if not gk and plist:
        plist.sort(key=lambda p: p["avg_x"])
        gk = plist[0]
    
    # Diğer 10
    others = [p for p in plist if gk and p["id"] != gk["id"]]
    others.sort(key=lambda p: p["samples"], reverse=True)
    xi = ([gk] if gk else []) + others[:10]
    bench = others[10:]
    return xi[:11], bench

final = {"all": {}, "1h": {}, "2h": {}}
for cat in ['all','1h','2h']:
    final[cat] = {}
    for tid in ['konya','gs']:
        xi, bench = build_xi(data[cat][tid], goalkeepers[tid])
        final[cat][tid] = {"xi": xi, "bench": bench}
        print(f"  [{cat}] {tid}: {len(xi)} (ids: {[p['id'] for p in xi]})")

os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
json.dump(final, open(OUT_JSON, 'w', encoding='utf-8'), ensure_ascii=False)
print(f"\n  JSON: {os.path.getsize(OUT_JSON)//1024} KB")

# === 5. HTML: renderMatch içinde kaleci hep var mı kontrolü ===
print("\n=== 5. HTML KONTROL ===")
s = open(P_HTML, encoding='utf-8').read()

# JS içinde drawTeam güvenlik: 11'den az olsa bile kaleci gösterilsin
old_check = '''        xi.slice(0, 11).forEach(p => {'''
new_check = '''        if(xi.length < 11) console.warn("⚠ " + teamId + " sadece " + xi.length + " oyuncu var!");
        xi.slice(0, 11).forEach(p => {'''
if old_check in s:
    s = s.replace(old_check, new_check, 1)
    print("  ✓ Uyarı eklendi (11'den az oyuncu kontrolü)")

open(P_HTML, 'w', encoding='utf-8').write(s)
print(f"\nCtrl+Shift+R yap.")
print("  - Her sekmede 11+11 = 22 oyuncu olmalı")
print("  - Kaleci Konya #13 Bahadır, GS #1 Uğurcan")
