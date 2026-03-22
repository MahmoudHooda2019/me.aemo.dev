/// <reference lib="es2020" />
/// <reference lib="webworker" />

const CACHE_NAME = 'aemo-dev-v2.1.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/images/icon.png',
  '/assets/images/ai2-logo.png',
  '/assets/images/kodular-logo.png',
  '/assets/images/telegram-logo.webp'
];

// Type definitions for Service Worker
interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
  waitUntil(promise: Promise<any>): void;
}

interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<any>): void;
}

declare const self: ServiceWorkerGlobalScope;

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(err => {
        console.error('[SW] Cache failed:', err);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API calls
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Cache strategy: Stale While Revalidate for assets, Network First for HTML
  if (request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    // Network First for HTML
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then(cached => {
            return cached || new Response('Offline', { status: 503 });
          });
        })
    );
  } else {
    // Stale While Revalidate for assets
    event.respondWith(
      caches.match(request).then(cached => {
        const fetchPromise = fetch(request)
          .then(response => {
            if (response.ok && response.type !== 'opaque') {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, clone);
              });
            }
            return response;
          })
          .catch(() => cached || new Response('Offline', { status: 503 }));

        return cached || fetchPromise;
      })
    );
  }
});

export {};
