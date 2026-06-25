// Post-build: replace Flutter's generated caching service worker with a
// killswitch. `flutter build web` always emits a caching flutter_service_worker.js
// that serves cached assets offline-first — which, after the security migration,
// kept serving customers a stale main.dart.js that hit now-dead authenticated
// endpoints (401/CORS) and broke store loading on first try.
//
// index.html no longer registers a SW, so NEW visitors never install one. But
// clients already controlled by the old SW keep serving the stale build until
// their browser picks up a changed flutter_service_worker.js. This killswitch is
// that changed script: on activate it clears all caches, unregisters itself, and
// reloads every window onto the live network version — healing poisoned clients.
//
// Run after building, before copying build/web to the deploy repo:
//   flutter build web --release --web-renderer canvaskit
//   node tool/disable_service_worker.js
//   # then copy build/web -> madio-express.github.io and push

const fs = require('fs');
const path = require('path');

const KILLSWITCH = `// Killswitch service worker — see te_regalo/tool/disable_service_worker.js.
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
`;

const target = path.join(__dirname, '..', 'build', 'web', 'flutter_service_worker.js');

if (!fs.existsSync(path.dirname(target))) {
  console.error('build/web not found. Run `flutter build web` first.');
  process.exit(1);
}

fs.writeFileSync(target, KILLSWITCH, 'utf8');
console.log('Replaced build/web/flutter_service_worker.js with killswitch SW.');
