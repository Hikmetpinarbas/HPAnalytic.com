const COLOR = { GS: '#FF6B35', LIL: '#6B9FE8' };

export async function render(container) {
  const data = await fetch('/assets/data/lille-gs/rhythm.json').then(r => r.json());
  const blocks = data.map(d => d.range);
  const actions = ['Pas', 'Şut', 'Top Kazanımı', 'Top Kaybı', 'Dribling', 'İkili Mücadele'];

  // Toplam aksiyon per blok per takım
  const gsTotals = data.map(b => Object.values(b.GS).reduce((a,c)=>a+c, 0));
  const lilTotals = data.map(b => Object.values(b.LIL).reduce((a,c)=>a+c, 0));
  const max = Math.max(...gsTotals, ...lilTotals, 1);

  const W = 900, H = 340, PAD = 40;
  const bw = (W - PAD*2) / data.length;

  let svg = `<svg viewBox="0 0 ${W} ${H}" class="lg-rhythm-svg" xmlns="http://www.w3.org/2000/svg">`;
  // Grid çizgileri
  for (let i = 0; i <= 4; i++) {
    const y = PAD + (H-PAD*2) * i / 4;
    svg += `<line x1="${PAD}" y1="${y}" x2="${W-PAD}" y2="${y}" stroke="rgba(180,255,57,0.06)" stroke-width="1"/>`;
  }

  data.forEach((b, i) => {
    const x = PAD + bw * i;
    const cw = bw * 0.35;
    const gh = (gsTotals[i] / max) * (H-PAD*2);
    const lh = (lilTotals[i] / max) * (H-PAD*2);
    svg += `<rect class="lg-bar" data-idx="${i}" x="${x + bw*0.08}" y="${H-PAD-gh}" width="${cw}" height="${gh}" fill="${COLOR.GS}" opacity="0.85"/>`;
    svg += `<rect class="lg-bar" data-idx="${i}" x="${x + bw*0.52}" y="${H-PAD-lh}" width="${cw}" height="${lh}" fill="${COLOR.LIL}" opacity="0.85"/>`;
    svg += `<text x="${x + bw/2}" y="${H-PAD+18}" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="var(--ink-faint)">${b.range}'</text>`;
    svg += `<text x="${x + bw*0.08 + cw/2}" y="${H-PAD-gh-6}" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="${COLOR.GS}">${gsTotals[i]}</text>`;
    svg += `<text x="${x + bw*0.52 + cw/2}" y="${H-PAD-lh-6}" text-anchor="middle" font-family="JetBrains Mono" font-size="9" fill="${COLOR.LIL}">${lilTotals[i]}</text>`;
  });
  svg += '</svg>';

  container.innerHTML = `
    <div class="lg-rhythm">
      <div class="lg-rhythm-legend">
        <span style="color:${COLOR.GS}">■ Galatasaray</span>
        <span style="color:${COLOR.LIL}">■ Lille</span>
        <span style="color:var(--ink-faint);font-size:9px">Toplam takım aksiyonu (pas, şut, kazanım, kayıp, dribling, mücadele)</span>
      </div>
      <div class="lg-rhythm-stage">${svg}</div>
      <div class="lg-rhythm-detail" id="lg-rd">
        <div class="lg-rd-inner">
          <span class="lg-rd-lbl">Detay için blok üstüne gel</span>
        </div>
      </div>
    </div>`;

  const detail = container.querySelector('#lg-rd');
  container.querySelectorAll('.lg-bar').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const idx = +el.dataset.idx;
      const b = data[idx];
      detail.innerHTML = `<div class="lg-rd-inner">
        <div class="lg-rd-blk">${b.range}'</div>
        <div class="lg-rd-row" style="color:${COLOR.GS}">
          <b>Galatasaray</b> · ${Object.entries(b.GS).map(([k,v])=>`${k}: ${v}`).join(' · ') || '—'}
        </div>
        <div class="lg-rd-row" style="color:${COLOR.LIL}">
          <b>Lille</b> · ${Object.entries(b.LIL).map(([k,v])=>`${k}: ${v}`).join(' · ') || '—'}
        </div>
      </div>`;
    });
  });
}
