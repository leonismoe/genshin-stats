// @see https://github.com/microsoft/TypeScript/issues/14877
/// <reference no-default-lib="true" />
/// <reference lib="ES2019" />
/// <reference lib="WebWorker" />

import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// avatars
registerRoute(
  ({ url }) => url.origin === 'https://upload-bbs.mihoyo.com',
  new CacheFirst({
    cacheName: 'mhy-assets-cache',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);

// CDN
const cdnOrigins = new Set<string>();
cdnOrigins.add('https://cdn.jsdelivr.net');
cdnOrigins.add('https://fastly.jsdelivr.net');
cdnOrigins.add('https://cdnjs.cloudflare.com');
cdnOrigins.add('https://cdn.staticfile.org');
cdnOrigins.add('https://unpkg.com');

registerRoute(
  ({ url }) => cdnOrigins.has(url.origin),
  new CacheFirst({
    cacheName: 'cdn-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 40,
        purgeOnQuotaError: true,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);
