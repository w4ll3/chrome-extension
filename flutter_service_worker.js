'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/assets/image/gen.svg": "62da9202c7cf2db754695b9793da50c4",
"assets/assets/image/scan.svg": "4eab6f668decfc0cf74e8a3a2eff45f5",
"assets/assets/brand/logo-subtitle.svg": "db5df55a1d42e98f7e6ecba205902fe6",
"assets/assets/brand/logo-splash.svg": "e1cbb29def424aa5aed297531ff5bf2c",
"assets/assets/brand/logo-minimal.svg": "8321a1af107d7fe13d9d330aecf854bb",
"assets/assets/brand/logo-circular.svg": "aed98728b53b12c1cc080cb632af422d",
"assets/assets/brand/logo-full.svg": "13a8f7dcae750a20c944a3b6929e4b3b",
"assets/assets/brand/logo-title.svg": "93d326942d61ff71cf571300a809a468",
"assets/assets/icon/wallet-filled.svg": "99cf5d6d938be1f74f234fad5403af5a",
"assets/assets/icon/domain.svg": "5ca16e05b2b5afb5ccd3259e80ad17d5",
"assets/assets/icon/location-target.svg": "9218ec99edf44f14118ba8a3c5acc756",
"assets/assets/icon/qr-code.svg": "2e784d6edf909565729703fbe124d200",
"assets/assets/icon/wallet.svg": "a014214de13cff212952627e7504f31e",
"assets/assets/icon/profile.svg": "99e0b27213b59ce234a3e0b87e463f18",
"assets/assets/icon/profile-filled.svg": "13a578b37f211daa2e689618add54701",
"assets/assets/icon/time-clock.svg": "1808b369f607032782f5cfe0d82229ca",
"assets/AssetManifest.json": "cb4fec631dac5796564b51120dbb5551",
"assets/NOTICES": "910c8d69e57a575225767b4bafb131ae",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "115e937bb829a890521f72d2e664b632",
"assets/packages/font_awesome_flutter/lib/fonts/fa-brands-400.ttf": "831eb40a2d76095849ba4aecd4340f19",
"assets/packages/font_awesome_flutter/lib/fonts/fa-solid-900.ttf": "d80ca32233940ebadc5ae5372ccd67f9",
"assets/packages/font_awesome_flutter/lib/fonts/fa-regular-400.ttf": "a126c025bab9a1b4d8ac5534af76a208",
"assets/FontManifest.json": "5a32d4310a6f5d9a6b651e75ba0d7372",
"didkit/wrapper.js": "21f9fbfb3dc9cbe096013614114e1e85",
"didkit/didkit_wasm_bg.wasm": "270ef143f2b1ac5364d13692aa40bb72",
"didkit/didkit_wasm_bg1.js": "22c502bdad7f709ca9b008d7ed76a804",
"didkit/didkit_wasm_bg.js": "e802647b8b4758215732d8add4caec06",
"icons/Icon-332.png": "e44669f38a8fe2b6ae6620b20d20260d",
"main.dart.js": "caeb3e8df6aa15b8471b47832a746b70",
"version.json": "65c272261c71520ca53efb7b3fe34c73",
"index.html": "a1e4b36d106ffade9b4511341ad333dc",
"/": "a1e4b36d106ffade9b4511341ad333dc",
"manifest.json": "4d6213b0e865f082c059855fd89790d9",
"favicon.png": "e44669f38a8fe2b6ae6620b20d20260d"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
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
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
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
