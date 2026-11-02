"""XLSX okuyucu: "-" ayrımı korunarak oyuncu/takım toplamları çıkar."""
import openpyxl
from pathlib import Path
from collections import defaultdict


def _parse_value(v):
    """XLSX hücre değeri: "-" → None, boş → None, sayı → float, string → try float."""
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).strip()
    if s in ('-', ''):
        return None
    try:
        return float(s)
    except ValueError:
        return s


def read_xlsx_players(path, sheet_name=None):
    """XLSX PLAYERS dosyasını oku. {player_name: {metric: value|None}} döndür."""
    wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
    ws = wb[sheet_name] if sheet_name else wb.active
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return {}
    headers = [str(h or '').strip() for h in rows[0]]

    def idx(name):
        try:
            return headers.index(name)
        except ValueError:
            return -1

    i_player = idx('Player')
    i_team = idx('Team')
    if i_player < 0:
        return {}

    result = {}
    for row in rows[1:]:
        if not row[i_player]:
            continue
        name = str(row[i_player]).strip()
        team = str(row[i_team]).strip() if i_team >= 0 and row[i_team] else None
        d = {}
        for ci, h in enumerate(headers):
            if ci in (i_player, i_team):
                continue
            d[h] = _parse_value(row[ci])
        d['_team'] = team
        result[name] = d
    wb.close()
    return result


def read_xlsx_goalkeepers(path, sheet_name=None):
    """XLSX GOALKEEPERS dosyasını oku. Aynı format."""
    return read_xlsx_players(path, sheet_name)


def read_xlsx_matches(path, sheet_name=None):
    """XLSX MATCHES dosyasını oku. {team_code: {metric: value|None}} döndür."""
    wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
    ws = wb[sheet_name] if sheet_name else wb.active
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return {}
    headers = [str(h or '').strip() for h in rows[0]]

    def idx(name):
        try:
            return headers.index(name)
        except ValueError:
            return -1

    i_team = idx('Team')
    if i_team < 0:
        return {}

    result = {}
    for row in rows[1:]:
        if not row[i_team]:
            continue
        team = str(row[i_team]).strip()
        d = {}
        for ci, h in enumerate(headers):
            if ci == i_team:
                continue
            d[h] = _parse_value(row[ci])
        result[team] = d
    wb.close()
    return result
