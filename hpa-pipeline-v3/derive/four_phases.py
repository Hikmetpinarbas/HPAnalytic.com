"""5 faz enerji bütçesi v3 · PL events only · VEKİL etiketli"""
from collections import defaultdict

PHASES = ['build_up', 'transition_attack', 'set_attack', 'set_defense', 'transition_defense']
LABEL = {
    'build_up': 'Yerleşik Hücum (kendi yarı)',
    'transition_attack': 'Geçiş Hücumu',
    'set_attack': 'Yerleşik Hücum (rakip yarı)',
    'set_defense': 'Yerleşik Savunma',
    'transition_defense': 'Geçiş Savunması',
}

def calculate(events, team_name, flip_away=True):
    """events: PL list (her biri start, team, action, x, y, player)"""
    events = sorted(events, key=lambda e: (e.get('half', 1), e.get('start', 0)))
    buckets = {p: {'actions': 0, 'duration': 0.0, 'players': defaultdict(int)} for p in PHASES}
    last_recov = {team_name: -99.0}
    last_loss = {team_name: -99.0}
    total = 0.0

    for ev in events:
        team = ev['team']
        our = (team == team_name)
        x = ev.get('x')
        if x is None: continue
        # Flip away: rakip koordinatı bizim yönümüze çevir
        if not our and flip_away:
            x = 105 - x

        start = ev.get('start', 0)
        end = ev.get('end', start)
        dur = min(max(0.0, end - start), 60.0)
        action = (ev.get('action') or '').lower()

        if our:
            if 'ball recover' in action:
                last_recov[team_name] = start
            elif 'ball loss' in action:
                last_loss[team_name] = start
        else:
            if 'ball recover' in action:
                last_recov[team] = start
            elif 'ball loss' in action:
                last_loss[team] = start

        since_recov = start - last_recov.get(team, -99)
        since_loss = start - last_loss.get(team, -99)

        if our:
            if since_recov <= 8.0 and x >= 52.5:
                phase = 'transition_attack'
            elif x < 52.5:
                phase = 'build_up'
            else:
                phase = 'set_attack'
        else:
            if since_loss <= 8.0 and x <= 52.5:
                phase = 'transition_defense'
            else:
                phase = 'set_defense'

        buckets[phase]['actions'] += 1
        buckets[phase]['duration'] += dur
        total += dur
        player = ev.get('player')
        if player:
            buckets[phase]['players'][player] += 1

    out = {}
    for p in PHASES:
        b = buckets[p]
        top = sorted(b['players'].items(), key=lambda kv: -kv[1])[:5]
        out[p] = {
            'label': LABEL[p],
            'actions': b['actions'],
            'duration': round(b['duration'], 1),
            'energy_pct': round((b['duration'] / total) * 100, 1) if total > 0 else 0.0,
            'top_players': top,
        }
    return {
        'team': team_name,
        'total_active_seconds': round(total, 1),
        'phases': out,
        'epistemic': 'VEKİL',
        'caveat': 'Enerji %, fazdaki süre oranıdır. Gerçek mesafe dağılımı için tracking data gerekir.',
    }
