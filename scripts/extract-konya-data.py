import csv, json
from collections import defaultdict
import re

CSV = "/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175305/stats/Konyaspor 0-4 Galatasaray 30.10.2026, Full match.csv"

def player_from_code(code):
    m = re.search(r'(\d+)\.\s+(.+?)\s+\((\d+)\)', code or '')
    return (m.group(2), m.group(3)) if m else (None, None)

events = []
with open(CSV, encoding='utf-8', errors='ignore') as f:
    for r in csv.DictReader(f, delimiter=';'):
        try:
            x = float(r['pos_x']) if r['pos_x'] else None
            y = float(r['pos_y']) if r['pos_y'] else None
        except: x = y = None
        pname, pid = player_from_code(r.get('code',''))
        events.append({
            'start': float(r['start'] or 0),
            'end': float(r['end'] or 0),
            'half': int(r['half'] or 1),
            'team': r.get('team','') or '',
            'action': r.get('action','') or '',
            'player': pname, 'player_id': pid,
            'x': x, 'y': y
        })

events.sort(key=lambda e: (e['half'], e['start']))

# Pass dedup
pass_raw = defaultdict(list)
for e in events:
    if 'pass' in e['action'].lower() and 'involvement' not in e['action'].lower() and e['player_id'] and e['x']:
        key = (e['player_id'], round(e['start'], 2), round(e['end'], 2))
        pass_raw[key].append(e)

HOME = 'Galatasaray'
passes = []
for key, group in pass_raw.items():
    actions = [e['action'] for e in group]
    if 'Passes accurate' in actions:
        primary = next(e for e in group if e['action'] == 'Passes accurate')
        success = True
    else:
        primary = group[0]
        success = 'inaccurate' not in primary['action'].lower()
    
    idx = events.index(primary)
    reception = None
    for nxt in events[idx+1:idx+30]:
        if nxt['half'] != primary['half']: break
        if nxt['team'] != primary['team']: continue
        if nxt['x'] is None: continue
        gap = nxt['start'] - primary['end']
        if gap < -0.5: continue
        if gap > 10: break
        reception = nxt
        break
    if not reception: continue
    
    is_home = HOME.lower() in primary['team'].lower()
    x1, y1, x2, y2 = primary['x'], primary['y'], reception['x'], reception['y']
    if not is_home:
        x1, y1, x2, y2 = 105-x1, 68-y1, 105-x2, 68-y2
    
    passes.append({
        'x1': round(x1,2), 'y1': round(y1,2), 'x2': round(x2,2), 'y2': round(y2,2),
        't': round(primary['start'], 1), 'half': primary['half'],
        'team': 'home' if is_home else 'away',
        'player': primary['player'], 'success': success
    })

# Şutlar
shots = []
for e in events:
    a = e['action'].lower()
    if 'shot' in a or 'goal' in a or 'penalty' in a:
        if e['x'] and e['y'] and e['player_id']:
            is_home = HOME.lower() in e['team'].lower()
            x, y = (e['x'], e['y']) if is_home else (105-e['x'], 68-e['y'])
            shots.append({
                'x': round(x,2), 'y': round(y,2),
                'player': e['player'], 'team': 'home' if is_home else 'away',
                'is_goal': 'goals' in a, 'action': e['action'],
                'time': round(e['start'], 1)
            })

result = {
    'metadata': {
        'match': 'Konyaspor 0-4 Galatasaray',
        'date': '2026-10-30',
        'home_team': 'Galatasaray',
        'events': len(events),
        'passes': len(passes),
        'shots': len(shots)
    },
    'passes': passes,
    'shots': shots
}

with open('public/assets/data/konya-gs/real-passes.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print(f"✓ Passes: {len(passes)}, Shots: {len(shots)}, Events: {len(events)}")
