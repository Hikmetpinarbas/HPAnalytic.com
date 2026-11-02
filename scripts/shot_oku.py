import os, re
P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
s = open(P, encoding='utf-8').read()
def ln(i): return s[:i].count('\n')+1

# SVG#3 (şut haritası) içeriğini çıkar
m = re.search(r'<div class="shot-pitch"><svg[^>]*>', s)
if not m:
    print("shot-pitch bulunamadı"); raise SystemExit
start = m.end()
end = s.find('</svg>', start)
seg = s[start:end]
print(f"=== ŞUT HARİTASI SVG#3 (satır {ln(m.start())}, {len(seg)} char) ===")
print(seg[:2500])
print("...\n")

# Tüm circle/line/path/ellipse'lerin koordinatları
print("=== KOORDİNAT ÖZETİ ===")
circles = re.findall(r'<circle[^>]*cx="([^"]+)"[^>]*cy="([^"]+)"[^>]*r="([^"]+)"', seg)
print(f"circle ({len(circles)}):")
for x,y,r in circles[:12]:
    print(f"  cx={x} cy={y} r={r}")
lines = re.findall(r'<line[^>]*x1="([^"]+)"[^>]*y1="([^"]+)"[^>]*x2="([^"]+)"[^>]*y2="([^"]+)"', seg)
print(f"\nline ({len(lines)}):")
for x1,y1,x2,y2 in lines[:10]:
    print(f"  ({x1},{y1}) -> ({x2},{y2})")
paths = re.findall(r'<path[^>]*d="([^"]{0,80})', seg)
print(f"\npath ({len(paths)}):")
for p in paths[:6]: print(f"  d={p}")

# Şut işaretleri (grup/class)?
print("\n=== CLASS'LI ELEMENTLER ===")
for m2 in re.finditer(r'class="([^"]+)"', seg):
    print(f"  .{m2.group(1)}")

# Panel başlıkları (üstteki div)
print("\n=== shot-stage ÖNCESİ BAŞLIK/ETİKET ===")
pre = s[max(0,m.start()-800):m.start()]
print(pre[-500:].replace('\n',' '))

print("\nBITTI")
