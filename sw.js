const CACHE_NAME = 'ishraq-cache-v2';
const assetsToCache = [
  './',
  './index.html',
  './quran.html',
  './surah-reader.html',
  './tasbeeh.html',
  './qibla.html',
  './matwaf.html',
  './settings.html',
  './style.css',
  './manifest.json',
  './main.js',
  './prayer.js',
  './qibla.js',
  './quran.js',
  './surah-reader.js',
  './tasbeeh.js',
  './matwaf.js',
  './settings.js',
  './app-icon.png',
  './5b862b4281f64fd884b11984846f0e97.png'
];

// تثبيت الكاش وتخزين الملفات
// نستخدم cache.add لكل ملف على حدة (بدل addAll) حتى لا يفشل التثبيت بالكامل
// في حال كان أحد الملفات (مثل صورة) غير موجود فعلياً على السيرفر
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        assetsToCache.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('تعذر تخزين الملف في الكاش (تحقق من وجوده على السيرفر):', url, err);
          })
        )
      );
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