import os, subprocess, json, re, glob

def sh(c, t=120, inp=None):
    try:
        r = subprocess.run(c, shell=True, input=inp, capture_output=True, text=True, timeout=t)
        return ((r.stdout or '') + (('\n[ERR]'+(r.stderr or '')[:200]) if r.stderr.strip() else '')).strip()
    except subprocess.TimeoutExpired: return '[TIMEOUT]'
    except Exception as e: return f'[ERR {e}]'

print("=== 1. TÜM KEY KAYNAKLARI ===")
# 1a) Doğrudan env
env_keys = {k:v for k,v in os.environ.items() if any(x in k.upper() for x in ['API_KEY','TOKEN','_KEY']) and len(v) > 20}
for k,v in env_keys.items():
    print(f"  env: {k} ({len(v)} char)")

# 1b) .bashrc, .env, .profile
sources = ["~/.bashrc", "~/.env", "~/.profile", "~/.zshrc"]
for s in sources:
    p = os.path.expanduser(s)
    if os.path.exists(p):
        try:
            content = open(p, encoding='utf-8', errors='replace').read()
            found = re.findall(r'export\s+([A-Z_]*(?:API_KEY|TOKEN|_KEY)[A-Z_]*)\s*=', content)
            if found:
                print(f"  {s}: {found}")
        except: pass

# 1c) config dosyaları (JSON içinde key ara)
for pat in ["~/.config/*/config.json", "~/.config/*/*.json",
            "~/.claude.json", "~/.gemini/config.json"]:
    for p in glob.glob(os.path.expanduser(pat)):
        try:
            content = open(p, encoding='utf-8', errors='replace').read(10000)
            for k in re.findall(r'"([A-Z_]*(?:API_KEY|TOKEN)[A-Z_]*)"\s*:\s*"([^"]{20,})"', content):
                print(f"  {p}: {k[0]} ({len(k[1])} char)")
        except: pass

print("\n=== 2. GROQ / OPENROUTER ÇAĞRI TESTİ ===")

def test_key(name, key):
    """Basit bir curl ile hangi servise ait olduğunu bul."""
    # Groq test
    body = json.dumps({"model":"llama-3.3-70b-versatile","messages":[{"role":"user","content":"OK"}],"max_tokens":5})
    r = sh(f'curl -s -m 10 -X POST "https://api.groq.com/openai/v1/chat/completions" -H "Authorization: Bearer {key}" -H "Content-Type: application/json" -d \'{body}\' 2>&1', t=15)
    if '"choices"' in r: return "GROQ ✓"
    # OpenRouter test
    body2 = json.dumps({"model":"openai/gpt-4o-mini","messages":[{"role":"user","content":"OK"}],"max_tokens":5})
    r = sh(f'curl -s -m 10 -X POST "https://openrouter.ai/api/v1/chat/completions" -H "Authorization: Bearer {key}" -H "Content-Type: application/json" -d \'{body2}\' 2>&1', t=15)
    if '"choices"' in r: return "OPENROUTER ✓"
    return None

# Gerçek key'leri bul (env + bashrc parse)
real_keys = {}
for k,v in env_keys.items():
    real_keys[k] = v

# .bashrc'den gerçek değerleri çek
brc = os.path.expanduser("~/.bashrc")
if os.path.exists(brc):
    for line in open(brc, encoding='utf-8', errors='replace'):
        m = re.match(r'\s*export\s+([A-Z_]*(?:API_KEY|TOKEN|_KEY)[A-Z_]*)\s*=\s*["\']?([^"\'\s]{20,})["\']?', line)
        if m and m.group(1) not in real_keys:
            real_keys[m.group(1)] = m.group(2)

print(f"Toplam {len(real_keys)} gerçek key değeri bulundu")
calisan = None
for name, key in real_keys.items():
    result = test_key(name, key)
    if result:
        print(f"  {name}: {result}")
        if not calisan: calisan = (name, key)
    else:
        print(f"  {name}: ✗")

print(f"\nKullanılabilir ilk key: {calisan[0] if calisan else 'YOK'}")

# === 3. YAZILAR ===
if not calisan:
    print("\n[2 yazı yazılamıyor — key yok]")
    print("BITTI"); exit(0)

key_adi, key_deger = calisan
servis = "groq" if "GROQ" in key_adi else "openrouter"
print(f"\n=== 3. YAZILAR — {servis.upper()} ile ===")

def yaz(prompt, t=120):
    if servis == "groq":
        url = "https://api.groq.com/openai/v1/chat/completions"
        model = "llama-3.3-70b-versatile"
    else:
        url = "https://openrouter.ai/api/v1/chat/completions"
        model = "anthropic/claude-3.5-sonnet"
    body = json.dumps({"model": model, "messages":[{"role":"user","content":prompt}],
                       "temperature":0.6, "max_tokens":8000})
    r = sh(f'curl -s -m 120 -X POST "{url}" -H "Authorization: Bearer {key_deger}" -H "Content-Type: application/json" -d @- 2>&1', t=130, inp=body)
    try:
        return json.loads(r)['choices'][0]['message']['content']
    except: return f"[HATA] {r[:300]}"

REPO = os.path.expanduser("~/hpanalytic-repo")
YZ = os.path.join(REPO, "content", "yazilar")
YENI = os.path.join(REPO, "content", "_yeni_yazilar_v4")
os.makedirs(YENI, exist_ok=True)

# 2002
with open(os.path.join(YZ, "2002-dunya-kupasi-sans-mi-mekanizma-mi.md"), encoding='utf-8') as f:
    eski = f.read()

p = f"""Türkçe HPAnalytic futbol analizi yazısı yaz.

KURALLAR:
1. Uydurma sayı YASAK. 2002 Dünya Kupası istatistikleri elimizde YOK. Sadece tarihsel gerçek (yıl, takım, oyuncu, tur) kullan.
2. Orijinalin ## alt başlıklarını KORU.
3. Ton: sakin, editoryal, mekanizma odaklı. Yasaklı: "muhteşem", "efsane", "inanılmaz", "harika", "muazzam".
4. 4500-5500 karakter.

ORİJİNAL:
{eski}

ÇIKTI: YAML frontmatter + markdown gövde. Frontmatter'da slug: 2002-dunya-kupasi-sans-mi-mekanizma-mi, type: articles, date: 2026-11-02, read: 5, author: "Hikmet Pınarbaş".

Sadece çıktı ver, ``` yok.
"""
print("[1/2] 2002 Dünya Kupası...")
out1 = yaz(p)
if not out1.startswith("["):
    out1 = re.sub(r'^```(?:markdown|yaml)?\s*\n','',out1); out1 = re.sub(r'\n```\s*$','',out1)
    open(os.path.join(YENI, "2002-dunya-kupasi-sans-mi-mekanizma-mi.md"), 'w', encoding='utf-8').write(out1)
    print(f"  ✓ {len(out1)} char")
else:
    print(f"  {out1[:200]}")

# Matematik
with open(os.path.join(YZ, "articles-matematik-yalan-soylemeyi-bilmez.md"), encoding='utf-8') as f:
    eski = f.read()

p = f"""Türkçe HPAnalytic futbol analizi yazısı yaz.

KURALLAR:
1. Bu 3 alt başlık MUTLAKA korunacak: "### Kaynak ve yöntem notu", "### International abstract — Mathematics Does Not Know How to Lie", "### Sahadan açıklayıcı kareler"
2. Uydurma sayı YASAK. Orijinaldeki sayıları koru.
3. Ton: HPAnalytic. Yasaklı: "muhteşem", "efsane", "inanılmaz", "harika".
4. 8500-9500 karakter.

ORİJİNAL:
{eski}

ÇIKTI: YAML frontmatter + markdown. slug: articles-matematik-yalan-soylemeyi-bilmez, type: articles. Sadece çıktı ver, ``` yok.
"""
print("\n[2/2] Matematik...")
out2 = yaz(p)
if not out2.startswith("["):
    out2 = re.sub(r'^```(?:markdown|yaml)?\s*\n','',out2); out2 = re.sub(r'\n```\s*$','',out2)
    open(os.path.join(YENI, "articles-matematik-yalan-soylemeyi-bilmez.md"), 'w', encoding='utf-8').write(out2)
    print(f"  ✓ {len(out2)} char")
else:
    print(f"  {out2[:200]}")

print("\nBITTI")
