import os, re, shutil, datetime
P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
shutil.copy2(P, P+".bak."+datetime.datetime.now().strftime("%Y%m%d-%H%M%S"))
s = open(P, encoding='utf-8').read()
orig = len(s)

# İLK SVG = Konya (KONYASPOR başlığı altındaki)
m = re.search(r'<svg class="pitch-svg"[^>]*>', s)
start = m.end(); end = s.find('</svg>', start)
konya = s[start:end]
n_player = 0; n_trail = 0

# 1. player-g --dx değerlerini 105-X yap
def flip_dx(mo):
    global n_player
    n_player += 1
    dx = float(mo.group(1)); dy = mo.group(2)
    return f'--dx:{105.0-dx:.2f};--dy:{dy}'

konya = re.sub(r'--dx:(-?\d+\.?\d*);--dy:(-?\d+\.?\d*)', flip_dx, konya)

# 2. trail line x1/x2'leri 105-x yap (sadece trail-fwd ve trail-bck)
def flip_trail(mo):
    global n_trail
    n_trail += 1
    tag = mo.group(0)
    x1 = re.search(r'x1="([\d.]+)"', tag)
    x2 = re.search(r'x2="([\d.]+)"', tag)
    if not (x1 and x2): return tag
    new = tag.replace(f'x1="{x1.group(1)}"', f'x1="{105.0-float(x1.group(1)):.2f}"')
    new = new.replace(f'x2="{x2.group(1)}"', f'x2="{105.0-float(x2.group(1)):.2f}"')
    return new

konya = re.sub(r'<line\s+class="trail-(?:fwd|bck)"[^>]*>', flip_trail, konya)

s = s[:start] + konya + s[end:]
open(P,'w',encoding='utf-8').write(s)

print(f"✓ {n_player} Konya player-g flip (--dx -> 105-dx)")
print(f"✓ {n_trail} trail line flip (x1,x2 -> 105-x)")
print(f"✓ Dosya: {orig} -> {len(s)}")

# Kontrol
print("\n=== KONTROL ===")
m2 = re.search(r'<svg class="pitch-svg"[^>]*>(.*?)</svg>', s, re.DOTALL)
seg = m2.group(1)
print("Yeni --dx değerleri (ilk 5):")
for dx in re.findall(r'--dx:([\d.-]+)', seg)[:5]: print(f"  {dx}")
print("Yeni trail x1 (ilk 3):")
for x in re.findall(r'<line class="trail-fwd" x1="([\d.]+)', seg)[:3]: print(f"  {x}")

print("\nCtrl+Shift+R ile yenile")
print("Konya oyuncuları artık SAĞDAN SOLA hücum ediyor mu? evet/hayır")
print("BITTI")
