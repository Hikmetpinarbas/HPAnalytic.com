import * as d3 from 'd3';
import { gsap } from 'gsap';

const C = {
  text:'#F4F2EC', muted:'rgba(244,242,236,0.4)',
  neon:'#B4FF39', orange:'#FF6B35',
  line:'rgba(180,255,57,0.12)', pitch:'rgba(20,24,28,0.6)',
};
const PW = 105, PH = 68;

export function initTacticalMap(root, opts = {}) {
  if (!root) return;

  root.innerHTML = `
    <div style="font-family:'JetBrains Mono',monospace;">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;align-items:center;margin-bottom:16px;">
        <div style="display:flex;gap:4px;" class="tm-tabs">
          ${['Tüm Maç','1. Yarı','2. Yarı'].map((p,i) =>
            `<button data-phase="${p}" style="background:transparent;color:${i===0?C.neon:C.muted};border:1px solid ${i===0?'rgba(180,255,57,0.3)':'transparent'};padding:8px 14px;font:inherit;font-size:12px;cursor:pointer;">${p}</button>`
          ).join('')}
        </div>
        <div style="display:flex;gap:8px;">
          <select class="tm-team" style="background:transparent;color:${C.text};border:1px solid ${C.line};padding:8px 12px;font:inherit;font-size:12px;cursor:pointer;">
            <option value="Galatasaray" style="background:#111;">Galatasaray</option>
            <option value="VfB Stuttgart" style="background:#111;">VfB Stuttgart</option>
          </select>
        </div>
      </div>

      <div style="position:relative;">
        <svg class="tm-svg" viewBox="0 0 ${PW} ${PH}" style="width:100%;height:auto;display:block;background:${C.pitch};border:1px solid ${C.line};"></svg>
        <div class="tm-caption" style="min-height:32px;margin-top:12px;font-family:'Newsreader',serif;font-style:italic;font-size:14px;color:${C.muted};letter-spacing:0.01em;"></div>
      </div>

      <div style="display:flex;gap:20px;font-size:11px;color:${C.muted};margin-top:12px;">
        <span><i style="display:inline-block;width:14px;height:1.5px;background:${C.orange};margin-right:6px;"></i>Defansif ortalama</span>
        <span><i style="display:inline-block;width:14px;height:1.5px;background:${C.neon};margin-right:6px;"></i>Ofansif ortalama</span>
        <span style="margin-left:auto;font-style:italic;">Formasyon → Defansif → Ofansif</span>
      </div>
    </div>
  `;

  const svg = d3.select(root.querySelector('.tm-svg'));
  const caption = root.querySelector('.tm-caption');
  const state = { team:'Galatasaray', phase:'Tüm Maç', data:null };

  function drawPitch() {
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('fill','none').attr('stroke',C.line).attr('stroke-width',0.15);
    g.append('rect').attr('x',1).attr('y',1).attr('width',PW-2).attr('height',PH-2);
    g.append('line').attr('x1',PW/2).attr('y1',1).attr('x2',PW/2).attr('y2',PH-1);
    g.append('circle').attr('cx',PW/2).attr('cy',PH/2).attr('r',9.15);
    g.append('rect').attr('x',1).attr('y',13.84).attr('width',16.5).attr('height',40.32);
    g.append('rect').attr('x',PW-17.5).attr('y',13.84).attr('width',16.5).attr('height',40.32);
    g.append('rect').attr('x',1).attr('y',24.84).attr('width',5.5).attr('height',18.32);
    g.append('rect').attr('x',PW-6.5).attr('y',24.84).attr('width',5.5).attr('height',18.32);
    g.append('rect').attr('x',0.3).attr('y',30.34).attr('width',0.7).attr('height',7.32);
    g.append('rect').attr('x',PW-1).attr('y',30.34).attr('width',0.7).attr('height',7.32);
  }

  function setCaption(text, kind) {
    caption.textContent = text || '';
    caption.style.color = kind === 'defensive' ? C.orange : kind === 'offensive' ? C.neon : C.muted;
    gsap.fromTo(caption, {opacity:0, y:6}, {opacity:1, y:0, duration:0.6});
  }

  function getPos(p, kind) {
    const ph = p.phases?.[state.phase];
    if (kind === 'formation') return p.formation;
    if (!ph) return null;
    return ph[kind];
  }

  function render() {
    svg.selectAll('g.tm-trails, g.tm-players').remove();
    const trailsG = svg.append('g').attr('class','tm-trails');
    const playersG = svg.append('g').attr('class','tm-players');

    const team = state.data[state.team];
    if (!team || !team.players.length) {
      setCaption('Bu takım için veri yok');
      return;
    }

    const accent = state.team === 'Galatasaray' ? C.orange : C.neon;

    team.players.forEach((p, idx) => {
      const fromPos = p.formation;
      const defPos = getPos(p, 'defensive') || fromPos;
      const offPos = getPos(p, 'offensive') || defPos;

      // Defansif iz
      const defLine = trailsG.append('line')
        .attr('x1', fromPos.x).attr('y1', fromPos.y)
        .attr('x2', defPos.x).attr('y2', defPos.y)
        .attr('stroke', C.orange).attr('stroke-width', 0.22)
        .attr('stroke-dasharray','0.8 0.6')
        .attr('opacity', 0);

      // Ofansif iz
      const offLine = trailsG.append('line')
        .attr('x1', defPos.x).attr('y1', defPos.y)
        .attr('x2', offPos.x).attr('y2', offPos.y)
        .attr('stroke', C.neon).attr('stroke-width', 0.22)
        .attr('stroke-dasharray','0.8 0.6')
        .attr('opacity', 0);

      // Oyuncu grubu
      const g = playersG.append('g');
      const dot = g.append('circle')
        .attr('cx', fromPos.x).attr('cy', fromPos.y)
        .attr('r', 0.9)
        .attr('fill', '#0A0C10')
        .attr('stroke', accent)
        .attr('stroke-width', 0.2)
        .style('cursor','pointer');

      g.append('text')
        .attr('x', fromPos.x).attr('y', fromPos.y + 2.8)
        .attr('text-anchor','middle')
        .attr('fill', C.muted).attr('font-size', 0.85)
        .attr('font-family','JetBrains Mono, monospace')
        .text(p.name.split(' ').pop());

      const nameText = g.select('text');

      // Hover
      dot.on('mouseenter touchstart', () => {
        const passes = p.phases?.[state.phase]?.passes ?? 0;
        setCaption(`${p.name} · ${p.role} · ${passes} pas`);
      });

      // ANİMASYON: cx/cy üzerinden (transform değil)
      const tl = gsap.timeline({ delay: 0.2 + idx * 0.05 });

      // A) Formasyon → defansif
      tl.to(dot.node(), { attr: { cx: defPos.x, cy: defPos.y }, duration: 1.2, ease:'power2.inOut' });
      tl.to(nameText.node(), { attr: { x: defPos.x, y: defPos.y + 2.8 }, duration: 1.2, ease:'power2.inOut' }, '<');
      tl.to(defLine.node(), { opacity: 1, duration: 0.2 }, '<');
      tl.to(defLine.node(), { opacity: 0, duration: 1.0 }, '+=0.3');

      // B) Defansif → ofansif
      tl.to(dot.node(), { attr: { cx: offPos.x, cy: offPos.y }, duration: 1.2, ease:'power2.inOut' }, '+=0.3');
      tl.to(nameText.node(), { attr: { x: offPos.x, y: offPos.y + 2.8 }, duration: 1.2, ease:'power2.inOut' }, '<');
      tl.to(offLine.node(), { opacity: 1, duration: 0.2 }, '<');
      tl.to(offLine.node(), { opacity: 0, duration: 1.0 }, '+=0.3');

      // Caption (sadece ilk oyuncu için)
      if (idx === 0) {
        tl.call(() => setCaption(`${team.team} defansif bloğa çekiliyor…`, 'defensive'), null, '+=0.2');
        tl.call(() => setCaption(`${team.team} ofansif pozisyonlara çıkıyor…`, 'offensive'), null, '+=0.4');
      }
    });
  }

  // Kontroller
  root.querySelectorAll('.tm-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('.tm-tabs button').forEach(b => {
        b.style.color = C.muted;
        b.style.borderColor = 'transparent';
      });
      btn.style.color = C.neon;
      btn.style.borderColor = 'rgba(180,255,57,0.3)';
      state.phase = btn.dataset.phase;
      render();
    });
  });
  root.querySelector('.tm-team').addEventListener('change', e => {
    state.team = e.target.value;
    render();
  });

  // Veri yükle
  fetch(opts.dataUrl || '/assets/data/gs-stuttgart/match_data_phases.json')
    .then(r => r.json())
    .then(data => {
      state.data = data;
      drawPitch();
      render();
    })
    .catch(err => {
      console.error(err);
      setCaption('Veri yüklenemedi: ' + err.message);
    });
}
