import os, shutil, subprocess, datetime

REPO = os.path.expanduser("~/hpanalytic-repo")
YZ = os.path.join(REPO, "content", "yazilar")
YENI = os.path.join(REPO, "content", "_yeni_yazilar", "20261102-134504")
STAMP = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")

KABUL = [
    "avrupa-sampiyonlar-liginde-taktiksel-evrim.md",
    "kadinlar-futbolun-anatomik-ve-taktiksel-evrimi.md",
]

print("=== 1. KABUL (yanlış-pozitif 2 yazı) ===")
BAK = os.path.join(YZ, f"_onay_bak_{STAMP}")
os.makedirs(BAK, exist_ok=True)
for f in KABUL:
    src_old = os.path.join(YZ, f)
    src_new = os.path.join(YENI, f)
    if os.path.exists(src_old) and os.path.exists(src_new):
        shutil.copy2(src_old, os.path.join(BAK, f))
        shutil.copy2(src_new, src_old)
        print(f"  ✓ {f}")

print("\n=== 2. BUILD (node build-yazi.mjs) ===")
bj = os.path.join(REPO, "scripts", "build-yazi.mjs")
if os.path.exists(bj):
    r = subprocess.run(["node", bj], cwd=REPO, capture_output=True, text=True, timeout=180)
    print((r.stdout or '')[-500:] or '(boş)')
    if r.stderr: print(f"stderr: {(r.stderr or '')[-300:]}")
else:
    print("✗ build-yazi.mjs yok")

print("\n=== 3. HTML SAYIM ===")
py = os.path.join(REPO, "public", "yazi")
if os.path.exists(py):
    htmls = [f for f in os.listdir(py) if f.endswith('.html')]
    print(f"  {len(htmls)} HTML")
    pairs = sorted([(f, os.path.getmtime(os.path.join(py, f))) for f in htmls], key=lambda x: -x[1])
    for f, _ in pairs[:6]:
        print(f"    {f}")

print("\n=== 4. COMMIT ===")
r = subprocess.run(
    f'cd ~/hpanalytic-repo && git add content/yazilar/*.md public/yazi/*.html && '
    f'git commit -m "yazilar: son 2 tarihsel + build cikisi (2002/matematik reddedildi)" 2>&1 | tail -4',
    shell=True, capture_output=True, text=True
)
print(r.stdout)
r = subprocess.run("cd ~/hpanalytic-repo && git log --oneline -2", shell=True, capture_output=True, text=True)
print(r.stdout)

print("\nYAZI TARAFI KAPANDI ✓")
print("BITTI")
