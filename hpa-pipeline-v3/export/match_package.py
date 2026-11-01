"""Tek şema: match_package.json"""
import json, os
from pathlib import Path

def export(csv_dir, xlsx_path, team_name, out_path):
    import sys
    sys.path.insert(0, str(Path(__file__).parent.parent.parent))
    from hpa_pipeline_v3.ingest.load import load_match, summary
    from hpa_pipeline_v3.derive.four_phases import calculate as four_phases
    from hpa_pipeline_v3.derive.pressure import calculate as pressure
    from hpa_pipeline_v3.derive.radar import calculate as radar

    events, files = load_match(csv_dir)
    s = summary(events)
    fp = four_phases(events['PL'], team_name)
    pr = pressure(events['PL'], team_name)
    rd = radar(events['PL'], team_name, xlsx_path)

    package = {
        'metadata': {
            'match_id': Path(csv_dir).name,
            'team': team_name,
            'source_files': files,
            'xlsx_used': os.path.basename(xlsx_path) if xlsx_path else None,
        },
        'summary': s,
        'four_phases': fp,
        'pressure': pr,
        'player_radar': rd,
    }

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(package, f, indent=2, ensure_ascii=False)
    return package

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 5:
        print('Kullanım: python3 match_package.py <csv_dir> <xlsx_path> <team> <out_json>')
        sys.exit(1)
    p = export(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
    print(f"✓ {sys.argv[4]}")
    print(f"  Şut: {p['summary']['shots']['total']}")
    print(f"  PPDA: {p['pressure']['ppda']}")
    print(f"  Oyuncu sayısı: {len(p['player_radar']['players'])}")
