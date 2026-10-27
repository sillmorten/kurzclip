// Minimaler Service Worker, damit Browser die App als installierbar erkennen.
// Videos und Seiten kommen immer frisch vom Server, damit die Paywall stimmt.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
