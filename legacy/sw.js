/**
 * sw.js — Service worker mínimo: cachea el "app shell" para que la PWA
 * abra rápido y funcione offline. No hay backend ni sincronización.
 *
 * Nota sobre notificaciones: este service worker NO implementa Push API
 * (eso requeriría un servidor push + suscripción). El recordatorio diario
 * de la app usa la Notification API disparada desde app.js mientras la
 * pestaña/PWA está abierta o en segundo plano; no despierta la app si
 * está completamente cerrada.
 */

var CACHE_NAME = "italiano-plan-v1";
var APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./plan.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return key !== CACHE_NAME;
          })
          .map(function (key) {
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var networkFetch = fetch(event.request)
        .then(function (response) {
          if (response && response.ok) {
            var copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, copy);
            });
          }
          return response;
        })
        .catch(function () {
          return cached;
        });
      return cached || networkFetch;
    })
  );
});
