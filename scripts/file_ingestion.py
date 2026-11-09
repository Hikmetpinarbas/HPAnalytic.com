"""
GÜVENLİ File Ingestion - v2
- Sadece _inbox tarar (Downloads'a dokunmaz)
- Tarih dosya adından veya klasör adından çıkar (mtime KULLANILMAZ)
- Hedef klasör varsa üzerine yazmaz
- Tarih/takım bulunamazsa quarantine'e atar
"""
import os, re, csv, shutil
from pathlib import Path

INBOX = "/storage/emulated/0/HPAnaliz/SportsBase/_inbox"
MACLAR = "/storage/emulated/0/HPAnaliz/SportsBase/maclar"
QUAR = "/storage/emulated/0/HPAnaliz/SportsBase/_inbox/quarantine"

def _delim(p):
    with open(p, encoding='utf-8', errors='ignore') as f:
        h = f.readline()
    return ';' if h.count(';') > h.count(',') else ','

def classify(path):
    p = Path(path); ext = p.suffix.lower()
    try:
        if ext == '.xlsx':
            import pandas as pd
            cols = ' '.join(str(c).lower() for c in pd.read_excel(p, nrows=1).columns)
            if 'shots faced' in cols or 'saves' in cols or 'save' in cols:
                return ('goalkeepers', 'xlsx')
            if 'player' in cols and 'position' in cols:
                return ('players', 'xlsx')
            if 'team' in cols and 'player' not in cols:
                return ('teams', 'xlsx')
        elif ext == '.csv':
            with open(p, encoding='utf-8', errors='ignore') as f:
                r = csv.DictReader(f, delimiter=_delim(p))
                sample = [row for _, row in zip(range(50), r)]
                cols = ' '.join((c or '').lower() for c in (r.fieldnames or []))
            if any(re.match(r'^\d+\.\s+.+?\(\d+\)', (row.get('code') or '').strip()) for row in sample):
                return ('players', 'csv')
            if 'team' in cols: return ('teams', 'csv')
        elif ext == '.xml':
            with open(p, encoding='utf-8', errors='ignore') as f:
                sample = f.read(5000)
            if re.search(r'<code>\s*\d+\.\s+[^<]+\(\d+\)', sample):
                return ('players', 'xml')
            if '<instance>' in sample: return ('teams', 'xml')
    except Exception:
        pass
    return (None, None)

def parse_date_and_teams(name):
    """'team1 2-0 team2 DD.MM.YYYY' veya 'YYYY_MM_DD_team1_vs_team2' formatı."""
    date, teams = None, []
    # Pattern A: DD.MM.YYYY
    m = re.search(r'(\d{1,2})\.(\d{1,2})\.(\d{4})', name)
    if m:
        d, mo, y = m.groups()
        date = f"{y}_{int(mo):02d}_{int(d):02d}"
    # Pattern B: YYYY_MM_DD
    if not date:
        m = re.search(r'(\d{4})[_-](\d{2})[_-](\d{2})', name)
        if m:
            date = f"{m.group(1)}_{m.group(2)}_{m.group(3)}"
    # Takımlar
    m = re.search(r'(\d{4}_\d{2}_\d{2})_(.+?)_vs_(.+?)(?:__|\.|$)', name)
    if m:
        teams = [m.group(2), m.group(3)]
    else:
        m = re.search(r'^(.+?)\s+\d+-\d+\s+(.+?)[,\.]', name)
        if m:
            teams = [m.group(1).strip(), m.group(2).strip()]
    return date, teams

def norm_team(t):
    return re.sub(r'[^A-Za-z0-9_]', '', t.replace(' ', '_').replace('.', ''))[:30]

def ingest():
    if not os.path.exists(INBOX):
        print(f"_inbox yok: {INBOX}")
        return 0, 0
    Path(QUAR).mkdir(parents=True, exist_ok=True)
    ok, quar = 0, 0
    for f in Path(INBOX).iterdir():
        if f.is_dir(): continue
        if not f.suffix.lower() in ('.xlsx', '.csv', '.xml', '.pdf'): continue
        role, ext = classify(f)
        if not role:
            shutil.move(str(f), str(Path(QUAR) / f.name))
            quar += 1
            print(f"  🚨 {f.name} → quarantine (rol belirsiz)")
            continue
        date, teams = parse_date_and_teams(f.name)
        if not date or not teams or len(teams) < 2:
            shutil.move(str(f), str(Path(QUAR) / f.name))
            quar += 1
            print(f"  🚨 {f.name} → quarantine (tarih/takım yok)")
            continue
        mid = f"MATCH_{date}_{norm_team(teams[0])}_vs_{norm_team(teams[1])}"
        tdir = Path(MACLAR) / mid
        tdir.mkdir(parents=True, exist_ok=True)
        tname = f"{role.upper()}__{ext.upper()}.{ext}"
        tpath = tdir / tname
        if tpath.exists():
            print(f"  ⏭  {f.name} → {mid}/{tname} (zaten var, atlandı)")
            os.remove(f)
            continue
        shutil.move(str(f), str(tpath))
        ok += 1
        print(f"  ✅ {f.name} → {mid}/{tname}")
    return ok, quar

if __name__ == '__main__':
    print(f"🔍 _inbox taraması")
    ok, q = ingest()
    print(f"\n📊 İşlendi: {ok} | Quarantine: {q}")
