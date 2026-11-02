import os, subprocess, json
def run(c):
    try:
        r=subprocess.run(c,shell=True,capture_output=True,text=True,timeout=15)
        return (r.stdout or r.stderr or '').strip()[:400]
    except Exception as e: return f'ERR:{e}'
def sec(t): print("\n=== "+t+" ===")

sec("1. GEMINI MODEL LISTESI")
r=run('curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY" | jq -r ".models[].name" | grep -i flash | head -10')
print(r)

sec("2. GEMINI TEST (3.8-flash)")
for m in ['gemini-3.8-flash','gemini-3.5-flash','gemini-3.0-flash']:
    body='{"contents":[{"parts":[{"text":"OK"}]}]}'
    r=run(f'curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key=$GEMINI_API_KEY" -H "Content-Type: application/json" -d \'{body}\'')
    status = "OK" if '"error"' not in r else r[:120]
    print(f"  {m:20} -> {status}")

sec("3. PM DOGRULAMA")
print("pm list (total):", run("pm list packages 2>&1 | wc -l"))
print("pm list (ilk 5):", run("pm list packages 2>&1 | head -5"))
print("pm path termux:", run("pm path com.termux 2>&1"))

sec("4. automate_bridge ICERIK")
p=os.path.expanduser('~/HP_WORKSPACE/automate_bridge')
if os.path.exists(p):
    print("dosyalar:", sorted(os.listdir(p))[:15])
    sh=p+"/safe_tick.sh"
    if os.path.exists(sh):
        print("\n--- safe_tick.sh (ilk 20 satır) ---")
        print("\n".join(open(sh).read().splitlines()[:20]))
else:
    print("YOK")

sec("5. opencode CONFIG")
p=os.path.expanduser('~/.config/opencode')
if os.path.exists(p):
    print("config:", sorted(os.listdir(p))[:10])
    for f in ['opencode.json','config.json','auth.json']:
        fp=os.path.join(p,f)
        if os.path.exists(fp):
            print(f"  {f}: var ({os.path.getsize(fp)} byte)")
else:
    print("YOK")

sec("6. TASKER SCRIPTS")
p=os.path.expanduser('~/.termux/tasker')
if os.path.exists(p):
    for f in sorted(os.listdir(p)):
        fp=os.path.join(p,f)
        print(f"  {f}: {os.path.getsize(fp)} byte")

sec("7. YAZI KUYRUGU (content/yazilar)")
p=os.path.expanduser('~/hpanalytic-repo/content/yazilar')
if os.path.exists(p):
    files=sorted([f for f in os.listdir(p) if not f.startswith('_')])
    print(f"  {len(files)} yazı")
    for f in files[-5:]: print(f"    {f}")

print("\nBITTI")
