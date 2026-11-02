import os, re
P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
s = open(P, encoding='utf-8').read()
L = len(s)
def ln(i): return s[:i].count('\n')+1
def ctx(i, n=80): 
    a=max(0,i-n); b=min(L,i+n); return s[a:b].replace('\n',' ')[:200]

print(f"DOSYA: {L} char\n")

print("=== 1. SWINGPLAYER ===")
for m in re.finditer(r'swingPlayer', s):
    print(f"  satır {ln(m.start())}: ...{ctx(m.start(),60)}...")

print("\n=== 2. ŞUT HARİTASI YÖNÜ ===")
# shot map ile ilgili svg/transform arayalım
for kw in ['shot-map','shotMap','shots-svg','pitch-gs','pitch-konya','flip-x','scale(-1','translate(']:
    hits = [m.start() for m in re.finditer(re.escape(kw), s)]
    if hits:
        print(f"  '{kw}': {len(hits)} geçiş, ilk satır {ln(hits[0])}")
        for h in hits[:2]:
            print(f"    ...{ctx(h,50)}...")

# gol pozisyonları x,y koordinatları
print("\n  Gol event'leri (x,y) koordinatları:")
for m in re.finditer(r'"(x|pos_x)"\s*:\s*(-?\d+\.?\d*)[^}]{0,200}"(y|pos_y)"\s*:\s*(-?\d+\.?\d*)', s):
    print(f"    satır {ln(m.start())}: x={m.group(2)} y={m.group(4)} ...{ctx(m.start(),40)}...")

print("\n=== 3. LEÃO / xG ANLATI ===")
for m in re.finditer(r'[Ll]e[aã]o', s):
    print(f"  satır {ln(m.start())}: ...{ctx(m.start(),90)}...")

print("\n=== 4. TRAIL ÇİZGİ ===")
for kw in ['stroke-dashoffset','stroke-dasharray','comet','trail','@keyframes trail']:
    hits = [m.start() for m in re.finditer(re.escape(kw), s)]
    if hits:
        print(f"  '{kw}': {len(hits)} geçiş (satırlar: {[ln(h) for h in hits[:5]]})")
        print(f"    ilk: ...{ctx(hits[0],70)}...")

print("\nBITTI")
