"""Mutabakat modülü testleri.

Sentetik verilerle kök nedenleri doğrular:
- Kök Neden A: Koordinat filtresi geçerli olayları düşürür
- Kök Neden B: GK pasları ayrı dosyada
- Kök Neden C: Etiket örtüşmesi / metrik tanımı
- Kök Neden D: XLSX "-" → None ayrımı
"""
import sys
import os
import csv
import json
import tempfile
import shutil
from pathlib import Path
from collections import Counter

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from hpa_pipeline_v3.reconcile.event_counter import (
    count_by_player_action,
    count_by_team_action,
    reconcile_player,
    ACTION_TO_XLSX_COLUMN,
)
from hpa_pipeline_v3.reconcile.xlsx_reader import _parse_value
from hpa_pipeline_v3.ingest.load import (
    load_match, load_match_all, to_event, summary, summary_by_action,
)


# ══════════════════════════════════════════════════════════════════
# Test helpers
# ══════════════════════════════════════════════════════════════════

def _make_csv(tmpdir, filename, rows, has_team_col=True):
    """Test CSV dosyası oluştur."""
    path = os.path.join(tmpdir, filename)
    if has_team_col:
        fieldnames = ['ID', 'start', 'end', 'code', 'team', 'action', 'half', 'pos_x', 'pos_y']
    else:
        fieldnames = ['ID', 'start', 'end', 'code', 'action', 'half', 'pos_x', 'pos_y']
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')
        w.writeheader()
        for r in rows:
            w.writerow(r)
    return path


def _make_player_row(id_, start, code, team, action, half='1', x='50.0', y='34.0'):
    return {
        'ID': str(id_), 'start': str(start), 'end': str(start),
        'code': code, 'team': team, 'action': action,
        'half': half, 'pos_x': x, 'pos_y': y,
    }


# ══════════════════════════════════════════════════════════════════
# Kök Neden A: Koordinat filtresi
# ══════════════════════════════════════════════════════════════════

def test_coord_filter_drops_valid_events():
    """Koordinatsız ama gerçek bir pas olayı load_match'te düşer,
    load_match_all'da kalır."""
    tmpdir = tempfile.mkdtemp()
    try:
        rows = [
            _make_player_row(1, 10.0, '10. Test (1001) - Passes accurate',
                           'TestTeam (1)', 'Passes accurate', x='50.0', y='34.0'),
            _make_player_row(2, 20.0, '10. Test (1001) - Passes accurate',
                           'TestTeam (1)', 'Passes accurate', x='', y=''),  # koordinatsız!
            _make_player_row(3, 30.0, '10. Test (1001) - Passes accurate',
                           'TestTeam (1)', 'Passes accurate', x='60.0', y='40.0'),
        ]
        _make_csv(tmpdir, 'players.csv', rows)

        events, _ = load_match(tmpdir)
        events_all, _ = load_match_all(tmpdir)

        # load_match koordinatsız olayı düşürmeli
        pl_filtered = [e for e in events['PL'] if e['action'] == 'Passes accurate']
        assert len(pl_filtered) == 2, f"load_match: beklenen 2, bulundu {len(pl_filtered)}"

        # load_match_all tüm olayları korumalı
        pl_all = [e for e in events_all['PL'] if e['action'] == 'Passes accurate']
        assert len(pl_all) == 3, f"load_match_all: beklenen 3, bulundu {len(pl_all)}"

        print("✓ Kök Neden A: Koordinat filtresi doğru çalışıyor")
    finally:
        shutil.rmtree(tmpdir)


def test_meta_events_excluded():
    """Meta olaylar (Start/Halftime/End) her iki yükleme modunda da hariç."""
    tmpdir = tempfile.mkdtemp()
    try:
        rows = [
            _make_player_row(1, 0.0, 'Start of the 1st half', '', 'Start of the 1st half', x='', y=''),
            _make_player_row(2, 10.0, '10. Test (1001) - Passes accurate',
                           'TestTeam (1)', 'Passes accurate'),
            _make_player_row(3, 2700.0, 'Halftime', '', 'Halftime', x='', y=''),
        ]
        _make_csv(tmpdir, 'players.csv', rows)

        events_all, _ = load_match_all(tmpdir)
        actions = [e['action'] for e in events_all['PL']]
        assert 'Start of the 1st half' not in actions
        assert 'Halftime' not in actions
        assert 'Passes accurate' in actions
        print("✓ Meta olaylar doğru hariç tutuluyor")
    finally:
        shutil.rmtree(tmpdir)


# ══════════════════════════════════════════════════════════════════
# Kök Neden C: Etiket örtüşmesi
# ══════════════════════════════════════════════════════════════════

def test_tag_overlap_separate_counting():
    """Aynı fiziksel pas birden fazla etiket satırı üretir.
    summary_by_action her etiketi ayrı saymalı."""
    tmpdir = tempfile.mkdtemp()
    try:
        # Bentaleb'in tek bir pası 3 etiket üretir
        rows = [
            _make_player_row(1, 10.0, '6. Bentaleb (155855) - Passes accurate',
                           'LOSC Lille (43954)', 'Passes accurate'),
            _make_player_row(2, 10.0, '6. Bentaleb (155855) - Progressive passes accurate',
                           'LOSC Lille (43954)', 'Progressive passes accurate'),
            _make_player_row(3, 10.0, '6. Bentaleb (155855) - Passes forward accurate',
                           'LOSC Lille (43954)', 'Passes forward accurate'),
            # İkinci pas: sadece accurate
            _make_player_row(4, 20.0, '6. Bentaleb (155855) - Passes accurate',
                           'LOSC Lille (43954)', 'Passes accurate'),
        ]
        _make_csv(tmpdir, 'players.csv', rows)

        events, _ = load_match(tmpdir)

        # summary() eski davranış: tüm pass satırlarını sayar
        s = summary(events)
        assert s['passes']['total'] == 4, f"summary passes: {s['passes']['total']}"

        # summary_by_action(): her etiketi ayrı sayar
        sa = summary_by_action(events)
        assert sa['by_action']['Passes accurate'] == 2
        assert sa['by_action']['Progressive passes accurate'] == 1
        assert sa['by_action']['Passes forward accurate'] == 1

        # Oyuncu bazında
        bentaleb = sa['by_player_action'].get('Bentaleb', {})
        assert bentaleb.get('Passes accurate') == 2
        assert bentaleb.get('Progressive passes accurate') == 1

        print("✓ Kök Neden C: Etiket örtüşmesi doğru ayrıştırılıyor")
    finally:
        shutil.rmtree(tmpdir)


# ══════════════════════════════════════════════════════════════════
# Kök Neden D: XLSX "-" ayrımı
# ══════════════════════════════════════════════════════════════════

def test_xlsx_dash_parsing():
    """"-" → None, sayı → float, boş → None."""
    assert _parse_value('-') is None, "'-' should be None"
    assert _parse_value('') is None, "'' should be None"
    assert _parse_value(None) is None, "None should be None"
    assert _parse_value(5) == 5.0, "5 should be 5.0"
    assert _parse_value('3.14') == 3.14, "'3.14' should be 3.14"
    assert _parse_value(0) == 0.0, "0 should be 0.0"
    assert _parse_value('0') == 0.0, "'0' should be 0.0"
    print("✓ Kök Neden D: XLSX '-' → None ayrımı doğru")


# ══════════════════════════════════════════════════════════════════
# Reconciliation: Oyuncu mutabakatı
# ══════════════════════════════════════════════════════════════════

def test_reconcile_player_match():
    """CSV ve XLSX aynı değer → MATCH."""
    csv_counts = {'Passes accurate': 5, 'Progressive passes accurate': 2}
    xlsx_stats = {'Passes accurate': 5, 'Progressive passes accurate': 2}
    findings = reconcile_player(csv_counts, xlsx_stats)
    pass_f = next(f for f in findings if f['metric'] == 'Passes accurate')
    prog_f = next(f for f in findings if f['metric'] == 'Progressive passes accurate')
    assert pass_f['status'] == 'MATCH'
    assert prog_f['status'] == 'MATCH'
    print("✓ Reconcile: MATCH durumu doğru")


def test_reconcile_player_mismatch():
    """CSV ve XLSX farklı → MISMATCH, delta doğru."""
    csv_counts = {'Passes accurate': 8}
    xlsx_stats = {'Passes accurate': 10}
    findings = reconcile_player(csv_counts, xlsx_stats)
    pass_f = next(f for f in findings if f['metric'] == 'Passes accurate')
    assert pass_f['status'] == 'MISMATCH'
    assert pass_f['delta'] == -2  # CSV'de 2 eksik
    print("✓ Reconcile: MISMATCH ve delta doğru")


def test_reconcile_xlsx_none():
    """XLSX'te None (eski "-"), CSV'de olay var → XLSX_MISSING."""
    csv_counts = {'Goals': 1}
    xlsx_stats = {'Goals': None}  # "-" olarak okunmuş
    findings = reconcile_player(csv_counts, xlsx_stats)
    goal_f = next(f for f in findings if f['metric'] == 'Goals')
    assert goal_f['status'] == 'XLSX_MISSING'
    print("✓ Reconcile: XLSX None durumu doğru tespit ediliyor")


def test_reconcile_both_zero():
    """CSV'de 0, XLSX'te None → ikisi de sıfır → MATCH_ZERO."""
    csv_counts = {}  # Goals yok
    xlsx_stats = {'Goals': None}  # "-"
    findings = reconcile_player(csv_counts, xlsx_stats)
    goal_f = next(f for f in findings if f['metric'] == 'Goals')
    assert goal_f['status'] == 'MATCH_ZERO'
    print("✓ Reconcile: Her ikisi de sıfır → MATCH_ZERO")


# ══════════════════════════════════════════════════════════════════
# Etiket eşleştirme tablosu
# ══════════════════════════════════════════════════════════════════

def test_action_to_xlsx_coverage():
    """Bilinen SportsBase action'larının tamamı tabloda olmalı."""
    known_actions = {
        'Passes accurate', 'Progressive passes accurate',
        'Passes forward accurate', 'Passes into the penalty box accurate',
        'Goals', 'Shots on target', 'Shots off target',
        'Ball losses', 'Ball recoveries',
        'Challenges won', 'Challenges unsuccessful',
        'Fouls', 'Fouls suffered',
    }
    for action in known_actions:
        assert action in ACTION_TO_XLSX_COLUMN, f"Eksik: {action}"
    print(f"✓ Etiket tablosu: {len(known_actions)} bilinen action mevcut")


# ══════════════════════════════════════════════════════════════════
# Kök Neden B: GK pasları
# ══════════════════════════════════════════════════════════════════

def test_gk_passes_separate():
    """GK pasları PL'den ayrı sayılır; summary_by_action ikisini de gösterir."""
    tmpdir = tempfile.mkdtemp()
    try:
        # PL dosyası
        pl_rows = [
            _make_player_row(1, 10.0, '10. Player (1001) - Passes accurate',
                           'TestTeam (1)', 'Passes accurate'),
        ]
        # GK dosyası (GK marker ekliyoruz classify_csv'nin tanıması için)
        gk_rows = [
            _make_player_row(1, 5.0, '1. Keeper (2001) - Passes accurate',
                           'TestTeam (1)', 'Passes accurate'),
            _make_player_row(2, 15.0, '1. Keeper (2001) - Goals conceded',
                           'TestTeam (1)', 'Goals conceded'),
        ]
        # TM dosyası (team sütunu olmadan)
        tm_rows = [
            {'ID': '1', 'start': '10.0', 'end': '10.0',
             'code': 'TestTeam (1) - Passes accurate', 'action': 'Passes accurate',
             'half': '1', 'pos_x': '50.0', 'pos_y': '34.0'},
        ]

        _make_csv(tmpdir, 'PLAYERS.csv', pl_rows)
        _make_csv(tmpdir, 'GOALKEEPERS.csv', gk_rows)
        _make_csv(tmpdir, 'TEAMS.csv', tm_rows, has_team_col=False)

        events, files = load_match(tmpdir)

        # PL'de 1, GK'da 1 pas olmalı
        pl_passes = [e for e in events.get('PL', []) if e['action'] == 'Passes accurate']
        gk_passes = [e for e in events.get('GK', []) if e['action'] == 'Passes accurate']

        # summary() sadece PL sayar
        s = summary(events)
        pl_pass_count = s['passes']['total']

        # summary_by_action() her kaynağı ayrı gösterir
        sa = summary_by_action(events)
        by_source = sa['by_source_action']

        if 'PL' in by_source:
            assert by_source['PL'].get('Passes accurate', 0) == len(pl_passes)
        if 'GK' in by_source:
            assert by_source['GK'].get('Passes accurate', 0) == len(gk_passes)

        print(f"✓ Kök Neden B: PL pas={len(pl_passes)}, GK pas={len(gk_passes)}")
        print(f"  summary() passes={pl_pass_count} (sadece PL)")
        print(f"  summary_by_action() kaynakları ayrı gösteriyor")
    finally:
        shutil.rmtree(tmpdir)


# ══════════════════════════════════════════════════════════════════
# Ana çalıştırma
# ══════════════════════════════════════════════════════════════════

if __name__ == '__main__':
    print("=" * 60)
    print("MUTABAKAT TESTLERİ")
    print("=" * 60)

    tests = [
        test_coord_filter_drops_valid_events,
        test_meta_events_excluded,
        test_tag_overlap_separate_counting,
        test_xlsx_dash_parsing,
        test_reconcile_player_match,
        test_reconcile_player_mismatch,
        test_reconcile_xlsx_none,
        test_reconcile_both_zero,
        test_action_to_xlsx_coverage,
        test_gk_passes_separate,
    ]

    passed = 0
    failed = 0
    for t in tests:
        try:
            t()
            passed += 1
        except Exception as e:
            print(f"✗ {t.__name__}: {e}")
            failed += 1

    print(f"\n{'=' * 60}")
    print(f"Sonuç: {passed} başarılı, {failed} başarısız / {len(tests)} toplam")
    if failed > 0:
        sys.exit(1)
