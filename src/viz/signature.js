// HPAnalytic — İMZA EFEKT: xG / xGOT / xT akışı morph.
// Blanca De-La-Cruz-Torres (xGOT) çizgisi görselleşir.
// Plugin yok, saf attr.d interpolasyonu.
import { gsap } from 'gsap';

export function initSignature() {
  const svg = document.querySelector('[data-hp-signature]');
  if (!svg) return;
  const path = svg.querySelector('.hp-sig-path');
  const area = svg.querySelector('.hp-sig-area');
  const tabs = svg.closest('section')?.querySelectorAll('[data-layer]') || [];
  if (!path || !area) return;

  const layers = {
    xg:   [0,0.05,0.12,0.12,0.28,0.35,0.55,0.55,0.85,1.4,1.8,2.1,2.4,2.9,3.2,3.45],
    xgot: [0,0.04,0.10,0.10,0.22,0.30,0.48,0.50,0.75,1.2,1.55,1.85,2.1,2.55,2.9,3.10],
    xt:   [0,0.08,0.18,0.22,0.42,0.55,0.78,0.85,1.15,1.8,2.4,2.85,3.15,3.6,3.9,4.15]
  };

  const W = 800, H = 320, PAD = 40, N = 16, MAX = 4.5;
  const xOf = (i) => PAD + (W - 2*PAD) * (i / (N - 1));
  const yOf = (v) => H - PAD - (H - 2*PAD) * (v / MAX);

  const pathFrom = (vals) => {
    let d = `M ${xOf(0)} ${yOf(vals[0])}`;
    for (let i = 1; i < N; i++) d += ` L ${xOf(i)} ${yOf(vals[i])}`;
    return d;
  };
  const areaFrom = (vals) => {
    let d = `M ${xOf(0)} ${H - PAD}`;
    for (let i = 0; i < N; i++) d += ` L ${xOf(i)} ${yOf(vals[i])}`;
    d += ` L ${xOf(N-1)} ${H - PAD} Z`;
    return d;
  };

  const setPath = gsap.quickSetter(path, 'attr', 'd');
  const setArea = gsap.quickSetter(area, 'attr', 'd');
  let current = layers.xg.slice();
  const render = (v) => { setPath(pathFrom(v)); setArea(areaFrom(v)); };
  render(current);

  const morph = (target, dur = 1.2) => {
    const from = current.slice();
    const to = target.slice();
    const o = { t: 0 };
    gsap.to(o, {
      t: 1, duration: dur, ease: 'power3.inOut',
      onUpdate: () => {
        current = from.map((v, i) => v + (to[i] - v) * o.t);
        render(current);
      }
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      const k = tab.getAttribute('data-layer');
      if (layers[k]) morph(layers[k]);
    });
  });

  let fired = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && !fired) {
        fired = true;
        setTimeout(() => morph(layers.xgot, 1.6), 250);
      }
    });
  }, { threshold: 0.4 });
  io.observe(svg);
}
