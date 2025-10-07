// Service Worker for 7care PWA
const CACHE_NAME = '7care-v6-push-payload-fix';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/favicon.ico'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  // Ativar imediatamente a nova versão do SW
  self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Não responder a requisições que não devem ser interceptadas
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        // Fallback para requisições que falharam
        return new Response('Network error', { status: 408 });
      })
  );
});

// Push event
self.addEventListener('push', (event) => {
  // Parsing super defensivo: sempre capturar texto bruto e tentar JSON
  let payload = {};
  let rawText = '';
  try {
    if (event.data) {
      try {
        rawText = event.data.text();
      } catch (_) {
        // alguns navegadores suportam .json(); garantir fallback
        try { payload = event.data.json(); } catch { /* ignore */ }
      }
    }
    if (!payload || Object.keys(payload).length === 0) {
      if (rawText) {
        try { payload = JSON.parse(rawText); } catch { payload = { body: rawText }; }
      }
    }
  } catch (err) {
    console.warn('SW push: erro ao processar payload:', err);
  }

  // Quando o backend envia texto simples (compat iOS), usamos como body e título padrão
  const title = (payload && payload.title) || '7care';
  const body = (payload && (payload.body || payload.message)) || rawText || 'Nova notificação';
  const icon = payload.icon || '/pwa-192x192.png';
  const badge = payload.badge || '/pwa-192x192.png';
  const tag = payload.tag || 'general';
  const url = (payload.data && payload.data.url) || payload.url || '/';
  const nData = { ...(payload.data || {}), url, receivedAt: Date.now() };

  const options = {
    body,
    icon,
    badge,
    tag,
    vibrate: [200, 100, 200],
    data: nData,
    actions: [
      { action: 'explore', title: 'Abrir', icon: '/pwa-192x192.png' },
      { action: 'close', title: 'Fechar', icon: '/pwa-192x192.png' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  try {
    event.notification.close();

    const targetUrl = (event.notification && event.notification.data && event.notification.data.url) || '/';

    if (event.action === 'explore') {
      // Open the app
      event.waitUntil(
        clients.openWindow(targetUrl).catch(err => console.error('Error opening window:', err))
      );
    } else if (event.action === 'close') {
      // Just close the notification
      return;
    } else {
      // Default action - open the app
      event.waitUntil(
        clients.openWindow(targetUrl).catch(err => console.error('Error opening window:', err))
      );
    }
  } catch (error) {
    console.error('Error in notification click:', error);
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Implement background sync logic here
  console.log('Background sync triggered');
  return Promise.resolve();
}

// Message event listener para comunicação com a página
self.addEventListener('message', (event) => {
  try {
    // Always respond to any message to prevent channel closure errors
    const respond = (data) => {
      if (event.ports && event.ports[0]) {
        try {
          event.ports[0].postMessage(data);
        } catch (err) {
          console.warn('Could not post message to port:', err);
        }
      }
    };

    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
      respond({ success: true });
    } else {
      // Respond to any other message to prevent channel closure
      respond({ success: true, message: 'Message received' });
    }
  } catch (error) {
    console.error('Error in message listener:', error);
    // Send error response back to the client
    if (event.ports && event.ports[0]) {
      try {
        event.ports[0].postMessage({ success: false, error: error.message });
      } catch (err) {
        console.warn('Could not post error message to port:', err);
      }
    }
  }
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});