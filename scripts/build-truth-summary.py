"""XLSX ground truth + CSV event birleşimi. summary()'nin doğru versiyonu."""
import openpyxl, csv
from pathlib import Path
from collections import Counter

def xlsx_summary(xlsx_path):
    """XLSX'ten temel metrikler. Şut toplamı = on target + off target + post + blocked."""
    wb = openpyxl.load_workbook(xlsx_path, read_only=True, data_only=True)
    ws = None
    for name in wb.sheetnames:
        if 'Oyuncu' in name or 'Main' in name or 'Player' in name:
            ws = wb[name]; break
    if not ws: ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    hdr = [str(c or '') for c in rows[0]]

    def col_sum(col_name):
        if col_name not in hdr: return {}
        i = hdr.index(col_name)
        tt = {}
        for row in rows[1:]:
            if not row or not row[1]: continue
            try: v = float(row[i] or 0)
            except: v = 0
            team = str(row[2] or '')
            tt[team] = tt.get(team, 0) + int(v)
        return tt

    passes = col_sum('Passes')
    passes_ok = col_sum('Passes accurate')
    goals = col_sum('Goals')
    assists = col_sum('Assists')

    # Şut: on + off + post + blocked (blocked XLSX'te yoksa CSV TM'den)
    on = col_sum('Shots on target')
    off = col_sum('Shots off target')
    post = col_sum('Shots on post / bar')
    blocked = col_sum('Shots blocked')
    shots_total = {}
    for team in set(list(on.keys()) + list(off.keys()) + list(post.keys()) + list(blocked.keys())):
        shots_total[team] = on.get(team, 0) + off.get(team, 0) + post.get(team, 0) + blocked.get(team, 0)

    wb.close()
    return {
        'passes': {'total': sum(passes.values()), 'by_team': passes,
                   'accurate_total': sum(passes_ok.values()), 'accurate_by_team': passes_ok},
        'goals': {'total': sum(goals.values()), 'by_team': goals},
        'assists': {'total': sum(assists.values()), 'by_team': assists},
        'shots': {'total': sum(shots_total.values()), 'by_team': shots_total,
                  'breakdown': {'on_target': on, 'off_target': off, 'post_bar': post, 'blocked': blocked}},
        '_source': 'XLSX (ground truth)',
    }

if __name__ == '__main__':
    import sys, json
    print(json.dumps(xlsx_summary(sys.argv[1]), indent=2, ensure_ascii=False))
