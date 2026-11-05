import os, json, subprocess, re

REPO = os.path.expanduser("~/hpanalytic-repo")
KEY = os.environ.get("GEMINI_API_KEY")
MODEL = "gemini-3-flash-preview"

if not KEY:
    print("API anahtarı yok"); exit(1)

# İşlenecek maçlar listesi: (md_dosyası, json_klasörü, maç_ismi)
MACLAR = [
    ("mac-lille-galatasaray-2026-10-21.md", "lille-gs", "Lille - Galatasaray"),
    ("mac-besiktas-crystal-palace-2026-10-22.md", "besiktas-cp", "Beşiktaş - Crystal Palace"),
    ("mac-fenerbahce-slavia-prag-2026-10-20.md", "fb-slavia", "Fenerbahçe - Slavia Prag")
]

for md_name, json_dir, mac_ismi in MACLAR:
    print(f"\n========================================")
    print(f"İŞLENİYOR: {mac_ismi}")
    print(f"========================================")
    
    p_md = os.path.join(REPO, "content/yazilar", md_name)
    p_json = os.path.join(REPO, "public/assets/data", json_dir, "match_package.json")
    
    if not os.path.exists(p_md):
        print(f"✗ Markdown bulunamadı: {md_name}")
        continue

    # JSON'dan veri çekmeye çalış
    data_str = "Veri bulunamadı. Sadece maç sonucuna odaklan."
    if os.path.exists(p_json):
        try:
            with open(p_json, encoding='utf-8') as f:
                d = json.load(f)
            summary = d.get('summary', {})
            shots = summary.get('shots', {})
            passes = summary.get('passes', {})
            goals = summary.get('goals', {})
            xg = summary.get('xg', {})
            
            data_str = f"Pas: {passes}\nŞut: {shots}\nGol: {goals}"
            if xg and xg.get('by_team'): 
                data_str += f"\nxG: {xg}"
            print(f"  ✓ JSON verisi bulundu.")
        except Exception as e:
            print(f"  ! JSON okuma hatası: {e}")
    else:
        print(f"  ! JSON bulunamadı ({json_dir}).")

    PROMPT = f"""HPAnalytic için üst düzey bir futbol analizi yazısı yazacaksın.
Maç: {mac_ismi}
Slug: {md_name.replace('.md', '')}

DOĞRULANMIŞ VERİLER:
{data_str}

Kurallar:
1. Yukarıda veri varsa SADECE onları kullan. Yoksa uydurma sayılar yazma, sadece taktiksel/editoryal bir dille maçı anlat.
2. Başlık yaratıcı ve editoryal olsun.
3. Dili sade ve veri odaklı olsun.

Cevabın SADECE şu formatta olmalı (Markdown):
---
title: "[Yaratıcı Başlık]"
slug: {md_name.replace('.md', '')}
type: mac
author: "Hikmet Pınarbaş"
excerpt: "[Tek cümlelik özet]"
---

[Yazının gövdesi]
"""

    print(f"  Gemini'ye gönderiliyor...")
    body = json.dumps({"contents": [{"parts": [{"text": PROMPT}]}], "generationConfig": {"maxOutputTokens": 4000, "temperature": 0.6}})
    cmd = f'curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={KEY}" -H "Content-Type: application/json" --data-binary @-'

    r = subprocess.run(cmd, shell=True, input=body, capture_output=True, text=True, timeout=90)

    try:
        out = json.loads(r.stdout)['candidates'][0]['content']['parts'][0]['text']
        out = re.sub(r'^```markdown\n', '', out)
        out = re.sub(r'\n```$', '', out)
        
        with open(p_md, 'w', encoding='utf-8') as f:
            f.write(out)
        print(f"  ✓ Başarılı! ({len(out)} char)")
    except Exception as e:
        print(f"  ✗ Hata: {e}")
        print(f"  Yanıt: {r.stdout[:200]}")

print("\nTüm maç yazıları işlendi! BITTI")
