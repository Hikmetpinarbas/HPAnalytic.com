/**
 * HPAnalytic · Fitness Lab
 * Oyuncu yük haritası (scatter) + takım trend (line)
 * Hover = tooltip, tıklama = pin
 */

export async function initFitnessLab() {
  const host = document.getElementById('fitness-lab');
  if (!host || host.dataset.ready === '1') return;
  host.dataset.ready = '1';

  const base = import.meta.env.BASE_URL;
  let pData, tData;
  try {
    [pData, tData] = await Promise.all([
      fetch(base + 'assets/data/fitness/player-fitness.json').then(r => r.json()),
      fetch(base + 'assets/data/fitness/team-fitness.json').then(r => r.json())
    ]);
  } catch (e) {
    host.innerHTML = '<div style="padding:40px;color:#888;font-family:monospace">Fitness verisi yüklenemedi.</div>';
    return;
  }

  host.innerHTML = `
    <div class="fl-wrap">
      <header class="fl-header">
        <div>
          <span class="fl-kicker">FİZİKSEL VERİ · 2026-27</span>
          <h2 class="fl-title">Yük Haritası</h2>
          <p class="fl-desc">${pData.all.length} oyuncu · mesafe × sprint oranı · baloncuk boyu = dakika · renk = metabolik güç</p>
        </div>
        <div class="fl-tabs">
          <button class="fl-tab on" data-sheet="all">Tüm</button>
          <button class="fl-tab" data-sheet="league">Lig</button>
          <button class="fl-tab" data-sheet="europe">Avrupa</button>
        </div>
      </header>
      <div class="fl-chart-host" id="fl-chart-host"></div>
      <div class="fl-tooltip" id="fl-tip"></div>

      <div class="fl-trend-wrap">
        <header class="fl-trend-head">
          <span class="fl-kicker" style="margin:0">SON 12 MAÇ · TAKIM YÜKÜ</span>
        </header>
        <div class="fl-trend-host" id="fl-trend-host"></div>
      </div>
    </div>
  `;

  const tip = host.querySelector('#fl-tip');
  let pinnedI = null;

  function showTip(p, xPx, yPx, container) {
    const cr = container.getBoundingClientRect();
    tip.innerHTML = `
      <div class="fl-tip-name">${p.name}</div>
      <div class="fl-tip-row"><span>Mesafe</span><b>${(p.distance_m/1000).toFixed(1)} km</b></div>
      <div class="fl-tip-row"><span>Sprint</span><b>${(p.sprint_distance_gt_7_ms_m||0).toFixed(0)} m</b></div>
      <div class="fl-tip-row"><span>Sprint sayısı</span><b>${p.number_of_sprints||0}</b></div>
      <div class="fl-tip-row"><span>Maks hız</span><b>${(p.maximum_speed_ms||0).toFixed(2)} m/s</b></div>
      <div class="fl-tip-row"><span>Metabolik</span><b>${(p.average_metabolic_power_w_kg||0).toFixed(1)} W/kg</b></div>
      <div class="fl-tip-row"><span>Dakika</span><b>${p.minutes_played||0}'</b></div>
    `;
    tip.style.left = xPx + 'px';
    tip.style.top = yPx + 'px';
    tip.classList.add('on');
  }

  function hideTip() { if (pinnedI === null) tip.classList.remove('on'); }

  function renderScatter(sheet) {
    const players = pData[sheet] || [];
    const chartHost = host.querySelector('#fl-chart-host');
    const W = 900, H = 480, pad = { l: 70, r: 40, t: 40, b: 60 };
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;

    const pts = players.map(p => {
      const dist = p.distance_m || 0;
      const sprint = p.sprint_distance_gt_7_ms_m || 0;
      const mins = p.minutes_played || 1;
      return {
        ...p,
        xv: dist / 1000,  // km
        yv: (sprint / mins) * 60,  // sprint m / 60dk
        rv: Math.max(8, Math.sqrt(mins) * 1.0),
        mp: p.average_metabolic_power_w_kg || 0
      };
    }).filter(p => p.xv > 0);

    if (!pts.length) { chartHost.innerHTML = '<div style="padding:40px;color:#666;text-align:center;font-family:monospace">Bu sheet için veri yok.</div>'; return; }

    const xs = pts.map(p => p.xv), ys = pts.map(p => p.yv), mps = pts.map(p => p.mp);
    const xmin = Math.min(...xs) * 0.95, xmax = Math.max(...xs) * 1.02;
    const ymin = 0, ymax = Math.max(...ys) * 1.1;
    const mpmin = Math.min(...mps), mpmax = Math.max(...mps);
    const sx = v => pad.l + ((v - xmin) / (xmax - xmin)) * iw;
    const sy = v => pad.t + ih - ((v - ymin) / (ymax - ymin)) * ih;
    const col = v => {
      const t = mpmax > mpmin ? (v - mpmin) / (mpmax - mpmin) : 0.5;
      // neon yeşil (düşük) → turuncu (yüksek)
      const r = Math.round(180 + (255 - 180) * t);
      const g = Math.round(255 - 148 * t);
      const b = Math.round(57 + (53 - 57) * t);
      return `rgb(${r},${g},${b})`;
    };

    const gridY = [0, .25, .5, .75, 1].map(t => {
      const y = pad.t + ih * t;
      const val = (ymin + (ymax - ymin) * (1 - t)).toFixed(0);
      return `<line x1="${pad.l}" y1="${y}" x2="${W-pad.r}" y2="${y}" stroke="rgba(255,255,255,0.05)"/>
              <text x="${pad.l-12}" y="${y+4}" text-anchor="end" fill="#666" font-size="10" font-family="monospace">${val}</text>`;
    }).join('');

    const gridX = [0, .25, .5, .75, 1].map(t => {
      const x = pad.l + iw * t;
      const val = (xmin + (xmax - xmin) * t).toFixed(1);
      return `<line x1="${x}" y1="${pad.t}" x2="${x}" y2="${pad.t+ih}" stroke="rgba(255,255,255,0.03)"/>
              <text x="${x}" y="${pad.t+ih+20}" text-anchor="middle" fill="#666" font-size="10" font-family="monospace">${val}</text>`;
    }).join('');

    const svg = `<svg viewBox="0 0 ${W} ${H}" class="fl-svg" preserveAspectRatio="xMidYMid meet">
      ${gridX}${gridY}
      <line x1="${pad.l}" y1="${pad.t+ih}" x2="${W-pad.r}" y2="${pad.t+ih}" stroke="rgba(180,255,57,0.4)" stroke-width="1.5"/>
      <line x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${pad.t+ih}" stroke="rgba(180,255,57,0.4)" stroke-width="1.5"/>
      <text x="${pad.l + iw/2}" y="${H-15}" text-anchor="middle" fill="#B4FF39" font-size="11" font-family="monospace" letter-spacing="2">TOPLAM MESAFE (km)</text>
      <text x="20" y="${pad.t + ih/2}" text-anchor="middle" fill="#B4FF39" font-size="11" font-family="monospace" letter-spacing="2" transform="rotate(-90 20 ${pad.t + ih/2})">SPRINT / 60dk (m)</text>
      ${pts.map((p, i) => {
        const cx = sx(p.xv), cy = sy(p.yv);
        const short = (p.name || '').split(' ').slice(-1)[0].slice(0, 9);
        return `<g class="fl-point" data-i="${i}">
          <circle cx="${cx}" cy="${cy}" r="${p.rv}" fill="${col(p.mp)}" fill-opacity="0.75" stroke="rgba(180,255,57,0.7)" stroke-width="1.2"/>
          <text x="${cx}" y="${cy+3}" text-anchor="middle" font-size="9" fill="#0a0a0c" font-weight="700" font-family="monospace" pointer-events="none">${short}</text>
        </g>`;
      }).join('')}
    </svg>`;

    chartHost.innerHTML = svg;

    chartHost.querySelectorAll('.fl-point').forEach(g => {
      const i = parseInt(g.dataset.i);
      const p = pts[i];
      g.addEventListener('mouseenter', e => {
        const cr = chartHost.getBoundingClientRect();
        const svgPoint = g.querySelector('circle');
        const rect = svgPoint.getBoundingClientRect();
        showTip(p, rect.left - cr.left + rect.width/2, rect.top - cr.top, chartHost);
        g.style.filter = 'drop-shadow(0 0 12px rgba(180,255,57,0.8))';
      });
      g.addEventListener('mouseleave', () => { hideTip(); g.style.filter = ''; });
      g.addEventListener('click', () => { pinnedI = pinnedI === i ? null : i; });
    });
  }

  function renderTrend() {
    const matches = [...(tData.all || [])].filter(m => m.gal && m.gal.distance_m > 0).sort((a,b) => (a.date||'').localeCompare(b.date||''));
    if (!matches.length) return;
    const chartHost = host.querySelector('#fl-trend-host');
    const W = 900, H = 220, pad = { l: 50, r: 30, t: 20, b: 50 };
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    const dists = matches.map(m => m.gal.distance_m);
    const dmin = Math.min(...dists) * 0.98, dmax = Math.max(...dists) * 1.02;
    const sx = i => pad.l + (i / (matches.length - 1 || 1)) * iw;
    const sy = v => pad.t + ih - ((v - dmin) / (dmax - dmin)) * ih;
    const pts = matches.map((m, i) => ({ x: sx(i), y: sy(m.gal.distance_m), m }));

    const path = pts.map((p,i) => (i ? 'L' : 'M') + p.x + ',' + p.y).join(' ');
    const area = path + ` L${pts[pts.length-1].x},${pad.t+ih} L${pad.l},${pad.t+ih} Z`;

    const svg = `<svg viewBox="0 0 ${W} ${H}" class="fl-trend-svg">
      <defs>
        <linearGradient id="flArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#B4FF39" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#B4FF39" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${area}" fill="url(#flArea)"/>
      <path d="${path}" fill="none" stroke="#B4FF39" stroke-width="2.5" stroke-linejoin="round"/>
      ${pts.map((p,i) => `<g class="fl-trend-pt" data-i="${i}">
        <circle cx="${p.x}" cy="${p.y}" r="5" fill="#0a0a0c" stroke="#B4FF39" stroke-width="2"/>
      </g>`).join('')}
      ${pts.map((p,i) => i % 2 === 0 ? `<text x="${p.x}" y="${H-20}" text-anchor="middle" fill="#666" font-size="9" font-family="monospace" transform="rotate(-30 ${p.x} ${H-20})">${(p.m.opponent||'').slice(0,8)}</text>` : '').join('')}
    </svg>`;

    chartHost.innerHTML = svg;

    chartHost.querySelectorAll('.fl-trend-pt').forEach(g => {
      const i = parseInt(g.dataset.i);
      const m = matches[i];
      g.addEventListener('mouseenter', () => {
        const c = g.querySelector('circle').getBoundingClientRect();
        const cr = chartHost.getBoundingClientRect();
        tip.innerHTML = `
          <div class="fl-tip-name">${m.opponent}</div>
          <div class="fl-tip-row"><span>Skor</span><b>${m.score}</b></div>
          <div class="fl-tip-row"><span>Mesafe</span><b>${(m.gal.distance_m/1000).toFixed(1)} km</b></div>
          <div class="fl-tip-row"><span>Sprint</span><b>${(m.gal.sprint_distance_gt_7_ms_m||0).toFixed(0)} m</b></div>
        `;
        tip.style.left = (c.left - cr.left) + 'px';
        tip.style.top = (c.top - cr.top - 10) + 'px';
        tip.classList.add('on');
      });
      g.addEventListener('mouseleave', () => hideTip());
    });
  }

  host.querySelectorAll('.fl-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      host.querySelectorAll('.fl-tab').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      renderScatter(btn.dataset.sheet);
    });
  });

  renderScatter('all');
  renderTrend();
}
