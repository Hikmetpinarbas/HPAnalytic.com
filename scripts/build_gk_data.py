import csv, json
from collections import defaultdict
import pandas as pd
from pathlib import Path

# --- AUTO: --src / --out destegi ---
import sys, argparse
from pathlib import Path as _PathAlias
_ap = argparse.ArgumentParser(add_help=False)
_ap.add_argument('--src', default=None)
_ap.add_argument('--out', default=None)
_args, _ = _ap.parse_known_args()
# --- /AUTO ---

_GK_DEF = "/storage/emulated/0/HPAnaliz/SportsBase/maclar/MATCH_2026_11_03_Galatasaray_vs_Stuttgart/MATCH_2026_11_03_Galatasaray_vs_Stuttgart__GOALKEEPERS__XLSX.xlsx"
GK_XLSX = str(next(Path(_args.src).glob("*__GOALKEEPERS__XLSX.xlsx"), _GK_DEF)) if _args.src else _GK_DEF
_PC_DEF = "public/assets/data/gs-stuttgart/players.csv"
PLAYERS_CSV = f"{_args.out}/players.csv" if _args.out else _PC_DEF
_OUT_DEF = "public/assets/data/gs-stuttgart/gk_distribution.json"
OUT = f"{_args.out}/gk_distribution.json" if _args.out else _OUT_DEF

def safe_int(v, default=0):
    try:
        if pd.isna(v): return default
        if isinstance(v, str):
            v = v.strip()
            if v in ('-', '', 'nan'): return default
        return int(float(v))
    except: return default

def safe_pct(v, default=0.0):
    try:
        if pd.isna(v): return default
        if isinstance(v, str):
            v = v.strip()
            if v in ('-', '', 'nan'): return default
        return round(float(v) * 100, 1)
    except: return default

df = pd.read_excel(GK_XLSX)
gks = {}
for _, row in df.iterrows():
    if pd.isna(row.get('Player')): continue
    team = row['Team']
    gks[team] = {
        'player': row['Player'],
        'team': team,
        'passes': safe_int(row['Passes']),
        'passes_accurate': safe_int(row['Passes accurate']),
        'accuracy_pct': safe_pct(row['Passes accurate, %']),
        'goal_kicks': safe_int(row['Goal kicks']),
        'gk_accuracy_pct': safe_pct(row['Goal kicks accurate, %']),
        'open_play_passes': safe_int(row['Open play passes']),
        'throws': safe_int(row['Throws']),
        'long_passes': safe_int(row['Long passes']),
        'sweeping': safe_int(row['Sweeping actions']),
        'supersaves': safe_int(row['Supersaves']),
        'saves': safe_int(row['Shots saved']),
        'goals_conceded': safe_int(row['Goals conceded']),
    }

landings = defaultdict(lambda: {'short': [], 'medium': [], 'long': []})
seen = set()
with open(PLAYERS_CSV, encoding='utf-8') as f:
    for row in csv.DictReader(f, delimiter=';'):
        code = row['code']
        if 'Goal kicks' not in code or not row['pos_x']: continue
        team = 'Galatasaray' if 'Galatasaray' in code else ('VfB Stuttgart' if 'Stuttgart' in code else None)
        if not team: continue
        key = (team, row['start'], row['end'], row['pos_x'], row['pos_y'])
        if key in seen: continue
        seen.add(key)
        try:
            x, y = float(row['pos_x']), float(row['pos_y'])
        except: continue
        a = row['action'].lower()
        if 'short' in a: cat = 'short'
        elif 'medium' in a: cat = 'medium'
        elif 'long' in a: cat = 'long'
        else: continue
        landings[team][cat].append({'x': round(x,1), 'y': round(y,1)})

for team, gk in gks.items():
    gk['landings'] = {k: v[:60] for k, v in landings[team].items()}
    gk['landing_counts'] = {k: len(v) for k, v in landings[team].items()}

with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(gks, f, indent=2, ensure_ascii=False)

print(f"OK: {OUT}")
for t, g in gks.items():
    print(f"  {t}: {g['player']} | {g['passes']} pas, %{g['accuracy_pct']} isabet | landings: {g['landing_counts']}")
