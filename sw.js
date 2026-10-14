/* 홉 앤 드림 서비스워커 - 오프라인 플레이 지원
 * v56: 네비게이션 (v52에서 도입, 유지). 요청(index.html)은 network-first로 변경.
 * 이유: cache-first라서 일반 URL 접속 시 구버전이 서빙되고 강력 새로고침으로도
 * 안 바뀌는 문제 (3차 플레이테스트에서 v2.1.0이 계속 뜸). 네비게이션만
 * 네트워크 우선으로 바꾸고, 이미지·에셋은 cache-first 유지 (오프라인 보존).
 * 네트워크 실패 시 캐시 폴백 유지. */
const CACHE = 'hop-dream-v77';
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
  /* 네비게이션(페이지 이동/새로고침): network-first — 항상 최신 index.html을
     받아오고, 오프라인일 때만 캐시 폴백. 구버전 고착 방지. */
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(function (res) {
        if (res && res.ok && new URL(e.request.url).origin === self.location.origin) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match(e.request).then(function (hit) {
          return hit || caches.match('./index.html');
        });
      })
    );
    return;
  }
  /* 그 외 에셋(이미지·manifest·아이콘): cache-first 유지 (오프라인 플레이) */
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
        return Response.error();
      });
    })
  );
});
