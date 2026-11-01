import csv, json
from pathlib import Path

csv_path = '/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175305/stats/Konyaspor 0-4 Galatasaray 30.10.2026, Full match.csv'
rows = list(csv.DictReader(open(csv_path, encoding='utf-8', errors='ignore'), delimiter=';'))

def sec_to_label(s):
    m = int(s // 60)
    sec = int(s % 60)
    return f"{m:02d}:{sec:02d}"

timeline = []
total_rows = 0
with_coords = 0
with_team = 0

for r in rows:
    total_rows += 1
    team_raw = (r.get('team') or '').strip()
    if team_raw:
        with_team += 1
    
    x_raw = r.get('pos_x', '').strip()
    y_raw = r.get('pos_y', '').strip()
    if not x_raw or not y_raw or not team_raw:
        continue
    with_coords += 1
    
    team = team_raw.split('(')[0].strip()
    code = r.get('code', '')
    player = code.split(' - ')[0].strip() if ' - ' in code else code
    if '. ' in player:
        player = player.split('. ', 1)[1]
    try:
        x = float(x_raw)
        y = float(y_raw)
        time = float(r.get('start', 0))
        half = int(r.get('half', 1))
        action = r.get('action', '')
        match_time = time  # start zaten maçın başından itibaren saniye
        timeline.append({
            't': round(match_time, 1),
            'ts': sec_to_label(match_time),
            'team': team,
            'player': player,
            'x': round(x, 1),
            'y': round(y, 1),
            'action': action
        })
    except (ValueError, TypeError):
        pass

timeline.sort(key=lambda e: e['t'])
out = Path('public/assets/data/konya-gs/timeline.json')
out.write_text(json.dumps(timeline, ensure_ascii=False), encoding='utf-8')

print(f"── HAM VERİ ──")
print(f"  Toplam CSV satırı: {total_rows}")
print(f"  Takım bilgisi olan: {with_team}")
print(f"  Koordinatı olan:    {with_coords}")
print()
print(f"── ANİMASYON VERİSİ ──")
print(f"  Hazır event: {len(timeline)}")
print(f"  Süre: {sec_to_label(timeline[-1]['t'])}")
print(f"  Örnek: {timeline[100]['ts']} · {timeline[100]['team']} · {timeline[100]['player']} · {timeline[100]['action'][:40]}")
