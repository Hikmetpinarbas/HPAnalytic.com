#!/usr/bin/env python3
import os, subprocess, json, shutil

def run(cmd, timeout=10):
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
        return (r.stdout or '').strip() or (r.stderr or '').strip()
    except subprocess.TimeoutExpired:
        return '[TIMEOUT]'
    except Exception as e:
        return f'[ERR {type(e).__name__}]'

def sec(t): print(f"\n{'='*48}\n {t}\n{'='*48}")

sec("1. SISTEM")
print("uname :", run("uname -a"))
print("PREFIX:", os.environ.get('PREFIX','?'))
print("HOME  :", os.environ.get('HOME','?'))
print("Arch  :", os.uname().machine)

sec("2. ARACLAR")
for c in ['pkg','pip','pip3','npm','git','curl','jq','sqlite3','cron','crond',
          'termux-job-scheduler','termux-notification','sshd','nginx']:
    p = shutil.which(c)
    print(f"  {c:25} {'OK '+p if p else 'YOK'}")

sec("3. LLM CLI (kritik)")
for c in ['claude','claude-code','gemini','ollama','aider','llm','openai','codex']:
    p = shutil.which(c)
    print(f"  {c:15} {'OK '+p if p else 'YOK'}")

sec("4. DILLER")
for c in ['python3 --version','pip --version','node --version','npm --version','git --version']:
    print(f"  {c:20} -> {run(c+' 2>&1')}")

sec("5. DIZINLER")
for d in ['~/hpanalytic-repo','~/hpanalytic-repo/scripts','~/hpanalytic-repo/public',
          '/sdcard/HPAnalytic','/sdcard/HPAnalytic/data/raw/sportsbase',
          '~/.termux','~/.termux/boot','~/storage']:
    p = os.path.expanduser(d); ok = os.path.exists(p)
    print(f"  {d:45} {'OK' if ok else 'YOK'}")
    if ok and os.path.isdir(p):
        try: print(f"     {sorted(os.listdir(p))[:12]}")
        except: pass

sec("6. CALISAN SERVISLER")
print(run("ps aux 2>/dev/null | grep -E 'node|python|nginx|cron|sshd' | grep -v grep | head -15") or '(yok)')

sec("7. CRON / ZAMANLAYICI")
print("crontab -l :", run("crontab -l 2>&1 | head -15"))
print("~/.termux/boot:", run("ls ~/.termux/boot/ 2>&1"))

sec("8. REPO DURUMU")
repo = os.path.expanduser('~/hpanalytic-repo')
if os.path.exists(repo):
    print("branch:", run(f"cd {repo} && git branch --show-current 2>&1"))
    print("status:", run(f"cd {repo} && git status --short 2>&1 | head -15"))
    print("last  :", run(f"cd {repo} && git log -1 --oneline 2>&1"))
    pj = f"{repo}/package.json"
    if os.path.exists(pj):
        try:
            j = json.load(open(pj))
            print("npm scripts:", list(j.get('scripts',{}).keys()))
            print("deps       :", list(j.get('dependencies',{}).keys()))
        except: print("package.json OKUNAMADI")
    sc = f"{repo}/scripts"
    if os.path.exists(sc):
        print(f"scripts/ ({len(os.listdir(sc))}):", sorted(os.listdir(sc))[:20])
else:
    print("repo YOK")

sec("9. API ANAHTARLARI (varlik kontrolu, deger basilmaz)")
for k in ['ANTHROPIC_API_KEY','OPENAI_API_KEY','GEMINI_API_KEY','GOOGLE_API_KEY',
          'GITHUB_TOKEN','GH_TOKEN','VERCEL_TOKEN','DEEPSEEK_API_KEY','SPORTSBASE_KEY']:
    v = os.environ.get(k)
    print(f"  {k:22} {'VAR ('+str(len(v))+' char)' if v else 'YOK'}")

sec("10. AG")
print("internet :", run("ping -c1 -W2 8.8.8.8 2>&1 | head -2"))
print("npm reg  :", run("curl -s -o /dev/null -w '%{http_code}' --max-time 5 https://registry.npmjs.org"))
print("github   :", run("curl -s -o /dev/null -w '%{http_code}' --max-time 5 https://github.com"))

sec("11. DISK")
print(run("df -h ~ /sdcard 2>&1 | head -5"))

print("\n[SON] Tarama bitti.")
