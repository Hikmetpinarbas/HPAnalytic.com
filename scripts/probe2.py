import os, subprocess, json
def run(c,t=15):
    try:
        r=subprocess.run(c,shell=True,capture_output=True,text=True,timeout=t)
        return (r.stdout or r.stderr or '').strip()
    except Exception as e: return f'ERR:{e}'
def sec(t): print("\n=== "+t+" ===")

sec("1. OPENCODE KOPRU")
fp=os.path.expanduser('~/.config/opencode/service-android-termux.json')
if os.path.exists(fp):
    try: print(open(fp,encoding='utf-8',errors='replace').read()[:900])
    except Exception as e: print("okunamadi:",e)

sec("2. USERLAND YOLU")
for p in ['/sdcard/UserLAnd','/sdcard/userland','/storage/emulated/0/UserLAnd',
          '/sdcard/ula','/sdcard/Download/opencode','/sdcard/HP_WORKSPACE',
          '/sdcard/shared','/storage/emulated/0/opencode']:
    print(f"  {p}:", "OK" if os.path.exists(p) else "YOK")
print("  tasker scripts:", run("ls ~/.termux/tasker/ 2>&1"))

sec("3. GEMINI — gercek cevap")
body='{"contents":[{"parts":[{"text":"Tek kelimeyle: merhaba"}]}]}'
for m in ['gemini-flash-latest','gemini-2.5-flash','gemini-3-flash-preview']:
    cmd=f'curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key=$GEMINI_API_KEY" -H "Content-Type: application/json" -d \'{body}\''
    raw=run(cmd)
    try:
        j=json.loads(raw)
        if 'candidates' in j:
            txt=j['candidates'][0]['content']['parts'][0]['text']
            print(f"  {m:25} -> OK {txt[:50]!r}")
        else:
            print(f"  {m:25} -> ERR {j.get('error',{}).get('message','?')[:70]}")
    except: print(f"  {m:25} -> BOZUK {raw[:60]}")

sec("4. YAZI KUYRUGU FRONTMATTER")
p=os.path.expanduser('~/hpanalytic-repo/content/yazilar')
files=sorted([f for f in os.listdir(p) if f.endswith('.md')])
print(f"  toplam .md: {len(files)}")
for f in files[:2]:
    txt=open(os.path.join(p,f),encoding='utf-8',errors='replace').read()[:300]
    print(f"  --- {f} ---")
    print(txt)

sec("5. BUILD-YAZI.MJS")
fp=os.path.expanduser('~/hpanalytic-repo/scripts/build-yazi.mjs')
if os.path.exists(fp):
    lines=open(fp,encoding='utf-8',errors='replace').read().splitlines()
    print(f"  {len(lines)} satir")
    print("\n".join(lines[:18]))

sec("6. TASKER ICERIK")
td=os.path.expanduser('~/.termux/tasker')
for f in os.listdir(td):
    print(f"  --- {f} ---")
    print(open(os.path.join(td,f),encoding='utf-8',errors='replace').read()[:150])

print("\nBITTI")
