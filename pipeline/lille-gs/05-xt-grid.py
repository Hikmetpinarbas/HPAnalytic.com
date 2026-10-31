#!/usr/bin/env python3
"""xT grid — 10×8 hücre, literatür önseli + bu maçın lokal kalibrasyonu."""
import csv, json, math
from pathlib import Path
from collections import defaultdict

SRC = Path.home() / "pipeline/input/lille-gs-2026-10-21"
OUT = Path.home() / "hpanalytic/public/assets/data/lille-gs"
OUT.mkdir(parents=True, exist_ok=True)

GRID_X, GRID_Y = 10, 8
CELL_W, CELL_H = 105/GRID_X, 68/GRID_Y

def num(v):
    try: return float(v)
    except: return None

# ── Tüm olayları oku ──
events = []
with open(SRC / "MATCH_2026-10-21_LOSC_Lille_vs_Galatasaray_PLAYERS.csv", encoding='utf-8') as f:
    for r in csv.DictReader(f, delimiter=';'):
        x, y = num(r['pos_x']), num(r['pos_y'])
        if x is None or y is None or (x == 0 and y == 0): continue
        t = num(r['start']) or 0
        if r['half'] == '2': t -= 2848.12
        events.append({
            'x': x, 'y': y,
            'team': 'GS' if 'Galatasaray' in r['team'] else 'LIL',
            'action': r['action'],
            't': t,
        })

# ── Aynı maç, koordinatlar takıma göre. GS sağa, Lille sola hücum ediyor.
# Grid görseli için GS perspektifi: Lille olayları flip edilir.
def flip(x, y, team, target='GS'):
    if team != target:
        return 105 - x, 68 - y
    return x, y

# ── Literatür önseli (Karstens & Zaman 2013 yapısına yakın) ──
# Tehdit = mesafe_decay × açı_konsantrasyonu
def prior_xt(x, y):
    goal_x, goal_y = 105, 34
    dist = math.sqrt((goal_x - x)**2 + (goal_y - y)**2)
    if dist < 0.5: return 0.95
    # Açı: kale merkezinden ne kadar dar
    dx, dy = goal_x - x, goal_y - y
    angle = math.atan2(abs(dy), max(dx, 0.5))
    angular = math.cos(min(angle, math.pi/2 - 0.05)) ** 2
    base = 0.95 * math.exp(-dist / 24)
    return round(min(0.95, base * (0.35 + 0.65 * angular)), 3)

# ── Grid kur, olay ata ──
def build_grid(target='GS'):
    grid = {}
    for r in range(GRID_Y):
        for c in range(GRID_X):
            cx = (c + 0.5) * CELL_W
            cy = (r + 0.5) * CELL_H
            grid[(r, c)] = {
                'row': r, 'col': c,
                'cx': round(cx, 1), 'cy': round(cy, 1),
                'prior': prior_xt(cx, cy),
                'events': 0,
                'goals': 0,
                'shots': 0,
                'by_action': defaultdict(int),
            }

    for ev in events:
        x, y = flip(ev['x'], ev['y'], ev['team'], target)
        if not (0 <= x <= 105 and 0 <= y <= 68): continue
        c = min(int(x / CELL_W), GRID_X - 1)
        r = min(int(y / CELL_H), GRID_Y - 1)
        cell = grid[(r, c)]
        cell['events'] += 1
        cell['by_action'][ev['action']] += 1
        if ev['action'] == 'Goals': cell['goals'] += 1
        if 'Shots' in ev['action']: cell['shots'] += 1

    # ── Kalibrasyon: yerel önem = (gol×10 + şut×3 + toplam) / maksimum
    max_ev = max(c['events'] for c in grid.values()) or 1
    out = []
    for key, cell in grid.items():
        local = (cell['goals'] * 10 + cell['shots'] * 3 + cell['events']) / (max_ev + 10)
        local = min(1.0, local)
        # %75 önsel + %25 lokal
        xt = cell['prior'] * 0.75 + (cell['prior'] * 0.25 * local)
        out.append({
            'row': cell['row'], 'col': cell['col'],
            'cx': cell['cx'], 'cy': cell['cy'],
            'prior': cell['prior'],
            'local': round(local, 3),
            'xT': round(xt, 3),
            'events': cell['events'],
            'goals': cell['goals'],
            'shots': cell['shots'],
        })
    return out

gs = build_grid('GS')
lil = build_grid('LIL')

# ── Gol zincirleri üzerinden trace ──
goals_list = [e for e in events if e['action'] in ('Goals', 'Own goals')]
traces = []
for g in goals_list:
    team = g['team']
    t = g['t']
    # Bu golden önceki 15sn içindeki takım aksiyonları
    seq = [e for e in events if e['team'] == team and t - 15 <= e['t'] <= t]
    seq.sort(key=lambda e: e['t'])
    # Grid hücresine indir
    # Dedup: aynı saniyede aynı aksiyon = tek satır
    DEDUP_SKIP = {'Shots on target', 'Chances', 'Chances created',
                  'Key passes accurate', 'Assists', 'Involvement in positional attacks with shots'}
    seen = set()
    trace_cells = []
    for e in seq:
        if e['action'] in DEDUP_SKIP:
            continue
        key = (round(e['t'], 1), e['action'])
        if key in seen: continue
        seen.add(key)
        x, y = flip(e['x'], e['y'], team, team)
        c = min(int(x / CELL_W), GRID_X - 1)
        r = min(int(y / CELL_H), GRID_Y - 1)
        grid_ref = gs if team == 'GS' else lil
        cell = next(cc for cc in grid_ref if cc['row'] == r and cc['col'] == c)
        trace_cells.append({
            't': round(e['t'], 2),
            'action': e['action'],
            'row': r, 'col': c,
            'xT': cell['xT'],
        })
    # En fazla 8 adım tut (filtre): son 8 adım
    trace_cells = trace_cells[-8:]
    traces.append({
        'minute': round(t / 60, 1),
        'team': team,
        'cells': trace_cells,
        'peak_xT': max([c['xT'] for c in trace_cells], default=0),
    })

out = {
    'grid': {'x': GRID_X, 'y': GRID_Y, 'cell_w': round(CELL_W,2), 'cell_h': round(CELL_H,2)},
    'GS': gs,
    'LIL': lil,
    'traces': traces,
}
(OUT / 'xt_grid.json').write_text(json.dumps(out, ensure_ascii=False, indent=2))

# ── Özet ──
print(f"✓ Grid {GRID_X}×{GRID_Y}")
print(f"✓ GS: en yüksek xT = {max(c['xT'] for c in gs):.3f}, en düşük = {min(c['xT'] for c in gs):.3f}")
print(f"✓ LIL: en yüksek xT = {max(c['xT'] for c in lil):.3f}")
print(f"\n=== {len(traces)} GOL ZİNCİRİ ===")
for tr in traces:
    print(f"\n{tr['minute']}'\' {tr['team']} · zirve xT={tr['peak_xT']:.3f} · {len(tr['cells'])} adım")
    for c in tr['cells'][-5:]:
        print(f"  {c['t']:7.1f}s  [{c['row']},{c['col']}]  xT={c['xT']:.3f}  {c['action'][:35]}")

# ── Grid tablosu (görsel doğrulama) ──
print("\n=== GS GRID (satır 0 = sağ kanat, satır 7 = sol kanat) ===")
print("      " + " ".join(f"c{c}" for c in range(GRID_X)))
for r in range(GRID_Y):
    row_str = f"r{r}:  " + " ".join(
        f"{next(c['xT'] for c in gs if c['row']==r and c['col']==cc):.2f}"
        for cc in range(GRID_X)
    )
    print(row_str)
