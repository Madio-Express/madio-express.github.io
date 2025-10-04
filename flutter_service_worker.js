'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "c6bde94130829683f66d304eb60ffe4d",
"assets/AssetManifest.bin.json": "c4f51074e4610e595b01c911277bdd8b",
"assets/AssetManifest.json": "e00b480c0a2f965fda07d71c5b3a7437",
"assets/assets/data/genders.json": "d4bf17a856a42f5190002a94adf0d081",
"assets/assets/data/relationships.json": "cb07e80f5f471266827c92818e014ea3",
"assets/assets/data/topic_tastes.json": "a04dcfdea2acd127a6fc3b6480346c58",
"assets/assets/icons/Heart%2520Icon_2.svg": "f728c6b3d75dfab6450f56a2a57633f0",
"assets/assets/icons/loading.gif": "789319244da1e131f51b218dc2abc42b",
"assets/assets/icons/loading5.gif": "17e7bebcaec133cae788ab25558dad7e",
"assets/assets/icons/Star%2520Icon.svg": "1ef6ad3bbe15947a5b4d9bf153101fd3",
"assets/assets/icons/triangle.png": "12f6bedf12f78d13b605c1d299b3a391",
"assets/assets/images/barber_parallax.jpg": "8577356d6d03e89b458e5984e39f7595",
"assets/assets/images/Formas_de_pago_MPC_STORE.jpg": "d06c25c596092084bc30b331aec80bcf",
"assets/assets/images/Madio_mall_advertisement.png": "680fd5c7ccad2c103f55899871bb4bc1",
"assets/assets/images/metodos_de_pago.webp": "78123b6bbd8a9ed619628ba0a8956bbe",
"assets/assets/images/No-Image-Placeholder.png": "8bb577688de585fe04c3b5e45ab4fd5e",
"assets/assets/images/parallax_dulces.jpg": "f80c739a3189208e53c456f40e7d6aab",
"assets/assets/images/percentage_discount.png": "38ffaf782594cabb9ad60e096e663aa5",
"assets/assets/images/stars_background.gif": "058b756db6120dcd9fb61cfafbad4dce",
"assets/assets/logos/Logo.png": "0f50143766a8d793a26bd5db87f382e6",
"assets/assets/logos/Logo1.png": "f33f8df50a7373258a6045d397cee43e",
"assets/assets/logos/Logo_oscuro.jpg": "fa1dead1d00d72527ea911f57a973dd7",
"assets/assets/logos/Logo_pasteleria.png": "d1fbc3d7019ee978c0d16cd369c22b4b",
"assets/FontManifest.json": "dcb1dfeaff398bc417d5442466c58834",
"assets/fonts/MaterialIcons-Regular.otf": "695aa53ae0b169c7c12b8c556d971042",
"assets/NOTICES": "72e544f916e0c563df6b4a013f879c92",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "e986ebe42ef785b27164c36a9abc7818",
"assets/packages/font_awesome_flutter/lib/fonts/fa-brands-400.ttf": "216b019b42c05e07ff7472b382efae72",
"assets/packages/font_awesome_flutter/lib/fonts/fa-regular-400.ttf": "f3307f62ddff94d2cd8b103daf8d1b0f",
"assets/packages/font_awesome_flutter/lib/fonts/fa-solid-900.ttf": "26e5098e2f7fb4b20a2487787f722878",
"assets/packages/social_media_flutter/fonts/icons.ttf": "7dae615e8df7bf5bf381bf713850ac33",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"canvaskit/canvaskit.js": "738255d00768497e86aa4ca510cce1e1",
"canvaskit/canvaskit.js.symbols": "74a84c23f5ada42fe063514c587968c6",
"canvaskit/canvaskit.wasm": "9251bb81ae8464c4df3b072f84aa969b",
"canvaskit/chromium/canvaskit.js": "901bb9e28fac643b7da75ecfd3339f3f",
"canvaskit/chromium/canvaskit.js.symbols": "ee7e331f7f5bbf5ec937737542112372",
"canvaskit/chromium/canvaskit.wasm": "399e2344480862e2dfa26f12fa5891d7",
"canvaskit/skwasm.js": "5d4f9263ec93efeb022bb14a3881d240",
"canvaskit/skwasm.js.symbols": "c3c05bd50bdf59da8626bbe446ce65a3",
"canvaskit/skwasm.wasm": "4051bfc27ba29bf420d17aa0c3a98bce",
"canvaskit/skwasm.worker.js": "bfb704a6c714a75da9ef320991e88b03",
"favicon.png": "a2147bf911b5147d5441b6d216bf3b2b",
"flutter.js": "383e55f7f3cce5be08fcf1f3881f585c",
"flutter_bootstrap.js": "f2a60c1f5825f91285dd84aa99293054",
"icons/Icon-192.png": "d221d6ae1e2db704afb970a818399b7e",
"icons/Icon-512.png": "e758359d6ea8360d6aa518280604a75c",
"icons/Icon-maskable-192.png": "d221d6ae1e2db704afb970a818399b7e",
"icons/Icon-maskable-512.png": "e758359d6ea8360d6aa518280604a75c",
"index.html": "d716ff0885d4bf6f14515063d535bb4c",
"/": "d716ff0885d4bf6f14515063d535bb4c",
"main.dart.js": "6dff9de67a25428d0eb586b653cfc874",
"manifest.json": "42236d0105f957e75c6b0c9acc017965",
"version.json": "ef54a4ae329e507823db7566997fe9c3"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
