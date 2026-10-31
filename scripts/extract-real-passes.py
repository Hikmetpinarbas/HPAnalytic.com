import csv, json, re
from collections import defaultdict

CSV_PATH = "/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175306/stats/LOSC Lille 2-4 Galatasaray 21.10.2026, Full match.csv"
OUT_PATH = "public/assets/data/lille-gs/real-passes.json"
HOME_TEAM = "Galatasaray"

def player_from_code(code):
    m = re.search(r'(\d+)\.\s+(.+?)\s+\((\d+)\)', code or '')
    if m: return (m.group(2), m.group(3))
    return (None, None)

# 1. Parse
events = []
with open(CSV_PATH, 'r', encoding='utf-8', errors='ignore') as f:
    reader = csv.DictReader(f, delimiter=';')
    for r in reader:
        try:
            x = float(r['pos_x']) if r['pos_x'] else None
            y = float(r['pos_y']) if r['pos_y'] else None
        except: x = y = None
        pname, pid = player_from_code(r.get('code',''))
        events.append({
            'id': r['ID'],
            'start': float(r['start'] or 0),
            'end': float(r['end'] or 0),
            'half': int(r['half'] or 1),
            'team': r.get('team','') or '',
            'action': r.get('action','') or '',
            'code': r.get('code','') or '',
            'player': pname, 'player_id': pid,
            'x': x, 'y': y
        })

# Sırala: yarı → start → end
events.sort(key=lambda e: (e['half'], e['start'], e['end']))

# 2. Pas olaylarını bul (dedup: player_id + start + end)
pass_raw = defaultdict(list)
for e in events:
    a = e['action'].lower()
    # Pass içeriyor ama "involvement" değil
    if 'pass' in a and 'involvement' not in a and e['player_id'] and e['x'] is not None:
        key = (e['player_id'], round(e['start'], 2), round(e['end'], 2))
        pass_raw[key].append(e)

# 3. Her dedup'lu pas için: alıcı bul
passes = []
for key, group in pass_raw.items():
    # En "ana" etiketi seç
    actions = [e['action'] for e in group]
    if 'Passes accurate' in actions:
        primary = next(e for e in group if e['action'] == 'Passes accurate')
        success = True
    elif 'Inaccurate passes' in actions:
        primary = next(e for e in group if e['action'] == 'Inaccurate passes')
        success = False
    else:
        primary = group[0]
        success = 'inaccurate' not in primary['action'].lower() and 'incomplete' not in primary['action'].lower()
    
    # Alıcı: primary'den sonraki aynı takım, primary['end'] sonrası ilk temas
    reception = None
    start_idx = events.index(primary)
    for nxt in events[start_idx + 1:start_idx + 30]:
        if nxt['half'] != primary['half']: break
        if nxt['team'] != primary['team']: continue
        if nxt['x'] is None: continue
        gap = nxt['start'] - primary['end']
        if gap < -0.5: continue
        if gap > 10: break
        reception = nxt
        break
    
    if reception is None: continue
    
    # Deplasman flip
    is_home = HOME_TEAM.lower() in primary['team'].lower()
    x1, y1 = primary['x'], primary['y']
    x2, y2 = reception['x'], reception['y']
    if not is_home:
        x1, y1 = 105 - x1, 68 - y1
        x2, y2 = 105 - x2, 68 - y2
    
    passes.append({
        'x1': round(x1, 2), 'y1': round(y1, 2),
        'x2': round(x2, 2), 'y2': round(y2, 2),
        't': round(primary['start'], 1),
        'half': primary['half'],
        'team': 'home' if is_home else 'away',
        'player': primary['player'],
        'player_id': primary['player_id'],
        'success': success,
        'action': primary['action'],
        'tags': actions
    })

# 4. İstatistik
result = {
    'metadata': {
        'match': 'Lille 2-4 Galatasaray',
        'home_team': HOME_TEAM,
        'total_events': len(events),
        'unique_pass_events': len(pass_raw),
        'passes_with_reception': len(passes),
        'success_passes': sum(1 for p in passes if p['success']),
        'home_passes': sum(1 for p in passes if p['team'] == 'home'),
        'away_passes': sum(1 for p in passes if p['team'] == 'away')
    },
    'passes': passes
}

with open(OUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print(f"✓ {OUT_PATH}")
print(f"  Events: {len(events)}")
print(f"  Unique pass events (dedup): {len(pass_raw)}")
print(f"  With reception: {len(passes)}")
print(f"  Success: {result['metadata']['success_passes']}")
print(f"  Home/Away: {result['metadata']['home_passes']} / {result['metadata']['away_passes']}")
print()
print("İlk 3 pas:")
for p in passes[:3]:
    print(f"  {p['player']} ({p['team']}): ({p['x1']},{p['y1']}) → ({p['x2']},{p['y2']}) {'✓' if p['success'] else '✗'}")
