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
	self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log(`Event fired: ${event.type}`);
    console.log(event);
});

self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});