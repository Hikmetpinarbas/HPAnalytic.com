import os, subprocess, json, re

KEY = os.environ.get("GEMINI_API_KEY")
REPO = os.path.expanduser("~/hpanalytic-repo")
KAYNAK = os.path.join(REPO, "ORCHESTRATION", "arastirma")
os.makedirs(KAYNAK, exist_ok=True)

def sh(c, t=90, inp=None):
    try:
        r = subprocess.run(c, shell=True, input=inp, capture_output=True, text=True, timeout=t)
        return (r.stdout or '') + (('\nERR:'+(r.stderr or '')[:200]) if r.stderr else '')
    except subprocess.TimeoutExpired: return '[TIMEOUT]'
    except Exception as e: return f'[ERR {e}]'

def sec(t): print(f"\n{'='*55}\n {t}\n{'='*55}")

# === 1. USERLAND ERİŞİM TESTİ ===
sec("1. USERLAND ERİŞİM")
erisim = {}
for p in ["/home/userland", "/home/userland/HPAnalytic/ENGINE_V1",
          "/data/data/tech.ula/files/home", "/data/data/tech.ula/files/usr"]:
    ok = os.path.exists(p)
    erisim[p] = ok
    print(f"  {p}: {'OK' if ok else 'YOK'}")

# Termux'tan ENGINE_V1'e erişim yolları
eng_paths = [
    "/home/userland/HPAnalytic/ENGINE_V1/runs",
    "/data/data/tech.ula/files/home/HPAnalytic/ENGINE_V1/runs",
]
eng_dir = None
for p in eng_paths:
    if os.path.exists(p):
        eng_dir = p; break
print(f"\nENGINE_V1 erişilebilir mi: {eng_dir or 'HAYIR'}")

# === 2. JULES (web araştırma) ===
sec("2. JULES WEB ARAŞTIRMA")
# jules komutu Termux'ta yok ama Userland'de var. proot ile çağırmayı dene.
jules_cmd = "proot-distro login ubuntu -- bash -c 'jules --help 2>&1 | head -5'" if sh("which proot-distro 2>/dev/null").strip() else None

if jules_cmd:
    print("proot-distro ubuntu denemesi:")
    print(sh(jules_cmd, t=30)[:500])
else:
    print("proot-distro YOK — jules erişimi Termux'tan mümkün değil")

# === 3. GEMINI + GOOGLE SEARCH TOOL (API üzerinden web arama) ===
sec("3. GEMINI API — WEB SEARCH TOOL")
def gem_search(sorgu, t=90):
    """Gemini 2.0+ google_search_retrieval tool'u ile web arama."""
    body = json.dumps({
        "contents":[{"parts":[{"text":sorgu}]}],
        "tools":[{"google_search_retrieval":{}}],
        "generationConfig":{"maxOutputTokens":4000,"temperature":0.4}
    })
    for model in ["gemini-2.5-flash","gemini-3-flash-preview","gemini-flash-latest"]:
        cmd = f'curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={KEY}" -H "Content-Type: application/json" --data-binary @-'
        r = subprocess.run(cmd, shell=True, input=body, capture_output=True, text=True, timeout=t)
        try:
            j = json.loads(r.stdout)
            if 'candidates' in j:
                return model, j['candidates'][0]['content']['parts'][0]['text']
        except: continue
    return None, f"[HATA] {r.stdout[:200]}"

# 2002 Dünya Kupası araştırma
print("\n--- 2002 Dünya Kupası ---")
model, r = gem_search(
    "2002 FIFA World Cup Turkey national team tactical analysis. "
    "Why did Turkey finish 3rd? Key statistics, goalscorers, xG data if available, "
    "squad details (Rüştü, Alpay, Tugay, Hakan Şükür, İlhan Mansız). "
    "Cite academic sources and detailed match reports. Answer in Turkish."
)
print(f"Model: {model}")
print(r[:1200])
if not r.startswith("[HATA"):
    with open(os.path.join(KAYNAK, "2002-arastirma.md"), 'w', encoding='utf-8') as f:
        f.write(r)
    print(f"\n✓ Kaydedildi: ORCHESTRATION/arastirma/2002-arastirma.md")

# Matematik araştırma
print("\n--- Matematik (xG epistemolojisi) ---")
model, r = gem_search(
    "Football analytics xG model limitations, expected goals interpretation, "
    "why xG is not prediction. Academic references (StatsBomb, Opta, David Sumpter). "
    "Mathematics of football. Cite peer-reviewed papers and books. Answer in Turkish."
)
print(f"Model: {model}")
print(r[:1200])
if not r.startswith("[HATA"):
    with open(os.path.join(KAYNAK, "matematik-arastirma.md"), 'w', encoding='utf-8') as f:
        f.write(r)
    print(f"\n✓ Kaydedildi: ORCHESTRATION/arastirma/matematik-arastirma.md")

# === 4. ENGINE_V1'den MEVCUT ANALİZ VERİSİ ÇEK ===
sec("4. ENGINE_V1 VERİ (Userland → Termux)")
if eng_dir:
    hedef = os.path.join(REPO, "ORCHESTRATION", "engine_veri")
    os.makedirs(hedef, exist_ok=True)
    # Sadece xlsx_audit.json'lar (küçük, özet)
    for run in sorted(os.listdir(eng_dir))[:20]:
        rp = os.path.join(eng_dir, run)
        xa = os.path.join(rp, "xlsx_audit.json")
        if os.path.exists(xa) and os.path.isfile(xa):
            dst = os.path.join(hedef, f"{run}.xlsx_audit.json")
            try:
                import shutil; shutil.copy2(xa, dst)
                sz = os.path.getsize(dst)
                print(f"  ✓ {run} ({sz//1024}KB)")
            except Exception as e:
                print(f"  ✗ {run}: {e}")
    print(f"\nHedef: ORCHESTRATION/engine_veri/")
else:
    print("  ENGINE_V1 erişilemez, atlanıyor")

# === 5. ARŞİV / YOUTUBE TRANSKRİPT (varsa mevcut araç) ===
sec("5. MEVCUT ARAŞTIRMA ARAÇLARI")
for tool in ["yt-dlp", "youtube-dl", "whisper", "tesseract"]:
    w = sh(f"which {tool} 2>/dev/null").strip()
    print(f"  {tool}: {w or 'YOK'}")

print("\nBITTI")
