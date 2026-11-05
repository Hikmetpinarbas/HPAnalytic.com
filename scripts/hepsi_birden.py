import os, csv, json, shutil, datetime
from collections import Counter

CSV = "/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175305/stats/Konyaspor 0-4 Galatasaray 30.10.2026, Full match.csv"
CSV_GK = "/sdcard/HPAnalytic/data/raw/sportsbase/unknown-20261031-175305/stats/Konyaspor 0-4 Galatasaray 30.10.2026, Full match (1).csv"
REPO = os.path.expanduser("~/hpanalytic-repo")
OUT_JSON = os.path.join(REPO, "public/assets/data/konya-gs/match_data.json")
P_HTML = os.path.join(REPO, "public/yazi/konya-gs-v2.html")

# === 1. KALECİLER ===
print("=== 1. KALECİLER ===")
goalkeepers = {"konya": None, "gs": None}
if os.path.exists(CSV_GK):
    with open(CSV_GK, encoding='utf-8', errors='replace') as f:
        r = csv.DictReader(f, delimiter=';')
        for row in r:
            team_raw = row.get('team', '')
            if 'Konyaspor' in team_raw: tid = 'konya'
            elif 'Galatasaray' in team_raw: tid = 'gs'
            else: continue
            code = row.get('code', '')
            if ' - ' not in code: continue
            p_info, _ = code.split(' - ', 1)
            parts = p_info.split('. ', 1)
            if len(parts) != 2: continue
            jersey = parts[0].strip()
            name = parts[1].split(' (')[0].strip()
            if jersey.isdigit() and goalkeepers[tid] is None:
                goalkeepers[tid] = {"id": int(jersey), "name": name}
                print(f"  {tid.upper()}: #{jersey} {name}")

# === 2. OYUNCU VERİSİ ===
print("\n=== 2. OYUNCU VERİSİ ===")
data = {"all": {"konya": {}, "gs": {}}, "1h": {"konya": {}, "gs": {}}, "2h": {"konya": {}, "gs": {}}}

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
            x = float(row.get('pos_x', 0)); y = float(row.get('pos_y', 0))
        except: continue
        if x == 0 and y == 0: continue
        half = row.get('half', '1')
        for cat in ['all', '1h' if half == '1' else '2h']:
            td = data[cat][tid]
            if jersey not in td:
                td[jersey] = {"name": name, "points": [], "actions": []}
            td[jersey]["points"].append([round(x, 1), round(y, 1)])
            td[jersey]["actions"].append(action)

# === 3. İLK 11 SEÇ ===
def build_xi(team_dict, gk_info):
    plist = []
    for j, p in team_dict.items():
        if len(p["points"]) < 3: continue
        xs = [pt[0] for pt in p["points"]]
        ys = [pt[1] for pt in p["points"]]
        plist.append({
            "id": int(j), "name": p["name"],
            "avg_x": round(sum(xs)/len(xs), 1),
            "avg_y": round(sum(ys)/len(ys), 1),
            "min_x": round(min(xs), 1), "max_x": round(max(xs), 1),
            "points": p["points"],
            "actions": [a for a,_ in Counter(p["actions"]).most_common(5)],
            "samples": len(p["points"])
        })
    
    # Kaleci
    gk = None
    if gk_info:
        gk = next((p for p in plist if p["id"] == gk_info["id"]), None)
    if not gk and plist:
        plist.sort(key=lambda p: p["avg_x"])
        gk = plist[0]
    
    # Diğer 10: en çok aksiyon
    others = [p for p in plist if gk and p["id"] != gk["id"]]
    others.sort(key=lambda p: p["samples"], reverse=True)
    xi = ([gk] if gk else []) + others[:10]
    bench = others[10:]
    return xi[:11], bench  # kesin 11 max

final = {"all": {}, "1h": {}, "2h": {}}
for cat in ['all','1h','2h']:
    final[cat] = {}
    for tid in ['konya','gs']:
        xi, bench = build_xi(data[cat][tid], goalkeepers[tid])
        final[cat][tid] = {"xi": xi, "bench": bench}

os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
json.dump(final, open(OUT_JSON, 'w', encoding='utf-8'), ensure_ascii=False)
print(f"  JSON: {os.path.getsize(OUT_JSON)//1024} KB")
for cat in ['all','1h','2h']:
    for tid in ['konya','gs']:
        xi = final[cat][tid]['xi']
        print(f"  [{cat}] {tid}: {len(xi)} oyuncu (ids: {[p['id'] for p in xi]})")

# === 4. HTML MOTORU ===
print("\n=== 4. HTML MOTORU ===")
shutil.copy2(P_HTML, P_HTML + ".bak.v5." + datetime.datetime.now().strftime("%H%M%S"))
s = open(P_HTML, encoding='utf-8').read()

start = s.find('<style id="hp-motor-css">')
if start != -1:
    end = s.find('</script>', start) + len('</script>')
    s = s[:start] + '<div id="hp-pos-motor"></div>' + s[end:]

motor = r'''
<style id="hp-motor-css">
.hp-tabs{display:flex;gap:0.5rem;justify-content:center;margin:1.5rem 0;flex-wrap:wrap}
.hp-tab{background:#0D0E12;color:#8A8A93;border:1px solid #2A2B33;padding:0.5rem 1.1rem;border-radius:20px;font-family:monospace;font-size:0.8rem;cursor:pointer;transition:0.2s;font-weight:bold}
.hp-tab.active{background:#B4FF39;color:#000;border-color:#B4FF39}
.hp-panel{background:#050605;border:1px solid #1B1B21;border-radius:12px;padding:1rem;margin-bottom:1rem}
.hp-title{font-family:monospace;text-align:center;margin-bottom:0.5rem;font-size:1rem;letter-spacing:1px;font-weight:bold}
.hp-svg{width:100%;height:auto;display:block;background:#08090B;border-radius:8px}
.hp-ticker-wrap{margin-top:0.5rem;height:2.2rem;background:#0D0E12;border-radius:4px;display:flex;align-items:center;overflow:hidden;position:relative;border:1px solid #1B1B21}
.hp-ticker-text{font-family:monospace;font-size:1rem;white-space:nowrap;position:absolute;font-weight:bold;animation:tickerScroll 6s linear infinite;padding-left:100%}
@keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-100%)}}
.hp-pl{transition:transform 4s cubic-bezier(0.4,0,0.2,1)}
.hp-txt{font-family:monospace;text-anchor:middle;dominant-baseline:central;font-weight:900;pointer-events:none;fill:#FFF;font-size:3.2px}
.hp-subs{font-family:monospace;color:#8A8A93;padding:1rem;background:#0D0E12;border-radius:8px;font-size:0.85rem;line-height:1.6}
.hp-subs h3{color:#B4FF39;margin-bottom:0.8rem;font-size:0.9rem;letter-spacing:1px}
.hp-subs .team-block{margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid #1B1B21}
.hp-subs .team-block:last-child{border:none}
.hp-subs .team-name{font-weight:bold;margin-bottom:0.5rem;font-size:1rem}
.hp-subs .sub-item{color:#E0E0E0;font-size:0.85rem;margin-left:1rem;padding:0.2rem 0}
</style>

<div id="hp-pos-motor"></div>

<script>
(function(){
    const REPO = "/assets/data/konya-gs/match_data.json";
    const COLOR_FWD = "#B4FF39";
    const COLOR_DEF = "#FF6B35";
    const TEAM_COLOR = { konya: "#00A859", gs: "#FBB800" };
    const TEAM_NAME = { konya: "KONYASPOR", gs: "GALATASARAY" };
    
    let activeTab = "all";
    let data = null;
    let timers = [];

    function updateTicker(teamId, text, color) {
        const wrap = document.getElementById("hp-ticker-" + teamId);
        if(!wrap) return;
        wrap.innerHTML = `<div class="hp-ticker-text" style="color:${color}">${text}</div>`;
    }

    function drawTrail(svg, x1, y1, x2, y2, color, dashed) {
        const ns = "http://www.w3.org/2000/svg";
        const line = document.createElementNS(ns, "line");
        line.setAttribute("x1", x1); line.setAttribute("y1", y1);
        line.setAttribute("x2", x1); line.setAttribute("y2", y1);
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", "0.8");
        line.setAttribute("stroke-linecap", "round");
        if (dashed) line.setAttribute("stroke-dasharray", "2 2");
        line.setAttribute("fill", "none");
        svg.appendChild(line);
        const t0 = performance.now();
        (function anim(t){
            const p = Math.min((t - t0) / 4000, 1);
            line.setAttribute("x2", x1 + (x2 - x1) * p);
            line.setAttribute("y2", y1 + (y2 - y1) * p);
            if (p < 1) requestAnimationFrame(anim);
        })(t0);
    }

    function drawTeam(teamId, xi) {
        const svg = document.getElementById("hp-svg-" + teamId);
        if(!svg) return;
        svg.querySelectorAll(".hp-pl, .hp-trail-svg").forEach(e => e.remove());
        
        const ns = "http://www.w3.org/2000/svg";
        const teamColor = TEAM_COLOR[teamId];
        const isKonya = teamId === "konya";
        
        const trailLayer = document.createElementNS(ns, "g");
        trailLayer.setAttribute("class", "hp-trail-svg");
        svg.appendChild(trailLayer);
        
        // KESİN 11 OYUNCU
        xi.slice(0, 11).forEach(p => {
            const getX = (x) => 105 - x;
            const baseX = getX(p.avg_x);
            const baseY = p.avg_y;
            const fwdX = isKonya ? getX(p.min_x) : getX(p.max_x);
            const bckX = isKonya ? getX(p.max_x) : getX(p.min_x);
            
            const g = document.createElementNS(ns, "g");
            g.setAttribute("class", "hp-pl");
            g.setAttribute("transform", `translate(${baseX.toFixed(1)}, ${baseY.toFixed(1)})`);
            
            const rect = document.createElementNS(ns, "rect");
            rect.setAttribute("x", "-3"); rect.setAttribute("y", "-3");
            rect.setAttribute("width", "6"); rect.setAttribute("height", "6");
            rect.setAttribute("rx", "1.2");
            rect.setAttribute("fill", teamColor);
            rect.setAttribute("stroke", "#000"); rect.setAttribute("stroke-width", "0.2");
            
            const txt = document.createElementNS(ns, "text");
            txt.setAttribute("class", "hp-txt");
            txt.textContent = p.id;
            
            g.appendChild(rect); g.appendChild(txt);
            svg.appendChild(g);
            
            const offAct = p.actions[0] || "Hücum";
            const defAct = p.actions[1] || "Defans";
            
            function cycle(){
                updateTicker(teamId, `#${p.id} ${p.name} — ${offAct}`, COLOR_FWD);
                g.setAttribute("transform", `translate(${fwdX.toFixed(1)}, ${baseY.toFixed(1)})`);
                drawTrail(svg, baseX, baseY, fwdX, baseY, COLOR_FWD, false);
                
                timers.push(setTimeout(() => {
                    updateTicker(teamId, `#${p.id} ${p.name} — ${defAct}`, COLOR_DEF);
                    g.setAttribute("transform", `translate(${bckX.toFixed(1)}, ${baseY.toFixed(1)})`);
                    drawTrail(svg, baseX, baseY, bckX, baseY, COLOR_DEF, true);
                    
                    timers.push(setTimeout(() => {
                        g.setAttribute("transform", `translate(${baseX.toFixed(1)}, ${baseY.toFixed(1)})`);
                        timers.push(setTimeout(cycle, 2000));
                    }, 5500));
                }, 5500));
            }
            timers.push(setTimeout(cycle, 3000 + Math.random() * 800));
        });
        console.log("[" + teamId.toUpperCase() + "] " + Math.min(xi.length, 11) + " oyuncu");
    }

    function renderMatch(){
        timers.forEach(clearTimeout); timers = [];
        const box = document.getElementById("hp-pos-motor");
        const halfData = data[activeTab];
        
        box.innerHTML = `
            <div class="hp-tabs">
                <button class="hp-tab ${activeTab==='all'?'active':''}" onclick="window.hpSet('all')">Tüm Maç</button>
                <button class="hp-tab ${activeTab==='1h'?'active':''}" onclick="window.hpSet('1h')">1. Yarı</button>
                <button class="hp-tab ${activeTab==='2h'?'active':''}" onclick="window.hpSet('2h')">2. Yarı</button>
                <button class="hp-tab ${activeTab==='subs'?'active':''}" onclick="window.hpSet('subs')">Değişiklikler</button>
            </div>
            <div class="hp-panel">
                <div class="hp-title" style="color:${TEAM_COLOR.konya}">${TEAM_NAME.konya} (Ev)</div>
                <svg class="hp-svg" viewBox="0 0 105 68" id="hp-svg-konya">
                    <rect width="105" height="68" fill="none" stroke="#1B1B21" stroke-width="0.4"/>
                    <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="#1B1B21" stroke-width="0.4"/>
                    <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="#1B1B21" stroke-width="0.4"/>
                    <rect x="0" y="13.85" width="16.5" height="40.3" fill="none" stroke="#1B1B21" stroke-width="0.4"/>
                    <rect x="88.5" y="13.85" width="16.5" height="40.3" fill="none" stroke="#1B1B21" stroke-width="0.4"/>
                </svg>
                <div class="hp-ticker-wrap" id="hp-ticker-konya"></div>
            </div>
            <div class="hp-panel">
                <div class="hp-title" style="color:${TEAM_COLOR.gs}">${TEAM_NAME.gs} (Deplasman)</div>
                <svg class="hp-svg" viewBox="0 0 105 68" id="hp-svg-gs">
                    <rect width="105" height="68" fill="none" stroke="#1B1B21" stroke-width="0.4"/>
                    <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="#1B1B21" stroke-width="0.4"/>
                    <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="#1B1B21" stroke-width="0.4"/>
                    <rect x="0" y="13.85" width="16.5" height="40.3" fill="none" stroke="#1B1B21" stroke-width="0.4"/>
                    <rect x="88.5" y="13.85" width="16.5" height="40.3" fill="none" stroke="#1B1B21" stroke-width="0.4"/>
                </svg>
                <div class="hp-ticker-wrap" id="hp-ticker-gs"></div>
            </div>
        `;
        
        setTimeout(() => {
            drawTeam("konya", halfData.konya.xi);
            drawTeam("gs", halfData.gs.xi);
        }, 50);
    }

    function renderSubs(){
        timers.forEach(clearTimeout); timers = [];
        const box = document.getElementById("hp-pos-motor");
        const half = data["all"];
        
        function subsBlock(tid){
            const tc = TEAM_COLOR[tid], tn = TEAM_NAME[tid];
            const bench = half[tid].bench || [];
            return `
                <div class="team-block">
                    <div class="team-name" style="color:${tc}">${tn}</div>
                    <div style="color:#FFF;font-weight:bold;margin-bottom:0.5rem">► Oyuna Giren Oyuncular (${Math.min(bench.length, 7)})</div>
                    ${bench.length > 0 ? bench.slice(0,7).map(p => `<div class="sub-item">► <span style="color:${tc}">#${p.id}</span> ${p.name} <span style="color:#8A8A93">(${p.samples} aksiyon)</span></div>`).join('') : '<div class="sub-item" style="color:#8A8A93">Kayıtlı değişiklik yok</div>'}
                    <div style="color:#8A8A93;font-size:0.75rem;margin-top:0.5rem;font-style:italic">Kural: 5 normal + 2 travma = 7 max</div>
                </div>
            `;
        }
        
        box.innerHTML = `
            <div class="hp-tabs">
                <button class="hp-tab ${activeTab==='all'?'active':''}" onclick="window.hpSet('all')">Tüm Maç</button>
                <button class="hp-tab ${activeTab==='1h'?'active':''}" onclick="window.hpSet('1h')">1. Yarı</button>
                <button class="hp-tab ${activeTab==='2h'?'active':''}" onclick="window.hpSet('2h')">2. Yarı</button>
                <button class="hp-tab active" onclick="window.hpSet('subs')">Değişiklikler</button>
            </div>
            <div class="hp-subs">
                <h3>OYUNA GİREN OYUNCULAR</h3>
                ${subsBlock("konya")}
                ${subsBlock("gs")}
            </div>
        `;
    }

    function render(){
        if(!data) return;
        if(activeTab === "subs") renderSubs();
        else renderMatch();
    }
    
    window.hpSet = (t) => { activeTab = t; render(); };
    
    fetch(REPO + "?v=" + Date.now()).then(r => r.json()).then(j => { data = j; render(); });
})();
</script>
'''

s = s.replace('<div id="hp-pos-motor"></div>', motor)
open(P_HTML, 'w', encoding='utf-8').write(s)
print(f"  ✓ HTML: {len(s)} char")
print("\nCtrl+Shift+R. F12 Console'da 11+11 olmalı.")
