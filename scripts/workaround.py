import os, subprocess, json

def sh(c, t=120, inp=None):
    try:
        r = subprocess.run(c, shell=True, input=inp, capture_output=True, text=True, timeout=t)
        return ((r.stdout or '') + (('\n[ERR]'+(r.stderr or '')[:300]) if r.stderr.strip() else '')).strip()
    except subprocess.TimeoutExpired: return '[TIMEOUT]'
    except Exception as e: return f'[ERR {e}]'
def sec(t): print(f"\n{'='*55}\n {t}\n{'='*55}")

ARA = os.path.expanduser("~/hpanalytic-repo/ORCHESTRATION/arastirma")
os.makedirs(ARA, exist_ok=True)

# === KANAL 1: GEMINI CLI (API kotasından bağımsız) ===
sec("KANAL 1: gemini CLI")
r = sh('echo "Sadece OK yaz" | gemini --skip-trust 2>&1 | head -5', t=60)
print(r[:400])

# === KANAL 2: USERLAND CLAUDE (proot-distro ile) ===
sec("KANAL 2: Userland claude (proot-distro)")
# proot-distro login hangi home veriyor?
r = sh("proot-distro login ubuntu -- bash -c 'echo HOME=$HOME; whoami; ls ~/.local/bin/ 2>/dev/null | head -5' 2>&1", t=30)
print("proot ortam testi:")
print(r[:500])

# === KANAL 3: DEEPSEEK LOCAL (kota yok) ===
sec("KANAL 3: DeepSeek 7B local")
ds_bin = os.path.expanduser("~/local-ai/llama.cpp/build/bin/llama-cli")
ds_model = os.path.expanduser("~/local-ai/models/DeepSeek-R1-Distill-Qwen-7B-Q4_K_M.gguf")
if os.path.exists(ds_bin) and os.path.exists(ds_model):
    print("DeepSeek hazır, 128 token test:")
    r = sh(f'{ds_bin} -m {ds_model} -c 512 -t 4 -n 32 -p "2002 Dünya Kupası Türkiye kaçıncı oldu? Kısaca." 2>&1 | tail -20', t=90)
    print(r[:600])
else:
    print("DeepSeek binary/model eksik")

# === KANAL 4: YT-DLP (YouTube transkript) ===
sec("KANAL 4: yt-dlp YouTube transkript")
# Test: kısa bir Türkçe futbol videosu (örnek)
test_url = "https://www.youtube.com/watch?v=ZKz0DRWKMmE"  # değiştirilebilir
print("yt-dlp sürüm:", sh("yt-dlp --version")[:50])
print("video info testi (metadata):")
r = sh(f'yt-dlp --skip-download --print "%(title)s|%(duration)s|%(channel)s" "{test_url}" 2>&1 | head -3', t=60)
print(r[:300])

# === /sdcard ORTAK KÖPRÜ ===
sec("/sdcard KÖPRÜ TESTİ (Termux ↔ Userland)")
test_file = "/sdcard/HPAnalytic/WORKAROUND_TEST.txt"
try:
    with open(test_file, 'w') as f:
        f.write("Termux → Userland köprü testi\nTimestamp: " + str(os.times()))
    print(f"✓ yazıldı: {test_file}")
    # Userland'den görünüyor mu?
    r = sh(f"proot-distro login ubuntu -- bash -c 'cat {test_file} 2>&1 | head -2' 2>&1", t=20)
    print(f"Userland görüyor mu: {r[:200]}")
except Exception as e:
    print(f"✗ {e}")

print("\nBITTI")
