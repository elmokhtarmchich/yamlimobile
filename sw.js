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
  console.log('Push event received:', e);
  
  try {
    let data = {};
    
    if (e.data) {
      try {
        data = e.data.json();
        console.log('Push data:', data);
      } catch (parseErr) {
        console.error('Failed to parse push data:', parseErr);
        data = { title: 'Yamli Mobile', body: 'New notification' };
      }
    } else {
      console.log('No push data, using default');
      data = { title: 'Yamli Mobile', body: 'New notification' };
    }
    
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
    
    console.log('Showing notification:', data.title, options);
    
    e.waitUntil(
      self.registration.showNotification(data.title || 'Yamli Mobile', options)
        .then(() => console.log('Notification shown successfully'))
        .catch(err => console.error('Failed to show notification:', err))
    );
  } catch (err) {
    console.error('Error in push handler:', err);
    // Show default notification on error
    e.waitUntil(
      self.registration.showNotification('Yamli Mobile', {
        body: 'New notification',
        icon: './images/favicon/ms-icon-144x144.png'
      })
    );
  }
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

