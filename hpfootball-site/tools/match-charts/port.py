import re, sys
src_path, out_path, club, title, desc, date = sys.argv[1:7]
extra_tokens = sys.argv[7] if len(sys.argv) > 7 else ''
src = open(src_path).read()
css = src[src.index('<style>') + 7:src.index('</style>')]
body = src[src.index('</style>') + 8:]
script = body[body.index('<script>') + 8:body.index('</script>')]
markup = body[:body.index('<script>')]
markup = re.sub(r'<header class="bar">.*?</header>\s*', '', markup, flags=re.S)
markup = re.sub(r'<footer>.*?</footer>\s*', '', markup, flags=re.S)
markup = markup.replace('<main lang="tr">', '<div class="mp">').replace('</main>', '</div>')
css = re.sub(r':root\{.*?\n\}', '', css, count=1, flags=re.S)
css = re.sub(r'\*\{box-sizing:border-box\}\s*', '', css)
css = re.sub(r'body\{[^}]*\}\s*', '', css)
css = re.sub(r'body::before\{[^}]*\}\s*', '', css)
css = re.sub(r'/\* top bar \*/.*?/\* hero \*/', '/* hero */', css, flags=re.S)
css = re.sub(r'footer\{[^}]*\}\s*', '', css)
css = re.sub(r';?text-transform:uppercase', '', css)

def prefix(sel):
    parts = []
    for s in sel.split(','):
        s = s.strip()
        if not s:
            continue
        parts.append('.mp a' if s == 'a' else '.mp ' + s)
    return ','.join(parts)

res = ''; pos = 0; stack = []
for m in re.finditer(r'([^{}]+)\{|\}', css):
    res += css[pos:m.start()]
    if m.group(0) == '}':
        res += '}'
        if stack: stack.pop()
    else:
        sel = m.group(1); st = sel.strip()
        if st.startswith('@media') or st.startswith('@supports'):
            res += sel + '{'; stack.append('media')
        elif st.startswith('@keyframes'):
            res += sel + '{'; stack.append('kf')
        elif stack and stack[-1] == 'kf':
            res += sel + '{'; stack.append('kfr')
        else:
            lead = sel[:len(sel) - len(sel.lstrip())]
            res += lead + prefix(st) + '{'; stack.append('rule')
    pos = m.end()
res += css[pos:]
tokens = '''.mp{
  --night:var(--bg); --band:var(--bg-2); --raise:var(--panel); --line:var(--line); --line-2:var(--line-2);
  --chalk:var(--ink); --chalk-2:var(--ink-2); --mute:var(--muted);
  --fen:var(--amber); --fen-ink:var(--amber-ink); --sla:#EEF1F5; --sla-ink:#0B0D10; --sage:var(--amber);
  --f-display:var(--display); --f-body:var(--reading); --f-mono:var(--mono);
  ''' + extra_tokens + '''
  background:var(--night); color:var(--chalk); font:400 1.0625rem/1.6 var(--f-body);
}
'''
res = tokens + res + '''
.mp h2{font-weight:500;letter-spacing:-.005em;line-height:1.02}
.mp .versus{font-family:var(--display);letter-spacing:-.01em;font-weight:500}
.mp .versus .v{font-family:var(--ui)}
.mp .score,.mp .score .t{font-family:var(--ui)}
.mp .score .g,.mp .count .n,.mp .ticker-item b,.mp .meta b{font-family:var(--mono);font-weight:500}
.mp .lab{font-family:var(--mono);font-weight:500;font-size:14px}
.mp .gap-row .who{font-family:var(--ui);font-weight:600}
'''
assert '{' not in markup and '}' not in markup
page = f'''---
import BaseLayout from '../../layouts/BaseLayout.astro';
export const prerender = true;
---
<BaseLayout title="{title}" description="{desc}" ogType="article" publishedTime={{new Date('{date}T00:00:00Z')}} club="{club}">
{markup.strip()}
<script is:inline>
{script}
</script>
<style is:global>
{res}
</style>
</BaseLayout>
'''
open(out_path, 'w').write(page)
print(out_path, len(page))
