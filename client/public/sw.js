// Service Worker para notificações push
const CACHE_NAME = '7care-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Cache aberto');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('❌ Service Worker: Erro ao cachear assets:', error);
      })
  );
  // Força ativação imediata
  self.skipWaiting();
});

// Ativar service worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Ativando...');
  event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
    })
  );
  // Toma controle imediato
  self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  // Para PWA, não cachear requests de API
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna do cache se disponível
        if (response) {
          return response;
        }
        
        // Senão, faz a requisição
        return fetch(event.request)
          .then((fetchResponse) => {
            // Verifica se a resposta é válida
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }

            // Clona a resposta para cache
            const responseToCache = fetchResponse.clone();

            // Adiciona ao cache para uso futuro
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return fetchResponse;
          })
          .catch((error) => {
            console.error('❌ Service Worker: Erro na requisição:', error);
            
            // Retorna uma resposta de erro personalizada para páginas
            if (event.request.destination === 'document') {
              return new Response(
                `<!DOCTYPE html>
                <html>
                  <head>
                    <title>Erro de Conexão - 7care</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                  </head>
                  <body>
                    <h1>Sem conexão</h1>
                    <p>Verifique sua internet e tente novamente.</p>
                    <button onclick="window.location.reload()">Tentar Novamente</button>
                  </body>
                </html>`,
                {
                  status: 200,
                  statusText: 'OK',
                  headers: { 'Content-Type': 'text/html' }
                }
              );
            }
            
            // Para outros recursos, re-lança o erro
            throw error;
          });
      })
      .catch((error) => {
        console.error('❌ Service Worker: Erro geral na requisição:', error);
        // Retorna erro para não quebrar a aplicação
        return new Response('Erro de rede', { status: 408 });
      })
  );
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('📱 Service Worker: Push notification recebida');
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: '7care', body: event.data.text() };
    }
  }
  
  const options = {
    title: data.title || '7care',
    body: data.message || data.body || 'Nova notificação',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: data.type || 'general',
    data: data,
    requireInteraction: data.type === 'urgent',
    actions: [
      {
        action: 'open',
        title: 'Abrir App',
        icon: '/pwa-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Click em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Service Worker: Notificação clicada');
  
  event.notification.close();
    
    if (event.action === 'close') {
      return;
    }
    
  // Abrir o app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
        // Se já há uma janela aberta, focar nela
        for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
        // Senão, abrir nova janela
          if (clients.openWindow) {
          return clients.openWindow('/dashboard');
          }
        })
    );
});

// Background sync (se suportado)
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aqui você pode implementar sincronização em background
      Promise.resolve()
    );
  }
});

// Message handling
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker: Mensagem recebida:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
  }
});

console.log('🚀 Service Worker: Carregado e pronto!');
