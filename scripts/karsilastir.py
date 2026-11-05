import os, re, glob, subprocess

REPO = os.path.expanduser("~/hpanalytic-repo")
YZ = os.path.join(REPO, "content", "yazilar")
YENI_BASE = os.path.join(REPO, "content", "_yeni_yazilar")

dirs = sorted(glob.glob(os.path.join(YENI_BASE, "*")))
if not dirs:
    print("✗ _yeni_yazilar altında alt klasör yok"); exit(1)
YENI = dirs[-1]
print(f"Yeni dizin: {os.path.basename(YENI)}\n")

def fm(text):
    if not text.startswith('---'): return {}
    end = text.find('\n---', 4)
    if end < 0: return {}
    block = text[4:end]
    out = {}
    for line in block.splitlines():
        if ':' in line:
            k, v = line.split(':', 1)
            out[k.strip()] = v.strip().strip('"\'')
    return out

def headers(text):
    return re.findall(r'^#{2,3}\s+(.+)$', text, re.MULTILINE)

def nums(text):
    body = text
    if text.startswith('---'):
        end = text.find('\n---', 4)
        if end > 0: body = text[end+4:]
    return set(re.findall(r'(?<![\w.])\d+(?:[.,]\d+)?', body))

def pct(old_len, new_len):
    if not old_len: return 0
    return round(100 * new_len / old_len, 1)

rows = []
yeni_files = [f for f in os.listdir(YENI) if f.endswith('.md')]

for fname in sorted(yeni_files):
    p_old = os.path.join(YZ, fname)
    p_new = os.path.join(YENI, fname)
    if not os.path.exists(p_old):
        print(f"! {fname}: orijinal YOK"); continue

    with open(p_old, encoding='utf-8') as fp: old = fp.read()
    with open(p_new, encoding='utf-8') as fp: new = fp.read()

    fm_o, fm_n = fm(old), fm(new)
    n_o, n_n = nums(old), nums(new)
    h_o, h_n = headers(old), headers(new)

    kayip = n_o - n_n
    yeni_n = n_n - n_o

    # Karar
    ratio = pct(len(old), len(new))
    if ratio < 50:
        karar = "TEKRAR (kısa)"
    elif len(yeni_n) > 3:
        karar = "TEKRAR (uydurma?)"
    elif len([h for h in h_o if h not in h_n]) > 2:
        karar = "TEKRAR (başlık kaybı)"
    else:
        karar = "TAŞINIR ✓"

    rows.append({
        "f": fname,
        "type_o": fm_o.get('type', '?'), "type_n": fm_n.get('type', '?'),
        "slug_o": fm_o.get('slug', ''), "slug_n": fm_n.get('slug', ''),
        "title_o": fm_o.get('title', '?')[:50], "title_n": fm_n.get('title', '?')[:50],
        "len_o": len(old), "len_n": len(new), "ratio": ratio,
        "h_o": len(h_o), "h_n": len(h_n),
        "n_o": len(n_o), "n_n": len(n_n),
        "kayip": sorted(kayip)[:8], "yeni_n": sorted(yeni_n)[:8],
        "h_kayip": [h for h in h_o if h not in h_n][:3],
        "h_ek": [h for h in h_n if h not in h_o][:3],
        "karar": karar,
    })

print(f"{'DOSYA':52} {'UZUNLUK':22} {'SAYI':10} {'BAŞLIK':8} KARAR")
print("=" * 130)
for r in rows:
    uz = f"{r['len_o']}→{r['len_n']} ({r['ratio']}%)"
    say = f"{r['n_o']}→{r['n_n']}"
    hh = f"{r['h_o']}→{r['h_n']}"
    print(f"{r['f']:52} {uz:22} {say:10} {hh:8} {r['karar']}")

print("\n" + "=" * 130)
print("DETAY\n")
for r in rows:
    print(f"\n>>> {r['f']}  [{r['karar']}]")
    print(f"    type:   {r['type_o']} → {r['type_n']}" + (" ✓" if r['type_o']==r['type_n'] else " ✗"))
    print(f"    slug:   {r['slug_o'] or '(yok)'} → {r['slug_n'] or '(yok)'}" + (" ✓" if r['slug_o']==r['slug_n'] else " ⚠"))
    print(f"    başlık: {r['title_o']} → {r['title_n']}")
    if r['kayip']:
        print(f"    ⚠ KAYBOLAN sayılar: {r['kayip']}")
    if r['yeni_n']:
        print(f"    ⚠ YENİ sayılar:     {r['yeni_n']}")
    if r['h_kayip']:
        print(f"    ⚠ KAYBOLAN başlıklar: {r['h_kayip']}")
    if r['h_ek']:
        print(f"    + EKLENEN başlıklar:  {r['h_ek']}")

tas = sum(1 for r in rows if "TAŞINIR" in r['karar'])
tek = sum(1 for r in rows if "TEKRAR" in r['karar'])
print("\n" + "=" * 130)
print(f"ÖZET: {tas} TAŞINIR, {tek} TEKRAR, toplam {len(rows)}")
print(f"Yeni dizin: {YENI}")

r = subprocess.run("cd ~/hpanalytic-repo && git status --short content/ | head -20", shell=True, capture_output=True, text=True)
print("\nGIT DURUMU (content/):")
print(r.stdout or "(temiz)")
print("\nBITTI")
