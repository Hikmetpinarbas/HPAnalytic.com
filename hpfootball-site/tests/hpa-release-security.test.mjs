import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('internal content control is fail-closed in production',()=>{
 const route=read('src/pages/control/content.astro');
 assert.match(route,/if\s*\(\s*import\.meta\.env\.PROD\s*\)\s*return new Response\(null,\s*\{status:404/);
 assert.ok(route.indexOf('import.meta.env.PROD')<route.indexOf('loadControlItems'));
});
test('static assets declare essential baseline security headers',()=>{
 const headers=read('public/_headers');
 for(const name of ['Strict-Transport-Security','Content-Security-Policy','X-Content-Type-Options','X-Frame-Options'])assert.ok(headers.includes(name+':'),name);
});
test('control endpoint must not become a public content discovery surface',()=>{
 const route=read('src/pages/control/content.astro');
 assert.match(route,/x-robots-tag.*noindex/);
});
