// O'gratos — service worker (cache léger de la coquille de l'appli)
const CACHE = "ogratos-v1";
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "./ogratos-logo.png",
  "./icon-192.png",
  "./icon-512.png",
  "./favicon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  // ne jamais mettre en cache les appels Supabase (données en direct)
  if (req.url.includes("supabase.co") || req.url.includes("supabase.in")) {
    return; // laisse passer vers le réseau
  }
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
