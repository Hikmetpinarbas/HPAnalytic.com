import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('obsidian shell and PWA share a dark theme',()=>{assert.match(read('src/styles/global.css'),/--bg-surface:\s*#07090B/);assert.equal(JSON.parse(read('public/manifest.webmanifest')).theme_color,'#0B0F12');});
test('global header preserves four accessible routes and geometric mark',()=>{const layout=read('src/layouts/BaseLayout.astro');const logo=read('src/components/Logo.astro');assert.match(layout,/<EditorialHeader navigation=/);assert.match(layout,/MobileNavigation/);assert.match(logo,/data-testid="brand-logo"/);for(const route of ['/analysis/','/research/','/about/','/archive/']) assert.ok(layout.includes(route));});
test('monograph rail has a guarded unpublished research proposal entry',()=>{const home=read('src/pages/index.astro');assert.match(home,/analysis-rail__track/);assert.match(home,/featuredMonographs.filter/);assert.match(home,/YAYIN BEKLİYOR/);});
