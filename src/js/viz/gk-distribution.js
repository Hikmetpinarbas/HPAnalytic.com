import * as d3 from 'd3';
import { gsap } from 'gsap';

const C = { text:'#F4F2EC', muted:'rgba(244,242,236,0.4)', neon:'#B4FF39', orange:'#FF6B35', line:'rgba(180,255,57,0.12)', pitch:'rgba(20,24,28,0.6)' };
const TYPE_COLOR = { short: C.neon, medium: '#E8D44D', long: C.orange };

export function initGKDistribution(root, opts={}) {
  if (!root) return;
  root.innerHTML = '';
  const shell = document.createElement('div');
  shell.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:24px;font-family:"JetBrains Mono",monospace;';
  root.appendChild(shell);

  fetch(opts.dataUrl || '/assets/data/gs-stuttgart/gk_distribution.json')
    .then(r => r.json())
    .then(data => {
      const gs = data['Galatasaray'];
      const st = data['VfB Stuttgart'];
      renderCard(shell, gs, 'home');
      renderCard(shell, st, 'away');
    })
    .catch(e => { console.error(e); root.innerHTML = '<p style="color:'+C.orange+'">Veri yüklenemedi</p>'; });
}

function renderCard(parent, gk, side) {
  if (!gk) return;
  const card = document.createElement('div');
  card.style.cssText = `background: rgba(14,18,22,0.4); border: 1px solid ${C.line}; border-radius: 4px; padding: 24px;`;
  const accent = side === 'home' ? C.orange : C.neon;
  card.innerHTML = `
    <div style="font-size:11px;letter-spacing:0.15em;color:${accent};text-transform:uppercase;margin-bottom:8px;">${gk.team}</div>
    <h3 style="margin:0 0 20px;font-family:'Newsreader',serif;font-weight:400;font-size:22px;color:${C.text};">${gk.player}</h3>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
      <div>
        <div class="gk-num" style="font-size:42px;color:${C.text};font-weight:500;line-height:1;">0</div>
        <div style="font-size:10px;color:${C.muted};letter-spacing:0.1em;margin-top:4px;">TOPLAM PAS</div>
      </div>
      <div>
        <div class="gk-num" style="font-size:42px;color:${accent};font-weight:500;line-height:1;">0%</div>
        <div style="font-size:10px;color:${C.muted};letter-spacing:0.1em;margin-top:4px;">İSABET</div>
      </div>
    </div>

    <svg class="gk-mini-pitch" viewBox="0 0 105 68" style="width:100%;height:auto;background:${C.pitch};border-radius:2px;margin-bottom:16px;"></svg>

    <div class="gk-breakdown" style="font-size:11px;color:${C.muted};letter-spacing:0.05em;display:flex;gap:16px;margin-bottom:16px;">
      <span><span style="display:inline-block;width:8px;height:8px;background:${C.neon};border-radius:50%;margin-right:6px;"></span>KISA: <strong style="color:${C.text};">${gk.landing_counts.short}</strong></span>
      <span><span style="display:inline-block;width:8px;height:8px;background:#E8D44D;border-radius:50%;margin-right:6px;"></span>ORTA: <strong style="color:${C.text};">${gk.landing_counts.medium}</strong></span>
      <span><span style="display:inline-block;width:8px;height:8px;background:${C.orange};border-radius:50%;margin-right:6px;"></span>UZUN: <strong style="color:${C.text};">${gk.landing_counts.long}</strong></span>
    </div>

    <div style="font-size:11px;color:${C.muted};line-height:1.6;padding-top:12px;border-top:1px dashed ${C.line};">
      Açık oyun: <strong style="color:${C.text}">${gk.open_play_passes}</strong> ·
      Uzun pas: <strong style="color:${C.text}">${gk.long_passes}</strong> ·
      El atışı: <strong style="color:${C.text}">${gk.throws}</strong> ·
      Sweeping: <strong style="color:${C.text}">${gk.sweeping}</strong>
    </div>

    <p class="gk-insight" style="margin:16px 0 0;font-family:'Newsreader',serif;font-style:italic;font-size:14px;color:${accent};line-height:1.5;"></p>
  `;
  parent.appendChild(card);

  // Animate numbers
  const nums = card.querySelectorAll('.gk-num');
  gsap.fromTo(nums[0], {textContent:0}, {textContent: gk.passes, duration:1.4, ease:'power2.out', snap:{textContent:1}});
  gsap.fromTo(nums[1], {textContent:0}, {textContent: gk.accuracy_pct, duration:1.4, ease:'power2.out', snap:{textContent:1}, onUpdate: function(){ nums[1].textContent = Math.round(parseFloat(nums[1].textContent)) + '%'; }});

  // Mini pitch
  const svg = d3.select(card.querySelector('.gk-mini-pitch'));
  svg.append('rect').attr('x',0).attr('y',0).attr('width',105).attr('height',68).attr('fill','none').attr('stroke',C.line).attr('stroke-width',0.3);
  svg.append('line').attr('x1',52.5).attr('y1',0).attr('x2',52.5).attr('y2',68).attr('stroke',C.line).attr('stroke-width',0.3);
  svg.append('circle').attr('cx',52.5).attr('cy',34).attr('r',9.15).attr('fill','none').attr('stroke',C.line).attr('stroke-width',0.3);
  // GS own half = left, Stuttgart own half = right
  const isHome = side === 'home';
  svg.append('rect')
    .attr('x', isHome ? 0 : 88.5)
    .attr('y', 13.84).attr('width', 16.5).attr('height', 40.32)
    .attr('fill','none').attr('stroke',C.line).attr('stroke-width',0.3);

  ['short','medium','long'].forEach(type => {
    (gk.landings[type]||[]).forEach((pt, i) => {
      svg.append('circle')
        .attr('cx', pt.x).attr('cy', pt.y).attr('r', 0.5)
        .attr('fill', TYPE_COLOR[type]).attr('opacity', 0)
        .attr('class', 'gk-dot')
        .transition().delay(0.4 + i * 0.008).duration(0.5).attr('opacity', 0.85);
    });
  });

  // Insight
  const insight = card.querySelector('.gk-insight');
  const text = insightFor(gk);
  insight.textContent = text;
  gsap.fromTo(insight, {opacity:0, y:8}, {opacity:1, y:0, duration:0.8, delay:1.5});
}

function insightFor(gk) {
  const longRatio = gk.long_passes / Math.max(gk.passes,1);
  if (longRatio > 0.6) return 'Riski seven, uzun oynayan kaleci. Dağıtımda direkt forvet arıyor.';
  if (gk.accuracy_pct >= 70) return 'Güvenli, oyun kuran kaleci. Kısa paslarla takımı ileri taşıyor.';
  if (gk.sweeping >= 2) return 'Modern libero kaleci. Ceza sahası dışına çıkıp topu oyuna sokuyor.';
  return 'Dengeli dağıtım. Kısa ve uzun pas arasında denge kuruyor.';
}
