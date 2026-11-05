import os, re, shutil, datetime
P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
shutil.copy2(P, P+".bak."+datetime.datetime.now().strftime("%Y%m%d-%H%M%S"))
s = open(P, encoding='utf-8').read()
orig = len(s); n_pl = 0; n_tr = 0

# Tüm SVG'leri bul (Konya ilk, GS ikinci)
svgs = list(re.finditer(r'<svg class="pitch-svg"[^>]*>(.*?)</svg>', s, re.DOTALL))
if len(svgs) < 2:
    print("✗ 2 adet pitch-svg bulunamadı"); raise SystemExit

# İKİNCİ SVG (Galatasaray) içeriğini al
gs_start = svgs[1].start(1)
gs_end = svgs[1].end(1)
gs_content = svgs[1].group(1)

# 1. GS oyuncularını sağa çevir: translate(x, y) -> translate(105-x, y)
def flip_player(mo):
    global n_pl
    x = float(mo.group(1)); y = float(mo.group(2))
    n_pl += 1
    return f'transform="translate({105.0-x:.2f},{y:.2f})"'
gs_content = re.sub(r'transform="translate\(([\d.]+),([\d.]+)\)"', flip_player, gs_content)

# 2. GS çizgilerini (trail) sağa çevir
def flip_trail(mo):
    global n_tr
    tag = mo.group(0)
    x1 = re.search(r'x1="([\d.]+)"', tag); x2 = re.search(r'x2="([\d.]+)"', tag)
    if not (x1 and x2): return tag
    n_tr += 1
    new = tag.replace(f'x1="{x1.group(1)}"', f'x1="{105.0-float(x1.group(1)):.2f}"')
    new = new.replace(f'x2="{x2.group(1)}"', f'x2="{105.0-float(x2.group(1)):.2f}"')
    return new
gs_content = re.sub(r'<line class="trail-(?:fwd|bck)"[^>]*>', flip_trail, gs_content)

# Geri yaz
s = s[:gs_start] + gs_content + s[gs_end:]
open(P,'w',encoding='utf-8').write(s)

print(f"✓ {n_pl} GS oyuncusu sağa çevrildi (105-x)")
print(f"✓ {n_tr} GS çizgisi sağa çevrildi")
print(f"✓ Dosya: {orig} -> {len(s)}")

# Kontrol
print("\n=== KONTROL: GS İLK 3 OYUNCU ===")
for i, mm in enumerate(re.finditer(r'transform="translate\(([\d.]+),([\d.]+)\)"', gs_content), 1):
    if i > 3: break
    print(f"  x={mm.group(1)} (sağda olmalı > 52)")

print("\nCtrl+Shift+R ile yenile")
print("Konya solda, Galatasaray sağda mı? evet/hayır")
print("BITTI")
