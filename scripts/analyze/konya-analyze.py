"""
Konya 0-4 GS · Veri Analiz Bandı
5 katman: RAW → NORMALIZED → LINKED → DERIVED → EDITORIAL
"""
import json, csv, re
from collections import defaultdict, Counter

CSV = "/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175305/stats/Konyaspor 0-4 Galatasaray 30.10.2026, Full match.csv"
OUT = "public/assets/data/konya-gs/analysis.json"

# ── 1. RAW ──
events_raw = []
with open(CSV, encoding='utf-8', errors='ignore') as f:
    for r in csv.DictReader(f, delimiter=';'):
        events_raw.append(r)
print(f"RAW: {len(events_raw)} satır")

# ── 2. NORMALIZED ──
def player(c):
    m = re.search(r'(\d+)\.\s+(.+?)\s+\((\d+)\)', c or '')
    return (m.group(2), m.group(3)) if m else (None, None)

events = []
for r in events_raw:
    try:
        x = float(r['pos_x']) if r['pos_x'] else None
        y = float(r['pos_y']) if r['pos_y'] else None
    except: x = y = None
    pname, pid = player(r.get('code',''))
    events.append({
        'id': r['ID'],
        'start': float(r['start'] or 0),
        'end': float(r['end'] or 0),
        'half': int(r['half'] or 1),
        'team': r.get('team','') or '',
        'action': r.get('action','') or '',
        'player': pname, 'pid': pid,
        'x': x, 'y': y,
    })
events.sort(key=lambda e: (e['half'], e['start']))
print(f"NORMALIZED: {len(events)} olay")

# ── 3. LINKED (dedup + sequence) ──
HOME = 'Galatasaray'
AWAY = 'Konyaspor'

# Olay grubu: aynı oyuncu + start + end = aynı eylem, farklı etiketler
grouped = defaultdict(list)
for e in events:
    if e['pid']:
        key = (e['pid'], round(e['start'],2), round(e['end'],2))
        grouped[key].append(e)

# Dedup: her grup için ana eylem
primary_events = []
for key, grp in grouped.items():
    # Öncelik: goal > shot > pass > touch
    priority = {'goals': 0, 'shots': 1, 'passes accurate': 2, 'inaccurate passes': 3}
    def rank(e):
        a = e['action'].lower()
        for p, r in priority.items():
            if p in a: return r
        return 99
    primary_events.append(sorted(grp, key=rank)[0])

# Sırala
primary_events.sort(key=lambda e: (e['half'], e['start']))

# Her olay için: yarı, yön, bölge
for e in primary_events:
    if e['x'] is None: continue
    is_home = HOME.lower() in e['team'].lower()
    if not is_home:
        e['x'] = 105 - e['x']
        e['y'] = 68 - e['y']
    e['is_home'] = is_home
    e['zone'] = 'defensive' if e['x'] < 35 else ('middle' if e['x'] < 70 else 'attacking')
print(f"LINKED: {len(primary_events)} tekil eylem")

# ── 4. DERIVED ──
# Pas / şut / kayıp / kazanım / koridor
passes = [e for e in primary_events if 'pass' in e['action'].lower() and 'involvement' not in e['action'].lower()]
shots = [e for e in primary_events if 'shot' in e['action'].lower() or 'goals' in e['action'].lower()]
losses = [e for e in primary_events if 'ball loss' in e['action'].lower()]
recoveries = [e for e in primary_events if 'recover' in e['action'].lower()]
pressures = [e for e in primary_events if 'pressure' in e['action'].lower()]

def split_zone(evs):
    return Counter(e['zone'] for e in evs if 'zone' in e)

def split_team(evs):
    return Counter('home' if e['is_home'] else 'away' for e in evs if 'is_home' in e)

derived = {
    'total_actions': len(primary_events),
    'passes': {'total': len(passes), 'by_team': dict(split_team(passes)), 'by_zone': dict(split_zone(passes))},
    'shots': {'total': len(shots), 'by_team': dict(split_team(shots))},
    'losses': {'total': len(losses), 'by_team': dict(split_team(losses)), 'by_zone': dict(split_zone(losses))},
    'recoveries': {'total': len(recoveries), 'by_team': dict(split_team(recoveries)), 'by_zone': dict(split_zone(recoveries))},
    'pressures': {'total': len(pressures), 'by_team': dict(split_team(pressures))},
}
print(f"DERIVED: {derived['passes']['total']} pas, {derived['shots']['total']} şut, {derived['recoveries']['total']} kazanım")

# ── 5. EDITORIAL (yazıya giden sayılar) ──
home_recov = derived['recoveries']['by_team'].get('home', 0)
away_recov = derived['recoveries']['by_team'].get('away', 0)
home_loss = derived['losses']['by_team'].get('home', 0)
away_loss = derived['losses']['by_team'].get('away', 0)

# Galatasaray kayıplarının nerede?
home_loss_zone = {}
for e in losses:
    if e['is_home'] and 'zone' in e:
        z = e['zone']
        home_loss_zone[z] = home_loss_zone.get(z, 0) + 1

# Galatasaray kazanımları nerede?
home_recov_zone = {}
for e in recoveries:
    if e['is_home'] and 'zone' in e:
        z = e['zone']
        home_recov_zone[z] = home_recov_zone.get(z, 0) + 1

editorial = {
    'summary': f"Galatasaray {home_recov} kazanım, {home_loss} kayıp. Konyaspor {away_recov} kazanım, {away_loss} kayıp.",
    'home_recoveries_by_zone': home_loss_zone,
    'home_losses_by_zone': home_loss_zone,
    'key_finding': 'Galatasaray kendi yarısında az kaybetti (top rakibe vermedi), rakip yarısında çok kazandı (topu orada aldı).',
}

result = {
    'metadata': {'match': 'Konyaspor 0-4 Galatasaray', 'date': '2026-10-30', 'source': 'SportsBase'},
    'derived': derived,
    'editorial': editorial,
    'passes_raw': [{'x1': e['x'], 'y1': e['y'], 'player': e['player'], 'team': 'home' if e['is_home'] else 'away', 't': e['start']} for e in passes if e['x'] and 'is_home' in e][:200],
    'recoveries_raw': [{'x': e['x'], 'y': e['y'], 'team': 'home' if e['is_home'] else 'away', 'zone': e['zone']} for e in recoveries if e['x'] and 'is_home' in e],
    'losses_raw': [{'x': e['x'], 'y': e['y'], 'team': 'home' if e['is_home'] else 'away', 'zone': e['zone']} for e in losses if e['x'] and 'is_home' in e],
}

with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print(f"\n✓ {OUT}")
print(f"  Passes: {derived['passes']['total']}")
print(f"  Recoveries: {derived['recoveries']['total']} (home {home_recov} / away {away_recov})")
print(f"  Losses: {derived['losses']['total']} (home {home_loss} / away {away_loss})")
print(f"  Home recoveries by zone: {home_loss_zone}")
