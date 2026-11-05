import { renderRadar } from './radar.js';
import { renderPhases } from './phases.js';
import { renderPitch } from './pitch.js';
import { renderScoreboard } from './scoreboard.js';
import { renderEventAnimation } from './event-animation.js';
import { renderSprintChart } from './sprint-chart.js';
import { renderFlow } from './flow.js';
import { applyTheme } from './theme.js';

export function initVizEmbeds() {
  applyTheme();
  const targets = document.querySelectorAll('[data-visual-body], [data-viz]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.dataset.loaded) return;
      el.dataset.loaded = 'true';

      const rawType = el.dataset.viz || el.dataset.visualBody || '';
      const [vizType, matchIdFromType] = rawType.split(':');
      const matchId = el.dataset.src || matchIdFromType || 'konya-gs';
      const playerName = el.dataset.player || '';

      loadAndRender(el, vizType, matchId, playerName);
      observer.unobserve(el);
    });
  }, { rootMargin: '0px 0px -100px 0px', threshold: 0.1 });

  targets.forEach(el => observer.observe(el));
}

async function loadAndRender(container, type, matchId, playerName) {
  try {
    container.classList.add('viz-loading');

    if (type === 'pitch') {
      container.classList.remove('viz-loading');
      container.classList.add('viz-active');
      renderPitch(container);
      return;
    }

    if (type === 'event-anim') {
      container.classList.remove('viz-loading');
      container.classList.add('viz-active');
      renderEventAnimation(container);
      return;
    }

    const res = await fetch(`/assets/data/${matchId}/match_package.json`);
    if (!res.ok) throw new Error('Veri yüklenemedi: ' + matchId);
    const data = await res.json();

    container.innerHTML = '';
    container.classList.remove('viz-loading');
    container.classList.add('viz-active');

    if (type === 'radar') {
      let pName = playerName;
      if (!pName || !data.player_radar.players[pName]) {
        pName = Object.keys(data.player_radar.players)[0];
      }
      const pData = data.player_radar.players[pName];
      const title = document.createElement('div');
      title.className = 'viz-title';
      title.innerHTML = `<span>${pName}</span> <small>OYUNCU PROFİLİ</small>`;
      container.appendChild(title);
      const chartBox = document.createElement('div');
      chartBox.className = 'viz-chart-box';
      container.appendChild(chartBox);
      setTimeout(() => renderRadar(chartBox, pData, pName), 100);

    } else if (type === 'phases') {
      const chartBox = document.createElement('div');
      chartBox.className = 'viz-chart-box';
      container.appendChild(chartBox);
      setTimeout(() => renderPhases(chartBox, data), 100);

    } else if (type === 'scoreboard') {
      renderScoreboard(container, data);

    } else if (type === 'flow') {
      await renderFlow(container, matchId);
      return;
    } else if (type === 'sprint') {
      const title = document.createElement('div');
      title.className = 'viz-title';
      title.innerHTML = `<span>Sprint</span> <small>MESAFE</small>`;
      container.appendChild(title);
      const chartBox = document.createElement('div');
      chartBox.className = 'viz-chart-box';
      container.appendChild(chartBox);
      setTimeout(() => renderSprintChart(chartBox, data), 100);
    }
  } catch (err) {
    console.error('Viz Hatası:', err);
    container.innerHTML = `<div class="viz-error">Görsel yüklenemedi. (${err.message})</div>`;
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initVizEmbeds);
  } else {
    initVizEmbeds();
  }
}
