// Service Worker for 7care PWA
const CACHE_NAME = '7care-v15-interactive-audio';
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

// Push event - VERSÃO ÁUDIO INTERATIVO v15
self.addEventListener('push', (event) => {
  console.log('📱 SW v15: Push event recebido');
  
  let notificationData = {
    title: '7care',
    message: 'Nova notificação',
    hasImage: false,
    hasAudio: false,
    image: null,
    audio: null
  };
  
  try {
    if (event.data) {
      const rawText = event.data.text();
      console.log('📦 SW v15: Raw text recebido:', rawText.substring(0, 100));
      
      try {
        // Tentar parsear como JSON
        const parsed = JSON.parse(rawText);
        notificationData = {
          title: parsed.title || '7care',
          message: parsed.message || 'Nova notificação',
          hasImage: !!parsed.image,
          hasAudio: !!parsed.audio,
          image: parsed.image || null,
          audio: parsed.audio || null,
          imageName: parsed.imageName || null,
          audioSize: parsed.audioSize || null
        };
        console.log('✅ SW v15: JSON parseado com sucesso:', {
          hasImage: notificationData.hasImage,
          hasAudio: notificationData.hasAudio,
          imageName: notificationData.imageName,
          audioSize: notificationData.audioSize
        });
      } catch (parseError) {
        // Se não for JSON, usar como texto simples
        notificationData.message = rawText;
        console.log('⚠️ SW v15: Usando como texto simples');
      }
    }
  } catch (err) {
    console.error('❌ SW v15: Erro:', err);
  }
  
  // Preparar opções da notificação
  const notificationOptions = {
    body: notificationData.message,
    icon: notificationData.image || '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    tag: '7care-notification',
    requireInteraction: notificationData.hasAudio, // Manter aberta se tiver áudio
    silent: false,
    renotify: true,
    data: {
      audio: notificationData.audio,
      hasAudio: notificationData.hasAudio,
      image: notificationData.image,
      hasImage: notificationData.hasImage
    }
  };
  
  // Adicionar ações se tiver áudio
  if (notificationData.hasAudio) {
    notificationOptions.actions = [
      {
        action: 'play-audio',
        title: '🎵 Tocar Áudio',
        icon: '/pwa-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/pwa-192x192.png'
      }
    ];
  }
  
  console.log('📬 SW v15: Exibindo notificação interativa:', {
    title: notificationData.title,
    hasAudio: notificationData.hasAudio,
    hasImage: notificationData.hasImage,
    requireInteraction: notificationOptions.requireInteraction
  });

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationOptions)
  );
});

// Notification click event - COM SUPORTE A ÁUDIO v15
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ SW v15: Notificação clicada:', event.action);
  
  try {
    const notificationData = event.notification.data || {};
    
    // Se clicou no botão de tocar áudio
    if (event.action === 'play-audio' && notificationData.audio) {
      console.log('🎵 SW v15: Tocando áudio...');
      
      event.waitUntil(
        (async () => {
          try {
            // Buscar ou abrir janela do cliente
            const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
            let client = clientList.find(c => c.url.includes(self.location.origin));
            
            if (!client) {
              client = await clients.openWindow('/');
            } else {
              await client.focus();
            }
            
            // Enviar mensagem para tocar o áudio
            if (client) {
              client.postMessage({
                type: 'PLAY_AUDIO',
                audio: notificationData.audio
              });
              console.log('✅ SW v15: Mensagem enviada para tocar áudio');
            }
          } catch (err) {
            console.error('❌ SW v15: Erro ao tocar áudio:', err);
          }
        })()
      );
      
      return; // Não fechar a notificação ainda
    }
    
    // Se clicou em fechar
    if (event.action === 'close') {
      event.notification.close();
      return;
    }
    
    // Ação padrão - abrir aplicação
    event.notification.close();
    const targetUrl = notificationData.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(targetUrl);
          }
        })
        .catch(err => console.error('❌ SW v15: Erro ao abrir janela:', err))
    );
  } catch (error) {
    console.error('❌ SW v15: Erro no clique:', error);
    event.notification.close();
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