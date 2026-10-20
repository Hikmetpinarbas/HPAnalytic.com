import pandas as pd, numpy as np, json, re, sys
D='../data/'
FACET=re.compile(r'^Involvement in')
def load(path):
    d=pd.read_csv(path,sep=';')
    s1=d.loc[d.action=='Start of the 1st half','start'].iloc[0]; s2=d.loc[d.action=='Start of the 2nd half','start'].iloc[0]
    d['minute']=np.where(d.half==1,(d.start-s1)/60,45+(d.start-s2)/60)
    d['tname']=d.team.astype(str).str.replace(r'\s*\(\d+\)','',regex=True)
    d['player']=d.code.astype(str).str.extract(r'^\d+\.\s*(.+?)\s*\(\d+\)')[0]
    d['num']=d.code.astype(str).str.extract(r'^(\d+)\.')[0]
    return d
def momentum(d,team,opp,binm=3):
    on=d[d.player.notna() & ~d.action.str.match(FACET) & d.pos_x.notna()]
    on=on.drop_duplicates(['player','start'])
    out={}
    for t in (team,opp):
        x=on[(on.tname==t)&(on.pos_x>70)]
        out[t]=np.histogram(x.minute.clip(0,95),bins=np.arange(0,96+binm,binm))[0]
    diff=(out[team]-out[opp]).astype(float)
    sm=np.convolve(diff,np.ones(3)/3,mode='same')
    goals=d[d.action=='Goals'][['tname','minute','player']]
    shots=d[d.action.isin(['Shots on target','Shots off target','Shots blocked','Shots on post / bar'])].drop_duplicates(['player','start'])
    return {'bin':binm,'v':[round(v,2) for v in sm],'raw':diff.tolist(),
            'goals':[{'t':r.tname,'m':round(r.minute,1),'p':r.player} for r in goals.itertuples()],
            'shots':{t:[round(m,1) for m in shots[shots.tname==t].minute] for t in (team,opp)}}
def network(d,team,minev=15,win=5.0,minedge=3):
    on=d[d.player.notna() & ~d.action.str.match(FACET)].drop_duplicates(['player','start']).sort_values('start')
    acc=set(d[(d.action=='Passes accurate')].apply(lambda r:(r.player,r.start),axis=1))
    rows=on[['player','tname','start','pos_x','pos_y','num']].to_dict('records')
    E={}; npass={}
    for i,r in enumerate(rows):
        if r['tname']!=team or (r['player'],r['start']) not in acc: continue
        npass[r['player']]=npass.get(r['player'],0)+1
        for q in rows[i+1:]:
            if q['start']-r['start']>win: break
            if q['start']<=r['start']: continue
            if q['tname']!=team: break
            if q['player']!=r['player']:
                k=tuple(sorted((r['player'],q['player']))); E[k]=E.get(k,0)+1; break
    tm=on[(on.tname==team)&on.pos_x.notna()]
    g=tm.groupby('player').agg(x=('pos_x','median'),y=('pos_y','median'),n=('start','size'),num=('num','first'))
    g=g[g.n>=minev]
    nodes=[{'p':p,'x':round(r.x,1),'y':round(r.y,1),'n':int(r.n),'num':r.num,'pass':npass.get(p,0)} for p,r in g.iterrows()]
    keep=set(g.index)
    edges=[{'a':a,'b':b,'w':w} for (a,b),w in E.items() if w>=minedge and a in keep and b in keep]
    return {'nodes':nodes,'edges':sorted(edges,key=lambda e:-e['w']),'linked':int(sum(E.values())),'passes':int(sum(npass.values()))}
res={}
vil=load(D+'fb/Aston Villa 6-0 Fenerbahce 14.10.2026, Full match.csv')
sab=load(D+'fb/Sabah 2-0 SK Slavia Prague 13.10.2026, Full match.csv')
print(vil.tname.unique(), sab.tname.unique())
print('villa goals', vil[vil.action=='Goals'][['tname','minute','player']].to_string())
print('sabah goals', sab[sab.action=='Goals'][['tname','minute','player']].to_string())
res['mom']={'fb':momentum(vil,'Fenerbahce','Aston Villa'),'sla':momentum(sab,'SK Slavia Prague','Sabah')}
res['net']={'fb':network(vil,'Fenerbahce'),'sla':network(sab,'SK Slavia Prague')}
for k,v in res['net'].items(): print(k,len(v['nodes']),len(v['edges']),v['linked'],v['passes'],v['edges'][:5])
json.dump(res,open('fbcharts_ev.json','w'),ensure_ascii=False)
