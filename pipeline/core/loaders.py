import csv
from pathlib import Path
from .model import Event, Match
from .clock import correct_clock

KIND_MAP = {
    'Goals': 'goal', 'Own goals': 'goal',
    'Shots on target': 'shot', 'Shots off target': 'shot',
    'Shots blocked': 'shot_blocked',
    'Passes accurate': 'pass', 'Inaccurate passes': 'pass_incomplete',
    'Progressive passes accurate': 'pass_prog',
    'Incomplete progressive passes': 'pass_incomplete',
    'Passes forward accurate': 'pass_forward',
    'Passes into the penalty box accurate': 'pass_box',
    'Key passes accurate': 'pass_key', 'Assists': 'assist',
    'Carry': 'carry',
    'Dribbles successful': 'dribble', 'Dribbles unsuccessful': 'dribble_fail',
    'Ball recoveries': 'recovery', "Ball recoveries in opponent's half": 'recovery_opp',
    'Ball losses': 'loss', 'Ball losses in own half': 'loss_own',
    'Challenges won': 'duel_win', 'Challenges unsuccessful': 'duel_loss',
    'Aerial challenges won': 'aerial_win', 'Aerial challenges lost': 'aerial_loss',
    'Tackles successful': 'tackle', 'Tackles unsuccessful': 'tackle_fail',
    'Fouls': 'foul', 'Fouls suffered': 'foul_suffered',
    'YC': 'yellow', 'RC': 'red',
}

def kind_of(action: str) -> str:
    return KIND_MAP.get(action, 'other')

def _num(v):
    try: return float(v)
    except: return None

def load_players_csv(csv_path: Path, match_id: str, home: str, away: str, date: str) -> Match:
    match = Match(id=match_id, home=home, away=away, date=date)
    next_id = 1
    seen_players = {}

    with open(csv_path, encoding='utf-8') as f:
        for row in csv.DictReader(f, delimiter=';'):
            t_raw = _num(row['start']) or 0
            half = int(row['half']) if row['half'] in ('1','2') else 1
            t = correct_clock(t_raw, half)

            pname, pid, pnum = None, None, None
            code = row.get('code', '')
            if ' - ' in code:
                pre = code.split(' - ', 1)[0].strip()
                if '(' in pre and ')' in pre:
                    pid = pre.split('(')[-1].rstrip(')')
                    name_part = pre.split('(')[0].strip()
                    if '. ' in name_part:
                        try:
                            pnum = int(name_part.split('. ', 1)[0])
                            pname = name_part.split('. ', 1)[1]
                        except: pname = name_part
                    else:
                        pname = name_part

            team_full = row.get('team', '')
            team_id = team_full.split('(')[-1].rstrip(')') if '(' in team_full else team_full
            team_name = team_full.split('(')[0].strip()

            ev = Event(
                id=next_id, t=t, t_raw=t_raw, half=half,
                team_id=team_id, team_name=team_name,
                player_id=pid, player_name=pname,
                action=row.get('action', ''),
                kind=kind_of(row.get('action', '')),
                x=_num(row.get('pos_x')), y=_num(row.get('pos_y')),
            )
            match.events.append(ev)
            next_id += 1

    match.metadata = {
        'event_count': len(match.events),
        'goals': len(match.goals()),
        'shots': len(match.shots()),
    }
    return match
