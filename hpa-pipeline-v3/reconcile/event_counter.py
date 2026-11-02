"""CSV olay sayıcı: her action tipini ayrı ayrı, oyuncu ve takım bazında say.

Kök Neden C düzeltmesi: SportsBase'de bir fiziksel olay birden fazla etiket
satırı üretir. Bu modül her etiketi bağımsız sayar — toplama yapmaz.
"""
import re
from collections import defaultdict, Counter


def count_by_action(events):
    """Tüm eventleri action bazında say. {action: count}."""
    return dict(Counter(e.get('action', '') for e in events if e.get('action')))


def count_by_player_action(events):
    """Oyuncu × action matrisi. {player: {action: count}}."""
    result = defaultdict(lambda: defaultdict(int))
    for e in events:
        player = e.get('player')
        action = e.get('action', '').strip()
        if player and action:
            result[player][action] += 1
    return {p: dict(acts) for p, acts in result.items()}


def count_by_team_action(events):
    """Takım × action matrisi. {team: {action: count}}."""
    result = defaultdict(lambda: defaultdict(int))
    for e in events:
        team = e.get('team')
        action = e.get('action', '').strip()
        if team and action:
            result[team][action] += 1
    return {t: dict(acts) for t, acts in result.items()}


# CSV action → XLSX sütun eşleştirme tablosu
# Aynı fiziksel olay birden fazla CSV satırı üretir (etiket örtüşmesi).
# Bu tablo, her CSV action etiketini tek bir XLSX sütunuyla eşler.
ACTION_TO_XLSX_COLUMN = {
    # --- Paslar ---
    'Passes accurate': 'Passes accurate',
    'Inaccurate passes': 'Inaccurate passes',
    'Progressive passes accurate': 'Progressive passes accurate',
    'Incomplete progressive passes': 'Incomplete progressive passes',
    'Passes forward accurate': 'Passes forward accurate',
    'Incomplete passes forward': 'Incomplete passes forward',
    'Passes into the penalty box accurate': 'Passes into the penalty box accurate',
    'Incomplete passes into the box': 'Incomplete passes into the box',
    'Key passes accurate': 'Key passes accurate',
    'Incomplete key passes': 'Incomplete key passes',
    'Long passes': 'Long passes',
    'Incomplete long passes': 'Incomplete long passes',
    'Crosses accurate': 'Crosses accurate',
    'Crosses inaccurate': 'Crosses inaccurate',
    # --- Şutlar ---
    'Goals': 'Goals',
    'Own goals': 'Own goals',
    'Shots on target': 'Shots on target',
    'Shots off target': 'Shots off target',
    'Shots blocked': 'Shots blocked',
    'Shots on post / bar': 'Shots on post / bar',
    'Free-kick shots': 'Free-kick shots',
    'Penalty shots': 'Penalty shots',
    # --- İkili Mücadele ---
    'Challenges won': 'Challenges won',
    'Challenges unsuccessful': 'Challenges unsuccessful',
    'Aerial challenges won': 'Aerial challenges won',
    'Aerial challenges lost': 'Aerial challenges lost',
    'Tackles successful': 'Tackles successful',
    'Tackles unsuccessful': 'Tackles unsuccessful',
    # --- Dribling ---
    'Dribbles successful': 'Dribbles successful',
    'Dribbles unsuccessful': 'Dribbles unsuccessful',
    # --- Top Kazanımı / Kaybı ---
    'Ball recoveries': 'Ball recoveries',
    "Ball recoveries in opponent's half": "Ball recoveries in opponent's half",
    'Ball losses': 'Ball losses',
    'Ball losses in own half': 'Ball losses in own half',
    # --- Fauller ---
    'Fouls': 'Fouls',
    'Fouls suffered': 'Fouls suffered',
    'YC': 'Yellow cards',
    'RC': 'Red cards',
    # --- Diğer ---
    'Assists': 'Assists',
    'Carry': 'Carry',
    'Clearances': 'Clearances',
    'Chances': 'Chances',
    'Chances created': 'Chances created',
    'Bad ball control': 'Bad ball control',
    'Offsides': 'Offsides',
    'Mistakes leading to goals': 'Mistakes leading to goals',
    'Mistakes leading to chances': 'Mistakes leading to chances',
}

# Ters tablo: XLSX sütun → CSV action
XLSX_COLUMN_TO_ACTION = {v: k for k, v in ACTION_TO_XLSX_COLUMN.items()}


def reconcile_player(csv_player_counts, xlsx_player_stats):
    """Tek oyuncu: CSV sayımları vs XLSX toplamları. Uyuşmazlıkları raporla.

    csv_player_counts: {action: count}
    xlsx_player_stats: {column: value|None}

    Döndürür: list of {metric, csv_count, xlsx_value, delta, status}
    """
    findings = []
    for action, xlsx_col in ACTION_TO_XLSX_COLUMN.items():
        csv_count = csv_player_counts.get(action, 0)
        xlsx_val = xlsx_player_stats.get(xlsx_col)

        if xlsx_val is None:
            xlsx_num = None
        elif isinstance(xlsx_val, (int, float)):
            xlsx_num = int(xlsx_val)
        else:
            xlsx_num = None

        if xlsx_num is None and csv_count == 0:
            status = 'MATCH_ZERO'
        elif xlsx_num is None and csv_count > 0:
            status = 'XLSX_MISSING'
        elif xlsx_num is not None and csv_count == xlsx_num:
            status = 'MATCH'
        else:
            status = 'MISMATCH'

        delta = None
        if xlsx_num is not None:
            delta = csv_count - xlsx_num

        findings.append({
            'metric': action,
            'xlsx_column': xlsx_col,
            'csv_count': csv_count,
            'xlsx_value': xlsx_num,
            'delta': delta,
            'status': status,
        })
    return findings


def reconcile_team(csv_team_counts, xlsx_team_stats):
    """Tek takım: CSV sayımları vs XLSX toplamları."""
    return reconcile_player(csv_team_counts, xlsx_team_stats)
