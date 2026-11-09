"""
Evrensel Oyuncu Değişikliği Çıkarıcı (XML tabanlı)
Her maçın XML'inde her oyuncunun ilk/son event zamanına bakar.
- İlk event ~0'da ve son event maç sonundan önce → çıkmış starter
- İlk event >15. dakikada → girmiş yedek
Pair by closest times.
"""
import xml.etree.ElementTree as ET
import csv, re, sys
from pathlib import Path
from collections import defaultdict

MACLAR = "/storage/emulated/0/HPAnaliz/SportsBase/maclar"

def get_teams_from_csv(csv_path):
    teams = set()
    with open(csv_path, encoding='utf-8', errors='ignore') as f:
        first = f.readline()
        delim = ';' if first.count(';') > first.count(',') else ','
        f.seek(0)
        for row in csv.DictReader(f, delimiter=delim):
            t = (row.get('team') or '').strip()
            if t: teams.add(t)
    return teams

def extract_player_times(xml_path, team_names):
    tree = ET.parse(xml_path)
    player_times = defaultdict(lambda: {'starts': [], 'ends': [], 'events': 0})
    match_end = 0
    for inst in tree.getroot().iter('instance'):
        code_el = inst.find('code')
        if code_el is None or not code_el.text: continue
        m = re.match(r'^(.+?)\s+\((\d+)\)\s+-\s+', code_el.text.strip())
        if not m: continue
        prefix = m.group(1).strip()
        if prefix in team_names: continue  # takım eventi, atla
        s_el, e_el = inst.find('start'), inst.find('end')
        if s_el is None or not s_el.text: continue
        try:
            s = float(s_el.text)
            e = float(e_el.text) if e_el is not None and e_el.text else s
        except: continue
        player_times[prefix]['starts'].append(s)
        player_times[prefix]['ends'].append(e)
        player_times[prefix]['events'] += 1
        match_end = max(match_end, e)
    result = {n: {'first': min(d['starts']), 'last': max(d['ends']), 'events': d['events']}
              for n, d in player_times.items()}
    return result, match_end

def infer_subs(player_times, match_end):
    starters_out, subs_in = {}, {}
    for name, d in player_times.items():
        if d['events'] < 3: continue
        if d['first'] < 10 and d['last'] > match_end - 5: continue  # full match
        if d['first'] < 10:
            starters_out[name] = d['last']
        elif d['first'] > 15:
            subs_in[name] = d['first']
    pairs, used = [], set()
    for sub_name, sub_t in sorted(subs_in.items(), key=lambda x: x[1]):
        best, best_diff = None, 999
        for st_name, st_t in starters_out.items():
            if st_name in used: continue
            diff = abs(sub_t - st_t)
            if diff < best_diff: best_diff, best = diff, st_name
        if best and best_diff <= 5:
            pairs.append({'in': sub_name, 'out': best, 'sub_minute': round(sub_t)})
            used.add(best)
    return pairs

def process_match(match_dir):
    md = Path(match_dir)
    xml_files = list(md.glob('*PLAYERS*XML*.xml'))
    csv_files = list(md.glob('*PLAYERS*CSV*.csv'))
    if not xml_files:
        return {'error': 'no XML', 'subs': [], 'match_end': None}
    teams = get_teams_from_csv(csv_files[0]) if csv_files else set()
    xml = max(xml_files, key=lambda p: p.stat().st_size)
    ptimes, match_end = extract_player_times(xml, teams)
    subs = infer_subs(ptimes, match_end)
    return {'subs': subs, 'players': len(ptimes), 'match_end': round(match_end, 1)}

if __name__ == '__main__':
    matches = sorted(Path(MACLAR).glob('MATCH_*'))
    total = 0
    for m in matches:
        if not m.is_dir(): continue
        print(f"\n=== {m.name} ===")
        r = process_match(m)
        if r.get('error'):
            print(f"  ⚠️  {r['error']}")
            continue
        print(f"  {r['players']} oyuncu, maç sonu {r['match_end']}', {len(r['subs'])} değişiklik")
        for s in r['subs']:
            print(f"    {s['sub_minute']:>3}'  ← {s['out']}  ⇄  {s['in']}")
        total += len(r['subs'])
    print(f"\n📊 TOPLAM: {total} değişiklik çıkarıldı")
