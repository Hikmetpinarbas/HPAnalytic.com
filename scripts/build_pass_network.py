"""
Pas Ağı Veri Çıkarıcısı
Kaynaklar:
  - players.csv: topun gezindiği tüm noktalar (takım bazlı)
  - teams.csv: kim ne yaptı (oyuncu bazlı)
  - goalkeepers.xlsx: gerçek sayı otoritesi (pas/yüzde)
  - players.xlsx: oyuncu istatistikleri (pas sayısı, xG vs.)

Yöntem:
  1. teams.csv'den (takım, oyuncu) bazlı ortalama pozisyon
  2. (takım, round(start,1)) bazlı eşleşme: aynı saniyede kim kime pas
  3. Ağırlık = kaç kez bu pas tekrarlandı
"""
import csv, json, re
from collections import defaultdict
from pathlib import Path
import pandas as pd

BASE = Path("public/assets/data/gs-stuttgart")
OUT = BASE / "pass_network.json"
PLAYERS_XLSX = Path("/storage/emulated/0/HPAnaliz/SportsBase/maclar/MATCH_2026_11_03_Galatasaray_vs_Stuttgart/MATCH_2026_11_03_Galatasaray_vs_Stuttgart__PLAYERS__XLSX.xlsx")

def norm(s):
    s = s.lower().strip()
    s = re.sub(r'[çğıöşü]', lambda m:{'ç':'c','ğ':'g','ı':'i','ö':'o','ş':'s','ü':'u'}[m.group()], s)
    s = re.sub(r'[áéíóúÁÉÍÓÚćĆ]', lambda m:{'á':'a','é':'e','í':'i','ó':'o','ú':'u','ć':'c','Ć':'c'}[m.group()], s)
    return s

def parse_player(code):
    """'11. Bilal El Khannouss (413859) - Passes accurate' -> (name, id)"""
    m = re.search(r"\d+\.\s+([\w\s\.\-]+?)\s+\((\d+)\)", code)
    if not m: return None, None
    return m.group(1).strip(), m.group(2)

# ===== 1. teams.csv'den oyuncu bazlı veri topla =====
player_events = defaultdict(lambda: {
    'team': None, 'name': None, 'xs': [], 'ys': [],
    'pass_count': 0, 'pass_targets': defaultdict(int),
    'by_second': defaultdict(list)  # start -> [(x,y), ...]
})

with open(BASE / "teams.csv", encoding="utf-8") as f:
    for row in csv.DictReader(f, delimiter=";"):
        if not row['pos_x'] or ' - ' not in row['code']: continue
        name, pid = parse_player(row['code'])
        if not name: continue
        team_raw = row.get('team', '')
        team = 'Galatasaray' if 'Galatasaray' in team_raw else ('VfB Stuttgart' if 'Stuttgart' in team_raw else None)
        if not team: continue
        try:
            x, y = float(row['pos_x']), float(row['pos_y'])
            start = round(float(row['start']), 1)
        except: continue
        
        key = (team, name)
        p = player_events[key]
        p['team'] = team
        p['name'] = name
        p['xs'].append(x); p['ys'].append(y)
        p['by_second'][start].append((x, y, row['action']))
        if 'pass' in row['action'].lower() and 'incomplete' not in row['action'].lower():
            p['pass_count'] += 1

# ===== 2. Pas ağını kur: aynı saniyede 2 farklı oyuncu = pas =====
# Saniyede birden fazla oyuncu kayıtlıysa, aralarında pas bağlantısı var
pass_network = defaultdict(lambda: defaultdict(int))  # (from_key, to_key) -> count

for (team, name), data in player_events.items():
    for sec, events in data['by_second'].items():
        # Aynı saniyede başka oyuncuların olayları var mı?
        for (team2, name2), data2 in player_events.items():
            if team2 != team or name2 == name: continue
            if sec in data2['by_second']:
                # Aynı saniye = muhtemel pas (veya ikili mücadele)
                pass_network[(team, name)][(team2, name2)] += 1

# ===== 3. Oyuncu konumlarını hazırla (saha pozisyonu) =====
players_out = {}
for (team, name), data in player_events.items():
    if not data['xs']: continue
    if len(data['xs']) < 3: continue  # çok az veri = atla
    
    avg_x = sum(data['xs']) / len(data['xs'])
    avg_y = sum(data['ys']) / len(data['ys'])
    
    # Formation'a göre x normalize (saldırı yönü)
    if team == 'Galatasaray':
        norm_x = avg_x  # zaten sağa doğru
    else:
        norm_x = 105 - avg_x  # Stuttgart sola doğru
    
    players_out[f"{team}|{name}"] = {
        'team': team,
        'name': name,
        'x': round(norm_x, 1),
        'y': round(avg_y, 1),
        'pass_count': data['pass_count'],
        'total_events': len(data['xs']),
    }

# ===== 4. Bağlantıları hazırla =====
connections = []
for (t1, n1), targets in pass_network.items():
    for (t2, n2), cnt in targets.items():
        if cnt >= 3:  # en az 3 kez tekrarlanan bağlantı
            k1 = f"{t1}|{n1}"
            k2 = f"{t2}|{n2}"
            if k1 in players_out and k2 in players_out:
                connections.append({
                    'from': k1, 'to': k2, 'count': cnt
                })

# Aynı çifti tek yönlü yap (a->b ve b->a birleşir)
merged = defaultdict(int)
for c in connections:
    key = tuple(sorted([c['from'], c['to']]))
    merged[key] += c['count']

final_conns = [{'from': k[0], 'to': k[1], 'weight': v} for k, v in merged.items()]
final_conns.sort(key=lambda c: -c['weight'])

# ===== 5. Oyuncu istatistiklerini players.xlsx'ten çek =====
try:
    pstats = pd.read_excel(PLAYERS_XLSX)
    stats_map = {}
    for _, row in pstats.iterrows():
        if pd.isna(row.get('Player')): continue
        key = f"{row['Team']}|{row['Player']}"
        stats_map[norm(row['Player'])] = {
            'position': row.get('Position', '-'),
            'minutes': int(row['Minutes played']) if not pd.isna(row['Minutes played']) else 0,
            'goals': int(row['Goals']) if not pd.isna(row['Goals']) else 0,
            'assists': int(row['Assists']) if not pd.isna(row['Assists']) else 0,
            'xg': float(row['xG (expected goals)']) if not pd.isna(row['xG (expected goals)']) and row['xG (expected goals)'] != '-' else 0,
            'xa': float(row['xA (expected assists)']) if not pd.isna(row['xA (expected assists)']) and row['xA (expected assists)'] != '-' else 0,
            'passes': int(row['Passes']) if not pd.isna(row['Passes']) else 0,
            'pass_pct': float(row['Passes accurate, %']) * 100 if not pd.isna(row['Passes accurate, %']) else 0,
        }
    # Oyuncu bilgilerine stats ekle
    for k, p in players_out.items():
        norm_name = norm(p['name'].split()[-1])
        for sn, st in stats_map.items():
            if norm_name in sn or sn in norm_name:
                p.update(st)
                break
except Exception as e:
    print(f"UYARI: players.xlsx okunamadı: {e}")

# ===== Çıktı =====
result = {
    'players': players_out,
    'connections': final_conns[:200],
    'meta': {
        'source': 'players.csv + teams.csv + players.xlsx',
        'method': 'time-cluster correlation (aynı saniyedeki oyuncular)',
        'player_count': len(players_out),
        'connection_count': len(final_conns)
    }
}

with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print(f"✅ {OUT}")
print(f"   Oyuncu: {len(players_out)}")
print(f"   Bağlantı: {len(final_conns)}")
print(f"   En güçlü 5 bağlantı:")
for c in final_conns[:5]:
    print(f"   {c['from']} ↔ {c['to']}: {c['weight']}")
