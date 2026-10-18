import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const get=(name)=>readFileSync(new URL('../'+name, import.meta.url),'utf8');
test('site, PWA, and browser chrome use consistent light tokens',()=>{
 const layout=get('src/layouts/BaseLayout.astro'), css=get('src/styles/global.css');
 const manifest=JSON.parse(get('public/manifest.webmanifest'));
 assert.match(css,/color-scheme:\s*light/);
 assert.match(layout,/name="theme-color" content="#F5F1E8"/);
 assert.equal(manifest.theme_color,'#F5F1E8');
 assert.equal(manifest.background_color,'#F5F1E8');
});
test('sharing card exists and matches declared metadata',()=>{
 const layout=get('src/layouts/BaseLayout.astro');
 assert.match(layout,/og:image:width" content="1200"/);
 assert.match(layout,/og:image:height" content="630"/);
 assert.ok(existsSync(new URL('../public/social-card.png', import.meta.url)));
});
test('navigation icons are decorative, motion remains nonblocking',()=>{
 const layout=get('src/layouts/BaseLayout.astro');
 const icon=get('src/components/NavigationIcon.astro');
 assert.match(icon,/aria-hidden="true"/);
 assert.match(layout,/IntersectionObserver/);
 assert.match(layout,/prefers-reduced-motion: reduce/);
 assert.match(layout,/self\.unobserve\(entry\.target\)/);
});
