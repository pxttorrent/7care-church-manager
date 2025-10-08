// Service Worker for 7care PWA
const CACHE_NAME = '7care-v7-rich-notifications';
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
  console.log('📱 SW: Push event recebido');
  
  // Parsing do payload
  let payload = {};
  let rawText = '';
  
  try {
    if (event.data) {
      rawText = event.data.text();
      console.log('📦 SW: Raw text recebido (primeiros 100 chars):', rawText.substring(0, 100));
      
      // Tentar parsear como JSON
      try {
        payload = JSON.parse(rawText);
        console.log('✅ SW: Payload parseado como JSON:', {
          hasTitle: !!payload.title,
          hasMessage: !!payload.message,
          hasImage: !!payload.image,
          hasAudio: !!payload.audio,
          type: payload.type
        });
      } catch (parseError) {
        console.warn('⚠️ SW: Não é JSON, usando texto puro');
        payload = { message: rawText };
      }
    }
  } catch (err) {
    console.error('❌ SW: Erro ao processar payload:', err);
  }

  // Extrair dados LIMPOS (sem base64 grande)
  const title = payload.title || '7care';
  const message = payload.message || 'Nova notificação';
  
  // Se a mensagem for muito grande (provavelmente contém base64), limitar
  const cleanMessage = message.length > 200 
    ? message.substring(0, 200) + '...' 
    : message;
  
  // Preparar ícone da notificação
  let notificationIcon = '/pwa-192x192.png';
  
  // Se houver imagem em base64 E for pequena o suficiente, usar como ícone
  // Caso contrário, usar ícone padrão
  if (payload.image && payload.image.length < 100000) { // ~75KB
    notificationIcon = payload.image;
  }
  
  // Adicionar emoji baseado no tipo
  let typeEmoji = '📢';
  if (payload.type === 'announcement') typeEmoji = '📣';
  else if (payload.type === 'reminder') typeEmoji = '⏰';
  else if (payload.type === 'urgent') typeEmoji = '🚨';
  else if (payload.type === 'general') typeEmoji = '📱';

  const options = {
    body: `${typeEmoji} ${cleanMessage}`,
    icon: notificationIcon,
    badge: '/pwa-192x192.png',
    tag: payload.type || 'general',
    vibrate: [200, 100, 200],
    requireInteraction: payload.type === 'urgent',
    data: {
      url: payload.url || '/',
      hasImage: !!payload.image,
      hasAudio: !!payload.audio,
      receivedAt: Date.now()
    },
    actions: [
      { action: 'open', title: 'Abrir', icon: '/pwa-192x192.png' },
      { action: 'close', title: 'Fechar', icon: '/pwa-192x192.png' }
    ]
  };

  console.log('📬 SW: Mostrando notificação:', { title, bodyLength: cleanMessage.length });

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