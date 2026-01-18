// A Plus Charge Service Worker - Asset Caching for Performance
// Version 2 - Optimized for Core Web Vitals
const CACHE_VERSION = 'v2';
const CACHE_NAME = `aplus-charge-${CACHE_VERSION}`;
const STATIC_CACHE = `aplus-static-${CACHE_VERSION}`;
const IMAGE_CACHE = `aplus-images-${CACHE_VERSION}`;
const VIDEO_CACHE = `aplus-videos-${CACHE_VERSION}`;
const FONT_CACHE = `aplus-fonts-${CACHE_VERSION}`;

// Critical assets to precache on install (affects LCP)
const PRECACHE_ASSETS = [
  '/',
  '/favicon-192.png',
  '/favicon-512.png',
  '/apple-touch-icon.png',
  '/og-image.png',
  '/manifest.json',
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Precaching static assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Delete old version caches
            return name.startsWith('aplus-') && 
                   !name.includes(CACHE_VERSION);
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Skip Supabase API requests - should not be cached
  if (url.hostname.includes('supabase')) return;

  // Handle different asset types with appropriate strategies
  if (isFontRequest(request)) {
    // Fonts: Cache-first (immutable, long-lived)
    event.respondWith(cacheFirst(request, FONT_CACHE));
  } else if (isImageRequest(request)) {
    // Images: Cache-first with stale-while-revalidate
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
  } else if (isVideoRequest(request)) {
    // Videos: Cache-first (large files, cache immediately)
    event.respondWith(cacheFirst(request, VIDEO_CACHE));
  } else if (isStaticAsset(request)) {
    // JS/CSS: Cache-first (hashed filenames in production)
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isNavigationRequest(request)) {
    // HTML: Network-first for fresh content
    event.respondWith(networkFirst(request, CACHE_NAME));
  } else {
    // Default: Network-first
    event.respondWith(networkFirst(request, CACHE_NAME));
  }
});

// Check if request is a navigation (HTML page)
function isNavigationRequest(request) {
  return request.mode === 'navigate' || request.destination === 'document';
}

// Check if request is for a font
function isFontRequest(request) {
  const url = new URL(request.url);
  return (
    request.destination === 'font' ||
    /\.(woff|woff2|ttf|eot|otf)$/i.test(url.pathname) ||
    url.hostname === 'fonts.gstatic.com'
  );
}

// Check if request is for an image
function isImageRequest(request) {
  const url = new URL(request.url);
  return (
    request.destination === 'image' ||
    /\.(jpg|jpeg|png|gif|webp|svg|ico|avif)$/i.test(url.pathname)
  );
}

// Check if request is for a video
function isVideoRequest(request) {
  const url = new URL(request.url);
  return (
    request.destination === 'video' ||
    /\.(mp4|webm|ogg|mov)$/i.test(url.pathname)
  );
}

// Check if request is for a static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  return /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname);
}

// Cache-first strategy - fastest for static assets
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network request failed:', error);
    return new Response('Network error', { status: 503 });
  }
}

// Stale-while-revalidate - optimal for images (fast + fresh)
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Start background refresh regardless of cache hit
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);
  
  // Return cached response immediately if available (fast LCP)
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network
  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }
  
  return new Response('Asset not available', { status: 503 });
}

// Network-first strategy - for HTML and API
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Network error', { status: 503 });
  }
}

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
