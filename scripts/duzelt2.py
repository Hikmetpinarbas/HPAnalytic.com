import os, re, shutil, datetime
P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
bak = P + ".bak." + datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
shutil.copy2(P, bak)
s = open(P, encoding='utf-8').read()
orig = len(s); n = 0

print("=== KONTROL: .player-g CSS kaç kez? ===")
for m in re.finditer(r'\.player-g\s*\{', s):
    a=m.start(); b=min(len(s), a+150)
    print(f"  satır {s[:a].count(chr(10))+1}: {s[a:b][:140]}")

# === 1. TRAIL COMET ===
eski1 = ".pitch-svg .trail-fwd{stroke:#B4FF39;stroke-width:0.35;stroke-dasharray:200;fill:none;opacity:0;animation:drawFwd 12.5s linear infinite}"
yeni1 = ".pitch-svg .trail-fwd{stroke:#B4FF39;stroke-width:0.45;stroke-dasharray:8 200;stroke-linecap:round;fill:none;opacity:0;animation:drawFwd 12.5s linear infinite;filter:drop-shadow(0 0 1.2px #B4FF39)}"
if eski1 in s: s = s.replace(eski1, yeni1, 1); n += 1; print("✓ [1] trail-fwd comet")
else: print("✗ [1] trail-fwd bulunamadı")

eski2 = ".pitch-svg .trail-bck{stroke:#FF6B35;stroke-width:0.35;stroke-dasharray:200;fill:none;opacity:0;animation:drawBck 12.5s linear infinite}"
yeni2 = ".pitch-svg .trail-bck{stroke:#FF6B35;stroke-width:0.45;stroke-dasharray:8 200;stroke-linecap:round;fill:none;opacity:0;animation:drawBck 12.5s linear infinite;filter:drop-shadow(0 0 1.2px #FF6B35)}"
if eski2 in s: s = s.replace(eski2, yeni2, 1); n += 1; print("✓ [2] trail-bck comet")
else: print("✗ [2] trail-bck bulunamadı")

# === 2. ŞUT HARİTASI: panel + shot marker yapısı ===
print("\n=== ŞUT HARİTASI PANELLERİ ===")
for label in ['GALATASARAY','KONYASPOR']:
    for m in re.finditer(r'>'+label+r'<', s):
        a=m.start(); b=min(len(s), a+800)
        seg = s[a:b]
        # bu segmentte ilk 3 çember/daire
        circles = re.findall(r'<(?:circle|ellipse|use)[^>]{0,200}?(?:cx="[^"]*"|x="[^"]*")[^>]*>', seg)[:3]
        print(f"  {label} (satır {s[:a].count(chr(10))+1}):")
        for c in circles: print(f"    {c[:180]}")

if n:
    open(P,'w',encoding='utf-8').write(s)
    print(f"\n✓ Kaydedildi: {orig} -> {len(s)} char, {n} replace")
else:
    print("\n(Değişiklik yok)")

print("\nSORU: Sayfayı Ctrl+Shift+R ile yenile.")
print("  (a) Trail artık KOMET gibi mi akıyor? (tek nokta başı sonu geziyor)")
print("  (b) Oyuncu işaretleri SAĞA-SOLA SALLANIYOR mu? (gol tiyatrosu kısmında)")
print("\nBITTI")
