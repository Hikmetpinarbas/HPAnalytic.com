import os, re
P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
s = open(P, encoding='utf-8').read()
def ln(i): return s[:i].count('\n')+1

# Her iki panelin SVG'sini bul
print("=== PANEL SVG'LERİ ===")
for m in re.finditer(r'<svg[^>]*class="[^"]*pitch-svg[^"]*"[^>]*>', s):
    a=m.start(); tag=m.group()[:140]
    # bu SVG'nin kapanışına kadar tara
    end = s.find('</svg>', a)+6
    seg = s[a:end]
    # panel başlığı (üstteki div)
    prefix = s[max(0,a-300):a]
    lbl = 'GS' if 'GALATASARAY' in prefix else ('KON' if 'KONYASPOR' in prefix else '?')
    print(f"\n[{lbl}] satır {ln(a)}, uzunluk {end-a} char")
    print(f"  açılış: {tag}")
    # ilk 6 circle/ellipse/use
    hits = re.findall(r'<(?:circle|ellipse|use|path|g)[^>]{0,180}>', seg)[:8]
    for h in hits:
        if any(k in h for k in ['cx=','cy=','x=','y=','transform=','class=']):
            print(f"    {h[:170]}")

print("\nBITTI")
