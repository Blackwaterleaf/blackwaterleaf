// BlackwaterLeaf Service Worker v3.0
// Strategie: Network-First für Navigation, Cache-First für Assets + Bilder
// Offline-Fallback, Push-Notifications, Bild-Caching für /manus-storage/

const CACHE_VERSION = 'v3';
const CACHE_NAME = `blackwaterleaf-${CACHE_VERSION}`;
const IMAGE_CACHE = `blackwaterleaf-images-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Shell-URLs die beim Install gecacht werden
const PRECACHE_URLS = [
  '/',
  '/offline.html',
];

// ── Install: Shell + Offline-Fallback cachen ────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => {})
    )
  );
});

// ── Activate: Alte Caches aufräumen ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('blackwaterleaf-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: Strategien je nach Request-Typ ───────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Nur GET-Requests behandeln
  if (request.method !== 'GET') return;

  // API-Requests immer direkt ans Netz (nie cachen)
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/__manus__/')) return;

  // /manus-storage/ Bilder: Cache-First (30 Tage TTL)
  if (url.pathname.startsWith('/manus-storage/')) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          return cached || new Response('', { status: 503 });
        }
      })
    );
    return;
  }

  // Navigation (HTML-Seiten): Network-First mit Offline-Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offlinePage = await caches.match(OFFLINE_URL);
          if (offlinePage) return offlinePage;
          return caches.match('/') || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // Statische Assets (JS, CSS, Bilder, Fonts): Cache-First
  if (url.pathname.match(/\.(js|css|woff2?|ttf|otf|png|jpg|jpeg|webp|svg|ico)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok && response.type !== 'opaque') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => cached || new Response('', { status: 503 }));
      })
    );
    return;
  }

  // Alle anderen Requests: Network-First
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// ── Push Notifications ────────────────────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data = { title: 'BlackwaterLeaf', body: 'Neue Benachrichtigung', url: '/' };
  try { data = { ...data, ...event.data.json() }; } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/manus-storage/bl-icon-192_dce3d7d5.png',
      badge: '/manus-storage/bl-icon-192_dce3d7d5.png',
      data: { url: data.url },
      vibrate: [100, 50, 100],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
