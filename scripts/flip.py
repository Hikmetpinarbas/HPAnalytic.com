import os, re, shutil, datetime
P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
shutil.copy2(P, P + ".bak." + datetime.datetime.now().strftime("%Y%m%d-%H%M%S"))
s = open(P, encoding='utf-8').read()
orig = len(s)

# SVG#3 (shot-pitch) içini al
m = re.search(r'<div class="shot-pitch"><svg[^>]*>', s)
start = m.end()
end = s.find('</svg>', start)
seg = s[start:end]
n_flip = 0

def flip_circle(mo):
    global n_flip
    tag = mo.group(0)
    # sadece Konya rengi (#E05A30 veya #FF6B35)
    if '#E05A30' not in tag and '#FF6B35' not in tag: return tag
    cx_m = re.search(r'cx="([\d.]+)"', tag)
    if not cx_m: return tag
    old_cx = float(cx_m.group(1))
    new_cx = 105.0 - old_cx
    new_tag = tag.replace(f'cx="{cx_m.group(1)}"', f'cx="{new_cx:.2f}"')
    n_flip += 1
    return new_tag

new_seg = re.sub(r'<circle[^>]*?/>', flip_circle, seg)
s = s[:start] + new_seg + s[end:]

open(P,'w',encoding='utf-8').write(s)
print(f"✓ {n_flip} Konya şut noktası sola çevrildi (cx -> 105-cx)")
print(f"✓ Dosya: {orig} -> {len(s)} char")

# Kontrol
print("\n=== KONTROL: yeni koordinatlar ===")
seg2 = s[s.find('<div class="shot-pitch"><svg')+len('<div class="shot-pitch"><svg'):]
seg2 = seg2[:seg2.find('</svg>')]
for mo in re.finditer(r'<circle[^>]*cx="([\d.]+)"[^>]*cy="([\d.]+)"[^>]*fill="([^"]+)"', seg2):
    cx, cy, fill = mo.group(1), mo.group(2), mo.group(3)
    if fill in ('#E05A30', '#FF6B35'): side = 'SOL' if float(cx) < 52.5 else 'SAĞ'
    elif fill in ('#7FE030', '#B4FF39'): side = 'SAĞ' if float(cx) > 52.5 else 'SOL'
    else: continue
    print(f"  cx={cx:>6} cy={cy:>5} fill={fill} -> {side}")

print("\nBITTI")
