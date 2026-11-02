import os, subprocess, json
def run(c):
    try:
        r=subprocess.run(c,shell=True,capture_output=True,text=True,timeout=15)
        return (r.stdout or r.stderr or '').strip()[:500]
    except Exception as e: return f'ERR:{e}'
def sec(t): print("\n=== "+t+" ===")

sec("1. HOME ENVANTER")
h=os.path.expanduser('~')
print("HOME listesi:", sorted(os.listdir(h))[:40])

sec("2. OPEncode? opencode? OpenCode?")
for c in ['opencode','opencode-cli','oc']:
    print(f"  {c}:", run(f"which {c} 2>&1"))
print("  ~/opencode:", "OK" if os.path.exists(h+"/opencode") else "YOK")
print("  ~/OPENCODE:", "OK" if os.path.exists(h+"/OPENCODE") else "YOK")
print("  config arama:", run("find ~ -maxdepth 2 -iname '*opencode*' -type d 2>/dev/null | head -5"))

sec("3. AUTOMATE (LlamaLab) / TASKER")
for p in ['/sdcard/Automate','/sdcard/Tasker','~/.termux/tasker','/data/data/com.llamalab.automate']:
    pp=os.path.expanduser(p)
    print(f"  {p}:", "OK" if os.path.exists(pp) else "YOK")
print("  tasker dizin:", run("ls ~/.termux/tasker/ 2>&1 | head -10"))

sec("4. CONNECTBOT / SSH")
print("  sshd:", run("pgrep -a sshd 2>&1 | head -3"))
print("  known_hosts:", run("wc -l ~/.ssh/known_hosts 2>&1"))
print("  authorized_keys:", run("ls -la ~/.ssh/authorized_keys 2>&1"))

sec("5. USERLAND")
print("  userland dizin:", "OK" if os.path.exists("/data/data/tech.ula") else "YOK")
print("  userland config:", run("ls /data/data/tech.ula/files 2>&1 | head -5"))

sec("6. YAZI KUYRUĞU")
for p in ['~/hpanalytic-repo/content/yazilar','~/hpanalytic-repo/content','~/hpanalytic-repo/queue','~/hpanalytic-repo/.queue']:
    pp=os.path.expanduser(p)
    if os.path.exists(pp):
        n=len(os.listdir(pp)) if os.path.isdir(pp) else 0
        print(f"  {p}: OK ({n} öğe)")
print("  kuyruk dosya:", run("find ~/hpanalytic-repo -maxdepth 3 -iname '*queue*' -o -iname '*kuyruk*' 2>/dev/null | head -5"))
print("  build-yazi.mjs var mı:", "OK" if os.path.exists(h+"/hpanalytic-repo/scripts/build-yazi.mjs") else "YOK")

sec("7. MOBİL UYGULAMALAR (Termux'tan erişilebilir)")
print("  pm list (paket):", run("pm list packages 2>&1 | wc -l"))
for app in ['com.llamalab.automate','com.termux','tech.ula','org.connectbot','com.termux.tasker','com.termux.api']:
    r=run(f"pm list packages {app} 2>&1")
    print(f"  {app}:", "OK" if app in r else "YOK")

sec("8. termux-api TAMAM MI?")
for c in ['termux-battery-status','termux-wifi-connectioninfo','termux-clipboard-get','termux-toast','termux-notification','termux-sms-list','termux-camera-photo','termux-sensor']:
    print(f"  {c:28}", "OK" if run(f"which {c}") else "YOK")

sec("9. KRON AKTİF İŞLER (yorum dışı)")
print(run("crontab -l 2>/dev/null | grep -v '^#' | grep -v '^$' | head -20") or "(yorum dışı satır yok)")

sec("10. GEMINI API TEST (kısa)")
r=run('curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$GEMINI_API_KEY" -H "Content-Type: application/json" -d \'{"contents":[{"parts":[{"text":"OK"}]}]}\'')
print("  yanıt:", r[:200] if "error" not in r.lower() else "HATA: "+r[:200])
print("\nBITTI")
