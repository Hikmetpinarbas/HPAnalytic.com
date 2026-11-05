import os, re, shutil, datetime

P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
shutil.copy2(P, P + ".bak.motor." + datetime.datetime.now().strftime("%H%M%S"))
s = open(P, encoding='utf-8').read()
orig = len(s)

# ============ 1. ESKİ POZİSYON HARİTALARINI SİL ============
# "Pozisyon haritaları" başlığından sonraki ilk <h2>e kadar (veya </section>'a) sil
m = re.search(r'(<h2[^>]*>\s*Pozisyon haritaları\s*</h2>).*?(?=<h2[^>]*>|<section)', s, re.DOTALL)
if not m:
    print("✗ Pozisyon haritaları bulunamadı")
    exit(1)

print(f"✓ Eski blok: {len(m.group(0))} char silinecek")
yeni = m.group(1) + '\n<div id="hp-pos-motor"></div>\n'
s = s.replace(m.group(0), yeni, 1)

# ============ 2. YENİ MOTOR (CSS + HTML + JS) ============
motor = r'''
<style id="hp-motor-css">
.hp-tabs{display:flex;gap:1rem;justify-content:center;margin:1.5rem 0}
.hp-tab{background:#0D0E12;color:#8A8A93;border:1px solid #2A2B33;padding:.5rem 1.2rem;border-radius:4px;font-family:'IBM Plex Mono',monospace;font-size:.85rem;cursor:pointer;transition:.2s;letter-spacing:1px}
.hp-tab.active{background:#B4FF39;color:#000;border-color:#B4FF39;font-weight:700}
.hp-tab:hover{border-color:#8A8A93}
.hp-panel{background:#0D0E12;border:1px solid #1B1B21;border-radius:8px;padding:1rem;margin-bottom:1.5rem}
.hp-title{font-family:'IBM Plex Mono',monospace;text-align:center;margin-bottom:.75rem;font-size:.95rem;letter-spacing:2px;font-weight:700}
.hp-svg{width:100%;height:auto;display:block;overflow:visible;aspect-ratio:105/68}
.hp-ticker-wrap{margin-top:.75rem;padding-top:.5rem;border-top:1px solid #1B1B21;height:1.6rem;overflow:hidden;position:relative;display:flex;align-items:center}
.hp-ticker{font-family:'IBM Plex Mono',monospace;font-size:.8rem;white-space:nowrap;position:absolute;left:100%;will-change:transform}
.hp-player{transition:transform 2s cubic-bezier(.4,0,.2,1)}
.hp-player rect{transition:fill .4s}
.hp-player text{font-family:'IBM Plex Mono',monospace;text-anchor:middle;dominant-baseline:central;font-weight:900;pointer-events:none;fill:#000}
.hp-trail{stroke-linecap:round;stroke-dasharray:3 3;fill:none;opacity:0;transition:opacity .4s,stroke .4s}
.hp-trail.active{opacity:.85}
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
        "Passes accurate": "isabetli pas",
        "Inaccurate passes": "hatalı pas",
        "Passes forward accurate": "ileri isabetli pas",
        "Incomplete passes forward": "ileri hatalı pas",
        "Progressive passes accurate": "progresif pas",
        "Involvement in positional attacks": "pozisyon atağı",
        "Involvement in counterattacks": "kontra atak",
        "Ball losses": "top kaybı",
        "Challenges won": "ikili mücadele kazandı",
        "Challenges unsuccessful": "ikili mücadele kaybetti",
        "Shots on target": "isabetli şut",
        "Shots off target": "isabetsiz şut",
        "Goals": "GOL",
        "Penalty": "penaltı",
        "Blocked shots": "bloklu şut",
        "Aerial challenges lost": "hava topu kaybı",
        "Aerial challenges won": "hava topu kazandı",
    };
    
    let activeHalf = "all";
    let data = null;
    let timers = [];

    function setTicker(teamId, text, color){
        const el = document.getElementById("hp-ticker-" + teamId);
        if(!el) return;
        el.textContent = text;
        el.style.color = color;
        el.style.transition = "none";
        el.style.transform = "translateX(0)";
        void el.offsetWidth;
        el.style.transition = "transform 3.5s linear";
        el.style.transform = "translateX(-160%)";
    }

    function drawTeam(teamId, players, tickerId){
        const svg = document.getElementById("hp-svg-" + teamId);
        if(!svg) return;
        // Temizle: sadece saha çizgileri kalsın (sınıfsız)
        svg.querySelectorAll(".hp-player, .hp-trail").forEach(e => e.remove());
        
        const color = COLORS[teamId];
        const ns = "http://www.w3.org/2000/svg";
        const isKonya = teamId === "konya";
        
        players.forEach((p, idx) => {
            // Konya sola hücum (x'i ters çevir)
            const flip = (x) => isKonya ? (105 - x) : x;
            
            const baseX = flip(p.avg_x);
            const baseY = p.avg_y;
            const fwdX = isKonya ? flip(p.min_x) : flip(p.max_x);  // Ofansif uç
            const bckX = isKonya ? flip(p.max_x) : flip(p.min_x);  // Defansif geri
            
            // Trail çizgisi
            const line = document.createElementNS(ns, "line");
            line.setAttribute("class", "hp-trail");
            svg.appendChild(line);
            
            // Oyuncu grubu
            const g = document.createElementNS(ns, "g");
            g.setAttribute("class", "hp-player");
            g.setAttribute("transform", `translate(${baseX.toFixed(2)}, ${baseY.toFixed(2)})`);
            
            const rect = document.createElementNS(ns, "rect");
            rect.setAttribute("x", "-3"); rect.setAttribute("y", "-3");
            rect.setAttribute("width", "6"); rect.setAttribute("height", "6");
            rect.setAttribute("rx", "1.2"); rect.setAttribute("fill", color.fwd);
            rect.setAttribute("stroke", "#000"); rect.setAttribute("stroke-width", "0.15");
            
            const txt = document.createElementNS(ns, "text");
            txt.setAttribute("font-size", "2.8");
            txt.textContent = p.id;
            
            g.appendChild(rect); g.appendChild(txt);
            svg.appendChild(g);
            
            // Hareket fonksiyonu
            function move(x, y, isForward, actionStr){
                g.setAttribute("transform", `translate(${x.toFixed(2)}, ${y.toFixed(2)})`);
                rect.setAttribute("fill", isForward ? color.fwd : color.bck);
                line.setAttribute("stroke", isForward ? color.fwd : color.bck);
                line.setAttribute("x1", baseX); line.setAttribute("y1", baseY);
                line.setAttribute("x2", x); line.setAttribute("y2", y);
                line.setAttribute("class", "hp-trail active");
                setTicker(teamId, `#${p.id} ${p.name} — ${actionStr}`, isForward ? color.fwd : color.bck);
            }
            
            function reset(){
                g.setAttribute("transform", `translate(${baseX.toFixed(2)}, ${baseY.toFixed(2)})`);
                rect.setAttribute("fill", color.fwd);
                line.setAttribute("class", "hp-trail");
                line.setAttribute("opacity", "0");
            }
            
            // Döngü: ofansif → bekle → defansif → bekle → reset
            function cycle(){
                const fwdAct = p.actions[0] || "Hücum";
                const bckAct = p.actions[1] || "Defans";
                const fwdLabel = ACT_LABELS[fwdAct] || fwdAct;
                const bckLabel = ACT_LABELS[bckAct] || bckAct;
                
                // 1. Ofansif
                move(fwdX, baseY + (Math.sin(idx) * 2), true, fwdLabel);
                
                // 2. Defansif (2.5sn sonra)
                timers.push(setTimeout(() => {
                    line.setAttribute("opacity", "0");
                    timers.push(setTimeout(() => {
                        move(bckX, baseY - (Math.cos(idx) * 2), false, bckLabel);
                    }, 400));
                    
                    // 3. Reset (2.5sn sonra)
                    timers.push(setTimeout(() => {
                        reset();
                        timers.push(setTimeout(cycle, 2000));
                    }, 2500));
                }, 2500));
            }
            
            // Sıralı başlat
            timers.push(setTimeout(cycle, 800 + idx * 250));
        });
    }
    
    function buildPanel(teamId, label){
        const c = COLORS[teamId];
        return `
            <div class="hp-panel">
                <div class="hp-title" style="color:${c.fwd}">${label}</div>
                <svg class="hp-svg" viewBox="0 0 105 68" id="hp-svg-${teamId}">
                    <rect width="105" height="68" fill="#08090B" stroke="#2A2B33" stroke-width="0.3"/>
                    <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="#2A2B33" stroke-width="0.3"/>
                    <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="#2A2B33" stroke-width="0.3"/>
                    <rect x="0" y="13.85" width="16.5" height="40.3" fill="none" stroke="#2A2B33" stroke-width="0.3"/>
                    <rect x="0" y="24.85" width="5.5" height="18.3" fill="none" stroke="#2A2B33" stroke-width="0.3"/>
                    <rect x="88.5" y="13.85" width="16.5" height="40.3" fill="none" stroke="#2A2B33" stroke-width="0.3"/>
                    <rect x="99.5" y="24.85" width="5.5" height="18.3" fill="none" stroke="#2A2B33" stroke-width="0.3"/>
                </svg>
                <div class="hp-ticker-wrap"><div class="hp-ticker" id="hp-ticker-${teamId}"></div></div>
            </div>
        `;
    }
    
    function render(){
        timers.forEach(clearTimeout);
        timers = [];
        const box = document.getElementById("hp-pos-motor");
        if(!box || !data) return;
        
        const half = data[activeHalf];
        box.innerHTML = `
            <div class="hp-tabs">
                <button class="hp-tab ${activeHalf==='all'?'active':''}" data-h="all">Tüm Maç</button>
                <button class="hp-tab ${activeHalf==='1h'?'active':''}" data-h="1h">1. Yarı</button>
                <button class="hp-tab ${activeHalf==='2h'?'active':''}" data-h="2h">2. Yarı</button>
            </div>
            ${buildPanel("konya", "KONYASPOR (sola hücum)")}
            ${buildPanel("gs", "GALATASARAY (sağa hücum)")}
        `;
        
        // Sekme tıklamaları
        box.querySelectorAll(".hp-tab").forEach(btn => {
            btn.addEventListener("click", () => {
                activeHalf = btn.dataset.h;
                render();
            });
        });
        
        // Takımları çiz
        setTimeout(() => {
            drawTeam("konya", half.konya, "hp-ticker-konya");
            drawTeam("gs", half.gs, "hp-ticker-gs");
        }, 100);
    }
    
    // Veri yükle
    fetch(REPO + "?v=" + Date.now())
        .then(r => r.json())
        .then(j => { data = j; render(); })
        .catch(e => {
            const box = document.getElementById("hp-pos-motor");
            if(box) box.innerHTML = `<div style="color:#FF6B35;padding:2rem;text-align:center;font-family:monospace">Motor yüklenemedi: ${e.message}</div>`;
        });
})();
</script>
'''

s = s.replace('<div id="hp-pos-motor"></div>', motor)
open(P, 'w', encoding='utf-8').write(s)
print(f"✓ Kaydedildi: {orig} -> {len(s)} char")
print(f"✓ Motor gömüldü (CSS + HTML + JS)")
print(f"\nCtrl+Shift+R ile sayfayı yenile")
print("BITTI")
