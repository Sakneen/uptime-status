// Offline shell for the Sakneen status page.
// Network-first: normal visits always get the freshly deployed page; the cached
// copy is served only when the origin (GitHub Pages) is unreachable. Status
// DATA staleness is handled in the page itself (localStorage snapshot + notice).
var SHELL_CACHE = "sakneen-status-shell-v1";
var SHELL_KEY = "./";

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(function (cache) { return cache.add(SHELL_KEY); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (event) {
  if (event.request.mode !== "navigate") { return; }
  event.respondWith(
    fetch(event.request).then(function (response) {
      if (response.ok) {
        var responseCopy = response.clone();
        caches.open(SHELL_CACHE).then(function (cache) { cache.put(SHELL_KEY, responseCopy); });
        return response;
      }
      return caches.match(SHELL_KEY).then(function (cached) { return cached || response; });
    }).catch(function (networkError) {
      return caches.match(SHELL_KEY).then(function (cached) {
        if (cached) { return cached; }
        throw networkError;
      });
    })
  );
});
