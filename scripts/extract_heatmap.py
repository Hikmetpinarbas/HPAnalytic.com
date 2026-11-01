import csv, json
from pathlib import Path
from collections import Counter

# Konya-GS Maçı PL CSV
csv_path = '/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175305/stats/Konyaspor 0-4 Galatasaray 30.10.2026, Full match.csv'

rows = list(csv.DictReader(open(csv_path, encoding='utf-8', errors='ignore'), delimiter=';'))

# Sadece Galatasaray'ın aksiyonlarını al ve koordinatları topla
# pos_x (0-105), pos_y (0-68)
points = []
for r in rows:
    team = (r.get('team') or '').lower()
    if 'galatasaray' in team:
        try:
            x = float(r['pos_x'])
            y = float(r['pos_y'])
            action = r.get('action', '')
            points.append({'x': round(x, 1), 'y': round(y, 1), 'action': action})
        except (ValueError, TypeError):
            pass

# Yoğunluk için 5x5 metrelik gridlere böl (Saha 105x68)
grid = Counter()
for p in points:
    gx = int(p['x'] // 5)
    gy = int(p['y'] // 5)
    grid[(gx, gy)] += 1

# En yoğun 40 noktayı al (Isı haritası için)
top_cells = grid.most_common(40)

# JSON'a çevir
output = [{'x': (gx * 5) + 2.5, 'y': (gy * 5) + 2.5, 'weight': count} for (gx, gy), count in top_cells]

out_path = Path('public/assets/data/konya-gs/heatmap.json')
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(json.dumps(output, indent=2), encoding='utf-8')

print(f"✓ Isı haritası verisi hazır: {out_path} ({len(output)} nokta)")
print(f"  Toplam GS aksiyonu: {len(points)}")
