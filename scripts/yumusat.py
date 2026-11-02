import os, re, shutil, datetime
P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
shutil.copy2(P, P + ".bak." + datetime.datetime.now().strftime("%Y%m%d-%H%M%S"))
s = open(P, encoding='utf-8').read()
orig = len(s); n_rep = 0

# 1. .player-g CSS bloğunu bul, yumuşat
m = re.search(r'\.player-g\{[^}]+\}', s)
if m:
    old = m.group()
    new = old.replace('12.5s', '8s').replace('cubic-bezier(0.4,0,0.2,1)', 'cubic-bezier(0.45,0.05,0.25,1)')
    if new != old:
        s = s.replace(old, new, 1); n_rep += 1
        print(f"✓ player-g CSS yumuşatıldı (12.5s→8s, easing)")

# 2. Tüm --dx/--dy değerleri 1/3'e
def scale(mo):
    return f'--dx:{float(mo.group(1))/3:.2f};--dy:{float(mo.group(2))/3:.2f}'
s, k = re.subn(r'--dx:(-?\d+\.?\d*);--dy:(-?\d+\.?\d*)', scale, s)
print(f"✓ {k} player-g --dx/--dy 1/3'e indirildi (50→17 birim)")

# 3. Diğer animasyon sürelerini eşitle
for o in ['drawFwd 12.5s','drawBck 12.5s','swingPlayer 12.5s']:
    n = o.replace('12.5s','8s')
    if o in s: s = s.replace(o, n); n_rep += 1

open(P,'w',encoding='utf-8').write(s)
print(f"✓ Kaydedildi: {orig} -> {len(s)}, {n_rep} kural")

# 4. ŞUT HARİTASI NEREDE?
print("\n=== şut/marker arama ===")
for kw in ['shot','Shot','marker','goal-dot','shot-dot','data-action','"Penalty"','"Goals"','"Shots on target"']:
    hits = [m.start() for m in re.finditer(re.escape(kw), s)]
    if hits: print(f"  '{kw}': {len(hits)} geçiş")

# 5. Her iki SVG'de element sayımı
print("\n=== SVG ELEMENT SAYIMI ===")
for m in re.finditer(r'<svg[^>]*class="[^"]*pitch-svg[^"]*"[^>]*>', s):
    a=m.start(); end=s.find('</svg>',a)+6; seg=s[a:end]
    pre=s[max(0,a-300):a]
    lbl='GS' if 'GALATASARAY' in pre else ('KON' if 'KONYASPOR' in pre else '?')
    print(f"  [{lbl}] circle={seg.count('<circle')} ellipse={seg.count('<ellipse')} player-g={seg.count('player-g')} path={seg.count('<path')} text={seg.count('<text')}")

# 6. GOL TİYATROSU
print("\n=== goal-theater JS ===")
for m in re.finditer(r'goal-theater', s):
    a=m.start(); print(f"  satır {s[:a].count(chr(10))+1}: ...{s[a:a+120].replace(chr(10),' ')}...")

print("\nBITTI")
