// Service Worker for 7care PWA
const CACHE_NAME = '7care-v8-clean-notifications';
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

// Push event
self.addEventListener('push', (event) => {
  console.log('📱 SW: Push event recebido - Versão v8');
  
  // Parsing SUPER DEFENSIVO do payload
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
        // Se não é JSON, usar o texto como mensagem
        payload = { message: rawText };
      }
    }
  } catch (err) {
    console.error('❌ SW: Erro ao processar payload:', err);
    payload = { message: 'Nova notificação' };
  }

  // Extrair dados LIMPOS - NUNCA mostrar JSON
  const title = payload.title || '7care';
  let message = payload.message || 'Nova notificação';
  
  // PROTEÇÃO: Se a mensagem ainda contém JSON, extrair apenas texto
  if (message.includes('{') && message.includes('}')) {
    console.warn('⚠️ SW: Mensagem contém JSON, extraindo texto puro');
    // Tentar extrair apenas o texto da mensagem
    const messageMatch = message.match(/"message":"([^"]+)"/);
    if (messageMatch) {
      message = messageMatch[1];
    } else {
      // Se não conseguir extrair, usar mensagem padrão
      message = 'Nova notificação do 7care';
    }
  }
  
  // Limitar tamanho da mensagem
  const cleanMessage = message.length > 150 
    ? message.substring(0, 150) + '...' 
    : message;
  
  // Preparar ícone da notificação
  let notificationIcon = '/pwa-192x192.png';
  
  // Se houver imagem em base64 E for pequena o suficiente, usar como ícone
  if (payload.image && typeof payload.image === 'string' && payload.image.length < 100000) {
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

  console.log('📬 SW: Mostrando notificação LIMPA:', { 
    title, 
    message: cleanMessage,
    bodyLength: cleanMessage.length,
    type: payload.type
  });

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