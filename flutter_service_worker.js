// Killswitch service worker — see te_regalo/tool/disable_service_worker.js.
// Heals clients still controlled by an old caching SW (stale build) and then
// gets out of the way. The storefront registers no SW going forward.
self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    try {
      var keys = await caches.keys();
      await Promise.all(keys.map(function (k) { return caches.delete(k); }));
    } catch (e) {}
    try {
      await self.registration.unregister();
    } catch (e) {}
    try {
      var clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(function (c) { c.navigate(c.url); });
    } catch (e) {}
  })());
});

// Network passthrough while still active (no caching).
self.addEventListener('fetch', function () {});
