import os, shutil, datetime

P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
shutil.copy2(P, P + ".bak.final2." + datetime.datetime.now().strftime("%H%M%S"))
s = open(P, encoding='utf-8').read()

start = s.find('<style id="hp-motor-css">')
if start != -1:
    end = s.find('</script>', start) + len('</script>')
    s = s[:start] + '<div id="hp-pos-motor"></div>' + s[end:]

motor = r'''
<style id="hp-motor-css">
.hp-tabs { display: flex; gap: 0.5rem; justify-content: center; margin: 1.5rem 0; }
.hp-tab { background: #0D0E12; color: #8A8A93; border: 1px solid #2A2B33; padding: 0.4rem 1rem; border-radius: 20px; font-family: monospace; font-size: 0.8rem; cursor: pointer; transition: 0.2s; }
.hp-tab.active { background: #FFF; color: #000; border-color: #FFF; font-weight: bold; }
.hp-panel { background: #050605; border: 1px solid #1B1B21; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
.hp-title { font-family: monospace; text-align: center; margin-bottom: 0.5rem; font-size: 1rem; letter-spacing: 1px; font-weight: bold; }
.hp-svg { width: 100%; height: auto; display: block; background: #08090B; border-radius: 8px; }

/* ALTYAZI (TICKER) - CSS ile pürüzsüz akış */
.hp-ticker-wrap { margin-top: 0.5rem; height: 2.2rem; background: #0D0E12; border-radius: 4px; display: flex; align-items: center; overflow: hidden; position: relative; border: 1px solid #1B1B21;}
.hp-ticker-text { font-family: monospace; font-size: 1rem; white-space: nowrap; position: absolute; font-weight: bold; letter-spacing: 0.5px; }
@keyframes ticker-scroll {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
}
.ticker-anim { display: inline-block; animation: ticker-scroll 6s linear infinite; padding-left: 20px; }

/* OYUNCU İKONLARI */
.hp-pl { transition: transform 4s cubic-bezier(0.25, 1, 0.5, 1); } /* 4 saniye süper ağır çekim */
.hp-txt { font-family: monospace; text-anchor: middle; dominant-baseline: central; font-weight: bold; pointer-events: none; fill: #000; font-size: 3.5px; }
</style>

<div id="hp-pos-motor"></div>

<script>
(function(){
    const REPO = "/assets/data/konya-gs/players_heatmap.json";
    
    // Takım Renkleri (Gerçek)
    const TEAM_COLOR = { 
        konya: "#00A859", // Konyaspor Yeşil
        gs: "#FBB800"     // Galatasaray Sarı
    };
    
    // İz Renkleri
    const COLOR_FWD = "#B4FF39"; // Neon Yeşil (Hücum)
    const COLOR_DEF = "#FF6B35"; // Turuncu (Defans)
    
    let activeHalf = "all";
    let data = null;
    let timers = [];

    function updateTicker(teamId, text, color) {
        const wrap = document.getElementById("hp-ticker-" + teamId);
        if(!wrap) return;
        // Yeni metni oluştur ve CSS animasyonunu ata
        wrap.innerHTML = `<div class="hp-ticker-text" style="color:${color}"><span class="ticker-anim">${text}</span></div>`;
    }

    function drawTrail(svg, x1, y1, x2, y2, color, isDashed) {
        const ns = "http://www.w3.org/2000/svg";
        const line = document.createElementNS(ns, "line");
        line.setAttribute("x1", x1); line.setAttribute("y1", y1);
        line.setAttribute("x2", x1); line.setAttribute("y2", y1);
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", "0.8");
        line.setAttribute("stroke-linecap", "round");
        if (isDashed) line.setAttribute("stroke-dasharray", "2 2");
        line.setAttribute("fill", "none");
        svg.appendChild(line);
        
        // Çizgi hareketle birlikte uzasın (4 saniye)
        const t0 = performance.now();
        function anim(t) {
            const p = Math.min((t - t0) / 4000, 1);
            line.setAttribute("x2", x1 + (x2 - x1) * p);
            line.setAttribute("y2", y1 + (y2 - y1) * p);
            if (p < 1) requestAnimationFrame(anim);
        }
        requestAnimationFrame(anim);
    }

    function drawTeam(teamId, players) {
        const svg = document.getElementById("hp-svg-" + teamId);
        if(!svg) return;
        svg.querySelectorAll(".hp-pl, .hp-trail-svg").forEach(e => e.remove());
        
        const ns = "http://www.w3.org/2000/svg";
        const teamColor = TEAM_COLOR[teamId];
        const isKonya = teamId === "konya";
        
        const trailLayer = document.createElementNS(ns, "g");
        trailLayer.setAttribute("class", "hp-trail-svg");
        svg.appendChild(trailLayer);
        
        players.forEach(p => {
            // Bütün sahayı aynala (Konya sol, GS sağ olsun diye)
            const getX = (x) => 105 - x; 
            
            const baseX = getX(p.avg[0]);
            const baseY = p.avg[1];
            
            const xs = p.points.map(pt => pt[0]);
            const rawMin = Math.min(...xs);
            const rawMax = Math.max(...xs);
            
            // En ofansif ve en defansif uç noktalar
            let fwdX, bckX;
            if (isKonya) {
                // Konya solda, sağa hücum eder (x artar)
                fwdX = getX(rawMin); // En yüksek x değeri
                bckX = getX(rawMax); // En düşük x değeri
            } else {
                // GS sağda, sola hücum eder (x azalır)
                fwdX = getX(rawMax); // En düşük x değeri
                bckX = getX(rawMin); // En yüksek x değeri
            }
            
            // Oyuncu İkonu
            const g = document.createElementNS(ns, "g");
            g.setAttribute("class", "hp-pl");
            g.setAttribute("transform", `translate(${baseX.toFixed(1)}, ${baseY.toFixed(1)})`);
            
            const rect = document.createElementNS(ns, "rect");
            rect.setAttribute("x", "-3"); rect.setAttribute("y", "-3");
            rect.setAttribute("width", "6"); rect.setAttribute("height", "6");
            rect.setAttribute("rx", "1.2"); 
            rect.setAttribute("fill", teamColor); // İkon rengi ASLA değişmez
            rect.setAttribute("stroke", "#000"); rect.setAttribute("stroke-width", "0.2");
            
            const txt = document.createElementNS(ns, "text");
            txt.setAttribute("class", "hp-txt");
            txt.textContent = p.id;
            
            g.appendChild(rect); g.appendChild(txt);
            svg.appendChild(g);
            
            const offAct = p.actions[0] || "Hücum";
            const defAct = p.actions[1] || "Defans";
            
            // === ANİMASYON DÖNGÜSÜ ===
            function cycle() {
                // 1. OFANSİF HAREKET (4s)
                updateTicker(teamId, `#${p.id} ${p.name} — ${offAct}`, COLOR_FWD);
                g.setAttribute("transform", `translate(${fwdX.toFixed(1)}, ${baseY.toFixed(1)})`);
                drawTrail(svg, baseX, baseY, fwdX, baseY, COLOR_FWD, false);
                
                // 2. BEKLEME (1.5s) ardından DEFANSİF (4s)
                timers.push(setTimeout(() => {
                    updateTicker(teamId, `#${p.id} ${p.name} — ${defAct}`, COLOR_DEF);
                    g.setAttribute("transform", `translate(${bckX.toFixed(1)}, ${baseY.toFixed(1)})`);
                    drawTrail(svg, baseX, baseY, bckX, baseY, COLOR_DEF, true);
                    
                    // 3. BEKLEME ve RESET (2s)
                    timers.push(setTimeout(() => {
                        g.setAttribute("transform", `translate(${baseX.toFixed(1)}, ${baseY.toFixed(1)})`);
                        timers.push(setTimeout(cycle, 2000));
                    }, 4000 + 1500));
                }, 4000 + 1500));
            }
            
            // Formasyonun ilk 3 saniye görünmesi için gecikmeli başlat
            timers.push(setTimeout(cycle, 3000 + Math.random() * 500));
        });
    }

    function render() {
        timers.forEach(clearTimeout); timers = [];
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
                <div class="hp-title" style="color:${TEAM_COLOR.konya}">KONYASPOR (Ev Sahibi)</div>
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
                <div class="hp-title" style="color:${TEAM_COLOR.gs}">GALATASARAY (Deplasman)</div>
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
print("✓ Motor FINAL v2 yüklendi. Süper ağır çekim, doğru renkler, pürüzsüz altyazı.")
