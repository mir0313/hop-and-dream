/* 홉 앤 드림 서비스워커 - 오프라인 플레이 지원 (cache-first) */
const CACHE = 'hop-dream-v32';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './assets/npc/pixel/alex_neutral.webp',
  './assets/npc/pixel/alex_serious.webp',
  './assets/npc/pixel/alex_smile.webp',
  './assets/npc/pixel/alex_surprised.webp',
  './assets/npc/pixel/doyun_neutral.webp',
  './assets/npc/pixel/doyun_serious.webp',
  './assets/npc/pixel/doyun_smile.webp',
  './assets/npc/pixel/doyun_surprised.webp',
  './assets/npc/pixel/gangsan_neutral.webp',
  './assets/npc/pixel/gangsan_serious.webp',
  './assets/npc/pixel/gangsan_smile.webp',
  './assets/npc/pixel/gangsan_surprised.webp',
  './assets/npc/pixel/jamie_neutral.webp',
  './assets/npc/pixel/jamie_serious.webp',
  './assets/npc/pixel/jamie_smile.webp',
  './assets/npc/pixel/jamie_surprised.webp',
  './assets/npc/pixel/minji_neutral.webp',
  './assets/npc/pixel/minji_serious.webp',
  './assets/npc/pixel/minji_smile.webp',
  './assets/npc/pixel/minji_surprised.webp',
  './assets/npc/pixel/park_neutral.webp',
  './assets/npc/pixel/park_serious.webp',
  './assets/npc/pixel/park_smile.webp',
  './assets/npc/pixel/park_surprised.webp',
  './assets/npc/pixel/sua_neutral.webp',
  './assets/npc/pixel/sua_serious.webp',
  './assets/npc/pixel/sua_smile.webp',
  './assets/npc/pixel/sua_surprised.webp',
  './assets/npc/pixel/guide_fairy.webp'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        if (res && res.ok && new URL(e.request.url).origin === self.location.origin) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () {
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});
