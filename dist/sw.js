// Service Worker for 7care PWA
const CACHE_NAME = '7care-v9-definitive-fix';
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

// Push event - SOLUÇÃO DEFINITIVA v9
self.addEventListener('push', (event) => {
  console.log('📱 SW: Push event recebido - Versão v9 DEFINITIVA');
  
  // Parsing do payload limpo do backend
  let payload = {};
  let rawText = '';
  
  try {
    if (event.data) {
      rawText = event.data.text();
      console.log('📦 SW: Raw text recebido (primeiros 100 chars):', rawText.substring(0, 100));
      
      // Tentar parsear como JSON
      try {
        payload = JSON.parse(rawText);
        console.log('✅ SW: Payload parseado:', {
          title: payload.title,
          message: payload.message,
          type: payload.type,
          hasMetadata: !!payload.metadata
        });
      } catch (parseError) {
        console.warn('⚠️ SW: Não é JSON, usando texto puro');
        payload = { message: rawText };
      }
    }
  } catch (err) {
    console.error('❌ SW: Erro ao processar payload:', err);
    payload = { message: 'Nova notificação' };
  }

  // EXTRAIR DADOS LIMPOS - NUNCA mostrar JSON ou metadados
  const title = payload.title || '7care';
  const message = payload.message || 'Nova notificação';
  const type = payload.type || 'general';
  const metadata = payload.metadata || {};
  
  // LIMPAR MENSAGEM - Remover qualquer JSON que possa ter vazado
  let cleanMessage = message;
  
  // Se a mensagem contém JSON, extrair apenas o texto
  if (cleanMessage.includes('{') && cleanMessage.includes('}')) {
    console.warn('⚠️ SW: Mensagem contém JSON, extraindo texto puro');
    const messageMatch = cleanMessage.match(/"message":"([^"]+)"/);
    if (messageMatch) {
      cleanMessage = messageMatch[1];
    } else {
      cleanMessage = 'Nova notificação do 7care';
    }
  }
  
  // Limitar tamanho da mensagem
  cleanMessage = cleanMessage.length > 150 
    ? cleanMessage.substring(0, 150) + '...' 
    : cleanMessage;
  
  // Preparar ícone da notificação
  let notificationIcon = '/pwa-192x192.png';
  if (metadata.icon) {
    notificationIcon = metadata.icon;
  }
  
  // Adicionar emoji baseado no tipo
  let typeEmoji = '📢';
  if (type === 'announcement') typeEmoji = '📣';
  else if (type === 'reminder') typeEmoji = '⏰';
  else if (type === 'urgent') typeEmoji = '🚨';
  else if (type === 'general') typeEmoji = '📱';

  // MONTAR NOTIFICAÇÃO LIMPA
  const options = {
    body: `${typeEmoji} ${cleanMessage}`,
    icon: notificationIcon,
    badge: '/pwa-192x192.png',
    tag: type,
    vibrate: [200, 100, 200],
    requireInteraction: type === 'urgent',
    data: {
      url: '/',
      hasImage: metadata.hasImage || false,
      hasAudio: metadata.hasAudio || false,
      receivedAt: Date.now()
    },
    actions: [
      { action: 'open', title: 'Abrir', icon: '/pwa-192x192.png' },
      { action: 'close', title: 'Fechar', icon: '/pwa-192x192.png' }
    ]
  };

  console.log('📬 SW: Notificação LIMPA montada:', { 
    title, 
    message: cleanMessage,
    type,
    bodyLength: cleanMessage.length
  });

  // EXIBIR NOTIFICAÇÃO LIMPA
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