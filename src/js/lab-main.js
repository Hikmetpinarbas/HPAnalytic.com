import './menu.js';
import './palette.js';
import { initShotMap } from '../charts/shotmap.js';
import { initPassNet } from '../charts/passnet.js';
import './lig.js';
import './oyuncular.js';
import './kars.js';

const inited = { shotmap: false, passnet: false };

function ensureShot() {
  if (inited.shotmap) return;
  inited.shotmap = true;
  initShotMap('shotmap-container', '');
}

function ensurePass() {
  if (inited.passnet) return;
  inited.passnet = true;
  initPassNet('passnet-container', '');
}

document.querySelectorAll('.lab-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.target;
    document.querySelectorAll('.lab-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.lab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById(target);
    if (panel) panel.classList.add('active');

    if (target === 'shotmap-container') ensureShot();
    if (target === 'passnet-container') ensurePass();
  });
});

window.addEventListener('load', () => {
  setTimeout(ensureShot, 100);
});
