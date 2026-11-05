import os, re
P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
s = open(P, encoding='utf-8').read()
m = re.search(r'<svg class="pitch-svg"[^>]*>(.*?)</svg>', s, re.DOTALL)
konya = m.group(1)
print("=== KONYA SVG İÇİ ===")
for tag in ['circle','line','path','rect','text','g']:
    print(f"  {tag}: {konya.count('<'+tag)}")
print("\n=== CLASS'LAR ===")
for c in sorted(set(re.findall(r'class="([^"]+)"', konya))):
    print(f"  .{c}")
print("\n=== --dx DEĞERLERİ (ilk 5) ===")
for dx in re.findall(r'--dx:([\d.-]+)', konya)[:5]:
    print(f"  {dx}")
print("\n=== LINE ETİKETLERİ ===")
for line in re.findall(r'<line[^>]*>', konya)[:5]:
    print(f"  {line[:160]}")
print("\n=== PATH ETİKETLERİ (ilk 3) ===")
for path in re.findall(r'<path[^>]*d="[^"]{0,80}', konya)[:3]:
    print(f"  {path[:180]}")
print("\nBITTI")
