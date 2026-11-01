"""V4 canonical + XLSX ground truth birleşik site paketi.
   Pas/Gol → XLSX. Şut/Faz/Radar → V4 canonical. Pressure → V3."""
import json, sys
from pathlib import Path

V4_DIR = Path('/sdcard/HPAnalytic/data/output/packages_v4')
SITE_DIR = Path('/data/data/com.termux/files/home/hpanalytic-repo/public/assets/data')
sys.path.insert(0, str(Path(__file__).parent))
from build_truth_summary import xlsx_summary

# Her site_id: (v4_id, team, xlsx_path)
MATCHES = {
    'konya-gs': (
        'konyaspor-gs-2026-10-30',
        'Galatasaray',
        '/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175305/spreadsheet/Konyaspor 0-4 Galatasaray, Turkey. Süper Lig, 30.10.2026.xlsx',
    ),
    'lille-gs': (
        'lille-gs-2026-10-21',
        'Galatasaray',
        '/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175306/spreadsheet/LOSC Lille 2-4 Galatasaray, Europe. UEFA Champions League, 21.10.2026.xlsx',
    ),
    'gs-fb': (
        'gs-fb-2026-10-26',
        'Galatasaray',
        '/sdcard/HPAnalytic/data/raw/sportsbase/match-2026-10/spreadsheet/MATCH_2026-10-26_Galatasaray_vs_Fenerbahce_XLSX_PLAYERS.xlsx',
    ),
    'aston-villa-fb': (
        'aston-villa-fb-2026-10-14',
        'Aston Villa',
        '/sdcard/HPAnalytic/data/raw/SB_ARCHIVE/matches/2026-10-14_aston-villa_vs_fenerbahce/Aston Villa 6-0 Fenerbahce, Europe. UEFA Champions League, 14.10.2026.xlsx',
    ),
}

def bridge(site_id):
    v4_id, team, xlsx_path = MATCHES[site_id]
    v4 = json.loads((V4_DIR / f'{v4_id}_v4.json').read_text(encoding='utf-8'))
    truth = xlsx_summary(xlsx_path)

    # Pressure: canonical event'ten bağımsız hesapla
    sys.path.insert(0, '/data/data/com.termux/files/home/hpanalytic-repo')
    from hpa_pipeline_v3.ingest.load import load_match
    from pressure_from_canonical import calculate_pressure, SOURCES as PRESS_SOURCES
    events, _ = load_match(PRESS_SOURCES[v4_id])
    pressure = calculate_pressure(events['PL'], team)

    tdata = v4['teams'][team]

    package = {
        'metadata': {
            'match_id': v4_id, 'team': team,
            'source': 'V4 canonical + XLSX ground truth',
            'shots_reconciled': (
                {k.lower(): v for k, v in truth['shots']['by_team'].items()}
                == v4['shots_truth']['physical_canonical']
            ),
        },
        'summary': {
            'passes': truth['passes'],
            'goals': truth['goals'],
            'assists': truth['assists'],
            'shots': {
                **truth['shots'],
                'canonical_check': v4['shots_truth']['physical_canonical'],
            },
            '_source': 'XLSX ground truth',
        },
        'four_phases': tdata['four_phases'],
        'pressure': pressure,
        'player_radar': {
            'players': {
                name: {
                    **p['raw_counts'],
                    '_norm': p['metrics'],
                    '_epistemic': p.get('epistemic'),
                }
                for name, p in tdata['radar'].items()
            },
            'epistemic': 'TÜREV (V4)',
        },
    }

    out = SITE_DIR / site_id / 'match_package.json'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(package, indent=2, ensure_ascii=False), encoding='utf-8')

    s = package['summary']
    print(f'✓ {site_id}')
    print(f'  Pas: {s["passes"]["total"]} ({s["passes"]["by_team"]})')
    print(f'  Gol: {s["goals"]["total"]}')
    print(f'  Şut: {s["shots"]["total"]} ({s["shots"]["by_team"]})')
    print(f'  PPDA: {pressure.get("ppda", "YOK")}')

if __name__ == '__main__':
    if len(sys.argv) > 1:
        bridge(sys.argv[1])
    else:
        for sid in MATCHES:
            bridge(sid)
            print()
