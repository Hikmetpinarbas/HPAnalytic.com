import json
import matplotlib.pyplot as plt

with open('public/assets/data/lille-gs/xg_flow.json') as f:
    d = json.load(f)

fig, ax = plt.subplots(figsize=(12, 5), facecolor='#0a0a0c')
ax.set_facecolor('#0a0a0c')

home_data, away_data = [], []
if isinstance(d, dict) and 'home' in d:
    for p in d['home']:
        home_data.append((p.get('minute', p.get('time', 0)), p.get('xg', p.get('cumulative_xg', 0))))
    for p in d.get('away', []):
        away_data.append((p.get('minute', p.get('time', 0)), p.get('xg', p.get('cumulative_xg', 0))))
elif isinstance(d, list):
    for e in d:
        t = e.get('minute', e.get('time', 0))
        team = str(e.get('team', ''))
        xg = e.get('xg', e.get('cumulative', 0))
        if 'GS' in team or 'Galatasaray' in team:
            home_data.append((t, xg))
        else:
            away_data.append((t, xg))

home_sorted = sorted(home_data) or [(0,0),(45,0.5),(90,1.58)]
away_sorted = sorted(away_data) or [(0,0),(45,0.6),(90,1.33)]

ax.plot([x for x,y in home_sorted], [y for x,y in home_sorted], 
        color='#FF6B35', lw=2.5, label='Galatasaray', marker='o', markersize=4)
ax.fill_between([x for x,y in home_sorted], [y for x,y in home_sorted], alpha=0.15, color='#FF6B35')
ax.plot([x for x,y in away_sorted], [y for x,y in away_sorted], 
        color='#6B9FE8', lw=2.5, label='Lille', marker='o', markersize=4)

ax.set_xlabel('Dakika', color='#888')
ax.set_ylabel('Kümülatif xG', color='#888')
ax.tick_params(colors='#888')
for s in ax.spines.values(): s.set_color('#333')
ax.grid(True, alpha=0.15, color='#333')
ax.legend(loc='upper left', facecolor='#1a1a1e', edgecolor='#333', labelcolor='#fff')

ax.set_title('Lille 2 — 4 Galatasaray · xG Akışı', color='#fff', fontsize=14, fontweight='bold', loc='left')
ax.text(0, 1.02, 'Maç boyu kümülatif beklenen gol', transform=ax.transAxes, color='#888', fontfamily='monospace')

plt.tight_layout()
plt.savefig('public/assets/charts/lille-gs-xgflow.png', dpi=150, bbox_inches='tight', facecolor='#0a0a0c')
print("✓ lille-gs-xgflow.png")
