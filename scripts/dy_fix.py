import os, re, shutil, datetime
P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
shutil.copy2(P, P+".bak."+datetime.datetime.now().strftime("%Y%m%d-%H%M%S"))
s = open(P, encoding='utf-8').read()
orig = len(s); n = 0

# 1. dy + 34 (merkez)
def fix(mo):
    global n
    dx = float(mo.group(1)); dy = float(mo.group(2))
    n += 1
    return f'transform="translate({dx:.2f},{34+dy:.2f})"'
s = re.sub(r'transform="translate\(([-\d.]+),([-\d.]+)\)"', fix, s)
print(f"✓ {n} player-g: dy -> 34+dy (merkez ofseti)")

# 2. Konya --dx flip'ini geri al: 105-dx -> dx
m = re.search(r'<svg class="pitch-svg"[^>]*>', s)
start = m.end(); end = s.find('</svg>', start)
konya = s[start:end]; nk = 0
def unfix(mo):
    global nk
    dx = float(mo.group(1)); dy = float(mo.group(2))
    nk += 1
    return f'transform="translate({105-dx:.2f},{dy:.2f})"'
konya = re.sub(r'transform="translate\(([-\d.]+),([-\d.]+)\)"', unfix, konya)
s = s[:start] + konya + s[end:]
print(f"✓ {nk} Konya player-g: dx geri (105-x -> x)")

# 3. Trail line'ları da geri çevir
konya = s[start:end]; nt = 0
def untrail(mo):
    global nt
    tag = mo.group(0)
    x1 = re.search(r'x1="([\d.]+)"', tag); x2 = re.search(r'x2="([\d.]+)"', tag)
    if not (x1 and x2): return tag
    nt += 1
    new = tag.replace(f'x1="{x1.group(1)}"', f'x1="{105-float(x1.group(1)):.2f}"')
    new = new.replace(f'x2="{x2.group(1)}"', f'x2="{105-float(x2.group(1)):.2f}"')
    return new
konya = re.sub(r'<line class="trail-(?:fwd|bck)"[^>]*>', untrail, konya)
s = s[:start] + konya + s[end:]
print(f"✓ {nt} Konya trail: x geri")

open(P,'w',encoding='utf-8').write(s)
print(f"\n✓ Dosya: {orig} -> {len(s)}")

# Kontrol
print("\n=== KONTROL ===")
m = re.search(r'<svg class="pitch-svg"[^>]*>', s)
start = m.end(); end = s.find('</svg>', start)
konya = s[start:end]
print("Konya player-g transform (ilk 5):")
for i, mm in enumerate(re.finditer(r'transform="translate\(([\d.]+),([\d.]+)\)"', konya), 1):
    if i > 5: break
    print(f"  ({mm.group(1)}, {mm.group(2)})")

print("\nCtrl+Shift+R ile yenile")
print("20 oyuncu sahada görünüyor mu? var/yok")
print("Konya solda GS sağda mı? evet/hayır")
print("BITTI")
