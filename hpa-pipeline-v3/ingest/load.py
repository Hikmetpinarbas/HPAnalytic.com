"""
HPAnalytic v3 · Match loader
Şut dedup kuralı: PL birincil, TM sadece "Shots blocked" ekler (ayrı kategori)
"""
import csv, re
from pathlib import Path
from collections import defaultdict, Counter
from .csv_classifier import classify_csv

PL_SHOT_LABELS = {
    'Goals', 'Shots on target', 'Shots off target',
    'Shots on post / bar', 'Penalty shots', 'Free-kick shots',
}
TM_EXTRA_SHOT = 'Shots blocked'

SHOT_PRIO = {
    'Goals': 0, 'Shots on target': 1, 'Penalty shots': 1,
    'Shots on post / bar': 2, 'Free-kick shots': 2,
    'Shots off target': 3,
}

def parse_player(code):
    m = re.search(r'(\d+)\.\s+(.+?)\s+\((\d+)\)', code or '')
    return (m.group(2), m.group(3)) if m else (None, None)

def team_of(row):
    t = (row.get('team') or '').strip()
    if t: return t.split(' (')[0].strip()
    c = row.get('code') or ''
    m = re.match(r'^(.+?)\s*\(\d+\)\s*-\s*', c)
    return m.group(1).strip() if m else None

def to_event(row, source):
    try:
        x = float(row['pos_x']) if row.get('pos_x') not in (None, '', '-') else None
        y = float(row['pos_y']) if row.get('pos_y') not in (None, '', '-') else None
    except (ValueError, TypeError):
        x = y = None
    player, pid = parse_player(row.get('code', ''))
    return {
        'id': row.get('ID'),
        'start': float(row.get('start') or 0),
        'end': float(row.get('end') or 0),
        'half': int(row.get('half') or 1),
        'team': team_of(row),
        'action': (row.get('action') or '').strip(),
        'player': player,
        'pid': pid,
        'code': row.get('code', ''),
        'x': x, 'y': y,
        'source': source,
    }

def load_match(csv_dir):
    from glob import glob
    events = {'PL': [], 'GK': [], 'TM': []}
    files_used = {}
    for f in sorted(glob(f"{csv_dir}/*.csv")):
        kind, rows = classify_csv(f)
        if not kind: continue
        files_used[kind] = Path(f).name
        for row in rows:
            ev = to_event(row, kind)
            if ev['x'] is not None and ev['team']:
                events[kind].append(ev)
    return events, files_used

def dedup_shots(events):
    """Şutlar: PL dedup + TM'deki blocked (PL'de olmayanlar)."""
    pl_shots = [e for e in events['PL'] if e['action'] in PL_SHOT_LABELS]
    grouped = defaultdict(list)
    for e in pl_shots:
        key = (e['pid'] or e['team'], round(e['start'], 2))
        grouped[key].append(e)
    result = []
    pl_keys = set()
    for key, group in grouped.items():
        best = sorted(group, key=lambda e: SHOT_PRIO.get(e['action'], 9))[0]
        result.append(best)
        pl_keys.add(key)
    # TM'deki blocked şutlar: aynı saniye + aynı takımda PL'de şut yoksa ekle
    pl_team_seconds = {(round(e['start'], 0), e['team']) for e in result}
    for e in events['TM']:
        if e['action'] != TM_EXTRA_SHOT:
            continue
        key = (round(e['start'], 0), e['team'])
        if key not in pl_team_seconds:
            result.append(e)
            pl_team_seconds.add(key)
    return result

def blocked_shots(events):
    """TM'deki bloklanmış şutlar ayrı kategori."""
    return [e for e in events['TM'] if e['action'] == TM_EXTRA_SHOT]

def summary(events):
    shots = dedup_shots(events)
    blocked = blocked_shots(events)
    passes = [e for e in events['PL'] if 'pass' in e['action'].lower()
              and 'involvement' not in e['action'].lower()]
    losses = [e for e in events['PL'] if 'ball loss' in e['action'].lower()]
    recoveries = [e for e in events['PL'] if 'ball recover' in e['action'].lower()]
    goals = [s for s in shots if s['action'] == 'Goals']

    return {
        'shots': {'total': len(shots), 'by_team': dict(Counter(s['team'] for s in shots)),
                  'by_action': dict(Counter(s['action'] for s in shots))},
        'blocked_shots': {'total': len(blocked), 'by_team': dict(Counter(s['team'] for s in blocked))},
        'goals': {'total': len(goals), 'by_team': dict(Counter(s['team'] for s in goals))},
        'passes': {'total': len(passes), 'by_team': dict(Counter(p['team'] for p in passes))},
        'losses': {'total': len(losses)},
        'recoveries': {'total': len(recoveries)},
    }
