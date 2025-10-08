// Service Worker for 7care PWA
const CACHE_NAME = '7care-v17-ios-audio-fix';
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

// Push event - VERSÃO PARSING PERFEITO v16
self.addEventListener('push', (event) => {
  console.log('📱 SW v16: Push event recebido');
  
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
          console.log('📷 SW v16: Imagem detectada');
        }
        
        // Verificar se tem áudio
        if (parsed.audio && typeof parsed.audio === 'string' && parsed.audio.startsWith('data:audio')) {
          audioData = parsed.audio;
          hasAudio = true;
          console.log('🎵 SW v16: Áudio detectado');
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
  
  console.log('📬 SW v16: Exibindo notificação com parsing perfeito');

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
  );
});

// Notification click event - COM SUPORTE A ÁUDIO iOS v17
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ SW v17: Notificação clicada:', event.action);
  
  event.notification.close();
  
  try {
    const notificationData = event.notification.data || {};
    const hasAudio = notificationData.hasAudio && notificationData.audio;
    
    // Se clicou em fechar
    if (event.action === 'close') {
      return;
    }
    
    // Se tem áudio (clicou no botão OU na notificação diretamente no iOS)
    if (hasAudio && (event.action === 'play-audio' || !event.action)) {
      console.log('🎵 SW v17: Tocando áudio (action:', event.action || 'default', ')');
      
      event.waitUntil(
        (async () => {
          try {
            // Buscar ou abrir janela do cliente
            const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
            let client = clientList.find(c => c.url.includes(self.location.origin));
            
            if (!client) {
              console.log('📱 SW v17: Abrindo nova janela...');
              client = await clients.openWindow('/');
              // Aguardar um pouco para a janela carregar
              await new Promise(resolve => setTimeout(resolve, 500));
            } else {
              console.log('📱 SW v17: Focando janela existente...');
              await client.focus();
            }
            
            // Enviar mensagem para tocar o áudio com Media Session
            if (client) {
              console.log('📤 SW v17: Enviando mensagem PLAY_AUDIO...');
              client.postMessage({
                type: 'PLAY_AUDIO',
                audio: notificationData.audio,
                title: event.notification.title || '7care - Áudio',
                timestamp: Date.now() // Para forçar trigger no iOS
              });
              console.log('✅ SW v17: Mensagem PLAY_AUDIO enviada!');
            } else {
              console.error('❌ SW v17: Cliente não encontrado após abrir/focar');
            }
          } catch (err) {
            console.error('❌ SW v17: Erro ao tocar áudio:', err);
          }
        })()
      );
      
      return;
    }
    
    // Ação padrão - apenas abrir aplicação (sem áudio)
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
        .catch(err => console.error('❌ SW v17: Erro ao abrir janela:', err))
    );
  } catch (error) {
    console.error('❌ SW v17: Erro no clique:', error);
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