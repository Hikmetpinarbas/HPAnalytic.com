import os, re, shutil, datetime
P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
shutil.copy2(P, P+".bak."+datetime.datetime.now().strftime("%Y%m%d-%H%M%S"))
s = open(P, encoding='utf-8').read()
orig = len(s)

# 1. CSS: player-g animasyonunu öldür (köşeye ışınlamasın)
m = re.search(r'\.player-g\{[^}]*\}', s)
if m:
    s = s.replace(m.group(), '.player-g{}', 1)
    print("✓ Animasyon CSS'ten kaldırıldı")

# 2. Keyframes'i sil (artık gereksiz)
m = re.search(r'@keyframes swingPlayer\s*\{', s)
if m:
    op = m.end()-1; d=0
    for i in range(op, len(s)):
        if s[i]=='{': d+=1
        elif s[i]=='}':
            d-=1
            if d==0: 
                s = s[:m.start()] + s[i+1:]; break
    print("✓ @keyframes swingPlayer silindi")

# 3. Oyuncuları yerine oturt: style="--dx:X;--dy:Y" -> transform="translate(X, 34+Y)"
def convert(mo):
    dx = float(mo.group(1))
    dy = float(mo.group(2))
    # dy sahada 0-68 arası olmalı. Negatifse 34 ekle (orta çizgi).
    y_pos = dy if dy > 0 else 34 + dy
    return f'transform="translate({dx:.2f},{y_pos:.2f})"'

s = re.sub(r'style="--dx:(-?[\d.]+);--dy:(-?[\d.]+)"', convert, s)
print("✓ Oyuncular translate(x,y) ile sahaya yerleştirildi (köşe iptal)")

open(P,'w',encoding='utf-8').write(s)
print(f"✓ Kaydedildi: {orig} -> {len(s)}")

# Kontrol
print("\n=== KONTROL ===")
m = re.search(r'<svg class="pitch-svg"[^>]*>', s)
start = m.end(); end = s.find('</svg>', start)
konya = s[start:end]
print("Konya ilk 3 oyuncu:")
for i, mm in enumerate(re.finditer(r'<g class="player-g"[^>]*>', konya), 1):
    if i > 3: break
    print(f"  {mm.group()}")

print("\nCtrl+Shift+R ile yenile")
print("Oyuncular (10 Konya + 10 GS) SAHADA GÖRÜNÜYOR mu? var/yok")
print("BITTI")
