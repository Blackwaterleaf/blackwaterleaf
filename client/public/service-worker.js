const CACHE_NAME = "blackwaterleaf-static-v1";
const APP_SHELL = [
  "/manifest.webmanifest",
  "/icons/blackwaterleaf-192.png",
  "/icons/blackwaterleaf-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.filter((name) => name.startsWith("blackwaterleaf-") && name !== CACHE_NAME).map((name) => caches.delete(name)),
    )),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const acceptsHtml = request.headers.get("accept")?.includes("text/html");
  const cacheableStaticAsset = url.origin === self.location.origin && (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest"
  );

  // Account, API and navigational responses are never cached by the installation layer.
  if (url.pathname.startsWith("/api/") || acceptsHtml || !cacheableStaticAsset) return;

  event.respondWith(
    caches.match(request).then((cached) => cached ?? fetch(request).then((response) => {
      if (!response.ok) return response;
      const copy = response.clone();
      void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      return response;
    })),
  );
});
