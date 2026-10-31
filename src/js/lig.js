const f = v => (v == null || isNaN(Number(v))) ? 0 : Number(v);
const tshort = n => (n||'').slice(0, 3).toUpperCase();

async function getJSON(p) {
  try { const r = await fetch(p); return r.ok ? r.json() : null; } catch { return null; }
}

function renderLig(rankings, teams, el) {
  const fin = (rankings.finishing_delta || []).slice(0, 8);
  const cre = (rankings.creativity_p90 || []).slice(0, 8);
  const comp = ['FW','W','MF','FB','CB'].map(g => rankings['composite_'+g]?.[0]).filter(Boolean);
  const xgTop = [...teams].sort((a,b) => f(b.xg_dominance) - f(a.xg_dominance)).slice(0, 5);

  el.innerHTML = `
    <div class="lig-grid">
      <div class="lig-big">
        <div class="lbl">LİG LİDERİ · xG FARKI</div>
        <div class="val">+${f(xgTop[0]?.xg_dominance).toFixed(1)}</div>
        <div class="sub">${xgTop[0]?.name || '—'}</div>
        <div class="desc">Atılan beklenen gol, verilen beklenen golden bu kadar fazla.</div>
      </div>

      <div class="lig-card">
        <div class="hd"><h4>Bitiricilik Farkı</h4><span>Gol − xG</span></div>
        ${fin.map((p, i) => `
          <div class="tx-row" style="grid-template-columns:18px 1fr 42px;">
            <span class="tx-pos">${i+1}</span>
            <span class="tx-name">${p.name}</span>
            <span class="tx-val pos">${f(p.finishing_delta)>=0?'+':''}${f(p.finishing_delta).toFixed(2)}</span>
          </div>`).join('')}
      </div>

      <div class="lig-card">
        <div class="hd"><h4>Yaratıcılık /90</h4><span>xA + kilit + fırsat</span></div>
        ${cre.map((p, i) => `
          <div class="tx-row" style="grid-template-columns:18px 1fr 42px;">
            <span class="tx-pos">${i+1}</span>
            <span class="tx-name">${p.name}</span>
            <span class="tx-val pos">${f(p.creativity_p90).toFixed(2)}</span>
          </div>`).join('')}
      </div>

      <div class="lig-card">
        <div class="hd"><h4>Pozisyonun En İyisi</h4><span>Kompozit</span></div>
        ${comp.map((p, i) => `
          <div class="tx-row" style="grid-template-columns:22px 1fr 42px;">
            <span class="tx-group">${p.group}</span>
            <span class="tx-name">${p.name}</span>
            <span class="tx-val pos">${f(p.composite).toFixed(1)}</span>
          </div>`).join('')}
      </div>

      <div class="lig-card" style="grid-column: span 1;">
        <div class="hd"><h4>Takım xG Dominance</h4><span>İlk 5</span></div>
        ${xgTop.map((t, i) => `
          <div class="tx-row" style="grid-template-columns:18px 1fr 42px;">
            <span class="tx-pos">${i+1}</span>
            <span class="tx-name">${t.name}</span>
            <span class="tx-val pos">+${f(t.xg_dominance).toFixed(1)}</span>
          </div>`).join('')}
      </div>
    </div>`;
}

async function initLig() {
  const el = document.getElementById('lig-container');
  if (!el || el.dataset.ready === '1') return;
  el.dataset.ready = '1';
  const [r, t] = await Promise.all([
    getJSON('/assets/data/sl_rankings.json'),
    getJSON('/assets/data/sl_teams.json')
  ]);
  if (!r || !t) { el.innerHTML = '<div class="sl-empty">Veri yok</div>'; return; }
  renderLig(r, t, el);
}

(function boot() {
  const go = () => initLig();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else setTimeout(go, 300);
  if (import.meta && import.meta.hot) import.meta.hot.accept(() => go());
})();
