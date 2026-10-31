export function initMatrixHero() {
  const hero = document.querySelector('.hero-diary') || document.querySelector('.hero');
  const heroCenter = document.querySelector('.hero-center');
  if (!hero || !heroCenter) return;

  if (document.getElementById('matrix-canvas')) return;

  // Canvas Ekle (Arka plan Matrix)
  const canvas = document.createElement('canvas');
  canvas.id = 'matrix-canvas';
  hero.prepend(canvas);
  const ctx = canvas.getContext('2d');
  
  function resize() {
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
  const fontSize = 14;
  let columns = canvas.width / fontSize;
  let drops = [];
  for (let i = 0; i < columns; i++) drops[i] = 1;

  function draw() {
    ctx.fillStyle = 'rgba(10, 10, 12, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#B4FF39';
    ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  setInterval(draw, 40);

  // Sadece o efsane cümle
  const manifesto = document.createElement('div');
  manifesto.className = 'matrix-manifesto';
  manifesto.innerHTML = `
    <h1 class="matrix-hero-title">
      Gerçeğin <em>çölüne</em><br>hoş geldiniz.
    </h1>
  `;
  
  heroCenter.appendChild(manifesto);
}
