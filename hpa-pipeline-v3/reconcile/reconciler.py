"""Ana mutabakat modülü: CSV olayları vs XLSX toplamları.

Dört maç için:
1. CSV PL/GK/TM olaylarını yükle (koordinat filtresi OLMADAN sayım için)
2. XLSX oyuncu/kaleci/takım toplamlarını yükle ("-" → None ayrımıyla)
3. Action bazında tek tek karşılaştır
4. Uyuşmazlıkları raporla, kök neden adayı öner
"""
import csv
import json
import os
import re
from collections import defaultdict, Counter
from pathlib import Path

from .event_counter import (
    count_by_player_action,
    count_by_team_action,
    reconcile_player,
    reconcile_team,
    ACTION_TO_XLSX_COLUMN,
)
from .xlsx_reader import read_xlsx_players, read_xlsx_goalkeepers, read_xlsx_matches


def _parse_player_from_code(code):
    m = re.search(r'(\d+)\.\s+(.+?)\s+\((\d+)\)', code or '')
    return m.group(2) if m else None


def _parse_team(row):
    t = (row.get('team') or '').strip()
    if t:
        return t.split(' (')[0].strip()
    c = row.get('code') or ''
    m = re.match(r'^(.+?)\s*\(\d+\)\s*-\s*', c)
    return m.group(1).strip() if m else None


def load_csv_raw(path):
    """CSV'yi ham oku — koordinat filtresi UYGULAMADAN."""
    rows = []
    with open(path, encoding='utf-8', errors='ignore') as f:
        for row in csv.DictReader(f, delimiter=';'):
            action = (row.get('action') or '').strip()
            if not action:
                continue
            player = _parse_player_from_code(row.get('code'))
            team = _parse_team(row)
            rows.append({
                'id': row.get('ID'),
                'action': action,
                'player': player,
                'team': team,
                'code': row.get('code', ''),
                'half': row.get('half'),
                'pos_x': row.get('pos_x', ''),
                'pos_y': row.get('pos_y', ''),
            })
    return rows


def load_csv_with_coords(path):
    """CSV'yi koordinat filtresiyle oku (mevcut pipeline davranışı)."""
    rows = []
    with open(path, encoding='utf-8', errors='ignore') as f:
        for row in csv.DictReader(f, delimiter=';'):
            action = (row.get('action') or '').strip()
            if not action:
                continue
            px = (row.get('pos_x') or '').strip()
            py = (row.get('pos_y') or '').strip()
            if not px or px == '-' or not py or py == '-':
                continue
            player = _parse_player_from_code(row.get('code'))
            team = _parse_team(row)
            if not team:
                continue
            rows.append({
                'id': row.get('ID'),
                'action': action,
                'player': player,
                'team': team,
                'code': row.get('code', ''),
            })
    return rows


def reconcile_match(csv_pl_path, csv_gk_path, csv_tm_path,
                    xlsx_players_path=None, xlsx_gk_path=None,
                    xlsx_matches_path=None,
                    match_label='unknown'):
    """Tek maç için tam mutabakat.

    Döndürür: {
        'match': label,
        'player_findings': [{player, findings: [...]}],
        'team_findings': [{team, findings: [...]}],
        'gk_findings': [{player, findings: [...]}],
        'summary': {total_compared, matches, mismatches, xlsx_missing},
        'coord_filter_impact': {dropped_count, dropped_actions},
        'root_cause_hints': [...]
    }
    """
    # 1. CSV ham yükleme (sayım için koordinat filtresi yok)
    pl_raw = load_csv_raw(csv_pl_path) if csv_pl_path and os.path.exists(csv_pl_path) else []
    gk_raw = load_csv_raw(csv_gk_path) if csv_gk_path and os.path.exists(csv_gk_path) else []
    tm_raw = load_csv_raw(csv_tm_path) if csv_tm_path and os.path.exists(csv_tm_path) else []

    # 2. Koordinat filtreli yükleme (fark analizi için)
    pl_filtered = load_csv_with_coords(csv_pl_path) if csv_pl_path and os.path.exists(csv_pl_path) else []

    # 3. Koordinat filtresinin etkisi
    dropped = len(pl_raw) - len(pl_filtered)
    dropped_actions = Counter()
    raw_set = {r['id'] for r in pl_raw}
    filtered_set = {r['id'] for r in pl_filtered}
    for r in pl_raw:
        if r['id'] not in filtered_set:
            dropped_actions[r['action']] += 1

    # 4. Oyuncu bazlı CSV sayımları (ham, filtre yok)
    pl_player_counts = count_by_player_action(pl_raw)
    gk_player_counts = count_by_player_action(gk_raw)
    tm_team_counts = count_by_team_action(tm_raw)

    # 5. XLSX yükleme
    xlsx_pl = read_xlsx_players(xlsx_players_path) if xlsx_players_path and os.path.exists(xlsx_players_path) else {}
    xlsx_gk = read_xlsx_goalkeepers(xlsx_gk_path) if xlsx_gk_path and os.path.exists(xlsx_gk_path) else {}
    xlsx_tm = read_xlsx_matches(xlsx_matches_path) if xlsx_matches_path and os.path.exists(xlsx_matches_path) else {}

    # 6. Oyuncu mutabakatı
    player_findings = []
    for player, csv_counts in pl_player_counts.items():
        if player in xlsx_pl:
            findings = reconcile_player(csv_counts, xlsx_pl[player])
            mismatches = [f for f in findings if f['status'] == 'MISMATCH']
            if mismatches:
                player_findings.append({
                    'player': player,
                    'team': xlsx_pl[player].get('_team'),
                    'mismatches': mismatches,
                    'total_findings': len(findings),
                })

    # 7. GK mutabakatı
    gk_findings = []
    for player, csv_counts in gk_player_counts.items():
        if player in xlsx_gk:
            findings = reconcile_player(csv_counts, xlsx_gk[player])
            mismatches = [f for f in findings if f['status'] == 'MISMATCH']
            if mismatches:
                gk_findings.append({
                    'player': player,
                    'mismatches': mismatches,
                })

    # 8. Takım mutabakatı
    team_findings = []
    for team, csv_counts in tm_team_counts.items():
        for xlsx_team, xlsx_stats in xlsx_tm.items():
            if _teams_match(team, xlsx_team):
                findings = reconcile_team(csv_counts, xlsx_stats)
                mismatches = [f for f in findings if f['status'] == 'MISMATCH']
                if mismatches:
                    team_findings.append({
                        'team': team,
                        'xlsx_team': xlsx_team,
                        'mismatches': mismatches,
                    })

    # 9. Toplam istatistikler
    all_findings = []
    for pf in player_findings:
        all_findings.extend(pf['mismatches'])
    for gf in gk_findings:
        all_findings.extend(gf['mismatches'])
    for tf in team_findings:
        all_findings.extend(tf['mismatches'])

    total_compared = sum(
        pf.get('total_findings', len(pf['mismatches'])) for pf in player_findings
    )

    # 10. Kök neden ipuçları
    hints = []
    if dropped > 0:
        hints.append({
            'cause': 'COORD_FILTER',
            'description': f'{dropped} olay koordinat eksikliği nedeniyle filtrelendi',
            'affected_actions': dict(dropped_actions.most_common(10)),
        })

    pass_mismatches = [f for f in all_findings if 'pass' in f['metric'].lower()]
    if pass_mismatches:
        hints.append({
            'cause': 'TAG_OVERLAP',
            'description': 'Pas metrikleri uyuşmazlığı — SportsBase etiket örtüşmesi olası',
            'affected_count': len(pass_mismatches),
        })

    xlsx_none_issues = [f for f in all_findings if f['xlsx_value'] is None and f['csv_count'] > 0]
    if xlsx_none_issues:
        hints.append({
            'cause': 'XLSX_DASH_AS_NONE',
            'description': 'XLSX "-" hücreleri None olarak okundu; CSV\'de olay var',
            'affected_count': len(xlsx_none_issues),
        })

    return {
        'match': match_label,
        'player_findings': player_findings,
        'team_findings': team_findings,
        'gk_findings': gk_findings,
        'summary': {
            'total_mismatches': len(all_findings),
            'player_mismatches': sum(len(pf['mismatches']) for pf in player_findings),
            'team_mismatches': sum(len(tf['mismatches']) for tf in team_findings),
            'gk_mismatches': sum(len(gf['mismatches']) for gf in gk_findings),
        },
        'coord_filter_impact': {
            'dropped_count': dropped,
            'dropped_actions': dict(dropped_actions.most_common(20)),
        },
        'root_cause_hints': hints,
    }


def _teams_match(csv_team, xlsx_team):
    """Takım isimlerini esnek eşleştir."""
    csv_lower = csv_team.lower().strip()
    xlsx_lower = xlsx_team.lower().strip()
    if csv_lower == xlsx_lower:
        return True
    aliases = {
        'galatasaray': ['gal', 'gs'],
        'fenerbahce': ['fen', 'fb'],
        'besiktas': ['bes', 'bjk', 'beşiktaş'],
        'losc lille': ['lil', 'lille'],
        'konyaspor': ['kon', 'konya'],
        'crystal palace': ['cp', 'cry'],
    }
    for full, shorts in aliases.items():
        if (full in csv_lower or csv_lower in shorts) and \
           (full in xlsx_lower or xlsx_lower in shorts):
            return True
    return False


def format_report(result, verbose=False):
    """Sonucu okunabilir metin formatına dönüştür."""
    lines = []
    lines.append(f"{'='*70}")
    lines.append(f"MUTABAKAT RAPORU: {result['match']}")
    lines.append(f"{'='*70}")

    s = result['summary']
    lines.append(f"\nToplam uyuşmazlık: {s['total_mismatches']}")
    lines.append(f"  Oyuncu: {s['player_mismatches']}")
    lines.append(f"  Takım:  {s['team_mismatches']}")
    lines.append(f"  Kaleci: {s['gk_mismatches']}")

    ci = result['coord_filter_impact']
    if ci['dropped_count'] > 0:
        lines.append(f"\nKoordinat filtresi etkisi: {ci['dropped_count']} olay düştü")
        for act, cnt in list(ci['dropped_actions'].items())[:5]:
            lines.append(f"  {act}: {cnt}")

    if result['root_cause_hints']:
        lines.append("\nKök neden ipuçları:")
        for h in result['root_cause_hints']:
            lines.append(f"  [{h['cause']}] {h['description']}")

    if verbose:
        for pf in result['player_findings']:
            lines.append(f"\n  --- {pf['player']} ({pf.get('team', '?')}) ---")
            for m in pf['mismatches']:
                lines.append(
                    f"    {m['metric']:45s} CSV={m['csv_count']:4d}  "
                    f"XLSX={m['xlsx_value'] if m['xlsx_value'] is not None else 'None':>5s}  "
                    f"Δ={m['delta'] if m['delta'] is not None else '?':>4s}"
                )

        for tf in result['team_findings']:
            lines.append(f"\n  --- {tf['team']} (XLSX: {tf['xlsx_team']}) ---")
            for m in tf['mismatches']:
                lines.append(
                    f"    {m['metric']:45s} CSV={m['csv_count']:4d}  "
                    f"XLSX={m['xlsx_value'] if m['xlsx_value'] is not None else 'None':>5s}  "
                    f"Δ={m['delta'] if m['delta'] is not None else '?':>4s}"
                )

    return '\n'.join(lines)
