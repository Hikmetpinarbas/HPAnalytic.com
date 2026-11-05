import os, re, shutil, datetime
P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
shutil.copy2(P, P+".bak."+datetime.datetime.now().strftime("%Y%m%d-%H%M%S"))
s = open(P, encoding='utf-8').read()
orig = len(s); n = 0

def block_end(t, op):
    d = 0
    for i in range(op, len(t)):
        if t[i]=='{': d+=1
        elif t[i]=='}':
            d-=1
            if d==0: return i
    return -1

# 1. .player-g CSS
m = re.search(r'\.player-g\{[^}]*\}', s)
if m:
    print(f"ESKİ CSS: {m.group()[:180]}")
    yeni = '.player-g{transform-origin:0 0;animation:swingPlayer 6s ease-in-out infinite}'
    s = s.replace(m.group(), yeni, 1); n += 1
    print(f"YENİ CSS: {yeni}")

# 2. @keyframes swingPlayer
m = re.search(r'@keyframes swingPlayer\s*\{', s)
if m:
    op = m.end()-1
    cl = block_end(s, op)
    if cl > 0:
        print(f"ESKİ KF: {s[m.start():cl+1][:200]}")
        yeni_kf = ('@keyframes swingPlayer{'
                   '0%,100%{transform:translate(var(--dx),var(--dy)) rotate(0deg)}'
                   '25%{transform:translate(var(--dx),var(--dy)) rotate(-4deg)}'
                   '75%{transform:translate(var(--dx),var(--dy)) rotate(4deg)}'
                   '}')
        s = s[:m.start()] + yeni_kf + s[cl+1:]
        n += 1
        print(f"YENİ KF: {yeni_kf}")

open(P,'w',encoding='utf-8').write(s)
print(f"\n✓ Dosya: {orig} -> {len(s)}, {n} değişiklik")

# Doğrulama
print("\n=== DOĞRULAMA ===")
m = re.search(r'\.player-g\{[^}]*\}', s)
if m: print(f"CSS: {m.group()}")
m = re.search(r'@keyframes swingPlayer\s*\{', s)
if m:
    op=m.end()-1; cl=block_end(s,op)
    print(f"KF: {s[m.start():cl+1]}")

# Örnek --dx
print("\nÖrnek player-g (ilk 2):")
for i, mm in enumerate(re.finditer(r'--dx:([\d.-]+);--dy:([\d.-]+)', s), 1):
    if i > 2: break
    print(f"  dx={mm.group(1)} dy={mm.group(2)}")

print("\nCtrl+Shift+R ile yenile")
print("Sor: Oyuncular sahada (10 Konya sol + 10 GS sağ) görünüyor mu? var/yok")
print("BITTI")
