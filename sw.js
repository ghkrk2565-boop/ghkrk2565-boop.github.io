// Self-destroying service worker.
// The previous Gatsby (holo-theme) build shipped gatsby-plugin-offline, which
// registered a Workbox service worker at /sw.js and aggressively precached the
// old site. Browsers that visited before keep serving that stale site (incl. the
// old "Blog" link) from the SW cache. This replacement SW is fetched automatically
// as an update to that existing registration, then wipes every cache and
// unregisters itself so the site always serves fresh content from the network.
self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    (async function () {
      try {
        var keys = await caches.keys();
        await Promise.all(keys.map(function (k) { return caches.delete(k); }));
      } catch (e) {}
      try {
        await self.registration.unregister();
      } catch (e) {}
      // Force all open tabs to reload from the network with no SW in control.
      try {
        var clients = await self.clients.matchAll({ type: 'window' });
        clients.forEach(function (client) { client.navigate(client.url); });
      } catch (e) {}
    })()
  );
});

// Never serve anything from cache — always go to network.
self.addEventListener('fetch', function () { /* no-op: bypass */ });
