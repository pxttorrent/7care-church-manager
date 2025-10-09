// Service Worker for 7care PWA - v26 com Offline Total Garantido
const CACHE_NAME = '7care-v26-offline-total';
const API_CACHE_NAME = '7care-api-v26';

// URLs essenciais para cache inicial
const ESSENTIAL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/favicon.ico',
  '/7care-logo.png',
  '/7carelogonew.png'
];

// Rotas da aplicação (SPA)
const APP_ROUTES = [
  '/dashboard',
  '/menu',
  '/calendar',
  '/users',
  '/tasks',
  '/interested',
  '/my-interested',
  '/chat',
  '/settings',
  '/gamification',
  '/prayers',
  '/push-notifications',
  '/notifications',
  '/contact',
  '/meu-cadastro',
  '/elections',
  '/election-config',
  '/election-voting',
  '/election-dashboard',
  '/election-manage',
  '/first-access',
  '/login'
];

// Install event - Cache inicial completo
self.addEventListener('install', (event) => {
  console.log('🔄 SW v26: Instalando Service Worker...', CACHE_NAME);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('💾 SW v26: Cacheando recursos essenciais...');
        
        // Cachear recursos essenciais
        try {
          await cache.addAll(ESSENTIAL_URLS.map(url => new Request(url, { cache: 'reload' })));
          console.log('✅ SW v26: Recursos essenciais cacheados');
          
          // Buscar e cachear assets dinamicamente do index.html
          const indexResponse = await cache.match('/index.html');
          if (indexResponse) {
            const html = await indexResponse.text();
            
            // Extrair todos os assets (JS, CSS) do HTML
            const jsMatches = html.match(/src="([^"]+\.js)"/g) || [];
            const cssMatches = html.match(/href="([^"]+\.css)"/g) || [];
            
            const assetUrls = [
              ...jsMatches.map(m => m.match(/src="([^"]+)"/)?.[1]).filter(Boolean),
              ...cssMatches.map(m => m.match(/href="([^"]+)"/)?.[1]).filter(Boolean)
            ];
            
            console.log(`📦 SW v26: Encontrados ${assetUrls.length} assets para cachear`);
            
            // Cachear assets em paralelo
            await Promise.allSettled(
              assetUrls.map(url => 
                fetch(url)
                  .then(response => {
                    if (response.ok) {
                      cache.put(url, response);
                      console.log(`✅ Cached asset: ${url}`);
                    }
                  })
                  .catch(err => console.warn(`⚠️ Falha ao cachear ${url}:`, err))
              )
            );
          }
          
          console.log('✅ SW v26: Cache inicial completo - App pronto para offline');
        } catch (err) {
          console.warn('⚠️ SW v26: Erro no cache inicial:', err);
        }
      })
  );
  
  self.skipWaiting();
});

// Activate event - Limpar caches antigos e ativar
self.addEventListener('activate', (event) => {
  console.log('🚀 SW v26: Ativando Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('🗑️ SW v26: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar controle imediatamente de todas as páginas
      self.clients.claim()
    ]).then(() => {
      console.log('✅ SW v26: Service Worker ativado e controlando todas as páginas');
      console.log('🎉 SW v26: Aplicação pronta para funcionar offline!');
    })
  );
});

// Fetch event - Estratégia inteligente de cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorar requisições de outros domínios
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Detectar tipo de recurso
  const isNavigate = event.request.mode === 'navigate';
  const isAPI = url.pathname.startsWith('/api/');
  const isAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico|webp)$/i);
  const isGET = event.request.method === 'GET';

  event.respondWith(
    (async () => {
      // ========== NAVEGAÇÃO (Rotas SPA) ==========
      if (isNavigate) {
        try {
          // Tentar buscar da rede primeiro
          const networkResponse = await fetch(event.request);
          
          if (networkResponse && networkResponse.ok) {
            // Cachear a resposta
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
            cache.put(url.pathname, networkResponse.clone());
            console.log(`📝 SW v26: Cached (navigate): ${url.pathname}`);
          }
          
          return networkResponse;
        } catch (error) {
          // Offline - SEMPRE retornar index.html para SPA
          console.log('📡 SW v26: OFFLINE - Modo SPA para:', url.pathname);
          
          // Para SPA, SEMPRE retornar index.html do cache
          // O React Router cuidará da navegação interna
          const indexResponse = await caches.match('/index.html');
          if (indexResponse) {
            console.log(`✅ SW v26: Servindo index.html para: ${url.pathname}`);
            return indexResponse;
          }
          
          // Fallback alternativo
          const rootResponse = await caches.match('/');
          if (rootResponse) {
            console.log(`✅ SW v26: Servindo / para: ${url.pathname}`);
            return rootResponse;
          }
          
          // Se realmente não tiver nada em cache
          console.error(`❌ SW v26: Sem index.html em cache!`);
          return new Response(
            '<!DOCTYPE html><html><body><h1>Offline</h1><p>O aplicativo está offline. Por favor, conecte-se à internet.</p></body></html>',
            {
              status: 200,
              statusText: 'OK',
              headers: { 'Content-Type': 'text/html' }
            }
          );
        }
      }

      // ========== API (Network First com Cache Fallback) ==========
      if (isAPI && isGET) {
        try {
          const networkResponse = await fetch(event.request.clone());
          
          if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(API_CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
            console.log(`💾 SW v26: API cached: ${url.pathname}`);
          }
          
          return networkResponse;
        } catch (error) {
          console.log('📡 SW v26: API OFFLINE - Buscando do cache:', url.pathname);
          
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            console.log(`✅ SW v26: API do cache: ${url.pathname}`);
            return cachedResponse;
          }
          
          // Retornar array vazio para não quebrar a UI
          console.warn(`⚠️ SW v26: API sem cache: ${url.pathname}`);
          return new Response(
            JSON.stringify([]), 
            { 
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      }

      // ========== ASSETS (Cache First com Auto-Cache) ==========
      if (isAsset && isGET) {
        // Tentar do cache primeiro
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          console.log(`⚡ Cache hit (asset): ${url.pathname}`);
          return cachedResponse;
        }
        
        try {
          // Buscar da rede e cachear automaticamente
          const networkResponse = await fetch(event.request);
          
          if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
            console.log(`📦 SW v26: Asset cached: ${url.pathname}`);
          }
          
          return networkResponse;
        } catch (error) {
          console.error(`❌ SW v26: Asset não disponível offline: ${url.pathname}`);
          
          // Para imagens, retornar placeholder
          if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
            return new Response('', { 
              status: 404,
              statusText: 'Image not available offline'
            });
          }
          
          return new Response('', { status: 503 });
        }
      }

      // ========== OUTROS (Network First) ==========
      try {
        const networkResponse = await fetch(event.request);
        
        if (networkResponse && networkResponse.ok && isGET) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
          console.log(`📦 SW v26: Cached (other): ${url.pathname}`);
        }
        
        return networkResponse;
      } catch (error) {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          console.log(`✅ Cache hit (other): ${url.pathname}`);
          return cachedResponse;
        }
        
        return new Response('Offline', { status: 503 });
      }
    })()
  );
});

// Push event - VERSÃO COM HISTÓRICO
self.addEventListener('push', (event) => {
  console.log('📱 SW v26: Push event recebido');
  
  const extractCleanMessage = (data) => {
    if (!data || data.trim() === '') {
      return 'Nova notificação';
    }
    
    const trimmed = data.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        
        if (parsed.message) {
          return String(parsed.message);
        }
        
        if (parsed.title) {
          return String(parsed.title);
        }
        
        return 'Nova notificação do 7care';
      } catch (e) {
        console.log('⚠️ SW v26: JSON inválido, limpando texto');
        return trimmed.replace(/[{}[\]"]/g, '').substring(0, 200) || 'Nova notificação';
      }
    }
    
    return trimmed.substring(0, 200);
  };
  
  let title = '7care';
  let message = 'Nova notificação';
  let iconUrl = '/pwa-192x192.png';
  let audioData = null;
  let hasAudio = false;
  let imageData = null;
  let hasImage = false;
  let notificationType = 'general';
  
  try {
    if (event.data) {
      const rawText = event.data.text();
      console.log('📦 SW v26: Raw text recebido (primeiros 150 chars):', rawText.substring(0, 150));
      
      let parsed = null;
      let isJSON = false;
      
      try {
        parsed = JSON.parse(rawText);
        isJSON = true;
        console.log('✅ SW v26: JSON parseado com sucesso');
      } catch (e) {
        console.log('ℹ️ SW v26: Não é JSON, usando texto simples');
      }
      
      if (isJSON && parsed) {
        title = parsed.title || '7care';
        message = parsed.message || 'Nova notificação';
        
        if (parsed.image && typeof parsed.image === 'string' && parsed.image.startsWith('data:image')) {
          iconUrl = parsed.image;
          imageData = parsed.image;
          hasImage = true;
          console.log('📷 SW v26: Imagem detectada e salva');
        }
        
        if (parsed.audio && typeof parsed.audio === 'string' && parsed.audio.startsWith('data:audio')) {
          audioData = parsed.audio;
          hasAudio = true;
          console.log('🎵 SW v26: Áudio detectado e salvo');
        }
        
        if (parsed.type) {
          notificationType = parsed.type;
          console.log('📋 SW v26: Tipo de notificação:', notificationType);
        }
      } else {
        message = extractCleanMessage(rawText);
      }
      
      if (message.includes('{') || message.includes('}')) {
        console.log('⚠️ SW v26: Mensagem ainda tem JSON, limpando...');
        message = extractCleanMessage(message);
      }
      
      console.log('✅ SW v26: Dados finais:', {
        title: title,
        message: message.substring(0, 100),
        hasAudio: hasAudio,
        hasImage: iconUrl !== '/pwa-192x192.png'
      });
    }
  } catch (err) {
    console.error('❌ SW v26: Erro ao processar:', err);
    message = 'Nova notificação do 7care';
  }
  
  const notificationOptions = {
    body: message,
    icon: iconUrl,
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    tag: '7care-notification',
    requireInteraction: hasAudio,
    silent: false,
    renotify: true,
    data: {
      audio: audioData,
      hasAudio: hasAudio
    }
  };
  
  if (hasAudio) {
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
  
  console.log('📬 SW v26: Salvando notificação no histórico e exibindo');

  event.waitUntil(
    (async () => {
      const notificationData = {
        id: Date.now().toString(),
        title: title,
        message: message,
        type: notificationType || 'general',
        hasAudio: hasAudio,
        hasImage: hasImage,
        audioData: audioData,
        imageData: imageData,
        timestamp: new Date().toISOString(),
        read: false
      };

      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      console.log('👥 SW v26: Clientes encontrados:', clients.length);
      
      clients.forEach(client => {
        client.postMessage({
          type: 'SAVE_NOTIFICATION',
          notification: notificationData
        });
        console.log('✅ SW v26: Mensagem enviada para cliente');
      });

      await self.registration.showNotification(title, notificationOptions);
    })()
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ SW v26: Notificação clicada:', event.action);
  
  event.notification.close();
  
  try {
    const notificationData = event.notification.data || {};
    const hasAudio = notificationData.hasAudio && notificationData.audio;
    const hasImage = notificationData.hasImage && notificationData.image;
    
    if (event.action === 'close') {
      return;
    }
    
    if (hasAudio || hasImage) {
      console.log('📱 SW v26: Abrindo página de notificações (tem mídia)');
      
      event.waitUntil(
        (async () => {
          try {
            const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
            let client = clientList.find(c => c.url.includes(self.location.origin));
            
            if (!client) {
              console.log('📱 SW v26: Abrindo nova janela em /notifications');
              await clients.openWindow('/notifications');
            } else {
              console.log('📱 SW v26: Focando janela existente e navegando para /notifications');
              await client.focus();
              client.postMessage({
                type: 'NAVIGATE',
                url: '/notifications'
              });
            }
          } catch (err) {
            console.error('❌ SW v26: Erro ao abrir página de notificações:', err);
          }
        })()
      );
      
      return;
    }
    
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
        .catch(err => console.error('❌ SW v26: Erro ao abrir janela:', err))
    );
  } catch (error) {
    console.error('❌ SW v26: Erro no clique:', error);
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  console.log('🔄 SW v26: Background sync triggered');
  return Promise.resolve();
}

// Message event listener
self.addEventListener('message', (event) => {
  try {
    const respond = (data) => {
      if (event.ports && event.ports[0]) {
        try {
          event.ports[0].postMessage(data);
        } catch (err) {
          console.warn('⚠️ SW v26: Could not post message to port:', err);
        }
      }
    };

    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
      respond({ success: true });
    } else if (event.data && event.data.type === 'CACHE_URLS') {
      // Mensagem para cachear URLs específicas
      const urls = event.data.urls || [];
      caches.open(CACHE_NAME).then(cache => {
        return Promise.all(
          urls.map(url => fetch(url).then(response => cache.put(url, response)))
        );
      }).then(() => {
        respond({ success: true, cached: urls.length });
      });
    } else {
      respond({ success: true, message: 'Message received' });
    }
  } catch (error) {
    console.error('❌ SW v26: Error in message listener:', error);
    if (event.ports && event.ports[0]) {
      try {
        event.ports[0].postMessage({ success: false, error: error.message });
      } catch (err) {
        console.warn('⚠️ SW v26: Could not post error message to port:', err);
      }
    }
  }
});

console.log('✅ SW v26: Service Worker carregado - Auto-Cache Completo ativo');
