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

# TANI
print("=== MEVCUT ===")
m = re.search(r'\.player-g\{[^}]*\}', s)
if m: print(f"CSS: {m.group()[:180]}")
rect = re.search(r'<g class="player-g"[^>]*><rect[^>]*fill="([^"]*)"', s)
if rect: print(f"Rect fill: {rect.group(1)}")
else:
    rect2 = re.search(r'<g class="player-g"[^>]*><rect[^>]*/>', s)
    if rect2: print(f"Rect: {rect2.group()[:160]}")

# DÜZELTME 1: --dx/--dy ×3 (orijinal konuma dön)
def tri(mo):
    return f'--dx:{float(mo.group(1))*3:.2f};--dy:{float(mo.group(2))*3:.2f}'
s, k = re.subn(r'--dx:(-?\d+\.?\d*);--dy:(-?\d+\.?\d*)', tri, s)
print(f"\n✓ {k} oyuncu konumu eski değerine (×3) döndü")
n += k

# DÜZELTME 2: CSS — base translate ekle
m = re.search(r'\.player-g\{[^}]*\}', s)
if m:
    old = m.group()
    new = '.player-g{transform:translate(var(--dx),var(--dy));transform-origin:center;animation:swingPlayer 6s ease-in-out infinite}'
    s = s.replace(old, new, 1)
    print(f"✓ CSS: transform=translate(dx,dy), origin=center")
    n += 1

# DÜZELTME 3: keyframes — küçük salınım
m = re.search(r'@keyframes swingPlayer\s*\{', s)
if m:
    op = m.end()-1
    cl = block_end(s, op)
    if cl>0:
        new_kf = '@keyframes swingPlayer{0%,100%{transform:translate(var(--dx),var(--dy)) rotate(0deg)}25%{transform:translate(var(--dx),var(--dy)) rotate(-5deg)}75%{transform:translate(var(--dx),var(--dy)) rotate(5deg)}}'
        s = s[:m.start()] + new_kf + s[cl+1:]
        print(f"✓ Keyframes: ±5deg rotate (base korunur)")
        n += 1

open(P,'w',encoding='utf-8').write(s)
print(f"\n✓ Kaydedildi: {orig} -> {len(s)}, {n} değişiklik")

# DOĞRULAMA
print("\n=== YENİ ===")
m = re.search(r'\.player-g\{[^}]*\}', s)
if m: print(f"CSS: {m.group()[:180]}")
m = re.search(r'@keyframes swingPlayer\s*\{', s)
if m:
    op = m.end()-1; cl = block_end(s, op)
    print(f"KFs: {s[m.start():cl+1][:220]}")
samp = re.findall(r'<g class="player-g"[^>]*>', s)
print(f"\nToplam player-g: {len(samp)}")
if samp[:2]: 
    for x in samp[:2]: print(f"  {x}")
if samp: print(f"  son: {samp[-1]}")

print("\nBITTI")
