"""Player fitness XLSX → sezon ortalamaları JSON"""
import openpyxl, json
from pathlib import Path

def num(v):
    if v is None or v == '-': return 0.0
    try: return float(v)
    except: return 0.0

def parse_player_fitness(xlsx_path, team_name, out_json):
    wb = openpyxl.load_workbook(xlsx_path, data_only=True, read_only=True)
    ws = wb['Tüm maçlar'] if 'Tüm maçlar' in wb.sheetnames else wb.active
    rows = list(ws.iter_rows(values_only=True))
    if not rows: return None
    hdr = [str(h or '') for h in rows[0]]

    def idx(n):
        try: return hdr.index(n)
        except: return -1

    cols = {
        'player': idx('Player'),
        'mins': idx('Minutes played'),
        'dist': idx('Distance, m'),
        'sprint_m': idx('Sprint distance (> 7 m/s), m'),
        'hsr': idx('Number of high-speed runs'),
        'sprints': idx('Number of sprints'),
        'max_speed': idx('Maximum speed, m/s'),
        'metabolic': idx('Average metabolic power, W/kg'),
        'kcal': idx('Energy expenditure, kcal'),
    }

    players = {}
    for r in rows[1:]:
        if not r[cols['player']]: continue
        name = str(r[cols['player']]).strip()
        mins = num(r[cols['mins']])
        if mins <= 0: continue
        f90 = 90.0 / mins
        players[name] = {
            'season_minutes': int(mins),
            'season_distance_km': round(num(r[cols['dist']]) / 1000, 1),
            'season_sprint_m': int(num(r[cols['sprint_m']])),
            'season_max_speed': round(num(r[cols['max_speed']]), 2),
            'season_metabolic_w_kg': round(num(r[cols['metabolic']]), 1),
            'season_kcal': int(num(r[cols['kcal']])),
            'per90_distance_km': round(num(r[cols['dist']]) * f90 / 1000, 2),
            'per90_sprint_m': int(num(r[cols['sprint_m']]) * f90),
            'per90_hsr': round(num(r[cols['hsr']]) * f90, 1),
            'per90_sprints': round(num(r[cols['sprints']]) * f90, 2),
        }

    out = {
        'team': team_name,
        'source_xlsx': Path(xlsx_path).name,
        'sheet': ws.title,
        'players': players,
        'epistemic': 'KAYIT',
        'caveat': 'Sezon toplamı; 90dk normalize ortalama. Bu maç-spesifik değil.',
    }
    Path(out_json).parent.mkdir(parents=True, exist_ok=True)
    with open(out_json, 'w', encoding='utf-8') as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    return out

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 4:
        print('Kullanım: python3 fitness.py <xlsx> <team> <out_json>')
        sys.exit(1)
    out = parse_player_fitness(sys.argv[1], sys.argv[2], sys.argv[3])
    print(f"✓ {sys.argv[3]}: {len(out['players'])} oyuncu")
