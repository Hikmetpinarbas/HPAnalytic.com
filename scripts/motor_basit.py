import os, re, shutil, datetime

P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
shutil.copy2(P, P + ".bak.motor_simple." + datetime.datetime.now().strftime("%H%M%S"))
s = open(P, encoding='utf-8').read()

# 1. ESKİ MOTORU SİL
start = s.find('<style id="hp-motor-css">')
if start != -1:
    end = s.find('</script>', start) + len('</script>')
    s = s[:start] + '<div id="hp-pos-motor"></div>' + s[end:]

# 2. YENİ MOTOR (Saf Veri, Ters Çevirme Yok)
motor = r'''
<style id="hp-motor-css">
.hp-tabs { display: flex; gap: 0.5rem; justify-content: center; margin: 1.5rem 0; }
.hp-tab { background: #0D0E12; color: #8A8A93; border: 1px solid #2A2B33; padding: 0.4rem 1rem; border-radius: 20px; font-family: monospace; font-size: 0.8rem; cursor: pointer; transition: 0.2s; }
.hp-tab.active { background: #B4FF39; color: #000; border-color: #B4FF39; font-weight: bold; }
.hp-panel { background: #050605; border: 1px solid #1B1B21; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
.hp-title { font-family: monospace; text-align: center; margin-bottom: 0.5rem; font-size: 0.9rem; letter-spacing: 1px; font-weight: bold; }
.hp-svg { width: 100%; height: auto; display: block; background: #08090B; border-radius: 8px; }
.hp-ticker-wrap { margin-top: 0.5rem; height: 2rem; background: #0D0E12; border-radius: 4px; display: flex; align-items: center; overflow: hidden; position: relative; }
.hp-ticker-text { font-family: monospace; font-size: 0.85rem; white-space: nowrap; position: absolute; padding-left: 100%; }

.hp-player-g { transition: transform 2s ease-in-out; }
.hp-player-txt { font-family: monospace; text-anchor: middle; dominant-baseline: central; font-weight: bold; pointer-events: none; fill: #000; font-size: 2.5px; }
.hp-trail { stroke-linecap: round; stroke-width: 0.8; fill: none; opacity: 0.8; }
</style>

<div id="hp-pos-motor"></div>

<script>
(function(){
    const REPO = "/assets/data/konya-gs/players_anim.json";
    const COLORS = {
        konya: { fwd: "#FF6B35", bck: "#8B2500" },
        gs:    { fwd: "#B4FF39", bck: "#2A5A00" }
    };
    
    let activeHalf = "all";
    let data = null;
    let timers = [];
    let tickerIntervals = {};

    function startTicker(teamId, text, color) {
        const wrap = document.getElementById("hp-ticker-" + teamId);
        if(!wrap) return;
        if(tickerIntervals[teamId]) clearInterval(tickerIntervals[teamId]);
        wrap.innerHTML = `<div class="hp-ticker-text" style="color:${color}">${text}</div>`;
        const el = wrap.querySelector('.hp-ticker-text');
        let pos = wrap.offsetWidth;
        tickerIntervals[teamId] = setInterval(() => {
            pos -= 1;
            el.style.transform = `translateX(-${pos}px)`;
            if (pos < -el.offsetWidth - 50) clearInterval(tickerIntervals[teamId]);
        }, 20);
    }

    function drawTrail(svg, x1, y1, x2, y2, color, duration=2000) {
        const ns = "http://www.w3.org/2000/svg";
        const line = document.createElementNS(ns, "line");
        line.setAttribute("class", "hp-trail");
        line.setAttribute("x1", x1); line.setAttribute("y1", y1);
        line.setAttribute("x2", x2); line.setAttribute("y2", y2);
        line.setAttribute("stroke", color);
        svg.appendChild(line);
        
        let startTime = performance.now();
        function animate(time) {
            let progress = (time - startTime) / duration;
            if (progress > 1) progress = 1;
            const currentX2 = x2 - (x2 - x1) * progress;
            line.setAttribute("x2", currentX2);
            if (progress < 1) requestAnimationFrame(animate);
            else line.remove();
        }
        requestAnimationFrame(animate);
    }

    function drawTeam(teamId, players) {
        const svg = document.getElementById("hp-svg-" + teamId);
        if(!svg) return;
        svg.querySelectorAll(".hp-player-g").forEach(e => e.remove());
        
        const c = COLORS[teamId];
        const ns = "http://www.w3.org/2000/svg";
        
        players.forEach((p) => {
            // HAM VERİ! Ters çevirme veya ölçekleme YOK.
            const baseX = p.avg_x;
            const baseY = p.avg_y;
            
            // İleri: max_x, Geri: min_x (Veri setinde takımların hücum yönü böyle)
            const fwdX = p.max_x; 
            const bckX = p.min_x;
            
            const g = document.createElementNS(ns, "g");
            g.setAttribute("class", "hp-player-g");
            g.setAttribute("transform", `translate(${baseX.toFixed(1)}, ${baseY.toFixed(1)})`);
            
            const rect = document.createElementNS(ns, "rect");
            rect.setAttribute("x", "-2.5"); rect.setAttribute("y", "-2.5");
            rect.setAttribute("width", "5"); rect.setAttribute("height", "5");
            rect.setAttribute("rx", "1"); rect.setAttribute("fill", c.fwd);
            
            const txt = document.createElementNS(ns, "text");
            txt.setAttribute("class", "hp-player-txt");
            txt.textContent = p.id;
            
            g.appendChild(rect); g.appendChild(txt);
            svg.appendChild(g);

            p._dom = { g, rect };
            p._coords = { baseX, baseY, fwdX, bckX };
            p._color = c;
            p._teamId = teamId;
        });
    }

    function playCinematic() {
        timers.forEach(clearTimeout); timers = [];
        if(!data) return;
        
        const halfData = data[activeHalf];
        const allPlayers = [...halfData.konya, ...halfData.gs];

        // 1. DİZİLİŞ (Reset)
        allPlayers.forEach(p => {
            if(!p._dom) return;
            const { baseX, baseY } = p._coords;
            p._dom.g.setAttribute("transform", `translate(${baseX.toFixed(1)}, ${baseY.toFixed(1)})`);
            p._dom.rect.setAttribute("fill", p._color.fwd);
        });

        // 2. OFANSİF HAREKET (İleri)
        timers.push(setTimeout(() => {
            allPlayers.forEach(p => {
                if(!p._dom) return;
                const { fwdX, baseX, baseY } = p._coords;
                p._dom.g.setAttribute("transform", `translate(${fwdX.toFixed(1)}, ${baseY.toFixed(1)})`);
                p._dom.rect.setAttribute("fill", p._color.fwd);
                
                const svg = document.getElementById("hp-svg-" + p._teamId);
                drawTrail(svg, baseX, baseY, fwdX, baseY, p._color.fwd, 2500);
            });
            
            startTicker("konya", "KONYASPOR OFANSİF", COLORS.konya.fwd);
            startTicker("gs", "GALATASARAY OFANSİF", COLORS.gs.fwd);
        }, 1000));

        // 3. DEFANSİF HAREKET (Geri)
        timers.push(setTimeout(() => {
            allPlayers.forEach(p => {
                if(!p._dom) return;
                const { bckX, baseX, baseY } = p._coords;
                p._dom.g.setAttribute("transform", `translate(${bckX.toFixed(1)}, ${baseY.toFixed(1)})`);
                p._dom.rect.setAttribute("fill", p._color.bck);
                
                const svg = document.getElementById("hp-svg-" + p._teamId);
                drawTrail(svg, baseX, baseY, bckX, baseY, p._color.bck, 2500);
            });
            
            startTicker("konya", "KONYASPOR DEFANSİF", COLORS.konya.bck);
            startTicker("gs", "GALATASARAY DEFANSİF", COLORS.gs.bck);
        }, 5000));

        timers.push(setTimeout(playCinematic, 10000));
    }

    function render() {
        timers.forEach(clearTimeout); timers = [];
        const box = document.getElementById("hp-pos-motor");
        if(!box || !data) return;
        
        const halfData = data[activeHalf];
        box.innerHTML = `
            <div class="hp-tabs">
                <button class="hp-tab ${activeHalf==='all'?'active':''}" onclick="window.hpSetHalf('all')">Tüm Maç</button>
                <button class="hp-tab ${activeHalf==='1h'?'active':''}" onclick="window.hpSetHalf('1h')">1. Yarı</button>
                <button class="hp-tab ${activeHalf==='2h'?'active':''}" onclick="window.hpSetHalf('2h')">2. Yarı</button>
            </div>
            <div class="hp-panel">
                <div class="hp-title" style="color:${COLORS.konya.fwd}">KONYASPOR</div>
                <svg class="hp-svg" viewBox="0 0 105 68" id="hp-svg-konya">
                    <rect width="105" height="68" fill="none" stroke="#1B1B21" stroke-width="0.5"/>
                    <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="#1B1B21" stroke-width="0.5"/>
                    <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="#1B1B21" stroke-width="0.5"/>
                    <rect x="0" y="13.85" width="16.5" height="40.3" fill="none" stroke="#1B1B21" stroke-width="0.5"/>
                    <rect x="88.5" y="13.85" width="16.5" height="40.3" fill="none" stroke="#1B1B21" stroke-width="0.5"/>
                </svg>
                <div class="hp-ticker-wrap" id="hp-ticker-konya"></div>
            </div>
            <div class="hp-panel">
                <div class="hp-title" style="color:${COLORS.gs.fwd}">GALATASARAY</div>
                <svg class="hp-svg" viewBox="0 0 105 68" id="hp-svg-gs">
                    <rect width="105" height="68" fill="none" stroke="#1B1B21" stroke-width="0.5"/>
                    <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="#1B1B21" stroke-width="0.5"/>
                    <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="#1B1B21" stroke-width="0.5"/>
                    <rect x="0" y="13.85" width="16.5" height="40.3" fill="none" stroke="#1B1B21" stroke-width="0.5"/>
                    <rect x="88.5" y="13.85" width="16.5" height="40.3" fill="none" stroke="#1B1B21" stroke-width="0.5"/>
                </svg>
                <div class="hp-ticker-wrap" id="hp-ticker-gs"></div>
            </div>
        `;
        
        setTimeout(() => {
            drawTeam("konya", halfData.konya);
            drawTeam("gs", halfData.gs);
            setTimeout(playCinematic, 1000);
        }, 50);
    }
    
    window.hpSetHalf = (h) => { activeHalf = h; render(); };
    
    fetch(REPO + "?v=" + Date.now()).then(r => r.json()).then(j => { data = j; render(); });
})();
</script>
'''

s = s.replace('<div id="hp-pos-motor"></div>', motor)
open(P, 'w', encoding='utf-8').write(s)
print("✓ Motor yüklendi. Sayfayı yenile.")
