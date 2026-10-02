const CACHE = "sebasfit-v3";
const SHELL = ["./","./index.html","./manifest.webmanifest","./css/fonts.css","./css/lock.css","./css/sculpt.css","./css/modulos.css",
  "./js/fflate.js","./js/core.js","./js/sculpt.js","./js/estacion.js","./js/armar.js","./js/musica.js","./js/clases.js","./js/ptlib.js","./js/pt.js","./js/cot.js","./js/main.js",
  "./icon-192.png","./icon-512.png","./apple-touch-icon.png","./favicon.png",
  "./fonts/BarlowCondensed-500-latin-ext.woff2","./fonts/BarlowCondensed-500-latin.woff2","./fonts/BarlowCondensed-600-latin-ext.woff2","./fonts/BarlowCondensed-600-latin.woff2","./fonts/BarlowCondensed-700-latin-ext.woff2","./fonts/BarlowCondensed-700-latin.woff2","./fonts/HankenGrotesk-400-latin-ext.woff2","./fonts/HankenGrotesk-400-latin.woff2","./fonts/IBMPlexMono-400-latin-ext.woff2","./fonts/IBMPlexMono-400-latin.woff2","./fonts/IBMPlexMono-500-latin-ext.woff2","./fonts/IBMPlexMono-500-latin.woff2","./fonts/IBMPlexMono-600-latin-ext.woff2","./fonts/IBMPlexMono-600-latin.woff2"];

// instala cada archivo por separado: si uno falla no se pierde todo
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
const withTimeout = (p, ms) => new Promise((res, rej) => { const t = setTimeout(() => rej(new Error("timeout")), ms); p.then(v => { clearTimeout(t); res(v); }, e => { clearTimeout(t); rej(e); }); });
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  // tipografías e íconos: primero lo guardado (no cambian)
  if (/\.(woff2|png|svg)$/.test(url.pathname)) {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)).catch(() => {}); return res; })));
    return;
  }
  // código y páginas: la red si responde pronto (para tener la versión nueva); con señal débil o sin señal, lo guardado
  e.respondWith(
    withTimeout(fetch(req).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)).catch(() => {}); return res; }), 3500)
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === "navigate" ? caches.match("./index.html") : Response.error())))
  );
});
