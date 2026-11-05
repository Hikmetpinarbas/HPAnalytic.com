import os, json, shutil, datetime

REPO = os.path.expanduser("~/hpanalytic-repo")
P_HTML = os.path.join(REPO, "public/yazi/konya-gs-v2.html")
P_JSON = os.path.join(REPO, "public/assets/data/konya-gs/match_data.json")

# === 1. JSON'u kontrol et: gerçekten 11 mi? ===
print("=== JSON KONTROL ===")
data = json.load(open(P_JSON, encoding='utf-8'))
for cat in ['all','1h','2h']:
    for tid in ['konya','gs']:
        xi = data[cat][tid]['xi']
        bench = data[cat][tid]['bench']
        ids = [p['id'] for p in xi]
        print(f"  [{cat}] {tid}: xi={len(xi)} ({ids}) | bench={len(bench)}")
        if len(xi) > 11:
            print(f"    ⚠ 11'den fazla! İlk 11'e kırpılıyor")
            data[cat][tid]['xi'] = xi[:11]

# Debug: JSON'u yaz
json.dump(data, open(P_JSON, 'w', encoding='utf-8'), ensure_ascii=False)

# === 2. HTML'i güncelle: sadece 2 değişiklik ===
print("\n=== HTML DÜZELTME ===")
shutil.copy2(P_HTML, P_HTML + ".bak.fix11." + datetime.datetime.now().strftime("%H%M%S"))
s = open(P_HTML, encoding='utf-8').read()

# a) Değişiklikler sekmesini "girenler" olarak değiştir
old_subs_fn = '''    function renderSubs(){
        timers.forEach(clearTimeout); timers = [];
        const box = document.getElementById("hp-pos-motor");
        const subs = data.substitutions || { konya: [], gs: [] };
        const half = data["all"];
        
        function subsBlock(tid) {
            const teamColor = TEAM_COLOR[tid];
            const teamName = TEAM_NAME[tid];
            const subList = subs[tid] || [];
            const bench = half[tid].bench || [];
            
            return `
                <div class="team-block">
                    <div class="team-name" style="color:${teamColor}">${teamName}</div>
                    <div style="color:#FFF;font-weight:bold;margin-bottom:0.3rem">Yedekler (${bench.length})</div>
                    ${bench.length > 0 ? bench.map(p => `<div class="sub-item">#${p.id} ${p.name} (${p.samples} aksiyon)</div>`).join('') : '<div class="sub-item">Kayıtlı yedek yok</div>'}
                    <div style="color:#FFF;font-weight:bold;margin:0.6rem 0 0.3rem 0">Değişiklikler (${subList.length})</div>
                    ${subList.length > 0 ? subList.map(s => `<div class="sub-item">${Math.round(s.time_min)}' — ${s.detail}</div>`).join('') : '<div class="sub-item">Değişiklik verisi CSV\\'de yok</div>'}
                    <div style="color:#8A8A93;font-size:0.75rem;margin-top:0.5rem;font-style:italic">Limit: 5 normal + 2 travma = 7 değişiklik hakkı</div>
                </div>
            `;
        }'''

new_subs_fn = '''    function renderSubs(){
        timers.forEach(clearTimeout); timers = [];
        const box = document.getElementById("hp-pos-motor");
        const half = data["all"];
        
        function subsBlock(tid) {
            const teamColor = TEAM_COLOR[tid];
            const teamName = TEAM_NAME[tid];
            const bench = half[tid].bench || [];
            
            return `
                <div class="team-block">
                    <div class="team-name" style="color:${teamColor}">${teamName}</div>
                    <div style="color:#FFF;font-weight:bold;margin-bottom:0.4rem">Oyuna Giren Oyuncular (${bench.length})</div>
                    ${bench.length > 0 ? bench.map(p => `<div class="sub-item">► #${p.id} ${p.name} <span style="color:#B4FF39">(${p.samples} aksiyon)</span></div>`).join('') : '<div class="sub-item" style="color:#8A8A93">Kayıtlı değişiklik yok</div>'}
                    <div style="color:#8A8A93;font-size:0.75rem;margin-top:0.5rem;font-style:italic">Kural: 5 normal + 2 travma = 7 değişiklik hakkı. Bu maçta CSV\\'de substitution verisi yoksa, bu liste saha dışı oyuncuları gösterir.</div>
                </div>
            `;
        }'''

if old_subs_fn in s:
    s = s.replace(old_subs_fn, new_subs_fn, 1)
    print("  ✓ Değişiklikler sekmesi güncellendi (girenler)")
else:
    print("  ⚠ Eski renderSubs bulunamadı, atlandı")

# b) drawTeam içine güvenlik: 11 oyuncuyu zorla
old_draw = '''        xi.forEach(p => {'''
new_draw = '''        xi.slice(0, 11).forEach(p => {'''
if old_draw in s:
    s = s.replace(old_draw, new_draw, 1)
    print("  ✓ drawTeam: en fazla 11 oyuncu çizilecek")

# c) Console'a oyuncu sayısı log
old_log = '''            timers.push(setTimeout(cycle, 3000 + Math.random() * 800));
        });
    }'''
new_log = '''            timers.push(setTimeout(cycle, 3000 + Math.random() * 800));
        });
        console.log("[" + teamId.toUpperCase() + "] " + xi.length + " oyuncu çizildi");
    }'''
if old_log in s:
    s = s.replace(old_log, new_log, 1)
    print("  ✓ Console'a oyuncu sayısı log")

open(P_HTML, 'w', encoding='utf-8').write(s)
print(f"\n✓ Dosya: {len(s)} char")
print("Ctrl+Shift+R yap.")
print("  F12 → Console'da '22 oyuncu' görmelisin (11+11)")
print("  Değişiklikler sekmesinde sadece GİRENLER görünecek")
