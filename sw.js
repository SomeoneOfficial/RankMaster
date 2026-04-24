/*
LEARNING FILE CARD
File: sw.js
Purpose:
- Caches app files for offline reliability and faster repeat loads.
- Intercepts fetch requests and serves cache-first for static assets.
*/

const CACHE_NAME = 'TableTennisRatings-v5';
const urlsToCache = [
  './',
  './index.html',
  './public/manifest.webmanifest',
  './public/icons/icon-192x192.png',
  './public/icons/icon-512x512.png',
  './assets/css/app.css',
  './assets/js/core/config-constants.js',
  './assets/js/core/feature-api.js',
  './assets/js/core/runtime-state.js',
  './assets/js/logic/level-system.js',
  './assets/js/logic/title-system.js',
  './assets/js/logic/elo-algorithm.js',
  './assets/js/logic/match-prediction.js',
  './assets/js/logic/series-engine.js',
  './assets/js/logic/streak-form.js',
  './assets/js/logic/rivalry.js',
  './assets/js/logic/comeback.js',
  './assets/js/logic/achievements.js',
  './assets/js/logic/milestones.js',
  './assets/js/logic/rating-graph.js',
  './assets/js/app/import-migrator.js',
  './assets/js/app/color-swatches.js',
  './assets/js/app/appearance-features.js',
  './assets/js/app/persistence-render.js',
  './assets/js/app/cloud-sync.js',
  './assets/js/app/bootstrap.js',
  './assets/js/ui/leaderboard.js',
  './assets/js/ui/players-manage.js',
  './assets/js/ui/match-selects.js',
  './assets/js/ui/history.js',
  './assets/js/ui/players-crud.js',
  './assets/js/ui/profile.js',
  './assets/js/ui/spinner.js',
  './assets/js/ui/manual-adjust.js',
  './assets/js/ui/settings.js',
  './assets/js/ui/tabs.js',
  './assets/js/tournaments/core.js',
  './assets/js/tournaments/single-elimination.js',
  './assets/js/tournaments/double-elimination.js',
  './assets/js/tournaments/round-robin.js',
  './assets/js/tournaments/round-robin-groups.js',
  './assets/js/tournaments/ladder.js',
  './assets/js/tournaments/king-of-the-hill.js',
  './assets/js/utils-boot.js',
  './assets/js/service-worker-register.js'
];

// Install: cache core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.map(name => name !== CACHE_NAME && caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: different strategies for navigation vs. other GETs
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // 1) Navigation (page loads)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(netRes => netRes)
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 2) Other requests (CSS, JS, images, etc.)
  event.respondWith(
    caches.match(event.request).then(cachedRes => {
      if (cachedRes) return cachedRes;

      return fetch(event.request)
        .then(netRes => {
          // Only cache valid, same-origin responses
          if (
            netRes.ok &&
            new URL(event.request.url).origin === self.location.origin
          ) {
            const clone = netRes.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return netRes;
        })
        .catch(() => {
          // If both cache & network fail, return a simple fallback (optional)
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
    })
  );
});




