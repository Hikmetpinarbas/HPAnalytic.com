"""PPDA + yüksek pres + karşı pres · HPAnalytic v1"""
import csv, json
from pathlib import Path

def load_csv(path):
    with open(path, encoding='utf-8', errors='ignore') as f:
        return list(csv.DictReader(f, delimiter=';'))

def calculate(csv_path, team_name):
    events = load_csv(csv_path)
    try:
        events = sorted(events, key=lambda e: float(e.get('start') or 0))
    except: pass

    opp_passes = 0
    our_def_actions = 0
    high_press_wins = 0
    counter_press_attempts = 0
    counter_press_wins = 0
    press_positions = []

    last_loss_time = -10.0
    half_opp_passes = {1: 0, 2: 0}
    half_def_actions = {1: 0, 2: 0}

    for ev in events:
        try:
            s = float(ev.get('start') or 0)
            act = (ev.get('action') or '').lower()
            team = ev.get('team') or ''
            x_raw = ev.get('pos_x')
            half = int(ev.get('half') or 1)
            if not x_raw or x_raw in ('-',''): continue
            x = float(x_raw)
            our = team_name.lower() in team.lower()

            if not our:
                # Rakip pas
                if 'pass' in act and 'involvement' not in act: 
                    opp_passes += 1
                    half_opp_passes[half] += 1
            else:
                # Bizim defansif aksiyon
                if any(k in act for k in ['tackle', 'interception', 'challenge', 'ball recover']):
                    our_def_actions += 1
                    half_def_actions[half] += 1
                    # Yüksek pres = rakip yarıda kazanım (x > 52.5 kendi yönümüzde)
                    if x >= 52.5:
                        high_press_wins += 1
                        press_positions.append({'x': round(x,1), 'y': round(float(ev.get('pos_y') or 34),1), 't': round(s,1)})

                # Karşı pres: top kaybından sonra 5s içinde geri kazanım
                if 'ball loss' in act:
                    last_loss_time = s
                elif 'ball recover' in act and (s - last_loss_time) <= 5.0:
                    counter_press_attempts += 1
                    # Aynı zaman penceresinde kazandıysak başarı
                    if (s - last_loss_time) <= 5.0:
                        counter_press_wins += 1
        except: continue

    ppda = round(opp_passes / our_def_actions, 2) if our_def_actions > 0 else None
    ppda_1h = round(half_opp_passes[1] / half_def_actions[1], 2) if half_def_actions[1] > 0 else None
    ppda_2h = round(half_opp_passes[2] / half_def_actions[2], 2) if half_def_actions[2] > 0 else None
    counter_rate = round(counter_press_wins / counter_press_attempts, 3) if counter_press_attempts > 0 else 0.0

    return {
        'team': team_name,
        'ppda': ppda,
        'ppda_1h': ppda_1h,
        'ppda_2h': ppda_2h,
        'opp_passes': opp_passes,
        'our_def_actions': our_def_actions,
        'high_press_wins': high_press_wins,
        'counter_press_attempts': counter_press_attempts,
        'counter_press_wins': counter_press_wins,
        'counter_press_rate': counter_rate,
        'press_positions': press_positions[:50],  # frontend için ilk 50
        'epistemic': 'TÜREV',
        'caveat': 'PPDA standart tanımdır (rakip pas / defansif aksiyon). Karşı pres 5s penceresiyle sınırlıdır. Yüksek pres eşiği x>52.5 (kendi hücum yönünde).'
    }

if __name__ == '__main__':
    import sys
    csv_path = sys.argv[1]
    team = sys.argv[2] if len(sys.argv) > 2 else 'Galatasaray'
    print(json.dumps(calculate(csv_path, team), indent=2, ensure_ascii=False))
