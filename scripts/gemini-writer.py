#!/usr/bin/env python3
"""Gemini taslak üretici — güvenli mod:
 - _kuyruk.json yoksa hiçbir şey yapmaz
 - var olan .md dosyayı EZMEZ
 - git komutu ÇALIŞTIRMAZ
"""
import os, sys, json, subprocess, re
MODEL="gemini-3-flash-preview"
BASE="https://generativelanguage.googleapis.com/v1beta"
KEY=os.environ.get("GEMINI_API_KEY","")
REPO=os.path.expanduser("~/hpanalytic-repo")
YZ=os.path.join(REPO,"content","yazilar")
KQ=os.path.join(YZ,"_kuyruk.json")

def gem(prompt, tok=4000):
    body=json.dumps({"contents":[{"parts":[{"text":prompt}]}],
                     "generationConfig":{"maxOutputTokens":tok,"temperature":0.7}})
    cmd=f'curl -s -X POST "{BASE}/models/{MODEL}:generateContent?key={KEY}" -H "Content-Type: application/json" --data-binary @-'
    r=subprocess.run(cmd,shell=True,input=body,capture_output=True,text=True,timeout=90)
    try: return json.loads(r.stdout)['candidates'][0]['content']['parts'][0]['text']
    except Exception as e: return f"[HATA {e}] {r.stdout[:200]}"

def slugify(t):
    t=t.lower().replace('ı','i').replace('ğ','g').replace('ü','u').replace('ş','s').replace('ö','o').replace('ç','c')
    return re.sub(r'[^a-z0-9]+','-',t).strip('-')[:60]

def main():
    if not KEY: print("GEMINI_API_KEY yok"); return 1
    if not os.path.exists(KQ): print(f"Kuyruk yok: {KQ}"); return 0
    q=json.load(open(KQ,encoding='utf-8'))
    if not q: print("Kuyruk boş"); return 0
    print(f"Kuyruk: {len(q)} görev")
    for i,g in enumerate(q,1):
        title=g.get('title','?'); slug=g.get('slug') or slugify(title)
        dst=os.path.join(YZ,slug+".md")
        if os.path.exists(dst): print(f"  [{i}] ATLA (var): {slug}"); continue
        print(f"  [{i}] ÜRET: {title}")
        p=f"""HPAnalytic için Türkçe futbol analizi yazıyorsun.
Başlık: {title}
Tip: {g.get('type','articles')}
Brief: {g.get('brief','')}

Kurallar:
- 800-1200 kelime, somut, veri odaklı
- Uydurma rakam yok
- Türkçe, sade, jargon açıklanmış
- Cevabın SADECE şu formatta:
---
title: "{title}"
slug: {slug}
type: {g.get('type','articles')}
author: "Hikmet Pınarbaş"
excerpt: "tek cümle özet"
---

[markdown gövde]
"""
        out=gem(p)
        if out.startswith("[HATA"): print(f"      {out[:120]}"); continue
        open(dst,'w',encoding='utf-8').write(out)
        print(f"      -> {os.path.basename(dst)} ({len(out)} char)")
    return 0
if __name__=="__main__": sys.exit(main())
