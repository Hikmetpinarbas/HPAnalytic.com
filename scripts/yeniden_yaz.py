import os, json, subprocess, re

P = os.path.expanduser("~/hpanalytic-repo/content/yazilar/mac-konyaspor-galatasaray-2026-10-30.md")
KEY = os.environ.get("GEMINI_API_KEY")
MODEL = "gemini-3-flash-preview"

if not KEY:
    print("API anahtarı yok"); exit(1)

# SENİN DOĞRULANMIŞ SAYILARIN
VERIFIED_DATA = """
Sadece aşağıdaki DOĞRULANMIŞ verileri kullan, başka hiçbir sayı UYDURMA:
- Maç Sonucu: Konyaspor 0 - 4 Galatasaray
- Goller: Osimhen (11'), Akgün (27'), Batrakov (54'), Leão (61' PENALTI)
- Şut: Galatasaray 14 | Konyaspor 8
- xG: Galatasaray 1.92 | Konyaspor 0.81
- Pas: Galatasaray 444 | Konyaspor 398
- Sprint: Galatasaray 1975m (987m ileri, 604m geri) | Konyaspor 1945m (414m ileri, 1094m geri)
"""

PROMPT = f"""HPAnalytic için üst düzey bir futbol analizi yazısı yazacaksın.
Başlık: "Konya 0-4 Galatasaray: Pres Değil, Geçiş Verimliliği"
Tip: mac
Slug: mac-konyaspor-galatasaray-2026-10-30

{VERIFIED_DATA}

Yazı Kuralları:
1. Kesinlikle yukarıdaki sayıların dışına çıkma. (Örn: "Topla oynama %60'tı" deme, çünkü veride yok).
2. Odak noktası: Konyaspor'un yüksek pres ve geri koşu (1094m defansif sprint) hacmine rağmen, Galatasaray'ın dikey geçişlerle (987m ileri sprint) ve yüksek xG kalitesiyle (1.92) nasıl ezdiğini anlat.
3. Leão'nun 61. dakikadaki penaltısını "kazanılmış bir hak" ve "oyunun kopma noktası" olarak vurgula.
4. Osimhen ve Akgün'ün bitiricilik verimliliğini öne çıkar.
5. Dili sade, veri odaklı ve editoryal olsun.

Cevabın SADECE şu formatta olmalı (Markdown):
---
title: "Konya 0-4 Galatasaray: Pres Değil, Geçiş Verimliliği"
slug: mac-konyaspor-galatasaray-2026-10-30
type: mac
author: "Hikmet Pınarbaş"
excerpt: "Konyaspor'un yoğun presine rağmen, Galatasaray'ın dikey geçişlerdeki ve bitiricilikteki üstünlüğünü verilerle analiz ediyoruz."
---

[Yazının gövdesi]
"""

print("Gemini'ye istek gönderiliyor...")
body = json.dumps({"contents": [{"parts": [{"text": PROMPT}]}], "generationConfig": {"maxOutputTokens": 4000, "temperature": 0.6}})
cmd = f'curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={KEY}" -H "Content-Type: application/json" --data-binary @-'

r = subprocess.run(cmd, shell=True, input=body, capture_output=True, text=True, timeout=90)

try:
    out = json.loads(r.stdout)['candidates'][0]['content']['parts'][0]['text']
    # Temizle (eğer gemini ```markdown ... ``` eklerse)
    out = re.sub(r'^```markdown\n', '', out)
    out = re.sub(r'\n```$', '', out)
    
    with open(P, 'w', encoding='utf-8') as f:
        f.write(out)
    print("✓ Başarılı! Konya-GS yazısı yeniden yazıldı ve doğrulanmış verilerle güncellendi.")
    print(f"Yeni boyut: {len(out)} char")
except Exception as e:
    print("✗ Hata:", e)
    print("Yanıt:", r.stdout[:300])
    
print("\nBITTI")
