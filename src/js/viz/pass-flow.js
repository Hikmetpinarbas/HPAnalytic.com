/**
 * HPAnalytic Pass Flow (Parçacık Akış Alanı) Katmanı
 * Pas verilerinden bir vektör alanı oluşturur ve parçacıkları bu alan boyunca hareket ettirir.
 */

export class PassFlowLayer {
  constructor(scene, passes, options = {}) {
    this.scene = scene;
    this.passes = passes;
    this.opts = {
      particleCount: 800,
      speed: 1.2,
      trailLength: 6,
      color: 'rgba(180,255,57,0.15)',
      gridSize: 12,
      ...options
    };

    this.grid = [];
    this.particles = [];
    this.raf = null;
    this.running = false;

    this.buildGrid();
    this.initParticles();
    this.start();
  }

  buildGrid() {
    const { w, h } = this.scene;
    const cols = Math.ceil(105 / this.opts.gridSize);
    const rows = Math.ceil(68 / this.opts.gridSize);
    this.grid = Array.from({ length: rows }, () => 
      Array.from({ length: cols }, () => ({ vx: 0, vy: 0, count: 0 }))
    );

    this.passes.forEach(p => {
      const dx = p.end_x - p.start_x;
      const dy = p.end_y - p.start_y;
      const len = Math.hypot(dx, dy);
      if (len < 1) return;

      const steps = Math.ceil(len / this.opts.gridSize);
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = p.start_x + dx * t;
        const y = p.start_y + dy * t;
        const gx = Math.floor(x / this.opts.gridSize);
        const gy = Math.floor(y / this.opts.gridSize);
        if (this.grid[gy] && this.grid[gy][gx]) {
          const cell = this.grid[gy][gx];
          cell.vx += dx / len;
          cell.vy += dy / len;
          cell.count++;
        }
      }
    });

    this.grid.forEach(row => row.forEach(cell => {
      if (cell.count > 0) {
        cell.vx /= cell.count;
        cell.vy /= cell.count;
      }
    }));
  }

  getVector(x, y) {
    const gx = Math.floor(x / this.opts.gridSize);
    const gy = Math.floor(y / this.opts.gridSize);
    if (!this.grid[gy] || !this.grid[gy][gx]) return null;
    return this.grid[gy][gx];
  }

  initParticles() {
    const { w, h } = this.scene;
    for (let i = 0; i < this.opts.particleCount; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        hist: []
      });
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      this.update();
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }

  update() {
    const { w, h } = this.scene;
    const { speed } = this.opts;
    this.particles.forEach(p => {
      const pitchX = (p.x / w) * 105;
      const pitchY = (p.y / h) * 68;
      const vec = this.getVector(pitchX, pitchY);
      if (vec && (vec.vx !== 0 || vec.vy !== 0)) {
        p.x += vec.vx * speed;
        p.y += vec.vy * speed;
      } else {
        p.x += (Math.random() - 0.5) * 0.5;
        p.y += (Math.random() - 0.5) * 0.5;
      }

      if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
        p.x = Math.random() * w;
        p.y = Math.random() * h;
        p.hist = [];
      } else {
        p.hist.push({ x: p.x, y: p.y });
        if (p.hist.length > this.opts.trailLength) p.hist.shift();
      }
    });
  }

  draw() {
    const { ctx } = this.scene;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = this.opts.color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    this.particles.forEach(p => {
      if (p.hist.length < 2) return;
      ctx.moveTo(p.hist[0].x, p.hist[0].y);
      for (let i = 1; i < p.hist.length; i++) {
        ctx.lineTo(p.hist[i].x, p.hist[i].y);
      }
    });
    ctx.stroke();
    ctx.restore();
  }

  destroy() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.particles = [];
  }
}
