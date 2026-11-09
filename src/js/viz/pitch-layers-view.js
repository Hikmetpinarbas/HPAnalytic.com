import { gsap } from 'gsap';
import { ease, duration, staggerProfiles } from '../motion-tokens.js';

/**
 * Katmanlı Saha Görünümü v2
 * Manifesto: çim yok, karanlık saha, neon veri noktaları.
 * 3 kategorili floating dock, GSAP dalga animasyonu.
 */

const LAYER_LABELS = {
  pitch: 'Saha Çizgileri',
  halfway: 'Orta Çizgi',
  penalty_boxes: 'Ceza Sahaları',
  goals: 'Kaleler',
  paired_turnovers: 'Eşleşen Kayıplar',
  team_a_recoveries: 'Kazanımlar',
  team_b_recoveries: 'Kazanımlar',
  team_a_losses: 'Kayıplar',
  team_b_losses: 'Kayıplar',
  team_a_shots: 'Şutlar',
  team_b_shots: 'Şutlar',
  set_piece_involvements: 'Duran Top',
  team_a_progressive_pass_events: 'İlerletici Paslar',
  team_b_progressive_pass_events: 'İlerletici Paslar',
  counterattack_involvements: 'Kontratak',
  carry_events: 'Top Taşıma',
};

const COLOR_OVERRIDES = {
  '#153c30': '#08090B',
  '#d9e9dd': '#F8F6F0',
  '#fbbf24': '#B4FF39',
  '#ed6d82': '#FF6B35',
  '#ffd76d': '#B4FF39',
  '#fa9bab': '#FF6B35',
  '#91ffc6': '#B4FF39',
  '#9ee9ff': 'rgba(180,255,57,0.6)',
  '#96e6f4': 'rgba(180,255,57,0.4)',
  '#d9a4fc': '#FF6B35',
  '#101722': '#08090B',
  '#ffffff': '#F8F6F0',
};

function recolorSvg(svgEl) {
  svgEl.querySelectorAll('*').forEach(el => {
    const fill = el.getAttribute('fill');
    const stroke = el.getAttribute('stroke');
    if (fill && COLOR_OVERRIDES[fill.toLowerCase()]) {
      el.setAttribute('fill', COLOR_OVERRIDES[fill.toLowerCase()]);
    }
    if (stroke && COLOR_OVERRIDES[stroke.toLowerCase()]) {
      el.setAttribute('stroke', COLOR_OVERRIDES[stroke.toLowerCase()]);
    }
  });
}

function categoryFor(layerId) {
  if (layerId.startsWith('team_a_')) return 'team_a';
  if (layerId.startsWith('team_b_')) return 'team_b';
  return 'pitch';
}

function animateLayerIn(group) {
  if (!group) return;
  group.style.display = '';
  const marks = [...group.querySelectorAll('circle, rect, line, path, polyline, polygon')];
  if (!marks.length) return;
  marks.sort((a, b) => {
    const ax = parseFloat(a.getAttribute('cx') || a.getAttribute('x') || 0);
    const bx = parseFloat(b.getAttribute('cx') || b.getAttribute('x') || 0);
    return ax - bx;
  });
  gsap.fromTo(marks,
    { opacity: 0, scale: 0, transformOrigin: '50% 50%' },
    {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      stagger: { each: 0.008, from: 'start' },
      ease: ease.data,
      overwrite: true,
    }
  );
}

function animateLayerOut(group) {
  if (!group) return;
  const marks = [...group.querySelectorAll('circle, rect, line, path, polyline, polygon')];
  gsap.to(marks, {
    opacity: 0,
    scale: 0,
    transformOrigin: '50% 50%',
    duration: 0.2,
    overwrite: true,
    onComplete: () => { group.style.display = 'none'; },
  });
}

function buildDock(svgEl, meta) {
  const layers = svgEl.querySelectorAll('[data-hpa-layer]');
  if (!layers.length) return null;

  const teamA = meta?.teams?.['1'] || 'Team A';
  const teamB = meta?.teams?.['2'] || 'Team B';

  const dock = document.createElement('div');
  dock.className = 'pl-dock';

  const categories = [
    { key: 'pitch', label: 'Pitch', color: '#F8F6F0' },
    { key: 'team_a', label: teamA, color: '#B4FF39' },
    { key: 'team_b', label: teamB, color: '#FF6B35' },
  ];

  const categoryBar = document.createElement('div');
  categoryBar.className = 'pl-catbar';

  const subPanels = new Map();
  const layerMap = new Map();

  layers.forEach(g => {
    const id = g.getAttribute('data-hpa-layer');
    layerMap.set(id, g);
  });

  categories.forEach(({ key, label, color }) => {
    const pill = document.createElement('button');
    pill.className = 'pl-pill';
    pill.type = 'button';
    pill.textContent = label;
    pill.style.setProperty('--pill-color', color);
    pill.dataset.cat = key;

    const sub = document.createElement('div');
    sub.className = 'pl-sub';
    sub.dataset.cat = key;

    const catLayers = [];
    layerMap.forEach((g, id) => {
      if (categoryFor(id) !== key) return;
      catLayers.push({ id, g });
    });

    catLayers.forEach(({ id, g }) => {
      const isBase = ['pitch', 'halfway', 'penalty_boxes', 'goals'].includes(id);
      const chip = document.createElement('button');
      chip.className = 'pl-chip' + (isBase ? ' is-on' : '');
      chip.type = 'button';
      chip.textContent = LAYER_LABELS[id] || id;
      chip.style.setProperty('--chip-color', color);

      if (!isBase) g.style.display = 'none';

      chip.addEventListener('click', () => {
        const visible = g.style.display !== 'none';
        if (visible) {
          animateLayerOut(g);
          chip.classList.remove('is-on');
        } else {
          animateLayerIn(g);
          chip.classList.add('is-on');
        }
      });
      sub.appendChild(chip);
    });

    pill.addEventListener('click', () => {
      const wasOpen = sub.classList.contains('is-open');
      subPanels.forEach((panel, k) => {
        panel.classList.remove('is-open');
        categoryBar.querySelector(`[data-cat="${k}"]`)?.classList.remove('is-active');
      });
      if (!wasOpen) {
        sub.classList.add('is-open');
        pill.classList.add('is-active');
        gsap.fromTo([...sub.children],
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: duration.ui, stagger: staggerProfiles.fast.each, ease: ease.data }
        );
      }
    });

    subPanels.set(key, sub);
    categoryBar.appendChild(pill);
  });

  dock.appendChild(categoryBar);
  subPanels.forEach(panel => dock.appendChild(panel));
  return dock;
}

function addEventInteraction(svgEl) {
  svgEl.querySelectorAll('[data-event]').forEach(mark => {
    mark.style.cursor = 'pointer';
    mark.addEventListener('mouseenter', () => {
      gsap.to(mark, { scale: 1.6, transformOrigin: '50% 50%', duration: duration.micro, ease: ease.data });
    });
    mark.addEventListener('mouseleave', () => {
      gsap.to(mark, { scale: 1, transformOrigin: '50% 50%', duration: duration.ui, ease: ease.ui });
    });
  });
}

export function initPitchLayersView(container) {
  const svgSrc = container.dataset.vizSrc || '/assets/data/crystal-palace/sixteen_layers.svg';
  const metaSrc = container.dataset.vizMeta || '/assets/data/crystal-palace/pitch_layers_meta.json';

  if (!svgSrc) {
    container.innerHTML = '<div style="color:var(--orange);font-size:var(--fs-xs)">data-viz-src belirtilmemiş.</div>';
    return;
  }

  container.innerHTML = `<div class="pl-loading"><span class="pl-loading-dot"></span>Katmanlar yükleniyor</div>`;

  Promise.all([
    fetch(svgSrc).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); }),
    metaSrc
      ? fetch(metaSrc).then(r => r.ok ? r.json() : null).catch(() => null)
      : Promise.resolve(null),
  ])
    .then(([svgText, meta]) => {
      container.innerHTML = '';
      container.classList.add('pl-root');

      const header = document.createElement('div');
      header.className = 'pl-header';
      header.innerHTML = `
        <span class="pl-badge">KATMANLI SAHA</span>
        <span class="pl-match">${meta?.teams ? Object.values(meta.teams).join(' — ') : ''}</span>
      `;

      if (meta?.pipeline_validation?.observation_count) {
        const stat = document.createElement('span');
        stat.className = 'pl-stat';
        stat.textContent = `${meta.pipeline_validation.observation_count.toLocaleString('tr-TR')} olay`;
        header.appendChild(stat);
      }

      const board = document.createElement('div');
      board.className = 'pl-board';
      board.innerHTML = svgText;

      const svgEl = board.querySelector('svg');
      if (svgEl) {
        recolorSvg(svgEl);
        svgEl.style.cssText = 'width:100%;height:auto;display:block;';
        svgEl.removeAttribute('width');
        svgEl.removeAttribute('height');
        addEventInteraction(svgEl);
      }

      const dock = svgEl ? buildDock(svgEl, meta) : null;

      container.appendChild(header);
      container.appendChild(board);
      if (dock) container.appendChild(dock);

      if (svgEl) {
        const baseLayers = svgEl.querySelectorAll(
          '[data-hpa-layer="pitch"], [data-hpa-layer="halfway"], [data-hpa-layer="penalty_boxes"], [data-hpa-layer="goals"]'
        );
        gsap.fromTo([...baseLayers],
          { opacity: 0 },
          { opacity: 1, duration: duration.reveal, stagger: staggerProfiles.slow.each, ease: ease.editorial }
        );
      }
    })
    .catch(err => {
      console.error('Pitch Layers:', err);
      container.innerHTML = '<div style="color:var(--orange);font-size:var(--fs-xs)">Katman verisi yüklenemedi.</div>';
    });
}
