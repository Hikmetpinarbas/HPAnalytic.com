import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('chiaroscuro cascade has dark substrate and readable headings',()=>{const css=read('src/styles/global.css');assert.match(css,/background:#07090B !important/);assert.match(css,/h1,h2,h3,.stage-headline \{ color:#F3F5F7 !important/);assert.match(css,/border:1px solid #1E293B !important/);});
test('mobile header hides second navigation and drawer slides in',()=>{assert.match(read('src/components/EditorialHeader.astro'),/\.nav-links\{display:none !important\}/);const drawer=read('src/components/MobileNavigation.astro');assert.match(drawer,/@keyframes hp-drawer-in/);assert.match(drawer,/prefers-reduced-motion:reduce/);});
test('three research cards respect publication boundary',()=>{const home=read('src/pages/index.astro');assert.match(home,/Israrla Görmezden Gelme/);assert.match(home,/Halkın Metrikleri: xG ve xT Neyi Gizler/);assert.match(home,/YAYIN BEKLİYOR/);});
