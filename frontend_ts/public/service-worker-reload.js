importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js");

importScripts(
  "/PREFECH-MANIFEST-FILE-PLACEHOLDER"
);

workbox.core.setCacheNameDetails({prefix: "frontend_ts"});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */

self.addEventListener('install', event => {
    console.log(`Event fired: ${event.type}`);
    console.log(event);
    event.waitUntil(
      caches.open('maplas-grzyby-pwa-djangoapp-api').then(cache => {
        console.log('SW: Cache opened');
      }).catch(error => {
        console.error(error);
      })
    );
	  self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log(`Event fired: ${event.type}`);
    console.log(event);
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('/djangoapp/api/')) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response && response.status == 200) {
          let responseClone = response.clone();
          caches.open('maplas-grzyby-pwa-djangoapp-api').then(cache => {
            cache.put(event.request, responseClone);
          })
          return response;
        } else {
          return response;
        }
      }).catch(() => {
        return caches.match(event.request).then(response => {
          if (response) {
            return response;
          }
        })
      })
    );
    console.log(event.request.url);
  }
});

self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

const SERVICE_WORKER_VERSION = 5;