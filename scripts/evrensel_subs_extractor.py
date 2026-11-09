"""
Evrensel Oyuncu Değişikliği Çıkarıcı (Sıfırdan Temiz Sürüm)
- Dosya adlarına güvenmez, içerikten takım-oyuncu haritası çıkarır
- 3 katman: XLSX → CSV team sütunu → XML <label group=Team>
- Oyuncu isimlerindeki sayı önekini (ör. "83. ") temizler
- Takım isimlerindeki ID suffix'ini (ASCII/full-width/nbsp) temizler
"""
import xml.etree.ElementTree as ET
import csv, re, json, unicodedata
from pathlib import Path
from collections import defaultdict

MACLAR = "/storage/emulated/0/HPAnaliz/SportsBase/maclar"

# Takım ID suffix'i: "(73512)", "（73512）", "\xa0(73512)", " (73512) " vs.
TEAM_SUFFIX_RE = re.compile(
    r'\s*[\s\xa0\u00a0]*[\(\（]\s*\d+\s*[\)\）]\s*$'
)
# Oyuncu sayı öneki: "83. Aleksei Batrakov" → "Aleksei Batrakov"
PLAYER_PREFIX_RE = re.compile(r'^\s*\d+\.\s+')


def norm_team(s):
    """Takım ismini normalize et: 'VfB Stuttgart (73512)' → 'VfB Stuttgart'."""
    if s is None: return ''
    s = unicodedata.normalize('NFKC', str(s)).strip()
    # Birden fazla kez uygula (iç içe parantez durumu için)
    for _ in range(3):
        new = TEAM_SUFFIX_RE.sub('', s).strip()
        if new == s: break
        s = new
    return s


def norm_player(s):
    """Oyuncu ismini normalize et: '83. Aleksei Batrakov' → 'Aleksei Batrakov'."""
    if s is None: return ''
    s = unicodedata.normalize('NFKC', str(s)).strip()
    s = PLAYER_PREFIX_RE.sub('', s).strip()
    # Takım suffix'i de olabilir ihtimaline karşı temizle
    s = norm_team(s)
    return s


def load_teams_from_xlsx(xlsx_path):
    try:
        import pandas as pd
    except ImportError:
        return {}
    if not Path(xlsx_path).exists(): return {}
    try:
        df = pd.read_excel(xlsx_path)
        name_col = next((c for c in df.columns if str(c).lower() in
                         ('player', 'player name', 'name')), None)
        team_col = next((c for c in df.columns if str(c).lower() in
                         ('team', 'team name', 'squad')), None)
        if not name_col or not team_col: return {}
        teams = {}
        for _, row in df.iterrows():
            n, t = row[name_col], row[team_col]
            if pd.notna(n) and pd.notna(t):
                teams[norm_player(str(n))] = norm_team(str(t))
        return teams
    except Exception:
        return {}


def load_teams_from_csv(csv_path):
    teams = {}
    if not Path(csv_path).exists(): return teams
    with open(csv_path, encoding='utf-8', errors='ignore') as f:
        first = f.readline()
        delim = ';' if first.count(';') > first.count(',') else ','
        f.seek(0)
        reader = csv.DictReader(f, delimiter=delim)
        fields = reader.fieldnames or []
        team_col = next((c for c in fields if c.lower() == 'team'), None)
        if not team_col: return teams
        for row in reader:
            c = (row.get('code') or '').strip()
            t = (row.get(team_col) or '').strip()
            if not c or not t: continue
            # CSV: "83. Aleksei Batrakov (12345)"
            m = re.match(r'^\d+\.\s+(.+?)\s+\(\d+\)', c)
            if m:
                teams[norm_player(m.group(1))] = norm_team(t)
    return teams


def load_teams_from_xml(xml_path):
    """XML'de her oyuncu event'inin <label group=Team> etiketinden harita."""
    teams = {}
    if not Path(xml_path).exists(): return teams
    try:
        tree = ET.parse(xml_path)
    except Exception:
        return teams
    for inst in tree.getroot().iter('instance'):
        code_el = inst.find('code')
        if code_el is None or not code_el.text: continue
        m = re.match(r'^\d+\.\s+(.+?)\s+\(\d+\)\s*-', code_el.text.strip())
        if not m: continue
        pname = norm_player(m.group(1))
        if not pname or pname in teams: continue
        for lbl in inst.findall('label'):
            grp = lbl.find('group')
            txt = lbl.find('text')
            if grp is not None and txt is not None and grp.text == 'Team' and txt.text:
                teams[pname] = norm_team(txt.text)
                break
    return teams


def load_player_teams(md):
    md = Path(md)
    # 1. XLSX
    for xf in md.glob('*PLAYERS*XLSX*.xlsx'):
        t = load_teams_from_xlsx(xf)
        if len(t) >= 5: return t
    # 2. CSV team sütunu
    for c in md.glob('*.csv'):
        t = load_teams_from_csv(c)
        if len(t) >= 5: return t
    # 3. Tüm XML'leri birleştir
    merged = {}
    for xf in md.glob('*.xml'):
        for k, v in load_teams_from_xml(xf).items():
            if k not in merged:
                merged[k] = v
    return merged


def get_team_names_from_folder(md):
    name = Path(md).name.replace('MATCH_', '')
    parts = re.sub(r'^\d{4}_\d{2}_\d{2}_', '', name)
    if '_vs_' in parts:
        return {' '.join(w.capitalize() for w in t.split('_'))
                for t in parts.split('_vs_')}
    return set()


def extract_player_intervals(xml_path, team_names, player_teams):
    tree = ET.parse(xml_path)
    times = defaultdict(lambda: {'first': float('inf'), 'last': 0.0,
                                 'events': 0, 'team': None})
    for inst in tree.getroot().iter('instance'):
        code_el = inst.find('code')
        if code_el is None or not code_el.text: continue
        text = code_el.text.strip()
        m = re.match(r'^\d+\.\s+(.+?)\s+\(\d+\)\s*-', text)
        if not m: continue
        pname = norm_player(m.group(1))
        if not pname: continue
        if pname in team_names: continue  # takım event'i

        s_el, e_el = inst.find('start'), inst.find('end')
        if s_el is None or not s_el.text: continue
        try:
            s = float(s_el.text) / 60.0
            e = float(e_el.text) / 60.0 if e_el is not None and e_el.text else s
        except: continue

        times[pname]['first'] = min(times[pname]['first'], s)
        times[pname]['last'] = max(times[pname]['last'], e)
        times[pname]['events'] += 1
        times[pname]['team'] = player_teams.get(pname, 'Bilinmiyor')
    return times


def pos_group(pos):
    """Pozisyon grupları: benzer bölgeleri eşleştirmek için."""
    if not pos: return '-'
    pos = str(pos).upper().strip()
    if pos in ('CB', 'LCB', 'RCB'): return 'CB'
    if pos in ('RB', 'LB', 'RWB', 'LWB'): return 'FB'
    if pos in ('CDM', 'LCDM', 'RCDM', 'CM', 'LCM', 'RCM', 'DM'): return 'CM'
    if pos in ('CAM', 'RAM', 'LAM', 'RW', 'LW', 'RM', 'LM', 'AM'): return 'AM'
    if pos in ('CF', 'ST', 'LCF', 'RCF', 'SS', 'FW'): return 'FW'
    if pos == 'GK': return 'GK'
    return pos[:2]


def infer_subs_from_hybrid(md):
    """
    HİBRİT (test edilmiş): XLSX Minutes+Position + XML first/last.
    İzole testte 4/4 doğru çıktı (Sallai, Barış, Batrakov, Jakobs).
    """
    try:
        import pandas as pd
    except ImportError:
        return None
    md = Path(md)

    # === 1. XLSX: tüm oyuncu verisi ===
    xlsx_players = []
    for xf in md.glob('*PLAYERS*XLSX*.xlsx'):
        try:
            df = pd.read_excel(xf)
            if 'Player' not in df.columns: continue
            for _, r in df.iterrows():
                name = norm_player(str(r['Player']).strip())
                if not name: continue
                mins = 0
                if pd.notna(r.get('Minutes played')):
                    try: mins = int(float(r['Minutes played']))
                    except: pass
                xlsx_players.append({
                    'name': name,
                    'team': str(r['Team']).strip() if pd.notna(r['Team']) else None,
                    'minutes': mins,
                    'pos': str(r['Position']).strip() if 'Position' in df.columns and pd.notna(r['Position']) else '-',
                })
        except Exception:
            continue
    if not xlsx_players:
        return None

    # === 2. XML: sakatlık/erken çıkış tespiti için first/last ===
    xml_events = {}
    team_names = get_team_names_from_folder(md)
    for xf in md.glob('*.xml'):
        try:
            for inst in ET.parse(xf).getroot().iter('instance'):
                code_el = inst.find('code')
                if code_el is None or not code_el.text: continue
                m = re.match(r'^\d+\.\s+(.+?)\s+\(\d+\)\s*-', code_el.text.strip())
                if not m: continue
                name = norm_player(m.group(1))
                if not name or name in team_names: continue
                s_el = inst.find('start')
                if s_el is None or not s_el.text: continue
                try: sv = float(s_el.text) / 60.0
                except: continue
                if name not in xml_events:
                    xml_events[name] = sv
                else:
                    xml_events[name] = min(xml_events[name], sv)
        except Exception:
            continue

    # === 3. Toplam maç süresi ===
    all_minutes = [p['minutes'] for p in xlsx_players if p['minutes'] > 0]
    total_max = max(all_minutes) if all_minutes else 97

    # === 4. Takım bazında sınıflandır ===
    by_team = {}
    for p in xlsx_players:
        if p['minutes'] <= 0 or not p['team']: continue
        by_team.setdefault(p['team'], {'full': [], 'starters': [], 'subs': []})
        # XML'de sakatlık/erken çıkış: first_event > 3 dk ama minutes < 45 → sub
        # XML'de first_event < 3 dk + minutes < total_max - 5 → sakat çıkmış starter
        xml_first = xml_events.get(p['name'])
        if p['minutes'] >= total_max - 5:
            by_team[p['team']]['full'].append(p)
        elif xml_first is not None and xml_first < 3 and p['minutes'] < 45:
            # Çok erken çıkmış (sakat) - starter olarak işaretle
            by_team[p['team']]['starters'].append(p)
        elif p['minutes'] >= 45:
            by_team[p['team']]['starters'].append(p)
        elif p['minutes'] >= 5:
            by_team[p['team']]['subs'].append(p)
        # 0-4 dk: XML'de varsa starter olduğunu biliyoruz, değilse atla

    # === 5. Pairing: test edilmiş mantık ===
    result = {}
    for team, groups in by_team.items():
        pairs, used = [], set()
        for sub in sorted(groups['subs'], key=lambda x: -x['minutes']):
            sub_in_minute = total_max - sub['minutes']
            best, best_score = None, 999
            for st in groups['starters']:
                if st['name'] in used: continue
                time_diff = abs(st['minutes'] - sub_in_minute)
                pos_dist = _pos_distance(st['pos'], sub['pos'])
                score = time_diff + pos_dist * 8
                if score < best_score:
                    best_score, best = score, st
            if best and best_score <= 15:
                pairs.append({
                    'in': sub['name'], 'out': best['name'],
                    'sub_minute': round(sub_in_minute),
                    'in_minutes': sub['minutes'],
                    'out_minutes': best['minutes'],
                    'confidence': 'high' if best_score <= 3 else 'medium',
                })
                used.add(best['name'])
        result[team] = pairs
    return result


def _pos_group(pos):
    if not pos: return '-'
    pos = str(pos).upper().strip()
    if pos in ('CB', 'LCB', 'RCB'): return 'CB'
    if pos in ('RB', 'LB', 'RWB', 'LWB'): return 'FB'
    if pos in ('CDM', 'LCDM', 'RCDM', 'CM', 'LCM', 'RCM', 'DM'): return 'CM'
    if pos in ('CAM', 'RAM', 'LAM', 'RW', 'LW', 'RM', 'LM', 'AM'): return 'AM'
    if pos in ('CF', 'ST', 'LCF', 'RCF', 'SS', 'FW'): return 'FW'
    if pos == 'GK': return 'GK'
    return pos[:2]


def _pos_distance(p1, p2):
    g1, g2 = _pos_group(p1), _pos_group(p2)
    if g1 == g2: return 0
    adjacent = {('FB','AM'), ('AM','FB'), ('AM','FW'), ('FW','AM'),
                ('CM','AM'), ('AM','CM'), ('CB','FB'), ('FB','CB'),
                ('CB','CM'), ('CM','CB')}
    if (g1, g2) in adjacent: return 1
    return 2


def infer_subs(times, match_end_min):
    starters_out = defaultdict(dict)
    subs_in = defaultdict(dict)
    for name, d in times.items():
        if d['events'] < 3: continue
        if d['first'] < 10 and d['last'] > match_end_min - 5: continue
        if d['first'] < 10:
            starters_out[d['team']][name] = d['last']
        elif d['first'] > 15:
            subs_in[d['team']][name] = d['first']

    result = {}
    for team in starters_out.keys():
        pairs, used = [], set()
        for sub_name, sub_t in sorted(subs_in[team].items(), key=lambda x: x[1]):
            best, best_diff = None, 999
            for st_name, st_t in starters_out[team].items():
                if st_name in used: continue
                diff = abs(sub_t - st_t)
                if diff < best_diff:
                    best_diff, best = diff, st_name
            if best and best_diff <= 5:
                pairs.append({'in': sub_name, 'out': best,
                              'sub_minute': round(sub_t)})
                used.add(best)
        result[team] = pairs
    return result


def process_match(match_dir):
    md = Path(match_dir)

    # 1. KATMAN: HİBRİT (XLSX + XML) — sakatlık dahil
    subs = infer_subs_from_hybrid(md)
    if subs and any(len(v) > 0 for v in subs.values()):
        total = sum(len(v) for v in subs.values())
        return {'subs': subs, 'source': 'hybrid',
                'players': '?', 'match_end': '?', 'sub_count': total}

    # 2. KATMAN: XLSX yoksa XML event-based fallback
    player_teams = load_player_teams(md)
    team_names = get_team_names_from_folder(md)
    if player_teams:
        team_names = team_names | set(player_teams.values())

    best_xml, max_p = None, 0
    for xf in md.glob('*.xml'):
        try:
            cnt = sum(1 for inst in ET.parse(xf).getroot().iter('instance')
                      if inst.find('code') is not None and inst.find('code').text
                      and re.match(r'^\d+\.\s+.+?\(\d+\)', inst.find('code').text.strip()))
            if cnt > max_p:
                max_p, best_xml = cnt, xf
        except: continue

    if not best_xml or max_p < 10:
        return {'error': 'oyuncu event yok', 'subs': {}}

    try:
        times = extract_player_intervals(best_xml, team_names, player_teams)
        if not times:
            return {'error': 'oyuncu zaman verisi yok', 'subs': {}}
        match_end = max(d['last'] for d in times.values())
        subs = infer_subs(times, match_end)
        return {'subs': subs, 'source': 'xml',
                'players': len(times), 'match_end': round(match_end, 1)}
    except Exception as e:
        return {'error': str(e), 'subs': {}}

if __name__ == '__main__':
    matches = sorted(Path(MACLAR).glob('MATCH_*'))
    for m in matches:
        if not m.is_dir(): continue
        print(f"\n=== {m.name} ===")
        r = process_match(m)
        if r.get('error'):
            print(f"  ⚠️  Atlandı: {r['error']}")
            continue
        with open(m / 'substitutions.json', 'w', encoding='utf-8') as f:
            json.dump(r['subs'], f, ensure_ascii=False, indent=2)
        src = r.get('source', '?')
        total = sum(len(v) for v in r['subs'].values())
        print(f"  [kaynak: {src}] {total} değişiklik")
        for team, subs_list in r['subs'].items():
            for s in subs_list:
                print(f"    [{team}] {s['sub_minute']:>3}' "
                      f"← {s['out']} ⇄ {s['in']}")
