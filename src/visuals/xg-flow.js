const COLOR = { GS: '#FF6B35', LIL: '#6B9FE8' };

export async function render(container) {
  const data = await fetch('/assets/data/lille-gs/xg_flow.json').then(r => r.json());
  const gs = data.GS, lil = data.LIL;
  const maxMin = Math.max(...gs.map(p=>p.minute), ...lil.map(p=>p.minute), 90);
  const maxXg = Math.max(...gs.map(p=>p.cumulative), ...lil.map(p=>p.cumulative), 1) * 1.1;

  const W = 900, H = 420, PAD = 50;
  const sx = (W - PAD*2) / maxMin;
  const sy = (H - PAD*2) / maxXg;
  const px = m => PAD + m * sx;
  const py = v => H - PAD - v * sy;

  let gsPath = `M ${px(0)} ${py(0)}`;
  for (const p of gs) gsPath += ` L ${px(p.minute)} ${py(p.cumulative)}`;
  gsPath += ` L ${px(maxMin)} ${py(gs[gs.length-1].cumulative)}`;

  let lilPath = `M ${px(0)} ${py(0)}`;
  for (const p of lil) lilPath += ` L ${px(p.minute)} ${py(p.cumulative)}`;
  lilPath += ` L ${px(maxMin)} ${py(lil[lil.length-1].cumulative)}`;

  let svg = `<svg viewBox="0 0 ${W} ${H}" class="xgf-svg" xmlns="http://www.w3.org/2000/svg">`;

  // Grid
  for (let i = 0; i <= 4; i++) {
    const y = PAD + (H-PAD*2) * i / 4;
    svg += `<line x1="${PAD}" y1="${y}" x2="${W-PAD}" y2="${y}" stroke="rgba(180,255,57,0.06)"/>`;
    svg += `<text x="${PAD-8}" y="${y+4}" text-anchor="end" font-family="JetBrains Mono" font-size="9" fill="var(--ink-faint)">${(maxXg*(1-i/4)).toFixed(1)}</text>`;
  }
  for (let m = 0; m <= maxMin; m += 15) {
    svg += `<text x="${px(m)}" y="${H-PAD+16}" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="var(--ink-faint)">${m}'</text>`;
  }

  // Çizgiler
  svg += `<path d="${gsPath}" fill="none" stroke="${COLOR.GS}" stroke-width="2.5"/>`;
  svg += `<path d="${lilPath}" fill="none" stroke="${COLOR.LIL}" stroke-width="2.5"/>`;

  // Şut noktaları + gol yıldızları
  for (const p of gs) {
    if (p.is_goal) {
      const cx = px(p.minute), cy = py(p.cumulative);
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI / 5) - Math.PI / 2;
        const r = i % 2 === 0 ? 7 : 3.2;
        pts.push(`${cx+Math.cos(a)*r},${cy+Math.sin(a)*r}`);
      }
      svg += `<polygon points="${pts.join(' ')}" fill="${COLOR.GS}"/>`;
    } else {
      svg += `<circle cx="${px(p.minute)}" cy="${py(p.cumulative)}" r="3" fill="${COLOR.GS}" opacity="0.7"/>`;
    }
  }
  for (const p of lil) {
    if (p.is_goal) {
      const cx = px(p.minute), cy = py(p.cumulative);
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI / 5) - Math.PI / 2;
        const r = i % 2 === 0 ? 7 : 3.2;
        pts.push(`${cx+Math.cos(a)*r},${cy+Math.sin(a)*r}`);
      }
      svg += `<polygon points="${pts.join(' ')}" fill="${COLOR.LIL}"/>`;
    } else {
      svg += `<circle cx="${px(p.minute)}" cy="${py(p.cumulative)}" r="3" fill="${COLOR.LIL}" opacity="0.7"/>`;
    }
  }

  svg += '</svg>';

  container.innerHTML = `
    <div class="xgf-wrap">
      <div class="xgf-head">
        <div class="xgf-tot"><span class="n" style="color:${COLOR.GS}">${data.totals.GS}</span><span class="l">GS xG</span></div>
        <div class="xgf-tot"><span class="n" style="color:${COLOR.LIL}">${data.totals.LIL}</span><span class="l">Lille xG</span></div>
        <div class="xgf-tot"><span class="n">4-2</span><span class="l">skor</span></div>
        <div class="xgf-tot"><span class="n">+${(4 - data.totals.GS).toFixed(1)}</span><span class="l">GS finishing</span></div>
      </div>
      <div class="xgf-stage">${svg}</div>
      <div class="xgf-legend">
        <span style="color:${COLOR.GS}">─ Galatasaray xG akışı</span>
        <span style="color:${COLOR.LIL}">─ Lille xG akışı</span>
        <span style="color:var(--ink-faint);font-size:9px">★ = gol · ● = şut</span>
      </div>
      <div class="xgf-note">xG vekil: XLSX oyuncu xG'si / oyuncu şut sayısı. Kümülatif eğri, maç boyu ne zaman tehdit ürettiğini gösterir. GS 4 gol, 1.58 xG → +2.4 finishing farkı.</div>
    </div>`;
}
