const f = v => (v == null || isNaN(Number(v))) ? 0 : Number(v);

let DATA = null;
let state = { team: '', group: '', q: '', sort: 'composite', desc: true };

async function getJSON(p) {
  try { const r = await fetch(p); return r.ok ? r.json() : null; } catch { return null; }
}

function render(el) {
  if (!DATA) return;
  let rows = DATA.filter(p => p.minutes >= 200);
  if (state.team) rows = rows.filter(p => p.team === state.team);
  if (state.group) rows = rows.filter(p => p.group === state.group);
  if (state.q) {
    const q = state.q.toLowerCase();
    rows = rows.filter(p => p.name.toLowerCase().includes(q));
  }
  rows.sort((a, b) => {
    const av = f(a[state.sort]), bv = f(b[state.sort]);
    return state.desc ? bv - av : av - bv;
  });
  rows = rows.slice(0, 100);

  const cols = [
    { k: 'name', l: 'Oyuncu' },
    { k: 'team', l: 'Takım' },
    { k: 'group', l: 'Grup' },
    { k: 'minutes', l: 'Dk', num: 1 },
    { k: 'goals', l: 'Gol', num: 1 },
    { k: 'xg', l: 'xG', num: 1 },
    { k: 'finishing_delta', l: 'Δ', num: 1 },
    { k: 'composite_pct', l: 'Pct', num: 1 },
  ];

  const thead = cols.map(c => 
    `<th data-sort="${c.k}" class="${c.num?'num':''}">${c.l}${state.sort===c.k?' '+(state.desc?'↓':'↑'):''}</th>`
  ).join('');

  const tbody = rows.map(p => `
    <tr>
      <td class="name">${p.name}</td>
      <td class="team">${p.team}</td>
      <td>${p.group}</td>
      <td class="num">${f(p.minutes).toFixed(0)}</td>
      <td class="num">${f(p.goals).toFixed(0)}</td>
      <td class="num">${f(p.xg).toFixed(2)}</td>
      <td class="num">${f(p.finishing_delta)>=0?'+':''}${f(p.finishing_delta).toFixed(2)}</td>
      <td class="num" style="color:var(--neon)">${f(p.composite_pct).toFixed(0)}</td>
    </tr>`).join('');

  el.innerHTML = `
    <div class="oy-controls">
      <select id="oy-team"><option value="">Tüm Takımlar</option>${[...new Set(DATA.map(p=>p.team))].sort().map(t=>`<option${t===state.team?' selected':''}>${t}</option>`).join('')}</select>
      <select id="oy-group"><option value="">Tüm Gruplar</option>${['FW','W','MF','FB','CB'].map(g=>`<option${g===state.group?' selected':''}>${g}</option>`).join('')}</select>
      <input id="oy-q" placeholder="Oyuncu ara…" value="${state.q}">
    </div>
    <div class="oy-scroll">
      <table class="oy-table">
        <thead><tr>${thead}</tr></thead>
        <tbody>${tbody}</tbody>
      </table>
    </div>
    <div style="font-family:var(--mono);font-size:9px;letter-spacing:.18em;color:var(--ink-faint);margin-top:12px;">${rows.length} oyuncu (min 200dk) · ${DATA.length} toplam</div>`;

  el.querySelector('#oy-team').addEventListener('change', e => { state.team = e.target.value; render(el); });
  el.querySelector('#oy-group').addEventListener('change', e => { state.group = e.target.value; render(el); });
  el.querySelector('#oy-q').addEventListener('input', e => { state.q = e.target.value; render(el); });
  el.querySelectorAll('th[data-sort]').forEach(th => th.addEventListener('click', () => {
    const k = th.dataset.sort;
    if (state.sort === k) state.desc = !state.desc;
    else { state.sort = k; state.desc = true; }
    render(el);
  }));
}

async function init() {
  const el = document.getElementById('oyuncular-container');
  if (!el || el.dataset.ready === '1') return;
  el.dataset.ready = '1';
  DATA = await getJSON('/assets/data/sl_advanced.json');
  if (!DATA) { el.innerHTML = '<div class="sl-empty">Veri yok</div>'; return; }
  render(el);
}

(function boot() {
  const go = () => init();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else setTimeout(go, 300);
  if (import.meta && import.meta.hot) import.meta.hot.accept(() => go());
})();
