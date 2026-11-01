// HPAnalytic — Spatio-Temporal Flow Engine (Canvas + Interactive)
import { gsap } from 'gsap';
import { DNA } from './theme.js';

export async function renderFlow(container, matchId) {
  const res = await fetch(`/assets/data/${matchId}/timeline.json`);
  const data = await res.json();
  
  // Oyuncu listesini çıkar
  const players = [...new Set(data.map(d => d.player))].filter(p => p).sort();
  
  container.innerHTML = `
    <div class="flow-wrapper" style="position:relative; width:100%; height:500px; background:${DNA.panel}; border:1px solid ${DNA.grid}; overflow:hidden;">
      
      <!-- Kontrol Paneli -->
      <div class="flow-controls" style="position:absolute; top:10px; left:10px; z-index:10; display:flex; gap:10px;">
        <select id="player-filter-${matchId}" style="background:${DNA.bg}; color:${DNA.neon}; border:1px solid ${DNA.neon}; padding:8px; font-family:${DNA.font}; font-size:12px; cursor:pointer;">
          <option value="all">TÜM OYUNCULAR</option>
          ${players.map(p => `<option value="${p}">${p}</option>`).join('')}
        </select>
      </div>

      <canvas id="flow-canvas-${matchId}" style="width:100%; height:100%;"></canvas>
      
      <!-- Zaman Çizelgesi -->
      <div class="flow-timeline" style="position:absolute; bottom:20px; left:20px; right:20px; display:flex; gap:20px; align-items:center; z-index:10;">
        <button id="play-btn-${matchId}" style="background:${DNA.neon}; color:${DNA.bg}; border:none; padding:8px 16px; font-family:${DNA.font}; font-weight:bold; cursor:pointer;">BAŞLAT</button>
        <div style="flex:1; height:2px; background:${DNA.grid}; position:relative;">
          <div id="progress-${matchId}" style="position:absolute; top:0; left:0; height:100%; width:0%; background:${DNA.orange};"></div>
        </div>
        <span id="time-${matchId}" style="font-family:${DNA.font}; color:${DNA.neon}; font-size:14px; min-width:50px; text-align:right;">00:00</span>
      </div>
    </div>`;

  const canvas = document.getElementById(`flow-canvas-${matchId}`);
  const ctx = canvas.getContext('2d');
  const playBtn = document.getElementById(`play-btn-${matchId}`);
  const filterSelect = document.getElementById(`player-filter-${matchId}`);
  const progressBar = document.getElementById(`progress-${matchId}`);
  const timeLabel = document.getElementById(`time-${matchId}`);

  // Boyutlandırma (Retina)
  const rect = canvas.parentElement.getBoundingClientRect();
  const width = rect.width || 600;
  const height = rect.height || 500;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const W = width;
  const H = height;
  const scaleX = W / 105;
  const scaleY = H / 68;
  const maxTime = data[data.length - 1].t;

  let particles = [];
  let currentIndex = 0;
  let isPlaying = false;
  let currentFilter = 'all';
  const clock = { t: 0 };
  let tween;

  filterSelect.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    // Filtre değişince sıfırla
    clock.t = 0; currentIndex = 0; particles = [];
    if (tween) tween.pause();
    isPlaying = false;
    playBtn.textContent = 'BAŞLAT';
    drawPitch();
    progressBar.style.width = '0%';
    timeLabel.textContent = '00:00';
  });

  function drawPitch() {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(30, 33, 29, 0.8)'; // DNA.grid şeffaf
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, W-20, H-20);
    ctx.beginPath(); ctx.moveTo(W/2, 10); ctx.lineTo(W/2, H-10); ctx.stroke();
    ctx.beginPath(); ctx.arc(W/2, H/2, 40, 0, Math.PI*2); ctx.stroke();
  }

  function updateParticles() {
    // Yeni eventleri ekle
    while (currentIndex < data.length && data[currentIndex].t <= clock.t) {
      const ev = data[currentIndex];
      if (currentFilter === 'all' || ev.player === currentFilter) {
        particles.push({
          x: ev.x * scaleX,
          y: ev.y * scaleY,
          life: 1.0,
          team: ev.team.toLowerCase()
        });
      }
      currentIndex++;
    }

    // Parçacıkları güncelle ve çiz
    for (let i = particles.length - 1; i >= 0; i--) {
      let p = particles[i];
      p.life -= 0.02; // Daha hızlı sönüm
      
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      let color = p.team.includes('galatasaray') ? DNA.neon : DNA.orange;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2 + (p.life * 4), 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = p.life;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  }

  function loop() {
    if (!isPlaying) return;
    drawPitch();
    updateParticles();
    
    const pct = (clock.t / maxTime) * 100;
    progressBar.style.width = `${pct}%`;
    
    const m = Math.floor(clock.t / 60);
    const s = Math.floor(clock.t % 60);
    timeLabel.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    if (clock.t < maxTime) {
      requestAnimationFrame(loop);
    }
  }

  playBtn.addEventListener('click', () => {
    if (isPlaying) {
      isPlaying = false;
      if (tween) tween.pause();
      playBtn.textContent = 'DEVAM';
    } else {
      isPlaying = true;
      playBtn.textContent = 'DURDUR';
      if (clock.t >= maxTime) {
        clock.t = 0; currentIndex = 0; particles = [];
      }
      
      // 90 dakikayı 30 saniyede bitir (3x hız)
      const remainingTime = maxTime - clock.t;
      tween = gsap.to(clock, {
        t: maxTime,
        duration: remainingTime / 3,
        ease: 'none',
        onComplete: () => {
          isPlaying = false;
          playBtn.textContent = 'TEKRAR';
        }
      });
      loop();
    }
  });

  drawPitch();
}
