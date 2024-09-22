importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.0.0/workbox-sw.js");

importScripts(
  "/PREFECH-MANIFEST-FILE-PLACEHOLDER"
);

const API_CACHE_NAME = 'maplas-pwa-djangoapp-api';
const IMG_CACHE_NAME = 'maplas-pwa-img';

workbox.core.setCacheNameDetails({prefix: "frontend_ts"});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */

self.addEventListener('install', event => {
    console.log(`Event fired: ${event.type}`);
    event.waitUntil(
      caches.open(API_CACHE_NAME).then(cache => {
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
    const response = await fetch(event.request);
    if (response && response.status == 200) {
      console.log(event.request.url + ': response status is 200');
      const responseCloneToSave = response.clone();
      const responseCloneToJSON = response.clone();
      const responseCloneToReturn = response.clone();
      await responseCloneToJSON.json();
      console.log(event.request.url + ': response is JSON parsed');
      const cache = await caches.open(API_CACHE_NAME);
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
    console.log(event.request.url + ': catch block');
    console.log(error);
    const response = await caches.match(event.request);
    if (response) {
      console.log(event.request.url + ': response is returned from cache (network error)');
      return response;
    }
  }
}

async function getFromCacheOrNetwork(event) {
  try {
    const cache = await caches.open(IMG_CACHE_NAME);
    const response = await cache.match(event.request);
    if (response) {
      console.log(event.request.url + ': response is returned from cache');
      return response;
    } else {
      const response = await fetch(event.request);
      if (response && response.status == 200) {
        const responseCloneToSave = response.clone();
        cache.put(event.request, responseCloneToSave);
        console.log(event.request.url + ': response is saved to cache');
        return response;
      } else {
        return response;
      }
    }
  } catch (error) {
  }
}

self.addEventListener('fetch', event => {
    console.log('Fetching: ' + event.request.url + ' in ServiceWorker');
    if (event.request.method == 'GET') {
      const url = event.request.url;
      let processByServiceWorker = false;
      if (url.includes('/media/CACHE/')) {
        processByServiceWorker = true;
      }
      if (processByServiceWorker) {
          console.log(event.request.url + ': intercepted by ServiceWorker');
          event.respondWith(getFromCacheOrNetwork(event));
      }
    }
});

self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

const SERVICE_WORKER_VERSION = 112;