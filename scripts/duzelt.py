import os, re, shutil, datetime
P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
bak = P + ".bak." + datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
shutil.copy2(P, bak)
print(f"Yedek: {os.path.basename(bak)}")

s = open(P, encoding='utf-8').read()
orig = len(s); n_rep = 0

# === 1. LEÃO METNI ===
eski = "Leão'nun golü 1,20 xG. Yani o pozisyon, ortalama bir oyuncunun atması gereken bir goldü."
yeni = "Leão'nun golü penaltıydı. Penaltı, xG modelinde ayrı değerlendirilir — açık oyunda kurulan bir fırsat değil, ceza sahasında kazanılmış bir haktır. Skor aynı; hikâye farklı."
if eski in s:
    s = s.replace(eski, yeni, 1); n_rep += 1
    print("✓ [1] Leão metni düzeltildi")
else:
    print("✗ [1] Leão metni BULUNAMADI")
    for v in ["1,20", "1.20"]:
        if v in s: print(f"    Varyant: {v}")

# === TANI 2: swingPlayer --dx/--dy JS ===
print("\n=== 2. swingPlayer --dx/--dy JS ===")
for k in ["--dx", "--dy", "setProperty", "style.setProperty"]:
    hits = [m.start() for m in re.finditer(re.escape(k), s)]
    print(f"  '{k}': {len(hits)} geçiş")
    for h in hits[:2]:
        a=max(0,h-50); b=min(len(s),h+70)
        print(f"    ...{s[a:b].replace(chr(10),' ')[:140]}...")

# === TANI 3: shot-map SVG transform ===
print("\n=== 3. shot-map SVG transform ===")
for m in list(re.finditer(r'shot-map|shots-?svg|pitch-svg', s))[:4]:
    a=max(0,m.start()-30); b=min(len(s),m.start()+220)
    print(f"    ...{s[a:b].replace(chr(10),' ')[:260]}...")
    print()

# === TANI 4: trail keyframe ===
print("=== 4. drawFwd keyframes ===")
for m in list(re.finditer(r'@keyframes drawFwd', s))[:1]:
    a=m.start(); b=min(len(s),a+400)
    print(f"    {s[a:b].replace(chr(10),' ')[:380]}...")

if n_rep:
    open(P,'w',encoding='utf-8').write(s)
    print(f"\n✓ Kaydedildi: {orig} -> {len(s)} char, {n_rep} replace")
else:
    print("\n(Değişiklik yok)")
print("\nBITTI")
