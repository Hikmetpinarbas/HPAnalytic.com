#!/usr/bin/env python3
import csv, json
from pathlib import Path
from collections import defaultdict, Counter

SRC = Path.home() / "pipeline/input/lille-gs-2026-10-21"
OUT = Path.home() / "hpanalytic/docs"

# Half × team × ortalama x
agg = defaultdict(lambda: {"n": 0, "x_sum": 0, "y_sum": 0})

with open(SRC / "MATCH_2026-10-21_LOSC_Lille_vs_Galatasaray_PLAYERS.csv", encoding='utf-8') as f:
    for row in csv.DictReader(f, delimiter=';'):
        team = row['team'].split(' ')[0]  # Galatasaray / LOSC
        half = row['half']
        try:
            x = float(row['pos_x']); y = float(row['pos_y'])
        except:
            continue
        agg[(half, team)]["n"] += 1
        agg[(half, team)]["x_sum"] += x
        agg[(half, team)]["y_sum"] += y

print("=== HALF × TEAM: ortalama koordinatlar ===")
for (half, team), d in sorted(agg.items()):
    n = d["n"]
    print(f"  Half {half} | {team:15s} | n={n:5d} | x_ort={d['x_sum']/n:6.2f} | y_ort={d['y_sum']/n:6.2f}")

# Gol koordinatları
print("\n=== GOL KOORDİNATLARI ===")
with open(SRC / "MATCH_2026-10-21_LOSC_Lille_vs_Galatasaray_PLAYERS.csv", encoding='utf-8') as f:
    for row in csv.DictReader(f, delimiter=';'):
        if row['action'] in ('Goals', 'Own goals'):
            print(f"  {row['action']:12s} | {row['team']:25s} | half={row['half']} | x={row['pos_x']:>7s} y={row['pos_y']:>7s} | start={row['start']}")
