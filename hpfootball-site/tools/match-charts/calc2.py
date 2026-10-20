import pandas as pd, numpy as np, json
p=pd.read_excel('../data/fb/19.10.2026 - Europe. UEFA Champions League - Player statistics.xlsx',sheet_name='Tüm maçlar')
p=p.replace('-',0)
G={'CB':'Stoper','LCB':'Stoper','RCB':'Stoper','LB':'Bek','RB':'Bek','LWB':'Bek','RWB':'Bek',
   'CDM':'Ön libero / merkez','LCDM':'Ön libero / merkez','RCDM':'Ön libero / merkez','LCM':'Ön libero / merkez','RCM':'Ön libero / merkez',
   'CAM':'Hücum orta saha / kanat','LAM':'Hücum orta saha / kanat','RAM':'Hücum orta saha / kanat','LCAM':'Hücum orta saha / kanat','RCAM':'Hücum orta saha / kanat','LM':'Hücum orta saha / kanat','RM':'Hücum orta saha / kanat',
   'CF':'Santrfor','LCF':'Santrfor','RCF':'Santrfor'}
p['grp']=p.Position.map(G); p['min']=pd.to_numeric(p['Minutes played'],errors='coerce').fillna(0)
num=lambda c: pd.to_numeric(p[c],errors='coerce').fillna(0)
def per90(c): return num(c)/p['min']*90
M={ # label, series, higher_is_better
 'xG':(lambda: per90('xG (expected goals)'),1),'xA':(lambda: per90('xA (expected assists)'),1),
 'Şut':(lambda: per90('Shots'),1),'Kilit pas':(lambda: per90('Key passes'),1),
 'Başarılı çalım':(lambda: per90('Dribbles successful'),1),'Ceza sahasına pas':(lambda: per90('Passes into the penalty box accurate'),1),
 'Son üçte bire giriş':(lambda: per90('Final third entries'),1),'Top kazanma':(lambda: per90('Ball recoveries'),1),
 'Progresif pas':(lambda: per90('Progressive passes accurate'),1),'Pas isabeti %':(lambda: num('Passes accurate, %'),1),
 'İleri pas (son üçte bir)':(lambda: per90('Passes forward to the final third accurate'),1),'Top kesme':(lambda: per90('Interceptions'),1),
 'Savunma ikilisi %':(lambda: num('Defensive challenges won, %'),1),'Hava topu %':(lambda: num('Aerial challenges won, %'),1),
 'Az top kaybı':(lambda: per90('Lost balls'),0),'Başarılı müdahale':(lambda: per90('Tackles successful'),1),
 'İsabetli orta':(lambda: per90('Crosses accurate'),1),'Kendi yarısında az kayıp':(lambda: per90('Lost balls in own half'),0),
}
AX={'Santrfor':['xG','Şut','xA','Kilit pas','Son üçte bire giriş','Hava topu %','Başarılı çalım','Top kazanma'],
    'Hücum orta saha / kanat':['xG','xA','Kilit pas','Ceza sahasına pas','Başarılı çalım','Son üçte bire giriş','Top kazanma','Az top kaybı'],
    'Ön libero / merkez':['Progresif pas','Pas isabeti %','İleri pas (son üçte bir)','Kilit pas','Top kesme','Top kazanma','Savunma ikilisi %','Az top kaybı'],
    'Bek':['Progresif pas','İsabetli orta','Kilit pas','Son üçte bire giriş','Top kazanma','Başarılı müdahale','Savunma ikilisi %','Kendi yarısında az kayıp'],
    'Stoper':['Progresif pas','Pas isabeti %','İleri pas (son üçte bir)','Top kesme','Top kazanma','Savunma ikilisi %','Hava topu %','Kendi yarısında az kayıp']}
vals={k:f() for k,(f,_) in M.items()}
MIN=90
out={'min':MIN,'groups':{},'players':[]}
for g,axes in AX.items():
    pop=p[(p.grp==g)&(p['min']>=MIN)]
    out['groups'][g]={'axes':axes,'n':int(len(pop))}
    for i in pop.index:
        t=str(p.at[i,'Team'])
        if not any(s in t for s in ('Fenerbahce','Slavia')): continue
        row={'p':p.at[i,'Player'],'team':'fb' if 'Fener' in t else 'sla','pos':p.at[i,'Position'],'grp':g,'min':int(p.at[i,'min']),'axes':[]}
        for a in axes:
            v=vals[a]; hb=M[a][1]; s=v[pop.index]
            pct=(s<v[i]).mean()*100+(s==v[i]).mean()*50
            if not hb: pct=100-pct
            row['axes'].append({'a':a,'v':round(float(v[i]),2),'pct':round(float(pct))})
        out['players'].append(row)
for r in out['players']: print(r['team'],r['p'],r['grp'],r['min'],[x['pct'] for x in r['axes']])
print({g:v['n'] for g,v in out['groups'].items()})
json.dump(out,open('fbcharts_players.json','w'),ensure_ascii=False)
