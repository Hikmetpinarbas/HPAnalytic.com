"""8 boyutlu oyuncu radar · HPAnalytic v1"""
import csv, json
from pathlib import Path
from collections import defaultdict

def load_csv(path):
    with open(path, encoding='utf-8', errors='ignore') as f:
        return list(csv.DictReader(f, delimiter=';'))

def player_stats(events, team_name):
    """Event data'dan oyuncu bazlı metrikler."""
    stats = defaultdict(lambda: {
        'passes': 0, 'key_passes': 0, 'recoveries': 0,
        'losses': 0, 'shots': 0, 'goals': 0
    })

    for ev in events:
        team = ev.get('team') or ''
        if team_name.lower() not in team.lower(): continue

        code = ev.get('code') or ''
        if ' - ' not in code: continue
        p = code.split(' - ')[0].strip()
        if '. ' in p: p = p.split('. ', 1)[1]
        if not p or p == 'Unknown': continue

        act = (ev.get('action') or '').lower()
        if 'passes accurate' in act: stats[p]['passes'] += 1
        elif 'ball recover' in act: stats[p]['recoveries'] += 1
        elif 'ball loss' in act: stats[p]['losses'] += 1
        elif act == 'goals': stats[p]['goals'] += 1
        elif 'shot' in act: stats[p]['shots'] += 1

    return dict(stats)

def normalize_to_league(player_stats, league_avg):
    """Her boyut için lig ortalamasına göre 0-100."""
    result = {}
    keys = ['passes', 'recoveries', 'losses', 'shots', 'goals']
    for player, st in player_stats.items():
        r = {}
        for k in keys:
            avg = league_avg.get(k, 1) or 1
            r[k] = min(100, round((st.get(k, 0) / avg) * 50, 0))
        result[player] = r
    return result

def calculate(csv_path, team_name, fitness_json_path=None):
    """Ana fonksiyon: event + fitness birleşik radar."""
    events = load_csv(csv_path)
    pstats = player_stats(events, team_name)

    # Lig ortalaması: elimizde lig verisi yoksa maçın kendi ortalaması
    n = max(1, len(pstats))
    league_avg = {
        'passes': sum(s['passes'] for s in pstats.values()) / n,
        'recoveries': sum(s['recoveries'] for s in pstats.values()) / n,
        'losses': sum(s['losses'] for s in pstats.values()) / n,
        'shots': sum(s['shots'] for s in pstats.values()) / n,
        'goals': sum(s['goals'] for s in pstats.values()) / n,
    }

    normalized = normalize_to_league(pstats, league_avg)

    # Fitness birleşimi
    fitness = {}
    if fitness_json_path and Path(fitness_json_path).exists():
        try:
            with open(fitness_json_path) as f:
                m = json.load(f)
            for row in m:
                if row.get('Team') == 'GAL':
                    name = row.get('Player', '')
                    fitness[name] = {
                        'distance_km': round((row.get('Distance, m') or 0) / 1000, 1),
                        'sprint_m': row.get('Sprint distance (> 7 m/s), m') or 0,
                        'max_speed': row.get('Maximum speed, m/s') or 0,
                        'metabolic': row.get('Average metabolic power, W/kg') or 0,
                    }
        except: pass

    # Birleştir
    for player, r in normalized.items():
        if player in fitness:
            r.update(fitness[player])
            r['has_fitness'] = True
        else:
            r['has_fitness'] = False

    return {
        'team': team_name,
        'players': normalized,
        'league_avg': league_avg,
        'epistemic': 'TÜREV',
        'caveat': 'Radar maç içi event data + sezonluk fitness birleşimidir. Lig ortalaması maçın kendi ortalamasıdır, gerçek lig ortalaması değil.'
    }

if __name__ == '__main__':
    import sys
    csv_path = sys.argv[1]
    team = sys.argv[2] if len(sys.argv) > 2 else 'Galatasaray'
    print(json.dumps(calculate(csv_path, team), indent=2, ensure_ascii=False))
