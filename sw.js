// Minimal service worker: makes Task Depot installable and serves a friendly
// page when the phone is offline. It deliberately does NOT cache app data —
// tasks must always come fresh from the server.
const SHELL = 'taskdepot-shell-v1';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;          // never touch Supabase calls
  e.respondWith(
    fetch(e.request).catch(async () => {
      const cache = await caches.open(SHELL);
      const hit = await cache.match(e.request);
      return hit || new Response(
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<body style="font-family:system-ui;padding:40px 20px;text-align:center;color:#1c1f26">' +
        '<h1 style="font-size:20px">No connection</h1><p>Task Depot needs a signal. Try again in a moment.</p></body>',
        { headers: { 'content-type': 'text/html' } });
    })
  );
});
