import os, re, shutil, datetime
P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
BAK = P + ".bak.20261102-030443"

# Mevcut bozuk hali de sakla (pişmanlık)
if os.path.exists(P):
    shutil.copy2(P, P + ".bozuk." + datetime.datetime.now().strftime("%H%M%S"))
    print(f"Bozuk hal yedeklendi")

# İyi yedeğe dön
shutil.copy2(BAK, P)
s = open(P, encoding='utf-8').read()
print(f"Geri dönüldü: {BAK.split('/')[-1]} -> {len(s)} char")

# player-g durumunu doğrula (dokunmuyoruz, sadece görüyoruz)
print("\n=== PLAYER-G DURUMU (dokunulmadı) ===")
m = re.search(r'\.player-g\{[^}]*\}', s)
if m: print(f"CSS: {m.group()[:200]}")
print("Örnek --dx:")
for i, mm in enumerate(re.finditer(r'--dx:(-?\d+\.?\d*);--dy:(-?\d+\.?\d*)', s), 1):
    if i > 3: break
    print(f"  --dx:{mm.group(1)} --dy:{mm.group(2)}")

# Örnek player-g içi rect
m = re.search(r'<g class="player-g"[^>]*>(<[^>]+>){1,2}', s)
if m: print(f"Örnek markup: {m.group()[:250]}")

# Konya flip'i yeniden uygula (030443'te flip yok)
print("\n=== KONYA FLIP ===")
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
print(f"✓ {n_flip} Konya noktası sola çevrildi")

open(P,'w',encoding='utf-8').write(s)
print(f"\n✓ Son: {len(s)} char")
print(f"\nCtrl+Shift+R ile yenile")
print("\nBana söyle:")
print("  1. Oyuncular (renkli kutular) sahada görünüyor mu?  var/yok")
print("  2. Şut haritası: Konya sol / GS sağ?  evet/hayır")
print("  3. Leão penaltı metni doğru mu?  evet/hayır")
print("  4. Trail komet gibi akıyor mu?  evet/hayır")
print("\nBITTI")
