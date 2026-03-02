const CACHE_NAME = "cbt-cache-v2";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/questions.js",
  "/script.js",
  "/style.css"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
    .then(response => response || fetch(event.request))
  );
});