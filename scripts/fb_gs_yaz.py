import os, json, subprocess, re

REPO = os.path.expanduser("~/hpanalytic-repo")
P_MD = os.path.join(REPO, "content/yazilar/mac-galatasaray-fenerbahce-2026-10-26.md")
P_JSON = os.path.join(REPO, "public/assets/data/gs-fb/match_package.json")
KEY = os.environ.get("GEMINI_API_KEY")
MODEL = "gemini-3-flash-preview"

if not KEY:
    print("API anahtarı yok"); exit(1)

print("=== 1. FB-GS VERİ ANALİZİ (match_package.json) ===")
if not os.path.exists(P_JSON):
    print(f"✗ JSON bulunamadı: {P_JSON}")
    exit(1)

with open(P_JSON, encoding='utf-8') as f:
    data = json.load(f)

# JSON'dan verileri çek (Şemaya göre)
try:
    summary = data.get('summary', {})
    passes = summary.get('passes', {})
    shots = summary.get('shots', {})
    xg = summary.get('xg', {})
    goals = summary.get('goals', {})
    
    print("  [BULUNAN VERİLER]")
    print(f"  Pas: {passes}")
    print(f"  Şut: {shots}")
    print(f"  xG: {xg}")
    print(f"  Goller: {goals}")
except Exception as e:
    print("Veri şeması okunamadı:", e)

# Gemini'ye verilecek doğrulanmış metin
VERIFIED_DATA = f"""
Sadece aşağıdaki DOĞRULANMIŞ verileri kullan, başka hiçbir sayı UYDURMA:
- Maç Sonucu: Galatasaray 2 - 1 Fenerbahçe
- Pas: {passes}
- Şut: {shots}
- xG: {xg}
- Goller: {goals}
"""

PROMPT = f"""HPAnalytic için üst düzey bir futbol analizi yazısı yazacaksın.
Başlık: "Galatasaray 2-1 Fenerbahçe: 20 Şut, 2 Gol — Kanıt ve Sınırları"
Tip: mac
Slug: mac-galatasaray-fenerbahce-2026-10-26

{VERIFIED_DATA}

Yazı Kuralları:
1. Kesinlikle yukarıdaki sayıların dışına çıkma.
2. Odak noktası: Galatasaray'ın 20 şuta ulaşmasına rağmen sadece 2 gol bulması. (xG verisi bunu destekliyor mu?)
3. Fenerbahçe'nin 1 golüne rağmen neden kaybettiğini verilerle açıkla.
4. Dili sade, veri odaklı ve editoryal olsun.

Cevabın SADECE şu formatta olmalı (Markdown):
---
title: "Galatasaray 2-1 Fenerbahçe: 20 Şut, 2 Gol — Kanıt ve Sınırları"
slug: mac-galatasaray-fenerbahce-2026-10-26
type: mac
author: "Hikmet Pınarbaş"
excerpt: "Galatasaray'ın yüksek şut hacmine rağmen gol verimliliğini ve Fenerbahçe'nin direncini verilerle inceliyoruz."
---

[Yazının gövdesi]
"""

print("\n=== 2. GEMINI İLE YENİDEN YAZIM ===")
body = json.dumps({"contents": [{"parts": [{"text": PROMPT}]}], "generationConfig": {"maxOutputTokens": 4000, "temperature": 0.6}})
cmd = f'curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={KEY}" -H "Content-Type: application/json" --data-binary @-'

r = subprocess.run(cmd, shell=True, input=body, capture_output=True, text=True, timeout=90)

try:
    out = json.loads(r.stdout)['candidates'][0]['content']['parts'][0]['text']
    out = re.sub(r'^```markdown\n', '', out)
    out = re.sub(r'\n```$', '', out)
    
    with open(P_MD, 'w', encoding='utf-8') as f:
        f.write(out)
    print("✓ Başarılı! Galatasaray-Fenerbahçe yazısı yeniden yazıldı.")
    print(f"Yeni boyut: {len(out)} char")
except Exception as e:
    print("✗ Hata:", e)
    print("Yanıt:", r.stdout[:300])
    
print("\nBITTI")
