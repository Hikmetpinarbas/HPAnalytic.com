import os, re, shutil, datetime
P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
BAK = P + ".bak.20261102-030443" # Leão ve Şut Haritası fixlerinin olduğu en sağlam yedek

shutil.copy2(P, P + ".bozuk_animasyon." + datetime.datetime.now().strftime("%H%M%S"))
shutil.copy2(BAK, P)
s = open(P, encoding='utf-8').read()
print("✓ Dosya en sağlam yedeğe (030443) döndürüldü.")

# ESKİ POZİSYON HARİTALARINI SİL
# "Pozisyon haritaları" başlığı ile "Gol anları" (veya "Neden kazandı") başlığı arasını komple sil.
m = re.search(r'(<h2[^>]*>Pozisyon haritaları</h2>).*?(<h2[^>]*>Neden kazandı\?</h2>|<h2[^>]*>Gol anları</h2>)', s, re.DOTALL)
if m:
    # 1. grup başlık, 2. grup sonraki başlık. Arası çöpe.
    yeni_bolum = m.group(1) + '\n<div id="hpa-anim-container"></div>\n' + m.group(2)
    s = s.replace(m.group(0), yeni_bolum, 1)
    print("✓ Eski statik SVG'ler ve CSS'leri tamamen silindi.")
else:
    print("✗ Eski bölüm bulunamadı, manuel müdahale gerekebilir.")
    raise SystemExit

# YENİ MOTORU EKLE (JavaScript + CSS)
js = '''
<script>
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("hpa-anim-container");
    if (!container) return;

    // 4 RENK PALETİ
    const COLORS = {
        konya: { fwd: '#FF6B35', bck: '#8B2500' }, // Turuncu / Koyu Turuncu
        gs:    { fwd: '#B4FF39', bck: '#2A5A00' }  // Neon Yeşil / Koyu Yeşil
    };

    // TAKIM VERİLERİ (Diziliş, Ofansif En Uç, Defansif En Geri)
    // x değerleri sahanın kendi koordinatlarıdır (0-105).
    const teams = [
        {
            id: 'konya', name: 'KONYASPOR (Sol)', dir: -1, color: COLORS.konya,
            players: [
                { id: 17, x: 45, y: 34, fwd_x: 20, bck_x: 70 }, // Andzouana
                { id: 11, x: 50, y: 25, fwd_x: 25, bck_x: 75 },
                { id: 9,  x: 55, y: 50, fwd_x: 25, bck_x: 80 },
                { id: 91, x: 60, y: 34, fwd_x: 30, bck_x: 85 }
            ]
        },
        {
            id: 'gs', name: 'GALATASARAY (Sağ)', dir: 1, color: COLORS.gs,
            players: [
                { id: 90, x: 60, y: 30, fwd_x: 85, bck_x: 35 }, // Singo
                { id: 7,  x: 55, y: 45, fwd_x: 80, bck_x: 30 },
                { id: 45, x: 50, y: 55, fwd_x: 75, bck_x: 25 },
                { id: 17, x: 40, y: 34, fwd_x: 70, bck_x: 20 }
            ]
        }
    ];

    // ALTYAZI VERİLERİ (Örnek Eylemler)
    const tickers = {
        fwd: ["Sağ kanattan ceza sahasına giriş (+0.12 xG)", "Hızlı hücum pası (Kilit pas)", "Birebirde rakibi geçme (Başarılı)", "Şut (İsabetli, Kaleci kurtardı)"],
        bck: ["Kendi yarı alanında top çalma", "Hava topu müdahalesi (Başarılı)", "Rakip kontra atağı engelleme", "Pas arası (Kritik bölgede)"]
    };

    // HTML YAPISI
    container.innerHTML = `
        <div class="hpa-pitch-wrap">
            ${teams.map(t => `
            <div class="hpa-panel">
                <div class="hpa-title" style="color:${t.color.fwd}">${t.name}</div>
                <svg viewBox="0 0 105 68" class="hpa-svg" id="svg-${t.id}">
                    <rect width="105" height="68" fill="#08090B" stroke="#2A2B33" stroke-width="0.5"/>
                    <line x1="52.5" y1="0" x2="52.5" y2="68" stroke="#2A2B33" stroke-width="0.5"/>
                    <circle cx="52.5" cy="34" r="9.15" fill="none" stroke="#2A2B33" stroke-width="0.5"/>
                    <rect x="0" y="13.85" width="16.5" height="40.3" fill="none" stroke="#2A2B33" stroke-width="0.5"/>
                    <rect x="88.5" y="13.85" width="16.5" height="40.3" fill="none" stroke="#2A2B33" stroke-width="0.5"/>
                </svg>
                <div class="hpa-ticker" id="ticker-${t.id}">
                    <span class="ticker-text">Hazır...</span>
                </div>
            </div>
            `).join('')}
        </div>
        <style>
            .hpa-pitch-wrap { display: flex; flex-direction: column; gap: 2rem; margin: 2rem 0; }
            .hpa-panel { background: #0D0E12; border: 1px solid #1B1B21; padding: 1rem; border-radius: 8px; }
            .hpa-title { font-family: 'IBM Plex Mono', monospace; text-align: center; margin-bottom: 1rem; font-size: 0.9rem; letter-spacing: 2px;}
            .hpa-svg { width: 100%; height: auto; display: block; }
            .hpa-ticker { font-family: 'IBM Plex Mono', monospace; font-size: 0.85rem; margin-top: 1rem; height: 2rem; overflow: hidden; border-top: 1px solid #1B1B21; padding-top: 0.5rem; position: relative;}
            .ticker-text { position: absolute; white-space: nowrap; animation: slideLeft 8s linear infinite; opacity: 0; }
            @keyframes slideLeft { 0% { transform: translateX(100%); opacity: 0;} 10% {opacity: 1;} 90% {opacity: 1;} 100% { transform: translateX(-100%); opacity: 0;} }
            
            .hpa-player { transition: transform 1.5s ease-in-out; transform-origin: center; }
            .hpa-player rect { width: 7; height: 7; x: -3.5; y: -3.5; rx: 1.5; }
            .hpa-player text { font-family: 'IBM Plex Mono', monospace; font-size: 3px; text-anchor: middle; dominant-baseline: central; fill: #000; font-weight: bold; }
            
            .hpa-trail { transition: all 1.5s ease-in-out; stroke-width: 1.2; stroke-linecap: round; fill: none; opacity: 0; }
            .hpa-trail.active { opacity: 0.8; }
        </style>
    `;

    // ANİMASYON MOTORU
    function animateTeam(team) {
        const svg = document.getElementById(`svg-${team.id}`);
        const ticker = document.getElementById(`ticker-${team.id}`);

        // Çizgiler ve İkonlar için gruplar
        const trailGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const playerGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        svg.appendChild(trailGroup);
        svg.appendChild(playerGroup);

        const elements = team.players.map(p => {
            // Çizgi (Comet)
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("class", "hpa-trail");
            line.setAttribute("stroke", team.color.fwd);
            trailGroup.appendChild(line);

            // Oyuncu İkonu
            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.setAttribute("class", "hpa-player");
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("fill", team.color.fwd);
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.textContent = p.id;
            g.appendChild(rect);
            g.appendChild(text);
            playerGroup.appendChild(g);

            // Başlangıç Konumu (Diziliş)
            g.style.transform = `translate(${p.x}px, ${p.y}px)`;
            
            return { ...p, line, g };
        });

        function setTicker(text, isFwd) {
            const span = ticker.querySelector('.ticker-text');
            span.textContent = text;
            span.style.color = isFwd ? team.color.fwd : team.color.bck;
            // Altyazıyı yeniden başlat
            span.style.animation = 'none';
            void span.offsetWidth; // Reflow
            span.style.animation = 'slideLeft 6s linear infinite';
        }

        // DÖNGÜ: Ofansif -> Bekle -> Defansif
        function runCycle() {
            // 1. Ofansif Hareket (İleri)
            setTicker("Takım Ofansif Harekette...", true);
            
            elements.forEach(el => {
                el.g.style.transform = `translate(${el.fwd_x}px, ${el.y}px)`; // İleri
                el.line.setAttribute("stroke", team.color.fwd); // Pozitif renk
                el.line.setAttribute("x1", el.x); el.line.setAttribute("y1", el.y);
                el.line.setAttribute("x2", el.fwd_x); el.line.setAttribute("y2", el.y);
                el.line.classList.add("active");

                // Rastgele Ofansif Metin ata
                const msgs = tickers.fwd;
                setTicker(`#${el.id} ${msgs[Math.floor(Math.random()*msgs.length)]}`, true);
            });

            // 2. Bekleme ve Defansif Hareket (Geri)
            setTimeout(() => {
                elements.forEach(el => {
                    el.line.classList.remove("active"); // Eski izi sil
                });
                
                setTimeout(() => {
                    setTicker("Takım Defansif Harekette...", false);
                    
                    elements.forEach(el => {
                        el.g.style.transform = `translate(${el.bck_x}px, ${el.y}px)`; // Geri
                        el.line.setAttribute("stroke", team.color.bck); // Negatif renk
                        el.line.setAttribute("x1", el.fwd_x); el.line.setAttribute("y1", el.y);
                        el.line.setAttribute("x2", el.bck_x); el.line.setAttribute("y2", el.y);
                        el.line.classList.add("active");
                        
                        const msgs = tickers.bck;
                        setTicker(`#${el.id} ${msgs[Math.floor(Math.random()*msgs.length)]}`, false);
                    });
                }, 500);

                // 3. Başa Dön
                setTimeout(() => {
                    elements.forEach(el => {
                        el.line.classList.remove("active");
                        el.g.style.transform = `translate(${el.x}px, ${el.y}px)`; // Dizilişe dön
                    });
                    setTicker("Dizilişe dönülüyor...", true);
                    
                    // Döngüyü yeniden başlat
                    setTimeout(runCycle, 2000);
                }, 3000); // Defansif hareket süresi
            }, 3000); // Ofansif hareket süresi
        }

        // Başlat
        setTimeout(runCycle, 1000);
    }

    // Takımları çalıştır
    teams.forEach(t => animateTeam(t));
});
</script>
'''

s = s.replace('<div id="hpa-anim-container"></div>', '<div id="hpa-anim-container"></div>\n' + js)

open(P,'w',encoding='utf-8').write(s)
print(f"✓ Yeni animasyon motoru eklendi. Dosya boyutu: {len(s)}")

print("\nCtrl+Shift+R yap ve izle.")
print("BITTI")
