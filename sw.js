// =========================================================================================
// PROSTRACK SERVICE WORKER ENGINE
// Version Alignment Reference Tracking: v7.7.1
// =========================================================================================

const CACHE_NAME = 'prostrack-cache-v7.7.1';
const urlsToCache = [
  'index.html',
  'manifest.json',
  'sw.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          const networkFetch = fetch(event.request).then(networkResponse => {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => null);
          return cachedResponse || networkFetch;
        });
      })
    );
  }
});
