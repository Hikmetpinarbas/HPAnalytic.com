/**
 * HPAnalytic · İnteraktif Maç Sahnesi
 * Katmanlar: Saha + Pass Flow + Şut + Zaman Kaydırıcı
 */
import { PitchScene } from './pitch-layers.js';
import { PassFlowLayer } from './pass-flow.js';

export async function initMatchViz() {
  const host = document.getElementById('match-viz');
  if (!host || host.dataset.ready === '1' || window.__mvInit) return;
  window.__mvInit = true;
  host.dataset.ready = '1';

  let passesData, shotsData;
  try {
    [passesData, shotsData] = await Promise.all([
      fetch(import.meta.env.BASE_URL + 'assets/data/lille-gs/real-passes.json').then(r => r.json()),
      fetch(import.meta.env.BASE_URL + 'assets/data/lille-gs/shot_map.json').then(r => r.json())
    ]);
  } catch(e) {
    console.error('Veri yüklenemedi:', e);
    host.innerHTML = '<div style="padding:40px;color:#888;font-family:monospace">Veri yüklenemedi. /assets/data/lille-gs/ kontrol edin.</div>';
    return;
  }

  const passes = passesData.passes || [];
  const shots = shotsData.shots || shotsData || [];
  const meta = passesData.metadata || {};

  // UI: başlık + kontroller + sahne
  host.innerHTML = `
    <div class="mv-wrap">
      <header class="mv-header">
        <div>
          <span class="mv-kicker">KANIT · TÜREV · TAKTİK</span>
          <h2 class="mv-title">Lille 2 — 4 Galatasaray</h2>
          <p class="mv-sub">${meta.total_events || '?'} olay · ${passes.length} pas · ${shots.length} şut</p>
        </div>
        <div class="mv-controls">
          <button class="mv-btn" data-layer="flow">Akış</button>
          <button class="mv-btn" data-layer="shots">Şutlar</button>
          <button class="mv-btn" data-layer="heat">Isı</button>
        </div>
      </header>
      <div class="mv-scene" id="mv-scene"></div>
      <div class="mv-timeline">
        <span class="mv-t-label">0'</span>
        <input type="range" id="mv-time" min="0" max="95" value="95" step="1">
        <span class="mv-t-label">95'</span>
        <span class="mv-t-value" id="mv-time-val">95'</span>
      </div>
    </div>
  `;

  const scene = new PitchScene('#mv-scene');
  // Boyut için 1 frame bekle
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  // Zaman filtresi
  let currentMin = 95;

  // Katman 1: Pass Flow
  const flow = new PassFlowLayer(scene, passes, {
    particleCount: 1200,
    speed: 1.8,
    trailLength: 8,
    color: 'rgba(180,255,57,0.18)',
    gridSize: 8
  });

  // Katman 2: Şutlar
  function drawShots({ ctx, w, h, px }) {
    shots.forEach(s => {
      if ((s.time || s.minute || 0) > currentMin * 60) return;
      const p = px(s.x, s.y);
      const xg = s.xg || 0.1;
      const r = 3 + 25 * xg;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = s.is_goal ? '#FFFFFF' : '#FF6B35';
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
      if (s.is_goal) {
        ctx.strokeStyle = '#B4FF39';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }

  // Katman 3: Isı (pas başlangıçları)
  function drawHeat({ ctx, w, h, px }) {
    passes.forEach(p => {
      if (p.t / 60 > currentMin) return;
      const pt = px(p.x1, p.y1);
      const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 25);
      g.addColorStop(0, 'rgba(255,107,53,0.08)');
      g.addColorStop(1, 'rgba(255,107,53,0)');
      ctx.fillStyle = g;
      ctx.fillRect(pt.x - 25, pt.y - 25, 50, 50);
    });
  }

  scene.addLayer('flow', () => {});
  scene.addLayer('shots', drawShots);
  scene.addLayer('heat', drawHeat);
  scene.toggleLayer('heat', false);
  scene.toggleLayer('shots', false);

  // Kontroller
  host.querySelectorAll('.mv-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const layer = btn.dataset.layer;
      if (layer === 'flow') {
        if (flow.running) { flow.destroy(); btn.classList.remove('on'); }
        else { flow.start(); btn.classList.add('on'); }
      } else {
        scene.toggleLayer(layer);
        btn.classList.toggle('on');
      }
    });
    if (btn.dataset.layer === 'flow') btn.classList.add('on');
  });

  // Görünürlük kontrolü — viewport dışındayken dur
  if (typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) flow.start();
        else if (flow.running) flow.destroy();
      });
    }, { threshold: 0.1 });
    io.observe(host);
  }

  // Zaman kaydırıcı
  const slider = document.getElementById('mv-time');
  const val = document.getElementById('mv-time-val');
  slider.addEventListener('input', () => {
    currentMin = parseInt(slider.value);
    val.textContent = currentMin + "'";
    scene.render();
  });
}
