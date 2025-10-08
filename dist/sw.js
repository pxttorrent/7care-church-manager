// Service Worker for 7care PWA
const CACHE_NAME = '7care-v12-auto-update';
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
  console.log('🔄 SW: Nova versão instalando...', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('💾 SW: Cache criado:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
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

// Push event - VERSÃO DEFINITIVA v12
self.addEventListener('push', (event) => {
  console.log('📱 SW v12: Push event recebido');
  
  let title = '7care';
  let message = 'Nova notificação';
  
  try {
    if (event.data) {
      const rawText = event.data.text();
      console.log('📦 SW v12: Raw text:', rawText.substring(0, 100));
      
      // Tentar parsear JSON
      try {
        const data = JSON.parse(rawText);
        title = data.title || '7care';
        message = data.message || 'Nova notificação';
        console.log('✅ SW v12: Parseado:', { title, message });
      } catch (e) {
        // Se não for JSON, usar texto direto
        message = rawText;
        console.log('⚠️ SW v12: Usando texto direto');
      }
    }
  } catch (err) {
    console.error('❌ SW v12: Erro:', err);
  }

  // PROTEÇÃO MÁXIMA: Limpar qualquer JSON que apareça
  const cleanMessage = (text) => {
    // Se contém JSON, extrair apenas o texto limpo
    if (text.includes('{') && text.includes('}')) {
      try {
        const jsonMatch = text.match(/\{.*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed.message || parsed.title || 'Nova notificação do 7care';
        }
      } catch (e) {
        // Se falhar, usar texto padrão
      }
      return 'Nova notificação do 7care';
    }
    return text;
  };

  message = cleanMessage(message);
  
  console.log('📬 SW v12: Exibindo LIMPO:', { title, message });

  event.waitUntil(
    self.registration.showNotification(title, {
      body: message,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200],
      tag: '7care-notification',
      requireInteraction: false
    })
  );
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