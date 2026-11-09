/* Pitch Layers View v2 — standalone IIFE, manifesto uyumlu */
(function () {
  'use strict';

  var LAYER_LABELS = {
    pitch: 'Saha Çizgileri', halfway: 'Orta Çizgi',
    penalty_boxes: 'Ceza Sahaları', goals: 'Kaleler',
    paired_turnovers: 'Eşleşen Kayıplar',
    team_a_recoveries: 'Kazanımlar', team_b_recoveries: 'Kazanımlar',
    team_a_losses: 'Kayıplar', team_b_losses: 'Kayıplar',
    team_a_shots: 'Şutlar', team_b_shots: 'Şutlar',
    set_piece_involvements: 'Duran Top',
    team_a_progressive_pass_events: 'İlerletici Paslar',
    team_b_progressive_pass_events: 'İlerletici Paslar',
    counterattack_involvements: 'Kontratak',
    carry_events: 'Top Taşıma',
  };

  var COLOR_OVERRIDES = {
    '#153c30': '#08090B', '#d9e9dd': '#F8F6F0',
    '#fbbf24': '#B4FF39', '#ed6d82': '#FF6B35',
    '#ffd76d': '#B4FF39', '#fa9bab': '#FF6B35',
    '#91ffc6': '#B4FF39', '#9ee9ff': 'rgba(180,255,57,0.6)',
    '#96e6f4': 'rgba(180,255,57,0.4)', '#d9a4fc': '#FF6B35',
    '#101722': '#08090B', '#ffffff': '#F8F6F0',
  };

  function recolorSvg(svgEl) {
    svgEl.querySelectorAll('*').forEach(function (el) {
      var fill = el.getAttribute('fill');
      var stroke = el.getAttribute('stroke');
      if (fill && COLOR_OVERRIDES[fill.toLowerCase()]) el.setAttribute('fill', COLOR_OVERRIDES[fill.toLowerCase()]);
      if (stroke && COLOR_OVERRIDES[stroke.toLowerCase()]) el.setAttribute('stroke', COLOR_OVERRIDES[stroke.toLowerCase()]);
    });
  }

  function categoryFor(id) {
    if (id.indexOf('team_a_') === 0) return 'team_a';
    if (id.indexOf('team_b_') === 0) return 'team_b';
    return 'pitch';
  }

  function animateIn(group) {
    if (!group) return;
    group.style.display = '';
    if (typeof gsap === 'undefined') return;
    var marks = Array.from(group.querySelectorAll('circle, rect, line, path, polyline, polygon'));
    if (!marks.length) return;
    marks.sort(function (a, b) {
      return (parseFloat(a.getAttribute('cx') || a.getAttribute('x') || 0))
           - (parseFloat(b.getAttribute('cx') || b.getAttribute('x') || 0));
    });
    gsap.fromTo(marks,
      { opacity: 0, scale: 0, transformOrigin: '50% 50%' },
      { opacity: 1, scale: 1, duration: 0.5, stagger: { each: 0.008, from: 'start' }, ease: 'back.out(2.5)', overwrite: true }
    );
  }

  function animateOut(group) {
    if (!group) return;
    if (typeof gsap === 'undefined') { group.style.display = 'none'; return; }
    var marks = Array.from(group.querySelectorAll('circle, rect, line, path, polyline, polygon'));
    gsap.to(marks, { opacity: 0, scale: 0, transformOrigin: '50% 50%', duration: 0.2, overwrite: true, onComplete: function () { group.style.display = 'none'; } });
  }

  function buildDock(svgEl, meta) {
    var layers = svgEl.querySelectorAll('[data-hpa-layer]');
    if (!layers.length) return null;
    var teamA = (meta && meta.teams && meta.teams['1']) || 'Team A';
    var teamB = (meta && meta.teams && meta.teams['2']) || 'Team B';
    var dock = document.createElement('div'); dock.className = 'pl-dock';
    var cats = [
      { key: 'pitch', label: 'Pitch', color: '#F8F6F0' },
      { key: 'team_a', label: teamA, color: '#B4FF39' },
      { key: 'team_b', label: teamB, color: '#FF6B35' },
    ];
    var catbar = document.createElement('div'); catbar.className = 'pl-catbar';
    var subPanels = {};
    var layerMap = {};
    layers.forEach(function (g) { layerMap[g.getAttribute('data-hpa-layer')] = g; });

    cats.forEach(function (cat) {
      var pill = document.createElement('button');
      pill.className = 'pl-pill'; pill.type = 'button'; pill.textContent = cat.label;
      pill.style.setProperty('--pill-color', cat.color); pill.dataset.cat = cat.key;

      var sub = document.createElement('div'); sub.className = 'pl-sub'; sub.dataset.cat = cat.key;
      var catLayers = [];
      Object.keys(layerMap).forEach(function (id) { if (categoryFor(id) === cat.key) catLayers.push({ id: id, g: layerMap[id] }); });

      catLayers.forEach(function (item) {
        var isBase = ['pitch', 'halfway', 'penalty_boxes', 'goals'].indexOf(item.id) !== -1;
        var chip = document.createElement('button');
        chip.className = 'pl-chip' + (isBase ? ' is-on' : '');
        chip.type = 'button'; chip.textContent = LAYER_LABELS[item.id] || item.id;
        chip.style.setProperty('--chip-color', cat.color);
        if (!isBase) item.g.style.display = 'none';
        chip.addEventListener('click', function () {
          var visible = item.g.style.display !== 'none';
          if (visible) { animateOut(item.g); chip.classList.remove('is-on'); }
          else { animateIn(item.g); chip.classList.add('is-on'); }
        });
        sub.appendChild(chip);
      });

      pill.addEventListener('click', function () {
        var wasOpen = sub.classList.contains('is-open');
        Object.keys(subPanels).forEach(function (k) {
          subPanels[k].classList.remove('is-open');
          var p = catbar.querySelector('[data-cat="' + k + '"]');
          if (p) p.classList.remove('is-active');
        });
        if (!wasOpen) {
          sub.classList.add('is-open'); pill.classList.add('is-active');
          if (typeof gsap !== 'undefined') {
            gsap.fromTo(Array.from(sub.children),
              { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.04, ease: 'back.out(2)' });
          }
        }
      });

      subPanels[cat.key] = sub;
      catbar.appendChild(pill);
    });

    dock.appendChild(catbar);
    Object.keys(subPanels).forEach(function (k) { dock.appendChild(subPanels[k]); });
    return dock;
  }

  function initPitchLayersView(container) {
    var svgSrc = container.dataset.vizSrc || '/assets/data/crystal-palace/sixteen_layers.svg';
    var metaSrc = container.dataset.vizMeta || '/assets/data/crystal-palace/pitch_layers_meta.json';
    container.innerHTML = '<div class="pl-loading"><span class="pl-loading-dot"></span>Katmanlar yükleniyor</div>';

    Promise.all([
      fetch(svgSrc).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }),
      metaSrc ? fetch(metaSrc).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }) : Promise.resolve(null),
    ]).then(function (res) {
      var svgText = res[0], meta = res[1];
      container.innerHTML = '';
      container.classList.add('pl-root');

      var header = document.createElement('div'); header.className = 'pl-header';
      header.innerHTML = '<span class="pl-badge">KATMANLI SAHA</span>' +
        '<span class="pl-match">' + (meta && meta.teams ? Object.values(meta.teams).join(' — ') : '') + '</span>';
      if (meta && meta.pipeline_validation && meta.pipeline_validation.observation_count) {
        var stat = document.createElement('span'); stat.className = 'pl-stat';
        stat.textContent = meta.pipeline_validation.observation_count.toLocaleString('tr-TR') + ' olay';
        header.appendChild(stat);
      }

      var board = document.createElement('div'); board.className = 'pl-board';
      board.innerHTML = svgText;
      var svgEl = board.querySelector('svg');
      if (svgEl) {
        recolorSvg(svgEl);
        svgEl.style.cssText = 'width:100%;height:auto;display:block;';
        svgEl.removeAttribute('width'); svgEl.removeAttribute('height');
      }
      var dock = svgEl ? buildDock(svgEl, meta) : null;
      container.appendChild(header);
      container.appendChild(board);
      if (dock) container.appendChild(dock);

      if (svgEl && typeof gsap !== 'undefined') {
        var bases = svgEl.querySelectorAll('[data-hpa-layer="pitch"], [data-hpa-layer="halfway"], [data-hpa-layer="penalty_boxes"], [data-hpa-layer="goals"]');
        gsap.fromTo(Array.from(bases), { opacity: 0 }, { opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power2.out' });
      }
    }).catch(function (err) {
      console.error('Pitch Layers:', err);
      container.innerHTML = '<div style="color:var(--orange);font-size:var(--fs-xs)">Katman verisi yüklenemedi.</div>';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-visual-body="pitch-layers"]').forEach(initPitchLayersView);
  });

  window.initPitchLayersView = initPitchLayersView;
})();
