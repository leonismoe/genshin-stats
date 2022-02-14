// @see https://github.com/microsoft/TypeScript/issues/14877
/// <reference no-default-lib="true" />
/// <reference lib="ES2019" />
/// <reference lib="WebWorker" />

import { cacheNames } from 'workbox-core';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

const enum APP_CACHE_NAMES {
  MHY_ASSETS = 'mhy-assets-cache',
  CDN = 'cdn-cache',
}

self.addEventListener('message', (e) => {
  if (e.data) {
    switch (e.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;

      case 'CACHE_CLEANUP':
        caches.delete(APP_CACHE_NAMES.MHY_ASSETS);
        caches.delete(APP_CACHE_NAMES.CDN);
        caches.delete(cacheNames.runtime);
        caches.delete(cacheNames.googleAnalytics);
        indexedDB.deleteDatabase('workbox-expiration');
        cleanupOutdatedCaches();
        break;
    }
  }
});

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// avatars
registerRoute(
  ({ url }) => url.origin === 'https://upload-bbs.mihoyo.com',
  new CacheFirst({
    cacheName: APP_CACHE_NAMES.MHY_ASSETS,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 80,
        maxAgeSeconds: 30 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
      new CacheableResponsePlugin({
        statuses: [200],
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
    cacheName: APP_CACHE_NAMES.CDN,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 40,
        purgeOnQuotaError: true,
      }),
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  }),
);

// Web Analytics
registerRoute(
  ({ url }) => url.origin === 'https://static.cloudflareinsights.com',
  new StaleWhileRevalidate({
    cacheName: cacheNames.googleAnalytics,
    plugins: [
      {
        async handlerDidError() {
          return new Response(null, {
            status: 204,
            statusText: 'No Content',
          });
        },
      },
    ],
  }),
);
