const CACHE = 'hpanalytic-shell-v2';
const SHELL = ['/', '/manifest.webmanifest', '/favicon.svg', '/icons/hp-192.png', '/icons/hp-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/studio/') || url.pathname.startsWith('/control/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok && response.type === 'basic') { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(request, copy)); }
          return response;
        })
        .catch(async () => (await caches.match(request)) || new Response('HPAnalytic — Bu sayfa çevrimdışı kullanılamıyor.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (!response || response.status !== 200 || response.type !== 'basic') return response;
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy));
      return response;
    }))
  );
});
