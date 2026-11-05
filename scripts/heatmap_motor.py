import os, csv, json, shutil, datetime
from collections import defaultdict, Counter

CSV = "/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175305/stats/Konyaspor 0-4 Galatasaray 30.10.2026, Full match.csv"
REPO = os.path.expanduser("~/hpanalytic-repo")
OUT_JSON = os.path.join(REPO, "public/assets/data/konya-gs/players_heatmap.json")
P_HTML = os.path.join(REPO, "public/yazi/konya-gs-v2.html")

# ============ 1. HAM VERİ ÇIKAR ============
print("=== 1. HAM VERİ ÇIKARILIYOR ===")
data = {"all": {"konya": {}, "gs": {}}, "1h": {"konya": {}, "gs": {}}, "2h": {"konya": {}, "gs": {}}}
total_rows = 0

with open(CSV, encoding='utf-8', errors='replace') as f:
    r = csv.DictReader(f, delimiter=';')
    for row in r:
        team_raw = row.get('team', '')
        if 'Konyaspor' in team_raw: tid = 'konya'
        elif 'Galatasaray' in team_raw: tid = 'gs'
        else: continue

        code = row.get('code', '')
        if ' - ' not in code: continue
        p_info, action = code.split(' - ', 1)
        parts = p_info.split('. ', 1)
        if len(parts) != 2: continue
        jersey = parts[0].strip()
        name = parts[1].split(' (')[0].strip()
        if not jersey.isdigit() or jersey == '0': continue

        try:
            x = float(row.get('pos_x', 0))
            y = float(row.get('pos_y', 0))
        except: continue
        if x == 0 and y == 0: continue

        half = row.get('half', '1')
        total_rows += 1

        for cat in ['all', '1h' if half == '1' else '2h']:
            team_d = data[cat][tid]
            if jersey not in team_d:
                team_d[jersey] = {"name": name, "points": [], "actions": []}
            team_d[jersey]["points"].append([round(x, 1), round(y, 1)])
            team_d[jersey]["actions"].append(action)

# Finalize
final = {}
for cat in ['all', '1h', '2h']:
    final[cat] = {"konya": [], "gs": []}
    for tid in ['konya', 'gs']:
        for jersey, p in data[cat][tid].items():
            if len(p["points"]) < 3: continue
            xs = [pt[0] for pt in p["points"]]
            ys = [pt[1] for pt in p["points"]]
            top = [a for a, _ in Counter(p["actions"]).most_common(3)]
            final[cat][tid].append({
                "id": int(jersey),
                "name": p["name"],
                "avg": [round(sum(xs)/len(xs), 1), round(sum(ys)/len(ys), 1)],
                "points": p["points"],
                "actions": top,
                "samples": len(p["points"])
            })
        final[cat][tid].sort(key=lambda x: x["id"])

os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
with open(OUT_JSON, 'w', encoding='utf-8') as f:
    json.dump(final, f, ensure_ascii=False)

print(f"  Toplam {total_rows} aksiyon işlendi")
print(f"  JSON: {os.path.getsize(OUT_JSON)//1024} KB")
for cat in ['all', '1h', '2h']:
    k = final[cat]['konya']; g = final[cat]['gs']
    total_pts = sum(p['samples'] for p in k) + sum(p['samples'] for p in g)
    print(f"  [{cat}] Konya: {len(k)} oyuncu ({sum(p['samples'] for p in k)} nokta), GS: {len(g)} oyuncu ({sum(p['samples'] for p in g)} nokta)")

# ============ 2. HTML MOTORU GÜNCELLE ============
print("\n=== 2. HTML MOTORU ===")
shutil.copy2(P_HTML, P_HTML + ".bak.heatmap." + datetime.datetime.now().strftime("%H%M%S"))
s = open(P_HTML, encoding='utf-8').read()

# Eski motoru sil
start = s.find('<style id="hp-motor-css">')
if start != -1:
    end = s.find('</script>', start) + len('</script>')
    s = s[:start] + '<div id="hp-pos-motor"></div>' + s[end:]

motor = r'''
<style id="hp-motor-css">
.hp-tabs{display:flex;gap:0.5rem;justify-content:center;margin:1.5rem 0}
.hp-tab{background:#0D0E12;color:#8A8A93;border:1px solid #2A2B33;padding:0.4rem 1rem;border-radius:20px;font-family:monospace;font-size:0.8rem;cursor:pointer;transition:0.2s}
.hp-tab.active{background:#B4FF39;color:#000;border-color:#B4FF39;font-weight:bold}
.hp-panel{background:#050605;border:1px solid #1B1B21;border-radius:12px;padding:1rem;margin-bottom:1rem}
.hp-title{font-family:monospace;text-align:center;margin-bottom:0.5rem;font-size:0.9rem;letter-spacing:1px;font-weight:bold}
.hp-svg{width:100%;height:auto;display:block;background:#08090B;border-radius:8px}
.hp-legend{font-family:monospace;font-size:0.7rem;color:#8A8A93;text-align:center;margin-top:0.5rem;padding:0.5rem;background:#0D0E12;border-radius:4px}
.hp-label{cursor:pointer}
.hp-label rect{transition:all 0.2s}
.hp-label:hover rect{stroke:#fff;stroke-width:0.4}
</style>

<div id="hp-pos-motor"></div>

<script>
(function(){
    const REPO = "/assets/data/konya-gs/players_heatmap.json";
    const COLORS = {
        konya: "#FF6B35",
        gs:    "#B4FF39"
    };
    
    let activeHalf = "all";
    let data = null;
    let selected = null;
    
    function renderTeam(teamId, players) {
        const svg = document.getElementById("hp-svg-" + teamId);
        if(!svg) return;
        svg.querySelectorAll(".hp-dots-group, .hp-label-group").forEach(e => e.remove());
        
        const color = COLORS[teamId];
        const ns = "http://www.w3.org/2000/svg";
        
        const dotGroup = document.createElementNS(ns, "g");
        dotGroup.setAttribute("class", "hp-dots-group");
        svg.appendChild(dotGroup);
        
        const labelGroup = document.createElementNS(ns, "g");
        labelGroup.setAttribute("class", "hp-label-group");
        svg.appendChild(labelGroup);
        
        players.forEach(p => {
            // Nokta bulutu
            const pg = document.createElementNS(ns, "g");
            p.points.forEach(([x, y]) => {
                const dot = document.createElementNS(ns, "circle");
                dot.setAttribute("class", "hp-dot");
                dot.setAttribute("data-team", teamId);
                dot.setAttribute("data-id", p.id);
                dot.setAttribute("cx", x);
                dot.setAttribute("cy", y);
                dot.setAttribute("r", "0.6");
                dot.setAttribute("fill", color);
                dot.setAttribute("opacity", "0.22");
                dot.setAttribute("pointer-events", "none");
                pg.appendChild(dot);
            });
            dotGroup.appendChild(pg);
            
            // Oyuncu etiketi (ortalama pozisyon)
            const g = document.createElementNS(ns, "g");
            g.setAttribute("class", "hp-label");
            g.setAttribute("transform", `translate(${p.avg[0]}, ${p.avg[1]})`);
            g.setAttribute("data-team", teamId);
            g.setAttribute("data-id", p.id);
            
            const rect = document.createElementNS(ns, "rect");
            rect.setAttribute("x", "-2.8"); rect.setAttribute("y", "-2.8");
            rect.setAttribute("width", "5.6"); rect.setAttribute("height", "5.6");
            rect.setAttribute("rx", "1"); rect.setAttribute("fill", color);
            rect.setAttribute("stroke", "#000"); rect.setAttribute("stroke-width", "0.15");
            
            const txt = document.createElementNS(ns, "text");
            txt.setAttribute("font-size", "2.6");
            txt.setAttribute("text-anchor", "middle");
            txt.setAttribute("dominant-baseline", "central");
            txt.setAttribute("font-family", "monospace");
            txt.setAttribute("font-weight", "bold");
            txt.setAttribute("fill", "#000");
            txt.textContent = p.id;
            
            g.appendChild(rect);
            g.appendChild(txt);
            labelGroup.appendChild(g);
            
            g.addEventListener("click", () => togglePlayer(teamId, p.id));
        });
    }
    
    function togglePlayer(teamId, id) {
        const dots = document.querySelectorAll(".hp-dot");
        if (selected && selected.team === teamId && selected.id === id) {
            selected = null;
            dots.forEach(d => d.setAttribute("opacity", "0.22"));
        } else {
            selected = { team: teamId, id: id };
            dots.forEach(d => {
                const sameTeam = d.getAttribute("data-team") === teamId;
                const sameId = parseInt(d.getAttribute("data-id")) === id;
                d.setAttribute("opacity", (sameTeam && sameId) ? "0.85" : "0.04");
            });
        }
    }
    
    function render() {
        const box = document.getElementById("hp-pos-motor");
        if(!box || !data) return;
        selected = null;
        
        const half = data[activeHalf];
        box.innerHTML = `
            <div class="hp-tabs">
                <button class="hp-tab ${activeHalf==='all'?'active':''}" onclick="window.hpSetHalf('all')">Tüm Maç</button>
                <button class="hp-tab ${activeHalf==='1h'?'active':''}" onclick="window.hpSetHalf('1h')">1. Yarı</button>
                <button class="hp-tab ${activeHalf==='2h'?'active':''}" onclick="window.hpSetHalf('2h')">2. Yarı</button>
            </div>
            <div class="hp-panel">
                <div class="hp-title" style="color:${COLORS.konya}">KONYASPOR · Aksiyon Haritası</div>
                <svg class="hp-svg" viewBox="0 0 105 68" id="hp-svg-konya">
                    <rect width="105" height="68" fill="none" stroke="#1B1B21" stroke-width="0.4"/>
                    <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="#1B1B21" stroke-width="0.4"/>
                    <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="#1B1B21" stroke-width="0.4"/>
                    <rect x="0" y="13.85" width="16.5" height="40.3" fill="none" stroke="#1B1B21" stroke-width="0.4"/>
                    <rect x="88.5" y="13.85" width="16.5" height="40.3" fill="none" stroke="#1B1B21" stroke-width="0.4"/>
                </svg>
                <div class="hp-legend">Her nokta 1 aksiyon · Oyuncuya tıkla → sadece onun aksiyonları</div>
            </div>
            <div class="hp-panel">
                <div class="hp-title" style="color:${COLORS.gs}">GALATASARAY · Aksiyon Haritası</div>
                <svg class="hp-svg" viewBox="0 0 105 68" id="hp-svg-gs">
                    <rect width="105" height="68" fill="none" stroke="#1B1B21" stroke-width="0.4"/>
                    <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="#1B1B21" stroke-width="0.4"/>
                    <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="#1B1B21" stroke-width="0.4"/>
                    <rect x="0" y="13.85" width="16.5" height="40.3" fill="none" stroke="#1B1B21" stroke-width="0.4"/>
                    <rect x="88.5" y="13.85" width="16.5" height="40.3" fill="none" stroke="#1B1B21" stroke-width="0.4"/>
                </svg>
                <div class="hp-legend">Her nokta 1 aksiyon · Oyuncuya tıkla → sadece onun aksiyonları</div>
            </div>
        `;
        
        setTimeout(() => {
            renderTeam("konya", half.konya);
            renderTeam("gs", half.gs);
        }, 50);
    }
    
    window.hpSetHalf = (h) => { activeHalf = h; render(); };
    
    fetch(REPO + "?v=" + Date.now()).then(r => r.json()).then(j => { data = j; render(); });
})();
</script>
'''

s = s.replace('<div id="hp-pos-motor"></div>', motor)
open(P_HTML, 'w', encoding='utf-8').write(s)
print(f"  ✓ HTML güncellendi ({len(s)} char)")
print("\nCtrl+Shift+R ile sayfayı yenile.")
print("BITTI")
