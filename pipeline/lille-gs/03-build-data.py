#!/usr/bin/env python3
import csv, json
from pathlib import Path
from collections import defaultdict, Counter

SRC = Path.home() / "pipeline/input/lille-gs-2026-10-21"
OUT = Path.home() / "hpanalytic/public/assets/data/lille-gs"
OUT.mkdir(parents=True, exist_ok=True)

CSV = SRC / "MATCH_2026-10-21_LOSC_Lille_vs_Galatasaray_PLAYERS.csv"

# Tüm satırları oku
rows = []
with open(CSV, encoding='utf-8') as f:
    for row in csv.DictReader(f, delimiter=';'):
        rows.append(row)

def team_code(t):
    return 'GS' if 'Galatasaray' in t else 'LIL'

def num(v):
    try: return float(v)
    except: return 0.0

# ═══ 1. SHOT MAP ═══
# Maç saati: half 1 raw, half 2 = start - 2848.12
SHOT_ACTIONS = {'Goals': 'Goal', 'Own goals': 'Own Goal',
                'Shots on target': 'On Target', 'Shots off target': 'Off Target'}

shot_by_time = defaultdict(list)
for r in rows:
    if r['action'] in SHOT_ACTIONS:
        t = num(r['start'])
        if r['half'] == '2': t -= 2848.12
        key = round(t, 1)
        shot_by_time[key].append(r)

shots = []
for t, items in shot_by_time.items():
    # Aynı zaman: Own Goal > Goal > On Target > Off Target
    priority = {'Own Goal': 1, 'Goal': 2, 'On Target': 3, 'Off Target': 4}
    best = min(items, key=lambda r: priority.get(SHOT_ACTIONS[r['action']], 5))
    team = team_code(best['team'])
    x, y = num(best['pos_x']), num(best['pos_y'])
    # Lille sol kaleye, GS sağ kaleye
    if team == 'LIL' and SHOT_ACTIONS[best['action']] != 'Own Goal':
        x = 105 - x
        y = 68 - y
    shots.append({
        'team': team,
        'type': SHOT_ACTIONS[best['action']],
        'x': round(x, 2), 'y': round(y, 2),
        'minute': round(t / 60, 1),
    })

(OUT / 'shot_map.json').write_text(json.dumps(shots, ensure_ascii=False, indent=2))
print(f"✓ Shot map: {len(shots)} şut · {dict(Counter(s['type'] for s in shots))} · {dict(Counter(s['team'] for s in shots))}")

# ═══ 2. RHYTHM — 15dk bloklar × takım × action tipi ═══
ACTION_GROUPS = {
    'Pas': ['Passes accurate', 'Inaccurate passes', 'Progressive passes accurate',
            'Incomplete progressive passes', 'Passes forward accurate', 'Incomplete passes forward',
            'Passes into the penalty box accurate', 'Incomplete passes into the box'],
    'Şut': ['Shots on target', 'Shots off target', 'Goals'],
    'Top Kazanımı': ['Ball recoveries', 'Ball recoveries in opponent\'s half'],
    'Top Kaybı': ['Ball losses', 'Ball losses in own half'],
    'Dribling': ['Dribbles successful', 'Dribbles unsuccessful'],
    'İkili Mücadele': ['Challenges won', 'Challenges unsuccessful',
                       'Aerial challenges won', 'Aerial challenges lost'],
    'Taşıma': ['Carry'],
}

def action_group(a):
    for grp, acts in ACTION_GROUPS.items():
        if a in acts: return grp
    return None

rhythm = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
for r in rows:
    grp = action_group(r['action'])
    if not grp: continue
    t = num(r['start'])
    if r['half'] == '2': t -= 2848.12
    if t < 0: continue
    block = int(t // 900)  # 15 dk = 900 sn
    if block > 6: block = 6  # 90+ uzatma
    team = team_code(r['team'])
    rhythm[block][team][grp] += 1

rhythm_out = []
for b in range(7):
    rhythm_out.append({
        'block': b,
        'range': f"{b*15}-{(b+1)*15}",
        'GS': dict(rhythm[b].get('GS', {})),
        'LIL': dict(rhythm[b].get('LIL', {})),
    })

(OUT / 'rhythm.json').write_text(json.dumps(rhythm_out, ensure_ascii=False, indent=2))
print(f"✓ Rhythm: {len(rhythm_out)} blok")

# ═══ 3. CORRIDOR — 5 dilim × takım ═══
def corridor(y):
    if y < 13.6: return 'Sol kanat'
    if y < 27.2: return 'Sol iç'
    if y < 40.8: return 'Merkez'
    if y < 54.4: return 'Sağ iç'
    return 'Sağ kanat'

corridor_data = defaultdict(lambda: {'GS': 0, 'LIL': 0, 'GS_by_action': defaultdict(int), 'LIL_by_action': defaultdict(int)})
for r in rows:
    y = num(r['pos_y'])
    if y == 0: continue
    team = team_code(r['team'])
    c = corridor(y)
    corridor_data[c][team] += 1
    grp = action_group(r['action'])
    if grp:
        corridor_data[c][f'{team}_by_action'][grp] += 1

corridor_out = []
for c in ['Sol kanat', 'Sol iç', 'Merkez', 'Sağ iç', 'Sağ kanat']:
    d = corridor_data.get(c, {'GS': 0, 'LIL': 0})
    corridor_out.append({
        'corridor': c,
        'GS': d.get('GS', 0),
        'LIL': d.get('LIL', 0),
        'GS_actions': dict(d.get('GS_by_action', {})),
        'LIL_actions': dict(d.get('LIL_by_action', {})),
    })

(OUT / 'corridor.json').write_text(json.dumps(corridor_out, ensure_ascii=False, indent=2))
print(f"✓ Corridor: 5 dilim")

# ═══ 4. ZONE — 3 bölge × takım ═══
def zone(x):
    if x < 35: return 'Savunma (0-35m)'
    if x < 70: return 'Orta (35-70m)'
    return 'Hücum (70-105m)'

zone_data = defaultdict(lambda: {'GS': 0, 'LIL': 0})
for r in rows:
    x = num(r['pos_x'])
    if x == 0: continue
    team = team_code(r['team'])
    zone_data[zone(x)][team] += 1

zone_out = []
for z in ['Savunma (0-35m)', 'Orta (35-70m)', 'Hücum (70-105m)']:
    d = zone_data.get(z, {'GS': 0, 'LIL': 0})
    zone_out.append({'zone': z, 'GS': d.get('GS', 0), 'LIL': d.get('LIL', 0)})

(OUT / 'zone.json').write_text(json.dumps(zone_out, ensure_ascii=False, indent=2))
print(f"✓ Zone: 3 bölge")

# ═══ 5. GOAL CHAINS — 6 gol öncesi 10 sn ═══
# anahtarlar: goal start zamanı
goals = []
for r in rows:
    if r['action'] in ('Goals', 'Own goals'):
        t = num(r['start'])
        if r['half'] == '2': t -= 2848.12
        goals.append({'t': t, 'row': r})

# Aynı zaman grupla
goal_times = defaultdict(list)
for g in goals:
    goal_times[round(g['t'], 1)].append(g)

chains = []
for t, items in goal_times.items():
    main = next((i for i in items if i['row']['action'] == 'Goals'), items[0])
    team = team_code(main['row']['team'])
    # Öncesi 10 sn
    before = []
    for r in rows:
        rt = num(r['start'])
        if r['half'] == '2': rt -= 2848.12
        if t - 10 <= rt < t and team_code(r['team']) == team:
            before.append({'t': round(rt, 1), 'action': r['action'], 'x': num(r['pos_x']), 'y': num(r['pos_y'])})
    before.sort(key=lambda x: x['t'])
    chains.append({
        'minute': round(t / 60, 1),
        'team': team,
        'type': 'Own Goal' if main['row']['action'] == 'Own goals' else 'Goal',
        'x': num(main['row']['pos_x']),
        'y': num(main['row']['pos_y']),
        'before_10s': before[-6:],
    })

chains.sort(key=lambda c: c['minute'])
(OUT / 'goal_chains.json').write_text(json.dumps(chains, ensure_ascii=False, indent=2))
print(f"✓ Goal chains: {len(chains)} gol")
for c in chains:
    print(f"  {c['minute']:5.1f}' {c['team']} {c['type']:9s} ({c['x']:.1f}, {c['y']:.1f}) — {len(c['before_10s'])} öncesi aksiyon")
