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
    event.waitUntil(
      caches.open('maplas-rower-pwa-djangoapp-api').then(cache => {
        console.log('SW: Cache opened');
      }).catch(error => {
        console.error(error);
      })
    );
	  self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log(`Event fired: ${event.type}`);
});

async function fetchOrGetEvent(event) {
  try {
    console.log('Fetching: ' + event.request.url);
    const response = await fetch(event.request);
    if (response && response.status == 200) {
      console.log(event.request.url + ': response status is 200');
      const responseCloneToSave = response.clone();
      const responseCloneToJSON = response.clone();
      const responseCloneToReturn = response.clone();
      await responseCloneToJSON.json();
      console.log(event.request.url + ': response is JSON parsed');
      const cache = await caches.open('maplas-rower-pwa-djangoapp-api');
      await cache.put(event.request, responseCloneToSave);
      console.log(event.request.url + ': response is returned from server');
      return responseCloneToReturn;
    } else {
      const response = await caches.match(event.request);
      if (response) {
        console.log(event.request.url + ': response is returned from cache (wrong status code)');
        return response;
      }
    }
  } catch (error) {
    const response = await caches.match(event.request);
    if (response) {
      console.log(event.request.url + ': response is returned from cache (network error)');
      return response;
    }
  }
}

self.addEventListener('fetch', event => {
  if (event.request.url.includes('/djangoapp/api/')) {
    event.respondWith(fetchOrGetEvent(event));
  }
});

self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

const SERVICE_WORKER_VERSION = 17;