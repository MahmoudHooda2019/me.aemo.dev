const CACHE_NAME = 'aemo-dev-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/extensions/extensions.js',
  '/extensions/extensions.json',
  '/images/icon.png',
  '/images/ai2-logo.png',
  '/images/kodular-logo.png',
  '/images/telegram-logo.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});