import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const layoutUrl = new URL('../src/layouts/BaseLayout.astro', import.meta.url);
const manifestUrl = new URL('../public/manifest.webmanifest', import.meta.url);

test('base layout declares the PWA manifest and standalone mobile metadata', async () => {
  const layout = await readFile(layoutUrl, 'utf8');
  assert.match(layout, /rel="manifest" href="\/manifest\.webmanifest"/);
  assert.match(layout, /name="mobile-web-app-capable" content="yes"/);
  assert.match(layout, /name="apple-mobile-web-app-capable" content="yes"/);
  assert.match(layout, /name="apple-mobile-web-app-status-bar-style"/);
  assert.match(layout, /rel="apple-touch-icon" href="\/icons\/hp-192\.png"/);
});

test('manifest defines the HPAnalytic standalone identity', async () => {
  const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
  assert.equal(manifest.name, 'HPAnalytic — Football Intelligence');
  assert.equal(manifest.short_name, 'HPAnalytic');
  // Installed-app continuity: the app id must not change with the rename,
  // otherwise Android treats the successor as a different app.
  assert.equal(manifest.id, '/');
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.theme_color, '#0B0F12');
  assert.equal(manifest.background_color, '#0B0F12');
  assert.equal(manifest.lang, 'tr');
});

test('manifest provides 192 and 512 pixel install icons including maskable coverage', async () => {
  const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
  const icons = manifest.icons || [];
  assert.ok(icons.some(x => x.src === '/icons/hp-192.png' && x.sizes === '192x192'));
  assert.ok(icons.some(x => x.src === '/icons/hp-512.png' && x.sizes === '512x512'));
  assert.ok(icons.some(x => String(x.purpose || '').includes('maskable')));
  await stat(new URL('../public/icons/hp-192.png', import.meta.url));
  await stat(new URL('../public/icons/hp-512.png', import.meta.url));
});

test('PWA successor has an explicit same-origin service-worker contract', async () => {
  const layout = await readFile(layoutUrl, 'utf8');
  assert.match(layout, /serviceWorker\.register\('\/sw\.js'/);
  const sw = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.match(sw, /url\.pathname\.startsWith\('\/studio\/'\)/);
  assert.match(sw, /request\.mode === 'navigate'/);
});
