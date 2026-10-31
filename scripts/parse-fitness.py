import openpyxl, json, re
from datetime import datetime

def num(v):
    if v is None: return 0
    if isinstance(v, (int, float)): return v
    s = str(v).strip().replace(',', '.')
    try: return float(s)
    except: return 0

def parse_player_sheet(ws):
    rows = list(ws.iter_rows(values_only=True))
    header = [str(c).strip() if c else '' for c in rows[0]]
    players = []
    for r in rows[1:]:
        if not r[1]: continue
        p = {'name': str(r[1]).strip()}
        for i, col in enumerate(header):
            if i < len(r):
                v = r[i]
                if col in ('Player','Nationality'): p[col.lower()] = str(v or '').strip()
                elif col == '№': p['number'] = int(num(v))
                elif col in ('Age','Year of birth','Height','Weight'): p[col.lower().replace(' ','_')] = int(num(v))
                else: p[col.lower().replace(' ','_').replace(',','').replace('(','').replace(')','').replace('/','_').replace('.','').replace('>','gt').replace('<','lt').replace('-','_').replace('__','_')] = num(v)
        players.append(p)
    return players

def parse_team_sheet(ws):
    rows = list(ws.iter_rows(values_only=True))
    header = [str(c).strip() if c else '' for c in rows[0]]
    matches = []
    current = None
    for r in rows[1:]:
        if not r or len(r) < 5: continue
        date_v, ha, opp, score, team = r[0], r[1], r[2], r[3], r[4]
        if not team or str(team).strip() in ('Total','total'): continue
        team = str(team).strip()
        if team == 'GAL':
            if current and current.get('gal'): matches.append(current)
            current = {'date': date_v.isoformat() if hasattr(date_v,'isoformat') else str(date_v), 
                       'home_away': str(ha or ''), 'opponent': str(opp or ''), 'score': str(score or ''), 'gal': {}, 'opp': {}}
        tgt = 'gal' if team == 'GAL' else 'opp'
        if not current: continue
        for i, col in enumerate(header):
            if i < len(r) and i >= 5:
                key = col.lower().replace(' ','_').replace(',','').replace('(','').replace(')','').replace('/','_').replace('.','').replace('>','gt').replace('<','lt').replace('-','_').replace('__','_')
                current[tgt][key] = num(r[i])
    if current and current.get('gal'): matches.append(current)
    return matches

# Player
pwb = openpyxl.load_workbook("/storage/emulated/0/Download/31.10.2026 - Galatasaray - Player fitness.xlsx", data_only=True)
player_data = {
    'metadata': {'team': 'Galatasaray', 'source': 'Player fitness 2026-10-31'},
    'all': parse_player_sheet(pwb['Tüm maçlar']),
    'league': parse_player_sheet(pwb['Lig maçları']),
    'europe': parse_player_sheet(pwb['Avrupa'])
}
with open('public/assets/data/fitness/player-fitness.json','w',encoding='utf-8') as f:
    json.dump(player_data, f, indent=2, ensure_ascii=False)
print(f"✓ player-fitness.json: {len(player_data['all'])} oyuncu")

# Team
twb = openpyxl.load_workbook("/storage/emulated/0/Download/31.10.2026 - Galatasaray - Team fitness.xlsx", data_only=True)
team_data = {
    'metadata': {'team': 'Galatasaray', 'source': 'Team fitness 2026-10-31'},
    'all': parse_team_sheet(twb['Tüm maçlar']),
    'league': parse_team_sheet(twb['Lig maçları']),
    'europe': parse_team_sheet(twb['Avrupa'])
}
with open('public/assets/data/fitness/team-fitness.json','w',encoding='utf-8') as f:
    json.dump(team_data, f, indent=2, ensure_ascii=False)
print(f"✓ team-fitness.json: {len(team_data['all'])} maç")
