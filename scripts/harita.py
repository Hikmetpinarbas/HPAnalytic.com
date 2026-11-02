import os, re
P = os.path.expanduser("~/hpanalytic-repo/public/yazi/konya-gs-v2.html")
s = open(P, encoding='utf-8').read()
def ln(i): return s[:i].count('\n')+1

print("=== TÜM SVG'LER (sayfada kaç görsel var) ===")
for i, m in enumerate(re.finditer(r'<svg[^>]*>', s), 1):
    a = m.start()
    cls = re.search(r'class="([^"]*)"', m.group())
    pre = s[max(0,a-150):a].replace('\n',' ')
    # başlık veya aria
    h = re.search(r'<h[1-3][^>]*>([^<]{5,60})</h[1-3]>', pre)
    title = h.group(1).strip() if h else '(başlık yok)'
    print(f"  SVG#{i} satır {ln(a)}: class={cls.group(1) if cls else '?'} | önceki başlık: {title[:50]}")

print("\n=== 'shot' GEÇİŞLERİNİN HEPSİ (bağlam) ===")
for i, m in enumerate(re.finditer(r'shot', s), 1):
    if i > 21: break
    a=max(0,m.start()-40); b=min(len(s),m.start()+40)
    line = ln(m.start())
    print(f"  {i}. satır {line}: ...{s[a:b].replace(chr(10),' ')}...")

print("\n=== 'marker' GEÇİŞLERİ ===")
for m in re.finditer(r'marker', s):
    a=max(0,m.start()-50); b=min(len(s),m.start()+80)
    print(f"  satır {ln(m.start())}: ...{s[a:b].replace(chr(10),' ')}...")

print("\n=== SATIR 222 DATA YAPISI (ilk 400 char) ===")
lines = s.split('\n')
if len(lines) > 221:
    seg = lines[221]
    print(f"  uzunluk: {len(seg)} char")
    print(f"  ilk 400: {seg[:400]}")

print("\nBITTI")
