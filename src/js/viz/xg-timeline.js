import { gsap } from 'gsap';
import { ease, duration } from '../motion-tokens.js';

const HP_COLORS = {
  home: '#B4FF39',
  away: '#FF6B35',
};

function adaptXgFlowData(raw) {
  const keys = Object.keys(raw).filter((k) => k !== 'totals' && k !== 'method');
  const preserveEvent = (ev) => ({
    ...ev,
    min: ev.minute,
    xg: ev.xg,
  });
  const home = (raw[keys[0]] || []).map(preserveEvent);
  const away = (raw[keys[1]] || []).map(preserveEvent);
  return {
    homeLabel: keys[0] || 'Home',
    awayLabel: keys[1] || 'Away',
    home,
    away,
  };
}

function formatDetail(value) {
  if (value === null || value === undefined || value === '') return 'UNKNOWN';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function createSemanticHover(container, data) {
  const panel = document.createElement('div');
  panel.className = 'xg-semantic-hover';
  panel.hidden = true;
  panel.setAttribute('role', 'status');
  panel.style.cssText = 'position:absolute;z-index:2;display:none;pointer-events:none;'
    + 'padding:10px 12px;border:1px solid rgba(180,255,57,.45);'
    + 'background:rgba(16,23,34,.96);color:#f4f7ef;font:12px/1.45 system-ui,sans-serif;'
    + 'border-radius:6px;max-width:240px;';
  container.style.position = container.style.position || 'relative';
  container.appendChild(panel);

  const show = (event, team, ev) => {
    const rows = [
      ['Team', team],
      ['Minute', ev.min],
      ['xG', ev.xg],
    ];
    // Only display source-provided optional fields; no inferred event detail.
    for (const key of ['player', 'player_name', 'outcome', 'shot_type', 'source_ref', 'id']) {
      if (Object.prototype.hasOwnProperty.call(ev, key)) rows.push([key, ev[key]]);
    }
    panel.innerHTML = rows.map(([key, value]) =>
      `<div><strong>${key}</strong>: ${formatDetail(value)}</div>`).join('');
    const rect = container.getBoundingClientRect();
    panel.style.left = `${Math.max(0, event.clientX - rect.left + 10)}px`;
    panel.style.top = `${Math.max(0, event.clientY - rect.top + 10)}px`;
    panel.hidden = false;
    panel.style.display = 'block';
  };
  const hide = () => { panel.hidden = true; panel.style.display = 'none'; };
  return { show, hide };
}

function stepPath(events, { width, height, color }) {
  const ns = 'http://www.w3.org/2000/svg';
  const path = document.createElementNS(ns, 'path');

  let cumXg = 0;
  const maxMin = 90;
  const points = [{ x: 0, y: height }];

  events.forEach((ev) => {
    const x0 = (ev.min / maxMin) * width;
    points.push({ x: x0, y: height - (cumXg / 5) * height });
    cumXg += ev.xg;
    points.push({ x: x0, y: height - (cumXg / 5) * height });
  });
  points.push({ x: width, y: height - (cumXg / 5) * height });

  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', color);
  path.setAttribute('stroke-width', '2.5');
  path.setAttribute('stroke-linejoin', 'round');

  const len = path.getTotalLength?.() ?? 1000;
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;

  return path;
}

function animateEntrance(pathEl, delay = 0) {
  gsap.to(pathEl, {
    strokeDashoffset: 0,
    duration: duration.cinematic,
    delay,
    ease: ease.draw,
  });
  gsap.fromTo(pathEl,
    { filter: 'drop-shadow(0 0 0px transparent)' },
    { filter: `drop-shadow(0 0 6px ${pathEl.getAttribute('stroke')})`,
      duration: duration.reveal, delay: delay + 0.8, ease: ease.data }
  );
}

function renderChart(container, data) {
  const width = container.clientWidth || 600;
  const height = Math.min(width * 0.45, 360);

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `xG Zaman Grafiği — ${data.homeLabel} vs ${data.awayLabel}`);
  svg.style.width = '100%';
  svg.style.height = 'auto';
  container.appendChild(svg);

  const homePath = stepPath(data.home, { width, height, color: HP_COLORS.home });
  const awayPath = stepPath(data.away, { width, height, color: HP_COLORS.away });
  svg.appendChild(homePath);
  svg.appendChild(awayPath);

  const hover = createSemanticHover(container, data);
  const maxMin = 90;
  const maxXg = 5;
  const addEventMarkers = (events, team, color) => {
    let cumulative = 0;
    events.forEach((ev, index) => {
      const x = (ev.min / maxMin) * width;
      cumulative += Number(ev.xg) || 0;
      const y = height - (cumulative / maxXg) * height;
      const marker = document.createElementNS(ns, 'circle');
      marker.setAttribute('cx', x);
      marker.setAttribute('cy', y);
      marker.setAttribute('r', '5');
      marker.setAttribute('fill', color);
      marker.setAttribute('stroke', '#101722');
      marker.setAttribute('stroke-width', '1.5');
      marker.setAttribute('tabindex', '0');
      marker.setAttribute('role', 'button');
      marker.setAttribute('aria-label', `${team} xG olayı ${formatDetail(ev.minute)} dakika`);
      marker.addEventListener('mouseenter', (event) => hover.show(event, team, ev));
      marker.addEventListener('mousemove', (event) => hover.show(event, team, ev));
      marker.addEventListener('mouseleave', hover.hide);
      marker.addEventListener('focus', (event) => hover.show(event, team, ev));
      marker.addEventListener('blur', hover.hide);
      marker.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') { hover.hide(); marker.blur(); }
      });
      marker.dataset.eventIndex = String(index);
      svg.appendChild(marker);
    });
  };
  addEventMarkers(data.home, data.homeLabel, HP_COLORS.home);
  addEventMarkers(data.away, data.awayLabel, HP_COLORS.away);

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        animateEntrance(homePath, 0);
        animateEntrance(awayPath, 0.3);
        observer.disconnect();
      }
    },
    { threshold: 0.25 }
  );
  observer.observe(container);
}

export function initXgTimeline(container) {
  const src = container.dataset.vizSrc;
  if (src) {
    fetch(src)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((raw) => renderChart(container, adaptXgFlowData(raw)))
      .catch((err) => {
        console.error('xG Timeline fetch hatası:', err);
        container.innerHTML = `<div style="color:${HP_COLORS.away};font-size:12px">xG verisi yüklenemedi.</div>`;
      });
    return;
  }

  const inline = container.dataset.vizPayload;
  if (!inline) return;
  try {
    const raw = JSON.parse(inline);
    renderChart(container, adaptXgFlowData(raw));
  } catch { /* sessizce atla */ }
}
