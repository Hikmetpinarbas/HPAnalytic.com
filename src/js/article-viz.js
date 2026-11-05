import { initPassNetwork } from './viz/pass-network.js';
import { initTacticalMap } from './viz/tactical-map.js';
import { initGKDistribution } from './viz/gk-distribution.js';

document.addEventListener('DOMContentLoaded', () => {
  const targets = document.querySelectorAll('[data-visual-body]');
  
  targets.forEach((el) => {
    const type = el.dataset.visualBody;
    el.classList.add('viz-loading');

    try {
      el.classList.remove('viz-loading');
      el.classList.add('viz-active');
      el.innerHTML = ''; // Varsa eski çöpü temizle

      if (type === 'pass-network') {
        initPassNetwork(el);
      } 
      else if (type === 'tactical-map') {
        initTacticalMap(el);
      }
      else if (type === 'gk-distribution') {
        initGKDistribution(el);
      }
      else {
        // Bilinmeyen veya silinmiş tipleri sessizce yok et
        el.parentElement.style.display = 'none';
      }
    } catch (err) {
      console.error('Viz Hatası:', type, err);
      el.innerHTML = `<div style="color:#FF6B35;font-size:12px;">Görsel yüklenemedi: ${err.message}</div>`;
    }
  });
});
