export async function renderStarCards(container, matchSlug) {
  if (!container) return;

  let stars = null;
  try {
    const r = await fetch(`/assets/data/${matchSlug}/stars.json`);
    if (r.ok) stars = await r.json();
  } catch {}

  if (!stars) {
    container.innerHTML = '<p style="color:#8A8A93;font-family:JetBrains Mono,monospace;">Yıldız verisi bulunamadı.</p>';
    return;
  }

  const title = document.createElement('div');
  title.innerHTML = '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;letter-spacing:.25em;color:#B4FF39;margin-bottom:16px;">MAÇIN YILDIZLARI</div>';
  container.appendChild(title);

  const grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;';

  stars.forEach(s => {
    const card = document.createElement('div');
    card.style.cssText = "background:#0D0E12;border:1px solid #1E211D;border-radius:4px;padding:24px;font-family:'JetBrains Mono',monospace;color:#F4F2EC;position:relative;transition:border-color .2s;";
    card.onmouseenter = () => card.style.borderColor = '#B4FF39';
    card.onmouseleave = () => card.style.borderColor = '#1E211D';
    card.innerHTML = `
      <div style="color:#B4FF39;font-size:10px;letter-spacing:2.5px;margin-bottom:14px;">${s.label}</div>
      <div style="font-family:'Newsreader',serif;font-size:22px;line-height:1.1;margin-bottom:4px;">${s.player}</div>
      <div style="color:#8A8A93;font-size:10px;letter-spacing:1.5px;margin-bottom:20px;text-transform:uppercase;">${s.team}</div>
      <div style="font-size:32px;font-weight:600;color:#B4FF39;line-height:1;letter-spacing:-.02em;">${s.metric_big}</div>
      <div style="color:#8A8A93;font-size:10px;letter-spacing:1.5px;margin-top:6px;text-transform:uppercase;">${s.metric_label}</div>
      <div style="height:1px;background:#1E211D;margin:16px 0;"></div>
      <div style="color:#C8C8C8;font-size:12px;line-height:1.6;font-family:'Newsreader',serif;font-style:italic;">${s.note}</div>
    `;
    grid.appendChild(card);
  });

  container.appendChild(grid);
}
