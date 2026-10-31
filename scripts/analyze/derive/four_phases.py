"""4 faz enerji bütçesi · HPAnalytic v1"""
import csv, json
from pathlib import Path

PHASES = ['build_up', 'transition_attack', 'set_attack', 'set_defense', 'transition_defense']
PHASE_LABEL = {
    'build_up': 'Yerleşik Hücum (kendi yarı)',
    'transition_attack': 'Geçiş Hücumu',
    'set_attack': 'Yerleşik Hücum (rakip yarı)',
    'set_defense': 'Yerleşik Savunma',
    'transition_defense': 'Geçiş Savunması',
}

def load_csv(path):
    with open(path, encoding='utf-8', errors='ignore') as f:
        return list(csv.DictReader(f, delimiter=';'))

def phase_of(x, our, since_recovery, since_loss):
    if our:
        if since_recovery <= 8.0 and x >= 52.5: return 'transition_attack'
        if x < 52.5: return 'build_up'
        return 'set_attack'
    if since_loss <= 8.0 and x <= 52.5: return 'transition_defense'
    return 'set_defense'

def calculate(events, team_name):
    """5 faz, VEKİL etiketli (zaman bazlı)."""
    try:
        events = sorted(events, key=lambda e: float(e.get('start') or 0))
    except: pass

    buckets = {p: {'actions': 0, 'duration': 0.0, 'players': {}} for p in PHASES}
    last_rec = -10.0
    last_loss = -10.0
    total = 0.0

    for ev in events:
        try:
            s = float(ev.get('start') or 0)
            e = float(ev.get('end') or s)
            dur = min(max(0.0, e - s), 60.0)
            act = (ev.get('action') or '').lower()
            team = ev.get('team') or ''
            x_raw = ev.get('pos_x')
            if not x_raw or x_raw in ('-',''): continue
            x = float(x_raw)

            our = team_name.lower() in team.lower()
            if not our and team: x = 105 - x

            # Oyuncu
            code = ev.get('code') or ''
            player = 'Unknown'
            if ' - ' in code:
                p = code.split(' - ')[0].strip()
                if '. ' in p: p = p.split('. ', 1)[1]
                player = p

            # Timestamps
            if 'ball recover' in act and our: last_rec = s
            elif 'ball loss' in act and our: last_loss = s

            ph = phase_of(x, our, s - last_rec, s - last_loss)
            buckets[ph]['actions'] += 1
            buckets[ph]['duration'] += dur
            total += dur
            if player != 'Unknown':
                buckets[ph]['players'][player] = buckets[ph]['players'].get(player, 0) + 1
        except: continue

    for p in PHASES:
        b = buckets[p]
        b['label'] = PHASE_LABEL[p]
        b['energy_pct'] = round((b['duration'] / total) * 100, 1) if total > 0 else 0.0
        b['epistemic'] = 'VEKİL'
        b['note'] = 'Enerji %, fazdaki süre oranıdır. Mesafe dağılımı değil.'
        b['top_players'] = sorted(b['players'].items(), key=lambda kv: -kv[1])[:5]

    return {
        'team': team_name,
        'total_active_seconds': round(total, 1),
        'phases': {p: buckets[p] for p in PHASES},
        'epistemic': 'VEKİL',
        'caveat': 'Bu bir zaman-vekilidir. Gerçek enerji dağılımı için tracking data veya sprint mesafesi gerekir.'
    }

if __name__ == '__main__':
    import sys
    csv_path = sys.argv[1] if len(sys.argv) > 1 else ''
    if not csv_path or not Path(csv_path).exists():
        print('Kullanım: python3 four_phases.py <csv> [team]')
        sys.exit(1)
    team = sys.argv[2] if len(sys.argv) > 2 else 'Galatasaray'
    events = load_csv(csv_path)
    result = calculate(events, team)
    print(json.dumps(result, indent=2, ensure_ascii=False))
