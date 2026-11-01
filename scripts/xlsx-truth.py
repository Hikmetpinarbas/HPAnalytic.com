"""XLSX'ten temel metrikleri çek — ground truth."""
import openpyxl
from pathlib import Path

COLS = {
    'passes_attempted': 'Passes',
    'passes_accurate': 'Passes accurate',
    'goals': 'Goals',
    'assists': 'Assists',
    'shots_on_target': 'Shots on target',
    'shots_off_target': 'Shots off target',
    'shots_post_bar': 'Shots on post / bar',
    'dribbles_successful': 'Successful dribbles',
}

def extract(xlsx_path):
    wb = openpyxl.load_workbook(xlsx_path, read_only=True, data_only=True)
    # Oyuncular sayfasını bul (Konya: "Main statistics", AV: "Oyuncuların verileri")
    ws = None
    for name in wb.sheetnames:
        if 'Oyuncu' in name or 'Main' in name or 'Player' in name:
            ws = wb[name]
            break
    if not ws:
        ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    hdr = [str(c or '') for c in rows[0]]

    out = {}
    for key, col in COLS.items():
        if col not in hdr:
            out[key] = None
            continue
        i = hdr.index(col)
        tt = {}
        for row in rows[1:]:
            if not row or not row[1]: continue
            try: v = float(row[i] or 0)
            except: v = 0
            team = str(row[2] or '')
            tt[team] = tt.get(team, 0) + int(v)
        out[key] = tt
    wb.close()
    return out

if __name__ == '__main__':
    import sys, json
    if len(sys.argv) < 2:
        print('Kullanım: python3 xlsx-truth.py <xlsx_path>')
        sys.exit(1)
    print(json.dumps(extract(sys.argv[1]), indent=2, ensure_ascii=False))
