import os, subprocess, json

def run(c, t=10):
    try:
        r = subprocess.run(c, shell=True, capture_output=True, text=True, timeout=t)
        return (r.stdout or r.stderr or '').strip()
    except Exception as e:
        return f'ERR:{type(e).__name__}'

def which(c): return run(f"which {c} 2>/dev/null") or None

print("=== 1. BINARY TARAMA ===")
cands = ['gemini','claude','opencode','jules','antigravity','ollama',
         'aider','llm','codex','openai','deepseek','llama-cli','llama-cpp']
found = {}
for c in cands:
    w = which(c)
    if w:
        print(f"  ✓ {c:15} {w}")
        found[c] = w
    else:
        print(f"  ✗ {c:15}")

print("\n=== 2. OLLAMA ===")
if which('ollama'):
    print("  binary:", which('ollama'))
    print("  versiyon:", run("ollama --version 2>&1 | head -1"))
    print("  modeller:", run("ollama list 2>&1 | head -10"))
    print("  servis:", run("pgrep -a ollama 2>&1 | head -2") or '(çalışmıyor)')
else:
    print("  YOK")

print("\n=== 3. DEEPSEEK (llama.cpp) ===")
for base in ['~/local-ai', '~/local-ai/llama.cpp']:
    p = os.path.expanduser(base)
    print(f"  {base}:", "OK" if os.path.exists(p) else "YOK")
models = run("ls ~/local-ai/models/*.gguf 2>/dev/null")
print(f"  .gguf modeller:\n{models or '  (yok)'}")
lc = os.path.expanduser("~/local-ai/llama.cpp/build/bin/llama-cli")
print(f"  llama-cli: {'OK' if os.path.exists(lc) else 'YOK'}")

print("\n=== 4. OPENCODE ===")
cfg = os.path.expanduser("~/.config/opencode")
if os.path.exists(cfg):
    print("  config:", sorted(os.listdir(cfg)))
    svc = os.path.join(cfg, "service-android-termux.json")
    if os.path.exists(svc):
        print("  servis config VAR (port 4097)")
# Socket erişilebilir mi?
sock = run("curl -s -m 2 http://127.0.0.1:4097/health 2>&1 || echo YOK")
print(f"  127.0.0.1:4097 health: {sock[:80]}")
print(f"  pgrep opencode: {run('pgrep -a opencode 2>&1 | head -2') or 'YOK'}")

print("\n=== 5. CLAUDE / SERVER-COMMANDER ===")
cmd = os.path.expanduser("~/.claude-server-commander")
print(f"  ~/.claude-server-commander:", "OK" if os.path.exists(cmd) else "YOK")
if os.path.exists(cmd):
    print("  içerik:", sorted(os.listdir(cmd))[:8])
logs = os.path.expanduser("~/.claude-server-commander-logs")
if os.path.exists(logs):
    print("  son log:", run(f"ls -t {logs} 2>/dev/null | head -2"))

print("\n=== 6. JULES / ANTIGRAVITY (Userland köprüsü) ===")
print("  jules binary:", which('jules') or 'YOK')
print("  antigravity binary:", which('antigravity') or 'YOK')
# Userland ssh portu?
print("  sshd process:", run("pgrep -a sshd 2>&1 | head -2") or 'YOK')
print("  ~/.ssh/config:", run("cat ~/.ssh/config 2>/dev/null | head -5") or 'YOK')

print("\n=== 7. COPILOT ===")
cp = os.path.expanduser("~/.copilot")
print(f"  ~/.copilot:", "OK" if os.path.exists(cp) else "YOK")
if os.path.exists(cp): print("  içerik:", sorted(os.listdir(cp))[:8])

print("\n=== 8. GEMINI API KOTA KONTROL ===")
key = os.environ.get("GEMINI_API_KEY","")
if key:
    r = run(f'curl -s -m 5 "https://generativelanguage.googleapis.com/v1beta/models?key={key}" | head -c 200')
    print(f"  API: {'OK' if 'models/' in r else r[:100]}")
else:
    print("  API key yok")

print("\n=== 9. ÖZET ===")
print(f"  Bulunan binary: {list(found.keys()) or '(hiçbiri)'}")

print("\nBITTI")
