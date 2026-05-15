// MahBook service worker — offline-first shell with safe handling of Vite chunks.
const CACHE_VERSION = 'mahbook-v5';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;

// Routes pre-warmed so the SPA shell loads with no connectivity.
const APP_ROUTES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/apple-touch-icon-120x120.png',
  '/apple-touch-icon-152x152.png',
  '/apple-touch-icon-167x167.png',
  '/apple-touch-icon-180x180.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // Use individual adds so a single 404 doesn't abort the entire install.
      Promise.all(
        APP_ROUTES.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => null)
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'GET_VERSION' && event.ports && event.ports[0]) {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin (Supabase, fonts CDN handled separately).
  if (request.method !== 'GET') return;

  const sameOrigin = url.origin === self.location.origin;

  // Network-first for navigation so fresh deploys reach users; fall back to cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put('/index.html', clone));
          return response;
        })
        .catch(() =>
          caches.match(request).then((m) => m || caches.match('/index.html'))
        )
    );
    return;
  }

  // Never cache Vite dev modules or JS/CSS chunks — mismatched React copies crash hooks.
  if (
    sameOrigin &&
    (url.pathname.startsWith('/src/') ||
      url.pathname.startsWith('/node_modules/.vite/') ||
      url.pathname.startsWith('/@vite/') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.mjs') ||
      url.pathname.endsWith('.css'))
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // Stale-while-revalidate for icons, images, fonts, manifest — keeps app usable offline.
  const isCacheableAsset =
    sameOrigin &&
    (/\.(png|jpg|jpeg|svg|webp|ico|woff2?|ttf|otf)$/i.test(url.pathname) ||
      url.pathname === '/manifest.json');

  const isGoogleFont =
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com';

  if (isCacheableAsset || isGoogleFont) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const clone = response.clone();
              caches.open(ASSET_CACHE).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Default: try network, fall back to cache if offline.
  if (sameOrigin) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
  }
});
