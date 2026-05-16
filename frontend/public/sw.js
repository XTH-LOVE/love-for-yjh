const CACHE_NAME = 'love-yjh-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API requests and external resources
  if (url.pathname.startsWith('/api') || !url.origin.includes(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          event.waitUntil(
            fetch(request)
              .then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                  caches.open(CACHE_NAME)
                    .then(cache => cache.put(request, networkResponse.clone()));
                }
              })
              .catch(() => {})
          );
          return cachedResponse;
        }

        return fetch(request)
          .then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseToCache));
            return networkResponse;
          })
          .catch(() => {
            if (request.headers.get('accept')?.includes('text/html')) {
              return caches.match('/index.html');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Handle push notifications
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || '💕 有新消息！',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: [
      { action: 'open', title: '查看 💕' },
      { action: 'close', title: '关闭' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Love For YJH', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'close') return;
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow('/');
      })
  );
});
