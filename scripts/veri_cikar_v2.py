import os, csv, json, statistics
from collections import Counter

CSV_PLAYERS = "/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175305/stats/Konyaspor 0-4 Galatasaray 30.10.2026, Full match.csv"
CSV_GK = "/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175305/stats/Konyaspor 0-4 Galatasaray 30.10.2026, Full match (1).csv"
OUT = os.path.expanduser("~/hpanalytic-repo/public/assets/data/konya-gs/match_data_v2.json")

OFF_ACTIONS = {"Shots on target","Shots off target","Goals","Passes forward accurate",
    "Progressive passes accurate","Involvement in positional attacks",
    "Involvement in counterattacks","Penalty","Free-kick shots"}
DEF_ACTIONS = {"Ball losses","Challenges won","Challenges unsuccessful",
    "Aerial challenges won","Aerial challenges lost","Inaccurate passes","Blocked shots"}

def parse_csv(path, is_gk=False):
    players = {}
    with open(path, encoding='utf-8', errors='replace') as f:
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
                x = float(row.get('pos_x', 0))
                y = float(row.get('pos_y', 0))
            except: continue
            if x == 0 and y == 0: continue
            
            key = (tid, jersey)
            if key not in players:
                players[key] = {'team': tid, 'jersey': int(jersey), 'name': name,
                                'actions': [], 'is_gk': is_gk}
            players[key]['actions'].append({
                'x': x, 'y': y, 'action': action,
                'time': float(row.get('start', 0) or 0),
                'half': row.get('half', '1')
            })
    return players

all_players = {}
all_players.update(parse_csv(CSV_PLAYERS, False))
all_players.update(parse_csv(CSV_GK, True))

print(f"Toplam oyuncu: {len(all_players)}")
print(f"  Konya: {sum(1 for k in all_players if k[0]=='konya')}")
print(f"  GS: {sum(1 for k in all_players if k[0]=='gs')}")

# Yön tespit: gol+şutların x ortalaması
def detect_direction(players, team):
    shot_xs = []
    for (tid, j), p in players.items():
        if tid != team or p['is_gk']: continue
        for a in p['actions']:
            if a['action'] in ('Goals', 'Shots on target', 'Shots off target', 'Penalty'):
                shot_xs.append(a['x'])
    if not shot_xs:
        return 'right', 52.5
    m = statistics.mean(shot_xs)
    return ('right' if m > 52.5 else 'left'), round(m, 1)

dir_konya, konya_shot_mean = detect_direction(all_players, 'konya')
dir_gs, gs_shot_mean = detect_direction(all_players, 'gs')
print(f"\n=== YÖN TESPİT ===")
print(f"  Konya şut x ortalaması: {konya_shot_mean} → hücum {dir_konya.upper()}")
print(f"  GS şut x ortalaması: {gs_shot_mean} → hücum {dir_gs.upper()}")

# Her oyuncu için veri çıkar
def process(players, team, direction):
    result = []
    for (tid, j), p in players.items():
        if tid != team: continue
        if len(p['actions']) < 3: continue
        
        xs = [a['x'] for a in p['actions']]
        ys = [a['y'] for a in p['actions']]
        formation_x = statistics.median(xs)
        formation_y = statistics.median(ys)
        first_time = min(a['time'] for a in p['actions'])
        
        of_acts = [a for a in p['actions'] if a['action'] in OFF_ACTIONS]
        df_acts = [a for a in p['actions'] if a['action'] in DEF_ACTIONS]
        
        if of_acts:
            fwd = max(of_acts, key=lambda a: a['x']) if direction == 'right' else min(of_acts, key=lambda a: a['x'])
            fwd_point = (fwd['x'], fwd['y'])
        else:
            fwd_point = (formation_x, formation_y)
        
        if df_acts:
            df = min(df_acts, key=lambda a: a['x']) if direction == 'right' else max(df_acts, key=lambda a: a['x'])
            def_point = (df['x'], df['y'])
        else:
            def_point = (formation_x, formation_y)
        
        result.append({
            'jersey': int(j), 'name': p['name'], 'is_gk': p['is_gk'],
            'formation': (round(formation_x,1), round(formation_y,1)),
            'fwd_point': (round(fwd_point[0],1), round(fwd_point[1],1)),
            'def_point': (round(def_point[0],1), round(def_point[1],1)),
            'first_time': round(first_time, 1),
            'samples': len(p['actions']),
            'top_actions': [a for a,_ in Counter([x['action'] for x in p['actions']]).most_common(3)]
        })
    
    result.sort(key=lambda p: p['first_time'])
    gk = next((p for p in result if p['is_gk']), None)
    others = [p for p in result if not p['is_gk']]
    starters = ([gk] if gk else []) + others[:10]
    bench = others[10:]
    return {'direction': direction, 'starters': starters, 'bench': bench}

final = {
    'konya': process(all_players, 'konya', dir_konya),
    'gs': process(all_players, 'gs', dir_gs)
}

os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump(final, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f"\n✓ Kaydedildi: {OUT}")

# === ÖZET ===
for team, data in final.items():
    print(f"\n{'='*60}")
    print(f"{team.upper()} — hücum yönü: {data['direction']}")
    print(f"{'='*60}")
    print(f"İLK 11 ({len(data['starters'])}):")
    for p in data['starters']:
        gk_mark = " [GK]" if p['is_gk'] else ""
        print(f"  #{p['jersey']:2}{gk_mark:5} {p['name'][:18]:18} "
              f"form=({p['formation'][0]:5.1f},{p['formation'][1]:4.1f}) "
              f"fwd=({p['fwd_point'][0]:5.1f},{p['fwd_point'][1]:4.1f}) "
              f"def=({p['def_point'][0]:5.1f},{p['def_point'][1]:4.1f})")
    print(f"\nYEDEKLER ({len(data['bench'])}):")
    for p in data['bench']:
        print(f"  #{p['jersey']:2} {p['name'][:18]:18} ilk_giriş={p['first_time']:5.0f}s")

print("\nBITTI")
