import os, re, shutil, datetime, json

P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
shutil.copy2(P, P + ".bak.motor2." + datetime.datetime.now().strftime("%H%M%S"))
s = open(P, encoding='utf-8').read()

# 1. ESKİ MOTORU SİL (id="hp-motor-css" ile başlayan yerden script sonuna kadar)
start = s.find('<style id="hp-motor-css">')
if start != -1:
    end = s.find('</script>', start) + len('</script>')
    s = s[:start] + '<div id="hp-pos-motor"></div>' + s[end:]

# 2. YENİ MOTOR (Düzeltilmiş)
motor = r'''
<style id="hp-motor-css">
.hp-tabs { display: flex; gap: 0.5rem; justify-content: center; margin: 1.5rem 0; }
.hp-tab { background: #0D0E12; color: #8A8A93; border: 1px solid #2A2B33; padding: 0.4rem 1rem; border-radius: 20px; font-family: monospace; font-size: 0.8rem; cursor: pointer; transition: 0.2s; }
.hp-tab.active { background: #B4FF39; color: #000; border-color: #B4FF39; font-weight: bold; }
.hp-panel { background: #050605; border: 1px solid #1B1B21; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; position: relative; }
.hp-title { font-family: monospace; text-align: center; margin-bottom: 0.5rem; font-size: 0.9rem; letter-spacing: 1px; font-weight: bold; }
.hp-svg { width: 100%; height: auto; display: block; background: #08090B; border-radius: 8px; }
.hp-ticker-wrap { margin-top: 0.5rem; height: 2rem; overflow: hidden; position: relative; display: flex; align-items: center; background: #0D0E12; border-radius: 4px; padding: 0 10px; }
.hp-ticker { font-family: monospace; font-size: 0.85rem; white-space: nowrap; position: absolute; left: 100%; }
.hp-player rect { transition: transform 1s cubic-bezier(0.25, 1, 0.5, 1), fill 0.3s; }
.hp-player text { font-family: monospace; text-anchor: middle; dominant-baseline: central; font-weight: bold; pointer-events: none; fill: #000; }
.hp-trail { stroke-linecap: round; stroke-dasharray: 2 3; fill: none; opacity: 0; transition: opacity 0.3s; }
.hp-trail.active { opacity: 0.6; }
</style>

<div id="hp-pos-motor"></div>

<script>
(function(){
    const REPO = "/assets/data/konya-gs/players_anim.json";
    const COLORS = {
        konya: { fwd: "#FF6B35", bck: "#8B2500" },
        gs:    { fwd: "#B4FF39", bck: "#2A5A00" }
    };
    const ACT_LABELS = {
        "Passes accurate": "isabetli pas", "Inaccurate passes": "hatalı pas",
        "Passes forward accurate": "ileri pas", "Incomplete passes forward": "hatalı ileri pas",
        "Progressive passes accurate": "progresif pas", "Involvement in positional attacks": "pozisyon atağı",
        "Involvement in counterattacks": "kontra atak", "Ball losses": "top kaybı",
        "Challenges won": "ikili mücadele", "Challenges unsuccessful": "mücadele kaybı",
        "Shots on target": "isabetli şut", "Shots off target": "isabetsiz şut",
        "Goals": "GOL", "Penalty": "penaltı", "Blocked shots": "bloklu şut"
    };
    
    let activeHalf = "all";
    let data = null;
    let timers = [];

    // Ticker Animasyonu (Alttan yukarı kayan yazı)
    function slideTicker(teamId, text, color) {
        const el = document.getElementById("hp-ticker-" + teamId);
        if(!el) return;
        el.textContent = text;
        el.style.color = color;
        el.style.transition = "none";
        el.style.transform = "translateX(0)";
        void el.offsetWidth;
        el.style.transition = "transform 3s linear";
        el.style.transform = "translateX(-100%)";
    }

    function drawTeam(teamId, players) {
        const svg = document.getElementById("hp-svg-" + teamId);
        if(!svg) return;
        svg.querySelectorAll(".hp-player, .hp-trail").forEach(e => e.remove());
        
        const c = COLORS[teamId];
        const ns = "http://www.w3.org/2000/svg";
        const isKonya = teamId === "konya";
        
        // ÖLÇEKLENDİRME FONKSİYONU: JSON verisi 0-100 arası ise SVG'ye (105x68) uyarla
        const scaleX = (x) => isKonya ? (105 - (x / 100 * 105)) : (x / 100 * 105);
        const scaleY = (y) => (y / 100 * 68);
        
        players.forEach((p, idx) => {
            const baseX = scaleX(p.avg_x);
            const baseY = scaleY(p.avg_y);
            const fwdX = isKonya ? scaleX(p.min_x) : scaleX(p.max_x);
            const bckX = isKonya ? scaleX(p.max_x) : scaleX(p.min_x);
            
            // Oyuncu Kutusu
            const g = document.createElementNS(ns, "g");
            g.setAttribute("class", "hp-player");
            g.setAttribute("transform", `translate(${baseX.toFixed(1)}, ${baseY.toFixed(1)})`);
            
            const rect = document.createElementNS(ns, "rect");
            rect.setAttribute("x", "-2.5"); rect.setAttribute("y", "-2.5");
            rect.setAttribute("width", "5"); rect.setAttribute("height", "5");
            rect.setAttribute("rx", "1"); rect.setAttribute("fill", c.fwd);
            
            const txt = document.createElementNS(ns, "text");
            txt.setAttribute("font-size", "2.5"); txt.textContent = p.id;
            
            g.appendChild(rect); g.appendChild(txt);
            svg.appendChild(g);
            
            // İz Çizgisi
            const line = document.createElementNS(ns, "line");
            line.setAttribute("class", "hp-trail");
            line.setAttribute("x1", baseX); line.setAttribute("y1", baseY);
            svg.appendChild(line);
            
            // Hareket Fonksiyonu
            function moveTo(targetX, isForward, action) {
                g.setAttribute("transform", `translate(${targetX.toFixed(1)}, ${baseY.toFixed(1)})`);
                rect.setAttribute("fill", isForward ? c.fwd : c.bck);
                line.setAttribute("stroke", isForward ? c.fwd : c.bck);
                line.setAttribute("x2", targetX); line.setAttribute("y2", baseY);
                line.setAttribute("class", "hp-trail active");
                slideTicker(teamId, `#${p.id} ${p.name} — ${ACT_LABELS[action] || action}`, isForward ? c.fwd : c.bck);
            }
            
            // Animasyon Döngüsü (Sırayla çalışır)
            function cycle() {
                const fwdAct = p.actions[0] || "Hücum";
                const bckAct = p.actions[1] || "Defans";
                
                // 1. İleri Git
                moveTo(fwdX, true, fwdAct);
                
                // 2. Geri Dön (2 saniye sonra)
                timers.push(setTimeout(() => {
                    line.setAttribute("opacity", "0");
                    timers.push(setTimeout(() => {
                        moveTo(bckX, false, bckAct);
                    }, 300));
                    
                    // 3. Dizilişe Dön (2 saniye sonra)
                    timers.push(setTimeout(() => {
                        line.setAttribute("opacity", "0");
                        g.setAttribute("transform", `translate(${baseX.toFixed(1)}, ${baseY.toFixed(1)})`);
                        rect.setAttribute("fill", c.fwd);
                        // Döngüyü yeniden başlat
                        timers.push(setTimeout(cycle, 2000));
                    }, 2000));
                }, 2000));
            }
            
            // Başlangıç gecikmesi (Oyuncular sırayla hareket etsin diye idx * 200)
            timers.push(setTimeout(cycle, 500 + idx * 200));
        });
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
                <div class="hp-title" style="color:${COLORS.konya.fwd}">KONYASPOR (Sola Hücum)</div>
                <svg class="hp-svg" viewBox="0 0 105 68" id="hp-svg-konya">
                    <rect width="105" height="68" fill="none" stroke="#1B1B21" stroke-width="0.5"/>
                    <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="#1B1B21" stroke-width="0.5"/>
                    <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="#1B1B21" stroke-width="0.5"/>
                    <rect x="0" y="13.85" width="16.5" height="40.3" fill="none" stroke="#1B1B21" stroke-width="0.5"/>
                    <rect x="88.5" y="13.85" width="16.5" height="40.3" fill="none" stroke="#1B1B21" stroke-width="0.5"/>
                </svg>
                <div class="hp-ticker-wrap"><div class="hp-ticker" id="hp-ticker-konya"></div></div>
            </div>
            <div class="hp-panel">
                <div class="hp-title" style="color:${COLORS.gs.fwd}">GALATASARAY (Sağa Hücum)</div>
                <svg class="hp-svg" viewBox="0 0 105 68" id="hp-svg-gs">
                    <rect width="105" height="68" fill="none" stroke="#1B1B21" stroke-width="0.5"/>
                    <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="#1B1B21" stroke-width="0.5"/>
                    <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="#1B1B21" stroke-width="0.5"/>
                    <rect x="0" y="13.85" width="16.5" height="40.3" fill="none" stroke="#1B1B21" stroke-width="0.5"/>
                    <rect x="88.5" y="13.85" width="16.5" height="40.3" fill="none" stroke="#1B1B21" stroke-width="0.5"/>
                </svg>
                <div class="hp-ticker-wrap"><div class="hp-ticker" id="hp-ticker-gs"></div></div>
            </div>
        `;
        
        setTimeout(() => {
            drawTeam("konya", halfData.konya);
            drawTeam("gs", halfData.gs);
        }, 50);
    }
    
    window.hpSetHalf = (h) => { activeHalf = h; render(); };
    
    fetch(REPO + "?v=" + Date.now()).then(r => r.json()).then(j => { data = j; render(); }).catch(e => {
        document.getElementById("hp-pos-motor").innerHTML = `<div style="color:red;padding:20px">Hata: ${e.message}</div>`;
    });
})();
</script>
'''

s = s.replace('<div id="hp-pos-motor"></div>', motor)
open(P, 'w', encoding='utf-8').write(s)
print("✓ Motor v2 yüklendi. Lütfen sayfayı yenile (Ctrl+Shift+R).")
