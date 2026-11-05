import os, shutil, datetime

P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
shutil.copy2(P, P + ".bak.anim." + datetime.datetime.now().strftime("%H%M%S"))
s = open(P, encoding='utf-8').read()

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
.hp-ticker-wrap{margin-top:0.5rem;height:2rem;background:#0D0E12;border-radius:4px;display:flex;align-items:center;overflow:hidden;position:relative}
.hp-ticker-text{font-family:monospace;font-size:0.85rem;white-space:nowrap;position:absolute;padding-left:100%}
.hp-pl{transition:transform 2.5s cubic-bezier(.4,0,.2,1)}
.hp-txt{font-family:monospace;text-anchor:middle;dominant-baseline:central;font-weight:bold;pointer-events:none;fill:#000;font-size:2.6px}
</style>

<div id="hp-pos-motor"></div>

<script>
(function(){
    const REPO = "/assets/data/konya-gs/players_heatmap.json";
    const FWD = "#B4FF39";   // Hücum yeşili
    const DEF = "#FF6B35";   // Defans turuncusu
    const TEAM_COLOR = { konya: "#FF6B35", gs: "#B4FF39" };
    
    const OFF_ACTIONS = ["Shots on target","Shots off target","Goals","Passes forward accurate",
        "Progressive passes accurate","Involvement in positional attacks","Involvement in counterattacks",
        "Passes accurate","Incomplete passes forward"];
    const DEF_ACTIONS = ["Ball losses","Challenges won","Challenges unsuccessful","Aerial challenges won",
        "Aerial challenges lost","Inaccurate passes","Blocked shots"];
    
    let activeHalf = "all";
    let data = null;
    let timers = [];
    let tickers = {};

    function ticker(teamId, text, color) {
        const wrap = document.getElementById("hp-ticker-" + teamId);
        if(!wrap) return;
        if(tickers[teamId]) clearInterval(tickers[teamId]);
        wrap.innerHTML = `<div class="hp-ticker-text" style="color:${color}">${text}</div>`;
        const el = wrap.querySelector('.hp-ticker-text');
        let pos = wrap.offsetWidth;
        tickers[teamId] = setInterval(() => {
            pos -= 1.2;
            el.style.transform = `translateX(-${pos}px)`;
            if (pos < -el.offsetWidth - 50) clearInterval(tickers[teamId]);
        }, 20);
    }

    // Yeşil/düz veya turuncu/kesik iz çiz
    function trail(svg, x1, y1, x2, y2, color, dashed) {
        const ns = "http://www.w3.org/2000/svg";
        const line = document.createElementNS(ns, "line");
        line.setAttribute("x1", x1); line.setAttribute("y1", y1);
        line.setAttribute("x2", x1); line.setAttribute("y2", y1);
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", "0.6");
        line.setAttribute("stroke-linecap", "round");
        if (dashed) line.setAttribute("stroke-dasharray", "1.5 1.5");
        line.setAttribute("fill", "none");
        svg.appendChild(line);
        
        // İz, uç noktaya doğru büyür
        const t0 = performance.now();
        function anim(t) {
            const p = Math.min((t - t0) / 2000, 1);
            line.setAttribute("x2", x1 + (x2 - x1) * p);
            line.setAttribute("y2", y1 + (y2 - y1) * p);
            if (p < 1) requestAnimationFrame(anim);
            else {
                // Uçtan başlangıca doğru sil (comet tail)
                const t1 = performance.now();
                function fade(t2) {
                    const q = Math.min((t2 - t1) / 2000, 1);
                    line.setAttribute("x1", x1 + (x2 - x1) * q);
                    line.setAttribute("y1", y1 + (y2 - y1) * q);
                    if (q < 1) requestAnimationFrame(fade);
                    else line.remove();
                }
                requestAnimationFrame(fade);
            }
        }
        requestAnimationFrame(anim);
    }

    function drawTeam(teamId, players) {
        const svg = document.getElementById("hp-svg-" + teamId);
        if(!svg) return;
        svg.querySelectorAll(".hp-pl, .hp-trail-svg").forEach(e => e.remove());
        
        const ns = "http://www.w3.org/2000/svg";
        const teamColor = TEAM_COLOR[teamId];
        
        // Trail katmanı (oyuncuların altında)
        const trailLayer = document.createElementNS(ns, "g");
        trailLayer.setAttribute("class", "hp-trail-svg");
        svg.appendChild(trailLayer);
        
        players.forEach(p => {
            // Diziliş = ortalama pozisyon
            const baseX = p.avg[0], baseY = p.avg[1];
            
            // En ofansif = en yüksek x, en defansif = en düşük x
            const xs = p.points.map(pt => pt[0]);
            const ofansifX = Math.max(...xs);
            const defansifX = Math.min(...xs);
            
            // Oyuncu ikonu
            const g = document.createElementNS(ns, "g");
            g.setAttribute("class", "hp-pl");
            g.setAttribute("transform", `translate(${baseX.toFixed(1)}, ${baseY.toFixed(1)})`);
            
            const rect = document.createElementNS(ns, "rect");
            rect.setAttribute("x", "-2.5"); rect.setAttribute("y", "-2.5");
            rect.setAttribute("width", "5"); rect.setAttribute("height", "5");
            rect.setAttribute("rx", "1"); rect.setAttribute("fill", teamColor);
            
            const txt = document.createElementNS(ns, "text");
            txt.setAttribute("class", "hp-txt");
            txt.textContent = p.id;
            
            g.appendChild(rect); g.appendChild(txt);
            svg.appendChild(g);
            
            // Eylemleri kategoriye ayır
            const offActs = p.actions.filter(a => OFF_ACTIONS.includes(a));
            const defActs = p.actions.filter(a => DEF_ACTIONS.includes(a));
            const offLabel = offActs[0] || "Hücum pası";
            const defLabel = defActs[0] || "Top kaybı";
            
            // Döngü: diziliş → ofansif (yeşil) → bekle → defansif (turuncu kesik) → bekle → reset
            function cycle() {
                // 1. OFANSİF
                ticker(teamId, `#${p.id} ${p.name} — ${offLabel}`, FWD);
                g.setAttribute("transform", `translate(${ofansifX.toFixed(1)}, ${baseY.toFixed(1)})`);
                g.querySelector("rect").setAttribute("fill", FWD);
                trail(svg, baseX, baseY, ofansifX, baseY, FWD, false);
                
                // 2. BEKLE → DEFANSİF
                timers.push(setTimeout(() => {
                    ticker(teamId, `#${p.id} ${p.name} — ${defLabel}`, DEF);
                    g.setAttribute("transform", `translate(${defansifX.toFixed(1)}, ${baseY.toFixed(1)})`);
                    g.querySelector("rect").setAttribute("fill", DEF);
                    trail(svg, baseX, baseY, defansifX, baseY, DEF, true);
                    
                    // 3. RESET
                    timers.push(setTimeout(() => {
                        g.setAttribute("transform", `translate(${baseX.toFixed(1)}, ${baseY.toFixed(1)})`);
                        g.querySelector("rect").setAttribute("fill", teamColor);
                        timers.push(setTimeout(cycle, 1500));
                    }, 2800));
                }, 2800));
            }
            
            timers.push(setTimeout(cycle, Math.random() * 1500));
        });
    }

    function render() {
        timers.forEach(clearTimeout); timers = [];
        Object.values(tickers).forEach(clearInterval); tickers = {};
        
        const box = document.getElementById("hp-pos-motor");
        if(!box || !data) return;
        const half = data[activeHalf];
        
        box.innerHTML = `
            <div class="hp-tabs">
                <button class="hp-tab ${activeHalf==='all'?'active':''}" onclick="window.hpSetHalf('all')">Tüm Maç</button>
                <button class="hp-tab ${activeHalf==='1h'?'active':''}" onclick="window.hpSetHalf('1h')">1. Yarı</button>
                <button class="hp-tab ${activeHalf==='2h'?'active':''}" onclick="window.hpSetHalf('2h')">2. Yarı</button>
            </div>
            <div class="hp-panel">
                <div class="hp-title" style="color:${TEAM_COLOR.konya}">KONYASPOR</div>
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
                <div class="hp-title" style="color:${TEAM_COLOR.gs}">GALATASARAY</div>
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
            drawTeam("konya", half.konya);
            drawTeam("gs", half.gs);
        }, 50);
    }
    
    window.hpSetHalf = (h) => { activeHalf = h; render(); };
    fetch(REPO + "?v=" + Date.now()).then(r => r.json()).then(j => { data = j; render(); });
})();
</script>
'''

s = s.replace('<div id="hp-pos-motor"></div>', motor)
open(P, 'w', encoding='utf-8').write(s)
print("✓ Animasyon motoru yüklendi. Ctrl+Shift+R yap.")
