const CACHE_NAME = "micky-cbt-v10";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./main.js",
  "./manifest.json",
  
  "./images/maths.png",
  "./images/physics.png",
  "./images/chemistry.png",
  "./images/biology.png",
  "./images/cbt.png",
  "./images/about.png"
];

// INSTALL
self.addEventListener("install", event => {
  
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
});


// ACTIVATE
self.addEventListener("activate", event => {
  
  event.waitUntil(
    
    caches.keys().then(keys => {
      
      return Promise.all(
        
        keys.map(key => {
          
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          
        })
        
      );
      
    })
    
  );
  
  self.clients.claim();
  
});


// FETCH
self.addEventListener("fetch", event => {
  
  const request = event.request;
  
  // Don't cache JSON questions
  if (request.url.includes("/data/")) {
    event.respondWith(fetch(request));
    return;
  }
  
  event.respondWith(
    
    caches.match(request)
    .then(response => {
      
      if (response) {
        return response;
      }
      
      return fetch(request)
        .then(networkResponse => {
          
          return caches.open(CACHE_NAME)
            .then(cache => {
              
              cache.put(request, networkResponse.clone());
              return networkResponse;
              
            });
          
        });
      
    })
    
  );
  
});