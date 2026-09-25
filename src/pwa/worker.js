/* Build placeholders are replaced by scripts/build-pwa.mjs. */
const CACHE_NAME = __CACHE_NAME__;
const ASSETS = __ASSETS__;

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
    // No skipWaiting: an update cannot interrupt an existing character build.
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        for (const key of await caches.keys()) {
            if (key.startsWith('summon-shell-') && key !== CACHE_NAME) await caches.delete(key);
        }
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
    if (request.mode === 'navigate') {
        event.respondWith(caches.open(CACHE_NAME).then(async cache => (await cache.match('/index.html')) || fetch(request)));
    } else if (ASSETS.includes(url.pathname)) {
        event.respondWith(caches.open(CACHE_NAME).then(async cache => (await cache.match(url.pathname)) || fetch(request)));
    }
    // Auth, cloud records and remote portraits are intentionally not cached here.
});
