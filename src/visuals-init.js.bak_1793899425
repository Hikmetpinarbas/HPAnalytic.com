// HPAnalytic — sayfa yüklenince [data-visual-body] olan div'leri render et
import { renderPassNetwork } from './visuals/pass-network.js';
import { renderShotMap } from './visuals/shot-map.js';
import { render as renderXtGrid } from './visuals/xt-grid.js';
import { render as renderXgFlow } from './visuals/xg-flow.js';

const RENDERERS = {
  'pass-network': renderPassNetwork,
  'shot-map': renderShotMap,
  'xt-grid': renderXtGrid,
  'xg-flow': renderXgFlow,
};

async function initVisuals() {
  for (const el of document.querySelectorAll('[data-visual-body]')) {
    const type = el.dataset.visualBody;
    const fn = RENDERERS[type];
    if (!fn) { console.warn(`[visuals] ${type} renderer yok`); continue; }
    try { await fn(el); }
    catch(e) { console.error(`[visuals] ${type} hata:`, e); el.innerHTML = `<div style="padding:20px;color:#c00">Görsel yüklenemedi: ${type}</div>`; }
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initVisuals);
else initVisuals();
