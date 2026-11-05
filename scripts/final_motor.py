import os, re, shutil, datetime
P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
shutil.copy2(P, P+".bak.sekme."+datetime.datetime.now().strftime("%H%M%S"))
s = open(P, encoding='utf-8').read()

# ESKİ BLOĞU SİL
s = re.sub(r'<div id="hpa-anim-container"></div>.*?</script>', '<div id="hpa-anim-container"></div>', s, flags=re.DOTALL)

# YENİ MOTOR (Saf JS + SVG Atribütleri)
js = r'''
<div class="hpa-tabs">
    <button class="hpa-tab active" onclick="setHalf('all')">Tüm Maç</button>
    <button class="hpa-tab" onclick="setHalf('1h')">1. Yarı</button>
    <button class="hpa-tab" onclick="setHalf('2h')">2. Yarı</button>
</div>

<div class="hpa-pitch-wrap">
    <div class="hpa-panel">
        <div class="hpa-title" style="color:#FF6B35">KONYASPOR</div>
        <svg viewBox="0 0 105 68" class="hpa-svg" id="svg-konya">
            <rect width="105" height="68" fill="#08090B" stroke="#2A2B33" stroke-width="0.5"/>
            <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="#2A2B33" stroke-width="0.5"/>
            <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="#2A2B33" stroke-width="0.5"/>
            <rect x="0" y="13.85" width="16.5" height="40.3" fill="none" stroke="#2A2B33" stroke-width="0.5"/>
            <rect x="88.5" y="13.85" width="16.5" height="40.3" fill="none" stroke="#2A2B33" stroke-width="0.5"/>
        </svg>
        <div class="hpa-ticker-wrap"><div class="hpa-ticker" id="ticker-konya"></div></div>
    </div>
    <div class="hpa-panel">
        <div class="hpa-title" style="color:#B4FF39">GALATASARAY</div>
        <svg viewBox="0 0 105 68" class="hpa-svg" id="svg-gs">
            <rect width="105" height="68" fill="#08090B" stroke="#2A2B33" stroke-width="0.5"/>
            <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="#2A2B33" stroke-width="0.5"/>
            <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="#2A2B33" stroke-width="0.5"/>
            <rect x="0" y="13.85" width="16.5" height="40.3" fill="none" stroke="#2A2B33" stroke-width="0.5"/>
            <rect x="88.5" y="13.85" width="16.5" height="40.3" fill="none" stroke="#2A2B33" stroke-width="0.5"/>
        </svg>
        <div class="hpa-ticker-wrap"><div class="hpa-ticker" id="ticker-gs"></div></div>
    </div>
</div>

<style>
    .hpa-tabs { display: flex; gap: 1rem; justify-content: center; margin-bottom: 1.5rem; }
    .hpa-tab { background: #0D0E12; color: #8A8A93; border: 1px solid #1B1B21; padding: 0.5rem 1rem; border-radius: 4px; font-family: 'IBM Plex Mono', monospace; cursor: pointer; transition: 0.2s;}
    .hpa-tab.active, .hpa-tab:hover { background: #B4FF39; color: #000; border-color: #B4FF39; font-weight: bold; }
    
    .hpa-pitch-wrap { display: flex; flex-direction: column; gap: 2rem; margin: 2rem 0; }
    .hpa-panel { background: #0D0E12; border: 1px solid #1B1B21; padding: 1rem; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);}
    .hpa-title { font-family: 'IBM Plex Mono', monospace; text-align: center; margin-bottom: 1rem; font-size: 1rem; letter-spacing: 2px; font-weight: bold;}
    .hpa-svg { width: 100%; height: auto; display: block; overflow: visible; }
    
    .hpa-ticker-wrap { height: 1.5rem; overflow: hidden; margin-top: 1rem; border-top: 1px solid #1B1B21; padding-top: 0.5rem; position: relative; display: flex; align-items: center;}
    .hpa-ticker { font-family: 'IBM Plex Mono', monospace; font-size: 0.85rem; white-space: nowrap; position: absolute; left: 100%; transition: none; }
    
    /* Oyuncu İkonları (SVG Atribütleriyle boyutlanacak) */
    .p-icon { transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1); }
    .p-text { font-family: 'IBM Plex Mono', monospace; font-size: 2.8px; text-anchor: middle; dominant-baseline: central; fill: #000; font-weight: 900; pointer-events: none;}
    
    /* İz Çizgileri */
    .p-trail { stroke-width: 0.5; stroke-linecap: round; stroke-dasharray: 2 2; fill: none; opacity: 0; transition: opacity 0.3s; }
</style>

<script>
const DATA = {
    all: {
        konya: [{id: 17, x: 35, y: 34, fx: 20, bx: 55}, {id: 11, x: 45, y: 25, fx: 25, bx: 65}, {id: 9, x: 50, y: 50, fx: 30, bx: 70}],
        gs: [{id: 90, x: 65, y: 30, fx: 85, bx: 45}, {id: 7, x: 55, y: 45, fx: 80, bx: 40}, {id: 45, x: 60, y: 55, fx: 75, bx: 35}]
    },
    "1h": {
        konya: [{id: 17, x: 40, y: 34, fx: 25, bx: 60}, {id: 11, x: 45, y: 25, fx: 30, bx: 60}, {id: 9, x: 50, y: 50, fx: 35, bx: 65}],
        gs: [{id: 90, x: 60, y: 30, fx: 80, bx: 40}, {id: 7, x: 55, y: 45, fx: 75, bx: 35}, {id: 45, x: 60, y: 55, fx: 70, bx: 30}]
    },
    "2h": {
        konya: [{id: 17, x: 45, y: 34, fx: 15, bx: 65}, {id: 11, x: 35, y: 25, fx: 10, bx: 60}, {id: 9, x: 40, y: 50, fx: 15, bx: 70}],
        gs: [{id: 90, x: 55, y: 30, fx: 85, bx: 35}, {id: 7, x: 50, y: 45, fx: 85, bx: 30}, {id: 45, x: 55, y: 55, fx: 80, bx: 25}]
    }
};

const COLORS = {
    konya: { fwd: '#FF6B35', bck: '#8B2500' },
    gs: { fwd: '#B4FF39', bck: '#2A5A00' }
};

const TICKERS = {
    fwd: ["Sağ kanattan ceza sahasına giriş (+0.12 xG)", "Hızlı hücum pası (Kilit pas)", "Birebirde rakibi geçme (Başarılı)"],
    bck: ["Kendi yarı alanında top çalma", "Hava topu müdahalesi (Başarılı)", "Rakip kontra atağı engelleme"]
};

let activeHalf = "all";
let timers = [];

function setHalf(half) {
    activeHalf = half;
    document.querySelectorAll('.hpa-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    // Reset and redraw
    timers.forEach(clearTimeout);
    timers = [];
    initTeam('konya');
    initTeam('gs');
}

function slideTicker(teamId, text, color) {
    const el = document.getElementById(`ticker-${teamId}`);
    el.style.color = color;
    el.textContent = text;
    el.style.transition = 'none';
    el.style.transform = 'translateX(0)';
    void el.offsetWidth;
    el.style.transition = 'transform 4s linear';
    el.style.transform = 'translateX(-150%)'; // slide left
}

function initTeam(teamId) {
    const svg = document.getElementById(`svg-${teamId}`);
    // Temizle (saha çizgileri kalacak, oyuncular silinecek)
    svg.querySelectorAll('.p-icon, .p-trail').forEach(e => e.remove());
    
    const players = DATA[activeHalf][teamId];
    const c = COLORS[teamId];
    const ns = "http://www.w3.org/2000/svg";
    
    players.forEach((p, i) => {
        // 1. Traill
        const line = document.createElementNS(ns, "line");
        line.setAttribute("class", "p-trail");
        line.setAttribute("x1", p.x); line.setAttribute("y1", p.y);
        svg.appendChild(line);
        
        // 2. Oyuncu Grubu
        const g = document.createElementNS(ns, "g");
        g.setAttribute("class", "p-icon");
        // CSS transform yerine saf SVG transform
        g.setAttribute("transform", `translate(${p.x}, ${p.y})`);
        
        const rect = document.createElementNS(ns, "rect");
        rect.setAttribute("x", "-3"); rect.setAttribute("y", "-3");
        rect.setAttribute("width", "6"); rect.setAttribute("height", "6");
        rect.setAttribute("rx", "1.2"); rect.setAttribute("fill", c.fwd);
        
        const txt = document.createElementNS(ns, "text");
        txt.setAttribute("class", "p-text");
        txt.textContent = p.id;
        
        g.appendChild(rect); g.appendChild(txt);
        svg.appendChild(g);
        
        // Hareket Fonksiyonu
        function moveTo(x, y, isFwd, text) {
            g.setAttribute("transform", `translate(${x}, ${y})`);
            line.setAttribute("stroke", isFwd ? c.fwd : c.bck);
            line.setAttribute("x2", x); line.setAttribute("y2", y);
            line.setAttribute("opacity", "0.8");
            slideTicker(teamId, `#${p.id} ${text}`, isFwd ? c.fwd : c.bck);
        }

        // Döngü Başlat (Her oyuncuya rastgele gecikme)
        const loop = () => {
            const fwdText = TICKERS.fwd[Math.floor(Math.random()*TICKERS.fwd.length)];
            moveTo(p.fx, p.y, true, fwdText);
            
            timers.push(setTimeout(() => {
                line.setAttribute("opacity", "0");
                const bckText = TICKERS.bck[Math.floor(Math.random()*TICKERS.bck.length)];
                moveTo(p.bx, p.y, false, bckText);
                
                timers.push(setTimeout(() => {
                    line.setAttribute("opacity", "0");
                    g.setAttribute("transform", `translate(${p.x}, ${p.y})`);
                    timers.push(setTimeout(loop, 1500));
                }, 2000));
            }, 2000));
        };
        
        timers.push(setTimeout(loop, 500 + i * 400));
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initTeam('konya');
    initTeam('gs');
});
</script>
'''
s = s.replace('<div id="hpa-anim-container"></div>', '<div id="hpa-anim-container">' + js + '</div>')
open(P,'w',encoding='utf-8').write(s)
print("✓ Tek hamlede sekmeler ve düzgün animasyon eklendi.")
print("BITTI")
