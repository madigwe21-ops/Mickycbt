const CACHE_NAME = "micky-cbt-v5";

const ASSETS = [
  "./",
  "./index.html",
  "./profile.html",
  "./cbt.html",
  "./pdf.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./images/default.png",
  "./images/about.png",
  "./images/cbt.png",
  "./images/maths.png",
  "./images/physics.png",
  "./images/chemistry.png",
  "./images/biology.png",

  // cache JSON questions
  "./data/jamb/maths.json",
  "./data/jamb/physics.json",
  "./data/jamb/chemistry.json",
  "./data/jamb/biology.json"
];

// ================= INSTALL =================
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ================= ACTIVATE =================
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// ================= FETCH =================
self.addEventListener("fetch", event => {
  // Always fetch fresh JSON for questions
  if (event.request.url.includes("/data/jamb/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache first for other assets
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request).catch(() => {
        // fallback page if offline
        if (event.request.destination === "document") {
          return caches.match("./index.html");
        }
      });
    })
  );
});