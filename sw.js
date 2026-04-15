self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('yamli-store').then((cache) => cache.addAll([
      '/index.html',
      '/index.js',
      '/style.css',
      '/sw.js',
      '/script.js',
      '/audioPlayer.js',
      './image/med.png',
      './image/coran.png',
    ])).then(() => {
      self.skipWaiting(); // Activate immediately
    }),
  );
});

// Listen for skip waiting message
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (e) => {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});

// Push notification handling
self.addEventListener('push', (e) => {
  const data = e.data.json();
  const options = {
    body: data.body || 'Yamli Mobile notification',
    icon: './images/favicon/ms-icon-144x144.png',
    badge: './images/favicon/favicon-32x32.png',
    tag: data.tag || 'yamli-notification',
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'فتح', icon: './icon/home.svg' },
      { action: 'close', title: 'إغلاق', icon: './icon/cancel.svg' }
    ]
  };
  
  e.waitUntil(
    self.registration.showNotification(data.title || 'Yamli Mobile', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  
  if (e.action === 'open' || !e.action) {
    e.waitUntil(
      clients.openWindow('/')
    );
  }
});

