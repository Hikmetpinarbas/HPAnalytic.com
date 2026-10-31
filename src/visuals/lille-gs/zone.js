const COLOR = { GS: '#FF6B35', LIL: '#6B9FE8' };

export async function render(container) {
  const data = await fetch('/assets/data/lille-gs/zone.json').then(r => r.json());
  const total = data.reduce((a,c)=>a+c.GS+c.LIL, 0);
  let cards = '';
  data.forEach((d, i) => {
    const sum = d.GS + d.LIL;
    const gsPct = sum > 0 ? Math.round(d.GS/sum*100) : 0;
    const lilPct = 100 - gsPct;
    cards += `<div class="lg-zone-card">
      <div class="lg-zone-idx">0${i+1}</div>
      <div class="lg-zone-lbl">${d.zone}</div>
      <div class="lg-zone-bar">
        <div class="lg-zone-gs" style="height:${gsPct}%"></div>
        <div class="lg-zone-lil" style="height:${lilPct}%"></div>
      </div>
      <div class="lg-zone-nums">
        <span style="color:${COLOR.GS}">${d.GS}</span>
        <span style="color:${COLOR.LIL}">${d.LIL}</span>
      </div>
    </div>`;
  });
  container.innerHTML = `
    <div class="lg-zone">
      <div class="lg-zone-head">
        <span style="color:${COLOR.GS}">■ Galatasaray</span>
        <span style="color:${COLOR.LIL}">■ Lille</span>
        <span style="font-family:var(--mono);font-size:9px;color:var(--ink-faint);letter-spacing:.14em">${total} aksiyon · 3 bölge</span>
      </div>
      <div class="lg-zone-grid">${cards}</div>
    </div>`;
}
