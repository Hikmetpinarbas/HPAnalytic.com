import os, re, shutil, datetime, json

P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
shutil.copy2(P, P + ".bak.motor3." + datetime.datetime.now().strftime("%H%M%S"))
s = open(P, encoding='utf-8').read()

# 1. ESKİ MOTORU SİL (Tüm CSS ve JS bloğunu temizle)
start = s.find('<style id="hp-motor-css">')
if start != -1:
    end = s.find('</script>', start) + len('</script>')
    s = s[:start] + '<div id="hp-pos-motor"></div>' + s[end:]

# 2. YENİ MOTOR (v3 - Temiz, Sıralı ve Doğru Ölçekli)
motor = r'''
<style id="hp-motor-css">
.hp-tabs { display: flex; gap: 0.5rem; justify-content: center; margin: 1.5rem 0; }
.hp-tab { background: #0D0E12; color: #8A8A93; border: 1px solid #2A2B33; padding: 0.4rem 1rem; border-radius: 20px; font-family: monospace; font-size: 0.8rem; cursor: pointer; transition: 0.2s; }
.hp-tab.active { background: #B4FF39; color: #000; border-color: #B4FF39; font-weight: bold; }
.hp-panel { background: #050605; border: 1px solid #1B1B21; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
.hp-title { font-family: monospace; text-align: center; margin-bottom: 0.5rem; font-size: 0.9rem; letter-spacing: 1px; font-weight: bold; }
.hp-svg { width: 100%; height: auto; display: block; background: #08090B; border-radius: 8px; }
.hp-ticker-wrap { margin-top: 0.5rem; height: 2rem; background: #0D0E12; border-radius: 4px; display: flex; align-items: center; overflow: hidden; position: relative; }
.hp-ticker-text { font-family: monospace; font-size: 0.85rem; white-space: nowrap; position: absolute; animation: slideTicker 4s linear infinite; padding-left: 100%; }
@keyframes slideTicker { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }

.hp-player-g { transition: transform 1.5s ease-in-out; }
.hp-player-rect { transition: fill 0.5s, stroke 0.5s; }
.hp-player-txt { font-family: monospace; text-anchor: middle; dominant-baseline: central; font-weight: bold; pointer-events: none; fill: #000; font-size: 2.5px; }
.hp-trail { stroke-linecap: round; stroke-dasharray: 2 2; fill: none; opacity: 0; transition: opacity 0.8s; }
.hp-trail.active { opacity: 0.7; }
</style>

<div id="hp-pos-motor"></div>

<script>
(function(){
    const REPO = "/assets/data/konya-gs/players_anim.json";
    // Renkler: Konya (Turuncu), GS (Neon Yeşil)
    const COLORS = {
        konya: { fwd: "#FF6B35", bck: "#8B2500" },
        gs:    { fwd: "#B4FF39", bck: "#2A5A00" }
    };
    
    let activeHalf = "all";
    let data = null;
    let timers = [];
    let moveIndex = 0;

    function updateTicker(teamId, text, color) {
        const el = document.getElementById("hp-ticker-" + teamId);
        if(!el) return;
        el.textContent = text;
        el.style.color = color;
        // Animasyonu resetle
        el.style.animation = 'none';
        el.offsetHeight; // reflow
        el.style.animation = 'slideTicker 4s linear infinite';
    }

    function drawTeam(teamId, players) {
        const svg = document.getElementById("hp-svg-" + teamId);
        if(!svg) return;
        svg.querySelectorAll(".hp-player-g, .hp-trail").forEach(e => e.remove());
        
        const c = COLORS[teamId];
        const ns = "http://www.w3.org/2000/svg";
        const isKonya = teamId === "konya";
        
        // JSON verisi zaten 0-105 arası. Ekstra ölçekleme YAPMIYORUZ.
        // Konya sola (x=0'a), GS sağa (x=105'e) hücum eder.
        
        players.forEach((p) => {
            // Konya'nın sahadaki x koordinatını ters çevir (sola hücum etsin diye)
            const flip = (x) => isKonya ? (105 - x) : x;
            
            const baseX = flip(p.avg_x);
            const baseY = p.avg_y;
            
            // İleri ve Geri Uç Noktaları
            // Konya için: max_x (sahada sağ) -> flip edilince sol (ileri) olur
            const fwdX = isKonya ? flip(p.max_x) : flip(p.max_x); 
            const bckX = isKonya ? flip(p.min_x) : flip(p.min_x);
            
            // Çizgi (Trail)
            const line = document.createElementNS(ns, "line");
            line.setAttribute("class", "hp-trail");
            line.setAttribute("x1", baseX); line.setAttribute("y1", baseY);
            svg.appendChild(line);
            
            // Oyuncu Grubu
            const g = document.createElementNS(ns, "g");
            g.setAttribute("class", "hp-player-g");
            g.setAttribute("transform", `translate(${baseX.toFixed(1)}, ${baseY.toFixed(1)})`);
            
            const rect = document.createElementNS(ns, "rect");
            rect.setAttribute("class", "hp-player-rect");
            rect.setAttribute("x", "-2.5"); rect.setAttribute("y", "-2.5");
            rect.setAttribute("width", "5"); rect.setAttribute("height", "5");
            rect.setAttribute("rx", "1"); rect.setAttribute("fill", c.fwd);
            
            const txt = document.createElementNS(ns, "text");
            txt.setAttribute("class", "hp-player-txt");
            txt.textContent = p.id;
            
            g.appendChild(rect); g.appendChild(txt);
            svg.appendChild(g);
            
            // Hareketi tetikleme fonksiyonu
            window['hpAnim_' + teamId + '_' + p.id] = function(isForward) {
                const targetX = isForward ? fwdX : bckX;
                const color = isForward ? c.fwd : c.bck;
                const action = isForward ? (p.actions[0] || "Hücum") : (p.actions[1] || "Defans");
                
                // 1. Oyuncuyu hareket ettir
                g.setAttribute("transform", `translate(${targetX.toFixed(1)}, ${baseY.toFixed(1)})`);
                rect.setAttribute("fill", color);
                
                // 2. Çizgiyi çiz
                line.setAttribute("stroke", color);
                line.setAttribute("x2", targetX); line.setAttribute("y2", baseY);
                line.setAttribute("class", "hp-trail active");
                
                // 3. Altyazıyı güncelle
                updateTicker(teamId, `#${p.id} ${p.name} — ${action}`, color);
            };
            
            // Oyuncuyu başlangıca döndürme fonksiyonu
            window['hpReset_' + teamId + '_' + p.id] = function() {
                g.setAttribute("transform", `translate(${baseX.toFixed(1)}, ${baseY.toFixed(1)})`);
                rect.setAttribute("fill", c.fwd);
                line.setAttribute("class", "hp-trail");
                line.setAttribute("opacity", "0");
            };
        });
    }
    
    function playAnimation() {
        timers.forEach(clearTimeout); timers = [];
        if(!data) return;
        
        const halfData = data[activeHalf];
        const allPlayers = [
            ...halfData.konya.map(p => ({team: 'konya', id: p.id})),
            ...halfData.gs.map(p => ({team: 'gs', id: p.id}))
        ];
        
        // Rastgele 8 oyuncu seç (sahayı çok doldurmasın)
        const selected = allPlayers.sort(() => 0.5 - Math.random()).slice(0, 10);
        
        let delay = 1000;
        
        selected.forEach((p, index) => {
            // 1. İleri Git
            timers.push(setTimeout(() => {
                window['hpAnim_' + p.team + '_' + p.id](true);
            }, delay));
            
            // 2. Geri Dön
            timers.push(setTimeout(() => {
                window['hpAnim_' + p.team + '_' + p.id](false);
            }, delay + 2500));
            
            // 3. Başlangıca Dön (Reset)
            timers.push(setTimeout(() => {
                window['hpReset_' + p.team + '_' + p.id]();
            }, delay + 5000));
            
            delay += 1200; // Sırayla başlaması için bekleme süresi
        });
        
        // Döngüyü yeniden başlat (seçilen oyuncular bitince)
        timers.push(setTimeout(playAnimation, delay + 6000));
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
                <div class="hp-ticker-wrap"><div class="hp-ticker-text" id="hp-ticker-konya">Konyaspor hazır...</div></div>
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
                <div class="hp-ticker-wrap"><div class="hp-ticker-text" id="hp-ticker-gs">Galatasaray hazır...</div></div>
            </div>
        `;
        
        setTimeout(() => {
            drawTeam("konya", halfData.konya);
            drawTeam("gs", halfData.gs);
            setTimeout(playAnimation, 1000);
        }, 50);
    }
    
    window.hpSetHalf = (h) => { activeHalf = h; render(); };
    
    fetch(REPO + "?v=" + Date.now()).then(r => r.json()).then(j => { data = j; render(); });
})();
</script>
'''

s = s.replace('<div id="hp-pos-motor"></div>', motor)
open(P, 'w', encoding='utf-8').write(s)
print("✓ Motor v3 yüklendi (Temiz, Sıralı). Sayfayı yenile.")
