"""PPDA + yüksek pres + karşı pres v3 · PL events only"""
from collections import defaultdict

def calculate(events, team_name):
    events = sorted(events, key=lambda e: (e.get('half', 1), e.get('start', 0)))
    opp_passes = 0
    our_def_actions = 0
    high_press_wins = 0
    counter_attempts = 0
    counter_wins = 0
    last_loss_time = -99.0
    half_opp_passes = {1: 0, 2: 0}
    half_def_actions = {1: 0, 2: 0}
    positions = []

    for ev in events:
        team = ev['team']
        our = (team == team_name)
        action = (ev.get('action') or '').lower()
        half = ev.get('half', 1)
        start = ev.get('start', 0)
        x = ev.get('x')
        if x is None: continue
        if not our: x = 105 - x  # flip away
        is_pass = 'pass' in action and 'involvement' not in action
        is_def = any(k in action for k in ['tackle', 'interception', 'challenge', 'ball recover'])
        is_loss = 'ball loss' in action

        if not our and is_pass:
            opp_passes += 1
            half_opp_passes[half] += 1
        if our and is_def:
            our_def_actions += 1
            half_def_actions[half] += 1
            if x >= 52.5:
                high_press_wins += 1
                positions.append({'x': round(x,1), 'y': round(ev.get('y', 34),1), 't': round(start,1)})
        if our and is_loss:
            last_loss_time = start
        if our and 'ball recover' in action and (start - last_loss_time) <= 5.0:
            counter_attempts += 1
            counter_wins += 1

    ppda = round(opp_passes / our_def_actions, 2) if our_def_actions > 0 else None
    ppda_1h = round(half_opp_passes[1] / half_def_actions[1], 2) if half_def_actions[1] > 0 else None
    ppda_2h = round(half_opp_passes[2] / half_def_actions[2], 2) if half_def_actions[2] > 0 else None

    return {
        'team': team_name,
        'ppda': ppda, 'ppda_1h': ppda_1h, 'ppda_2h': ppda_2h,
        'opp_passes': opp_passes,
        'our_def_actions': our_def_actions,
        'high_press_wins': high_press_wins,
        'counter_press_attempts': counter_attempts,
        'counter_press_wins': counter_wins,
        'press_positions': positions[:50],
        'epistemic': 'TÜREV',
        'caveat': 'Yüksek pres = kendi hücum yönünde x>52.5 kazanım. Karşı pres 5s penceresi.',
    }
