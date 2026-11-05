import os, re, shutil, datetime
P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
shutil.copy2(P, P+".bak."+datetime.datetime.now().strftime("%Y%m%d-%H%M%S"))
s = open(P, encoding='utf-8').read()
orig = len(s)

# ========== TANI ==========
print("=== 1. MEVCUT DURUM ===")
m = re.search(r'\.player-g\{[^}]*\}', s)
if m: print(f"CSS: {m.group()[:160]}")
m = re.search(r'@keyframes swingPlayer\s*\{[^}]*\}[^}]*\}[^}]*\}[^}]*\}', s)
if m: print(f"KF: {m.group()[:250]}")

# İlk player-g ve etrafı (wrapper var mı?)
first = re.search(r'.{200}<g class="player-g".{300}', s, re.DOTALL)
if first:
    print(f"\n=== 2. İLK PLAYER-G ETRAFI ===")
    print(first.group()[:500])

# ========== DÜZELTME ==========
n_converted = 0
def convert(mo):
    global n_converted
    whole = mo.group(0)
    # --dx:X;--dy:Y çıkar
    mdx = re.search(r'--dx:(-?[\d.]+)', whole)
    mdy = re.search(r'--dy:(-?[\d.]+)', whole)
    if not (mdx and mdy): return whole
    dx = float(mdx.group(1)); dy = float(mdy.group(1))
    # style attribute'u tümüyle kaldır, transform attribute ekle
    new = re.sub(r'\s+style="[^"]*"', '', whole, count=1)
    new = new.replace('<g class="player-g"', f'<g class="player-g" transform="translate({dx:.2f},{dy:.2f})"', 1)
    n_converted += 1
    return new

s = re.sub(r'<g class="player-g"[^>]*>', convert, s)
print(f"\n✓ {n_converted} player-g inline transform'a çevrildi")

# ========== CSS TEMİZLE ==========
# 1. .player-g animation'ı KALDIR
m = re.search(r'\.player-g\{[^}]*\}', s)
if m:
    s = s.replace(m.group(), '.player-g{}', 1)
    print(f"✓ .player-g CSS boşaltıldı (animasyon yok)")

# 2. @keyframes swingPlayer KALDIR (kullanılmıyor)
m = re.search(r'@keyframes swingPlayer\s*\{', s)
if m:
    # block sonu bul
    op = m.end()-1; d=0; cl=op
    for i in range(op, len(s)):
        if s[i]=='{': d+=1
        elif s[i]=='}':
            d-=1
            if d==0: cl=i; break
    s = s[:m.start()] + s[cl+1:]
    print(f"✓ @keyframes swingPlayer silindi")

open(P,'w',encoding='utf-8').write(s)
print(f"\n✓ Dosya: {orig} -> {len(s)}")

# ========== DOĞRULAMA ==========
print("\n=== 3. YENİ ÖRNEK PLAYER-G (Konya ilk 2) ===")
m = re.search(r'<svg class="pitch-svg"[^>]*>', s)
start = m.end(); end = s.find('</svg>', start)
konya = s[start:end]
for i, mm in enumerate(re.finditer(r'<g class="player-g"[^>]*>', konya), 1):
    if i > 2: break
    print(f"  {mm.group()}")

print("\n=== 4. YENİ ÖRNEK PLAYER-G (GS ilk 2) ===")
m2 = list(re.finditer(r'<svg class="pitch-svg"[^>]*>', s))[1]
start = m2.end(); end = s.find('</svg>', start)
gs = s[start:end]
for i, mm in enumerate(re.finditer(r'<g class="player-g"[^>]*>', gs), 1):
    if i > 2: break
    print(f"  {mm.group()}")

print("\nCtrl+Shift+R ile yenile")
print("Oyuncular GÖRÜNÜYOR mu? var/yok")
print("BITTI")
