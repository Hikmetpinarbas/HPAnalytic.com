#!/usr/bin/env python3
"""Dört maç mutabakatını çalıştır.

Kullanım (Termux veya UserLAnd'den):
    python3 run_reconcile.py

Çıktı: her maç için uyuşmazlık raporu + JSON.
"""
import sys
import json
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from hpa_pipeline_v3.reconcile.reconciler import reconcile_match, format_report
from hpa_pipeline_v3.ingest.load import load_match, load_match_all, summary_by_action

# ══════════════════════════════════════════════════════════════════
# Maç tanımları — yerel cihaz path'leri
# ══════════════════════════════════════════════════════════════════

MATCHES = {
    'lille-gs': {
        'csv_dir': '/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175306/stats',
        'xlsx_players': None,  # XLSX path'lerini ekle
        'xlsx_gk': None,
        'xlsx_matches': None,
        'label': 'Lille vs Galatasaray (2026-10-21)',
    },
    'konya-gs': {
        'csv_dir': '/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175305/stats',
        'xlsx_players': None,
        'xlsx_gk': None,
        'xlsx_matches': None,
        'label': 'Konyaspor vs Galatasaray (2026-10-30)',
    },
    'gs-fb': {
        'csv_dir': '/sdcard/HPAnalytic/data/raw/sportsbase/match-2026-10/stats',
        'xlsx_players': None,
        'xlsx_gk': None,
        'xlsx_matches': None,
        'label': 'Galatasaray vs Fenerbahce (2026-10-26)',
    },
    'bjk-cp': {
        'csv_dir': None,  # path'i ekle
        'xlsx_players': None,
        'xlsx_gk': None,
        'xlsx_matches': None,
        'label': 'Besiktas vs Crystal Palace (2026-10-22)',
    },
}

# Alternatif yollar (Termux vs UserLAnd)
ALT_BASE_PATHS = [
    Path('/sdcard/HPAnalytic/data/raw/sportsbase'),
    Path.home() / 'pipeline/input',
    Path('/data/data/com.termux/files/home/pipeline/input'),
]


def find_csv_files(csv_dir):
    """CSV dizinindeki PL/GK/TM dosyalarını bul."""
    if not csv_dir or not os.path.isdir(csv_dir):
        return None, None, None
    from glob import glob
    files = sorted(glob(f"{csv_dir}/*.csv"))
    pl_path = gk_path = tm_path = None
    for f in files:
        sys.path.insert(0, str(Path(__file__).parent.parent.parent))
        from hpa_pipeline_v3.ingest.csv_classifier import classify_csv
        kind, _ = classify_csv(f)
        if kind == 'PL':
            pl_path = f
        elif kind == 'GK':
            gk_path = f
        elif kind == 'TM':
            tm_path = f
    return pl_path, gk_path, tm_path


def find_xlsx_files(csv_dir):
    """CSV dizininin yanındaki XLSX dosyalarını bul."""
    if not csv_dir:
        return None, None, None
    parent = Path(csv_dir).parent
    from glob import glob
    xlsx_files = sorted(glob(f"{parent}/*.xlsx") + glob(f"{csv_dir}/*.xlsx"))
    pl_xlsx = gk_xlsx = match_xlsx = None
    for f in xlsx_files:
        name = Path(f).name.upper()
        if 'PLAYER' in name and 'GOALKEEPER' not in name:
            pl_xlsx = f
        elif 'GOALKEEPER' in name:
            gk_xlsx = f
        elif 'MATCH' in name or 'TEAM' in name:
            match_xlsx = f
    return pl_xlsx, gk_xlsx, match_xlsx


def run_single(match_id, config):
    """Tek maç mutabakatı."""
    csv_dir = config['csv_dir']
    if not csv_dir or not os.path.isdir(csv_dir):
        print(f"⚠ {match_id}: CSV dizini bulunamadı ({csv_dir})")
        return None

    pl_csv, gk_csv, tm_csv = find_csv_files(csv_dir)
    if not pl_csv:
        print(f"⚠ {match_id}: PL CSV bulunamadı")
        return None

    pl_xlsx, gk_xlsx, match_xlsx = find_xlsx_files(csv_dir)
    if config.get('xlsx_players'):
        pl_xlsx = config['xlsx_players']
    if config.get('xlsx_gk'):
        gk_xlsx = config['xlsx_gk']
    if config.get('xlsx_matches'):
        match_xlsx = config['xlsx_matches']

    print(f"\n{'='*70}")
    print(f"Maç: {config['label']}")
    print(f"CSV dir: {csv_dir}")
    print(f"PL: {Path(pl_csv).name if pl_csv else '?'}")
    print(f"GK: {Path(gk_csv).name if gk_csv else '?'}")
    print(f"TM: {Path(tm_csv).name if tm_csv else '?'}")
    print(f"XLSX PL: {Path(pl_xlsx).name if pl_xlsx else '?'}")
    print(f"XLSX GK: {Path(gk_xlsx).name if gk_xlsx else '?'}")
    print(f"XLSX TM: {Path(match_xlsx).name if match_xlsx else '?'}")

    # Koordinat filtresi etkisi analizi
    events_filtered, files1 = load_match(csv_dir)
    events_all, files2 = load_match_all(csv_dir)
    filtered_count = sum(len(v) for v in events_filtered.values())
    all_count = sum(len(v) for v in events_all.values())
    print(f"\nOlay sayısı: {all_count} toplam, {filtered_count} koordinatlı, "
          f"{all_count - filtered_count} düşen")

    # summary_by_action ile ayrıntılı sayım
    sa = summary_by_action(events_all)
    print(f"\nKaynak bazında olay dağılımı:")
    for src, acts in sa['by_source_action'].items():
        total = sum(acts.values())
        print(f"  {src}: {total} olay")

    # Mutabakat
    result = reconcile_match(
        pl_csv, gk_csv, tm_csv,
        pl_xlsx, gk_xlsx, match_xlsx,
        match_label=config['label'],
    )

    report = format_report(result, verbose=True)
    print(report)

    return result


def main():
    print("HPAnalytic Pipeline v3 — Mutabakat Aracı")
    print("=" * 70)

    results = []
    for match_id, config in MATCHES.items():
        result = run_single(match_id, config)
        if result:
            results.append(result)

    # Toplam özet
    if results:
        print(f"\n{'='*70}")
        print(f"GENEL ÖZET")
        print(f"{'='*70}")
        total_mm = sum(r['summary']['total_mismatches'] for r in results)
        total_pl = sum(r['summary']['player_mismatches'] for r in results)
        total_tm = sum(r['summary']['team_mismatches'] for r in results)
        total_gk = sum(r['summary']['gk_mismatches'] for r in results)
        total_dropped = sum(r['coord_filter_impact']['dropped_count'] for r in results)

        print(f"Maç sayısı: {len(results)}")
        print(f"Toplam uyuşmazlık: {total_mm}")
        print(f"  Oyuncu: {total_pl}")
        print(f"  Takım:  {total_tm}")
        print(f"  Kaleci: {total_gk}")
        print(f"Koordinat filtresiyle düşen olay: {total_dropped}")

        all_hints = []
        for r in results:
            all_hints.extend(r['root_cause_hints'])

        causes = set(h['cause'] for h in all_hints)
        print(f"\nKök neden kategorileri: {', '.join(sorted(causes))}")

        # JSON çıktı
        out_path = Path.home() / 'hpanalytic' / 'reconciliation_report.json'
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False, default=str)
        print(f"\nJSON rapor: {out_path}")
    else:
        print("\nHiçbir maç verisi bulunamadı.")
        print("Bu script yerel cihazda (Termux/UserLAnd) çalıştırılmalıdır.")
        print("CSV dosyalarının MATCHES dict'indeki yollarda olduğundan emin olun.")


if __name__ == '__main__':
    main()
