import re, collections
from pathlib import Path

ROOT = Path.home()
SRC  = ROOT / "hpanalytic" / "inventory-full.txt"
OUT  = ROOT / "hpanalytic" / "inventory-digest.md"

path_re = re.compile(r'(/[\w\-./ ()çğıöşüÇĞİÖŞÜ+@,]+)')
size_re = re.compile(r'\b(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)\b', re.I)
unit = {'B':1,'KB':1024,'MB':1024**2,'GB':1024**3}

rows = []
for line in SRC.read_text(errors='ignore').splitlines():
    m = path_re.search(line)
    if not m: continue
    p = m.group(1).rstrip(',;')
    sm = size_re.search(line)
    s = int(float(sm.group(1)) * unit[sm.group(2).upper()]) if sm else 0
    rows.append((p, s))

def human(n):
    for u in ('GB','MB','KB','B'):
        if n >= unit[u]: return f"{n/unit[u]:.1f}{u}"
    return "0B"

total_files, total_size = len(rows), sum(s for _, s in rows)
ext  = collections.Counter(Path(p).suffix.lower() or "(yok)" for p, _ in rows)
dirs = collections.Counter()
for p, s in rows:
    parts = Path(p).parts
    dirs["/".join(parts[:4]) if len(parts) >= 4 else "/".join(parts)] += s
by_size = sorted(rows, key=lambda r: -r[1])[:20]
empty   = [p for p, s in rows if s == 0]
names   = collections.Counter(Path(p).name for p, _ in rows)
dups    = [(n, c) for n, c in names.most_common(15) if c > 1]

L = [f"# Envanter Özeti — HpAnalytic\n",
     f"**Dosya:** {total_files:,}  ·  **Toplam:** {human(total_size)}\n",
     "\n## Uzantı (top 25)\n| Uzantı | Adet |\n|---|---:|"]
L += [f"| `{e}` | {c:,} |" for e, c in ext.most_common(25)]
L += ["\n## Dizin ağırlığı (top 20)\n| Dizin | Boyut |\n|---|---:|"]
L += [f"| `{d}` | {human(s)} |" for d, s in dirs.most_common(20)]
L += ["\n## En büyük 20\n| Boyut | Yol |\n|---:|---|"]
L += [f"| {human(s)} | `{p}` |" for p, s in by_size]
L += [f"\n## Boş dosya: {len(empty):,}\n",
      "\n## Aynı isim (top 15)\n| Ad | Adet |\n|---|---:|"]
L += [f"| `{n}` | {c} |" for n, c in dups]

OUT.write_text("\n".join(L))
print(f"OK → {OUT}")
print(f"{total_files:,} dosya · {human(total_size)} · {len(ext)} uzantı · {len(empty):,} boş")
