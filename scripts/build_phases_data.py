import csv, json, re
from collections import defaultdict

# DÜZELTME: Oyuncu isimleri "teams.csv" içinde!
CSV_PATH = "public/assets/data/gs-stuttgart/teams.csv"
FORM_DIR = "public_data/formations"
OUT_PATH = "public/assets/data/gs-stuttgart/match_data_phases.json"

def norm(s):
    s = s.lower().strip()
    s = re.sub(r'[çğıöşü]', lambda m: {'ç':'c','ğ':'g','ı':'i','ö':'o','ş':'s','ü':'u'}[m.group()], s)
    s = re.sub(r'[áéíóúÁÉÍÓÚćĆ]', lambda m: {'á':'a','é':'e','í':'i','ó':'o','ú':'u','ć':'c','Ć':'c'}[m.group()], s)
    return s

def is_def(action):
    return any(k in action.lower() for k in ["challenge","tackle","ball recoveries","ball losses","clearance","interception","foul","aerial"])

def is_off(action):
    return any(k in action.lower() for k in ["pass","shot","cross","dribble","carry","attack","corner","chance"])

buckets = defaultdict(lambda: {"def_x":[], "def_y":[], "off_x":[], "off_y":[], "all_x":[], "all_y":[], "passes": 0})
players_in_csv = set()

with open(CSV_PATH, encoding="utf-8") as f:
    reader = csv.DictReader(f, delimiter=";")
    for row in reader:
        if not row.get("pos_x") or not row.get("code"): continue
        
        # teams.csv formatı: "11. Bilal El Khannouss (413859) - Passes accurate" ve "VfB Stuttgart (73512)"
        code = row["code"]
        team_raw = row.get("team", "")
        
        # Takımı belirle
        team = None
        if "Galatasaray" in team_raw: team = "Galatasaray"
        elif "Stuttgart" in team_raw: team = "VfB Stuttgart"
        if not team: continue
        
        # Oyuncuyu belirle: Parantez içindeki ID'yi çıkar
        m = re.search(r"\d+\.\s+([\w\s\.\-]+)\s+\(\d+\)", code)
        if not m: continue
        player = m.group(1).strip()
        players_in_csv.add(player)
        
        try:
            x, y = float(row["pos_x"]), float(row["pos_y"])
        except: continue
        half = row["half"]
        action = row["action"]
        
        for h in ("all", half):
            b = buckets[(team, player, h)]
            b["all_x"].append(x); b["all_y"].append(y)
            if is_def(action): b["def_x"].append(x); b["def_y"].append(y)
            elif is_off(action):
                b["off_x"].append(x); b["off_y"].append(y)
                if "pass" in action.lower(): b["passes"] += 1

def avg(l): return round(sum(l)/len(l), 2) if l else None

formations = {}
for team_file, team_key in [("galatasaray.json","Galatasaray"), ("stuttgart.json","VfB Stuttgart")]:
    with open(f"{FORM_DIR}/{team_file}", encoding="utf-8") as f:
        formations[team_key] = json.load(f)

out = {}
for team_key, form in formations.items():
    players_out = []
    for fp in form["players"]:
        f_norm = norm(fp["name"])
        f_last = f_norm.split()[-1]
        
        matched = None
        # Tam eşleşme
        for p_csv in players_in_csv:
            if norm(p_csv) == f_norm:
                matched = p_csv; break
        # Soyadı eşleşmesi
        if not matched:
            for p_csv in players_in_csv:
                if norm(p_csv).split()[-1] == f_last:
                    matched = p_csv; break
                    
        if not matched:
            print(f"⚠️ Eşleşmeyen (formasyon pozisyonunda bırakıldı): {fp['name']}")
            players_out.append({
                'name': fp['name'],
                'matched_name': None,
                'role': fp['role'],
                'formation': {'x': fp['x'], 'y': fp['y']},
                'phases': {pk: {'defensive': None, 'offensive': None, 'avg': None, 'passes': 0} 
                          for pk in ['Tüm Maç', '1. Yarı', '2. Yarı']}
            })
            continue
        
        phases = {}
        for phase_key, half_filter in [("Tüm Maç","all"), ("1. Yarı","1"), ("2. Yarı","2")]:
            b = buckets[(team_key, matched, half_filter)]
            phases[phase_key] = {
                "defensive": {"x": avg(b["def_x"]), "y": avg(b["def_y"])} if b["def_x"] else None,
                "offensive": {"x": avg(b["off_x"]), "y": avg(b["off_y"])} if b["off_x"] else None,
                "avg": {"x": avg(b["all_x"]), "y": avg(b["all_y"])} if b["all_x"] else None,
                "passes": b["passes"]
            }
        
        players_out.append({
            "name": fp["name"],
            "matched_name": matched,
            "role": fp["role"],
            "formation": {"x": fp["x"], "y": fp["y"]},
            "phases": phases
        })
    
    out[team_key] = {
        "team": form["team"],
        "formation": form["formation"],
        "side": form["side"],
        "players": players_out
    }

with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)

print(f"✅ {OUT_PATH}")
for t, d in out.items():
    print(f"  {t}: {len(d['players'])}/{len(formations[t]['players'])} oyuncu eşleşti")
