const CACHE = "sebasfit-shell-v1";
const SHELL = ["./","./index.html","./manifest.webmanifest","./css/lock.css","./css/sculpt.css","./css/modulos.css",
  "./js/core.js","./js/sculpt.js","./js/estacion.js","./js/armar.js","./js/musica.js","./js/clases.js","./js/ptlib.js","./js/pt.js","./js/cot.js","./js/main.js",
  "./icon-192.png","./icon-512.png","./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// red primero (para no servir una versión vieja); sin red usa lo guardado, así abre en el estudio sin señal
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
