// ═══════════════════════════════════════════
//  FOREST OF NIGHTMARES — Service Worker
//  Enables offline PWA install on mobile
// ═══════════════════════════════════════════

const CACHE = 'forest-of-nightmares-v3';
const ASSETS = [
  './',
  './index.html',
  './app.html',
  './manifest.json',
  './icon.png',
  './icon-512.png',
  './threejs/three.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
