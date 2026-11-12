/* NoxaPlus Subtitle Studio — offline shell */
const VERSION = 'v1.0.1';
const CACHE_NAME = `noxaplus-subtitle-studio-${VERSION}`;
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/favicon-32.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
];

async function cacheUrls(cache, urls) {
  await Promise.all(
    urls.map(async (url) => {
      try {
        await cache.add(url);
      } catch {
        // A single optional asset must not break the whole install.
      }
    }),
  );
}

async function precache() {
  const cache = await caches.open(CACHE_NAME);
  await cacheUrls(cache, APP_SHELL);

  try {
    const response = await fetch('./index.html', { cache: 'reload' });
    if (!response.ok) return;
    const html = await response.text();
    const assets = new Set();
    for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      const value = match[1];
      if (
        !value ||
        value.startsWith('#') ||
        value.startsWith('data:') ||
        /^[a-z]+:/i.test(value)
      ) {
        continue;
      }
      assets.add(new URL(value, self.location.href).href);
    }
    await cacheUrls(cache, [...assets]);
  } catch {
    // The HTML preview is already cached; the runtime handler fills the rest.
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() =>
          caches
            .match('./index.html')
            .then((cached) => cached || caches.match('./'))
            .then((cached) => cached || Response.error()),
        ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached || Response.error());
      return cached || network;
    }),
  );
});
