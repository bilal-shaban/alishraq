const CACHE_NAME = 'ishraq-cache-v1';
const assetsToCache = [
  './index.html',
  './matwaf.html', // أو اسم صفحة المطوف عندك
  './style.css',
  './manifest.json',
  './5b862b4281f64fd884b11984846f0e97.png' // صورة الشعار أو الأيقونات الأساسية
];

// تثبيت الكاش وتخزين الملفات
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
});

// تفعيل الخدمة وحذف الكاش القديم إن وجد
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// جلب الملفات من الكاش في حال انقطاع الإنترنت
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});