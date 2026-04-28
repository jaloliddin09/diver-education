// ╔══════════════════════════════════════════════════════════╗
// ║  Jaloliddin Math — Service Worker  v3.8                 ║
// ║  YANGILASH: CACHE_NAME raqamini o'zgartiring            ║
// ║  Masalan: 'jm-v3.8' → 'jm-v3.8'                        ║
// ╚══════════════════════════════════════════════════════════╝
const CACHE_NAME = 'jm-v202604280900';

// Asosiy fayllar — har doim keshda bo'ladi
const CORE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './assets/icons/icon.svg',
  // CSS fayllar
  './css/main.css',
  './css/samara.css',
  './css/posts.css',
  // JS fayllar
  './js/firebase-init.js',
  './js/core.js',
  './js/settings.js',
  './js/auth.js',
  './js/guest.js',
  './js/admin.js',
  './js/apps.js',
  './js/parent.js',
  './js/posts.js',
  './js/letters.js',
  './js/pwa.js',
  './js/samara.js',
  './js/profile.js',
  './js/bg-anim.js',
];

// /apps/ papkasidagi fayllar — har birini keshga qo'shamiz
// YANGI ILOVA QO'SHSANGIZ: shu ro'yxatga qo'shing
const APP_FILES = [
  './apps/kasrlar/index.html',
  './apps/sport/index.html',
  './apps/kasrlar_kalkulyator/index.html', 
  // './apps/yangi-ilova/index.html',   ← yangi ilova shu yerga
];

const ALL_CACHE_FILES = [...CORE_FILES, ...APP_FILES];

// Bu hostlardan kelgan so'rovlar keshlanmaydi (Firebase, Google)
const NO_CACHE_HOSTS = [
  'firebaseio.com', 'firebasestorage.app', 'googleapis.com',
  'gstatic.com', 'cloudflare.com', 'fonts.googleapis.com',
  'firebase.com', 'identitytoolkit'
];
const shouldSkip = url => NO_CACHE_HOSTS.some(h => url.includes(h));

// ── INSTALL ─────────────────────────────────────────────────
// Birinchi o'rnatishda barcha fayllarni keshga yukla
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ALL_CACHE_FILES))
      .then(() => self.skipWaiting())
      .catch(err => {
        // Biror fayl topilmasa, faqat asosiy fayllarni cache qil
        console.warn('Some app files not found, caching core only:', err);
        return caches.open(CACHE_NAME).then(c => c.addAll(CORE_FILES));
      })
  );
});

// ── ACTIVATE ────────────────────────────────────────────────
// Eski keshlarni o'chir, yangilash borligini xabar qil
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      const oldKeys = keys.filter(k => k !== CACHE_NAME);
      const isUpdate = oldKeys.length > 0;
      return Promise.all(oldKeys.map(k => caches.delete(k)))
        .then(() => self.clients.claim())
        .then(() => {
          if (!isUpdate) return;
          // Barcha sahifalarga: yangi versiya bor!
          return self.clients
            .matchAll({ includeUncontrolled: true, type: 'window' })
            .then(clients =>
              clients.forEach(c =>
                c.postMessage({ type: 'UPDATE_AVAILABLE', version: CACHE_NAME })
              )
            );
        });
    })
  );
});

// ── FETCH ───────────────────────────────────────────────────
// Strategiya:
//   Firebase/Google → Har doim to'g'ridan to'g'ri tarmoqdan
//   /apps/* fayllar → Kesh birinchi (oflayn ishlaydi)
//   Boshqa fayllar  → Kesh birinchi + fon yangilash
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;

  // Firebase va Google — keshlamaslik
  if (shouldSkip(url)) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ error: 'offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // /apps/ fayllar — kesh birinchi (oflayn ishlaydi)
  if (url.includes('/apps/')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(r => {
          if (r && r.status === 200) {
            caches.open(CACHE_NAME).then(c => c.put(e.request, r.clone()));
          }
          return r;
        });
      })
    );
    return;
  }

  // Asosiy fayllar — Stale-While-Revalidate (limit tejaydi!)
  // Keshdan darhol ber + fon yangilash
  e.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(e.request).then(cached => {
        const networkFetch = fetch(e.request).then(response => {
          if (response && response.status === 200 && e.request.method === 'GET') {
            cache.put(e.request, response.clone());
          }
          return response;
        }).catch(() => cached);

        // Kesh bor → darhol ber, fon yangilanadi (limit tejaydi)
        // Kesh yo'q → tarmoqdan kut
        return cached || networkFetch;
      });
    })
  );
});

// ── MESSAGES ────────────────────────────────────────────────
self.addEventListener('message', e => {
  if (!e.data) return;

  // Kesh tozalash (Admin tugmasi)
  if (e.data.type === 'CLEAR_CACHE') {
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => {
        if (e.source) e.source.postMessage({ type: 'CACHE_CLEARED' });
      });
  }

  // Majburiy yangilash (foydalanuvchi "Ha" desa)
  if (e.data.type === 'FORCE_UPDATE') {
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.matchAll({ includeUncontrolled: true, type: 'window' }))
      .then(clients => clients.forEach(c => c.postMessage({ type: 'RELOAD' })));
  }
});
