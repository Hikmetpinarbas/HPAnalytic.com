/**
 * HPAnalytic Katman Motoru v1
 * Canvas tabanlı saha + katman yönetimi.
 * Her görselleştirme bir sahnedir; katmanlar üst üste bindirilir.
 */

const PITCH = { w: 105, h: 68, pad: 4 };
const COLORS = {
  bg: '#0a0a0c',
  line: 'rgba(180,255,57,0.18)',
  shot: '#FF6B35',
  goal: '#FFFFFF',
  pass: 'rgba(180,255,57,0.25)',
  loss: 'rgba(255,107,53,0.5)'
};

export class PitchScene {
  constructor(container, opts = {}) {
    this.el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.el) throw new Error('PitchScene: container bulunamadı');
    this.layers = new Map();
    this.opts = { aspect: 68 / 105, ...opts };
    this.init();
  }

  init() {
    const rect = this.el.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.el.style.position = 'relative';
    this.el.style.background = COLORS.bg;
    this.el.style.aspectRatio = `${PITCH.w} / ${PITCH.h}`;

    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    this.ctx = this.canvas.getContext('2d');
    this.el.appendChild(this.canvas);

    this.overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.overlay.setAttribute('viewBox', `0 0 ${PITCH.w} ${PITCH.h}`);
    this.overlay.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    this.overlay.setAttribute('preserveAspectRatio', 'none');
    this.el.appendChild(this.overlay);

    this.resize();
    // ResizeObserver — sadece kendi container'ı boyut değiştirdiğinde
    if (typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => this.resize());
      this._ro.observe(this.el);
    }
    this.drawBase();
  }

  resize() {
    const rect = this.el.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const newW = Math.round(rect.width);
    const newH = Math.round(rect.height);
    // Eşik: 4px'ten az değişim canvas'ı sıfırlamasın
    if (this.w && Math.abs(this.w - newW) < 4 && Math.abs(this.h - newH) < 4) {
      return;
    }
    this.canvas.width = newW * dpr;
    this.canvas.height = newH * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = newW;
    this.h = newH;
    this.drawBase();
  }

  /** Koordinat dönüşümü: saha (105×68) → piksel */
  px(x, y) {
    return {
      x: (x / PITCH.w) * this.w,
      y: (y / PITCH.h) * this.h
    };
  }

  drawBase() {
    if (!this.w) return;
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);

    // Çizgi kalınlığı ölçekli
    const lw = Math.max(1, w / 500);
    ctx.strokeStyle = COLORS.line;
    ctx.lineWidth = lw;

    // Dış çerçeve
    this.rect(0, 0, PITCH.w, PITCH.h);
    // Orta çizgi
    this.line(PITCH.w/2, 0, PITCH.w/2, PITCH.h);
    // Orta yuvarlak
    const c = this.px(PITCH.w/2, PITCH.h/2);
    ctx.beginPath();
    ctx.arc(c.x, c.y, (9.15 / PITCH.w) * w, 0, Math.PI * 2);
    ctx.stroke();

    // Ceza sahaları (16.5 derinlik, 40.32 genişlik)
    const boxTop = this.px(0, 13.84);
    const boxBot = this.px(0, 54.16);
    this.rect(0, 13.84, 16.5, 40.32);
    this.rect(PITCH.w - 16.5, 13.84, 16.5, 40.32);
    // Kale alanları (5.5 derinlik, 18.32 genişlik)
    this.rect(0, 24.84, 5.5, 18.32);
    this.rect(PITCH.w - 5.5, 24.84, 5.5, 18.32);
  }

  rect(x, y, w, h) {
    const a = this.px(x, y), b = this.px(x + w, y + h);
    this.ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
  }

  line(x1, y1, x2, y2) {
    const a = this.px(x1, y1), b = this.px(x2, y2);
    this.ctx.beginPath();
    this.ctx.moveTo(a.x, a.y);
    this.ctx.lineTo(b.x, b.y);
    this.ctx.stroke();
  }

  /** Bir katman ekle: ad, çizim fonksiyonu, opsiyonlar */
  addLayer(name, drawFn, opts = {}) {
    this.layers.set(name, { drawFn, opts, visible: true });
    this.render();
  }

  toggleLayer(name, visible) {
    const l = this.layers.get(name);
    if (l) { l.visible = visible ?? !l.visible; this.render(); }
  }

  removeLayer(name) {
    this.layers.delete(name);
    this.render();
  }

  render() {
    if (!this.w) return;
    this.drawBase();
    const { ctx, w, h } = this;
    for (const [name, layer] of this.layers) {
      if (!layer.visible) continue;
      ctx.save();
      try { layer.drawFn({ ctx, w, h, px: this.px.bind(this), scene: this }); }
      catch (e) { console.warn(`Katman "${name}" çizilemedi:`, e); }
      ctx.restore();
    }
  }

  /** Nokta çiz (şut, pas başlangıcı vb.) */
  dot(x, y, radiusPx, color, alpha = 1) {
    const p = this.px(x, y);
    const { ctx } = this;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radiusPx, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
