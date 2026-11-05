import os, subprocess, json, re

# Key'leri bul
KEYS = {}
for k in ["GROQ_API_KEY", "OPENROUTER_API_KEY", "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "DEEPSEEK_API_KEY"]:
    v = os.environ.get(k)
    if v: KEYS[k] = v

print(f"Bulunan key'ler: {list(KEYS.keys())}")
print()

def groq(prompt, model="llama-3.3-70b-versatile", t=120):
    if "GROQ_API_KEY" not in KEYS: return "[GROQ KEY YOK]"
    body = json.dumps({
        "model": model,
        "messages": [{"role":"user","content":prompt}],
        "temperature": 0.6,
        "max_tokens": 8000
    })
    cmd = f'curl -s -X POST "https://api.groq.com/openai/v1/chat/completions" -H "Authorization: Bearer {KEYS["GROQ_API_KEY"]}" -H "Content-Type: application/json" --data-binary @-'
    r = subprocess.run(cmd, shell=True, input=body, capture_output=True, text=True, timeout=t)
    try:
        return json.loads(r.stdout)['choices'][0]['message']['content']
    except: return f"[HATA] {r.stdout[:300]}"

def openrouter(prompt, model="anthropic/claude-3.5-sonnet", t=120):
    if "OPENROUTER_API_KEY" not in KEYS: return "[OPENROUTER KEY YOK]"
    body = json.dumps({
        "model": model,
        "messages": [{"role":"user","content":prompt}],
        "temperature": 0.6,
        "max_tokens": 8000
    })
    cmd = f'curl -s -X POST "https://openrouter.ai/api/v1/chat/completions" -H "Authorization: Bearer {KEYS["OPENROUTER_API_KEY"]}" -H "Content-Type: application/json" --data-binary @-'
    r = subprocess.run(cmd, shell=True, input=body, capture_output=True, text=True, timeout=t)
    try:
        return json.loads(r.stdout)['choices'][0]['message']['content']
    except: return f"[HATA] {r.stdout[:300]}"

# Test
print("=== KANAL TEST ===")
print("Groq:", "test" if "GROQ_API_KEY" in KEYS else "key yok —" , groq("Sadece OK yaz", t=30)[:50] if "GROQ_API_KEY" in KEYS else "")
print("OpenRouter:", "test" if "OPENROUTER_API_KEY" in KEYS else "key yok —", openrouter("Sadece OK yaz", t=30)[:50] if "OPENROUTER_API_KEY" in KEYS else "")
print()

# === YAZI 1: 2002 ===
REPO = os.path.expanduser("~/hpanalytic-repo")
YZ = os.path.join(REPO, "content", "yazilar")
YENI = os.path.join(REPO, "content", "_yeni_yazilar_v4")
os.makedirs(YENI, exist_ok=True)

with open(os.path.join(YZ, "2002-dunya-kupasi-sans-mi-mekanizma-mi.md"), encoding='utf-8') as f:
    eski2002 = f.read()

p1 = f"""Türkçe bir futbol analizi yazısı yazacaksın. HPAnalytic metodolojisi.

## KRİTİK KURALLAR
1. **Uydurma sayı YASAK.** 2002 Dünya Kupası maç istatistikleri elimizde YOK. Sadece tarihsel gerçekler (yıl, takım adı, oyuncu ismi, gol dakikası) kullanılabilir.
2. Orijinalin ## alt başlıklarını KORU, içeriğini geliştir.
3. Ton: HPAnalytic — sakin, editoryal, mekanizma odaklı. Yasaklı: "muhteşem", "efsane", "inanılmaz", "harika", "muazzam".
4. Uzunluk: 4500-5500 karakter.

## Orijinal yazı
{eski2002}

## Çıktı formatı
Sadece YAML frontmatter + markdown gövde. Kod bloğu (```) YOK.
Frontmatter: title, slug: 2002-dunya-kupasi-sans-mi-mekanizma-mi, type: articles, date: 2026-11-02, read: 5, author: "Hikmet Pınarbaş", excerpt.
"""

print("=== [1/2] 2002 Dünya Kupası ===")
out1 = groq(p1) if "GROQ_API_KEY" in KEYS else openrouter(p1)
if out1.startswith("[HATA") or out1.startswith("[GROQ"):
    print("Groq fail, OpenRouter deneniyor...")
    out1 = openrouter(p1)
if not out1.startswith("["):
    out1 = re.sub(r'^```(?:markdown|yaml)?\s*\n','',out1)
    out1 = re.sub(r'\n```\s*$','',out1)
    with open(os.path.join(YENI, "2002-dunya-kupasi-sans-mi-mekanizma-mi.md"), 'w', encoding='utf-8') as f:
        f.write(out1)
    print(f"✓ {len(out1)} char → _yeni_yazilar_v4/")
else:
    print(out1[:300])

# === YAZI 2: Matematik ===
with open(os.path.join(YZ, "articles-matematik-yalan-soylemeyi-bilmez.md"), encoding='utf-8') as f:
    eskiMat = f.read()

p2 = f"""Türkçe bir futbol analizi yazısı yazacaksın. HPAnalytic metodolojisi.

## KRİTİK KURALLAR
1. Bu 3 alt başlık MUTLAKA korunacak (içerikleri yeniden yazılabilir):
   - `### Kaynak ve yöntem notu`
   - `### International abstract — Mathematics Does Not Know How to Lie`
   - `### Sahadan açıklayıcı kareler`
2. Uydurma sayı YASAK. Orijinaldeki sayıları koru, yenisini ekleme.
3. Ton: HPAnalytic. Yasaklı: "muhteşem", "efsane", "inanılmaz", "harika".
4. Uzunluk: 8500-9500 karakter.

## Orijinal yazı
{eskiMat}

## Çıktı formatı
Sadece YAML frontmatter + markdown. Kod bloğu YOK.
Frontmatter: title, slug: articles-matematik-yalan-soylemeyi-bilmez, type: articles, date, read, author.
"""

print("\n=== [2/2] Matematik ===")
out2 = groq(p2) if "GROQ_API_KEY" in KEYS else openrouter(p2)
if out2.startswith("[HATA") or out2.startswith("[GROQ"):
    print("Groq fail, OpenRouter deneniyor...")
    out2 = openrouter(p2)
if not out2.startswith("["):
    out2 = re.sub(r'^```(?:markdown|yaml)?\s*\n','',out2)
    out2 = re.sub(r'\n```\s*$','',out2)
    with open(os.path.join(YENI, "articles-matematik-yalan-soylemeyi-bilmez.md"), 'w', encoding='utf-8') as f:
        f.write(out2)
    print(f"✓ {len(out2)} char → _yeni_yazilar_v4/")
else:
    print(out2[:300])

print("\nBITTI")
