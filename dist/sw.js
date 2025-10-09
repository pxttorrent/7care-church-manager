// Service Worker for 7care PWA - v23 com API Cache
const CACHE_NAME = '7care-v23-api-cache';
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

// Fetch event - com cache dinâmico e API cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Não responder a requisições externas
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Detectar tipo de requisição
  const isAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/i);
  const isAPI = url.pathname.startsWith('/api/');
  const isGET = event.request.method === 'GET';
  
  event.respondWith(
    (async () => {
      // ========== ESTRATÉGIA PARA API GET ==========
      if (isAPI && isGET) {
        try {
          // Network First para API (dados frescos)
          const networkResponse = await fetch(event.request.clone());
          
          // Cachear resposta bem-sucedida
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open('7care-api-cache');
            cache.put(event.request, networkResponse.clone());
          }
          
          return networkResponse;
        } catch (error) {
          // Se offline, buscar do cache
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            console.log('📦 API do cache:', url.pathname);
            return cachedResponse;
          }
          
          // Sem cache disponível - retornar array vazio ao invés de erro
          console.log('⚠️ API offline sem cache:', url.pathname);
          return new Response(
            JSON.stringify([]), 
            { 
              status: 200, // Retorna 200 com array vazio em vez de 503
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      }
      
      // ========== ESTRATÉGIA PARA ASSETS ==========
      if (isAsset) {
        // Cache First para assets (performance)
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        try {
          const networkResponse = await fetch(event.request.clone());
          
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
          }
          
          return networkResponse;
        } catch (error) {
          return new Response('', { status: 503 });
        }
      }
      
      // ========== ESTRATÉGIA PARA NAVEGAÇÃO ==========
      try {
        const networkResponse = await fetch(event.request.clone());
        
        // Cachear páginas HTML
        if (networkResponse && networkResponse.status === 200 && event.request.mode === 'navigate') {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // Offline - buscar do cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Fallback para index.html
        if (event.request.mode === 'navigate') {
          const indexCache = await caches.match('/index.html') || await caches.match('/');
          if (indexCache) {
            return indexCache;
          }
        }
        
        return new Response('Offline', { status: 503 });
      }
    })()
  );
});

// Push event - VERSÃO COM HISTÓRICO v18
self.addEventListener('push', (event) => {
  console.log('📱 SW v18: Push event recebido');
  
  // Função auxiliar para extrair mensagem limpa de qualquer formato
  const extractCleanMessage = (data) => {
    // Se for string vazia ou null
    if (!data || data.trim() === '') {
      return 'Nova notificação';
    }
    
    // Se começar com { ou [, tentar parsear JSON
    const trimmed = data.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        
        // Se tem propriedade message, usar ela
        if (parsed.message) {
          return String(parsed.message);
        }
        
        // Se tem propriedade title, usar ela
        if (parsed.title) {
          return String(parsed.title);
        }
        
        // Se é objeto mas não tem message nem title, retornar genérico
        return 'Nova notificação do 7care';
      } catch (e) {
        // Se parsing falhar, limpar e retornar texto
        console.log('⚠️ SW v16: JSON inválido, limpando texto');
        return trimmed.replace(/[{}[\]"]/g, '').substring(0, 200) || 'Nova notificação';
      }
    }
    
    // Se não é JSON, retornar texto limpo
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
      console.log('📦 SW v16: Raw text recebido (primeiros 150 chars):', rawText.substring(0, 150));
      
      // Tentar parsear como JSON primeiro
      let parsed = null;
      let isJSON = false;
      
      try {
        parsed = JSON.parse(rawText);
        isJSON = true;
        console.log('✅ SW v16: JSON parseado com sucesso');
      } catch (e) {
        console.log('ℹ️ SW v16: Não é JSON, usando texto simples');
      }
      
      if (isJSON && parsed) {
        // É JSON válido - extrair dados
        title = parsed.title || '7care';
        message = parsed.message || 'Nova notificação';
        
        // Verificar se tem imagem
        if (parsed.image && typeof parsed.image === 'string' && parsed.image.startsWith('data:image')) {
          iconUrl = parsed.image;
          imageData = parsed.image;
          hasImage = true;
          console.log('📷 SW v18: Imagem detectada e salva');
        }
        
        // Verificar se tem áudio
        if (parsed.audio && typeof parsed.audio === 'string' && parsed.audio.startsWith('data:audio')) {
          audioData = parsed.audio;
          hasAudio = true;
          console.log('🎵 SW v18: Áudio detectado e salvo');
        }
        
        // Verificar tipo de notificação
        if (parsed.type) {
          notificationType = parsed.type;
          console.log('📋 SW v18: Tipo de notificação:', notificationType);
        }
      } else {
        // Não é JSON - usar texto limpo
        message = extractCleanMessage(rawText);
      }
      
      // GARANTIA FINAL: Se message ainda parece JSON, limpar
      if (message.includes('{') || message.includes('}')) {
        console.log('⚠️ SW v16: Mensagem ainda tem JSON, limpando...');
        message = extractCleanMessage(message);
      }
      
      console.log('✅ SW v16: Dados finais:', {
        title: title,
        message: message.substring(0, 100),
        hasAudio: hasAudio,
        hasImage: iconUrl !== '/pwa-192x192.png'
      });
    }
  } catch (err) {
    console.error('❌ SW v16: Erro ao processar:', err);
    message = 'Nova notificação do 7care';
  }
  
  // Preparar opções da notificação
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
  
  // Adicionar ações se tiver áudio
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
  
  console.log('📬 SW v18: Salvando notificação no histórico e exibindo');

  event.waitUntil(
    (async () => {
      // Salvar notificação no histórico (será acessada pela página de notificações)
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

      // Broadcast para clientes abertos (atualizar UI em tempo real)
      console.log('📤 SW v18: Enviando notificação para clientes:', {
        hasAudio: notificationData.hasAudio,
        hasImage: notificationData.hasImage,
        audioDataLength: notificationData.audioData?.length || 0,
        imageDataLength: notificationData.imageData?.length || 0
      });
      
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      console.log('👥 SW v18: Clientes encontrados:', clients.length);
      
      clients.forEach(client => {
        client.postMessage({
          type: 'SAVE_NOTIFICATION',
          notification: notificationData
        });
        console.log('✅ SW v18: Mensagem enviada para cliente');
      });

      // Exibir notificação visual
      await self.registration.showNotification(title, notificationOptions);
    })()
  );
});

// Notification click event - ABRIR HISTÓRICO v18
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ SW v18: Notificação clicada:', event.action);
  
  event.notification.close();
  
  try {
    const notificationData = event.notification.data || {};
    const hasAudio = notificationData.hasAudio && notificationData.audio;
    const hasImage = notificationData.hasImage && notificationData.image;
    
    // Se clicou em fechar
    if (event.action === 'close') {
      return;
    }
    
    // Se tem áudio ou imagem, abrir página de notificações
    if (hasAudio || hasImage) {
      console.log('📱 SW v18: Abrindo página de notificações (tem mídia)');
      
      event.waitUntil(
        (async () => {
          try {
            const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
            let client = clientList.find(c => c.url.includes(self.location.origin));
            
            if (!client) {
              console.log('📱 SW v18: Abrindo nova janela em /notifications');
              await clients.openWindow('/notifications');
            } else {
              console.log('📱 SW v18: Focando janela existente e navegando para /notifications');
              await client.focus();
              client.postMessage({
                type: 'NAVIGATE',
                url: '/notifications'
              });
            }
          } catch (err) {
            console.error('❌ SW v18: Erro ao abrir página de notificações:', err);
          }
        })()
      );
      
      return;
    }
    
    // Ação padrão - abrir aplicação na URL especificada ou home
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
        .catch(err => console.error('❌ SW v18: Erro ao abrir janela:', err))
    );
  } catch (error) {
    console.error('❌ SW v18: Erro no clique:', error);
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