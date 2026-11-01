"""8 boyutlu oyuncu radarı v3 · PL + XLSX + fitness birleşik"""
import openpyxl, os, json
from collections import defaultdict

def xlsx_stats(path, team_filter=None):
    """XLSX'ten oyuncu bazlı shot/goal/xG/fitness çek. team_filter ile filtrele."""
    if not os.path.exists(path): return {}
    wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    if not rows: return {}
    hdr = [str(h or '') for h in rows[0]]
    def idx(n): 
        try: return hdr.index(n)
        except: return -1
    i_p = idx('Player')
    i_team = idx('Team')
    cols = {
        'shots': idx('Shots'), 'goals': idx('Goals'),
        'xg': idx('xG (expected goals)'),
        'passes': idx('Passes'),
        'distance_m': idx('Distance, m'),
        'sprints': idx('Number of sprints'),
        'max_speed': idx('Maximum speed, m/s'),
        'metabolic': idx('Average metabolic power, W/kg'),
    }
    def num(v):
        if v in (None, '-'): return 0
        try: return float(v)
        except: return 0
    result = {}
    for r in rows[1:]:
        if not r[i_p]: continue
        if team_filter and i_team >= 0:
            row_team = str(r[i_team] or '')
            if team_filter.lower() not in row_team.lower():
                continue
        name = r[i_p]
        result[name] = {k: num(r[i]) if i >= 0 else 0 for k, i in cols.items()}
    return result

def event_stats(events, team):
    stats = defaultdict(lambda: {
        'passes': 0, 'key_passes': 0, 'recoveries': 0,
        'losses': 0, 'shots': 0, 'goals': 0,
    })
    for e in events:
        if e['team'] != team: continue
        p = e.get('player')
        if not p: continue
        a = (e.get('action') or '').lower()
        if 'pass' in a and 'involvement' not in a:
            if 'key' in a: stats[p]['key_passes'] += 1
            else: stats[p]['passes'] += 1
        elif 'ball recover' in a: stats[p]['recoveries'] += 1
        elif 'ball loss' in a: stats[p]['losses'] += 1
    return dict(stats)

def normalize(stats, keys):
    """Her boyut için 0-100 (maç içi ortalama × 2 = 100)."""
    out = {}
    for player, st in stats.items():
        r = {}
        for k in keys:
            v = st.get(k, 0)
            r[k] = min(100, int(v * 20))  # crude scale
        out[player] = r
    return out

def calculate(pl_events, team_name, xlsx_path=None, fitness_json=None):
    ev = event_stats(pl_events, team_name)
    xl = xlsx_stats(xlsx_path, team_filter=team_name) if xlsx_path else {}
    fit = {}
    if fitness_json and os.path.exists(fitness_json):
        with open(fitness_json) as f:
            fit = json.load(f).get('players', {})

    merged = {}
    for p, st in ev.items():
        m = dict(st)
        if p in xl: m.update(xl[p])
        if p in fit: m.update(fit[p])
        merged[p] = m
    for p, st in xl.items():
        if p not in merged:
            merged[p] = dict(st)
    for p, st in fit.items():
        if p not in merged:
            merged[p] = dict(st)

    keys = ['passes', 'key_passes', 'recoveries', 'losses', 'shots', 'goals',
            'xg', 'distance_m', 'sprints', 'max_speed']
    for p in merged:
        for k in keys:
            merged[p].setdefault(k, 0)

    return {
        'team': team_name,
        'players': merged,
        'epistemic': 'TÜREV',
        'caveat': 'Radar PL events + XLSX shots/goals/xG. distance_m/sprints için Player fitness XLSX gerekli (henüz yok). Ham sayı, normalize yok.',
    }
