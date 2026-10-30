const f = v => (v == null || isNaN(Number(v))) ? 0 : Number(v);

const LABELS = {
  FW: 'Forvet', W: 'Kanat', MF: 'Orta Saha', FB: 'Bek', CB: 'Stoper'
};

const METRIC_LABEL = {
  FW: 'Bitiricilik + xG ağırlıklı',
  W:  'Yaratıcılık + box entry',
  MF: 'Progressif + yaratıcılık',
  FB: 'İleri yönelim + kutu girişi',
  CB: 'Hava + defansif hacim'
};

function statLine(group, p) {
  switch (group) {
    case 'FW': return `<span><b>${f(p.finishing_delta).toFixed(1)}</b> Δ gol−xG · <b>${f(p.xg_per_shot).toFixed(2)}</b> xG/şut</span>`;
    case 'W':  return `<span><b>${f(p.creativity_p90).toFixed(2)}</b> yaratıcılık/90 · <b>${(f(p.box_entry_rate)*100).toFixed(0)}%</b> kutu pası</span>`;
    case 'MF': return `<span><b>${(f(p.progressive_share)*100).toFixed(0)}%</b> progressif · <b>${f(p.creativity_p90).toFixed(2)}</b> yaratıcılık</span>`;
    case 'FB': return `<span><b>${(f(p.forward_orientation)*100).toFixed(0)}%</b> ileri · <b>${(f(p.box_entry_rate)*100).toFixed(0)}%</b> kutu</span>`;
    case 'CB': return `<span><b>${(f(p.aerial_dominance)*100).toFixed(0)}%</b> hava · <b>${f(p.defensive_actions_p90).toFixed(1)}</b> def/90</span>`;
    default:   return '';
  }
}

async function loadJSON(p) {
  try { const r = await fetch(p); return r.ok ? r.json() : null; }
  catch { return null; }
}

function render(standouts, el) {
  if (!standouts || !standouts.length) { el.innerHTML = '<div class="sl-empty">Veri yok</div>'; return; }
  el.innerHTML = standouts.map(p => {
    const g = p.group;
    return `<div class="st-card">
      <div class="st-head">
        <span class="st-group">${g}</span>
        <span class="st-label">${LABELS[g] || g}</span>
      </div>
      <h3 class="st-name">${p.name}</h3>
      <div class="st-team">${p.team} · ${p.minutes}'</div>
      <div class="st-metric-lbl">${METRIC_LABEL[g] || ''}</div>
      <div class="st-stats">${statLine(g, p)}</div>
      <div class="st-composite">
        <span>KOMPOZİT</span>
        <b>${f(p.composite).toFixed(2)}</b>
      </div>
    </div>`;
  }).join('');
}

function init() {
  const el = document.getElementById('standouts-grid');
  if (!el || el.dataset.ready === '1') return;
  el.dataset.ready = '1';
  loadJSON('/assets/data/sl_standouts.json').then(s => {
    if (s) render(s, el);
  });
}

(function boot() {
  const go = () => init();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else setTimeout(go, 150);
  if (import.meta && import.meta.hot) import.meta.hot.accept(() => go());
})();
