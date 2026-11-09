// v7 — pas animasyonu + partner bandı
import * as d3 from 'd3';

const C = { text:'#F4F2EC', muted:'rgba(244,242,236,0.4)', neon:'#B4FF39', orange:'#FF6B35', line:'rgba(180,255,57,0.12)', pitch:'rgba(20,24,28,0.5)' };
const PW = 105, PH = 68;
const flipY = y => PH - y;

export function initPassNetwork(root, opts = {}) {
  if (!root) return;
  root.innerHTML = '';
  const state = { team: 'Galatasaray', data: null, subsActive: false, selectedKey: null, animId: null };

  const wrap = document.createElement('div');
  wrap.style.cssText = 'font-family:"JetBrains Mono",monospace;';
  wrap.innerHTML = `
    <style>
      .pn-toggle { display:flex; justify-content:center; margin-bottom:16px; }
      .pn-toggle button { background:transparent; border:1px solid ${C.line}; color:${C.muted}; padding:10px 22px; font:inherit; font-size:12px; letter-spacing:0.08em; cursor:pointer; }
      .pn-toggle button:first-child { border-radius:2px 0 0 2px; border-right:none; }
      .pn-toggle button:last-child { border-radius:0 2px 2px 0; }
      .pn-toggle button.active[data-team="Galatasaray"] { color:${C.orange}; border-color:${C.orange}; }
      .pn-toggle button.active[data-team="VfB Stuttgart"] { color:${C.neon}; border-color:${C.neon}; }
      .pn-actions { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
      .pn-subs { background:rgba(255,107,53,0.15); color:${C.orange}; border:1px solid ${C.orange}; padding:9px 18px; font:inherit; font-size:11px; letter-spacing:0.12em; cursor:pointer; border-radius:2px; }
      .pn-subs.active { background:${C.orange}; color:#08090B; }
      .pn-count { font-size:11px; color:${C.muted}; }
      .pn-stage { position:relative; }

      .pn-hint { text-align:center; font-size:11px; color:${C.muted}; margin-top:8px; letter-spacing:0.05em; }
      .pn-hint strong { color:${C.text}; font-weight:500; }

      .pn-partners { margin-top:12px; min-height:60px; padding:12px 16px; background:rgba(20,24,28,0.6); border:1px solid ${C.line}; border-radius:4px; }
      .pn-partners h5 { margin:0 0 10px; font-size:10px; letter-spacing:0.15em; color:${C.neon}; text-transform:uppercase; font-weight:500; }
      .pn-partners .empty { font-family:'Newsreader',serif; font-style:italic; font-size:13px; color:${C.muted}; }
      .pn-partner-row { display:flex; align-items:center; gap:10px; padding:5px 0; font-size:12px; color:${C.text}; }
      .pn-partner-row .name { width:110px; }
      .pn-partner-row .bar { flex:1; height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden; }
      .pn-partner-row .bar > div { height:100%; background:${C.neon}; border-radius:2px; transition:width 0.5s; }
      .pn-partner-row .num { width:50px; text-align:right; color:${C.muted}; font-size:11px; }

      @keyframes pn-mq { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
      .pn-mq { overflow:hidden; white-space:nowrap; padding:10px 0; border-top:1px dashed ${C.line}; border-bottom:1px dashed ${C.line}; margin-top:12px; }
      .pn-mq > div { display:inline-block; animation:pn-mq 50s linear infinite; color:${C.muted}; font-family:'Newsreader',serif; font-style:italic; font-size:14px; }
      .pn-mq > div > span { padding:0 30px; }
    </style>
    <div class="pn-toggle">
      <button data-team="Galatasaray" class="active">GALATASARAY</button>
      <button data-team="VfB Stuttgart">STUTTGART</button>
    </div>
    <div class="pn-actions">
      <button class="pn-subs" type="button">DEĞİŞENLER</button>
      <span class="pn-count">0 oyuncu</span>
    </div>
    <div class="pn-stage">
      <svg class="pn-svg" viewBox="-8 -6 ${PW+16} ${PH+12}" style="width:100%;height:auto;background:${C.pitch};border:1px solid ${C.line};"></svg>
    </div>
    <div class="pn-hint">Bir oyuncuya <strong>tıkla</strong> → pas çizgileri canlanır, altta pas partnerleri açılır.</div>
    <div class="pn-partners"><div class="empty">Bir oyuncuya tıkla → en çok paslaştığı oyuncular listelenecek.</div></div>
    <div class="pn-mq"><div></div></div>
  `;
  root.appendChild(wrap);

  const svg = d3.select(wrap.querySelector('.pn-svg'));
  const partners = wrap.querySelector('.pn-partners');
  const mq = wrap.querySelector('.pn-mq > div');
  const subsBtn = wrap.querySelector('.pn-subs');
  const countEl = wrap.querySelector('.pn-count');
  const teamBtns = wrap.querySelectorAll('.pn-toggle button');

  function stopAnim() {
    if (state.animId) { cancelAnimationFrame(state.animId); state.animId = null; }
  }

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
    const defs = svg.insert('defs',':first-child');
    defs.append('marker').attr('id','pn-a-neon').attr('viewBox','0 0 10 10')
      .attr('refX',9).attr('refY',5).attr('markerWidth',4).attr('markerHeight',4).attr('orient','auto')
      .append('path').attr('d','M0,0 L10,5 L0,10 z').attr('fill',C.neon);
    defs.append('filter').attr('id','pn-glow').attr('x','-50%').attr('y','-50%').attr('width','200%').attr('height','200%')
      .html('<feGaussianBlur stdDeviation="0.6" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>');
    defs.append('marker').attr('id','pn-a-orange').attr('viewBox','0 0 10 10')
      .attr('refX',9).attr('refY',5).attr('markerWidth',4).attr('markerHeight',4).attr('orient','auto')
      .append('path').attr('d','M0,0 L10,5 L0,10 z').attr('fill',C.orange);
  }

  function drawArrows(team) {
    svg.selectAll('g.pn-arrows').remove();
    const g = svg.append('g').attr('class','pn-arrows');
    const gsOn = team === 'Galatasaray';
    g.append('line').attr('x1',PW-30).attr('y1',-3).attr('x2',PW-70).attr('y2',-3)
      .attr('stroke',C.neon).attr('stroke-width',!gsOn?0.35:0.12)
      .attr('opacity',!gsOn?1:0.3).attr('marker-end','url(#pn-a-neon)');
    g.append('text').attr('x',PW-50).attr('y',-5.3).attr('text-anchor','middle')
      .attr('fill',C.neon).attr('font-size',1.4).attr('opacity',!gsOn?1:0.3).text('← STUTTGART');
    g.append('line').attr('x1',30).attr('y1',PH+3).attr('x2',70).attr('y2',PH+3)
      .attr('stroke',C.orange).attr('stroke-width',gsOn?0.35:0.12)
      .attr('opacity',gsOn?1:0.3).attr('marker-end','url(#pn-a-orange)');
    g.append('text').attr('x',50).attr('y',PH+5.8).attr('text-anchor','middle')
      .attr('fill',C.orange).attr('font-size',1.4).attr('opacity',gsOn?1:0.3).text('GALATASARAY →');
  }

  function getVisible() {
    if (!state.data) return [];
    const all = Object.entries(state.data.nodes).filter(([k,v]) => v.team === state.team);
    if (!state.subsActive) return all.filter(([k,v]) => v.role === 'starter' || v.role === undefined || v.is_gk);
    return all.filter(([k,v]) => {
      if (v.is_gk) return true;
      if ((v.role === 'starter' || v.role === undefined) && !v.subbed_out_at) return true;
      if (v.role === 'sub' && v.came_on_at) return true;
      return false;
    });
  }


  function renderPartners(key) {
    if (!key) {
      partners.innerHTML = `<div class="empty">Bir oyuncuya tıkla → pas partnerleri açılacak.</div>`;
      return;
    }
    const node = state.data.nodes[key];
    const contrib = state.data.contributions?.[key];
    const zone = state.zones?.[key];
    const edges = state.data.edges.filter(e => e.from === key || e.to === key);

    // Outgoing (bu oyuncu → başka)
    const outgoing = edges.filter(e => e.from === key)
      .map(e => ({ key: e.to, weight: e.weight, name: state.data.nodes[e.to]?.name.split(' ').pop() || '?' }))
      .sort((a,b) => b.weight - a.weight);
    // Incoming (başka → bu oyuncu)
    const incoming = edges.filter(e => e.to === key)
      .map(e => ({ key: e.from, weight: e.weight, name: state.data.nodes[e.from]?.name.split(' ').pop() || '?' }))
      .sort((a,b) => b.weight - a.weight);

    const maxOut = outgoing[0]?.weight || 1;
    const maxIn = incoming[0]?.weight || 1;

    // Ofansif yaratım metrikleri
    const ob = contrib?.off_breakdown || {};
    const creationItems = [
      ['Key passes', 'Kilit pas'],
      ['Chances created', 'Şans yarattı'],
      ['xA (expected assists)', 'xA'],
      ['Passes into the penalty box', 'Ceza sahasına pas'],
      ['Progressive passes', 'İlerletici pas'],
      ['Assists', 'Asist'],
    ].filter(([k]) => ob[k]);
    const creationHtml = creationItems.length
      ? `<div style="margin-top:10px;padding-top:10px;border-top:1px dashed ${C.line};">
           <div style="font-size:10px;color:${C.muted};letter-spacing:0.1em;margin-bottom:6px;">YARATTIĞI</div>
           ${creationItems.map(([k, lbl]) => `<div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0;"><span style="color:${C.muted};">${lbl}</span><span style="color:${C.neon};font-weight:500;">${ob[k]}</span></div>`).join('')}
         </div>`
      : '';

    const zoneInfo = zone ? `<div style="font-size:10px;color:${C.muted};letter-spacing:0.05em;margin-bottom:8px;">${zone.total_passes} pas · alan ${(zone.max_x - zone.min_x).toFixed(0)}m × ${(zone.max_y - zone.min_y).toFixed(0)}m</div>` : '';

    let html = `<h5>${node.name}</h5>${zoneInfo}`;

    if (outgoing.length) {
      html += `<div style="font-size:10px;color:${C.neon};letter-spacing:0.1em;margin:6px 0 4px;">→ PAS VERDİĞİ</div>`;
      html += outgoing.slice(0, 4).map(o => `
        <div class="pn-partner-row" data-target="${o.key}">
          <span class="name" style="color:${C.neon};">${o.name}</span>
          <div class="bar"><div style="width:${(o.weight/maxOut)*100}%;background:${C.neon};"></div></div>
          <span class="num">${o.weight}</span>
        </div>
      `).join('');
    }
    if (incoming.length) {
      html += `<div style="font-size:10px;color:${C.orange};letter-spacing:0.1em;margin:10px 0 4px;">← PAS ALDIĞI</div>`;
      html += incoming.slice(0, 4).map(o => `
        <div class="pn-partner-row" data-target="${o.key}">
          <span class="name" style="color:${C.orange};">${o.name}</span>
          <div class="bar"><div style="width:${(o.weight/maxIn)*100}%;background:${C.orange};"></div></div>
          <span class="num">${o.weight}</span>
        </div>
      `).join('');
    }
    if (!outgoing.length && !incoming.length) {
      html += `<div class="empty">Pas bağlantısı kaydı yok.</div>`;
    }
    html += creationHtml;
    partners.innerHTML = html;

    // Satır tıklayınca o oyuncuya geç
    partners.querySelectorAll('.pn-partner-row').forEach(row => {
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        const target = row.getAttribute('data-target');
        if (target) state.selectedKey = target;
        render();
      });
    });
  }

  function animateFlows(key) {
    stopAnim();
    svg.selectAll('.pn-flow').remove();
    if (!key) return;

    // Her edge için akan bir top
    const flowData = [];
    svg.selectAll('.pn-edges path').each(function() {
      const f = this.getAttribute('data-from'), t = this.getAttribute('data-to');
      if (f === key || t === key) {
        const pathNode = this;
        const len = pathNode.getTotalLength();
        const dot = svg.append('circle')
          .attr('class','pn-flow')
          .attr('r', 0.6)
          .attr('fill', C.text)
          .attr('opacity', 0.95)
          .style('filter','drop-shadow(0 0 0.5px white)');
        flowData.push({ pathNode, len, dot: dot.node(), from: f, to: t });
      }
    });

    if (!flowData.length) return;

    const start = performance.now();
    const duration = 1800; // 1.8 sn bir döngü
    const totalSteps = flowData.length;

    function tick(now) {
      const elapsed = now - start;
      flowData.forEach((f, i) => {
        // Her edge'e ofsetli başlangıç (dalga efekti)
        const offset = (i / totalSteps) * duration * 0.5;
        const t = ((elapsed + offset) % duration) / duration;
        const pos = f.pathNode.getPointAtLength(t * f.len);
        d3.select(f.dot).attr('cx', pos.x).attr('cy', pos.y);
      });
      state.animId = requestAnimationFrame(tick);
    }
    state.animId = requestAnimationFrame(tick);
  }

  function render() {
    try {
      stopAnim();
      svg.selectAll('g.pn-edges, g.pn-nodes, .pn-flow').remove();
      const accent = state.team === 'Galatasaray' ? C.orange : C.neon;
      let visible = getVisible();
      if (!visible.length) { countEl.textContent = '0 oyuncu'; return; }

      visible = visible.map(([k, n]) => {
        let nx = n.x;
        // Eğer takım Stuttgart ise ve oyuncu kaleci ise, X koordinatını aynala (sağ kaleye geçir)
        if (state.team === 'VfB Stuttgart' && n.is_gk) nx = PW - n.x;
        return [k, { ...n, x: nx, y: flipY(n.y) }];
      });
      const keys = new Set(visible.map(([k]) => k));
      const edges = state.data.edges.filter(e => keys.has(e.from) && keys.has(e.to));

      countEl.textContent = `${visible.length} oyuncu`;
      drawArrows(state.team);

      const maxP = Math.max(...visible.map(([_,n]) => n.passes), 1);
      const maxW = Math.max(...edges.map(e => e.weight || 0), 1);

      // Force collide
      const forceNodes = visible.map(([k, n]) => ({ key: k, x: n.x, y: n.y, r: 1.5 + Math.sqrt(n.passes/maxP)*2.5 }));
      const sim = d3.forceSimulation(forceNodes)
        .force('collide', d3.forceCollide().radius(d => d.r + 1.0).strength(0.8).iterations(5))
        .force('x', d3.forceX(d => d.x).strength(0.1))
        .force('y', d3.forceY(d => d.y).strength(0.1))
        .stop();
      for (let k = 0; k < 100; k++) sim.tick();
      const newPos = Object.fromEntries(forceNodes.map(d => [d.key, { x: d.x, y: d.y }]));
      visible = visible.map(([k, n]) => [k, { ...n, x: newPos[k].x, y: newPos[k].y }]);
      const nodeMap = Object.fromEntries(visible);

      // Edges
      const eG = svg.append('g').attr('class','pn-edges');
      edges.forEach((e, i) => {
        const s = nodeMap[e.from], d = nodeMap[e.to];
        if (!s || !d) return;
        const mx = (s.x+d.x)/2, my = (s.y+d.y)/2;
        const dx = d.x-s.x, dy = d.y-s.y;
        const len = Math.sqrt(dx*dx+dy*dy)||1;
        const off = Math.min(len*0.12, 5);
        const cx = mx + (-dy/len)*off, cy = my + (dx/len)*off;
        // Seçili oyuncu varsa yön renklendir
        let strokeColor = accent;
        if (state.selectedKey) {
          if (e.from === state.selectedKey) strokeColor = C.neon;
          else if (e.to === state.selectedKey) strokeColor = C.orange;
        }
        const p = eG.append('path')
          .attr('d', `M ${s.x} ${s.y} Q ${cx} ${cy} ${d.x} ${d.y}`)
          .attr('fill','none').attr('stroke',strokeColor)
          .attr('stroke-width', 0.08 + ((e.weight||0)/maxW)*0.6)
          .attr('opacity', 0.15 + ((e.weight||0)/maxW)*0.55)
          .attr('data-from', e.from).attr('data-to', e.to)
          .attr('stroke-linecap','round');
        const n = p.node();
        const L = n.getTotalLength();
        n.style.strokeDasharray = L;
        n.style.strokeDashoffset = L;
        setTimeout(() => { n.style.transition = 'stroke-dashoffset 1.2s ease-out'; n.style.strokeDashoffset = 0; }, 100 + i*5);
      });

      // Nodes
      const nG = svg.append('g').attr('class','pn-nodes');
      const cx0 = visible.reduce((s,[_,n]) => s + n.x, 0) / visible.length;
      const cy0 = visible.reduce((s,[_,n]) => s + n.y, 0) / visible.length;

      visible.forEach(([key, node], i) => {
        const r = 1.5 + Math.sqrt(node.passes/maxP)*2.5;
        const isSelected = state.selectedKey === key;
        const g = nG.append('g').attr('class','pn-node').attr('data-key', key).style('cursor','pointer');

        // Seçim durumunda renk kodlaması
        let nodeFill = '#0A0C10', nodeStroke = accent, nodeStrokeW = 0.35, glowFilter = null;
        if (isSelected) {
          nodeFill = C.neon; nodeStroke = C.neon; nodeStrokeW = 0.6;
          glowFilter = 'url(#pn-glow)';
        } else if (state.selectedKey) {
          // Komşu mu? Pas verdiği mi, aldığı mı?
          const isTarget = state.data.edges.some(e => e.from === state.selectedKey && e.to === key);
          const isSource = state.data.edges.some(e => e.to === state.selectedKey && e.from === key);
          if (isTarget) { nodeStroke = C.neon; nodeStrokeW = 0.55; }       // bu oyuncu pas alıyor
          else if (isSource) { nodeStroke = C.orange; nodeStrokeW = 0.55; } // bu oyuncu pas veriyor
        }

        if (node.is_gk) {
          g.append('rect').attr('x', node.x - r*0.7).attr('y', node.y - r*0.7)
            .attr('width', r*1.4).attr('height', r*1.4)
            .attr('fill', nodeFill).attr('stroke', nodeStroke)
            .attr('stroke-width', nodeStrokeW).attr('stroke-dasharray','0.8 0.4')
            .attr('filter', glowFilter);
        } else {
          g.append('circle').attr('cx',node.x).attr('cy',node.y).attr('r',r)
            .attr('fill', nodeFill).attr('stroke', nodeStroke)
            .attr('stroke-width', nodeStrokeW)
            .attr('filter', glowFilter);
        }

        const ddx = node.x - cx0, ddy = node.y - cy0;
        const horiz = Math.abs(ddx) > Math.abs(ddy) * 1.2;
        let lx = node.x, ly, anchor;
        if (node.is_gk) {
          anchor = 'middle';
          lx = node.x;
          ly = node.y + r + 2.2; // Kaleci etiketi hep altina
        } else if (horiz) {
          anchor = ddx > 0 ? 'start' : 'end';
          lx = node.x + (ddx > 0 ? r + 0.4 : -r - 0.4);
          ly = node.y + 0.35;
        } else {
          anchor = 'middle';
          ly = ddy > 0 ? node.y + r + 1.4 : node.y - r - 0.7;
        }
        g.append('text').attr('x', lx).attr('y', ly)
          .attr('text-anchor', anchor).attr('fill', node.is_gk ? C.orange : C.text)
          .attr('font-size', 2.2).attr('font-family', 'JetBrains Mono')
          .attr('stroke', '#08090B').attr('stroke-width', 0.6)
          .attr('paint-order', 'stroke')
          .attr('font-weight', isSelected ? 600 : 400)
          .text(node.name.split(' ').pop());

        // Tıklama — kalıcı seçim
        g.on('click', (ev) => {
          ev.stopPropagation();
          if (state.selectedKey === key) {
            state.selectedKey = null;
            nG.selectAll('.pn-node').style('opacity', 1);
            eG.selectAll('path').style('opacity', null);
            stopAnim();
            svg.selectAll('.pn-flow').remove();
            renderPartners(null);
          } else {
            state.selectedKey = key;
            nG.selectAll('.pn-node').each(function() {
              this.style.opacity = this.getAttribute('data-key') === key ? 1 : 0.2;
            });
            eG.selectAll('path').each(function() {
              const inv = this.getAttribute('data-from') === key || this.getAttribute('data-to') === key;
              this.style.opacity = inv ? 0.95 : 0.04;
            });
            animateFlows(key);
            renderPartners(key);
          }
        });
      });

      // Boş alana tıklayınca seçimi temizle
      svg.on('click', () => {
        if (state.selectedKey) {
          state.selectedKey = null;
          nG.selectAll('.pn-node').style('opacity', 1);
          eG.selectAll('path').style('opacity', null);
          stopAnim();
          svg.selectAll('.pn-flow').remove();
          renderPartners(null);
        }
      });

      // Önceki seçim varsa restore et
      if (state.selectedKey) {
        nG.selectAll('.pn-node').each(function() {
          this.style.opacity = this.getAttribute('data-key') === state.selectedKey ? 1 : 0.2;
        });
        eG.selectAll('path').each(function() {
          const inv = this.getAttribute('data-from') === state.selectedKey || this.getAttribute('data-to') === state.selectedKey;
          this.style.opacity = inv ? 0.95 : 0.04;
        });
        animateFlows(state.selectedKey);
        renderPartners(state.selectedKey);
      }

      // Marquee: somut pas sayıları
      let txt;
      if (state.selectedKey) {
        // Oyuncu seçiliyse onun hikayesi
        const key = state.selectedKey;
        const node = state.data.nodes[key];
        const outE = edges.filter(e => e.from === key).sort((a,b) => b.weight - a.weight);
        const inE = edges.filter(e => e.to === key).sort((a,b) => b.weight - a.weight);
        const contrib = state.data.contributions?.[key];
        const ob = contrib?.off_breakdown || {};
        const created = Object.entries(ob).filter(([k,v]) => v > 0).map(([k,v]) => `${k}: ${v}`).join(' · ') || 'yaratım verisi yok';
        const outTxt = outE.slice(0,3).map(e => `${state.data.nodes[e.to]?.name.split(' ').pop()} (${e.weight})`).join(', ') || '—';
        const inTxt = inE.slice(0,3).map(e => `${state.data.nodes[e.from]?.name.split(' ').pop()} (${e.weight})`).join(', ') || '—';
        txt = `${node.name} · ${node.passes} pas   ✦   → En çok pas verdiği: ${outTxt}   ✦   ← En çok pas aldığı: ${inTxt}   ✦   YARATTIĞI: ${created}`;
      } else {
        const topEdges = edges.slice().sort((a,b) => (b.weight||0) - (a.weight||0)).slice(0, 5);
        const topText = topEdges.map(e => {
          const s = state.data.nodes[e.from]?.name.split(' ').pop();
          const d = state.data.nodes[e.to]?.name.split(' ').pop();
          return `${s} ↔ ${d} (${e.weight} pas)`;
        }).join('   ✦   ');
        const totalPasses = visible.reduce((s,[_,n]) => s + (n.passes||0), 0);
        txt = `${state.team} · ${visible.length} oyuncu · toplam ${totalPasses} pas   ✦   En çok pas: ${topText}`;
      }
      mq.innerHTML = `<span>${txt}</span><span>${txt}</span>`;

    } catch (err) {
      console.error('PN error:', err);
    }
  }

  teamBtns.forEach(btn => btn.addEventListener('click', () => {
    teamBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.team = btn.dataset.team;
    state.subsActive = false;
    state.selectedKey = null;
    subsBtn.classList.remove('active');
    subsBtn.textContent = 'DEĞİŞENLER';
    renderPartners(null);
    render();
  }));

  subsBtn.addEventListener('click', () => {
    state.subsActive = !state.subsActive;
    state.selectedKey = null;
    subsBtn.classList.toggle('active', state.subsActive);
    subsBtn.textContent = state.subsActive ? 'İLK 11' : 'DEĞİŞENLER';

    renderPartners(null);
    render();
  });

  fetch(opts.dataUrl || '/assets/data/gs-stuttgart/pass_network_v2.json')
    .then(r => r.json())
    .then(data => {
      state.data = data;
      drawPitch();
      render();
    })
    .catch(err => { console.error(err); });
}
