import csv, re, json
from collections import defaultdict

CSV = "/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175305/stats/Konyaspor 0-4 Galatasaray 30.10.2026, Full match.csv"

# GERÇEK ŞUT ETİKETLERİ (sadece bunlar)
SHOT_LABELS = {
    'Goals', 'Shots on target', 'Shots off target',
    'Shots on post / bar', 'Penalty shots', 'Shots blocked',
    'Free-kick shots'
}

# Kaleci / opponent etiketleri — bunlar şut değil
EXCLUDE = {'goals conceded', "opponent's", 'goalkeeper'}

def player(c):
    m = re.search(r'(\d+)\.\s+(.+?)\s+\((\d+)\)', c or '')
    return (m.group(2), m.group(3)) if m else (None, None)

shots_raw = []
with open(CSV, encoding='utf-8', errors='ignore') as f:
    for r in csv.DictReader(f, delimiter=';'):
        a = (r.get('action') or '').strip()
        if a not in SHOT_LABELS: continue
        # Kaleci filtresi
        al = a.lower()
        if any(ex in al for ex in EXCLUDE): continue
        try:
            x = float(r['pos_x']) if r['pos_x'] else None
            y = float(r['pos_y']) if r['pos_y'] else None
        except: x = y = None
        pname, pid = player(r.get('code',''))
        if not x or not y or not pid: continue
        shots_raw.append({
            'pid': pid, 'player': pname,
            'team': r.get('team','') or '',
            'action': a, 'start': float(r['start'] or 0),
            'end': float(r['end'] or 0),
            'x': x, 'y': y
        })

# Dedup: aynı oyuncu + aynı (start,end) = 1 şut
grouped = defaultdict(list)
for s in shots_raw:
    key = (s['pid'], round(s['start'],2), round(s['end'],2))
    grouped[key].append(s)

primary = []
for k, grp in grouped.items():
    # Öncelik: Goal > On target > Off target > Blocked
    prio = {'Goals': 0, 'Shots on target': 1, 'Penalty shots': 1,
            'Shots on post / bar': 2, 'Free-kick shots': 2,
            'Shots off target': 3, 'Shots blocked': 4}
    primary.append(sorted(grp, key=lambda s: prio.get(s['action'], 9))[0])

# Takım filtresi: GAL ve KON
from collections import Counter
teams = Counter(s['team'].split('(')[0].strip() for s in primary)

goals = sum(1 for s in primary if s['action'] == 'Goals')
on_target = sum(1 for s in primary if s['action'] in ('Goals','Shots on target'))
off_target = sum(1 for s in primary if s['action'] == 'Shots off target')
blocked = sum(1 for s in primary if s['action'] == 'Shots blocked')

print(f"Gerçek şut: {len(primary)}")
print(f"  Gol: {goals}")
print(f"  İsabetli: {on_target}")
print(f"  İsabetsiz: {off_target}")
print(f"  Bloklanmış: {blocked}")
print(f"  Takım dağılımı: {dict(teams)}")

# Debug: 40'tan fazla çıkıyorsa hâlâ yanlış
if len(primary) > 40:
    print("\nUYARI: Hâlâ çok yüksek. Ham etiketler:")
    raw_labels = Counter(s['action'] for s in shots_raw)
    for lbl, cnt in raw_labels.most_common(20):
        print(f"  {cnt:4d}  {lbl}")
