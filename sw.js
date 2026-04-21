self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('yamli-store').then((cache) => {
      // Cache essential files, but don't fail if some are missing
      return cache.addAll([
        '/index.html',
        '/index.js',
        '/style.css',
        '/sw.js',
      ]).catch(err => {
        console.warn('Some files failed to cache:', err);
        // Continue even if caching fails
      });
    }).then(() => {
      console.log('Service Worker installed, skipping waiting');
      self.skipWaiting(); // Activate immediately
    }),
  );
});

// Listen for skip waiting message
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (e.data && e.data.type === 'CLAIM_CLIENTS') {
    self.clients.claim();
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
  console.log('[SW] Push event received:', e);
  
  let data = {};
  
  // Try to get data from the push event
  if (e.data) {
    try {
      // Try JSON first
      data = e.data.json();
      console.log('[SW] Push data (JSON):', data);
    } catch (jsonErr) {
      try {
        // Try text as fallback
        const text = e.data.text();
        console.log('[SW] Push data (text):', text);
        try {
          data = JSON.parse(text);
        } catch {
          data = { title: 'Yamli Mobile', body: text };
        }
      } catch (textErr) {
        console.error('[SW] Failed to parse push data:', textErr);
        data = { title: 'Yamli Mobile', body: 'New notification' };
      }
    }
  } else {
    console.log('[SW] No push data received, using default');
    // Try to get data from notification data if stored
    data = { title: 'Yamli Mobile', body: 'New notification received' };
  }
  
  // Ensure data has required fields
  const title = data.title || data.notification?.title || 'Yamli Mobile';
  const body = data.body || data.message || data.notification?.body || 'New notification';
  const icon = data.icon || './images/favicon/ms-icon-144x144.png';
  
  const options = {
    body: body,
    icon: icon,
    badge: './images/favicon/favicon-32x32.png',
    tag: data.tag || 'yamli-notification',
    requireInteraction: false,
    renotify: false,
    silent: false,
    actions: [
      { action: 'open', title: 'فتح', icon: './icon/home.svg' },
      { action: 'close', title: 'إغلاق', icon: './icon/cancel.svg' }
    ],
    data: data
  };
  
  console.log('[SW] Showing notification:', title, options);
  
  e.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('[SW] Notification shown successfully'))
      .catch(err => {
        console.error('[SW] Failed to show notification:', err);
        // Fallback: show simple notification
        return self.registration.showNotification('Yamli Mobile', {
          body: 'New notification',
          icon: './images/favicon/ms-icon-144x144.png'
        });
      })
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

