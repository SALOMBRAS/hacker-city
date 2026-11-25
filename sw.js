/**
 * ============================================================================
 * HACKER CITY — SERVICE WORKER NATIVO PWA (WebAPK + Cache Inteligente + Alertas)
 * - Bypassa chamadas autenticadas do Supabase (zero risco de cachear tokens/RPCs)
 * - Cache-First p/ fontes e ícones raster/SVG (< 0.1s boot no 4G)
 * - Network-First c/ fallback offline p/ HTML, CSS e motores JS (sempre fresco)
 * - Roteia toque em notificações direto para a janela tática correspondente
 * ============================================================================
 */
const CACHE_NAME = 'hc-pwa-shell-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './src/assets/icon-192.png',
  './src/assets/icon-512.png',
  './src/assets/icon-192.svg',
  './src/assets/icon-512.svg',
  './src/fonts/inter-latin-wght-normal.woff2',
  './src/fonts/jetbrains-mono-latin-wght-normal.woff2'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (!req || req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  // Nunca intercepta Supabase, WebSockets ou domínios externos de API
  if (url.hostname.includes('supabase.co') || url.origin !== self.location.origin) {
    return;
  }

  const isStaticAsset = /\.(woff2?|png|svg|ico)$/i.test(url.pathname);
  if (isStaticAsset) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((netRes) => {
          if (netRes && netRes.ok) {
            const clone = netRes.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, clone)).catch(() => {});
          }
          return netRes;
        });
      })
    );
    return;
  }

  // Network-First para HTML, CSS e JS (garante código atualizado da Vercel e fallback se cair o sinal)
  event.respondWith(
    fetch(req)
      .then((netRes) => {
        if (netRes && netRes.ok) {
          const clone = netRes.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, clone)).catch(() => {});
        }
        return netRes;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
  );
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (data.type === 'SHOW_NOTIFICATION' && data.title) {
    self.registration.showNotification(String(data.title), {
      body: String(data.body || ''),
      icon: 'src/assets/icon-192.png',
      badge: 'src/assets/icon-192.png',
      tag: String(data.tag || 'hc-alert'),
      data: { winId: data.winId || 'winHome' }
    }).catch(() => {});
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const winId = (event.notification.data && event.notification.data.winId) || 'winHome';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      for (const client of clientsArr) {
        if ('focus' in client) {
          client.focus();
          client.postMessage({ type: 'HC_SW_NAVIGATE', winId });
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(`./index.html?open=${encodeURIComponent(winId)}`);
      }
    })
  );
});
