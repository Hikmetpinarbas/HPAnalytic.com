import json
import matplotlib.pyplot as plt
import matplotlib.patches as patches

pkg = 'public/assets/data/packages/lille-gs-2026-10-21.json'
with open(pkg) as f: d = json.load(f)
shots = d['shot_map']

fig, ax = plt.subplots(figsize=(10, 6.5), facecolor='#0a0a0c')
ax.set_facecolor('#0a0a0c')
c = '#B4FF39'

# Saha
ax.plot([0,105,105,0,0],[0,0,68,68,0], color=c, alpha=0.3, lw=1.5)
ax.plot([52.5,52.5],[0,68], color=c, alpha=0.3, lw=1.5)
ax.add_patch(patches.Circle((52.5,34),9.15,fill=False,edgecolor=c,alpha=0.3,lw=1.5))
ax.plot([0,16.5,16.5,0],[13.84,13.84,54.16,54.16],color=c,alpha=0.3,lw=1.5)
ax.plot([105,88.5,88.5,105],[13.84,13.84,54.16,54.16],color=c,alpha=0.3,lw=1.5)

# Şutlar
for s in shots:
    x,y,xg = s['x'], s['y'], s['xg']
    color = '#FFFFFF' if s.get('is_goal') else '#FF6B35'
    size = 100 + 800 * xg
    ax.scatter(x, y, s=size, c=color, alpha=0.85, edgecolors='#0a0a0c', linewidths=0.8, zorder=5)

ax.text(0, 73, "Lille 2 — 4 Galatasaray", color='#fff', fontsize=16, fontweight='bold')
ax.text(0, 70, f"Şut Haritası · {len(shots)} şut · xG {d['metadata']['total_xg']}", color='#888', fontsize=10, fontfamily='monospace')

ax.scatter(3, 63, s=150, c='#FFFFFF', alpha=0.85, edgecolors='#0a0a0c')
ax.text(6, 62.5, 'Gol', color='#fff', fontsize=9, fontfamily='monospace', va='center')
ax.scatter(3, 60, s=150, c='#FF6B35', alpha=0.85, edgecolors='#0a0a0c')
ax.text(6, 59.5, 'Şut', color='#fff', fontsize=9, fontfamily='monospace', va='center')

ax.set_xlim(-3, 110); ax.set_ylim(-3, 78)
ax.axis('off')
plt.savefig('public/assets/charts/lille-gs-shotmap.png', dpi=150, bbox_inches='tight', facecolor='#0a0a0c')
print("✓ lille-gs-shotmap.png")
