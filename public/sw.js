// heybro-shell-v4 — self-destructing worker.
// Previous versions could leave navigations on stale HTML (plain "Checking access…").
const CACHE_PREFIX = "heybro-shell-";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) || key.startsWith("heybro-"))
          .map((key) => caches.delete(key)),
      );
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })(),
  );
});

// Do not intercept fetches — always hit the network for HTML/CSS/JS.
self.addEventListener("fetch", () => {});
