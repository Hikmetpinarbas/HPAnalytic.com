import os, shutil, subprocess, datetime

REPO = os.path.expanduser("~/hpanalytic-repo")
YZ = os.path.join(REPO, "content", "yazilar")
YENI = os.path.join(REPO, "content", "_yeni_yazilar", "20261102-134504")

TASINIR = [
    "articles-valeriy-lobanovskyi-takimin-zekasini-tasarlamak.md",
    "filenin-sultanlari-anatomi-ve-mekanizma.md",
    "leicester-city-verinin-isyani.md",
    "portraits-vosse-de-boode.md",
    "super-lig-turk-futbolunun-veri-devrimi.md",
]

STAMP = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
BAK = os.path.join(YZ, f"_onay_bak_{STAMP}")

print("=== 1. YEDEK ===")
os.makedirs(BAK, exist_ok=True)
for f in TASINIR:
    src = os.path.join(YZ, f)
    if os.path.exists(src):
        shutil.copy2(src, os.path.join(BAK, f))
print(f"✓ {BAK}")

print("\n=== 2. TAŞINAN ===")
ok = 0
for f in TASINIR:
    src = os.path.join(YENI, f)
    dst = os.path.join(YZ, f)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print(f"  ✓ {f}")
        ok += 1
    else:
        print(f"  ✗ {f}: kaynak yok")

print(f"\nToplam: {ok}/{len(TASINIR)} taşındı")

print("\n=== 3. BEKLEYEN 4 YAZI ===")
BEKLEYEN = {
    "2002-dunya-kupasi-sans-mi-mekanizma-mi.md": "6 yeni sayı (uydurma riski)",
    "articles-matematik-yalan-soylemeyi-bilmez.md": "3 başlık kayboldu (Kaynak notu, International abstract)",
    "avrupa-sampiyonlar-liginde-taktiksel-evrim.md": "muhtemelen yanlış pozitif (sadece capital.)",
    "kadinlar-futbolun-anatomik-ve-taktiksel-evrimi.md": "muhtemelen yanlış pozitif (sadece capital.)",
}
for f, sebep in BEKLEYEN.items():
    print(f"  ? {f}")
    print(f"      {sebep}")

print("\n=== 4. GIT COMMIT (5 maç + 5 tarihsel) ===")
r = subprocess.run(
    f'cd ~/hpanalytic-repo && git add content/yazilar/*.md && '
    f'git commit -m "yazilar: 5 mac + 5 tarihsel makale yenilendi '
    f'(epistemik + tur bazli)" 2>&1 | tail -5',
    shell=True, capture_output=True, text=True
)
print(r.stdout)

print("\n=== 5. GIT LOG ===")
r = subprocess.run("cd ~/hpanalytic-repo && git log --oneline -6", shell=True, capture_output=True, text=True)
print(r.stdout)

print("\n=== 6. GIT DURUM ===")
r = subprocess.run("cd ~/hpanalytic-repo && git status --short content/", shell=True, capture_output=True, text=True)
print(r.stdout or "(temiz)")

print("\nBITTI")
