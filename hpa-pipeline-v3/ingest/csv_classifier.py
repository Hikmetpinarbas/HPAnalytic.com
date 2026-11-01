"""
CSV sınıflandırıcı v3
Kurallar (sıralı):
1. TM: team sütunu boş oranı >%80 (yani <20% dolu)
2. GK: 'Goals conceded' VEYA 'Shots saved' VEYA 'Supersaves' 
      VEYA "Opponent's" içeren action VAR (en az 1 tane)
3. PL: geri kalan
"""
from pathlib import Path
import csv
from collections import Counter

GK_MARKERS = {
    'Goals conceded', 'Shots saved', 'Supersaves',
    "Opponent's close-range shots on target",
    "Opponent's long-range shots on target",
    "Opponent's mid-range shots on target",
    'Successful cross and pass interception attempts',
    'Unsuccessful cross and pass interception attempts',
}

def classify_csv(path):
    rows = []
    with open(path, encoding='utf-8', errors='ignore') as f:
        rows = list(csv.DictReader(f, delimiter=';'))
    if not rows:
        return None, []

    n = len(rows)
    team_filled = sum(1 for r in rows if (r.get('team') or '').strip())
    team_ratio = team_filled / n

    actions = Counter((r.get('action') or '').strip() for r in rows)

    # Kural 1: TM — team sütunu çok seyrek
    if team_ratio < 0.2:
        return 'TM', rows

    # Kural 2: GK — en az 1 GK-marker action var mı?
    has_gk_marker = any(actions.get(m, 0) > 0 for m in GK_MARKERS)
    if has_gk_marker:
        return 'GK', rows

    # Kural 3: PL
    return 'PL', rows

def classify_dir(dir_path):
    """Dizindeki tüm CSV'leri sınıflandır."""
    from glob import glob
    results = {}
    for f in sorted(glob(f"{dir_path}/*.csv")):
        kind, rows = classify_csv(f)
        if kind:
            results[kind] = f
    return results

if __name__ == '__main__':
    import sys
    from glob import glob
    for pattern in sys.argv[1:]:
        for f in sorted(glob(pattern)):
            kind, rows = classify_csv(f)
            print(f"{Path(f).name:60s} → {kind} ({len(rows)} satır)")
