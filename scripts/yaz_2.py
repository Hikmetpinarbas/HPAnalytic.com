import os, json, subprocess, re

KEY = os.environ.get("GEMINI_API_KEY")
MODEL = "gemini-3-flash-preview"
REPO = os.path.expanduser("~/hpanalytic-repo")
YZ = os.path.join(REPO, "content", "yazilar")
YENI = os.path.join(REPO, "content", "_yeni_yazilar_v3")
os.makedirs(YENI, exist_ok=True)

def gem(prompt, t=90):
    body = json.dumps({"contents":[{"parts":[{"text":prompt}]}],
                       "generationConfig":{"maxOutputTokens":8000,"temperature":0.6}})
    cmd = f'curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={KEY}" -H "Content-Type: application/json" --data-binary @-'
    r = subprocess.run(cmd, shell=True, input=body, capture_output=True, text=True, timeout=t)
    try:
        out = json.loads(r.stdout)['candidates'][0]['content']['parts'][0]['text']
        return re.sub(r'\n```\s*$','',re.sub(r'^```(?:markdown|yaml)?\s*\n','',out))
    except Exception as e:
        return f"[HATA: {e}] {r.stdout[:200]}"

# === YAZI 1: 2002 ===
with open(os.path.join(YZ, "2002-dunya-kupasi-sans-mi-mekanizma-mi.md"), encoding='utf-8') as f:
    eski_2002 = f.read()

p1 = f"""Aşağıdaki yazıyı HPAnalytic metodolojisiyle yeniden yaz.

## KRİTİK KURALLAR
1. **Uydurma sayı YASAK.** 2002 Dünya Kupası maçlarının istatistikleri elimizde YOK. Sadece tarihsel bilgi (yıl, takım, oyuncu isimleri) kullan.
2. **Orijinalin alt başlıklarını KORU.** ## seviyesindekileri aynen bırak, içeriğini geliştir.
3. **Her sayısal iddia için `_epistemic` etiketi:** DOĞRULANMIŞ (kaynak var), TAHMİN (yorum), TÜREV (hesaplama). Ama sayı uydurmayacağın için çoğu yerde etiket gerekmez — sadece yıl/skor gibi tarihsel gerçekler için kullan.
4. **Ton:** HPAnalytic — sakin, editoryal, mekanizma odaklı. Yasaklı: "muhteşem", "efsane", "inanılmaz", "harika".
5. **Uzunluk:** 4000-5500 karakter (orijinali koru).

## Orijinal yazı (TAM metin)
{eski_2002}

## Çıktı
Sadece YAML frontmatter + markdown. Kod bloğu işareti yok.
Frontmatter'da slug: 2002-dunya-kupasi-sans-mi-mekanizma-mi, type: articles, date, read, author: Hikmet Pınarbaş.
"""

print("=== [1/2] 2002 Dünya Kupası yazılıyor ===")
out1 = gem(p1)
if out1.startswith("[HATA"):
    print(out1[:300])
else:
    with open(os.path.join(YENI, "2002-dunya-kupasi-sans-mi-mekanizma-mi.md"), 'w', encoding='utf-8') as f:
        f.write(out1)
    print(f"✓ {len(out1)} char → _yeni_yazilar_v3/")

# === YAZI 2: Matematik ===
with open(os.path.join(YZ, "articles-matematik-yalan-soylemeyi-bilmez.md"), encoding='utf-8') as f:
    eski_mat = f.read()

p2 = f"""Aşağıdaki yazıyı HPAnalytic metodolojisiyle yeniden yaz.

## KRİTİK KURALLAR
1. **Bu 3 alt başlık MUTLAKA korunacak:**
   - `### Kaynak ve yöntem notu`
   - `### International abstract — Mathematics Does Not Know How to Lie`
   - `### Sahadan açıklayıcı kareler`
   İçeriklerini yeniden yaz ama başlık metnini değiştirme.
2. **Uydurma sayı YASAK.** Orijinaldeki sayıları koru, yenisini ekleme.
3. **Her sayısal iddiaya `_epistemic` etiketi.**
4. **Ton:** HPAnalytic. Yasaklı: "muhteşem", "efsane", "inanılmaz".
5. **Uzunluk:** 8000-9500 karakter (orijinali koru).

## Orijinal yazı (TAM metin)
{eski_mat}

## Çıktı
Sadece YAML + markdown. Frontmatter slug: articles-matematik-yalan-soylemeyi-bilmez, type: articles.
"""

print("\n=== [2/2] Matematik yazısı yazılıyor ===")
out2 = gem(p2)
if out2.startswith("[HATA"):
    print(out2[:300])
else:
    with open(os.path.join(YENI, "articles-matematik-yalan-soylemeyi-bilmez.md"), 'w', encoding='utf-8') as f:
        f.write(out2)
    print(f"✓ {len(out2)} char → _yeni_yazilar_v3/")

print("\nBITTI")
