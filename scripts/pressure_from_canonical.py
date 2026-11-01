"""V4 canonical event'ten pressure hesapla. V3 bağımlılığı yok."""
import json, sys
from pathlib import Path

V4_DIR = Path('/sdcard/HPAnalytic/data/output/packages_v4')

def calculate_pressure(canon_events, team_name):
    """CSV PL event'lerinden PPDA, high press wins, counter press.
       Opponent pas = rakip Passes accurate + Inaccurate passes (denenen).
       Bizim defansif aksiyon = tackle/interception/challenge/ball recover.
       High press = kendi yarısında (x>52.5 flip sonrası) defansif aksiyon."""
    opp_passes = 0
    our_def = 0
    high_press = 0
    counter_press = 0
    last_loss = -99
    half_opp = {1: 0, 2: 0}
    half_def = {1: 0, 2: 0}

    for ev in canon_events:
        team = (ev.get('team') or '').lower()
        our = team_name.lower() in team
        action = (ev.get('action') or '').lower()
        x = ev.get('x')
        half = int(ev.get('half') or 1)
        start = float(ev.get('start') or 0)

        if x is None: continue
        # Rakip perspektifinden x (sahayı bizim kalemize göre çevir)
        if not our: x = 105 - x

        is_pass = action in ['passes accurate', 'inaccurate passes']
        is_def = any(k in action for k in ['tackle', 'interception', 'challenge', 'ball recover'])
        is_loss = 'ball loss' in action

        if not our and is_pass:
            opp_passes += 1
            half_opp[half] += 1

        if our and is_def:
            our_def += 1
            half_def[half] += 1
            if x >= 52.5:
                high_press += 1

        if our and is_loss:
            last_loss = start

        if our and 'ball recover' in action and (start - last_loss) <= 5:
            counter_press += 1

    ppda = round(opp_passes / our_def, 2) if our_def > 0 else None
    ppda_1h = round(half_opp[1] / half_def[1], 2) if half_def[1] > 0 else None
    ppda_2h = round(half_opp[2] / half_def[2], 2) if half_def[2] > 0 else None

    return {
        'team': team_name,
        'ppda': ppda,
        'ppda_1h': ppda_1h,
        'ppda_2h': ppda_2h,
        'opp_passes': opp_passes,
        'our_def_actions': our_def,
        'high_press_wins': high_press,
        'counter_press_wins': counter_press,
        'epistemic': 'TÜREV',
        'method': 'PPDA = rakip pas / bizim defansif aksiyon. High press = x>=52.5 defansif aksiyon.',
    }

SOURCES = {
    'konyaspor-gs-2026-10-30': '/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175305/stats',
    'lille-gs-2026-10-21': '/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175306/stats',
    'gs-fb-2026-10-26': '/sdcard/HPAnalytic/data/raw/sportsbase/match-2026-10/stats',
    'aston-villa-fb-2026-10-14': '/sdcard/HPAnalytic/data/raw/SB_ARCHIVE/matches/2026-10-14_aston-villa_vs_fenerbahce',
}

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Kullanım: python3 pressure_from_canonical.py <v4_id>')
        sys.exit(1)

    v4_id = sys.argv[1]
    v4 = json.loads((V4_DIR / f'{v4_id}_v4.json').read_text(encoding='utf-8'))

    # V4'ün kendi canonical event'lerini yeniden oku
    sys.path.insert(0, '/data/data/com.termux/files/home/hpanalytic-repo')
    from hpa_pipeline_v3.ingest.load import load_match

    events, _ = load_match(SOURCES[v4_id])
    pl = events['PL']

    for team in v4['teams']:
        p = calculate_pressure(pl, team)
        print(f'{team}: PPDA={p["ppda"]} (1H={p["ppda_1h"]}, 2H={p["ppda_2h"]}) | opp_passes={p["opp_passes"]}, our_def={p["our_def_actions"]}, high_press={p["high_press_wins"]}')
