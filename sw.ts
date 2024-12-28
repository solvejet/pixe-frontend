// sw.ts
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

declare let self: ServiceWorkerGlobalScope;

// Enable immediate claim of clients
clientsClaim();
self.skipWaiting();

// Clean up old caches
cleanupOutdatedCaches();

// Pre-cache and route static assets
precacheAndRoute(self.__WB_MANIFEST);

// Setup background sync
const bgSyncPlugin = new BackgroundSyncPlugin('apiQueue', {
    maxRetentionTime: 24 * 60 // Retry for up to 24 Hours (specified in minutes)
});

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com',
    new StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200]
            }),
            new ExpirationPlugin({
                maxEntries: 30,
            })
        ]
    })
);

// Cache the underlying font files with a cache-first strategy for 1 year.
registerRoute(
    ({ url }) => url.origin === 'https://fonts.gstatic.com',
    new CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                maxEntries: 30,
            }),
        ],
    })
);

// Cache API requests
registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new NetworkFirst({
        cacheName: 'api-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200]
            }),
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
            }),
            bgSyncPlugin // Add background sync for offline support
        ]
    })
);

// Cache static assets
registerRoute(
    ({ request }) =>
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'image',
    new CacheFirst({
        cacheName: 'static-assets',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200]
            }),
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
            })
        ]
    })
);

// Handle offline fallback
const handler = createHandlerBoundToURL(new URL('index.html', self.location.origin).pathname);
const navigationRoute = new NavigationRoute(handler, {
    denylist: [
        /\/api\/.*/,  // Don't serve HTML for API routes
        /\/admin\/.*/  // Don't serve HTML for admin routes
    ]
});

registerRoute(navigationRoute);

// Handle offline analytics
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/analytics')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                // Store failed analytics requests for later
                bgSyncPlugin.queueRequest(event.request);
                return new Response(null, { status: 200 });
            })
        );
    }
});

// Listen for push notifications
self.addEventListener('push', (event) => {
    const data = event.data?.json() ?? {};
    const options = {
        ...data,
        icon: '/icon-192.png',
        badge: '/icon-192.png'
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'New Notification', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});