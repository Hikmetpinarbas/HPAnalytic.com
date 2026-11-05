import os, re, shutil, datetime
P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
BAK = P + ".bak.20261102-030443"

# Mevcut (bozuk) hali sakla
shutil.copy2(P, P + ".bozuk." + datetime.datetime.now().strftime("%H%M%S"))

# Temiz yedeğe dön
shutil.copy2(BAK, P)
s = open(P, encoding='utf-8').read()
print(f"✓ Geri dönüldü: 030443 ({len(s)} char)")

# SADECE şut haritasındaki Konya noktalarını sola çevir
m = re.search(r'<div class="shot-pitch"><svg[^>]*>', s)
start = m.end(); end = s.find('</svg>', start)
seg = s[start:end]; n_flip = 0
def flip(mo):
    global n_flip
    t = mo.group(0)
    if '#E05A30' not in t and '#FF6B35' not in t: return t
    cx = re.search(r'cx="([\d.]+)"', t)
    if not cx: return t
    n_flip += 1
    return t.replace(f'cx="{cx.group(1)}"', f'cx="{105.0-float(cx.group(1)):.2f}"')
new_seg = re.sub(r'<circle[^>]*?/>', flip, seg)
s = s[:start] + new_seg + s[end:]
print(f"✓ {n_flip} Konya şut noktası sola çevrildi")

open(P,'w',encoding='utf-8').write(s)
print(f"✓ Dosya: {len(s)} char")

# Durum doğrula (dokunmadığımızı kanıtla)
print("\n=== KONTROL ===")
m = re.search(r'\.player-g\{[^}]*\}', s)
if m: print(f"player-g CSS: {m.group()[:150]}")
cnt = len(re.findall(r'<g class="player-g"', s))
print(f"player-g sayısı: {cnt} (20 olmalı)")
tr = len(re.findall(r'<line class="trail-', s))
print(f"trail line sayısı: {tr}")
leo = "penaltı" in s and "Leão" in s
print(f"Leão penaltı metni: {'VAR' if leo else 'YOK'}")

print("\nCtrl+Shift+R ile yenile")
print("Oyuncular İLK HALİNE döndü mü? evet/hayır")
print("Şut haritasında Konya noktaları SOLDA mı? evet/hayır")
print("BITTI")
