"""
CSV Loader v3 · PL + TM + GK birleşik
Doğru dedup: PL ana, TM fallback, GK ayrı.
"""
import csv, re
from pathlib import Path
from collections import defaultdict

SHOT_LABELS = {
    'Goals', 'Shots on target', 'Shots off target',
    'Shots on post / bar', 'Penalty shots', 'Shots blocked',
    'Free-kick shots',
}

# GK'da şut olarak sayılmaz (rakip şutu)
GK_SHOT_EXCLUDE = {'opponent', 'goals conceded'}

def parse_player(code):
    m = re.search(r'(\d+)\.\s+(.+?)\s+\((\d+)\)', code or '')
    return (m.group(2), m.group(3)) if m else (None, None)

def team_from_code(code, team_col_value=None):
    """Team sütunu varsa onu, yoksa code'dan parse et."""
    if team_col_value:
        return team_col_value.split(' (')[0].strip()
    m = re.match(r'^(.+?)\s*\(\d+\)\s*-\s*', code or '')
    return m.group(1).strip() if m else None

def load_csv(path):
    with open(path, encoding='utf-8', errors='ignore') as f:
        rows = list(csv.DictReader(f, delimiter=';'))
    return rows

def normalize_event(row, source):
    """Bir CSV satırını standart event dict'e dönüştür."""
    try:
        x_raw = row.get('pos_x')
        y_raw = row.get('pos_y')
        x = float(x_raw) if x_raw and x_raw not in ('-', '') else None
        y = float(y_raw) if y_raw and y_raw not in ('-', '') else None
    except (ValueError, TypeError):
        x = y = None

    code = row.get('code') or ''
    player, pid = parse_player(code)
    team = team_from_code(code, row.get('team'))

    return {
        'id': row.get('ID'),
        'start': float(row.get('start') or 0),
        'end': float(row.get('end') or 0),
        'half': int(row.get('half') or 1),
        'team': team,
        'action': (row.get('action') or '').strip(),
        'player': player,
        'pid': pid,
        'code': code,
        'x': x,
        'y': y,
        'source': source,
    }

def load_match(csv_dir):
    """Bir maçın 3 CSV'sini birleşik yükle."""
    csv_dir = Path(csv_dir)
    files = {
        'PL': csv_dir / 'lille-csv-2.csv',
        'GK': csv_dir / 'lille-csv-1.csv',
        'TM': csv_dir / 'lille-csv-3.csv',
    }
    # veya gerçek path'ler
    import glob
    if not files['PL'].exists():
        for pat, key in [('*Full match*.csv', 'PL'), ('*GOALKEEPERS.csv', 'GK'), ('*TEAMS.csv', 'TM')]:
            found = list(csv_dir.glob(pat))
            if found and 'Full match' in found[0].name:
                files[key] = found[0]

    events = defaultdict(list)
    for src, path in files.items():
        if not path.exists():
            continue
        for row in load_csv(path):
            ev = normalize_event(row, src)
            if ev['x'] is not None and ev['team']:
                events[src].append(ev)

    return events

def dedup_shots(events):
    """Şutları doğru dedup et. TM veya PL kullan, GK'dakileri sayma."""
    candidates = []
    for src in ('PL', 'TM'):
        for e in events.get(src, []):
            if e['action'] not in SHOT_LABELS:
                continue
            candidates.append(e)

    # Aynı oyuncu + aynı start = aynı şut
    grouped = defaultdict(list)
    for e in candidates:
        key = (e['pid'] or e['code'], round(e['start'], 2))
        grouped[key].append(e)

    prio = {'Goals': 0, 'Shots on target': 1, 'Penalty shots': 1,
            'Shots on post / bar': 2, 'Free-kick shots': 2,
            'Shots off target': 3, 'Shots blocked': 4}

    deduped = []
    for group in grouped.values():
        # PL'yi tercih et, TM'yi değil (PL'de player var)
        best = sorted(group, key=lambda e: (
            prio.get(e['action'], 9),
            0 if e['source'] == 'PL' else 1,
        ))[0]
        deduped.append(best)

    return deduped

def team_split(events, key_fn=None):
    """Events'i takımlara göre ayır."""
    split = defaultdict(list)
    for e in events:
        team = key_fn(e) if key_fn else e['team']
        if team:
            split[team].append(e)
    return dict(split)
