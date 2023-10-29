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
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});

