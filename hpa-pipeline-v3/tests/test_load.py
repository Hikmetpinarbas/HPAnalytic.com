import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from hpa_pipeline_v3.ingest.load import load_match, dedup_shots, summary

MATCHES = {
    'lille-gs': '/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175306/stats',
    'konya-gs': '/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175305/stats',
    'gs-fb':    '/sdcard/HPAnalytic/data/raw/sportsbase/match-2026-10/stats',
}

EXPECTED = {
    'lille-gs': 22,
    'konya-gs': 22,
    'gs-fb':    24,
}

for name, path in MATCHES.items():
    events, files = load_match(path)
    shots = dedup_shots(events)
    s = summary(events)
    exp = EXPECTED[name]
    ok = '✓' if len(shots) == exp else f'✗ (beklenen {exp})'
    print(f"\n{'='*60}")
    print(f"{name} {ok}")
    print(f"{'='*60}")
    print(f"  Dosyalar: {files}")
    print(f"  Şut: {s['shots']['total']}  {s['shots']['by_team']}")
    print(f"  Gol: {s['goals']['total']}  {s['goals']['by_team']}")
    print(f"  Pas: {s['passes']['total']}  {s['passes']['by_team']}")
