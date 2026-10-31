const f = v => (v == null || isNaN(Number(v))) ? 0 : Number(v);
let DATA = null;
let state = { a: null, b: null };

async function getJSON(p) {
  try { const r = await fetch(p); return r.ok ? r.json() : null; } catch { return null; }
}

const METRICS = [
  { k: 'goals', l: 'Gol', fmt: v => f(v).toFixed(0) },
  { k: 'xg', l: 'xG', fmt: v => f(v).toFixed(2) },
  { k: 'finishing_delta', l: 'Bitiricilik Δ', fmt: v => (v>=0?'+':'')+f(v).toFixed(2) },
  { k: 'creativity_p90', l: 'Yaratıcılık', fmt: v => f(v).toFixed(2) },
  { k: 'press_resistance', l: 'Pres direnci', fmt: v => f(v).toFixed(1) },
  { k: 'progressive_share', l: 'Progressif pas %', fmt: v => (f(v)*100).toFixed(0)+'%' },
  { k: 'defensive_actions_p90', l: 'Defansif/90', fmt: v => f(v).toFixed(1) },
  { k: 'composite_pct', l: 'Grup Pct', fmt: v => f(v).toFixed(0) },
];

function render(el) {
  if (!DATA) return;
  const opts = DATA.filter(p => p.minutes >= 400).sort((a,b) => a.name.localeCompare(b.name));
  const optHtml = sel => `<option value="">— Seç —</option>` + opts.map(p => 
    `<option value="${p.name}"${p.name===sel?' selected':''}>${p.name} (${p.team})</option>`).join('');

  const A = DATA.find(p => p.name === state.a);
  const B = DATA.find(p => p.name === state.b);

  let barsHtml = '';
  if (A && B) {
    barsHtml = METRICS.map(m => {
      const av = f(A[m.k]), bv = f(B[m.k]);
      const sum = Math.abs(av) + Math.abs(bv) || 1;
      const ap = Math.abs(av) / sum * 100;
      const bp = Math.abs(bv) / sum * 100;
      return `<div class="kars-bar-row">
        <div class="lbl">${m.l}</div>
        <span class="l-val">${m.fmt(av)}</span>
        <div class="kars-bar">
          <div class="l" style="width:${ap}%"></div>
          <div class="r" style="width:${bp}%"></div>
        </div>
        <span class="r-val">${m.fmt(bv)}</span>
      </div>`;
    }).join('');
  }

  el.innerHTML = `
    <div class="kars">
      <div class="kars-pick">
        <label>OYUNCU A</label>
        <select id="k-a">${optHtml(state.a)}</select>
        ${A ? `<div class="kars-head"><div><div class="kn">${A.name}</div><div class="kt">${A.team} · ${A.group}</div></div></div>` : ''}
      </div>
      <div class="kars-pick">
        <label>OYUNCU B</label>
        <select id="k-b">${optHtml(state.b)}</select>
        ${B ? `<div class="kars-head"><div><div class="kn">${B.name}</div><div class="kt">${B.team} · ${B.group}</div></div></div>` : ''}
      </div>
      ${A && B ? `<div style="grid-column: 1 / -1;">${barsHtml}</div>` : `<div style="grid-column: 1 / -1; text-align:center; padding:40px; font-family:var(--mono); font-size:10px; color:var(--ink-faint); text-transform:uppercase; letter-spacing:.2em;">İki oyuncu seç</div>`}
    </div>`;

  el.querySelector('#k-a').addEventListener('change', e => { state.a = e.target.value; render(el); });
  el.querySelector('#k-b').addEventListener('change', e => { state.b = e.target.value; render(el); });
}

async function init() {
  const el = document.getElementById('kars-container');
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
