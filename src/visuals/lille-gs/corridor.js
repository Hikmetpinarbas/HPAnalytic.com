const COLOR = { GS: '#FF6B35', LIL: '#6B9FE8' };

export async function render(container) {
  const data = await fetch('/assets/data/lille-gs/corridor.json').then(r => r.json());
  const total = data.reduce((a,c)=>a+c.GS+c.LIL, 0);

  let rows = '';
  data.forEach(d => {
    const sum = d.GS + d.LIL;
    const gsPct = sum > 0 ? (d.GS / sum * 100) : 50;
    rows += `<div class="lg-cor-row">
      <div class="lg-cor-lbl">${d.corridor}</div>
      <div class="lg-cor-bar">
        <div class="lg-cor-gs" style="width:${gsPct}%"></div>
        <div class="lg-cor-lil" style="width:${100-gsPct}%"></div>
      </div>
      <div class="lg-cor-vals">
        <span style="color:${COLOR.GS}">${d.GS}</span>
        <span style="color:${COLOR.LIL}">${d.LIL}</span>
      </div>
    </div>`;
  });

  container.innerHTML = `
    <div class="lg-cor">
      <div class="lg-cor-head">
        <span style="color:${COLOR.GS}">■ GS</span>
        <span style="color:${COLOR.LIL}">■ Lille</span>
        <span style="font-family:var(--mono);font-size:9px;letter-spacing:.14em;color:var(--ink-faint)">Toplam ${total} aksiyon · 5 dilim</span>
      </div>
      <div class="lg-cor-body">${rows}</div>
    </div>`;
}
