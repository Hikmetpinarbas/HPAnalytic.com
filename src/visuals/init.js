import { renderShotMap } from './shot-map.js';
import { renderPassNetwork } from './pass-network.js';
import { renderAttackFlow } from './attack-flow.js';
import { render as renderLilleShot } from './lille-gs/shot-map.js';
import { render as renderRhythm } from './lille-gs/rhythm.js';
import { render as renderCorridor } from './lille-gs/corridor.js';
import { render as renderZone } from './lille-gs/zone.js';
import { render as renderXtGrid } from './xt-grid.js';
import { render as renderXgFlow } from './xg-flow.js';

const RENDERERS = {
  'shot-map': renderShotMap,
  'pass-network': renderPassNetwork,
  'attack-flow': (el) => { renderAttackFlow(el); return Promise.resolve(); },
  'lgs-shot': renderLilleShot,
  'lgs-rhythm': renderRhythm,
  'lgs-corridor': renderCorridor,
  'lgs-zone': renderZone,
  'xt-grid': renderXtGrid,
  'xg-flow': renderXgFlow,
};

async function init() {
  for (const el of document.querySelectorAll('[data-visual-body]')) {
    const fn = RENDERERS[el.dataset.visualBody];
    if (!fn) continue;
    try { await fn(el); }
    catch (e) { el.innerHTML = `<div class="visual-error">Yüklenemedi: ${el.dataset.visualBody}</div>`; console.error(e); }
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
