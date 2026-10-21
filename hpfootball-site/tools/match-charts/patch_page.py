"""Insert the four chart sections, data block, readability CSS and collapsible
sources into a ported match page. Usage: patch_page.py page.astro cfg.json"""
import json, re, sys
page, cfgp = sys.argv[1], sys.argv[2]
cfg = json.load(open(cfgp))
s = open(page).read()

def tabs(items, label):
    b = ''.join(f'<button type="button" data-k="{k}" aria-pressed="{"true" if i == 0 else "false"}">{t}</button>' for i, (k, t) in enumerate(items))
    return f'<div class="hpc-tabs" role="group" aria-label="{label}">{b}</div>'

def tag(cls, txt):
    return f'<span class="ev {cls}">{txt}</span>'

T = cfg['text']
sections = f'''
<section class="block hpc-sec" aria-labelledby="hpc-radar-t">
  <div class="wrap">
    <div class="head col">
      <p class="eyebrow">Turnuva radarı · 36 takım içinde yüzdelik</p>
      <h2 id="hpc-radar-t">{T['radar_h']}</h2>
      <p class="lede">{T['radar_lede']}</p>
    </div>
    <div class="hpc-duo" data-hpc="teamradar">
      <div>
        {tabs([('ab', 'İkisi birlikte'), ('a', cfg['names']['a']), ('b', cfg['names']['b'])], 'Radarda gösterilecek takım')}
        <div class="figure hpc-fig"><svg role="img" aria-label="{T['radar_alt']}"></svg></div>
        <p class="hpc-key"><span class="k-a"></span>{cfg['names']['a']} <span class="k-b"></span>{cfg['names']['b']} <span class="hpc-n">· dış çember 100. yüzdelik, kesikli halka medyan</span></p>
      </div>
      <div class="hpc-tablewrap"><table class="hpc-table"></table><p class="hpc-n">Hücredeki küçük sayı yüzdelik sırası. "Düşük iyi" eksenlerde ters çevrildi: radarda dışarısı her zaman lehine.</p></div>
    </div>
    <p class="claim">{tag('der', 'TÜRETİLMİŞ')}{T['radar_claim']}</p>
  </div>
</section>

<section class="block band hpc-sec" aria-labelledby="hpc-mom-t">
  <div class="wrap">
    <div class="head col">
      <p class="eyebrow">Maçın nabzı · son üçte birdeki topla oyun farkı</p>
      <h2 id="hpc-mom-t">{T['mom_h']}</h2>
      <p class="lede">{T['mom_lede']}</p>
    </div>
    <div data-hpc="momentum">
      {tabs([(k, v['label']) for k, v in cfg['momMeta'].items()], 'Maç seç')}
      <div class="figure hpc-fig"><svg role="img" aria-label="Maçın dakika dakika baskı grafiği"></svg></div>
      <p class="readout hpc-readout"></p>
    </div>
    <p class="claim">{tag('der', 'TÜRETİLMİŞ')}{T['mom_claim']}</p>
  </div>
</section>

<section class="block hpc-sec" aria-labelledby="hpc-net-t">
  <div class="wrap">
    <div class="head col">
      <p class="eyebrow">Top dolaşımı · son Avrupa maçı</p>
      <h2 id="hpc-net-t">{T['net_h']}</h2>
      <p class="lede">{T['net_lede']}</p>
    </div>
    <div data-hpc="network">
      {tabs([(k, v['label']) for k, v in cfg['netMeta'].items()], 'Takım seç')}
      <div class="figure hpc-fig hpc-pitch"><svg role="img" aria-label="Oyuncular arası tahmini top dolaşımı ağı"></svg></div>
      <p class="readout hpc-readout"></p>
    </div>
    <p class="claim">{tag('hyp', 'TAHMİNİ')}{T['net_claim']}</p>
  </div>
</section>

<section class="block band hpc-sec" aria-labelledby="hpc-pl-t">
  <div class="wrap">
    <div class="head col">
      <p class="eyebrow">Oyuncu profilleri · Şampiyonlar Ligi'nde aynı mevkiye göre</p>
      <h2 id="hpc-pl-t">{T['pl_h']}</h2>
      <p class="lede">{T['pl_lede']}</p>
    </div>
    <div class="hpc-duo hpc-pl" data-hpc="playerradar">
      <div class="hpc-pick">
        <p class="hpc-step">1 · Mevki</p><div class="hpc-groups hpc-chips" role="group" aria-label="Mevki seç"></div>
        <p class="hpc-step"><span class="k-a"></span>2 · {cfg['names']['a']}</p><div class="hpc-pa hpc-chips" role="group" aria-label="{cfg['names']['a']} oyuncusu seç"></div>
        <p class="hpc-step"><span class="k-b"></span>3 · {cfg['names']['b']}</p><div class="hpc-pb hpc-chips" role="group" aria-label="{cfg['names']['b']} oyuncusu seç"></div>
      </div>
      <div>
        <div class="figure hpc-fig"><svg role="img" aria-label="Seçili oyuncuların yüzdelik radarı"></svg></div>
        <p class="readout hpc-readout"></p>
      </div>
    </div>
    <p class="claim">{tag('mod', 'MODEL')}{T['pl_claim']}</p>
  </div>
</section>
'''

anchor = cfg['insert_after']  # an <h2> text whose section the new block follows
i = s.index(anchor)
j = s.index('</section>', i) + len('</section>')
s = s[:j] + '\n' + sections + s[j:]

# collapsible sources / red-team
s = re.sub(r'<div>\s*<h3>Kaynaklar</h3>\s*<ul>', lambda m: '<details class="hpc-det"><summary>Kaynaklar</summary><ul>', s, count=1)
s = re.sub(r'(<details class="hpc-det"><summary>Kaynaklar</summary><ul>.*?</ul>)\s*</div>', r'\1</details>', s, count=1, flags=re.S)
s = re.sub(r'<div>\s*<h3>Kaynak sınırı ve red-team</h3>\s*<ul>', '<details class="hpc-det"><summary>Yöntem notları ve sınırlar</summary><ul>', s, count=1)
s = re.sub(r'(<summary>Yöntem notları ve sınırlar</summary><ul>.*?</ul>)\s*</div>', r'\1</details>', s, count=1, flags=re.S)
s = re.sub(r'<div>\s*<h3>Belge künyesi</h3>\s*(<table class="meta-table">.*?</table>)\s*</div>', r'<details class="hpc-det"><summary>Belge künyesi</summary>\1</details>', s, count=1, flags=re.S)

data = {k: cfg[k] for k in ('colors', 'names', 'keys', 'momMeta', 'netMeta')}
data.update(json.load(open(cfg['ev'])))
data['team'] = json.load(open(cfg['team']))
pl = json.load(open(cfg['players']))
for p in pl['players']: p['team'] = 'a' if p['team'] == cfg['player_team_a'] else 'b'
pl['start'] = cfg.get('player_start')
data['players'] = pl
blob = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
if '<style is:global>' in s:
    s = s.replace('<style is:global>', '<script type="application/json" id="hpc-data" is:inline>' + blob + '</script>\n<script src="/js/hp-match-charts.js" defer is:inline></script>\n<style is:global>', 1)
    s = s.replace('</style>\n</BaseLayout>', cfg['css'] + '\n</style>\n</BaseLayout>', 1)
else:  # preview on built HTML
    s = s.replace('</body>', '<script type="application/json" id="hpc-data">' + blob + '</script><script src="/js/hp-match-charts.js" defer></script><style>' + cfg['css'] + '</style></body>', 1)
open(page, 'w').write(s)
print('ok', len(s))
