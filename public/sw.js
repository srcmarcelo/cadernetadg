// Caderneta Digital v2.0 - Lightweight PWA Service Worker
// Never caches API or Supabase calls so multi-device data is always fresh.

const CACHE_NAME = 'cadernetadg-static-v2';
const PRECACHE_ASSETS = ['/manifest.json', '/favicon.ico', '/icon-192x192.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Never intercept Supabase, OpenAI, Next API, or cross-origin requests
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/webpack-hmr')
  ) {
    return;
  }

  // Network-first for HTML/JSON/JS so updates are immediate; cache fallback only if offline
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
