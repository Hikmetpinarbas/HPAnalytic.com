import csv, json, re
from collections import defaultdict

INPUT_CSV = "public/assets/data/gs-stuttgart/players.csv"
OUTPUT_JSON = "public/assets/data/gs-stuttgart/match_data.json"

print("Veri işleniyor...")
players_data = defaultdict(lambda: {"offensive_x": [], "offensive_y": [], "defensive_x": [], "defensive_y": [], "all_x": [], "all_y": [], "passes": 0})

def is_defensive(action):
    return any(k in action.lower() for k in ["challenge", "tackle", "ball recoveries", "ball losses", "clearance", "interception", "foul", "aerial"])

def is_offensive(action):
    return any(k in action.lower() for k in ["pass", "shot", "cross", "dribble", "carry", "attack", "corner", "chance"])

with open(INPUT_CSV, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter=';')
    for row in reader:
        if not row['code'] or not row['pos_x']: continue
        
        # Oyuncu adını ve takımı ayıkla (Örn: "VfB Stuttgart (73512) - Bilal El Khannouss (413859)")
        code = row['code']
        match = re.search(r'([\w\s\.]+) \(\d+\) - ([\w\s\.]+) \(\d+\)', code)
        if match:
            team = match.group(1).strip()
            player = match.group(2).strip()
        else:
            # Kaleci veya takım ismi olmayan aksiyonlar için
            if "Galatasaray" in code: team = "Galatasaray"
            elif "Stuttgart" in code: team = "VfB Stuttgart"
            else: team = "Match Event"
            player = code.split('-')[-1].strip() if '-' in code else code
            
        x, y = float(row['pos_x']), float(row['pos_y'])
        action = row['action']
        
        key = f"{team} | {player}"
        players_data[key]["all_x"].append(x)
        players_data[key]["all_y"].append(y)
        
        if is_defensive(action):
            players_data[key]["defensive_x"].append(x)
            players_data[key]["defensive_y"].append(y)
        elif is_offensive(action):
            players_data[key]["offensive_x"].append(x)
            players_data[key]["offensive_y"].append(y)
            if "pass" in action.lower(): players_data[key]["passes"] += 1

# Ortalamaları hesapla
results = {}
for k, v in players_data.items():
    avg = lambda l: sum(l)/len(l) if l else 0
    results[k] = {
        "team": k.split(" | ")[0],
        "name": k.split(" | ")[1],
        "avg_x": round(avg(v["all_x"]), 2),
        "avg_y": round(avg(v["all_y"]), 2),
        "defensive_pos": {"x": round(avg(v["defensive_x"]), 2), "y": round(avg(v["defensive_y"]), 2)} if v["defensive_x"] else None,
        "offensive_pos": {"x": round(avg(v["offensive_x"]), 2), "y": round(avg(v["offensive_y"]), 2)} if v["offensive_x"] else None,
        "total_passes": v["passes"]
    }

# Sadece Galatasaray ve Stuttgart oyuncularını filtrele
final = {k: v for k, v in results.items() if v["team"] in ["Galatasaray", "VfB Stuttgart"] and "Match Event" not in v["name"]}

with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
    json.dump(list(final.values()), f, indent=2, ensure_ascii=False)

print(f"✅ BAŞARILI! {len(final)} oyuncu verisi işlendi.")
print(f"📁 Dosya: {OUTPUT_JSON}")
