"""
İZOLE TEST: Sadece XLSX verisiyle doğru pairing testi.
Gerçek maç verisiyle, beklenen cevapla karşılaştırır.
"""
import csv, json
from pathlib import Path


def pos_group(pos):
    if not pos: return '-'
    pos = str(pos).upper().strip()
    if pos in ('CB', 'LCB', 'RCB'): return 'CB'
    if pos in ('RB', 'LB', 'RWB', 'LWB'): return 'FB'
    if pos in ('CDM', 'LCDM', 'RCDM', 'CM', 'LCM', 'RCM', 'DM'): return 'CM'
    if pos in ('CAM', 'RAM', 'LAM', 'RW', 'LW', 'RM', 'LM', 'AM'): return 'AM'
    if pos in ('CF', 'ST', 'LCF', 'RCF', 'SS', 'FW'): return 'FW'
    if pos == 'GK': return 'GK'
    return pos[:2]


def pos_distance(p1, p2):
    """Pozisyon grupları arası mesafe. 0=aynı, 1=komşu, 2=uzak."""
    g1, g2 = pos_group(p1), pos_group(p2)
    if g1 == g2: return 0
    # Kanat↔Kanat (FB↔AM) daha yakın
    adjacent = {('FB','AM'), ('AM','FB'), ('AM','FW'), ('FW','AM'),
                ('CM','AM'), ('AM','CM'), ('CB','FB'), ('FB','CB'),
                ('CB','CM'), ('CM','CB')}
    if (g1, g2) in adjacent: return 1
    return 2


def infer_subs_from_csv(csv_path, total_match_min=97):
    """XLSX CSV'den subs çıkar. Total max kullanmaz, sabit 97 alır."""
    rows = []
    with open(csv_path, encoding='utf-8') as f:
        for r in csv.DictReader(f):
            m = int(float(r['Minutes played'])) if r['Minutes played'] else 0
            rows.append({
                'name': r['Player'].strip(),
                'team': r['Team'].strip(),
                'minutes': m,
                'pos': r['Position'].strip() if r['Position'] else '-',
            })

    # Grupları ayır
    full, starters, subs = [], [], []
    for r in rows:
        if r['minutes'] >= total_match_min - 5:  # 92+
            full.append(r)
        elif r['minutes'] >= 45:  # starter çıktı
            starters.append(r)
        elif r['minutes'] >= 5:  # sub (Sara 11 gibi)
            subs.append(r)
        # 0-4 dk: çok kısa, atla (sakatlık sub'ı olabilir, ama analiz için)

    # Pairing
    pairs, used_starters = [], set()
    # Sub'ları en çok oynayandan aza sırala
    for sub in sorted(subs, key=lambda x: -x['minutes']):
        sub_in_minute = total_match_min - sub['minutes']
        best, best_score = None, 999
        for st in starters:
            if st['name'] in used_starters: continue
            st_out_minute = st['minutes']
            time_diff = abs(st_out_minute - sub_in_minute)
            pos_dist = pos_distance(st['pos'], sub['pos'])
            # Skor: zaman farkı + pozisyon cezası
            score = time_diff + pos_dist * 8
            if score < best_score:
                best_score, best = score, st
        if best and best_score <= 15:  # tolerans
            pairs.append({
                'in': sub['name'], 'out': best['name'],
                'sub_minute': sub_in_minute,
                'in_minutes': sub['minutes'],
                'out_minutes': best['minutes'],
                'score': best_score,
                'in_pos': sub['pos'], 'out_pos': best['pos'],
            })
            used_starters.add(best['name'])
    return pairs


def compare_with_expected(actual, expected):
    """Basit karşılaştırma: her beklenen (in, out) çifti bulundu mu?"""
    print("\n=== KARŞILAŞTIRMA ===")
    exp_pairs = set((e['in'], e['out']) for e in expected)
    act_pairs = set((a['in'], a['out']) for a in actual)

    print(f"Beklenen: {len(exp_pairs)} çift")
    print(f"Bulunan:  {len(act_pairs)} çift\n")

    for e in expected:
        key = (e['in'], e['out'])
        status = '✅' if key in act_pairs else '❌'
        print(f"{status} {e['sub_minute']}' ← {e['out']} ⇄ {e['in']}")

    if act_pairs - exp_pairs:
        print("\nFAZLADAN (yanlış):")
        for a in actual:
            if (a['in'], a['out']) not in exp_pairs:
                print(f"   ⚠️  {a['sub_minute']}' ← {a['out']} ⇄ {a['in']} "
                      f"(score={a['score']}, {a['out_pos']}↔{a['in_pos']})")


if __name__ == '__main__':
    # 1. XLSX CSV'sinden çıkar
    actual = infer_subs_from_csv('test/subs_test/gs_players.csv')

    print("=== ALGORİTMA ÇIKTISI ===")
    for p in actual:
        print(f"  {p['sub_minute']:>3}' ← {p['out']:25s} ⇄ {p['in']:25s} "
              f"(score={p['score']:.1f}, {p['out_pos']:>3}↔{p['in_pos']:>3})")

    # 2. Beklenen ile karşılaştır
    with open('test/subs_test/expected.json') as f:
        expected = json.load(f)['Galatasaray']
    compare_with_expected(actual, expected)
