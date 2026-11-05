import os, subprocess, re, json

def sh(c, t=180, inp=None):
    try:
        r = subprocess.run(c, shell=True, input=inp, capture_output=True, text=True, timeout=t)
        return ((r.stdout or '') + (('\n[ERR]'+(r.stderr or '')[:300]) if r.stderr.strip() else '')).strip()
    except subprocess.TimeoutExpired: return '[TIMEOUT]'
    except Exception as e: return f'[ERR {e}]'

def sec(t): print(f"\n{'='*55}\n {t}\n{'='*55}")

# === 1. proot ortam kontrolü ===
sec("1. PROOT KONTROL")
r = sh("which proot-distro 2>&1")
print(f"proot-distro: {r}")
if 'not found' in r.lower() or not r.strip():
    print("✗ proot-distro Termux'ta YOK"); exit(0)

r = sh("proot-distro list 2>&1 | head -10")
print(f"distroalar:\n{r}")

# === 2. claude testi (proot + /sdcard köprü) ===
sec("2. CLAUDE ERİŞİM TESTİ")
with open("/sdcard/HPAnalytic/_c_in.txt", "w") as f:
    f.write("Sadece iki kelime yaz: 'claude calisiyor'")

# proot login + userland user + claude
# HOME=/home/userland, claude binary'si orada
cmd = (
    "proot-distro login ubuntu -- bash -lc '"
    "export HOME=/home/userland; "
    "cat /sdcard/HPAnalytic/_c_in.txt | "
    "/home/userland/.local/bin/claude -p' "
    "2>&1"
)
r = sh(cmd, t=60)
print(f"Çıktı: {r[:500]}")

# Test başarılı mı?
CLAUDE_OK = ('claude' in r.lower() or 'calisiyor' in r.lower() or 'hazır' in r.lower()) and 'not found' not in r.lower()

if not CLAUDE_OK:
    print("\n→ Alternatif: doğrudan binary path")
    cmd2 = (
        "proot-distro login ubuntu -- /home/userland/.local/bin/claude -p "
        "< /sdcard/HPAnalytic/_c_in.txt 2>&1"
    )
    r = sh(cmd2, t=60)
    print(f"Çıktı 2: {r[:500]}")
    CLAUDE_OK = 'not found' not in r.lower() and 'error' not in r.lower()[:100]

print(f"\nClaude: {'✓ EVET' if CLAUDE_OK else '✗ HAYIR'}")

if not CLAUDE_OK:
    print("\n[Claude erişilemedi. İkinci yol: userland'e git, oradan claude çağır]")
    print("BITTI"); exit(0)

# === 3. 2 yazı yazdır ===
sec("3. 2 YAZI")

REPO = os.path.expanduser("~/hpanalytic-repo")
YZ = os.path.join(REPO, "content", "yazilar")
YENI = os.path.join(REPO, "content", "_yeni_yazilar_v4")
os.makedirs(YENI, exist_ok=True)

def yaz_claude(prompt_text, slug, t=240):
    """Prompt'u /sdcard'a yaz, proot claude çağır, çıktıyı /sdcard'dan oku."""
    in_file = f"/sdcard/HPAnalytic/_p_{slug}.txt"
    out_file = f"/sdcard/HPAnalytic/_o_{slug}.md"

    with open(in_file, "w", encoding="utf-8") as f:
        f.write(prompt_text)

    cmd = (
        "proot-distro login ubuntu -- bash -lc "
        f"\"export HOME=/home/userland; cat {in_file} | "
        f"/home/userland/.local/bin/claude -p > {out_file} 2>&1\""
    )
    r = sh(cmd, t=t)

    if os.path.exists(out_file):
        out = open(out_file, encoding="utf-8", errors="replace").read()
        out = re.sub(r'^```(?:markdown|yaml)?\s*\n', '', out)
        out = re.sub(r'\n```\s*$', '', out)
        return out.strip()
    return f"[CLAUDE HATA] {r[:300]}"

# --- 2002 ---
sec("3a. 2002 Dünya Kupası")
with open(os.path.join(YZ, "2002-dunya-kupasi-sans-mi-mekanizma-mi.md"), encoding="utf-8") as f:
    eski2002 = f.read()

p1 = f"""Türkçe HPAnalytic futbol analizi yazısı yaz. HPAnalytic metodolojisi: sakin, editoryal, mekanizma odaklı.

KURALLAR:
1. Uydurma sayı YASAK. 2002 Dünya Kupası maç istatistikleri elimizde YOK. Sadece tarihsel gerçek (yıl, takım adı, oyuncu ismi, tur) kullan.
2. Orijinalin ## alt başlıklarını KORU.
3. Yasaklı ifadeler: "muhteşem", "efsane", "inanılmaz", "harika", "muazzam".
4. 4500-5500 karakter.
5. Frontmatter tam: title, slug, type, date, read, author, excerpt.

ORİJİNAL YAZI:
{eski2002}

ÇIKTI: Sadece YAML frontmatter + markdown gövde.
slug: 2002-dunya-kupasi-sans-mi-mekanizma-mi
type: articles
date: 2026-11-02
read: 5
author: "Hikmet Pınarbaş"

Kod bloğu (```) kullanma, açıklama ekleme. Sadece yazıyı ver.
"""

out1 = yaz_claude(p1, "2002")
if out1.startswith("[CLAUDE"):
    print(f"  ✗ {out1[:200]}")
else:
    with open(os.path.join(YENI, "2002-dunya-kupasi-sans-mi-mekanizma-mi.md"), "w", encoding="utf-8") as f:
        f.write(out1)
    print(f"  ✓ {len(out1)} char")

# --- Matematik ---
sec("3b. Matematik")
with open(os.path.join(YZ, "articles-matematik-yalan-soylemeyi-bilmez.md"), encoding="utf-8") as f:
    eskiMat = f.read()

p2 = f"""Türkçe HPAnalytic futbol analizi yazısı yaz.

KURALLAR:
1. Bu 3 alt başlık MUTLAKA korunacak:
   - ### Kaynak ve yöntem notu
   - ### International abstract — Mathematics Does Not Know How to Lie
   - ### Sahadan açıklayıcı kareler
2. Uydurma sayı YASAK. Orijinaldeki sayıları koru.
3. Yasaklı ifadeler: "muhteşem", "efsane", "inanılmaz", "harika".
4. 8500-9500 karakter.
5. Frontmatter tam: title, slug, type, date, read, author, excerpt.

ORİJİNAL YAZI:
{eskiMat}

ÇIKTI: Sadece YAML frontmatter + markdown.
slug: articles-matematik-yalan-soylemeyi-bilmez
type: articles

Kod bloğu yok, açıklama yok.
"""

out2 = yaz_claude(p2, "matematik")
if out2.startswith("[CLAUDE"):
    print(f"  ✗ {out2[:200]}")
else:
    with open(os.path.join(YENI, "articles-matematik-yalan-soylemeyi-bilmez.md"), "w", encoding="utf-8") as f:
        f.write(out2)
    print(f"  ✓ {len(out2)} char")

# === 4. Doğrulama ===
sec("4. DOĞRULAMA")
for f in ["2002-dunya-kupasi-sans-mi-mekanizma-mi.md", "articles-matematik-yalan-soylemeyi-bilmez.md"]:
    p_new = os.path.join(YENI, f)
    p_old = os.path.join(YZ, f)
    if not os.path.exists(p_new):
        print(f"  ✗ {f} üretilemedi"); continue
    new = open(p_new, encoding="utf-8").read()
    old = open(p_old, encoding="utf-8").read()

    # Frontmatter var mı
    fm_ok = new.startswith("---")

    # Yasaklı ifade kontrolü
    yasak = ["muhteşem", "efsane", "inanılmaz", "harika", "muazzam"]
    yasak_var = [y for y in yasak if y in new.lower()]

    # Uzunluk
    ratio = len(new) / len(old) * 100 if old else 0

    # Başlık sayısı
    import re as _re
    old_h = len(_re.findall(r'^##\s', old, _re.MULTILINE))
    new_h = len(_re.findall(r'^##\s', new, _re.MULTILINE))

    print(f"\n  {f}")
    print(f"    frontmatter: {'✓' if fm_ok else '✗'}")
    print(f"    uzunluk:     {len(old)} → {len(new)} ({ratio:.0f}%)")
    print(f"    ## sayısı:   {old_h} → {new_h}")
    print(f"    yasaklı:     {yasak_var if yasak_var else '✓ temiz'}")

print("\nBITTI")
