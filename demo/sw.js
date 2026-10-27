// Ersetzt den alten Service Worker unter /kurzclip/ und meldet ihn sofort ab.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.registration.unregister()));
