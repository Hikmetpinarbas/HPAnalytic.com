const f = v => (v == null || isNaN(Number(v))) ? 0 : Number(v);

async function loadJSON(p) {
  try { const r = await fetch(p); return r.ok ? r.json() : null; }
  catch { return null; }
}

const short = name => {
  if (!name) return '—';
  const parts = String(name).trim().split(' ');
  if (parts.length < 2) return name;
  return parts[0][0] + '. ' + parts.slice(1).join(' ');
};

function barRow({ pos, name, team, barPct, val, valClass, title }) {
  return `<div class="tx-row" title="${title || ''}">
    <span class="tx-pos">${pos}</span>
    <span class="tx-name">${name}</span>
    <span class="tx-team">${team}</span>
    <div class="tx-bar"><div style="width:${barPct}%" class="${valClass || ''}"></div></div>
    <span class="tx-val ${valClass || ''}">${val}</span>
  </div>`;
}

function renderFinishing(rankings, el) {
  const list = rankings.finishing_delta || [];
  if (!list.length) { el.innerHTML = '<div class="sl-empty">Veri yok</div>'; return; }
  const maxAbs = Math.max(...list.map(p => Math.abs(f(p.finishing_delta))), 1);
  el.innerHTML = list.slice(0, 10).map((p, i) => {
    const delta = f(p.finishing_delta);
    const pct = Math.abs(delta) / maxAbs * 100;
    const cls = delta >= 0 ? 'pos' : 'neg';
    const sign = delta >= 0 ? '+' : '';
    return barRow({
      pos: i + 1,
      name: short(p.name),
      team: p.team,
      barPct: pct,
      val: sign + delta.toFixed(2),
      valClass: cls,
      title: `Gol: ${p.goals} · xG: ${p.xg}`
    });
  }).join('');
}

function renderCreativity(rankings, el) {
  const list = rankings.creativity_p90 || [];
  if (!list.length) { el.innerHTML = '<div class="sl-empty">Veri yok</div>'; return; }
  const max = f(list[0].creativity_p90) || 1;
  el.innerHTML = list.slice(0, 10).map((p, i) => {
    const v = f(p.creativity_p90);
    const pct = v / max * 100;
    return barRow({
      pos: i + 1,
      name: short(p.name),
      team: p.team,
      barPct: pct,
      val: v.toFixed(2),
      valClass: 'pos',
      title: `xA: ${p.xa} · Gol: ${p.goals} · Asist: ${p.assists}`
    });
  }).join('');
}

function renderComposite(rankings, el) {
  const groups = ['FW', 'W', 'MF', 'FB', 'CB'];
  const all = [];
  groups.forEach(g => {
    const arr = rankings['composite_' + g] || [];
    if (arr[0]) all.push({ group: g, player: arr[0] });
  });
  if (!all.length) { el.innerHTML = '<div class="sl-empty">Veri yok</div>'; return; }
  const maxComp = Math.max(...all.map(x => Math.abs(f(x.player.composite))), 1);
  el.innerHTML = all.map((x, i) => {
    const p = x.player;
    const comp = f(p.composite);
    const pct = Math.abs(comp) / maxComp * 100;
    const row = `<div class="tx-row" title="Kompozit: ${comp.toFixed(2)}">
      <span class="tx-group">${x.group}</span>
      <span class="tx-name">${short(p.name)}</span>
      <span class="tx-team">${p.team}</span>
      <div class="tx-bar"><div style="width:${pct}%" class="pos"></div></div>
      <span class="tx-val pos">${comp.toFixed(2)}</span>
    </div>`;
    return row;
  }).join('');
}

function initSuperlig() {
  const fEl = document.getElementById('sl-scorers');
  const cEl = document.getElementById('sl-table');
  const compEl = document.getElementById('sl-offense');
  if (!fEl || fEl.dataset.ready === '1') return;
  fEl.dataset.ready = '1';

  loadJSON('/assets/data/sl_rankings.json').then(r => {
    if (!r) return;
    if (fEl) renderFinishing(r, fEl);
    if (cEl) renderCreativity(r, cEl);
    if (compEl) renderComposite(r, compEl);
  });
}

(function boot() {
  const go = () => initSuperlig();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else setTimeout(go, 150);
  if (import.meta && import.meta.hot) import.meta.hot.accept(() => go());
})();
